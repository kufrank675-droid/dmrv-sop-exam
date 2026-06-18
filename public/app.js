const i18n = {
  zh: {
    brandSubtitle: "在线考核题库",
    navDashboard: "工作台",
    navExam: "模拟考试",
    navBank: "题库管理",
    navResults: "成绩记录",
    platformLabel: "DMRV 平台入口",
    eyebrow: "维护管理 SOP",
    pageTitle: "线上答题平台",
    nameLabel: "姓名",
    heroEyebrow: "可嵌入 DMRV 的答题模块",
    heroTitle: "把维护 SOP 题库转成线上测评、练习和审计记录。",
    heroText: "当前版本支持题库 API、成绩留痕、中英文切换和 JSON 导入，后续可接入 DMRV 单点登录与权限系统。",
    readinessLabel: "题库状态",
    readinessText: "等待首轮成绩",
    sourceTitle: "题库来源",
    sourceHint: "Word 导入记录",
    coverageTitle: "章节覆盖",
    coverageHint: "按 SOP 章节统计",
    metricQuestions: "题目数量",
    metricRecords: "成绩记录",
    metricAvg: "平均得分",
    metricLang: "语言",
    startPractice: "开始练习",
    startExam: "开始考试",
    importBank: "导入题库",
    modePractice: "练习",
    modeExam: "考试",
    modeReview: "错题复盘",
    prev: "上一题",
    next: "下一题",
    submit: "提交",
    bankEyebrow: "题库管理",
    bankTitle: "维护题目、分类和答案",
    saveBank: "保存题库",
    searchLabel: "搜索",
    importLabel: "导入 JSON",
    typeLabel: "题型",
    typeAll: "全部",
    exportBank: "导出",
    exportResults: "导出成绩",
    resultsEyebrow: "审计留痕",
    resultsTitle: "最近成绩记录",
    refresh: "刷新",
    single: "单选",
    multiple: "多选",
    singleShort: "单选",
    multipleShort: "多选",
    answered: "已答",
    pending: "未答",
    question: "题",
    correctAnswer: "正确答案",
    explanation: "解析",
    sopLocation: "SOP位置",
    source: "来源",
    score: "得分",
    accuracy: "正确率",
    submitted: "已提交",
    noQuestions: "暂无题目，请先导入题库。",
    noResults: "暂无成绩记录。",
    noExportResults: "暂无成绩可导出。",
    noWrongQuestions: "本次没有错题。",
    saved: "题库已保存。",
    imported: "题库已导入，请点击保存。",
    importInvalid: "导入失败：JSON 必须是数组，或包含 questions 数组。",
    unanswered: "还有题目未作答，仍要提交吗？",
    langName: "中文",
    guest: "访客",
    duration: "用时",
    redo: "重做",
    reviewWrong: "错题复盘",
    wrongCount: "错题"
  },
  en: {
    brandSubtitle: "Online Assessment Bank",
    navDashboard: "Dashboard",
    navExam: "Exam",
    navBank: "Question Bank",
    navResults: "Results",
    platformLabel: "DMRV Platform Entry",
    eyebrow: "Maintenance SOP",
    pageTitle: "Online Assessment Platform",
    nameLabel: "Name",
    heroEyebrow: "Embeddable DMRV assessment module",
    heroTitle: "Turn maintenance SOP questions into online tests, practice, and audit records.",
    heroText: "This version supports question APIs, result traces, Chinese-English switching, and JSON import. It can later connect to DMRV SSO and permissions.",
    readinessLabel: "Bank Status",
    readinessText: "Waiting for first score",
    sourceTitle: "Question Sources",
    sourceHint: "Word import records",
    coverageTitle: "Section Coverage",
    coverageHint: "Grouped by SOP section",
    metricQuestions: "Questions",
    metricRecords: "Records",
    metricAvg: "Average Score",
    metricLang: "Language",
    startPractice: "Start Practice",
    startExam: "Start Exam",
    importBank: "Import Bank",
    modePractice: "Practice",
    modeExam: "Exam",
    modeReview: "Wrong Review",
    prev: "Previous",
    next: "Next",
    submit: "Submit",
    bankEyebrow: "Question Bank",
    bankTitle: "Manage questions, categories, and answers",
    saveBank: "Save Bank",
    searchLabel: "Search",
    importLabel: "Import JSON",
    typeLabel: "Type",
    typeAll: "All",
    exportBank: "Export",
    exportResults: "Export Results",
    resultsEyebrow: "Audit Trail",
    resultsTitle: "Recent Results",
    refresh: "Refresh",
    single: "Single Choice",
    multiple: "Multiple Choice",
    singleShort: "Single",
    multipleShort: "Multiple",
    answered: "Answered",
    pending: "Pending",
    question: "Question",
    correctAnswer: "Correct answer",
    explanation: "Explanation",
    sopLocation: "SOP Location",
    source: "Source",
    score: "Score",
    accuracy: "Accuracy",
    submitted: "Submitted",
    noQuestions: "No questions yet. Import a question bank first.",
    noResults: "No result records yet.",
    noExportResults: "No results to export.",
    noWrongQuestions: "No wrong answers in this result.",
    saved: "Question bank saved.",
    imported: "Question bank imported. Click save to persist it.",
    importInvalid: "Import failed: JSON must be an array or contain a questions array.",
    unanswered: "Some questions are unanswered. Submit anyway?",
    langName: "English",
    guest: "Guest",
    duration: "Duration",
    redo: "Redo",
    reviewWrong: "Review Wrong",
    wrongCount: "Wrong"
  }
};

const state = {
  lang: localStorage.getItem("dmrv-lang") || "zh",
  view: "dashboard",
  mode: "practice",
  questions: [],
  results: [],
  activeQuestions: [],
  currentIndex: 0,
  answers: {},
  startedAt: null,
  timerHandle: null
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function t(key) {
  return i18n[state.lang][key] || i18n.zh[key] || key;
}

function localized(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[state.lang] || value.zh || value.en || "";
}

async function api(path, options = {}) {
  try {
    const response = await fetch(path, {
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      ...options
    });
    if (!response.ok) throw new Error(`Request failed: ${response.status}`);
    return response.json();
  } catch (error) {
    return staticApiFallback(path, options, error);
  }
}

async function staticApiFallback(path, options = {}, originalError) {
  if (path === "/api/questions" && (!options.method || options.method === "GET")) {
    const response = await fetch("data/questions.json");
    if (!response.ok) throw originalError;
    return { questions: await response.json() };
  }

  if (path === "/api/results" && (!options.method || options.method === "GET")) {
    return { results: readLocalResults() };
  }

  if (path === "/api/results" && options.method === "POST") {
    const body = JSON.parse(options.body || "{}");
    const result = buildClientResult(body);
    const results = [result, ...readLocalResults()].slice(0, 50);
    localStorage.setItem("dmrv-results", JSON.stringify(results));
    return { result };
  }

  if (path === "/api/questions" && options.method === "PUT") {
    const body = JSON.parse(options.body || "{}");
    return { questions: Array.isArray(body.questions) ? body.questions : state.questions };
  }

  throw originalError;
}

function readLocalResults() {
  try {
    return JSON.parse(localStorage.getItem("dmrv-results") || "[]");
  } catch {
    return [];
  }
}

function normalizeMode(mode) {
  return ["practice", "exam", "review"].includes(mode) ? mode : "exam";
}

function modeLabel(mode) {
  return mode === "practice" ? t("modePractice") : mode === "review" ? t("modeReview") : t("modeExam");
}

function buildClientResult(body) {
  const details = gradeAnswers(state.questions, body.answers, body.questionIds);
  const correct = details.filter((item) => item.isCorrect).length;
  const total = details.length;
  return {
    id: `local-${Date.now()}`,
    name: String(body.name || "Guest").trim().slice(0, 80),
    mode: normalizeMode(body.mode),
    submittedAt: new Date().toISOString(),
    durationSeconds: Number(body.durationSeconds || 0),
    total,
    correct,
    score: total ? Math.round((correct / total) * 100) : 0,
    details
  };
}

function gradeAnswers(questions, answers, questionIds) {
  const byId = new Map(questions.map((question) => [question.id, question]));
  const ids = Array.isArray(questionIds) && questionIds.length ? questionIds : Object.keys(answers || {});
  return ids.map((questionId) => {
    const question = byId.get(questionId);
    const selected = answers?.[questionId] || [];
    const selectedAnswers = Array.isArray(selected) ? selected : [selected].filter(Boolean);
    const correctAnswers = question?.answer || [];
    return {
      questionId,
      selected: selectedAnswers,
      correct: correctAnswers,
      isCorrect: Boolean(question) && [...selectedAnswers].sort().join("|") === [...correctAnswers].sort().join("|")
    };
  });
}

async function loadData() {
  const [questionPayload, resultPayload] = await Promise.all([
    api("/api/questions"),
    api("/api/results")
  ]);
  state.questions = questionPayload.questions || [];
  state.results = resultPayload.results || [];
  if (!state.activeQuestions.length) startSession("practice", false);
  renderAll();
}

function setLanguage(lang) {
  state.lang = lang;
  localStorage.setItem("dmrv-lang", lang);
  document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  $$(".segment").forEach((button) => button.classList.toggle("is-active", button.dataset.lang === lang));
  $$("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  renderAll();
}

function setView(view) {
  state.view = view;
  $$(".view").forEach((section) => section.classList.remove("is-active"));
  $(`#${view}View`)?.classList.add("is-active");
  $$(".nav-item").forEach((button) => button.classList.toggle("is-active", button.dataset.view === view));
  if (view === "results") refreshResults();
  renderIcons();
}

function setMode(mode) {
  state.mode = mode;
  syncModeTabs();
  startSession(mode, true);
}

function syncModeTabs() {
  $$(".tab").forEach((button) => button.classList.toggle("is-active", button.dataset.mode === state.mode));
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function startSession(mode = state.mode, reset = true) {
  state.mode = mode;
  state.activeQuestions = mode === "exam" ? shuffle(state.questions).slice(0, Math.min(10, state.questions.length)) : [...state.questions];
  if (reset) {
    state.currentIndex = 0;
    state.answers = {};
    state.startedAt = Date.now();
    $("#resultPanel").hidden = true;
    setView("exam");
  } else if (!state.startedAt) {
    state.startedAt = Date.now();
  }
  restartTimer();
  renderQuestion();
  renderStats();
}

function restartTimer() {
  clearInterval(state.timerHandle);
  state.timerHandle = setInterval(renderTimer, 500);
  renderTimer();
}

function elapsedSeconds() {
  return state.startedAt ? Math.floor((Date.now() - state.startedAt) / 1000) : 0;
}

function formatDuration(seconds) {
  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const rest = String(seconds % 60).padStart(2, "0");
  return `${minutes}:${rest}`;
}

function renderTimer() {
  $("#timer").textContent = formatDuration(elapsedSeconds());
}

function renderStats() {
  $("#questionCount").textContent = state.questions.length;
  $("#resultCount").textContent = state.results.length;
  const avg = state.results.length
    ? Math.round(state.results.reduce((sum, result) => sum + Number(result.score || 0), 0) / state.results.length)
    : null;
  $("#avgScore").textContent = avg === null ? "--" : `${avg}%`;
  $("#heroScore").textContent = avg === null ? "--" : `${avg}%`;
  $("#currentLang").textContent = t("langName");
  renderDashboardDetails();
}

function renderDashboardDetails() {
  const sourceList = $("#sourceList");
  const categoryList = $("#categoryList");
  if (!sourceList || !categoryList) return;

  const typeCounts = state.questions.reduce((acc, question) => {
    acc[question.type] = (acc[question.type] || 0) + 1;
    return acc;
  }, {});
  const sources = [...new Set(state.questions.flatMap((question) => {
    if (!question.source) return [];
    if (typeof question.source === "string") return [question.source];
    return [question.source.zh, question.source.en].filter(Boolean);
  }))];
  sourceList.innerHTML = sources.length ? sources.map((source) => `
    <div class="source-row">
      <i data-lucide="file-text"></i>
      <span>${escapeHtml(source)}</span>
    </div>
  `).join("") : `<div class="empty compact">${t("noQuestions")}</div>`;

  const summary = [
    { label: t("singleShort"), value: typeCounts.single || 0 },
    { label: t("multipleShort"), value: typeCounts.multiple || 0 }
  ];

  const categories = [...state.questions.reduce((map, question) => {
    const category = localized(question.category) || "General";
    map.set(category, (map.get(category) || 0) + 1);
    return map;
  }, new Map())].slice(0, 8);

  categoryList.innerHTML = `
    <div class="coverage-summary">
      ${summary.map((item) => `<span><b>${item.value}</b>${item.label}</span>`).join("")}
    </div>
    ${categories.map(([category, count]) => `
      <div class="coverage-row">
        <span>${escapeHtml(category)}</span>
        <b>${count}</b>
      </div>
    `).join("")}
  `;
  renderIcons();
}

function renderQuestion() {
  const area = $("#questionArea");
  const total = state.activeQuestions.length;
  $("#progress").textContent = `${Math.min(state.currentIndex + 1, total)}/${total}`;

  if (!total) {
    area.innerHTML = `<div class="empty">${t("noQuestions")}</div>`;
    $("#questionRail").innerHTML = "";
    return;
  }

  const question = state.activeQuestions[state.currentIndex];
  const selected = state.answers[question.id] || [];
  area.innerHTML = `
    <article class="question-card">
      <div class="question-top">
        <div>
          <p class="eyebrow">${t("question")} ${state.currentIndex + 1}</p>
          <h2>${escapeHtml(localized(question.prompt))}</h2>
        </div>
        <span class="pill">${question.type === "multiple" ? t("multiple") : t("single")}</span>
      </div>
      <div class="options">
        ${question.options.map((option) => `
          <button class="option ${selected.includes(option.id) ? "is-selected" : ""}" data-option="${option.id}">
            <span class="option-key">${option.id}</span>
            <span>${escapeHtml(localized(option))}</span>
          </button>
        `).join("")}
      </div>
    </article>
  `;

  $$(".option").forEach((button) => {
    button.addEventListener("click", () => chooseOption(question, button.dataset.option));
  });
  renderQuestionRail();
  renderIcons();
}

function renderQuestionRail() {
  const rail = $("#questionRail");
  if (!rail) return;
  rail.innerHTML = state.activeQuestions.map((question, index) => {
    const isCurrent = index === state.currentIndex;
    const isAnswered = Boolean(state.answers[question.id]?.length);
    return `
      <button class="rail-dot ${isCurrent ? "is-current" : ""} ${isAnswered ? "is-answered" : ""}" data-index="${index}" aria-label="${t("question")} ${index + 1}, ${isAnswered ? t("answered") : t("pending")}">
        ${index + 1}
      </button>
    `;
  }).join("");

  $$(".rail-dot").forEach((button) => {
    button.addEventListener("click", () => {
      state.currentIndex = Number(button.dataset.index);
      renderQuestion();
    });
  });
}

function chooseOption(question, optionId) {
  const previous = state.answers[question.id] || [];
  if (question.type === "multiple") {
    state.answers[question.id] = previous.includes(optionId)
      ? previous.filter((id) => id !== optionId)
      : [...previous, optionId];
  } else {
    state.answers[question.id] = [optionId];
  }
  renderQuestion();
}

function moveQuestion(direction) {
  const next = state.currentIndex + direction;
  if (next >= 0 && next < state.activeQuestions.length) {
    state.currentIndex = next;
    renderQuestion();
  }
}

async function submitExam() {
  const missing = state.activeQuestions.filter((question) => !state.answers[question.id]?.length);
  if (missing.length && !window.confirm(t("unanswered"))) return;

  const allowedIds = new Set(state.activeQuestions.map((question) => question.id));
  const answers = Object.fromEntries(Object.entries(state.answers).filter(([id]) => allowedIds.has(id)));
  const payload = await api("/api/results", {
    method: "POST",
    body: JSON.stringify({
      name: $("#userName").value || t("guest"),
      mode: state.mode,
      questionIds: state.activeQuestions.map((question) => question.id),
      answers,
      durationSeconds: elapsedSeconds()
    })
  });
  state.results = [payload.result, ...state.results];
  renderResult(payload.result);
  renderStats();
}

function renderResult(result) {
  const panel = $("#resultPanel");
  const detailById = new Map((result.details || []).map((item) => [item.questionId, item]));
  const wrongCount = (result.details || []).filter((item) => !item.isCorrect).length;
  panel.hidden = false;
  panel.innerHTML = `
    <div class="result-score">
      <strong>${result.score}%</strong>
      <div>
        <b>${t("score")}: ${result.correct}/${result.total}</b>
        <span>${t("duration")}: ${formatDuration(result.durationSeconds || 0)}</span>
      </div>
    </div>
    <div class="review-actions">
      <button class="btn secondary" data-redo-session><i data-lucide="rotate-ccw" aria-hidden="true"></i><span>${t("redo")}</span></button>
      <button class="btn primary" data-review-wrong ${wrongCount ? "" : "disabled"}><i data-lucide="list-x" aria-hidden="true"></i><span>${t("reviewWrong")} (${wrongCount})</span></button>
    </div>
    ${state.activeQuestions.map((question, index) => {
      const detail = detailById.get(question.id);
      const answer = (detail?.correct || question.answer || []).join(", ");
      return `
        <div class="bank-card">
          <h3>${index + 1}. ${escapeHtml(localized(question.prompt))}</h3>
          <footer>
            <span class="answer-tag">${t("correctAnswer")}: ${answer}</span>
            <span>${detail?.isCorrect ? "OK" : "Review"}</span>
          </footer>
          <p>${t("explanation")}: ${escapeHtml(localized(question.explanation))}</p>
          <p>${t("sopLocation")}: ${escapeHtml(localized(question.sopLocation))}</p>
        </div>
      `;
    }).join("")}
  `;
  panel.querySelector("[data-redo-session]")?.addEventListener("click", redoSession);
  panel.querySelector("[data-review-wrong]")?.addEventListener("click", () => startWrongReview(result));
  renderIcons();
}

function redoSession() {
  state.currentIndex = 0;
  state.answers = {};
  state.startedAt = Date.now();
  $("#resultPanel").hidden = true;
  restartTimer();
  renderQuestion();
  renderStats();
  setView("exam");
}

function startWrongReview(result) {
  const wrongIds = (result.details || [])
    .filter((item) => !item.isCorrect)
    .map((item) => item.questionId);
  const questions = wrongIds.map((id) => state.questions.find((question) => question.id === id)).filter(Boolean);
  if (!questions.length) {
    window.alert(t("noWrongQuestions"));
    return;
  }
  state.mode = "review";
  state.activeQuestions = questions;
  state.currentIndex = 0;
  state.answers = {};
  state.startedAt = Date.now();
  $("#resultPanel").hidden = true;
  syncModeTabs();
  restartTimer();
  renderQuestion();
  renderStats();
  setView("exam");
}

function renderBank() {
  const query = $("#searchInput").value.trim().toLowerCase();
  const type = $("#typeFilter")?.value || "all";
  const list = $("#bankList");
  const filtered = state.questions.filter((question) => {
    if (type !== "all" && question.type !== type) return false;
    const text = [
      localized(question.category),
      localized(question.prompt),
      question.options.map(localized).join(" "),
      localized(question.sopLocation)
    ].join(" ").toLowerCase();
    return !query || text.includes(query);
  });

  list.innerHTML = filtered.length ? filtered.map((question, index) => `
    <article class="bank-card">
      <h3>${index + 1}. ${escapeHtml(localized(question.prompt))}</h3>
      <footer>
        <span>${escapeHtml(localized(question.category))} · ${question.difficulty || "medium"}</span>
        <span class="answer-tag">${t("correctAnswer")}: ${(question.answer || []).join(", ")}</span>
      </footer>
      <p>${t("sopLocation")}: ${escapeHtml(localized(question.sopLocation))}</p>
      <p>${t("source")}: ${escapeHtml(localized(question.source))}</p>
    </article>
  `).join("") : `<div class="empty">${t("noQuestions")}</div>`;
}

async function saveBank() {
  const payload = await api("/api/questions", {
    method: "PUT",
    body: JSON.stringify({ questions: state.questions })
  });
  state.questions = payload.questions || [];
  startSession(state.mode, false);
  window.alert(t("saved"));
}

function exportBank() {
  const blob = new Blob([JSON.stringify(state.questions, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "dmrv-sop-question-bank.json";
  link.click();
  URL.revokeObjectURL(url);
}

function importBank(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      const questions = Array.isArray(parsed) ? parsed : parsed.questions;
      if (!Array.isArray(questions)) throw new Error("Invalid structure");
      state.questions = questions;
      startSession(state.mode, false);
      renderAll();
      window.alert(t("imported"));
    } catch {
      window.alert(t("importInvalid"));
    }
  };
  reader.readAsText(file);
}

async function refreshResults() {
  const payload = await api("/api/results");
  state.results = payload.results || [];
  renderResults();
  renderStats();
}

function renderResults() {
  const list = $("#resultsList");
  list.innerHTML = state.results.length ? state.results.map((result) => {
    const wrongCount = (result.details || []).filter((item) => !item.isCorrect).length;
    return `
    <article class="result-row">
      <div>
        <strong>${escapeHtml(result.name || t("guest"))}</strong>
        <span>${new Date(result.submittedAt).toLocaleString()} · ${modeLabel(result.mode)}</span>
      </div>
      <div class="score-badge">${result.score}%</div>
      <span>${result.correct}/${result.total}<small>${t("wrongCount")}: ${wrongCount}</small></span>
      <div class="row-actions">
        <button class="btn secondary small" data-review-result="${escapeHtml(result.id)}" ${wrongCount ? "" : "disabled"}><i data-lucide="list-x" aria-hidden="true"></i><span>${t("reviewWrong")}</span></button>
      </div>
    </article>
  `;
  }).join("") : `<div class="empty">${t("noResults")}</div>`;
  $$("[data-review-result]").forEach((button) => {
    button.addEventListener("click", () => {
      const result = state.results.find((item) => item.id === button.dataset.reviewResult);
      if (result) startWrongReview(result);
    });
  });
  renderIcons();
}

function exportResults() {
  if (!state.results.length) {
    window.alert(t("noExportResults"));
    return;
  }
  const headers = [
    "submittedAt",
    "name",
    "mode",
    "score",
    "correct",
    "total",
    "durationSeconds",
    "wrongCount",
    "wrongQuestionIds"
  ];
  const rows = state.results.map((result) => {
    const wrongIds = (result.details || []).filter((item) => !item.isCorrect).map((item) => item.questionId);
    return [
      result.submittedAt || "",
      result.name || t("guest"),
      modeLabel(result.mode),
      result.score ?? "",
      result.correct ?? "",
      result.total ?? "",
      result.durationSeconds ?? "",
      wrongIds.length,
      wrongIds.join(" ")
    ];
  });
  const csv = [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `dmrv-sop-results-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function csvCell(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function renderAll() {
  renderStats();
  renderQuestion();
  renderBank();
  renderResults();
  renderIcons();
}

function renderIcons() {
  if (window.lucide) window.lucide.createIcons();
  $$("svg.lucide").forEach((icon) => icon.setAttribute("aria-hidden", "true"));
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function bindEvents() {
  $$(".nav-item").forEach((button) => button.addEventListener("click", () => setView(button.dataset.view)));
  $$(".segment").forEach((button) => button.addEventListener("click", () => setLanguage(button.dataset.lang)));
  $$(".tab").forEach((button) => button.addEventListener("click", () => setMode(button.dataset.mode)));
  $$("[data-start]").forEach((button) => button.addEventListener("click", () => setMode(button.dataset.start)));
  $$("[data-view-shortcut]").forEach((button) => button.addEventListener("click", () => setView(button.dataset.viewShortcut)));

  $("#prevQuestion").addEventListener("click", () => moveQuestion(-1));
  $("#nextQuestion").addEventListener("click", () => moveQuestion(1));
  $("#submitExam").addEventListener("click", submitExam);
  $("#searchInput").addEventListener("input", renderBank);
  $("#typeFilter").addEventListener("change", renderBank);
  $("#saveBank").addEventListener("click", saveBank);
  $("#exportBank").addEventListener("click", exportBank);
  $("#exportResults").addEventListener("click", exportResults);
  $("#refreshResults").addEventListener("click", refreshResults);
  $("#importFile").addEventListener("change", (event) => {
    const [file] = event.target.files;
    if (file) importBank(file);
  });
}

bindEvents();
setLanguage(state.lang);
loadData().catch((error) => {
  console.error(error);
  $("#questionArea").innerHTML = `<div class="empty">Failed to load application data.</div>`;
});
