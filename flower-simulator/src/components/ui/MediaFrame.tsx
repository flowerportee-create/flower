'use client';

import { useState } from 'react';
import { Flower2 } from 'lucide-react';

import { cn } from '@/lib/utils';

/** 文字列から安定した数値を作ります（フォールバック背景の色を決めるため） */
function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) % 360;
  }
  return hash;
}

interface MediaFrameProps {
  /** 画像パス。未設定・読み込み失敗時は背景グラデーションを表示します */
  src?: string;
  alt: string;
  /** フォールバック背景の色を決めるための文字列（項目名など） */
  seed: string;
  /** 画像の縦横比（Tailwind のクラス） */
  ratio?: string;
  className?: string;
}

/**
 * 画像表示用の枠。
 * 画像がなくてもレイアウトが崩れないよう、必ず同じ高さの枠を確保します。
 */
export function MediaFrame({ src, alt, seed, ratio = 'aspect-[4/3]', className }: MediaFrameProps) {
  const [failed, setFailed] = useState(false);
  const hue = hashString(seed);
  const showImage = Boolean(src) && !failed;

  return (
    <div className={cn('relative w-full overflow-hidden bg-surface', ratio, className)}>
      {showImage ? (
        // 設定ファイルで指定された画像。next/image を使わないことで、
        // 店舗が画像を差し替えるときの設定変更を不要にしています。
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, hsl(${hue} 24% 92%) 0%, hsl(${(hue + 40) % 360} 20% 84%) 100%)`,
          }}
        >
          <Flower2 className="h-7 w-7 text-white/70" strokeWidth={1.2} />
        </div>
      )}
    </div>
  );
}
