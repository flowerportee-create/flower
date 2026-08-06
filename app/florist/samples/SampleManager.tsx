'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useRef, useState, useTransition } from 'react';
import { createClient } from '@/lib/supabase/client';
import FlowerImage from '@/components/FlowerImage';
import type { FlowerSample } from '@/lib/types';
import {
  ARRANGEMENTS,
  COLOR_THEMES,
  PURPOSES,
  arrangementLabel,
  colorLabel,
  defaultArrangement,
  purposeLabel,
  type ArrangementKind
} from '@/lib/flower';
import { deleteSample, registerSample } from '../actions';

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function SampleManager({ samples }: { samples: FlowerSample[] }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [purpose, setPurpose] = useState<string>(PURPOSES[0].key);
  const [colorKey, setColorKey] = useState<string>(COLOR_THEMES[0].key);
  const [arrangement, setArrangement] = useState<ArrangementKind>(
    defaultArrangement(PURPOSES[0].key)
  );
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const existing = useMemo(
    () =>
      samples.filter(
        (s) => s.purpose === purpose && s.color_key === colorKey && s.arrangement === arrangement
      ),
    [samples, purpose, colorKey, arrangement]
  );

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

    const extension =
      file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
    const path = `samples/${purpose}-${colorKey}-${arrangement}/${crypto.randomUUID()}.${extension}`;

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

    const result = await registerSample({
      purpose,
      colorKey,
      arrangement,
      storagePath: path,
      publicUrl,
      caption
    });

    if (result.error) {
      await supabase.storage.from('flower-photos').remove([path]);
      setError(result.error);
    } else {
      setCaption('');
    }

    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
    router.refresh();
  }

  function handleDelete(sampleId: string) {
    if (!confirm('この見本写真を削除しますか？')) return;
    startTransition(async () => {
      const result = await deleteSample(sampleId);
      if (result.error) setError(result.error);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <section className="card">
        <h2 className="font-serif text-lg text-ink">見本写真を登録する</h2>
        <p className="hint mt-1">
          用途と色の組み合わせごとに写真を登録すると、参加者に見せるイメージが実際のお仕立て例に切り替わります。
          未登録の組み合わせでは、色に合わせたイラストが表示されます。
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="s_purpose" className="label">
              用途
            </label>
            <select
              id="s_purpose"
              className="input"
              value={purpose}
              onChange={(e) => {
                setPurpose(e.target.value);
                setArrangement(defaultArrangement(e.target.value));
              }}
            >
              {PURPOSES.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="s_arrangement" className="label">
              花の形
            </label>
            <select
              id="s_arrangement"
              className="input"
              value={arrangement}
              onChange={(e) => setArrangement(e.target.value as ArrangementKind)}
            >
              {ARRANGEMENTS.map((a) => (
                <option key={a.key} value={a.key}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="s_color" className="label">
            色
          </label>
          <select
            id="s_color"
            className="input"
            value={colorKey}
            onChange={(e) => setColorKey(e.target.value)}
          >
            {COLOR_THEMES.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4">
          <label htmlFor="s_caption" className="label">
            ひとこと説明
          </label>
          <input
            id="s_caption"
            className="input"
            maxLength={120}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="白の胡蝶蘭に季節のグリーンを添えて"
          />
          <p className="hint">参加ページで写真の下に表示されます。空欄でも構いません。</p>
        </div>

        <div className="mt-4 rounded-2xl border border-ivory bg-white p-4">
          <p className="text-sm text-ink">
            現在の表示：{purposeLabel(purpose)}／{colorLabel(colorKey)}／
            {arrangementLabel(arrangement)}
          </p>
          <div className="mx-auto mt-3 max-w-[220px]">
            <FlowerImage
              colorKey={colorKey}
              arrangement={arrangement}
              photoUrl={existing[0]?.public_url ?? null}
              alt="現在この組み合わせで表示される画像"
            />
          </div>
          <p className="hint mt-2 text-center">
            {existing.length > 0
              ? '登録済みの写真が表示されています。'
              : 'まだ写真がないため、イラストが表示されています。'}
          </p>
        </div>

        <div className="mt-4">
          <label htmlFor="sample_file" className="btn-secondary cursor-pointer">
            {uploading ? 'アップロード中…' : '写真を登録'}
          </label>
          <input
            ref={inputRef}
            id="sample_file"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleUpload}
            disabled={uploading}
            className="sr-only"
          />
          <p className="hint">JPEG・PNG・WebP形式、8MBまで。</p>
        </div>

        {error && (
          <p role="alert" className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
      </section>

      <section className="card">
        <h2 className="font-serif text-lg text-ink">登録済みの見本写真</h2>
        {samples.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">
            まだ登録がありません。すべてイラストで表示されています。
          </p>
        ) : (
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {samples.map((sample) => (
              <li
                key={sample.id}
                className="overflow-hidden rounded-2xl border border-ivory bg-white"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={sample.public_url}
                  alt={`${purposeLabel(sample.purpose)}／${colorLabel(sample.color_key)}の見本`}
                  className="aspect-square w-full object-cover"
                />
                <div className="px-2 pt-2">
                  <p className="text-xs leading-snug text-ink">
                    {purposeLabel(sample.purpose)}
                  </p>
                  <p className="text-[11px] leading-snug text-muted">
                    {colorLabel(sample.color_key)}／{arrangementLabel(sample.arrangement)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(sample.id)}
                  disabled={pending}
                  className="mt-2 w-full border-t border-ivory py-2 text-xs text-muted hover:text-red-600 disabled:opacity-50"
                >
                  削除
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
