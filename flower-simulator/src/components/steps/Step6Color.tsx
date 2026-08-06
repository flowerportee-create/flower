'use client';

import { shopConfig } from '@/config/shop';
import { ColorPalette, ColorPickerCard } from '@/components/ui/ColorPickerCard';
import { ChoiceGroup, Field } from '@/components/ui/FormControls';
import { brightnessLabels, saturationLabels, toOptions } from '@/lib/labels';
import { useField } from '@/lib/useField';
import { toggleValue } from '@/lib/utils';
import type { BrightnessLevel, ColorOption, SaturationLevel } from '@/types';

function findColors(ids: string[]): ColorOption[] {
  return ids
    .map((id) => shopConfig.colors.find((color) => color.id === id))
    .filter((color): color is ColorOption => Boolean(color));
}

/** STEP 6: カラー選択 */
export function Step6Color() {
  const [mainColorId, setMainColorId] = useField('color.mainColorId');
  const [subColorIds, setSubColorIds] = useField('color.subColorIds');
  const [accentColorIds, setAccentColorIds] = useField('color.accentColorIds');
  const [avoidColorIds, setAvoidColorIds] = useField('color.avoidColorIds');
  const [saturation, setSaturation] = useField('color.saturation');
  const [brightness, setBrightness] = useField('color.brightness');

  const paletteColors = findColors([mainColorId, ...subColorIds, ...accentColorIds]);

  return (
    <section className="space-y-7">
      <Field label="メインカラー" hint="いちばん多く使いたい色を1つ選んでください。">
        <div role="radiogroup" aria-label="メインカラー" className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {shopConfig.colors.map((option) => (
            <ColorPickerCard
              key={option.id}
              color={option}
              selected={mainColorId === option.id}
              onToggle={() => setMainColorId(mainColorId === option.id ? '' : option.id)}
            />
          ))}
        </div>
      </Field>

      <Field label="サブカラー" hint="メインカラーに添える色です。複数選べます。">
        <div aria-label="サブカラー" className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {shopConfig.colors.map((option) => (
            <ColorPickerCard
              key={option.id}
              color={option}
              multiple
              selected={subColorIds.includes(option.id)}
              onToggle={() => setSubColorIds(toggleValue(subColorIds, option.id))}
            />
          ))}
        </div>
      </Field>

      <Field label="アクセントカラー" hint="少量入れて全体を引き締める色です。複数選べます。">
        <div aria-label="アクセントカラー" className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {shopConfig.colors.map((option) => (
            <ColorPickerCard
              key={option.id}
              color={option}
              multiple
              selected={accentColorIds.includes(option.id)}
              onToggle={() => setAccentColorIds(toggleValue(accentColorIds, option.id))}
            />
          ))}
        </div>
      </Field>

      <Field label="避けたい色" hint="使ってほしくない色があれば選んでください。">
        <div aria-label="避けたい色" className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {shopConfig.colors.map((option) => (
            <ColorPickerCard
              key={option.id}
              color={option}
              multiple
              selected={avoidColorIds.includes(option.id)}
              onToggle={() => setAvoidColorIds(toggleValue(avoidColorIds, option.id))}
            />
          ))}
        </div>
      </Field>

      <Field label="彩度">
        <ChoiceGroup<Exclude<SaturationLevel, ''>>
          ariaLabel="彩度"
          options={toOptions(saturationLabels)}
          value={saturation}
          onChange={setSaturation}
          columns={3}
        />
      </Field>

      <Field label="明るさ">
        <ChoiceGroup<Exclude<BrightnessLevel, ''>>
          ariaLabel="明るさ"
          options={toOptions(brightnessLabels)}
          value={brightness}
          onChange={setBrightness}
          columns={2}
        />
      </Field>

      <div className="rounded-xl border border-line bg-surface p-4">
        <p className="mb-3 text-sm font-medium text-ink">選択中のカラーパレット</p>
        <ColorPalette colors={paletteColors} emptyText="まだ色が選択されていません" />
        {avoidColorIds.length > 0 ? (
          <p className="mt-4 text-[12.5px] text-muted">
            避けたい色：
            {findColors(avoidColorIds)
              .map((item) => item.name)
              .join('、')}
          </p>
        ) : null}
      </div>
    </section>
  );
}
