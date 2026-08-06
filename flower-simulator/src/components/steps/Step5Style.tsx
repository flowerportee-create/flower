'use client';

import { shopConfig } from '@/config/shop';
import { ImageSelectionCard } from '@/components/ui/ImageSelectionCard';
import { useField } from '@/lib/useField';
import { toggleValue } from '@/lib/utils';

/** STEP 5: テイスト選択（複数選択可） */
export function Step5Style() {
  const [styleIds, setStyleIds] = useField('styleIds');

  return (
    <section className="space-y-4">
      <div aria-label="テイスト" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {shopConfig.styles.map((style) => (
          <ImageSelectionCard
            key={style.id}
            title={style.name}
            description={style.description}
            image={style.image}
            multiple
            selected={styleIds.includes(style.id)}
            onToggle={() => setStyleIds(toggleValue(styleIds, style.id))}
          />
        ))}
      </div>
      <p className="text-[12.5px] text-muted">
        複数選べます。いちばん近いものから順に選んでいただくと、方向性が伝わりやすくなります。
      </p>
    </section>
  );
}
