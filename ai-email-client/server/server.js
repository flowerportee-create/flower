import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

import authRoutes from "./routes/auth.js";
import gmailRoutes from "./routes/gmail.js";
import aiRoutes from "./routes/ai.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, "..", "public");

const app = express();

function requireEnv(name) {
  if (!process.env[name]) {
    console.warn(`[warn] Missing env var: ${name}`);
  }
}
for (const v of [
  "ANTHROPIC_API_KEY",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GOOGLE_REDIRECT_URI",
]) {
  requireEnv(v);
}

app.use("/auth", authRoutes);
app.use("/api/gmail", gmailRoutes);
app.use("/api/ai", aiRoutes);
app.use(express.static(PUBLIC_DIR));

// JSON error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  const status = typeof err.status === "number" ? err.status : 500;
  res.status(status).json({
    error: err.message || "Internal server error",
    type: err.name,
  });
});

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => {
  console.log(`AI Email Client → http://localhost:${port}`);
});
