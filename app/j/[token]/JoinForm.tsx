'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { joinProject } from './actions';
import type { JoinState } from '@/lib/types';

const initialState: JoinState = { error: null, success: false };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary w-full">
      {pending ? '送信中…' : '参加を登録する'}
    </button>
  );
}

export default function JoinForm({
  token,
  unitAmount
}: {
  token: string;
  unitAmount: number;
}) {
  const [state, formAction] = useActionState(joinProject, initialState);
  const [isAnonymous, setIsAnonymous] = useState(false);

  if (state.success) {
    return (
      <div className="rounded-2xl bg-moss/10 p-6 text-center">
        <p className="font-serif text-lg text-ink">ご参加ありがとうございます</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          登録が完了しました。
          <br />
          お支払い方法は幹事の方のご案内をご確認ください。
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />

      <div>
        <label htmlFor="name" className="label">
          お名前 <span className="text-red-600">*</span>
        </label>
        <input id="name" name="name" required maxLength={60} className="input" placeholder="花田 はな" />
        <p className="hint">幹事の方が集金の際に確認します。</p>
      </div>

      <div>
        <label htmlFor="amount" className="label">
          参加金額（円） <span className="text-red-600">*</span>
        </label>
        <input
          id="amount"
          name="amount"
          type="number"
          required
          min={1}
          step={1}
          inputMode="numeric"
          defaultValue={unitAmount > 0 ? unitAmount : undefined}
          className="input"
          placeholder="1000"
        />
        {unitAmount > 0 && <p className="hint">一口 {unitAmount.toLocaleString('ja-JP')} 円です。</p>}
      </div>

      <div>
        <label htmlFor="message" className="label">
          メッセージ
        </label>
        <textarea
          id="message"
          name="message"
          maxLength={500}
          className="textarea"
          placeholder="ご栄転おめでとうございます。新天地でのご活躍をお祈りしております。"
        />
        <p className="hint">贈り先へのメッセージとしてまとめてお伝えします。</p>
      </div>

      <div className="space-y-3 rounded-2xl bg-ivory/50 p-4">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            name="include_in_tag"
            defaultChecked
            disabled={isAnonymous}
            className="mt-0.5 h-4 w-4 rounded border-ivory text-moss focus:ring-moss/30 disabled:opacity-40"
          />
          <span className="text-sm leading-relaxed text-ink">
            札名にお名前を掲載してもよい
            <span className="block text-xs text-muted">
              お花に添える立札の連名に使用されます。
            </span>
          </span>
        </label>

        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            name="is_anonymous"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-ivory text-moss focus:ring-moss/30"
          />
          <span className="text-sm leading-relaxed text-ink">
            匿名で表示する
            <span className="block text-xs text-muted">
              参加者一覧では「匿名希望」と表示され、札名にも掲載されません。
            </span>
          </span>
        </label>
      </div>

      {state.error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
