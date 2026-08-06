import { priorityLabels } from '@/lib/labels';
import { formatYen } from '@/lib/utils';
import type { BudgetAllocationResult } from '@/types';

interface BudgetAllocationProps {
  allocation: BudgetAllocationResult;
}

/**
 * 予算配分案の表示。
 * 予算が未定の場合は金額を出さず、割合のみを表示します。
 */
export function BudgetAllocation({ allocation }: BudgetAllocationProps) {
  if (allocation.items.length === 0) {
    return <p className="text-[13px] text-muted">装花場所が選択されていないため、配分は表示していません。</p>;
  }

  return (
    <div className="space-y-4">
      <p className="text-[13px] text-ink">
        {allocation.hasAmount && allocation.totalAmount !== null ? (
          <>
            予算総額の目安：
            <span className="font-medium">{formatYen(allocation.totalAmount)}</span>
            <span className="ml-2 text-[12px] text-muted">（{allocation.taxLabel}）</span>
          </>
        ) : (
          <span className="text-muted">
            ご予算が未定のため、金額ではなく配分の割合のみを表示しています。
          </span>
        )}
      </p>

      <ul className="space-y-3">
        {allocation.items.map((item) => (
          <li
            key={item.areaId}
            className="print-block rounded-lg border border-line/80 p-3.5"
          >
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-[14px] font-medium text-ink">
                {item.name}
                {item.isExpense ? (
                  <span className="ml-2 rounded-sm bg-surface px-1.5 py-0.5 text-[10px] font-normal text-muted">
                    諸経費
                  </span>
                ) : null}
              </p>
              <p className="shrink-0 text-right">
                {item.amount !== null ? (
                  <span className="text-[14px] font-medium text-ink">{formatYen(item.amount)}</span>
                ) : null}
                <span className="ml-2 text-[12px] text-muted">{item.ratio}%</span>
              </p>
            </div>

            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-line">
              <div
                className="h-full rounded-full bg-brand"
                style={{ width: `${Math.min(item.ratio, 100)}%` }}
                aria-hidden="true"
              />
            </div>

            <p className="mt-2 text-[12px] leading-relaxed text-muted">
              {item.priority ? (
                <span className="mr-2 rounded-sm border border-line px-1.5 py-0.5 text-[10.5px]">
                  {priorityLabels[item.priority]}
                </span>
              ) : null}
              {item.description}
            </p>
          </li>
        ))}
      </ul>

      <p className="text-[12px] leading-relaxed text-muted">
        ※ 金額はあくまで目安です。実際の見積金額は、花材の市場価格、会場条件、施工内容によって変動します。
      </p>
    </div>
  );
}
