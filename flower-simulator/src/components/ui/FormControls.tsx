'use client';

import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

/* -------------------------------------------------------------------------- */
/* ラベル付きの入力欄の枠                                                      */
/* -------------------------------------------------------------------------- */

interface FieldProps {
  label: string;
  /** 必須項目に「必須」バッジを表示します */
  required?: boolean;
  /** 入力欄の下に出す補足説明 */
  hint?: string;
  /** バリデーションエラーの文言 */
  error?: string;
  htmlFor?: string;
  children: ReactNode;
}

export function Field({ label, required, hint, error, htmlFor, children }: FieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="flex items-center gap-2 text-sm font-medium text-ink">
        {label}
        {required ? (
          <span className="rounded-sm bg-brand px-1.5 py-0.5 text-[10px] font-medium text-brand-fg">
            必須
          </span>
        ) : (
          <span className="rounded-sm border border-line px-1.5 py-0.5 text-[10px] text-muted">任意</span>
        )}
      </label>
      {children}
      {hint ? <p className="text-xs leading-relaxed text-muted">{hint}</p> : null}
      {/*
        エラー表示の場所は、エラーが無いときも高さを確保しておきます。
        こうしないと、エラーが出たり消えたりするたびに下の選択肢がずれて、
        タップした場所と違う項目が選ばれてしまうことがあります。
      */}
      <div className="min-h-[1.125rem]">
        {error ? (
          <p role="alert" className="text-xs font-medium text-red-700">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* テキスト入力・数値入力・テキストエリア                                      */
/* -------------------------------------------------------------------------- */

const inputClass =
  'w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-[15px] text-ink placeholder:text-muted/70 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand';

export function TextInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(inputClass, className)} />;
}

export function TextArea({ className, rows = 4, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} rows={rows} className={cn(inputClass, 'leading-relaxed', className)} />;
}

/* -------------------------------------------------------------------------- */
/* 単一選択（ボタン型のラジオ）                                                */
/* -------------------------------------------------------------------------- */

interface ChoiceGroupProps<T extends string> {
  options: { value: T; label: string }[];
  value: T | '';
  onChange: (value: T) => void;
  /** グループ全体の説明（読み上げソフト用） */
  ariaLabel: string;
  /** 1行に並べる数（スマートフォン表示） */
  columns?: 1 | 2 | 3;
}

export function ChoiceGroup<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  columns = 2,
}: ChoiceGroupProps<T>) {
  const gridClass = columns === 1 ? 'grid-cols-1' : columns === 3 ? 'grid-cols-3' : 'grid-cols-2';

  return (
    <div role="radiogroup" aria-label={ariaLabel} className={cn('grid gap-2', gridClass)}>
      {options.map((option) => {
        const selected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              'rounded-lg border px-3 py-2.5 text-[14px] transition-colors',
              selected
                ? 'border-brand bg-brand/[0.06] font-medium text-brand ring-1 ring-brand'
                : 'border-line bg-white text-ink hover:border-accent/60',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* タグ（複数選択）                                                            */
/* -------------------------------------------------------------------------- */

interface TagButtonProps {
  label: string;
  selected: boolean;
  onToggle: () => void;
}

export function TagButton({ label, selected, onToggle }: TagButtonProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      onClick={onToggle}
      className={cn(
        'rounded-full border px-3.5 py-1.5 text-[13px] transition-colors',
        selected
          ? 'border-brand bg-brand text-brand-fg'
          : 'border-line bg-white text-ink hover:border-accent/60',
      )}
    >
      {label}
    </button>
  );
}
