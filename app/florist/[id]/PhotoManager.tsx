'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState, useTransition } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { ProjectPhoto } from '@/lib/types';
import { deletePhoto, registerPhoto } from '../actions';

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function PhotoManager({
  projectId,
  photos
}: {
  projectId: string;
  photos: ProjectPhoto[];
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('JPEG・PNG・WebP形式の画像をお選びください。');
      return;
    }

    if (file.size > MAX_BYTES) {
      setError('ファイルサイズは8MB以内にしてください。');
      return;
    }

    setUploading(true);

    const extension = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
    const path = `${projectId}/${crypto.randomUUID()}.${extension}`;

    const supabase = createClient();
    const { error: uploadError } = await supabase.storage
      .from('flower-photos')
      .upload(path, file, { contentType: file.type, upsert: false });

    if (uploadError) {
      setError('アップロードできませんでした。時間をおいて再度お試しください。');
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    const {
      data: { publicUrl }
    } = supabase.storage.from('flower-photos').getPublicUrl(path);

    const result = await registerPhoto(projectId, path, publicUrl);
    if (result.error) {
      await supabase.storage.from('flower-photos').remove([path]);
      setError(result.error);
    }

    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
    router.refresh();
  }

  function handleDelete(photoId: string) {
    if (!confirm('この写真を削除しますか？')) return;
    startTransition(async () => {
      const result = await deletePhoto(projectId, photoId);
      if (result.error) setError(result.error);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {photos.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((photo) => (
            <li key={photo.id} className="overflow-hidden rounded-2xl border border-ivory bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.public_url}
                alt="完成したお花"
                className="aspect-square w-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleDelete(photo.id)}
                disabled={pending}
                className="w-full py-2 text-xs text-muted hover:text-red-600 disabled:opacity-50"
              >
                削除
              </button>
            </li>
          ))}
        </ul>
      )}

      <div>
        <label htmlFor="photo" className="btn-secondary cursor-pointer">
          {uploading ? 'アップロード中…' : '写真を追加'}
        </label>
        <input
          ref={inputRef}
          id="photo"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleUpload}
          disabled={uploading}
          className="sr-only"
        />
        <p className="hint">JPEG・PNG・WebP形式、8MBまで。</p>
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
