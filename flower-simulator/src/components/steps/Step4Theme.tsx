'use client';

import { useFormContext } from 'react-hook-form';

import { shopConfig } from '@/config/shop';
import { Field, TagButton, TextArea, TextInput } from '@/components/ui/FormControls';
import { useField } from '@/lib/useField';
import { toggleValue } from '@/lib/utils';
import type { SimulationFormValues } from '@/types';

/** STEP 4: テーマ */
export function Step4Theme() {
  const {
    register,
    formState: { errors },
  } = useFormContext<SimulationFormValues>();
  const [impressionTags, setImpressionTags] = useField('theme.impressionTags');
  const themeErrors = errors.theme;

  return (
    <section className="space-y-6">
      <Field
        label="イベントや装花のテーマ"
        htmlFor="theme-theme"
        error={themeErrors?.theme?.message}
        hint="ひと言で構いません。決まっていなければ空欄のままで大丈夫です。"
      >
        <TextInput id="theme-theme" placeholder="例：秋の実りを感じる大人のパーティー" {...register('theme.theme')} />
      </Field>

      <Field
        label="コンセプト"
        htmlFor="theme-concept"
        error={themeErrors?.concept?.message}
        hint="イベントの背景や、大切にしたいことを自由にご記入ください。"
      >
        <TextArea
          id="theme-concept"
          placeholder="例：10周年の節目に、これまで支えてくださった方への感謝を伝える会にしたいです。"
          {...register('theme.concept')}
        />
      </Field>

      <Field label="来場者に感じてほしい印象" hint="当てはまるものをいくつでも選べます。">
        <div className="flex flex-wrap gap-2">
          {shopConfig.impressionTags.map((tag) => (
            <TagButton
              key={tag.id}
              label={tag.label}
              selected={impressionTags.includes(tag.id)}
              onToggle={() => setImpressionTags(toggleValue(impressionTags, tag.id))}
            />
          ))}
        </div>
      </Field>

      <Field
        label="使用したい言葉"
        htmlFor="theme-keywords"
        error={themeErrors?.keywords?.message}
        hint="装花のイメージに使いたいキーワードがあればご記入ください。"
      >
        <TextInput id="theme-keywords" placeholder="例：静けさ、余白、実り" {...register('theme.keywords')} />
      </Field>

      <Field
        label="避けたい印象"
        htmlFor="theme-avoidImpression"
        error={themeErrors?.avoidImpression?.message}
      >
        <TextArea
          id="theme-avoidImpression"
          rows={3}
          placeholder="例：かわいらしすぎる、子どもっぽい"
          {...register('theme.avoidImpression')}
        />
      </Field>
    </section>
  );
}
