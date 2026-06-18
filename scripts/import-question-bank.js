const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const sourceDir = process.argv[2] || "/Users/caojiwu/接单/炉子/线上题库";
const zhDocx = path.join(sourceDir, "维护管理SOP考核题库(1).docx");
const enDocx = path.join(sourceDir, "Maintenance_Management_SOP_Question_Bank.docx");
const outputFile = path.join(root, "data", "questions.json");

function docxToMarkdown(filePath) {
  return execFileSync("pandoc", ["--track-changes=all", filePath, "-t", "markdown"], {
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 16
  }).replace(/\r\n/g, "\n");
}

function normalizeText(text) {
  return String(text || "")
    .replace(/\\<=/g, "<=")
    .replace(/\\>=/g, ">=")
    .replace(/\\'/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function cleanInline(text) {
  return normalizeText(text)
    .replace(/^\*\*/, "")
    .replace(/\*\*$/, "")
    .trim();
}

function parseQuestionHeader(text, lang) {
  const cleaned = cleanInline(text).replace(/\s+/g, " ");
  const zhMatch = cleaned.match(/^(\d+)\.（(单选|多选)）(.+)$/);
  if (zhMatch) {
    return {
      number: Number(zhMatch[1]),
      type: zhMatch[2] === "多选" ? "multiple" : "single",
      prompt: zhMatch[3].trim()
    };
  }

  const enMatch = cleaned.match(/^(\d+)\.\s*\((Single choice|Multiple choice)\)\s*(.+)$/i);
  if (enMatch) {
    return {
      number: Number(enMatch[1]),
      type: /multiple/i.test(enMatch[2]) ? "multiple" : "single",
      prompt: enMatch[3].trim()
    };
  }

  throw new Error(`Cannot parse ${lang} question header: ${text}`);
}

function isQuestionStart(line) {
  return /^\*\*\d+\./.test(line.trim());
}

function splitQuestionBlocks(markdown) {
  const lines = markdown.split("\n");
  const blocks = [];
  let currentSection = "";
  let block = null;

  for (const line of lines) {
    if (/^#\s+8\.\d/.test(line.trim())) {
      currentSection = line.replace(/^#+\s*/, "").trim();
      continue;
    }

    if (isQuestionStart(line)) {
      if (block) blocks.push(block);
      block = { section: currentSection, lines: [line] };
      continue;
    }

    if (block) block.lines.push(line);
  }

  if (block) blocks.push(block);
  return blocks;
}

function parseOptions(text) {
  const optionRegex = /^([A-D])\.\s*([\s\S]*?)(?=^[A-D]\.\s*|\*\*(?:参考答案|Reference Answer)[:：])/gm;
  const options = [];
  let match;
  while ((match = optionRegex.exec(text))) {
    options.push({ id: match[1], text: normalizeText(match[2]) });
  }
  return options;
}

function extractField(text, patterns) {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return normalizeText(match[1]);
  }
  return "";
}

function inferDifficulty(number, type) {
  if (type === "multiple") return number >= 40 ? "hard" : "medium";
  return number >= 30 ? "medium" : "easy";
}

function parseMarkdown(markdown, lang) {
  return splitQuestionBlocks(markdown).map((block) => {
    const text = block.lines.join("\n").trim();
    const firstOptionIndex = block.lines.findIndex((line) => /^A\.\s*/.test(line.trim()));
    if (firstOptionIndex < 1) throw new Error(`${lang} block missing first option`);
    const header = parseQuestionHeader(block.lines.slice(0, firstOptionIndex).join(" "), lang);
    const options = parseOptions(text);
    const answer = extractField(text, [
      /\*\*参考答案[:：]\s*([A-D]+)\*\*/,
      /\*\*Reference Answer:\s*([A-D]+)\*\*/
    ]).split("").filter(Boolean);
    const explanation = extractField(text, [
      /答案解释[:：]\s*([\s\S]*?)(?=\n\n对应原文SOP位置[:：])/,
      /Answer Explanation:\s*([\s\S]*?)(?=\n\nOriginal SOP Location:)/
    ]);
    const location = extractField(text, [
      /对应原文SOP位置[:：]\s*([\s\S]*)$/,
      /Original SOP Location:\s*([\s\S]*)$/
    ]);

    if (options.length !== 4) {
      throw new Error(`${lang} Q${header.number} expected 4 options, got ${options.length}`);
    }
    if (!answer.length) {
      throw new Error(`${lang} Q${header.number} missing answer`);
    }

    return {
      number: header.number,
      type: header.type,
      section: block.section,
      prompt: header.prompt,
      options,
      answer,
      explanation,
      location,
      difficulty: inferDifficulty(header.number, header.type)
    };
  });
}

function mergeBanks(zhQuestions, enQuestions) {
  if (zhQuestions.length !== enQuestions.length) {
    throw new Error(`Question count mismatch: zh=${zhQuestions.length}, en=${enQuestions.length}`);
  }

  const enByNumber = new Map(enQuestions.map((question) => [question.number, question]));

  return zhQuestions.map((zh) => {
    const en = enByNumber.get(zh.number);
    if (!en) throw new Error(`Missing EN question ${zh.number}`);
    if (zh.type !== en.type) throw new Error(`Type mismatch on question ${zh.number}`);
    if (zh.answer.join("") !== en.answer.join("")) throw new Error(`Answer mismatch on question ${zh.number}`);

    return {
      id: `sop-${String(zh.number).padStart(3, "0")}`,
      number: zh.number,
      type: zh.type,
      category: {
        zh: zh.section,
        en: en.section
      },
      difficulty: zh.difficulty,
      prompt: {
        zh: zh.prompt,
        en: en.prompt
      },
      options: zh.options.map((zhOption, index) => {
        const enOption = en.options[index];
        if (zhOption.id !== enOption.id) throw new Error(`Option mismatch on question ${zh.number}`);
        return {
          id: zhOption.id,
          zh: zhOption.text,
          en: enOption.text
        };
      }),
      answer: zh.answer,
      explanation: {
        zh: zh.explanation,
        en: en.explanation
      },
      sopLocation: {
        zh: zh.location,
        en: en.location
      },
      source: {
        zh: path.basename(zhDocx),
        en: path.basename(enDocx)
      }
    };
  });
}

function main() {
  if (!fs.existsSync(zhDocx) || !fs.existsSync(enDocx)) {
    throw new Error(`Missing source docx files in ${sourceDir}`);
  }

  const zhQuestions = parseMarkdown(docxToMarkdown(zhDocx), "zh");
  const enQuestions = parseMarkdown(docxToMarkdown(enDocx), "en");
  const questions = mergeBanks(zhQuestions, enQuestions);

  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, `${JSON.stringify(questions, null, 2)}\n`);

  const single = questions.filter((question) => question.type === "single").length;
  const multiple = questions.filter((question) => question.type === "multiple").length;
  console.log(`Imported ${questions.length} questions (${single} single, ${multiple} multiple)`);
  console.log(`Source: ${sourceDir}`);
  console.log(`Output: ${outputFile}`);
}

main();
