'use client';

import { useFormContext } from 'react-hook-form';

import { Field, TextArea } from '@/components/ui/FormControls';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { useField } from '@/lib/useField';
import type { SimulationFormValues } from '@/types';

/** STEP 9: 参考イメージ */
export function Step9Reference() {
  const {
    register,
    formState: { errors },
  } = useFormContext<SimulationFormValues>();
  const [images, updateImages] = useField('reference.images');
  const referenceErrors = errors.reference;

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-line bg-surface p-4 text-[12.5px] leading-relaxed text-muted">
        アップロードした画像は、お使いのブラウザ内でのみ表示されます。サーバーには保存されません。
        打ち合わせの際は、画面をお見せいただくか、あらためて共有をお願いします。
      </div>

      <ImageUploader
        label="参考イメージ画像"
        hint="「こういう雰囲気が好き」という画像があれば追加してください。大きな画像は自動で圧縮されます。"
        kind="reference"
        images={images}
        onChange={updateImages}
      />

      <Field
        label="参考画像のURL / Instagram・PinterestのURL"
        htmlFor="reference-urls"
        error={referenceErrors?.referenceUrls?.message}
        hint="複数ある場合は、改行で区切ってご記入ください。"
      >
        <TextArea
          id="reference-urls"
          rows={3}
          placeholder={'例：\nhttps://www.instagram.com/p/xxxxxxxx/\nhttps://jp.pinterest.com/pin/xxxxxxxx/'}
          {...register('reference.referenceUrls')}
        />
      </Field>

      <Field
        label="画像のどこが好きですか"
        htmlFor="reference-liked"
        error={referenceErrors?.likedPoints?.message}
        hint="色、形、質感、ボリューム感など、気に入っている点を教えてください。"
      >
        <TextArea
          id="reference-liked"
          rows={3}
          placeholder="例：花より枝ものが多く、抜け感があるところ"
          {...register('reference.likedPoints')}
        />
      </Field>

      <Field
        label="避けたいデザイン"
        htmlFor="reference-avoid"
        error={referenceErrors?.avoidDesign?.message}
      >
        <TextArea
          id="reference-avoid"
          rows={3}
          placeholder="例：造花を使ったもの、左右対称すぎる構成"
          {...register('reference.avoidDesign')}
        />
      </Field>

      <ImageUploader
        label="会場写真"
        hint="会場の写真や図面があると、より具体的なご提案がしやすくなります。"
        kind="venue"
        images={images}
        onChange={updateImages}
      />
    </section>
  );
}
