import { formatYen } from '@/lib/utils';

export default function ProgressBar({
  current,
  target
}: {
  current: number;
  target: number;
}) {
  const ratio = target > 0 ? Math.min(current / target, 1) : 0;
  const remaining = Math.max(target - current, 0);

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between text-sm">
        <span className="font-serif text-xl text-ink">{formatYen(current)}</span>
        <span className="text-muted">目標 {formatYen(target)}</span>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-ivory"
        role="progressbar"
        aria-valuenow={Math.round(ratio * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-moss transition-all duration-500"
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
      <p className="hint">
        {target === 0
          ? '目標金額は未設定です'
          : remaining > 0
            ? `目標まであと ${formatYen(remaining)}`
            : '目標金額を達成しました'}
      </p>
    </div>
  );
}
