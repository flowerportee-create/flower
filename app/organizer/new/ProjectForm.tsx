'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { createProject } from '../actions';
import type { FormState } from '@/lib/types';

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
              step={100}
              inputMode="numeric"
              className="input"
              placeholder="30000"
            />
          </div>
          <div>
            <label htmlFor="unit_amount" className="label">
              一口金額（円）
            </label>
            <input
              id="unit_amount"
              name="unit_amount"
              type="number"
              min={0}
              step={100}
              inputMode="numeric"
              className="input"
              placeholder="1000"
            />
            <p className="hint">参加者の入力欄に初期値として表示されます。</p>
          </div>
        </div>

        <p className="rounded-xl bg-ivory/60 px-3 py-2 text-xs leading-relaxed text-muted">
          オンライン決済機能はありません。集金は幹事の皆さまでお願いいたします。
        </p>
      </section>

      <section className="card space-y-4">
        <h2 className="font-serif text-lg text-ink">お花のご希望</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="flower_type" className="label">
              花の種類
            </label>
            <input
              id="flower_type"
              name="flower_type"
              maxLength={80}
              className="input"
              placeholder="胡蝶蘭 / スタンド花 など"
            />
          </div>
          <div>
            <label htmlFor="color_preference" className="label">
              希望カラー
            </label>
            <input
              id="color_preference"
              name="color_preference"
              maxLength={80}
              className="input"
              placeholder="白・グリーン系"
            />
          </div>
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
