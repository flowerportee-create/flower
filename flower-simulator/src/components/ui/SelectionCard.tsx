'use client';

import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';

interface SelectionCardProps {
  /** カードの見出し */
  title: string;
  /** 補足説明（任意） */
  description?: string;
  selected: boolean;
  onToggle: () => void;
  /** 複数選択かどうか（読み上げソフト向けの役割が変わります） */
  multiple?: boolean;
  className?: string;
  children?: React.ReactNode;
}

/** 文字だけの選択カード（テキストの選択肢で使用） */
export function SelectionCard({
  title,
  description,
  selected,
  onToggle,
  multiple = false,
  className,
  children,
}: SelectionCardProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      role={multiple ? 'checkbox' : 'radio'}
      aria-checked={selected}
      className={cn(
        'group relative w-full rounded-xl border bg-white p-4 text-left transition-colors',
        'hover:border-accent/60',
        selected
          ? 'border-brand bg-brand/[0.06] ring-1 ring-brand'
          : 'border-line',
        className,
      )}
    >
      <span className="flex items-start justify-between gap-3">
        <span className="min-w-0">
          <span className={cn('block text-[15px] font-medium', selected ? 'text-brand' : 'text-ink')}>
            {title}
          </span>
          {description ? (
            <span className="mt-1 block text-[13px] leading-relaxed text-muted">{description}</span>
          ) : null}
        </span>
        <span
          aria-hidden="true"
          className={cn(
            'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors',
            selected ? 'border-brand bg-brand text-brand-fg' : 'border-line bg-white',
          )}
        >
          {selected ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : null}
        </span>
      </span>
      {children}
    </button>
  );
}
