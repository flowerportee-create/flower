/**
 * 仮画像（SVG）の生成スクリプト
 * -----------------------------------------------------------------------------
 * public/images/ 以下に、シーン・テイスト・花の仮画像を作成します。
 * 実際の写真に差し替える場合はこのスクリプトを実行する必要はありません。
 * （同じファイル名で .jpg などを置き、shop.ts の image を書き換えてください）
 *
 * 実行方法:  node scripts/generate-placeholders.mjs
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const imagesDir = join(root, 'public', 'images');

/** 文字列から 0〜359 の数値を作ります */
function hash(value) {
  let result = 0;
  for (let i = 0; i < value.length; i += 1) {
    result = (result * 31 + value.charCodeAt(i)) % 360;
  }
  return result;
}

/** 柔らかいグラデーションと花のシルエットからなる仮画像を作ります */
function createSvg(seed, width = 640, height = 480) {
  const hue = hash(seed);
  const hue2 = (hue + 45) % 360;
  const id = `g${hue}${hue2}`;
  const cx = width / 2;
  const cy = height / 2;
  const petals = Array.from({ length: 6 }, (_, index) => {
    const angle = (index * 60 * Math.PI) / 180;
    const px = cx + Math.cos(angle) * height * 0.14;
    const py = cy + Math.sin(angle) * height * 0.14;
    return `<ellipse cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" rx="${(height * 0.1).toFixed(1)}" ry="${(height * 0.062).toFixed(1)}" transform="rotate(${index * 60} ${px.toFixed(1)} ${py.toFixed(1)})" fill="#ffffff" opacity="0.5" />`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img">
  <defs>
    <linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="hsl(${hue} 26% 93%)" />
      <stop offset="100%" stop-color="hsl(${hue2} 22% 82%)" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#${id})" />
  ${petals}
  <circle cx="${cx}" cy="${cy}" r="${(height * 0.055).toFixed(1)}" fill="#ffffff" opacity="0.75" />
</svg>
`;
}

/** shop.ts に書かれている画像パスの一覧 */
const scenes = ['bridal', 'party', 'exhibition', 'popup', 'corporate', 'shop', 'photo', 'other'];
const styles = [
  'natural', 'classic', 'modern', 'romantic', 'minimal', 'luxury',
  'botanical', 'artistic', 'japandi', 'korean', 'colorful', 'airy',
];
const flowers = [
  'tulip', 'sweetpea', 'ranunculus', 'anemone', 'cymbidium', 'mimosa', 'sakura',
  'lilac', 'viburnum', 'peony', 'rose', 'delphinium', 'clematis', 'hydrangea',
  'smoketree', 'sunflower', 'anthurium', 'curcuma', 'lisianthus', 'celosia',
  'dahlia', 'cosmos', 'pampas', 'berries', 'autumn-branch', 'amaryllis',
  'cotton', 'conifer',
];

const targets = [
  ...scenes.map((name) => ['scenes', name, 640, 480]),
  ...styles.map((name) => ['styles', name, 640, 480]),
  ...flowers.map((name) => ['flowers', name, 480, 480]),
];

for (const [folder, name, width, height] of targets) {
  const dir = join(imagesDir, folder);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `${name}.svg`), createSvg(`${folder}-${name}`, width, height), 'utf8');
}

/** ロゴの仮画像 */
mkdirSync(imagesDir, { recursive: true });
writeFileSync(
  join(imagesDir, 'logo.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" role="img">
  <circle cx="16" cy="16" r="15" fill="none" stroke="currentColor" stroke-width="1" opacity="0.35" />
  <g fill="currentColor" opacity="0.75">
    <ellipse cx="16" cy="10" rx="3.2" ry="4.6" />
    <ellipse cx="16" cy="22" rx="3.2" ry="4.6" />
    <ellipse cx="10" cy="16" rx="4.6" ry="3.2" />
    <ellipse cx="22" cy="16" rx="4.6" ry="3.2" />
  </g>
  <circle cx="16" cy="16" r="2.4" fill="#ffffff" />
</svg>
`,
  'utf8',
);

console.log(`生成しました: ${targets.length + 1} ファイル`);
