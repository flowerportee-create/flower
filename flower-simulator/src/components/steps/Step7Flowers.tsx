'use client';

import { useFormContext, useWatch } from 'react-hook-form';
import { CalendarDays } from 'lucide-react';

import { shopConfig } from '@/config/shop';
import { DisclaimerBox } from '@/components/ui/DisclaimerBox';
import { FlowerCard } from '@/components/ui/FlowerCard';
import { SelectionCard } from '@/components/ui/SelectionCard';
import { getFlowersForMonth, getMonthFromDate } from '@/lib/season';
import { useField } from '@/lib/useField';
import { toggleValue } from '@/lib/utils';
import type { SimulationFormValues } from '@/types';

/** STEP 7: 季節の花（開催日の月から候補を表示します） */
export function Step7Flowers() {
  const { control } = useFormContext<SimulationFormValues>();
  const eventDate = useWatch({ control, name: 'venue.eventDate' });
  const [flowerIds, setFlowerIds] = useField('flowerIds');
  const [flowersOmakase, setFlowersOmakase] = useField('flowersOmakase');

  const month = getMonthFromDate(eventDate);
  const flowers = getFlowersForMonth(month);

  return (
    <section className="space-y-6">
      {month === null ? (
        <div className="rounded-xl border border-line bg-surface p-4 text-[13px] leading-relaxed text-muted">
          STEP 2 で開催日を入力すると、その時期におすすめの花が表示されます。
          日程が未定の場合は、下の「花屋におまかせ」をお選びください。
        </div>
      ) : (
        <p className="flex items-center gap-2 text-[13px] text-muted">
          <CalendarDays className="h-4 w-4 text-accent" aria-hidden="true" />
          {month}月ごろに入手しやすい花の候補です
        </p>
      )}

      <SelectionCard
        title="花は指定せず、雰囲気に合わせて花屋におまかせ"
        description="選択した色やテイストをもとに、その時期のいちばん状態の良い花材で構成します。"
        multiple
        selected={flowersOmakase}
        onToggle={() => {
          const next = !flowersOmakase;
          setFlowersOmakase(next);
          if (next) setFlowerIds([]);
        }}
      />

      {flowers.length > 0 ? (
        <div className="grid gap-3">
          {flowers.map((flower) => (
            <FlowerCard
              key={flower.id}
              flower={flower}
              disabled={flowersOmakase}
              selected={flowerIds.includes(flower.id)}
              onToggle={() => setFlowerIds(toggleValue(flowerIds, flower.id))}
            />
          ))}
        </div>
      ) : null}

      <DisclaimerBox items={shopConfig.disclaimers.flower} title="花材についてのご注意" />
    </section>
  );
}
