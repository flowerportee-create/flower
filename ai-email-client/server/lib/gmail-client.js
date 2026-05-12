import { google } from "googleapis";
import { updateTokens } from "./store.js";

export const GMAIL_SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.modify",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
];

export function makeOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );
}

export function getAuthUrl() {
  const client = makeOAuthClient();
  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: GMAIL_SCOPES,
  });
}

export async function exchangeCode(code) {
  const client = makeOAuthClient();
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);
  const oauth2 = google.oauth2({ version: "v2", auth: client });
  const { data: profile } = await oauth2.userinfo.get();
  return { tokens, profile };
}

// Build a Gmail API client authenticated as a specific account, with auto-refresh
// of the access token persisted back to disk.
export function gmailFor(account) {
  const client = makeOAuthClient();
  client.setCredentials(account.tokens);
  client.on("tokens", (newTokens) => {
    // Persist refreshed access tokens asynchronously
    updateTokens(account.email, newTokens).catch((err) =>
      console.error("Failed to persist refreshed tokens:", err),
    );
  });
  return google.gmail({ version: "v1", auth: client });
}

// ── Message parsing ──────────────────────────────────────────────────────

function decodeBase64Url(s) {
  if (!s) return "";
  const normalized = s.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(normalized, "base64").toString("utf8");
}

function findHeader(headers, name) {
  const h = headers?.find((x) => x.name.toLowerCase() === name.toLowerCase());
  return h?.value ?? "";
}

function extractBody(payload) {
  if (!payload) return { text: "", html: "" };
  let text = "";
  let html = "";

  const walk = (part) => {
    if (!part) return;
    const mime = part.mimeType ?? "";
    if (part.body?.data) {
      const decoded = decodeBase64Url(part.body.data);
      if (mime === "text/plain" && !text) text = decoded;
      else if (mime === "text/html" && !html) html = decoded;
    }
    if (Array.isArray(part.parts)) {
      for (const p of part.parts) walk(p);
    }
  };
  walk(payload);
  return { text, html };
}

function htmlToText(html) {
  if (!html) return "";
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function parseMessage(msg) {
  const headers = msg.payload?.headers ?? [];
  const { text, html } = extractBody(msg.payload);
  const body = text || htmlToText(html);
  return {
    id: msg.id,
    threadId: msg.threadId,
    snippet: msg.snippet ?? "",
    labelIds: msg.labelIds ?? [],
    historyId: msg.historyId,
    internalDate: msg.internalDate ? Number(msg.internalDate) : 0,
    from: findHeader(headers, "From"),
    to: findHeader(headers, "To"),
    cc: findHeader(headers, "Cc"),
    subject: findHeader(headers, "Subject"),
    date: findHeader(headers, "Date"),
    messageId: findHeader(headers, "Message-ID") || findHeader(headers, "Message-Id"),
    references: findHeader(headers, "References"),
    inReplyTo: findHeader(headers, "In-Reply-To"),
    body,
    bodyHtml: html,
  };
}

// ── Listing & fetching ───────────────────────────────────────────────────

export async function listMessages(gmail, { labelId = "INBOX", maxResults = 25, q } = {}) {
  const { data } = await gmail.users.messages.list({
    userId: "me",
    labelIds: labelId ? [labelId] : undefined,
    maxResults,
    q,
  });
  const ids = data.messages ?? [];
  // Fetch metadata for each — parallel but bounded
  const results = await Promise.all(
    ids.map(async ({ id }) => {
      const { data: msg } = await gmail.users.messages.get({
        userId: "me",
        id,
        format: "metadata",
        metadataHeaders: ["From", "To", "Subject", "Date"],
      });
      return {
        id: msg.id,
        threadId: msg.threadId,
        snippet: msg.snippet ?? "",
        labelIds: msg.labelIds ?? [],
        internalDate: msg.internalDate ? Number(msg.internalDate) : 0,
        from: findHeader(msg.payload?.headers, "From"),
        to: findHeader(msg.payload?.headers, "To"),
        subject: findHeader(msg.payload?.headers, "Subject"),
        date: findHeader(msg.payload?.headers, "Date"),
        unread: (msg.labelIds ?? []).includes("UNREAD"),
      };
    }),
  );
  return results;
}

export async function getMessage(gmail, id) {
  const { data } = await gmail.users.messages.get({
    userId: "me",
    id,
    format: "full",
  });
  return parseMessage(data);
}

export async function getThread(gmail, threadId) {
  const { data } = await gmail.users.threads.get({
    userId: "me",
    id: threadId,
    format: "full",
  });
  return {
    id: data.id,
    historyId: data.historyId,
    messages: (data.messages ?? []).map(parseMessage),
  };
}

// ── Sending ──────────────────────────────────────────────────────────────

function encodeRFC2047(str) {
  if (/^[\x00-\x7F]*$/.test(str)) return str;
  return `=?UTF-8?B?${Buffer.from(str, "utf8").toString("base64")}?=`;
}

function buildRawMessage({ from, to, cc, subject, body, inReplyTo, references }) {
  const lines = [];
  if (from) lines.push(`From: ${from}`);
  lines.push(`To: ${to}`);
  if (cc) lines.push(`Cc: ${cc}`);
  lines.push(`Subject: ${encodeRFC2047(subject || "")}`);
  if (inReplyTo) lines.push(`In-Reply-To: ${inReplyTo}`);
  if (references) lines.push(`References: ${references}`);
  lines.push("MIME-Version: 1.0");
  lines.push('Content-Type: text/plain; charset="UTF-8"');
  lines.push("Content-Transfer-Encoding: 8bit");
  lines.push("");
  lines.push(body || "");
  const raw = lines.join("\r\n");
  return Buffer.from(raw, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function sendMessage(gmail, opts) {
  const raw = buildRawMessage(opts);
  const { data } = await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw,
      threadId: opts.threadId,
    },
  });
  return data;
}

export async function modifyLabels(gmail, id, { add = [], remove = [] } = {}) {
  await gmail.users.messages.modify({
    userId: "me",
    id,
    requestBody: { addLabelIds: add, removeLabelIds: remove },
  });
}
