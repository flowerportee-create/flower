import type { Metadata, Viewport } from 'next';
import { Noto_Sans_JP, Noto_Serif_JP } from 'next/font/google';
import './globals.css';

const notoSans = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-sans'
});

const notoSerif = Noto_Serif_JP({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-serif'
});

export const metadata: Metadata = {
  title: 'ハナタバ | お祝い花の取りまとめ',
  description:
    '有志で贈るお祝い花を、幹事も参加者も花屋もかんたんに。集金以外の取りまとめをまるごとサポートします。'
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#FBFAF7'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${notoSans.variable} ${notoSerif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
