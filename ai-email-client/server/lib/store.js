import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");
const ACCOUNTS_FILE = path.join(DATA_DIR, "accounts.json");
const EXAMPLES_FILE = path.join(DATA_DIR, "examples.json");

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readJson(file, fallback) {
  try {
    const text = await fs.readFile(file, "utf8");
    return JSON.parse(text);
  } catch (err) {
    if (err.code === "ENOENT") return fallback;
    throw err;
  }
}

async function writeJson(file, data) {
  await ensureDataDir();
  const tmp = `${file}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
  await fs.rename(tmp, file);
}

// ── Accounts ─────────────────────────────────────────────────────────────
// Shape:
// {
//   accounts: [{ email, name, picture, tokens: { access_token, refresh_token, expiry_date, scope, token_type } }],
//   activeEmail: string | null
// }

export async function loadAccounts() {
  return readJson(ACCOUNTS_FILE, { accounts: [], activeEmail: null });
}

export async function saveAccount({ email, name, picture, tokens }) {
  const data = await loadAccounts();
  const existing = data.accounts.find((a) => a.email === email);
  if (existing) {
    existing.name = name ?? existing.name;
    existing.picture = picture ?? existing.picture;
    // Preserve refresh_token if Google didn't return a new one
    existing.tokens = {
      ...existing.tokens,
      ...tokens,
      refresh_token: tokens.refresh_token || existing.tokens.refresh_token,
    };
  } else {
    data.accounts.push({ email, name, picture, tokens });
  }
  data.activeEmail = email;
  await writeJson(ACCOUNTS_FILE, data);
  return data;
}

export async function updateTokens(email, tokens) {
  const data = await loadAccounts();
  const acc = data.accounts.find((a) => a.email === email);
  if (!acc) return;
  acc.tokens = {
    ...acc.tokens,
    ...tokens,
    refresh_token: tokens.refresh_token || acc.tokens.refresh_token,
  };
  await writeJson(ACCOUNTS_FILE, data);
}

export async function setActiveAccount(email) {
  const data = await loadAccounts();
  if (!data.accounts.some((a) => a.email === email)) {
    throw new Error(`Account ${email} not found`);
  }
  data.activeEmail = email;
  await writeJson(ACCOUNTS_FILE, data);
  return data;
}

export async function removeAccount(email) {
  const data = await loadAccounts();
  data.accounts = data.accounts.filter((a) => a.email !== email);
  if (data.activeEmail === email) {
    data.activeEmail = data.accounts[0]?.email ?? null;
  }
  await writeJson(ACCOUNTS_FILE, data);
  return data;
}

export async function getActiveAccount() {
  const data = await loadAccounts();
  if (!data.activeEmail) return null;
  return data.accounts.find((a) => a.email === data.activeEmail) ?? null;
}

// ── Reply examples (few-shot learning corpus) ────────────────────────────
// Each example: {
//   id, accountEmail, createdAt,
//   incoming: { from, subject, body },
//   reply: { body }
// }

export async function loadExamples() {
  return readJson(EXAMPLES_FILE, { examples: [] });
}

export async function addExample(example) {
  const data = await loadExamples();
  const entry = {
    id: `ex_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    ...example,
  };
  data.examples.push(entry);
  // Keep at most 500 examples per account to bound disk + prompt costs
  const perAccount = new Map();
  for (const ex of data.examples) {
    const list = perAccount.get(ex.accountEmail) ?? [];
    list.push(ex);
    perAccount.set(ex.accountEmail, list);
  }
  const trimmed = [];
  for (const list of perAccount.values()) {
    list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    trimmed.push(...list.slice(0, 500));
  }
  data.examples = trimmed;
  await writeJson(EXAMPLES_FILE, data);
  return entry;
}

export async function getExamplesFor(accountEmail) {
  const data = await loadExamples();
  return data.examples.filter((e) => e.accountEmail === accountEmail);
}
