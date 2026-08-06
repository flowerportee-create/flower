'use client';

import { useFormContext } from 'react-hook-form';

import { shopConfig } from '@/config/shop';
import { ImageSelectionCard } from '@/components/ui/ImageSelectionCard';
import { useField } from '@/lib/useField';
import type { SimulationFormValues } from '@/types';

/** STEP 1: シーン選択（1つだけ選択） */
export function Step1Scene() {
  const {
    formState: { errors },
  } = useFormContext<SimulationFormValues>();
  const [sceneId, setSceneId] = useField('sceneId');

  return (
    <section className="space-y-4">
      <div role="radiogroup" aria-label="開催シーン" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {shopConfig.scenes.map((scene) => (
          <ImageSelectionCard
            key={scene.id}
            title={scene.name}
            description={scene.description}
            image={scene.image}
            selected={sceneId === scene.id}
            onToggle={() => setSceneId(scene.id)}
          />
        ))}
      </div>

      {errors.sceneId?.message ? (
        <p role="alert" className="text-xs font-medium text-red-700">
          {errors.sceneId.message}
        </p>
      ) : null}
    </section>
  );
}
