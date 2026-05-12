// AI Email Client — frontend
// Three-pane Gmail-like UI talking to /auth, /api/gmail, /api/ai.

const state = {
  accounts: [],
  activeEmail: null,
  label: "INBOX",
  query: "",
  messages: [],
  selectedId: null,
  selectedMessage: null, // full parsed message for the currently opened mail
  composeMode: null, // 'new' | 'reply'
};

const el = (id) => document.getElementById(id);
const $list = el("message-list");
const $reading = el("reading-pane");
const $accountSwitch = el("account-switch");
const $learningCount = el("learning-count");

async function api(path, opts = {}) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!res.ok) {
    let detail = "";
    try {
      detail = (await res.json()).error;
    } catch {}
    throw new Error(detail || `${res.status} ${res.statusText}`);
  }
  return res.json();
}

// ── Account management ──────────────────────────────────────────────────

async function loadAccounts() {
  const data = await api("/auth/accounts");
  state.accounts = data.accounts;
  state.activeEmail = data.activeEmail;
  renderAccountSwitch();
  if (!state.accounts.length) {
    showSignInBanner();
    return false;
  }
  return true;
}

function renderAccountSwitch() {
  $accountSwitch.innerHTML = "";
  for (const acc of state.accounts) {
    const opt = document.createElement("option");
    opt.value = acc.email;
    opt.textContent = `${acc.name ? `${acc.name} ` : ""}<${acc.email}>`;
    if (acc.email === state.activeEmail) opt.selected = true;
    $accountSwitch.append(opt);
  }
}

$accountSwitch.addEventListener("change", async () => {
  const email = $accountSwitch.value;
  await api("/auth/active", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
  state.activeEmail = email;
  state.selectedId = null;
  state.selectedMessage = null;
  $reading.innerHTML = '<div class="placeholder">メールを選択してください</div>';
  await loadMessages();
  await loadStats();
});

el("add-account").addEventListener("click", () => {
  window.location.href = "/auth/google";
});

function showSignInBanner() {
  $list.innerHTML = "";
  $reading.innerHTML = `
    <div class="signin-banner">
      <h2>Gmail アカウントを接続</h2>
      <p>このアプリは Gmail に対する読み取り・送信権限を必要とします。</p>
      <a href="/auth/google">Google でログイン</a>
    </div>
  `;
}

// ── Labels / sidebar ────────────────────────────────────────────────────

document.querySelectorAll(".labels li").forEach((li) => {
  li.addEventListener("click", () => {
    document.querySelectorAll(".labels li").forEach((x) => x.classList.remove("active"));
    li.classList.add("active");
    state.label = li.dataset.label;
    loadMessages();
  });
});

// ── Search ──────────────────────────────────────────────────────────────

let searchTimer = null;
el("search").addEventListener("input", (e) => {
  state.query = e.target.value.trim();
  clearTimeout(searchTimer);
  searchTimer = setTimeout(loadMessages, 400);
});

// ── Message list ────────────────────────────────────────────────────────

function formatDate(date) {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) {
    return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString(undefined, { month: "numeric", day: "numeric" });
}

function parseDisplayName(from) {
  // "Name <email@host>" → Name
  const m = from?.match(/^\s*"?([^"<]+?)"?\s*<.+>/);
  if (m) return m[1].trim();
  return from || "";
}

async function loadMessages() {
  $list.innerHTML = '<div class="empty">読み込み中…</div>';
  try {
    const params = new URLSearchParams({ label: state.label });
    if (state.query) params.set("q", state.query);
    const data = await api(`/api/gmail/messages?${params}`);
    state.messages = data.messages;
    renderMessageList();
  } catch (err) {
    $list.innerHTML = `<div class="empty">読み込み失敗: ${err.message}</div>`;
  }
}

function renderMessageList() {
  if (!state.messages.length) {
    $list.innerHTML = '<div class="empty">メールがありません</div>';
    return;
  }
  $list.innerHTML = "";
  for (const m of state.messages) {
    const row = document.createElement("div");
    row.className = "message-row" + (m.unread ? " unread" : "") + (m.id === state.selectedId ? " selected" : "");
    row.dataset.id = m.id;
    row.innerHTML = `
      <div class="row-from">${escapeHtml(parseDisplayName(m.from))}</div>
      <div class="row-date">${formatDate(m.date)}</div>
      <div class="row-subject">${escapeHtml(m.subject || "(件名なし)")}</div>
      <div class="row-snippet">${escapeHtml(m.snippet)}</div>
    `;
    row.addEventListener("click", () => openMessage(m.id));
    $list.append(row);
  }
}

function escapeHtml(s) {
  if (!s) return "";
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ── Reading pane ────────────────────────────────────────────────────────

async function openMessage(id) {
  state.selectedId = id;
  document.querySelectorAll(".message-row").forEach((r) => {
    r.classList.toggle("selected", r.dataset.id === id);
  });
  $reading.innerHTML = '<div class="placeholder">読み込み中…</div>';
  try {
    const msg = await api(`/api/gmail/messages/${id}`);
    state.selectedMessage = msg;
    renderMessage(msg);
    // Mark as read
    api(`/api/gmail/messages/${id}/read`, { method: "POST" }).catch(() => {});
  } catch (err) {
    $reading.innerHTML = `<div class="placeholder">読み込み失敗: ${escapeHtml(err.message)}</div>`;
  }
}

function renderMessage(msg) {
  const initial = parseDisplayName(msg.from).slice(0, 1).toUpperCase() || "?";
  $reading.innerHTML = `
    <div class="message-view">
      <h1>${escapeHtml(msg.subject || "(件名なし)")}</h1>
      <div class="message-meta">
        <div class="avatar">${escapeHtml(initial)}</div>
        <div>
          <div class="meta-from">${escapeHtml(msg.from)}</div>
          <div class="meta-to">To: ${escapeHtml(msg.to)}</div>
        </div>
        <div class="meta-date">${escapeHtml(msg.date)}</div>
      </div>
      <div class="message-body">${escapeHtml(msg.body)}</div>
      <div class="actions">
        <button id="action-reply" class="primary">↩ 返信</button>
        <button id="action-ai-reply">🪄 AIで返信</button>
      </div>
    </div>
  `;
  el("action-reply").addEventListener("click", () => openCompose("reply", msg));
  el("action-ai-reply").addEventListener("click", () =>
    openCompose("reply", msg, { autoDraft: true }),
  );
}

// ── Compose / Reply ─────────────────────────────────────────────────────

const $modal = el("compose-modal");
const $title = el("compose-title");
const $to = el("compose-to");
const $cc = el("compose-cc");
const $subject = el("compose-subject");
const $body = el("compose-body");
const $instruction = el("ai-instruction");
const $aiBtn = el("ai-draft");
const $aiStatus = el("ai-status");

let composeContext = { mode: null, message: null };

function openCompose(mode, message = null, opts = {}) {
  composeContext = { mode, message };
  state.composeMode = mode;
  $aiStatus.textContent = "";
  $aiStatus.classList.remove("error");
  $instruction.value = "";

  if (mode === "reply" && message) {
    $title.textContent = "返信";
    $to.value = extractEmail(message.from);
    $cc.value = "";
    $subject.value = message.subject?.startsWith("Re:")
      ? message.subject
      : `Re: ${message.subject || ""}`;
    $body.value = "";
  } else {
    $title.textContent = "新規メール";
    $to.value = "";
    $cc.value = "";
    $subject.value = "";
    $body.value = "";
  }

  $modal.classList.remove("hidden");
  if (opts.autoDraft) generateDraft();
}

function extractEmail(headerValue) {
  if (!headerValue) return "";
  const m = headerValue.match(/<([^>]+)>/);
  return m ? m[1] : headerValue.trim();
}

el("compose").addEventListener("click", () => openCompose("new"));
el("compose-close").addEventListener("click", closeCompose);
el("compose-cancel").addEventListener("click", closeCompose);

function closeCompose() {
  $modal.classList.add("hidden");
}

$aiBtn.addEventListener("click", () => generateDraft());

async function generateDraft() {
  if (composeContext.mode !== "reply" || !composeContext.message) {
    $aiStatus.textContent = "AI 下書きは「返信」のみ対応しています。";
    $aiStatus.classList.add("error");
    return;
  }
  $aiBtn.disabled = true;
  $aiStatus.textContent = "Claude が下書きを作成中…";
  $aiStatus.classList.remove("error");
  try {
    const data = await api("/api/ai/draft", {
      method: "POST",
      body: JSON.stringify({
        incoming: {
          from: composeContext.message.from,
          subject: composeContext.message.subject,
          body: composeContext.message.body,
        },
        instruction: $instruction.value || undefined,
      }),
    });
    $body.value = data.draft;
    $aiStatus.textContent = `完了 (${data.exampleCount}/${data.totalExamples} 件の過去返信を参考にしました)`;
  } catch (err) {
    $aiStatus.textContent = `失敗: ${err.message}`;
    $aiStatus.classList.add("error");
  } finally {
    $aiBtn.disabled = false;
  }
}

el("compose-send").addEventListener("click", async () => {
  const to = $to.value.trim();
  const body = $body.value.trim();
  if (!to || !body) {
    alert("宛先と本文は必須です。");
    return;
  }

  const payload = {
    to,
    cc: $cc.value.trim() || undefined,
    subject: $subject.value.trim(),
    body,
  };

  if (composeContext.mode === "reply" && composeContext.message) {
    const m = composeContext.message;
    payload.threadId = m.threadId;
    payload.inReplyTo = m.messageId;
    payload.references = m.references
      ? `${m.references} ${m.messageId}`
      : m.messageId;
    // Send the original so the server can record a learning example
    payload.incoming = {
      from: m.from,
      subject: m.subject,
      body: m.body,
    };
  }

  el("compose-send").disabled = true;
  try {
    await api("/api/gmail/send", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    closeCompose();
    await loadStats();
    if (state.label === "INBOX") loadMessages();
  } catch (err) {
    alert(`送信失敗: ${err.message}`);
  } finally {
    el("compose-send").disabled = false;
  }
});

// ── Learning stats ──────────────────────────────────────────────────────

async function loadStats() {
  try {
    const data = await api("/api/ai/stats");
    $learningCount.textContent = `${data.exampleCount} 件の返信例`;
  } catch {
    $learningCount.textContent = "—";
  }
}

// ── Bootstrap ───────────────────────────────────────────────────────────

(async function init() {
  const ok = await loadAccounts();
  if (!ok) return;
  await Promise.all([loadMessages(), loadStats()]);
})();
