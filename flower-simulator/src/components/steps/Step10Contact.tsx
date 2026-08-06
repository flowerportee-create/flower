'use client';

import Link from 'next/link';
import { useFormContext } from 'react-hook-form';

import { ChoiceGroup, Field, TextArea, TextInput } from '@/components/ui/FormControls';
import { contactMethodLabels, toOptions } from '@/lib/labels';
import { useField } from '@/lib/useField';
import { cn } from '@/lib/utils';
import type { ContactMethod, SimulationFormValues } from '@/types';

/** STEP 10: 連絡先 */
export function Step10Contact() {
  const {
    register,
    formState: { errors },
  } = useFormContext<SimulationFormValues>();
  const [preferredMethod, setPreferredMethod] = useField('contact.preferredMethod');
  const contactErrors = errors.contact;

  return (
    <section className="space-y-6">
      <Field label="お名前" required error={contactErrors?.name?.message} htmlFor="contact-name">
        <TextInput id="contact-name" autoComplete="name" placeholder="例：花田 花子" {...register('contact.name')} />
      </Field>

      <Field label="会社名・団体名" error={contactErrors?.company?.message} htmlFor="contact-company">
        <TextInput id="contact-company" autoComplete="organization" placeholder="例：株式会社〇〇" {...register('contact.company')} />
      </Field>

      <Field label="メールアドレス" required error={contactErrors?.email?.message} htmlFor="contact-email">
        <TextInput
          id="contact-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="例：hanako@example.com"
          {...register('contact.email')}
        />
      </Field>

      <Field label="電話番号" error={contactErrors?.phone?.message} htmlFor="contact-phone">
        <TextInput
          id="contact-phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="例：090-0000-0000"
          {...register('contact.phone')}
        />
      </Field>

      <Field label="希望する連絡方法">
        <ChoiceGroup<Exclude<ContactMethod, ''>>
          ariaLabel="希望する連絡方法"
          options={toOptions(contactMethodLabels)}
          value={preferredMethod}
          onChange={setPreferredMethod}
        />
      </Field>

      <Field
        label="相談したい内容"
        error={contactErrors?.message?.message}
        htmlFor="contact-message"
        hint="気になっていること、迷っていることがあればご記入ください。"
      >
        <TextArea
          id="contact-message"
          placeholder="例：予算内でどこまでできるか相談したいです。"
          {...register('contact.message')}
        />
      </Field>

      <Field label="打ち合わせ希望日" htmlFor="contact-meeting">
        <TextInput id="contact-meeting" type="date" {...register('contact.preferredMeetingDate')} />
      </Field>

      {/* 個人情報の取り扱いへの同意（必須） */}
      <div
        className={cn(
          'rounded-xl border p-4',
          contactErrors?.privacyAgreed ? 'border-red-400 bg-red-50' : 'border-line bg-surface',
        )}
      >
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            className="mt-1 h-5 w-5 shrink-0 rounded border-line accent-[var(--brand-primary)]"
            {...register('contact.privacyAgreed')}
          />
          <span className="text-[13.5px] leading-relaxed text-ink">
            <Link href="/privacy" target="_blank" className="underline underline-offset-2">
              プライバシーポリシー
            </Link>
            および
            <Link href="/terms" target="_blank" className="underline underline-offset-2">
              利用規約
            </Link>
            に同意します。
            <span className="ml-1 rounded-sm bg-brand px-1.5 py-0.5 text-[10px] text-brand-fg">必須</span>
          </span>
        </label>
        {contactErrors?.privacyAgreed?.message ? (
          <p role="alert" className="mt-2 text-xs font-medium text-red-700">
            {contactErrors.privacyAgreed.message}
          </p>
        ) : null}
      </div>
    </section>
  );
}
