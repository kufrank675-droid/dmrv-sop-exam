# DMRV SOP Exam Platform

一个轻量级维护管理 SOP 在线答题平台原型，支持中英文切换、分章节测试、逐题显示答案解析、题目图示和口诀辅助、测试者姓名记录、管理工作台口令、题库导入、成绩汇总、成绩分布统计、成绩 CSV 导出、80% 及格/90% 优秀判定和未达标重考，后续可嵌入 DMRV 平台。

管理工作台演示口令：

```text
DMRV2026
```

当前公开静态版使用浏览器本地存储保存成绩；接入 DMRV 后端后，可把同一套接口切换为集中成绩库。

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
