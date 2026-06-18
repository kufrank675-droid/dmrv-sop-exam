const http = require("http");
const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");

const root = __dirname;
const publicDir = path.join(root, "public");
const dataDir = path.join(root, "data");
const questionsFile = path.join(dataDir, "questions.json");
const resultsFile = path.join(dataDir, "results.json");

const port = Number(process.env.PORT || 4173);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon"
};

async function readJson(filePath, fallback) {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
}

async function writeJson(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2) + "\n");
}

function sendJson(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function collectBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        req.destroy();
        reject(new Error("Request body too large"));
      }
    });
    req.on("end", () => resolve(body ? JSON.parse(body) : {}));
    req.on("error", reject);
  });
}

function normalizeQuestion(question) {
  const id = question.id || crypto.randomUUID();
  return {
    id,
    number: Number(question.number || 0) || undefined,
    type: question.type === "multiple" ? "multiple" : "single",
    category: typeof question.category === "object"
      ? {
          zh: question.category.zh || "",
          en: question.category.en || ""
        }
      : { zh: question.category || "general", en: question.category || "general" },
    difficulty: question.difficulty || "medium",
    prompt: {
      zh: question.prompt?.zh || question.prompt || "",
      en: question.prompt?.en || ""
    },
    options: (question.options || []).map((option, index) => ({
      id: option.id || String.fromCharCode(65 + index),
      zh: option.zh || option.label || "",
      en: option.en || ""
    })),
    answer: Array.isArray(question.answer) ? question.answer : [question.answer].filter(Boolean),
    explanation: {
      zh: question.explanation?.zh || question.explanation || "",
      en: question.explanation?.en || ""
    },
    sopLocation: typeof question.sopLocation === "object"
      ? {
          zh: question.sopLocation.zh || "",
          en: question.sopLocation.en || ""
        }
      : { zh: question.sopLocation || "", en: question.sopLocation || "" },
    source: question.source || undefined
  };
}

function normalizeMode(mode) {
  return ["practice", "exam", "review"].includes(mode) ? mode : "exam";
}

function grade(questions, answers, questionIds) {
  const byId = new Map(questions.map((question) => [question.id, question]));
  const ids = Array.isArray(questionIds) && questionIds.length ? questionIds : Object.keys(answers || {});
  const details = ids.map((questionId) => {
    const question = byId.get(questionId);
    const selected = answers?.[questionId] || [];
    const selectedAnswers = Array.isArray(selected) ? selected : [selected].filter(Boolean);
    const correctAnswers = question?.answer || [];
    const selectedKey = [...selectedAnswers].sort().join("|");
    const correctKey = [...correctAnswers].sort().join("|");
    return {
      questionId,
      selected: selectedAnswers,
      correct: correctAnswers,
      isCorrect: Boolean(question) && selectedKey === correctKey
    };
  });
  const correctCount = details.filter((item) => item.isCorrect).length;
  const total = details.length;
  return {
    total,
    correct: correctCount,
    score: total ? Math.round((correctCount / total) * 100) : 0,
    details
  };
}

async function handleApi(req, res, url) {
  if (url.pathname === "/api/questions" && req.method === "GET") {
    const questions = await readJson(questionsFile, []);
    return sendJson(res, 200, { questions });
  }

  if (url.pathname === "/api/questions" && req.method === "PUT") {
    const body = await collectBody(req);
    if (!Array.isArray(body.questions)) {
      return sendJson(res, 400, { error: "questions must be an array" });
    }
    const questions = body.questions.map(normalizeQuestion);
    await writeJson(questionsFile, questions);
    return sendJson(res, 200, { questions });
  }

  if (url.pathname === "/api/results" && req.method === "GET") {
    const results = await readJson(resultsFile, []);
    return sendJson(res, 200, { results: results.slice(-50).reverse() });
  }

  if (url.pathname === "/api/results" && req.method === "POST") {
    const body = await collectBody(req);
    const questions = await readJson(questionsFile, []);
    const result = {
      id: crypto.randomUUID(),
      name: String(body.name || "Guest").trim().slice(0, 80),
      mode: normalizeMode(body.mode),
      submittedAt: new Date().toISOString(),
      durationSeconds: Number(body.durationSeconds || 0),
      ...grade(questions, body.answers, body.questionIds)
    };
    const results = await readJson(resultsFile, []);
    results.push(result);
    await writeJson(resultsFile, results.slice(-500));
    return sendJson(res, 201, { result });
  }

  return sendJson(res, 404, { error: "Not found" });
}

async function serveStatic(req, res, url) {
  const requested = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
  const safePath = path.normalize(requested).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(publicDir, safePath);
  if (!filePath.startsWith(publicDir)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  try {
    const data = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
    return res.end(data);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    const index = await fs.readFile(path.join(publicDir, "index.html"));
    res.writeHead(200, { "Content-Type": mimeTypes[".html"] });
    return res.end(index);
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname.startsWith("/api/")) {
      await handleApi(req, res, url);
    } else {
      await serveStatic(req, res, url);
    }
  } catch (error) {
    console.error(error);
    sendJson(res, 500, { error: "Internal server error" });
  }
});

server.listen(port, () => {
  console.log(`DMRV SOP exam app running at http://localhost:${port}`);
});
