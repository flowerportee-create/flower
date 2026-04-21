#!/usr/bin/env node
/**
 * note記事 自動生成スクリプト
 *
 * 使い方:
 *   node scripts/generate.mjs                          # data/titles_all100.json を使用
 *   node scripts/generate.mjs data/titles.json         # ファイルを指定
 *   node scripts/generate.mjs data/titles_all100.json --genre kasegikata  # ジャンル絞り込み
 */

import Anthropic from "@anthropic-ai/sdk";
import { readFile, writeFile, mkdir, access } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// ────────────────────────────────────────────
// パス設定
// ────────────────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE_DIR = join(__dirname, "..");
const DATA_DIR = join(BASE_DIR, "data");
const TEMPLATES_DIR = join(BASE_DIR, "templates");
const OUTPUT_DIR = join(BASE_DIR, "output");

// ────────────────────────────────────────────
// API設定
// ────────────────────────────────────────────
const MODEL = "claude-sonnet-4-20250514";
const MAX_TOKENS = 8000;
const TEMPERATURE = 0.7;
const REQUEST_INTERVAL_MS = 3000;
const RETRY_WAIT_MS = 30_000;
const MAX_RETRIES = 3;
const CONSECUTIVE_ERROR_LIMIT = 5;

// ────────────────────────────────────────────
// 文章スタイルルール（CLAUDE.mdから）
// ────────────────────────────────────────────
const STYLE_RULES = `## 守るべき文章スタイルルール
- 一文は60文字以内。短く切る
- 漢字率は30%以下。ひらがな多めで読みやすく
- 「〜です。〜ます。」の連続禁止。断定調と混ぜる
- 具体的な数字を必ず入れる（「たくさん」→「月収30万」）
- 冒頭3行で読者の痛みに触れる（フック）
- 箇条書きは5個以内
- CTAは「今すぐ」「限定」「残りわずか」を自然に使う
- 「あなた」「あなたも」の二人称を多用
- 情報商材っぽさを出さない（信頼性重視）
- スマホで読む前提（段落は短く）

## 品質基準
- 全体：3000〜8000字
- 無料パート：1500〜2500字（全体の約1/3）
- 有料パート：1500〜5500字（具体的な手順・テンプレート・数字）
- 冒頭フック：読者の悩みを言語化（3行以内）
- 構成：問題提起→原因分析→解決策→具体的手順→まとめ
- CTA：無料パートの最後に有料部分への誘導を自然に配置

## ターゲット読者
- 22〜60歳（ボリュームゾーンは20代後半〜30代女性）
- 花が好きで花の仕事に興味がある人
- スマホで読む`;

// ────────────────────────────────────────────
// ユーティリティ
// ────────────────────────────────────────────
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

/** 価格帯から目標文字数を返す */
function targetLength(price = 980) {
  if (price <= 580) return 3000;
  if (price <= 780) return 4000;
  if (price <= 980) return 5000;
  if (price <= 1480) return 6000;
  return 8000;
}

// ────────────────────────────────────────────
// プロンプト構築
// ────────────────────────────────────────────
function buildSystemPrompt() {
  return `あなたはnoteで月100万円以上稼ぐプロのライターです。
以下のルールに従って記事を書いてください：

${STYLE_RULES}`;
}

function buildUserPrompt(entry, template) {
  const hints = [
    entry.angle ? `【切り口】${entry.angle}` : null,
    entry.emotion ? `【感情トリガー】${entry.emotion}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  return `【ジャンル】${entry.genre}
【タイトル】${entry.title}
${hints ? hints + "\n" : ""}【目標文字数】${targetLength(entry.price)}字
【テンプレート】
${template}

上記に従って、noteの本文を生成してください。
無料パートと有料パートを明確に分けてください。
有料パートの区切りには「---ここから有料---」と入れてください。`;
}

// ────────────────────────────────────────────
// API呼び出し（リトライ付き）
// ────────────────────────────────────────────
async function generateWithRetry(client, systemPrompt, userPrompt) {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await client.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        temperature: TEMPERATURE,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      });
      return response.content.find((b) => b.type === "text")?.text ?? "";
    } catch (err) {
      const isLast = attempt >= MAX_RETRIES;
      console.error(`    ⚠️  エラー (${attempt}/${MAX_RETRIES}): ${err.message}`);
      if (!isLast) {
        console.log(`    ⏳ ${RETRY_WAIT_MS / 1000}秒後にリトライ...`);
        await sleep(RETRY_WAIT_MS);
      } else {
        throw err;
      }
    }
  }
}

// ────────────────────────────────────────────
// メイン処理
// ────────────────────────────────────────────
async function main() {
  // APIキーチェック
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("❌ ANTHROPIC_API_KEY が設定されていません");
    console.error("   例: export ANTHROPIC_API_KEY=sk-ant-...");
    process.exit(1);
  }

  // CLIオプション解析
  const args = process.argv.slice(2);
  const titlesFile = args.find((a) => !a.startsWith("--")) ?? "data/titles_all100.json";
  const genreFilter = args.find((a) => a.startsWith("--genre="))?.split("=")[1]
    ?? (args.indexOf("--genre") !== -1 ? args[args.indexOf("--genre") + 1] : null);

  const titlesPath = titlesFile.startsWith("/") ? titlesFile : join(BASE_DIR, titlesFile);

  if (!(await fileExists(titlesPath))) {
    console.error(`❌ タイトルファイルが見つかりません: ${titlesPath}`);
    process.exit(1);
  }

  // タイトルリスト読み込み
  let titles = JSON.parse(await readFile(titlesPath, "utf-8"));
  if (genreFilter) {
    titles = titles.filter((t) => t.genre === genreFilter);
    console.log(`🔍 ジャンル絞り込み: ${genreFilter} → ${titles.length}本`);
  }
  console.log(`📋 対象タイトル数: ${titles.length}本`);
  console.log(`📂 出力先: output/{id}_{genre}.md\n`);

  await mkdir(OUTPUT_DIR, { recursive: true });

  const client = new Anthropic({ apiKey });
  const systemPrompt = buildSystemPrompt();

  let generated = 0;
  let skipped = 0;
  let consecutiveErrors = 0;

  for (let i = 0; i < titles.length; i++) {
    const entry = titles[i];
    const outputPath = join(OUTPUT_DIR, `${entry.id}_${entry.genre}.md`);
    const progress = `[${i + 1}/${titles.length}]`;

    // 生成済みスキップ
    if (await fileExists(outputPath)) {
      console.log(`⏭️  ${progress} スキップ: #${entry.id} ${entry.title}`);
      skipped++;
      continue;
    }

    console.log(`\n✍️  ${progress} 生成中: ${entry.title}`);

    // テンプレート読み込み
    const templatePath = join(TEMPLATES_DIR, `${entry.genre}.md`);
    if (!(await fileExists(templatePath))) {
      console.error(`  ❌ テンプレートなし: ${entry.genre}.md — スキップします`);
      consecutiveErrors++;
      checkConsecutiveErrors(consecutiveErrors);
      continue;
    }
    const template = await readFile(templatePath, "utf-8");

    // 本文生成
    let content;
    try {
      const userPrompt = buildUserPrompt(entry, template);
      content = await generateWithRetry(client, systemPrompt, userPrompt);
      consecutiveErrors = 0;
    } catch (err) {
      console.error(`  ❌ 生成失敗: ${err.message}`);
      consecutiveErrors++;
      checkConsecutiveErrors(consecutiveErrors);
      continue;
    }

    // ファイル保存
    const fileContent = buildOutputFile(entry, content);
    await writeFile(outputPath, fileContent, "utf-8");
    console.log(`  ✅ 保存: output/${entry.id}_${entry.genre}.md`);
    generated++;

    // インターバル（最後の1件はスキップ）
    if (i < titles.length - 1) {
      process.stdout.write(`  ⏱  ${REQUEST_INTERVAL_MS / 1000}秒待機中...`);
      await sleep(REQUEST_INTERVAL_MS);
      process.stdout.write("\r" + " ".repeat(30) + "\r");
    }
  }

  console.log(`\n🎉 完了: ${generated}本生成, ${skipped}本スキップ`);
}

function buildOutputFile(entry, content) {
  return `---
id: ${entry.id}
genre: ${entry.genre}
title: ${entry.title}
keyword: ${entry.keyword ?? ""}
target_pain: ${entry.target_pain ?? ""}
angle: ${entry.angle ?? ""}
emotion: ${entry.emotion ?? ""}
price: ${entry.price ?? 980}
---

# ${entry.title}

${content}
`;
}

function checkConsecutiveErrors(count) {
  if (count >= CONSECUTIVE_ERROR_LIMIT) {
    console.error(
      `\n🚨 ${CONSECUTIVE_ERROR_LIMIT}回連続エラーが発生しました。処理を中断します。`
    );
    console.error("生成済みのファイルはスキップされるので、そのまま再実行できます。");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("\n予期しないエラー:", err);
  process.exit(1);
});
