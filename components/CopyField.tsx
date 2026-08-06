'use client';

import { useState } from 'react';

export default function CopyField({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <input
        readOnly
        value={value}
        onFocus={(e) => e.currentTarget.select()}
        className="input flex-1 bg-white text-sm"
        aria-label={label}
      />
      <button type="button" onClick={copy} className="btn-secondary whitespace-nowrap">
        {copied ? 'コピーしました' : 'URLをコピー'}
      </button>
    </div>
  );
}
