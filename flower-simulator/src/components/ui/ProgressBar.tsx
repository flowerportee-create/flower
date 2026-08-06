import { cn } from '@/lib/utils';

interface ProgressBarProps {
  current: number;
  total: number;
  /** 現在のステップ名 */
  label: string;
  className?: string;
}

/** 入力の進み具合を示すプログレスバー（印刷時は非表示になります） */
export function ProgressBar({ current, total, label, className }: ProgressBarProps) {
  const percent = Math.round((current / total) * 100);

  return (
    <div className={cn('no-print', className)}>
      <div className="mb-2 flex items-baseline justify-between">
        <p className="text-[13px] font-medium text-ink">
          <span className="mr-2 text-brand">
            STEP {current}
            <span className="text-muted"> / {total}</span>
          </span>
          {label}
        </p>
        <p className="text-[11px] text-muted">{percent}%</p>
      </div>
      <div
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label={`全${total}ステップ中${current}ステップ目`}
        className="h-1.5 w-full overflow-hidden rounded-full bg-line"
      >
        <div
          className="h-full rounded-full bg-brand transition-[width] duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
