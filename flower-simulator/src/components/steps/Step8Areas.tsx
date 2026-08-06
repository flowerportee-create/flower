'use client';

import { useFormContext, useWatch } from 'react-hook-form';

import { shopConfig } from '@/config/shop';
import { DecorationAreaCard } from '@/components/ui/DecorationAreaCard';
import { useField } from '@/lib/useField';
import type { AreaPriority, DecorationArea, SimulationFormValues } from '@/types';

/** 選択中のシーンに応じて、表示する装花場所を組み立てます */
export function getAreasForScene(sceneId: string): DecorationArea[] {
  const scene = shopConfig.scenes.find((item) => item.id === sceneId);
  const ids = [...shopConfig.commonDecorationAreaIds, ...(scene?.extraAreaIds ?? [])];
  const uniqueIds = Array.from(new Set(ids));
  return uniqueIds
    .map((id) => shopConfig.decorationAreas.find((area) => area.id === id))
    .filter((area): area is DecorationArea => Boolean(area));
}

/** STEP 8: 装花場所（複数選択可・重要度つき） */
export function Step8Areas() {
  const { control } = useFormContext<SimulationFormValues>();
  const sceneId = useWatch({ control, name: 'sceneId' });
  const [areas, setAreas] = useField('areas');

  const availableAreas = getAreasForScene(sceneId);

  function toggleArea(areaId: string) {
    const exists = areas.some((area) => area.areaId === areaId);
    setAreas(
      exists
        ? areas.filter((area) => area.areaId !== areaId)
        : [...areas, { areaId, priority: 'medium' as AreaPriority }],
    );
  }

  function changePriority(areaId: string, priority: AreaPriority) {
    setAreas(areas.map((area) => (area.areaId === areaId ? { ...area, priority } : area)));
  }

  return (
    <section className="space-y-4">
      <div className="grid gap-3">
        {availableAreas.map((area) => {
          const selected = areas.find((item) => item.areaId === area.id);
          return (
            <DecorationAreaCard
              key={area.id}
              area={area}
              selected={Boolean(selected)}
              priority={selected?.priority ?? 'medium'}
              onToggle={() => toggleArea(area.id)}
              onPriorityChange={(priority) => changePriority(area.id, priority)}
            />
          );
        })}
      </div>

      <p className="text-[12.5px] leading-relaxed text-muted">
        重要度は予算配分の目安に反映されます。「優先したい」を選んだ場所には、より多くの予算が配分されます。
      </p>
    </section>
  );
}
