'use client';

import { Check } from 'lucide-react';

import { MediaFrame } from '@/components/ui/MediaFrame';
import { availabilityLabels, priceLevelLabels } from '@/lib/labels';
import { cn } from '@/lib/utils';
import type { SeasonalFlower } from '@/types';

interface FlowerCardProps {
  flower: SeasonalFlower;
  selected: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

/** 季節の花のカード（STEP 7） */
export function FlowerCard({ flower, selected, onToggle, disabled = false }: FlowerCardProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      aria-disabled={disabled}
      onClick={() => {
        if (!disabled) onToggle();
      }}
      className={cn(
        'relative flex gap-3 overflow-hidden rounded-xl border bg-white p-3 text-left transition-colors',
        selected ? 'border-brand ring-1 ring-brand' : 'border-line hover:border-accent/60',
        disabled && 'opacity-50',
      )}
    >
      <span className="w-20 shrink-0 sm:w-24">
        <MediaFrame
          src={flower.image}
          alt=""
          seed={flower.name}
          ratio="aspect-square"
          className="rounded-lg"
        />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className={cn('text-[15px] font-medium', selected ? 'text-brand' : 'text-ink')}>
            {flower.name}
          </span>
          <span
            aria-hidden="true"
            className={cn(
              'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
              selected ? 'border-brand bg-brand text-brand-fg' : 'border-line bg-white',
            )}
          >
            {selected ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : null}
          </span>
        </span>

        <span className="mt-1 block text-[12.5px] leading-relaxed text-muted">{flower.feature}</span>

        <span className="mt-2 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-surface px-2 py-0.5 text-[10.5px] text-muted">
            主な色：{flower.mainColors}
          </span>
          <span className="rounded-full bg-surface px-2 py-0.5 text-[10.5px] text-muted">
            {priceLevelLabels[flower.priceLevel]}
          </span>
          <span className="rounded-full bg-surface px-2 py-0.5 text-[10.5px] text-muted">
            {availabilityLabels[flower.availability]}
          </span>
        </span>
      </span>
    </button>
  );
}
