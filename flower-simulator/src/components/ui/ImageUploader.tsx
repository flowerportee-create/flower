'use client';

import { useRef, useState } from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';

import { MAX_FILE_SIZE, MAX_IMAGE_COUNT, compressImageFile } from '@/lib/image';
import type { ReferenceImage } from '@/types';

interface ImageUploaderProps {
  label: string;
  hint?: string;
  kind: ReferenceImage['kind'];
  images: ReferenceImage[];
  onChange: (images: ReferenceImage[]) => void;
}

/**
 * 参考画像のアップローダー。
 * 画像はサーバーに送信されず、ブラウザ内で縮小してプレビューするだけです。
 */
export function ImageUploader({ label, hint, kind, images, onChange }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const ownImages = images.filter((image) => image.kind === kind);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setError('');
    setBusy(true);

    try {
      const accepted: ReferenceImage[] = [];
      for (const file of Array.from(fileList)) {
        if (images.length + accepted.length >= MAX_IMAGE_COUNT) {
          setError(`画像は合計${MAX_IMAGE_COUNT}枚までです`);
          break;
        }
        if (!file.type.startsWith('image/')) {
          setError('画像ファイルを選択してください');
          continue;
        }
        if (file.size > MAX_FILE_SIZE) {
          setError('20MBを超える画像は読み込めません');
          continue;
        }
        accepted.push(await compressImageFile(file, kind));
      }
      if (accepted.length > 0) {
        onChange([...images, ...accepted]);
      }
    } catch {
      setError('画像を読み込めませんでした');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function removeImage(id: string) {
    onChange(images.filter((image) => image.id !== id));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-ink">{label}</span>
        <span className="rounded-sm border border-line px-1.5 py-0.5 text-[10px] text-muted">任意</span>
      </div>
      {hint ? <p className="text-xs leading-relaxed text-muted">{hint}</p> : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        aria-label={label}
        onChange={(event) => {
          void handleFiles(event.target.files);
        }}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy || images.length >= MAX_IMAGE_COUNT}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-line bg-surface px-4 py-5 text-sm text-muted transition-colors hover:border-accent/60 disabled:opacity-50"
      >
        {busy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            読み込み中…
          </>
        ) : (
          <>
            <ImagePlus className="h-4 w-4" aria-hidden="true" />
            画像を選ぶ（{images.length} / {MAX_IMAGE_COUNT}枚）
          </>
        )}
      </button>

      {error ? (
        <p role="alert" className="text-xs font-medium text-red-700">
          {error}
        </p>
      ) : null}

      {ownImages.length > 0 ? (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {ownImages.map((image) => (
            <li key={image.id} className="relative overflow-hidden rounded-lg border border-line">
              <div className="aspect-square w-full bg-surface">
                {/* ブラウザ内で生成したプレビュー画像 */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.dataUrl} alt={image.name} className="h-full w-full object-cover" />
              </div>
              <button
                type="button"
                onClick={() => removeImage(image.id)}
                aria-label={`${image.name} を削除`}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-ink shadow-sm"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
