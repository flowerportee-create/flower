'use client';

import { shopConfig } from '@/config/shop';
import { Field, TextInput } from '@/components/ui/FormControls';
import { cn } from '@/lib/utils';
import type { BudgetInfo } from '@/types';

interface BudgetInputProps {
  value: Pick<BudgetInfo, 'inputMode' | 'amount' | 'rangeId'>;
  onModeChange: (mode: 'amount' | 'range') => void;
  onAmountChange: (amount: number | '') => void;
  onRangeChange: (rangeId: string) => void;
}

/** 予算の入力（金額の直接入力／予算帯の選択を切り替えられます） */
export function BudgetInput({
  value,
  onModeChange,
  onAmountChange,
  onRangeChange,
}: BudgetInputProps) {
  return (
    <div className="space-y-4">
      <div role="radiogroup" aria-label="予算の入力方法" className="grid grid-cols-2 gap-2">
        {(
          [
            { mode: 'range' as const, label: '予算帯から選ぶ' },
            { mode: 'amount' as const, label: '金額を入力する' },
          ]
        ).map((option) => {
          const selected = value.inputMode === option.mode;
          return (
            <button
              key={option.mode}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onModeChange(option.mode)}
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

      {value.inputMode === 'range' ? (
        <div role="radiogroup" aria-label="予算帯" className="grid gap-2 sm:grid-cols-2">
          {shopConfig.budgetRanges.map((range) => {
            const selected = value.rangeId === range.id;
            return (
              <button
                key={range.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onRangeChange(range.id)}
                className={cn(
                  'rounded-lg border px-4 py-3 text-left text-[14px] transition-colors',
                  selected
                    ? 'border-brand bg-brand/[0.06] font-medium text-brand ring-1 ring-brand'
                    : 'border-line bg-white text-ink hover:border-accent/60',
                )}
              >
                {range.label}
              </button>
            );
          })}
        </div>
      ) : (
        <Field
          label="装花全体の予算"
          hint="税込・税別は次の項目で選べます。搬入設営費や撤去費を含むかどうかも合わせてお選びください。"
          htmlFor="budget-amount"
        >
          <div className="flex items-center gap-2">
            <TextInput
              id="budget-amount"
              type="number"
              inputMode="numeric"
              min={0}
              step={1000}
              placeholder="例：300000"
              value={value.amount === '' ? '' : value.amount}
              onChange={(event) => {
                const raw = event.target.value;
                onAmountChange(raw === '' ? '' : Number(raw));
              }}
            />
            <span className="shrink-0 text-sm text-muted">円</span>
          </div>
        </Field>
      )}
    </div>
  );
}
