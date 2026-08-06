import { Info } from 'lucide-react';

import { cn } from '@/lib/utils';

interface DisclaimerBoxProps {
  /** 表示する注意文（複数行） */
  items: string[];
  title?: string;
  className?: string;
}

/** 注意事項の表示ボックス。文言は shop.ts の disclaimers で変更できます。 */
export function DisclaimerBox({ items, title = 'ご確認ください', className }: DisclaimerBoxProps) {
  if (items.length === 0) return null;

  return (
    <div className={cn('print-plain rounded-xl border border-line bg-surface p-4', className)}>
      <p className="mb-2 flex items-center gap-1.5 text-[13px] font-medium text-ink">
        <Info className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
        {title}
      </p>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item} className="text-[12.5px] leading-relaxed text-muted">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
