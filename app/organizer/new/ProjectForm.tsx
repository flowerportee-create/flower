'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { createProject } from '../actions';
import type { FormState } from '@/lib/types';
import FlowerImage from '@/components/FlowerImage';
import {
  ARRANGEMENTS,
  COLOR_THEMES,
  CUSTOM_AMOUNT_MIN,
  PURPOSES,
  UNIT_AMOUNT_OPTIONS,
  arrangementLabel,
  colorLabel,
  defaultArrangement,
  purposeLabel,
  tagSizeFor,
  type ArrangementKind
} from '@/lib/flower';

const initialState: FormState = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary w-full sm:w-auto">
      {pending ? '作成中…' : '企画を作成して共有URLを発行'}
    </button>
  );
}

export default function ProjectForm() {
  const [state, formAction] = useActionState(createProject, initialState);
  const [purpose, setPurpose] = useState<string>(PURPOSES[0].key);
  const [arrangement, setArrangement] = useState<ArrangementKind>(
    defaultArrangement(PURPOSES[0].key)
  );
  const [colorKey, setColorKey] = useState<string>(COLOR_THEMES[0].key);

  return (
    <form action={formAction} className="space-y-6">
      <section className="card space-y-4">
        <h2 className="font-serif text-lg text-ink">基本情報</h2>

        <div>
          <label htmlFor="title" className="label">
            企画名 <span className="text-red-600">*</span>
          </label>
          <input id="title" name="title" required maxLength={80} className="input" placeholder="山田部長 ご栄転祝い" />
        </div>

        <div>
          <label htmlFor="recipient_name" className="label">
            贈り先名 <span className="text-red-600">*</span>
          </label>
          <input
            id="recipient_name"
            name="recipient_name"
            required
            maxLength={80}
            className="input"
            placeholder="山田 太郎"
          />
        </div>

        <div>
          <label htmlFor="delivery_address" className="label">
            お届け先 <span className="text-red-600">*</span>
          </label>
          <textarea
            id="delivery_address"
            name="delivery_address"
            required
            maxLength={300}
            className="textarea"
            placeholder="東京都世田谷区◯◯1-2-3 ◯◯ビル 3F 株式会社◯◯"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="delivery_date" className="label">
              お届け希望日 <span className="text-red-600">*</span>
            </label>
            <input id="delivery_date" name="delivery_date" type="date" required className="input" />
          </div>
          <div>
            <label htmlFor="entry_deadline" className="label">
              参加締切 <span className="text-red-600">*</span>
            </label>
            <input id="entry_deadline" name="entry_deadline" type="date" required className="input" />
          </div>
        </div>
      </section>

      <section className="card space-y-4">
        <h2 className="font-serif text-lg text-ink">金額</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="target_amount" className="label">
              目標金額（円）
            </label>
            <input
              id="target_amount"
              name="target_amount"
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              className="input"
              placeholder="30000"
            />
          </div>
          <div>
            <label htmlFor="unit_amount" className="label">
              おすすめの一口金額
            </label>
            <select id="unit_amount" name="unit_amount" className="input" defaultValue="10000">
              {UNIT_AMOUNT_OPTIONS.map((value) => (
                <option key={value} value={String(value)}>
                  {value.toLocaleString('ja-JP')} 円（立て札：{tagSizeFor(value).label}）
                </option>
              ))}
            </select>
            <p className="hint">参加ページで最初に選ばれている金額になります。</p>
          </div>
        </div>

        <div className="space-y-2 rounded-xl bg-ivory/60 px-4 py-3">
          <p className="text-xs leading-relaxed text-muted">
            参加者は Square のカード決済でお支払いいただきます。参加金額は
            {UNIT_AMOUNT_OPTIONS.map((v) => v.toLocaleString('ja-JP')).join(' / ')} 円、
            および {CUSTOM_AMOUNT_MIN.toLocaleString('ja-JP')} 円以上の自由入力から選べます。
          </p>
          <p className="text-xs leading-relaxed text-muted">
            金額が大きいほど、立て札のお名前を大きくお入れします。
          </p>
        </div>
      </section>

      <section className="card space-y-4">
        <h2 className="font-serif text-lg text-ink">お花のご希望</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="purpose" className="label">
              用途
            </label>
            <select
              id="purpose"
              name="purpose"
              className="input"
              value={purpose}
              onChange={(e) => {
                setPurpose(e.target.value);
                // 用途を変えたら、その用途の定番の形に合わせる
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
            <label htmlFor="arrangement" className="label">
              花の形
            </label>
            <select
              id="arrangement"
              name="arrangement"
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

        <div>
          <label htmlFor="color_preference" className="label">
            希望カラー
          </label>
          <select
            id="color_preference"
            name="color_preference"
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

        <div className="rounded-2xl border border-ivory bg-white p-4">
          <p className="text-sm text-ink">仕上がりのイメージ</p>
          <div className="mx-auto mt-3 max-w-[240px]">
            <FlowerImage
              colorKey={colorKey}
              arrangement={arrangement}
              alt={`${purposeLabel(purpose)}向け、${colorLabel(colorKey)}の${arrangementLabel(
                arrangement
              )}のイメージ`}
            />
          </div>
          <p className="hint mt-2 text-center">
            イメージです。実際のお花の種類・本数はお届け時期により変わります。
          </p>
        </div>

        <div>
          <label htmlFor="flower_type" className="label">
            花の種類（補足）
          </label>
          <input
            id="flower_type"
            name="flower_type"
            maxLength={80}
            className="input"
            placeholder="胡蝶蘭 3本立 / スタンド花 1段 など"
          />
          <p className="hint">ご希望が決まっていれば記入してください。空欄でも構いません。</p>
        </div>

        <div>
          <label htmlFor="tag_name" className="label">
            札名
          </label>
          <input
            id="tag_name"
            name="tag_name"
            maxLength={120}
            className="input"
            placeholder="株式会社◯◯ 営業部一同"
          />
          <p className="hint">参加者の氏名を連名にする場合は、管理画面の一覧をご活用ください。</p>
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
            placeholder="ご栄転おめでとうございます。"
          />
        </div>

        <div>
          <label htmlFor="note" className="label">
            備考
          </label>
          <textarea
            id="note"
            name="note"
            maxLength={500}
            className="textarea"
            placeholder="午前中着でお願いします / 受付にお声がけください など"
          />
          <p className="hint">花屋の管理画面にのみ表示されます。</p>
        </div>
      </section>

      {state.error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
