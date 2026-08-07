/**
 * 画像のクライアント側圧縮
 * -----------------------------------------------------------------------------
 * アップロードされた画像はサーバーに送信せず、ブラウザ内で縮小してから
 * プレビュー表示・localStorage への保存に使います。
 */

import type { ReferenceImage } from '@/types';
import { createId } from '@/lib/utils';

/** 長辺の最大ピクセル数。大きくすると画質は上がりますが、保存容量も増えます。 */
const MAX_EDGE = 1200;

/** JPEG の画質（0〜1）。0.7 前後が容量と見た目のバランスが良い設定です。 */
const QUALITY = 0.7;

/** 受け付ける画像の最大サイズ（バイト）。これより大きいファイルは読み込みません。 */
export const MAX_FILE_SIZE = 20 * 1024 * 1024;

/** 1回のシミュレーションで保持できる画像の最大枚数 */
export const MAX_IMAGE_COUNT = 8;

/** data URL のおおよそのバイト数（Base64 は元データの約4/3の長さになります） */
function estimateBytes(dataUrl: string): number {
  const commaIndex = dataUrl.indexOf(',');
  const base64Length = commaIndex >= 0 ? dataUrl.length - commaIndex - 1 : dataUrl.length;
  return Math.round(base64Length * 0.75);
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('ファイルを読み込めませんでした'));
    reader.readAsDataURL(file);
  });
}

/**
 * 画像ファイルを描画できる形に読み込みます。
 * ファイルを直接読み込むため、大きな画像でもメモリの消費を抑えられます。
 */
async function loadImageSource(file: File): Promise<CanvasImageSource & { width: number; height: number }> {
  if (typeof createImageBitmap === 'function') {
    return await createImageBitmap(file);
  }
  // createImageBitmap に対応していないブラウザ向けの代替手段
  const objectUrl = URL.createObjectURL(file);
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('画像を表示できませんでした'));
      image.src = objectUrl;
    });
  } finally {
    // 読み込み後は URL を解放します（画像データは canvas に描画済みのため問題ありません）
    setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
  }
}

/**
 * 画像ファイルを縮小して ReferenceImage に変換します。
 *
 * ・長辺が MAX_EDGE を超える画像は必ず縮小版を使います
 * ・もともと小さい画像は、JPEG 化してかえって容量が増える場合のみ元のまま使います
 * ・圧縮に失敗した場合は、元の画像をそのまま使います
 */
export async function compressImageFile(
  file: File,
  kind: ReferenceImage['kind'],
): Promise<ReferenceImage> {
  try {
    const source = await loadImageSource(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(source.width, source.height));
    const width = Math.max(1, Math.round(source.width * scale));
    const height = Math.max(1, Math.round(source.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('canvas を利用できません');

    // 透過画像でも白背景で書き出します（JPEG は透過を扱えないため）
    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, width, height);
    context.drawImage(source, 0, 0, width, height);

    if ('close' in source && typeof source.close === 'function') {
      source.close();
    }

    const dataUrl = canvas.toDataURL('image/jpeg', QUALITY);

    // 縮小した場合は必ず縮小版を使います（表示・保存の負荷を下げるため）
    if (scale < 1 || estimateBytes(dataUrl) < file.size) {
      return { id: createId(), name: file.name, dataUrl, kind };
    }
  } catch {
    // 下の「元画像をそのまま使う」処理に進みます
  }

  return { id: createId(), name: file.name, dataUrl: await readAsDataUrl(file), kind };
}
