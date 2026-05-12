import express from "express";
import {
  gmailFor,
  listMessages,
  getMessage,
  getThread,
  sendMessage,
  modifyLabels,
} from "../lib/gmail-client.js";
import { getActiveAccount, addExample } from "../lib/store.js";

const router = express.Router();

async function withGmail(req, res, next) {
  try {
    const account = await getActiveAccount();
    if (!account) {
      return res.status(401).json({ error: "No active account. Sign in first." });
    }
    req.account = account;
    req.gmail = gmailFor(account);
    next();
  } catch (err) {
    next(err);
  }
}

router.use(withGmail);

router.get("/messages", async (req, res, next) => {
  try {
    const label = req.query.label ?? "INBOX";
    const max = Math.min(Number(req.query.max ?? 25), 100);
    const q = req.query.q;
    const messages = await listMessages(req.gmail, {
      labelId: label,
      maxResults: max,
      q: q ? String(q) : undefined,
    });
    res.json({ messages, account: { email: req.account.email, name: req.account.name } });
  } catch (err) {
    next(err);
  }
});

router.get("/messages/:id", async (req, res, next) => {
  try {
    const msg = await getMessage(req.gmail, req.params.id);
    res.json(msg);
  } catch (err) {
    next(err);
  }
});

router.get("/threads/:id", async (req, res, next) => {
  try {
    const thread = await getThread(req.gmail, req.params.id);
    res.json(thread);
  } catch (err) {
    next(err);
  }
});

router.post("/messages/:id/read", express.json(), async (req, res, next) => {
  try {
    await modifyLabels(req.gmail, req.params.id, { remove: ["UNREAD"] });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// Send a reply. Body: { threadId, to, cc?, subject, body, inReplyTo?, references?, incoming? }
// If `incoming` is supplied (the original message we're replying to), we record
// this (incoming, reply) pair as a learning example.
router.post("/send", express.json({ limit: "5mb" }), async (req, res, next) => {
  try {
    const {
      threadId,
      to,
      cc,
      subject,
      body,
      inReplyTo,
      references,
      incoming,
    } = req.body;

    if (!to || !body) {
      return res.status(400).json({ error: "to and body are required" });
    }

    const result = await sendMessage(req.gmail, {
      from: `${req.account.name ? `"${req.account.name}" ` : ""}<${req.account.email}>`,
      to,
      cc,
      subject,
      body,
      threadId,
      inReplyTo,
      references,
    });

    let example = null;
    if (incoming && incoming.body) {
      example = await addExample({
        accountEmail: req.account.email,
        incoming: {
          from: incoming.from ?? "",
          subject: incoming.subject ?? "",
          body: incoming.body ?? "",
        },
        reply: { body },
      });
    }

    res.json({ ok: true, sent: result, example });
  } catch (err) {
    next(err);
  }
});

export default router;
