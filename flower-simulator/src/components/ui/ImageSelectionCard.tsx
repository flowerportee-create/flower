'use client';

import { Check } from 'lucide-react';

import { MediaFrame } from '@/components/ui/MediaFrame';
import { cn } from '@/lib/utils';

interface ImageSelectionCardProps {
  title: string;
  description?: string;
  image?: string;
  selected: boolean;
  onToggle: () => void;
  multiple?: boolean;
}

/** 画像付きの選択カード（シーン・テイストで使用） */
export function ImageSelectionCard({
  title,
  description,
  image,
  selected,
  onToggle,
  multiple = false,
}: ImageSelectionCardProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      role={multiple ? 'checkbox' : 'radio'}
      aria-checked={selected}
      className={cn(
        'group relative overflow-hidden rounded-xl border bg-white text-left transition-colors',
        'hover:border-accent/60',
        selected ? 'border-brand ring-1 ring-brand' : 'border-line',
      )}
    >
      <MediaFrame src={image} alt="" seed={title} ratio="aspect-[4/3]" />

      {selected ? (
        <span
          aria-hidden="true"
          className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-brand text-brand-fg shadow-sm"
        >
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        </span>
      ) : null}

      <span className="block px-3 py-3">
        <span className={cn('block text-sm font-medium', selected ? 'text-brand' : 'text-ink')}>
          {title}
        </span>
        {description ? (
          <span className="mt-1 block text-[12px] leading-relaxed text-muted">{description}</span>
        ) : null}
      </span>
    </button>
  );
}
