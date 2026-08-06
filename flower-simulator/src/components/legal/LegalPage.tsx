import type { LegalSection } from '@/types';

interface LegalPageProps {
  title: string;
  sections: LegalSection[];
  /** ページ末尾に表示する補足（最終更新日など） */
  note?: string;
}

/** プライバシーポリシー・利用規約の共通レイアウト */
export function LegalPage({ title, sections, note }: LegalPageProps) {
  return (
    <article className="mx-auto max-w-3xl px-5 pb-20 pt-10 sm:pt-14">
      <h1 className="font-heading text-[24px] text-ink sm:text-[28px]">{title}</h1>

      <div className="mt-10 space-y-10">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="font-heading text-[16px] text-ink">{section.heading}</h2>
            <div className="mt-3 space-y-3">
              {section.paragraphs.map((paragraph, index) => (
                <p key={index} className="text-[13.5px] leading-loose text-muted">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>

      {note ? <p className="mt-12 text-[12px] text-muted">{note}</p> : null}
    </article>
  );
}
