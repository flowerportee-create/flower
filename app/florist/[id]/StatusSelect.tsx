'use client';

import { useState, useTransition } from 'react';
import type { ProductionStatus } from '@/lib/types';
import { PRODUCTION_STATUS_LABEL, PRODUCTION_STATUS_ORDER } from '@/lib/utils';
import { updateProduction } from '../actions';

export default function StatusSelect({
  projectId,
  status
}: {
  projectId: string;
  status: ProductionStatus;
}) {
  const [current, setCurrent] = useState(status);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function select(next: ProductionStatus) {
    if (next === current || pending) return;
    const previous = current;
    setCurrent(next);
    setError(null);
    startTransition(async () => {
      const result = await updateProduction(projectId, next);
      if (result.error) {
        setCurrent(previous);
        setError(result.error);
      }
    });
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {PRODUCTION_STATUS_ORDER.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => select(value)}
            disabled={pending}
            aria-pressed={current === value}
            className={`rounded-full px-4 py-2 text-sm transition disabled:opacity-60 ${
              current === value
                ? 'bg-ink text-white'
                : 'border border-ivory bg-white text-muted hover:bg-ivory/60'
            }`}
          >
            {PRODUCTION_STATUS_LABEL[value]}
          </button>
        ))}
      </div>
      {error && (
        <p role="alert" className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <p className="hint mt-3">
        「完成」以降にすると、参加者向けの完成報告ページが案内されます。
      </p>
    </div>
  );
}
