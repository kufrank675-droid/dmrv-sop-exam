const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(path.join(dist, "data"), { recursive: true });

for (const file of fs.readdirSync(path.join(root, "public"))) {
  fs.cpSync(path.join(root, "public", file), path.join(dist, file), { recursive: true });
}

const questions = JSON.parse(fs.readFileSync(path.join(root, "data", "questions.json"), "utf8"));
fs.writeFileSync(path.join(dist, "data", "questions.json"), JSON.stringify(questions));
fs.writeFileSync(path.join(dist, ".nojekyll"), "");

console.log(`Static site built at ${dist}`);
