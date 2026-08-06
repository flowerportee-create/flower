'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { FormProvider, useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { StepLayout } from '@/components/ui/StepLayout';
import { Step1Scene } from '@/components/steps/Step1Scene';
import { Step2Venue } from '@/components/steps/Step2Venue';
import { Step3Budget } from '@/components/steps/Step3Budget';
import { Step4Theme } from '@/components/steps/Step4Theme';
import { Step5Style } from '@/components/steps/Step5Style';
import { Step6Color } from '@/components/steps/Step6Color';
import { Step7Flowers } from '@/components/steps/Step7Flowers';
import { Step8Areas } from '@/components/steps/Step8Areas';
import { Step9Reference } from '@/components/steps/Step9Reference';
import { Step10Contact } from '@/components/steps/Step10Contact';
import { defaultValues, simulationSchema, stepFieldNames } from '@/lib/schema';
import { getRawState, parseState, saveState, subscribeToStorage } from '@/lib/storage';
import type { SimulationFormValues } from '@/types';

/** 各ステップの見出しと説明（文言はここで変更できます） */
const STEPS = [
  { title: 'どのようなシーンの装花ですか', description: 'いちばん近いものを1つお選びください。' },
  { title: '開催の基本情報', description: '分かる範囲で構いません。後から修正できます。' },
  { title: 'ご予算', description: '目安で構いません。金額の入力でも、予算帯の選択でも大丈夫です。' },
  { title: 'テーマ・感じてほしい印象', description: '言葉にしづらい場合は、タグを選ぶだけでも構いません。' },
  { title: '装花のテイスト', description: '近いと感じるものを、いくつでもお選びください。' },
  { title: 'カラー', description: '使いたい色、避けたい色をお選びください。' },
  { title: '季節の花', description: '開催日の時期に入手しやすい花の候補です。' },
  { title: '装花をしたい場所', description: '場所ごとに重要度も選べます。' },
  { title: '参考イメージ', description: 'イメージに近い画像やURLがあれば共有してください。' },
  { title: 'ご連絡先', description: '打ち合わせのご連絡に使用します。' },
] as const;

const TOTAL_STEPS = STEPS.length;

/**
 * 保存済みの入力内容を読み込んでから、フォーム本体を表示します。
 * （読み込み前にフォームを作ると、途中入力が復元されないため）
 */
export function SimulationForm() {
  const raw = useSyncExternalStore(
    subscribeToStorage,
    getRawState,
    () => undefined as string | null | undefined,
  );

  const stored = useMemo(() => (raw === undefined ? null : parseState(raw)), [raw]);

  if (raw === undefined) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-20 text-center text-sm text-muted">
        入力内容を読み込んでいます…
      </div>
    );
  }

  const initialStep =
    stored && !stored.completed ? Math.min(Math.max(stored.currentStep, 1), TOTAL_STEPS) : 1;

  return <SimulationFormInner initialValues={stored?.values ?? defaultValues} initialStep={initialStep} />;
}

interface SimulationFormInnerProps {
  initialValues: SimulationFormValues;
  initialStep: number;
}

function SimulationFormInner({ initialValues, initialStep }: SimulationFormInnerProps) {
  const router = useRouter();
  const [step, setStep] = useState(initialStep);
  const [statusText, setStatusText] = useState('');
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const statusTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** 保存待ちのタイマーが古いステップ番号を書き込まないよう、最新の値を保持します */
  const stepRef = useRef(initialStep);

  const form = useForm<SimulationFormValues>({
    resolver: zodResolver(simulationSchema) as unknown as Resolver<SimulationFormValues>,
    defaultValues: initialValues,
    mode: 'onTouched',
  });

  /* --- 入力内容の保存 --- */
  const persist = useCallback(
    (currentStep: number, completed = false) => {
      const result = saveState({ currentStep, values: form.getValues(), completed });
      if (result === 'saved-without-images') {
        setStatusText('保存容量の都合により、画像を除いて保存しました');
        return;
      }
      if (result === 'failed') {
        setStatusText('この端末では入力内容を保存できませんでした');
        return;
      }
      setStatusText('入力内容を保存しました');
      if (statusTimer.current) clearTimeout(statusTimer.current);
      statusTimer.current = setTimeout(() => setStatusText(''), 2000);
    },
    [form],
  );

  useEffect(() => {
    // 入力が変わるたび、少し待ってから保存します（毎回保存すると動作が重くなるため）
    return form.subscribe({
      formState: { values: true },
      callback: () => {
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => persist(stepRef.current), 600);
      },
    });
  }, [form, persist]);

  useEffect(
    () => () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      if (statusTimer.current) clearTimeout(statusTimer.current);
    },
    [],
  );

  /* --- ステップの移動 --- */
  function goToStep(next: number) {
    // 保存待ちのタイマーが残っていると、古いステップ番号で上書きされてしまいます
    if (saveTimer.current) clearTimeout(saveTimer.current);
    stepRef.current = next;
    setStep(next);
    persist(next);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function handleBack() {
    if (step === 1) {
      router.push('/');
      return;
    }
    goToStep(step - 1);
  }

  async function handleNext() {
    const fields = stepFieldNames[step as keyof typeof stepFieldNames];
    const valid =
      fields.length === 0 ? true : await form.trigger(fields as never, { shouldFocus: true });
    if (!valid) return;

    if (step === TOTAL_STEPS) {
      saveState({ currentStep: TOTAL_STEPS, values: form.getValues(), completed: true });
      router.push('/result');
      return;
    }
    goToStep(step + 1);
  }

  const meta = STEPS[step - 1];

  return (
    <FormProvider {...form}>
      <form onSubmit={(event) => event.preventDefault()}>
        <StepLayout
          step={step}
          totalSteps={TOTAL_STEPS}
          title={meta.title}
          description={meta.description}
          onBack={handleBack}
          onNext={() => {
            void handleNext();
          }}
          isLast={step === TOTAL_STEPS}
          statusText={statusText}
        >
          {step === 1 ? <Step1Scene /> : null}
          {step === 2 ? <Step2Venue /> : null}
          {step === 3 ? <Step3Budget /> : null}
          {step === 4 ? <Step4Theme /> : null}
          {step === 5 ? <Step5Style /> : null}
          {step === 6 ? <Step6Color /> : null}
          {step === 7 ? <Step7Flowers /> : null}
          {step === 8 ? <Step8Areas /> : null}
          {step === 9 ? <Step9Reference /> : null}
          {step === 10 ? <Step10Contact /> : null}
        </StepLayout>
      </form>
    </FormProvider>
  );
}
