import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const MODEL = "claude-opus-4-7";
const MAX_EXAMPLES = 5;

// ── Few-shot example selection ───────────────────────────────────────────
// Simple lexical similarity: tokenize, score by overlap with the incoming
// email's subject + first ~500 chars of body. Good enough for "the model
// learns my style from similar past mails" without an embeddings service.

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "if", "is", "are", "was", "were", "be",
  "been", "being", "to", "of", "in", "on", "at", "for", "with", "by", "from",
  "as", "i", "you", "he", "she", "it", "we", "they", "my", "your", "his", "her",
  "its", "our", "their", "this", "that", "these", "those", "do", "does", "did",
  "have", "has", "had", "will", "would", "should", "could", "may", "might",
  "can", "shall", "must", "ought", "re", "fw", "fwd",
  // Japanese particles / very common tokens
  "は", "が", "を", "に", "へ", "で", "と", "も", "の", "や", "から", "まで",
  "です", "ます", "した", "する", "して", "そして", "また", "よろしく",
]);

function tokenize(text) {
  if (!text) return [];
  // Lowercase + extract Latin words AND Japanese runs (hiragana / katakana / CJK)
  const lower = text.toLowerCase();
  const tokens = [];
  // Latin alphanumeric words
  for (const m of lower.matchAll(/[a-z0-9]+/g)) tokens.push(m[0]);
  // CJK / kana runs as bigrams (cheap "Japanese tokenizer")
  for (const m of lower.matchAll(/[぀-ヿ一-鿿]+/g)) {
    const run = m[0];
    if (run.length === 1) tokens.push(run);
    else for (let i = 0; i < run.length - 1; i++) tokens.push(run.slice(i, i + 2));
  }
  return tokens.filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

function tfMap(tokens) {
  const m = new Map();
  for (const t of tokens) m.set(t, (m.get(t) ?? 0) + 1);
  return m;
}

function cosineSim(a, b) {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (const [t, va] of a) {
    na += va * va;
    const vb = b.get(t);
    if (vb) dot += va * vb;
  }
  for (const vb of b.values()) nb += vb * vb;
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

function sameSender(a, b) {
  const re = /<([^>]+)>/;
  const ae = (a.match(re)?.[1] ?? a).trim().toLowerCase();
  const be = (b.match(re)?.[1] ?? b).trim().toLowerCase();
  return ae && be && ae === be;
}

export function pickExamples(incoming, examples, k = MAX_EXAMPLES) {
  if (!examples.length) return [];
  const queryText = [
    incoming.subject || "",
    (incoming.body || "").slice(0, 500),
  ].join(" ");
  const queryVec = tfMap(tokenize(queryText));

  const scored = examples.map((ex) => {
    const exText = [
      ex.incoming.subject || "",
      (ex.incoming.body || "").slice(0, 500),
    ].join(" ");
    const exVec = tfMap(tokenize(exText));
    let score = cosineSim(queryVec, exVec);
    // Strong bonus for same correspondent — tone is usually consistent per-person
    if (sameSender(incoming.from || "", ex.incoming.from || "")) score += 0.3;
    return { ex, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored
    .filter((s) => s.score > 0.05)
    .slice(0, k)
    .map((s) => s.ex);
}

// ── Prompt construction ──────────────────────────────────────────────────

function truncate(s, n) {
  if (!s) return "";
  if (s.length <= n) return s;
  return `${s.slice(0, n)}\n…[truncated]`;
}

function formatExamples(examples) {
  if (!examples.length) {
    return "(No past examples yet. Write a polite, appropriately concise reply that matches the language of the incoming email.)";
  }
  return examples
    .map((ex, i) => {
      const header =
        `Example ${i + 1}\n` +
        `--- Incoming ---\n` +
        `From: ${ex.incoming.from}\n` +
        `Subject: ${ex.incoming.subject}\n\n` +
        `${truncate(ex.incoming.body, 1500)}\n\n` +
        `--- My reply ---\n${truncate(ex.reply.body, 1500)}`;
      return header;
    })
    .join("\n\n========================================\n\n");
}

const SYSTEM_PROMPT = `You draft email replies in the user's personal voice.

Your job: read the past (incoming → user's reply) pairs they show you, infer their style — tone, formality, length, sign-off, language, punctuation habits — and apply that style to the new incoming email.

Rules:
- Match the language of the incoming email (Japanese → Japanese, English → English, etc.).
- Match the user's typical length. Do not pad. Do not be more or less formal than they are.
- Reuse their typical opening and sign-off patterns from the examples.
- Output ONLY the reply body. No subject line, no "Here is the draft:", no markdown fencing, no commentary.
- If the email asks a question you cannot answer (e.g. it requires private info the user has), leave a clearly marked placeholder like [TODO: confirm date] rather than inventing facts.`;

export async function generateReply({ incoming, examples, userInstruction }) {
  const exampleBlock = formatExamples(examples);

  const userMessage =
    `Here are recent examples of how I reply to emails:\n\n` +
    `${exampleBlock}\n\n` +
    `========================================\n\n` +
    `Now draft a reply to this new email, in my voice:\n\n` +
    `--- Incoming ---\n` +
    `From: ${incoming.from}\n` +
    `Subject: ${incoming.subject}\n\n` +
    `${truncate(incoming.body, 4000)}\n\n` +
    (userInstruction
      ? `Additional instruction from me: ${userInstruction}\n\n`
      : "") +
    `Draft the reply now. Output only the reply body.`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    thinking: { type: "adaptive" },
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: userMessage }],
  });

  const text = response.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();

  return {
    text,
    usage: response.usage,
    exampleCount: examples.length,
  };
}
