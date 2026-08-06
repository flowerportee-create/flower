'use client';

import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

import { ProgressBar } from '@/components/ui/ProgressBar';

interface StepLayoutProps {
  step: number;
  totalSteps: number;
  title: string;
  /** ステップの説明文 */
  description?: string;
  onBack: () => void;
  onNext: () => void;
  /** 最後のステップでは「プランを作成する」表示になります */
  isLast?: boolean;
  /** 保存状態などの補足表示 */
  statusText?: string;
  children: React.ReactNode;
}

/** 各ステップ共通のレイアウト（進捗・見出し・前後の移動ボタン） */
export function StepLayout({
  step,
  totalSteps,
  title,
  description,
  onBack,
  onNext,
  isLast = false,
  statusText,
  children,
}: StepLayoutProps) {
  return (
    <div className="mx-auto max-w-3xl px-5 pb-32 pt-6 sm:pt-10">
      <ProgressBar current={step} total={totalSteps} label={title} className="mb-8" />

      <header className="mb-6">
        <h1 className="font-heading text-[22px] leading-snug text-ink sm:text-[26px]">{title}</h1>
        {description ? (
          <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{description}</p>
        ) : null}
      </header>

      <div className="animate-fade-in space-y-8">{children}</div>

      {/* 画面下部に固定される操作ボタン */}
      <div className="no-print fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-5 py-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 rounded-lg border border-line bg-white px-4 py-3 text-sm text-ink transition-colors hover:border-accent/60"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            戻る
          </button>
          <button
            type="button"
            onClick={onNext}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand px-4 py-3 text-sm font-medium text-brand-fg transition-opacity hover:opacity-90"
          >
            {isLast ? (
              <>
                <Check className="h-4 w-4" aria-hidden="true" />
                プランを作成する
              </>
            ) : (
              <>
                次へ
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </>
            )}
          </button>
        </div>
        {statusText ? (
          <p className="pb-2 text-center text-[11px] text-muted" aria-live="polite">
            {statusText}
          </p>
        ) : null}
      </div>
    </div>
  );
}
