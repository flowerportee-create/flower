'use client';

import { useActionState, useMemo, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { startJoin } from './actions';
import type { JoinState } from '@/lib/types';
import {
  AMOUNT_MAX,
  CUSTOM_AMOUNT_MIN,
  TAG_STYLES,
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
  unitAmount
}: {
  token: string;
  unitAmount: number;
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
  const [title, setTitle] = useState('');
  const [tagStyle, setTagStyle] = useState<string>('name');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const amount = useMemo(() => {
    if (choice !== CUSTOM) return Number(choice);
    const parsed = Number(customAmount);
    return Number.isFinite(parsed) ? Math.floor(parsed) : 0;
  }, [choice, customAmount]);

  const size = tagSizeFor(amount);

  // 選んだ載せ方で、実際に立て札へ入る文字列
  const tagLinePreview = useMemo(() => {
    if (isAnonymous || tagStyle === 'none') return null;
    const t = title.trim();
    const n = name.trim() || 'お名前';
    return tagStyle === 'title_name' && t ? `${t} ${n}` : n;
  }, [isAnonymous, tagStyle, title, name]);

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
          placeholder="山田 太郎"
        />
        <p className="hint">領収書のお宛名と、立て札の連名に使われます。</p>
      </div>

      <div>
        <label htmlFor="title" className="label">
          肩書き・役職
        </label>
        <input
          id="title"
          name="title"
          maxLength={40}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input"
          placeholder="営業部長"
        />
        <p className="hint">立て札でお名前の前に入ります。不要な場合は空欄で構いません。</p>
      </div>

      <div>
        <label htmlFor="tag_style" className="label">
          立て札への載せ方 <span className="text-red-600">*</span>
        </label>
        <select
          id="tag_style"
          name="tag_style"
          className="input"
          value={tagStyle}
          onChange={(e) => setTagStyle(e.target.value)}
          disabled={isAnonymous}
        >
          {TAG_STYLES.map((style) => (
            <option key={style.key} value={style.key}>
              {style.label}
            </option>
          ))}
        </select>

        <div className="mt-2 rounded-xl bg-ivory/60 px-4 py-3">
          {tagLinePreview ? (
            <>
              <p className="text-xs text-muted">立て札にはこう入ります</p>
              <p className="mt-1 font-serif text-base text-ink">{tagLinePreview}</p>
              <p className="hint mt-1">
                お名前の大きさ：{size.label}。{size.description}
              </p>
            </>
          ) : (
            <p className="text-xs leading-relaxed text-muted">
              {isAnonymous
                ? '匿名でのご参加のため、立て札にお名前は入りません。'
                : '立て札にお名前は入りません。'}
            </p>
          )}
        </div>

        <p className="hint">
          連名が多い場合は「〇〇一同」にまとめさせていただくことがあります。
        </p>
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
              {value.toLocaleString('ja-JP')} 円（立て札：{tagSizeFor(value).label}）
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

      <div className="rounded-2xl bg-ivory/50 p-4">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            name="is_anonymous"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-ivory text-moss focus:ring-moss/30"
          />
          <span className="text-sm leading-relaxed text-ink">
            匿名で参加する
            <span className="block text-xs text-muted">
              参加者一覧では「匿名希望」と表示され、立て札にも掲載されません。
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
