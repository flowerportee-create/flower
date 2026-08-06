'use client';

import { Check } from 'lucide-react';

import type { ColorOption } from '@/types';
import { cn } from '@/lib/utils';

interface ColorPickerCardProps {
  color: ColorOption;
  selected: boolean;
  onToggle: () => void;
  multiple?: boolean;
}

/** 色見本のチップ。色は shop.ts の colors で追加・変更できます。 */
export function ColorPickerCard({ color, selected, onToggle, multiple = false }: ColorPickerCardProps) {
  const background = color.gradient
    ? `linear-gradient(135deg, ${color.gradient.join(', ')})`
    : color.hex;

  return (
    <button
      type="button"
      role={multiple ? 'checkbox' : 'radio'}
      aria-checked={selected}
      onClick={onToggle}
      className={cn(
        'flex flex-col items-center gap-1.5 rounded-lg border p-2 transition-colors',
        selected ? 'border-brand bg-brand/[0.06] ring-1 ring-brand' : 'border-line bg-white hover:border-accent/60',
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'relative flex h-11 w-11 items-center justify-center rounded-full',
          color.isLight ? 'border border-line' : 'border border-black/5',
        )}
        style={{ background }}
      >
        {selected ? (
          <Check
            className={cn('h-4 w-4', color.isLight ? 'text-ink' : 'text-white')}
            strokeWidth={3}
          />
        ) : null}
      </span>
      <span className={cn('text-[11.5px] leading-tight', selected ? 'font-medium text-brand' : 'text-ink')}>
        {color.name}
      </span>
    </button>
  );
}

/** 選択された色を並べて表示するパレット（結果画面・STEP6で使用） */
export function ColorPalette({
  colors,
  emptyText = '未選択',
}: {
  colors: ColorOption[];
  emptyText?: string;
}) {
  if (colors.length === 0) {
    return <p className="text-[13px] text-muted">{emptyText}</p>;
  }

  return (
    <div className="flex flex-wrap gap-3">
      {colors.map((color) => (
        <div key={color.id} className="flex flex-col items-center gap-1">
          <span
            aria-hidden="true"
            className={cn(
              'block h-12 w-12 rounded-full',
              color.isLight ? 'border border-line' : 'border border-black/5',
            )}
            style={{
              background: color.gradient
                ? `linear-gradient(135deg, ${color.gradient.join(', ')})`
                : color.hex,
            }}
          />
          <span className="text-[11px] text-muted">{color.name}</span>
        </div>
      ))}
    </div>
  );
}
