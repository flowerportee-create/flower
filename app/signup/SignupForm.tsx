'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { UserRole } from '@/lib/types';

const ROLES: { value: UserRole; label: string; description: string }[] = [
  { value: 'organizer', label: '幹事', description: 'お祝い花の企画を立てて取りまとめる方' },
  { value: 'florist', label: '花屋', description: 'ご注文を受けてお花を制作する方' }
];

export default function SignupForm() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('organizer');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);

    if (password.length < 8) {
      setError('パスワードは8文字以上で設定してください。');
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName, role } }
    });

    if (signUpError) {
      setError('登録できませんでした。入力内容をご確認ください。');
      setLoading(false);
      return;
    }

    if (!data.session) {
      setNotice('確認メールをお送りしました。メール内のリンクから登録を完了してください。');
      setLoading(false);
      return;
    }

    router.replace(role === 'florist' ? '/florist' : '/organizer');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <fieldset>
        <legend className="label">ご利用の立場</legend>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {ROLES.map((option) => (
            <label
              key={option.value}
              className={`cursor-pointer rounded-xl border p-3 transition ${
                role === option.value
                  ? 'border-moss bg-moss/5'
                  : 'border-ivory bg-white hover:bg-ivory/40'
              }`}
            >
              <input
                type="radio"
                name="role"
                value={option.value}
                checked={role === option.value}
                onChange={() => setRole(option.value)}
                className="sr-only"
              />
              <span className="block text-sm font-medium text-ink">{option.label}</span>
              <span className="mt-0.5 block text-xs leading-relaxed text-muted">
                {option.description}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="displayName" className="label">
          お名前 / 店舗名
        </label>
        <input
          id="displayName"
          required
          maxLength={60}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="input"
          placeholder="花田 はな"
        />
      </div>

      <div>
        <label htmlFor="email" className="label">
          メールアドレス
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input"
          placeholder="hana@example.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="label">
          パスワード
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input"
        />
        <p className="hint">8文字以上で設定してください。</p>
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="rounded-xl bg-moss/10 px-3 py-2 text-sm text-moss">
          {notice}
        </p>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? '登録中…' : '登録する'}
      </button>
    </form>
  );
}
