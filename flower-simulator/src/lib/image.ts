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

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('ファイルを読み込めませんでした'));
    reader.readAsDataURL(file);
  });
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('画像を表示できませんでした'));
    image.src = dataUrl;
  });
}

/**
 * 画像ファイルを縮小して ReferenceImage に変換します。
 * 圧縮に失敗した場合は、元のデータURLをそのまま使います。
 */
export async function compressImageFile(
  file: File,
  kind: ReferenceImage['kind'],
): Promise<ReferenceImage> {
  const originalDataUrl = await readAsDataUrl(file);

  try {
    const image = await loadImage(originalDataUrl);
    const scale = Math.min(1, MAX_EDGE / Math.max(image.width, image.height));
    const width = Math.round(image.width * scale);
    const height = Math.round(image.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('canvas を利用できません');

    // 透過画像でも白背景で書き出します（JPEG は透過を扱えないため）
    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    const dataUrl = canvas.toDataURL('image/jpeg', QUALITY);
    return {
      id: createId(),
      name: file.name,
      dataUrl: dataUrl.length < originalDataUrl.length ? dataUrl : originalDataUrl,
      kind,
    };
  } catch {
    return { id: createId(), name: file.name, dataUrl: originalDataUrl, kind };
  }
}
