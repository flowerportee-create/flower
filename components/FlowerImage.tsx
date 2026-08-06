import { colorTheme, type ArrangementKind } from '@/lib/flower';

/**
 * 用途と色から組み立てるお花のイメージ図。
 *
 * 花屋が見本写真を登録していればそちらを優先し（photoUrl）、
 * 未登録の組み合わせではこのイラストを表示する。
 * 実物の色合い・本数はご相談のうえ決まる旨を、呼び出し側で必ず添える。
 */
export default function FlowerImage({
  colorKey,
  arrangement,
  photoUrl,
  alt,
  className = ''
}: {
  colorKey: string;
  arrangement: ArrangementKind;
  photoUrl?: string | null;
  alt: string;
  className?: string;
}) {
  if (photoUrl) {
    return (
      // 花屋がアップロードした実写。Supabase Storage の任意サイズのため next/image は使わない。
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt={alt}
        className={`w-full rounded-2xl border border-ivory object-cover ${className}`}
      />
    );
  }

  const theme = colorTheme(colorKey);

  return (
    <svg
      viewBox="0 0 300 300"
      className={`w-full rounded-2xl border border-ivory ${className}`}
      role="img"
      aria-label={alt}
    >
      <rect width="300" height="300" fill={theme.background} />
      {arrangement === 'stand' ? <Stand theme={theme} /> : null}
      {arrangement === 'orchid' ? <Orchid theme={theme} /> : null}
      {arrangement === 'arrangement' ? <Arrangement theme={theme} /> : null}
      {arrangement === 'bouquet' ? <Bouquet theme={theme} /> : null}
    </svg>
  );
}

type Theme = ReturnType<typeof colorTheme>;

function Blossom({
  x,
  y,
  r,
  fill,
  center
}: {
  x: number;
  y: number;
  r: number;
  fill: string;
  center: string;
}) {
  const petals = [0, 72, 144, 216, 288];
  return (
    <g transform={`translate(${x} ${y})`}>
      {petals.map((angle) => (
        <ellipse
          key={angle}
          cx="0"
          cy={-r * 0.62}
          rx={r * 0.42}
          ry={r * 0.62}
          fill={fill}
          stroke="rgba(58,55,51,0.08)"
          strokeWidth="0.8"
          transform={`rotate(${angle})`}
        />
      ))}
      <circle r={r * 0.3} fill={center} />
    </g>
  );
}

function Leaf({ x, y, angle, size, fill }: { x: number; y: number; angle: number; size: number; fill: string }) {
  return (
    <ellipse
      cx={x}
      cy={y}
      rx={size}
      ry={size * 0.4}
      fill={fill}
      opacity="0.55"
      transform={`rotate(${angle} ${x} ${y})`}
    />
  );
}

/** スタンド花（1段）。開店祝い・公演祝いの定番。 */
function Stand({ theme }: { theme: Theme }) {
  return (
    <g>
      {/* 脚 */}
      <rect x="146" y="150" width="8" height="110" rx="4" fill="#B9AE9C" />
      <path d="M120 262 L180 262 L172 270 L128 270 Z" fill="#B9AE9C" />
      <rect x="112" y="146" width="76" height="10" rx="5" fill="#C7BCA9" />
      {/* 葉 */}
      <g>
        <Leaf x={72} y={118} angle={-24} size={34} fill={theme.leaves} />
        <Leaf x={228} y={118} angle={24} size={34} fill={theme.leaves} />
        <Leaf x={92} y={62} angle={-52} size={28} fill={theme.leaves} />
        <Leaf x={208} y={62} angle={52} size={28} fill={theme.leaves} />
        <Leaf x={150} y={44} angle={0} size={26} fill={theme.leaves} />
      </g>
      {/* 花 */}
      <Blossom x={150} y={78} r={30} fill={theme.petals[0]} center={theme.centers} />
      <Blossom x={98} y={104} r={26} fill={theme.petals[1]} center={theme.centers} />
      <Blossom x={202} y={104} r={26} fill={theme.petals[1]} center={theme.centers} />
      <Blossom x={124} y={140} r={23} fill={theme.petals[2]} center={theme.centers} />
      <Blossom x={176} y={140} r={23} fill={theme.petals[2]} center={theme.centers} />
      <Blossom x={150} y={116} r={20} fill={theme.petals[0]} center={theme.centers} />
    </g>
  );
}

/** 胡蝶蘭 3本立。就任祝い・移転祝いの定番。 */
function Orchid({ theme }: { theme: Theme }) {
  const stems = [
    { x: 150, top: 54 },
    { x: 104, top: 82 },
    { x: 196, top: 82 }
  ];
  return (
    <g>
      {/* 鉢 */}
      <path d="M112 226 L188 226 L178 276 L122 276 Z" fill="#FFFFFF" stroke="#E3DCCF" strokeWidth="2" />
      <rect x="106" y="216" width="88" height="14" rx="7" fill={theme.petals[2]} />
      {stems.map((stem) => (
        <g key={stem.x}>
          <path
            d={`M150 220 C ${stem.x} 190, ${stem.x} ${stem.top + 60}, ${stem.x} ${stem.top}`}
            fill="none"
            stroke={theme.leaves}
            strokeWidth="4"
            strokeLinecap="round"
          />
          <Blossom x={stem.x} y={stem.top} r={22} fill={theme.petals[0]} center={theme.centers} />
          <Blossom x={stem.x} y={stem.top + 46} r={20} fill={theme.petals[1]} center={theme.centers} />
          <Blossom x={stem.x} y={stem.top + 88} r={17} fill={theme.petals[2]} center={theme.centers} />
        </g>
      ))}
      <Leaf x={128} y={214} angle={-18} size={26} fill={theme.leaves} />
      <Leaf x={172} y={214} angle={18} size={26} fill={theme.leaves} />
    </g>
  );
}

/** アレンジメント。周年・記念日など幅広い用途に。 */
function Arrangement({ theme }: { theme: Theme }) {
  return (
    <g>
      <path d="M96 176 L204 176 L192 254 L108 254 Z" fill="#FFFFFF" stroke="#E3DCCF" strokeWidth="2" />
      <rect x="90" y="166" width="120" height="16" rx="8" fill={theme.petals[2]} />
      <g>
        <Leaf x={78} y={158} angle={-28} size={30} fill={theme.leaves} />
        <Leaf x={222} y={158} angle={28} size={30} fill={theme.leaves} />
        <Leaf x={150} y={78} angle={0} size={24} fill={theme.leaves} />
      </g>
      <Blossom x={150} y={104} r={28} fill={theme.petals[0]} center={theme.centers} />
      <Blossom x={106} y={128} r={24} fill={theme.petals[1]} center={theme.centers} />
      <Blossom x={194} y={128} r={24} fill={theme.petals[1]} center={theme.centers} />
      <Blossom x={128} y={158} r={21} fill={theme.petals[2]} center={theme.centers} />
      <Blossom x={172} y={158} r={21} fill={theme.petals[2]} center={theme.centers} />
    </g>
  );
}

/** 花束。結婚・出産祝いなど手渡しの場面に。 */
function Bouquet({ theme }: { theme: Theme }) {
  return (
    <g>
      {/* ラッピング */}
      <path d="M150 300 L96 196 L204 196 Z" fill="#FFFFFF" stroke="#E3DCCF" strokeWidth="2" />
      <path d="M150 300 L96 196 L150 210 Z" fill={theme.background} opacity="0.7" />
      <rect x="126" y="212" width="48" height="10" rx="5" fill={theme.petals[1]} />
      <g>
        <Leaf x={84} y={150} angle={-34} size={30} fill={theme.leaves} />
        <Leaf x={216} y={150} angle={34} size={30} fill={theme.leaves} />
        <Leaf x={150} y={70} angle={0} size={24} fill={theme.leaves} />
      </g>
      <Blossom x={150} y={98} r={27} fill={theme.petals[0]} center={theme.centers} />
      <Blossom x={108} y={126} r={23} fill={theme.petals[1]} center={theme.centers} />
      <Blossom x={192} y={126} r={23} fill={theme.petals[1]} center={theme.centers} />
      <Blossom x={132} y={162} r={20} fill={theme.petals[2]} center={theme.centers} />
      <Blossom x={172} y={162} r={20} fill={theme.petals[2]} center={theme.centers} />
    </g>
  );
}
