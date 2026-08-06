import Link from 'next/link';

import { shopConfig } from '@/config/shop';

/** 画面下部のフッター。表示内容は shop.ts の contact / footerText で変更できます。 */
export function SiteFooter() {
  const { contact } = shopConfig;

  return (
    <footer className="site-footer mt-20 border-t border-line bg-surface">
      <div className="mx-auto max-w-3xl space-y-6 px-5 py-10 text-sm">
        <div className="space-y-1">
          <p className="font-heading text-base text-ink">{shopConfig.shopName}</p>
          {contact.address ? <p className="text-muted">{contact.address}</p> : null}
          {contact.tel ? (
            <p className="text-muted">
              TEL:{' '}
              <a href={`tel:${contact.tel.replace(/-/g, '')}`} className="underline underline-offset-2">
                {contact.tel}
              </a>
            </p>
          ) : null}
          {contact.email ? (
            <p className="text-muted">
              MAIL:{' '}
              <a href={`mailto:${contact.email}`} className="underline underline-offset-2">
                {contact.email}
              </a>
            </p>
          ) : null}
          {contact.businessHours ? <p className="text-muted">{contact.businessHours}</p> : null}
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-2 text-muted">
          {contact.instagramUrl ? (
            <a href={contact.instagramUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
              Instagram
            </a>
          ) : null}
          {contact.lineUrl ? (
            <a href={contact.lineUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
              LINE
            </a>
          ) : null}
          <Link href="/privacy" className="underline underline-offset-2">
            プライバシーポリシー
          </Link>
          <Link href="/terms" className="underline underline-offset-2">
            利用規約
          </Link>
        </div>

        <p className="text-xs text-muted">{shopConfig.footerText}</p>
      </div>
    </footer>
  );
}
