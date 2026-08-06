'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ClipboardCheck, ClipboardCopy, Download, Mail, Printer, RotateCcw, Send } from 'lucide-react';

import { shopConfig } from '@/config/shop';
import {
  buildConsultationText,
  buildConsultationUrl,
  buildJsonExport,
  buildMailSubject,
} from '@/lib/consultation';
import { clearState } from '@/lib/storage';
import { cn } from '@/lib/utils';
import type { SimulationResult } from '@/types';

const buttonBase =
  'flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-[14px] transition-colors';
const secondaryButton = `${buttonBase} border-line bg-white text-ink hover:border-accent/60`;

/* -------------------------------------------------------------------------- */
/* 印刷（ブラウザの印刷機能からPDF保存できます）                                */
/* -------------------------------------------------------------------------- */

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className={secondaryButton}>
      <Printer className="h-4 w-4" aria-hidden="true" />
      印刷・PDF保存
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* 最初からやり直す                                                            */
/* -------------------------------------------------------------------------- */

export function ResetButton({ label = '最初からやり直す' }: { label?: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        if (!window.confirm('入力した内容をすべて削除して、最初からやり直しますか？')) return;
        clearState();
        router.push('/simulation');
        router.refresh();
      }}
      className={cn(secondaryButton, 'text-muted')}
    >
      <RotateCcw className="h-4 w-4" aria-hidden="true" />
      {label}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* 花屋に相談する（設定ファイルの contactChannel に従って遷移します）           */
/* -------------------------------------------------------------------------- */

export function ConsultationButton({ result }: { result: SimulationResult }) {
  const channel = shopConfig.contactChannel;
  const href = buildConsultationUrl(result);

  if (!href) {
    return (
      <p className="rounded-lg border border-line bg-surface p-4 text-[13px] text-muted">
        問い合わせ先が設定されていません。src/config/shop.ts の contactChannel をご確認ください。
      </p>
    );
  }

  const isExternal = channel.type !== 'mailto';

  return (
    <div className="space-y-2">
      <a
        href={href}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        className={cn(
          buttonBase,
          'w-full border-transparent bg-brand font-medium text-brand-fg hover:opacity-90',
        )}
      >
        <Send className="h-4 w-4" aria-hidden="true" />
        {channel.buttonLabel}
      </a>
      {channel.note ? <p className="text-center text-[12px] text-muted">{channel.note}</p> : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* コピー・JSONダウンロード・メール本文                                        */
/* -------------------------------------------------------------------------- */

export function CopyButton({ result }: { result: SimulationResult }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const text = buildConsultationText(result);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('下のテキストをコピーしてください', text);
    }
  }

  return (
    <button
      type="button"
      onClick={() => {
        void copy();
      }}
      className={secondaryButton}
    >
      {copied ? (
        <ClipboardCheck className="h-4 w-4 text-brand" aria-hidden="true" />
      ) : (
        <ClipboardCopy className="h-4 w-4" aria-hidden="true" />
      )}
      {copied ? 'コピーしました' : '相談内容をコピー'}
    </button>
  );
}

export function DownloadJsonButton({ result }: { result: SimulationResult }) {
  function download() {
    const blob = new Blob([buildJsonExport(result)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `soka-plan-${result.createdAt.slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <button type="button" onClick={download} className={secondaryButton}>
      <Download className="h-4 w-4" aria-hidden="true" />
      JSONで保存
    </button>
  );
}

/** メール本文として使える相談文を表示します */
export function MailTextPanel({ result }: { result: SimulationResult }) {
  const [open, setOpen] = useState(false);
  const subject = buildMailSubject(result);
  const body = buildConsultationText(result);

  return (
    <div className="space-y-3">
      <button type="button" onClick={() => setOpen((value) => !value)} className={secondaryButton}>
        <Mail className="h-4 w-4" aria-hidden="true" />
        {open ? 'メール用の文面を閉じる' : 'メール用の文面を表示'}
      </button>

      {open ? (
        <div className="space-y-3 rounded-lg border border-line bg-surface p-4">
          <div>
            <p className="mb-1 text-[12px] font-medium text-ink">件名</p>
            <textarea
              readOnly
              rows={1}
              value={subject}
              aria-label="メールの件名"
              className="w-full resize-none rounded-md border border-line bg-white px-3 py-2 text-[13px] text-ink"
            />
          </div>
          <div>
            <p className="mb-1 text-[12px] font-medium text-ink">本文</p>
            <textarea
              readOnly
              rows={12}
              value={body}
              aria-label="メールの本文"
              className="w-full rounded-md border border-line bg-white px-3 py-2 font-mono text-[12px] leading-relaxed text-ink"
            />
          </div>
          <p className="text-[12px] text-muted">
            そのままコピーして、メールやメッセージに貼り付けてご利用いただけます。
          </p>
        </div>
      ) : null}
    </div>
  );
}

/** 入力内容を修正する（シミュレーション画面に戻ります） */
export function EditButton() {
  const router = useRouter();

  return (
    <button type="button" onClick={() => router.push('/simulation')} className={secondaryButton}>
      入力内容を修正する
    </button>
  );
}
