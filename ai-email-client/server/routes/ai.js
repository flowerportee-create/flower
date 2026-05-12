import express from "express";
import { generateReply, pickExamples } from "../lib/claude.js";
import { getActiveAccount, getExamplesFor, addExample } from "../lib/store.js";

const router = express.Router();

// POST /api/ai/draft
// body: { incoming: { from, subject, body }, instruction? }
router.post("/draft", express.json({ limit: "2mb" }), async (req, res, next) => {
  try {
    const account = await getActiveAccount();
    if (!account) return res.status(401).json({ error: "No active account." });

    const { incoming, instruction } = req.body;
    if (!incoming?.body) {
      return res.status(400).json({ error: "incoming.body is required" });
    }

    const all = await getExamplesFor(account.email);
    const chosen = pickExamples(incoming, all);

    const result = await generateReply({
      incoming,
      examples: chosen,
      userInstruction: instruction,
    });

    res.json({
      draft: result.text,
      exampleCount: result.exampleCount,
      totalExamples: all.length,
      usage: result.usage,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/ai/examples — manually record a (incoming, reply) pair
router.post("/examples", express.json({ limit: "2mb" }), async (req, res, next) => {
  try {
    const account = await getActiveAccount();
    if (!account) return res.status(401).json({ error: "No active account." });
    const { incoming, reply } = req.body;
    if (!incoming?.body || !reply?.body) {
      return res.status(400).json({ error: "incoming.body and reply.body required" });
    }
    const example = await addExample({
      accountEmail: account.email,
      incoming,
      reply,
    });
    res.json({ ok: true, example });
  } catch (err) {
    next(err);
  }
});

// GET /api/ai/stats — quick visibility into the learning corpus
router.get("/stats", async (_req, res, next) => {
  try {
    const account = await getActiveAccount();
    if (!account) return res.status(401).json({ error: "No active account." });
    const list = await getExamplesFor(account.email);
    res.json({
      account: account.email,
      exampleCount: list.length,
      latest: list.slice(-5).reverse().map((ex) => ({
        id: ex.id,
        createdAt: ex.createdAt,
        from: ex.incoming.from,
        subject: ex.incoming.subject,
      })),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
