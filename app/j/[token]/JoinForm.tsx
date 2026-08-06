'use client';

import { useActionState, useMemo, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { startJoin } from './actions';
import type { JoinState } from '@/lib/types';
import TagPreview from '@/components/TagPreview';
import {
  AMOUNT_MAX,
  CUSTOM_AMOUNT_MIN,
  UNIT_AMOUNT_OPTIONS,
  tagSizeFor
} from '@/lib/flower';

const initialState: JoinState = { error: null, success: false };

const CUSTOM = 'custom';

function SubmitButton({ amount }: { amount: number }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary w-full">
      {pending
        ? '決済ページへ移動しています…'
        : amount > 0
          ? `${amount.toLocaleString('ja-JP')} 円をカードで支払う`
          : 'カードで支払う'}
    </button>
  );
}

export default function JoinForm({
  token,
  unitAmount,
  tagName,
  existingNames
}: {
  token: string;
  unitAmount: number;
  tagName: string;
  /** 既に確定している連名（プレビューで並びを見せるため） */
  existingNames: { name: string; amount: number }[];
}) {
  const [state, formAction] = useActionState(startJoin, initialState);

  const defaultChoice = UNIT_AMOUNT_OPTIONS.includes(
    unitAmount as (typeof UNIT_AMOUNT_OPTIONS)[number]
  )
    ? String(unitAmount)
    : String(UNIT_AMOUNT_OPTIONS[0]);

  const [choice, setChoice] = useState<string>(defaultChoice);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [name, setName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [includeInTag, setIncludeInTag] = useState(true);

  const amount = useMemo(() => {
    if (choice !== CUSTOM) return Number(choice);
    const parsed = Number(customAmount);
    return Number.isFinite(parsed) ? Math.floor(parsed) : 0;
  }, [choice, customAmount]);

  const size = tagSizeFor(amount);
  const showOnTag = includeInTag && !isAnonymous;

  const previewEntries = useMemo(() => {
    const entries = existingNames.map((entry) => ({ name: entry.name, amount: entry.amount }));
    if (showOnTag) {
      entries.push({ name: name.trim() || 'あなたのお名前', amount });
    }
    // 立て札は金額の大きい方から並べる
    entries.sort((a, b) => b.amount - a.amount);
    return entries
      .slice(0, 8)
      .map((entry) => ({
        ...entry,
        highlight: showOnTag && entry.name === (name.trim() || 'あなたのお名前')
      }));
  }, [existingNames, name, amount, showOnTag]);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="amount" value={amount > 0 ? amount : ''} />

      <div>
        <label htmlFor="name" className="label">
          お名前 <span className="text-red-600">*</span>
        </label>
        <input
          id="name"
          name="name"
          required
          maxLength={60}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input"
          placeholder="花田 はな"
        />
        <p className="hint">領収書のお宛名と、立て札の連名に使われます。</p>
      </div>

      <div>
        <label htmlFor="amount_choice" className="label">
          参加金額 <span className="text-red-600">*</span>
        </label>
        <select
          id="amount_choice"
          value={choice}
          onChange={(e) => setChoice(e.target.value)}
          className="input"
        >
          {UNIT_AMOUNT_OPTIONS.map((value) => (
            <option key={value} value={String(value)}>
              {value.toLocaleString('ja-JP')} 円（{tagSizeFor(value).label}）
            </option>
          ))}
          <option value={CUSTOM}>
            それ以上（{CUSTOM_AMOUNT_MIN.toLocaleString('ja-JP')} 円〜）
          </option>
        </select>

        {choice === CUSTOM && (
          <div className="mt-2">
            <label htmlFor="custom_amount" className="sr-only">
              金額を入力
            </label>
            <input
              id="custom_amount"
              type="number"
              min={CUSTOM_AMOUNT_MIN}
              max={AMOUNT_MAX}
              step={1}
              inputMode="numeric"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="input"
              placeholder={CUSTOM_AMOUNT_MIN.toLocaleString('ja-JP')}
            />
            <p className="hint">
              {CUSTOM_AMOUNT_MIN.toLocaleString('ja-JP')} 円以上{' '}
              {AMOUNT_MAX.toLocaleString('ja-JP')} 円以下でご入力ください。
            </p>
          </div>
        )}

        {unitAmount > 0 && (
          <p className="hint">
            幹事の方のおすすめは {unitAmount.toLocaleString('ja-JP')} 円です。
          </p>
        )}
      </div>

      {/* 立て札のイメージ */}
      <div className="space-y-3 rounded-2xl border border-ivory bg-white p-4">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-serif text-base text-ink">立て札のイメージ</h3>
          <span className="rounded-full bg-sakura px-3 py-0.5 text-xs text-ink">
            お名前の大きさ：{size.label}
          </span>
        </div>
        <p className="text-xs leading-relaxed text-muted">
          ご参加金額が大きいほど、立て札のお名前を大きくお入れします。{size.description}
        </p>

        {showOnTag ? (
          <TagPreview headline={tagName ? undefined : '祝'} entries={previewEntries} />
        ) : (
          <p className="rounded-xl bg-ivory/60 px-4 py-6 text-center text-sm text-muted">
            {isAnonymous
              ? '匿名でのご参加のため、立て札にお名前は入りません。'
              : '「札名にお名前を掲載してもよい」を選ぶと、立て札のイメージが表示されます。'}
          </p>
        )}

        <p className="text-xs leading-relaxed text-muted">
          実際の書体・配置は花屋がお仕立てします。連名が多い場合は「〇〇一同」にまとめさせていただくことがあります。
        </p>
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
            checked={includeInTag}
            onChange={(e) => setIncludeInTag(e.target.checked)}
            disabled={isAnonymous}
            className="mt-0.5 h-4 w-4 rounded border-ivory text-moss focus:ring-moss/30 disabled:opacity-40"
          />
          <span className="text-sm leading-relaxed text-ink">
            札名にお名前を掲載してもよい
            <span className="block text-xs text-muted">お花に添える立札の連名に使用されます。</span>
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

      <div className="space-y-2">
        <SubmitButton amount={amount} />
        <p className="text-center text-xs leading-relaxed text-muted">
          Square の決済ページへ移動します。カード情報は当サイトでは取り扱いません。
          <br />
          お支払いが完了すると、ご参加が確定します。
        </p>
      </div>
    </form>
  );
}
