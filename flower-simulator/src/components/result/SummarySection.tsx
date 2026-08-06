import type { ReactNode } from 'react';

interface SummarySectionProps {
  title: string;
  children: ReactNode;
}

/** 結果画面の1セクション（印刷時に途中で切れないようにしています） */
export function SummarySection({ title, children }: SummarySectionProps) {
  return (
    <section className="print-block print-plain rounded-xl border border-line bg-white p-5">
      <h2 className="mb-4 border-b border-line pb-2 font-heading text-[16px] text-ink">{title}</h2>
      {children}
    </section>
  );
}

interface SummaryRowProps {
  label: string;
  value?: ReactNode;
  /** 値が空のときに表示する文字 */
  emptyText?: string;
}

/** 「項目名：内容」の1行 */
export function SummaryRow({ label, value, emptyText = '未入力' }: SummaryRowProps) {
  const isEmpty =
    value === undefined ||
    value === null ||
    value === '' ||
    (Array.isArray(value) && value.length === 0);

  return (
    <div className="flex flex-col gap-0.5 border-b border-line/60 py-2.5 last:border-b-0 sm:flex-row sm:gap-4">
      <dt className="shrink-0 text-[12.5px] text-muted sm:w-40">{label}</dt>
      <dd className={`min-w-0 flex-1 text-[13.5px] leading-relaxed ${isEmpty ? 'text-muted' : 'text-ink'}`}>
        {isEmpty ? emptyText : value}
      </dd>
    </div>
  );
}

/** SummaryRow をまとめる定義リスト */
export function SummaryList({ children }: { children: ReactNode }) {
  return <dl className="divide-y-0">{children}</dl>;
}
