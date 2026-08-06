import Link from 'next/link';
import { ArrowRight, ClipboardList, Palette, Sparkles } from 'lucide-react';

import { shopConfig } from '@/config/shop';
import { DisclaimerBox } from '@/components/ui/DisclaimerBox';

/** 利用の流れ（文言を変えたい場合はここを編集してください） */
const FLOW = [
  {
    icon: ClipboardList,
    title: '1. 条件を選ぶ',
    text: 'シーン、日程、ご予算、テーマなどを順番に選んでいきます。全10ステップ、5分ほどで完了します。',
  },
  {
    icon: Palette,
    title: '2. 世界観を整える',
    text: 'テイスト、カラー、季節の花、装花したい場所を選び、理想の景色を具体的にしていきます。',
  },
  {
    icon: Sparkles,
    title: '3. プランシートができる',
    text: 'プランタイトル、コンセプト、予算配分の目安をまとめたシートが生成されます。印刷やメール送信もできます。',
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-3xl px-5 pb-16 pt-10 sm:pt-16">
      {/* ヒーロー */}
      <section className="text-center">
        <p className="text-[12px] tracking-[0.2em] text-muted">{shopConfig.shopName}</p>
        <h1 className="mt-5 whitespace-pre-line font-heading text-[26px] leading-[1.7] text-ink sm:text-[34px] sm:leading-[1.6]">
          {shopConfig.catchCopy}
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-[14px] leading-loose text-muted">
          {shopConfig.description}
        </p>

        <Link
          href="/simulation"
          className="mt-9 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-6 py-4 text-[15px] font-medium text-brand-fg transition-opacity hover:opacity-90 sm:w-auto sm:px-10"
        >
          装花プランを作成する
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
        <p className="mt-3 text-[12px] text-muted">所要時間の目安：約5分／登録不要</p>
      </section>

      {/* 利用の流れ */}
      <section className="mt-20">
        <h2 className="font-heading text-[20px] text-ink">利用の流れ</h2>
        <div className="mt-6 space-y-4">
          {FLOW.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex gap-4 rounded-xl border border-line bg-white p-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface">
                  <Icon className="h-5 w-5 text-brand" strokeWidth={1.5} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-[15px] font-medium text-ink">{item.title}</p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{item.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* このアプリについて */}
      <section className="mt-16 rounded-2xl bg-surface px-6 py-8">
        <h2 className="font-heading text-[20px] text-ink">このアプリについて</h2>
        <p className="mt-4 text-[13.5px] leading-loose text-muted">
          装花のご相談では、「なんとなくこういう雰囲気」というイメージを言葉にするのが難しいものです。
          このアプリは、打ち合わせ前にご希望を整理していただくためのヒアリングツールです。
          入力途中の内容はお使いのブラウザに保存されるため、途中で閉じても続きから再開できます。
        </p>
      </section>

      {/* 注意事項 */}
      <section className="mt-10">
        <DisclaimerBox items={shopConfig.disclaimers.top} title="ご利用にあたっての注意事項" />
      </section>
    </div>
  );
}
