# DMRV SOP Exam Platform

一个轻量级维护管理 SOP 在线答题平台原型，支持中英文切换、题库管理、练习/考试模式、成绩记录和后续 DMRV 平台嵌入。

当前题库由以下 Word 文件导入：

- `/Users/caojiwu/接单/炉子/线上题库/维护管理SOP考核题库(1).docx`
- `/Users/caojiwu/接单/炉子/线上题库/Maintenance_Management_SOP_Question_Bank.docx`

## Run

```bash
npm start
```

Default URL:

```text
http://localhost:4173
```

## Import Real Question Bank

```bash
npm run import:questions
```

导入结果会写入 `data/questions.json`。当前两份 Word 正文题头统计为 62 题，其中单选 18 题、多选 44 题；这与 Word 开头说明里的 28/34 不一致，系统按正文题头为准。

## Design Context

- `PRODUCT.md` captures the product register, users, purpose, and design principles.
- `DESIGN.md` captures the visual system, tokens, component vocabulary, and interaction rules.
- The UI was revised after installing and applying the requested frontend/UI skills: `frontend-design`, `web-design-guidelines`, `ui-ux-pro-max`, `vercel-react-best-practices`, `using-superpowers`, and `teach-impeccable`.

## Question Bank Format

The import file can be a JSON array or an object with a `questions` array.

```json
[
  {
    "id": "sop-001",
    "type": "single",
    "category": "Routine Inspection",
    "difficulty": "easy",
    "prompt": {
      "zh": "题干中文",
      "en": "Question prompt in English"
    },
    "options": [
      { "id": "A", "zh": "选项 A", "en": "Option A" },
      { "id": "B", "zh": "选项 B", "en": "Option B" }
    ],
    "answer": ["A"],
    "explanation": {
      "zh": "解析中文",
      "en": "Explanation in English"
    }
  }
]
```

## API

- `GET /api/questions`
- `PUT /api/questions`
- `GET /api/results`
- `POST /api/results`

Results are stored in `data/results.json`. Questions are stored in `data/questions.json`.
