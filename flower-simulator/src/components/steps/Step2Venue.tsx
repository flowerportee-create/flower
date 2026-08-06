'use client';

import { useFormContext } from 'react-hook-form';

import { ChoiceGroup, Field, TextArea, TextInput } from '@/components/ui/FormControls';
import { locationTypeLabels, removalLabels, toOptions, venueSizeLabels } from '@/lib/labels';
import { useField } from '@/lib/useField';
import type { RemovalType, SimulationFormValues, VenueLocationType, VenueSize } from '@/types';

/** STEP 2: 基本情報 */
export function Step2Venue() {
  const {
    register,
    formState: { errors },
  } = useFormContext<SimulationFormValues>();
  const [locationType, setLocationType] = useField('venue.locationType');
  const [venueSize, setVenueSize] = useField('venue.venueSize');
  const [removal, setRemoval] = useField('venue.removal');
  const venueErrors = errors.venue;

  return (
    <section className="space-y-6">
      <Field
        label="開催日"
        required
        error={venueErrors?.eventDate?.message}
        htmlFor="venue-eventDate"
        hint="開催日から、その時期におすすめの花を表示します。"
      >
        <TextInput id="venue-eventDate" type="date" {...register('venue.eventDate')} />
      </Field>

      <Field label="屋内／屋外" required error={venueErrors?.locationType?.message}>
        <ChoiceGroup<VenueLocationType>
          ariaLabel="屋内／屋外"
          options={toOptions(locationTypeLabels)}
          value={locationType}
          onChange={setLocationType}
        />
      </Field>

      <Field
        label="参加人数"
        required
        error={venueErrors?.guestCount?.message}
        htmlFor="venue-guestCount"
        hint="おおよその人数で構いません。"
      >
        <div className="flex items-center gap-2">
          <TextInput
            id="venue-guestCount"
            type="number"
            inputMode="numeric"
            min={1}
            placeholder="例：80"
            {...register('venue.guestCount', {
              setValueAs: (value) => (value === '' || value === null ? '' : Number(value)),
            })}
          />
          <span className="shrink-0 text-sm text-muted">名</span>
        </div>
      </Field>

      <Field label="会場名" htmlFor="venue-venueName">
        <TextInput id="venue-venueName" placeholder="例：〇〇ホテル 3F バンケット" {...register('venue.venueName')} />
      </Field>

      <Field label="開催地域" htmlFor="venue-area">
        <TextInput id="venue-area" placeholder="例：東京都渋谷区" {...register('venue.area')} />
      </Field>

      <Field label="会場の広さ">
        <ChoiceGroup<VenueSize>
          ariaLabel="会場の広さ"
          options={toOptions(venueSizeLabels)}
          value={venueSize}
          onChange={setVenueSize}
        />
      </Field>

      <Field label="テーブル数" htmlFor="venue-tableCount">
        <div className="flex items-center gap-2">
          <TextInput
            id="venue-tableCount"
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="例：10"
            {...register('venue.tableCount', {
              setValueAs: (value) => (value === '' || value === null ? '' : Number(value)),
            })}
          />
          <span className="shrink-0 text-sm text-muted">卓</span>
        </div>
      </Field>

      <Field label="開催時間" htmlFor="venue-eventTime">
        <TextInput id="venue-eventTime" placeholder="例：13:00〜16:00" {...register('venue.eventTime')} />
      </Field>

      <Field label="搬入希望時間" htmlFor="venue-loadInTime" hint="会場の搬入可能時間が決まっている場合にご記入ください。">
        <TextInput id="venue-loadInTime" placeholder="例：10:00頃" {...register('venue.loadInTime')} />
      </Field>

      <Field label="撤去の有無">
        <ChoiceGroup<RemovalType>
          ariaLabel="撤去の有無"
          options={toOptions(removalLabels)}
          value={removal}
          onChange={setRemoval}
        />
      </Field>

      <Field
        label="その他の会場情報"
        htmlFor="venue-venueNotes"
        hint="天井高、搬入経路、火気や水の使用制限、装飾の可否など、分かる範囲でご記入ください。"
      >
        <TextArea id="venue-venueNotes" placeholder="例：天井が高く、吊り装花は不可と言われています。" {...register('venue.venueNotes')} />
      </Field>
    </section>
  );
}
