const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

function readQuestions() {
  const file = path.join(process.cwd(), "data", "questions.json");
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function normalizeBody(body) {
  if (!body) return {};
  if (typeof body === "string") {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }
  return body;
}

function grade(questions, answers) {
  const byId = new Map(questions.map((question) => [question.id, question]));
  const details = Object.entries(answers || {}).map(([questionId, selected]) => {
    const question = byId.get(questionId);
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
  const correct = details.filter((item) => item.isCorrect).length;
  const total = details.length;
  return {
    total,
    correct,
    score: total ? Math.round((correct / total) * 100) : 0,
    details
  };
}

module.exports = function handler(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method === "GET") {
    return res.status(200).json({ results: [] });
  }

  if (req.method === "POST") {
    const body = normalizeBody(req.body);
    const questions = readQuestions();
    const result = {
      id: crypto.randomUUID(),
      name: String(body.name || "Guest").trim().slice(0, 80),
      mode: body.mode === "practice" ? "practice" : "exam",
      submittedAt: new Date().toISOString(),
      durationSeconds: Number(body.durationSeconds || 0),
      ...grade(questions, body.answers)
    };
    return res.status(201).json({ result });
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Method not allowed" });
};
