import { tagSizeFor, type TagSize } from '@/lib/flower';

export type TagEntry = {
  name: string;
  amount: number;
  /** 強調表示する行（参加ページで「あなたのお名前」を示すときに使う） */
  highlight?: boolean;
};

/** 立て札の基本の文字サイズ（SVG座標）。scale を掛けて段階を表現する。 */
const BASE_FONT = 15;
const WIDTH = 300;

function layout(entries: TagEntry[]) {
  const rows = entries.map((entry) => {
    const size: TagSize = tagSizeFor(entry.amount);
    return { ...entry, size, font: BASE_FONT * size.scale };
  });
  // 行の高さは文字サイズに比例させ、大きい名前ほど余白も広く取る
  let y = 0;
  const placed = rows.map((row) => {
    const lineHeight = row.font * 1.85;
    const centerY = y + lineHeight / 2;
    y += lineHeight;
    return { ...row, centerY };
  });
  return { rows: placed, contentHeight: y };
}

/**
 * 立て札のイメージ図。金額の段階に応じて名前の大きさが変わる。
 * 実際の仕上がりは花屋の書き手によって変わるため、あくまで目安として見せる。
 */
export default function TagPreview({
  headline,
  entries,
  className = ''
}: {
  /** 札の上部に入る文言（例: 祝 ご開店） */
  headline?: string;
  entries: TagEntry[];
  className?: string;
}) {
  const { rows, contentHeight } = layout(entries);

  const paddingTop = headline ? 74 : 44;
  const paddingBottom = 40;
  const height = Math.max(190, paddingTop + contentHeight + paddingBottom);

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${height}`}
      className={`w-full ${className}`}
      role="img"
      aria-label={
        headline
          ? `立て札のイメージ。${headline}、連名 ${entries.length} 名。`
          : `立て札のイメージ。連名 ${entries.length} 名。`
      }
    >
      {/* 木札 */}
      <rect x="6" y="6" width={WIDTH - 12} height={height - 12} rx="4" fill="#FFFFFF" />
      <rect
        x="6"
        y="6"
        width={WIDTH - 12}
        height={height - 12}
        rx="4"
        fill="none"
        stroke="#E3DCCF"
        strokeWidth="1.5"
      />
      <rect
        x="14"
        y="14"
        width={WIDTH - 28}
        height={height - 28}
        rx="2"
        fill="none"
        stroke="#EFEADF"
        strokeWidth="1"
      />

      {headline ? (
        <>
          <text
            x={WIDTH / 2}
            y="46"
            textAnchor="middle"
            fill="#3A3733"
            style={{ font: `500 21px var(--font-serif, serif)` }}
          >
            {headline}
          </text>
          <line x1="86" y1="60" x2={WIDTH - 86} y2="60" stroke="#EFE0E2" strokeWidth="1" />
        </>
      ) : null}

      {rows.map((row, index) => (
        <g key={`${row.name}-${index}`}>
          {row.highlight ? (
            <rect
              x="24"
              y={paddingTop + row.centerY - row.font * 0.9}
              width={WIDTH - 48}
              height={row.font * 1.8}
              rx={row.font * 0.5}
              fill="#F4E2E4"
              opacity="0.55"
            />
          ) : null}
          <text
            x={WIDTH / 2}
            y={paddingTop + row.centerY + row.font * 0.35}
            textAnchor="middle"
            fill="#3A3733"
            style={{ font: `500 ${row.font}px var(--font-serif, serif)` }}
          >
            {row.name}
          </text>
        </g>
      ))}

      {/* 札を吊る紐 */}
      <circle cx={WIDTH / 2} cy="6" r="3" fill="#D9CFC0" />
    </svg>
  );
}
