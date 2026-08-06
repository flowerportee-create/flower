import Link from 'next/link';

import { shopConfig } from '@/config/shop';

/** 画面上部のヘッダー。ロゴは shop.ts の logo で差し替えられます。 */
export function SiteHeader() {
  return (
    <header className="site-header sticky top-0 z-40 border-b border-line/70 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-5 sm:h-16">
        <Link href="/" className="flex items-center gap-2.5" aria-label={`${shopConfig.shopName} トップページ`}>
          {shopConfig.logo ? (
            // 設定ファイルで指定されたロゴ画像。読み込めない場合は店名テキストが残ります。
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={shopConfig.logo}
              alt=""
              className="h-7 w-auto sm:h-8"
              aria-hidden="true"
            />
          ) : null}
          <span className="font-heading text-[15px] tracking-wide text-ink sm:text-base">
            {shopConfig.shopName}
          </span>
        </Link>
        <span className="text-[11px] text-muted sm:text-xs">{shopConfig.appName}</span>
      </div>
    </header>
  );
}
