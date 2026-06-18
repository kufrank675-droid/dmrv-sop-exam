const fs = require("fs");
const path = require("path");

function readQuestions() {
  const file = path.join(process.cwd(), "data", "questions.json");
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

module.exports = function handler(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method === "GET") {
    return res.status(200).json({ questions: readQuestions() });
  }

  if (req.method === "PUT") {
    return res.status(200).json({ questions: Array.isArray(req.body?.questions) ? req.body.questions : readQuestions() });
  }

  res.setHeader("Allow", "GET, PUT");
  return res.status(405).json({ error: "Method not allowed" });
};
