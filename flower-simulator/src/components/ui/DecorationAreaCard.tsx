'use client';

import { Check } from 'lucide-react';

import { priorityLabels } from '@/lib/labels';
import { cn } from '@/lib/utils';
import type { AreaPriority, DecorationArea } from '@/types';

interface DecorationAreaCardProps {
  area: DecorationArea;
  selected: boolean;
  priority: AreaPriority;
  onToggle: () => void;
  onPriorityChange: (priority: AreaPriority) => void;
}

const priorityOrder: AreaPriority[] = ['high', 'medium', 'low'];

/** 装花場所のカード。選択すると重要度を選べるようになります（STEP 8） */
export function DecorationAreaCard({
  area,
  selected,
  priority,
  onToggle,
  onPriorityChange,
}: DecorationAreaCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border bg-white transition-colors',
        selected ? 'border-brand ring-1 ring-brand' : 'border-line',
      )}
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={selected}
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-3 p-4 text-left"
      >
        <span className="min-w-0">
          <span className={cn('block text-[15px] font-medium', selected ? 'text-brand' : 'text-ink')}>
            {area.name}
          </span>
          <span className="mt-1 block text-[12.5px] leading-relaxed text-muted">
            {area.description}
          </span>
        </span>
        <span
          aria-hidden="true"
          className={cn(
            'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
            selected ? 'border-brand bg-brand text-brand-fg' : 'border-line bg-white',
          )}
        >
          {selected ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : null}
        </span>
      </button>

      {selected ? (
        <div className="border-t border-line px-4 py-3">
          <p className="mb-2 text-[12px] text-muted">重要度</p>
          <div role="radiogroup" aria-label={`${area.name}の重要度`} className="grid grid-cols-3 gap-1.5">
            {priorityOrder.map((value) => {
              const isCurrent = priority === value;
              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={isCurrent}
                  onClick={() => onPriorityChange(value)}
                  className={cn(
                    'rounded-md border px-2 py-2 text-[12px] transition-colors',
                    isCurrent
                      ? 'border-accent bg-accent/10 font-medium text-ink'
                      : 'border-line bg-white text-muted hover:border-accent/60',
                  )}
                >
                  {priorityLabels[value]}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
