import express from "express";
import {
  getAuthUrl,
  exchangeCode,
} from "../lib/gmail-client.js";
import {
  loadAccounts,
  saveAccount,
  setActiveAccount,
  removeAccount,
} from "../lib/store.js";

const router = express.Router();

router.get("/google", (req, res) => {
  res.redirect(getAuthUrl());
});

router.get("/google/callback", async (req, res, next) => {
  try {
    const code = req.query.code;
    if (!code) return res.status(400).send("Missing authorization code");
    const { tokens, profile } = await exchangeCode(String(code));
    await saveAccount({
      email: profile.email,
      name: profile.name,
      picture: profile.picture,
      tokens,
    });
    res.redirect("/");
  } catch (err) {
    next(err);
  }
});

router.get("/accounts", async (_req, res, next) => {
  try {
    const data = await loadAccounts();
    res.json({
      accounts: data.accounts.map((a) => ({
        email: a.email,
        name: a.name,
        picture: a.picture,
      })),
      activeEmail: data.activeEmail,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/active", express.json(), async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "email required" });
    await setActiveAccount(email);
    res.json({ ok: true, activeEmail: email });
  } catch (err) {
    next(err);
  }
});

router.delete("/accounts/:email", async (req, res, next) => {
  try {
    const data = await removeAccount(req.params.email);
    res.json({ ok: true, activeEmail: data.activeEmail });
  } catch (err) {
    next(err);
  }
});

export default router;
