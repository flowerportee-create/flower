import type { Metadata, Viewport } from 'next';
import type { CSSProperties } from 'react';

import './globals.css';
import { shopConfig } from '@/config/shop';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';

export const metadata: Metadata = {
  title: `${shopConfig.appName} | ${shopConfig.shopName}`,
  description: shopConfig.description,
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: shopConfig.brand.primary,
};

/** 設定ファイルのブランドカラー・フォントを CSS 変数として全体に流し込みます */
const brandStyle = {
  '--brand-primary': shopConfig.brand.primary,
  '--brand-primary-foreground': shopConfig.brand.primaryForeground,
  '--brand-accent': shopConfig.brand.accent,
  '--brand-surface': shopConfig.brand.surface,
  '--brand-text': shopConfig.brand.text,
  '--brand-muted': shopConfig.brand.muted,
  '--brand-border': shopConfig.brand.border,
  '--font-base': shopConfig.fontFamily.base,
  '--font-heading': shopConfig.fontFamily.heading,
} as CSSProperties;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" style={brandStyle}>
      <body className="min-h-dvh bg-white antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-brand focus:px-4 focus:py-2 focus:text-brand-fg"
        >
          本文へスキップ
        </a>
        <SiteHeader />
        <main id="main" className="min-h-[60vh]">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
