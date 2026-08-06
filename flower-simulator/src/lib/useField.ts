'use client';

import {
  useController,
  useFormContext,
  type FieldPath,
  type FieldPathValue,
} from 'react-hook-form';

import type { SimulationFormValues } from '@/types';

/**
 * カード型の選択肢など、通常の input 要素ではない項目を
 * React Hook Form に正しく登録して読み書きするためのフックです。
 *
 * 使い方:
 *   const [sceneId, setSceneId] = useField('sceneId');
 */
export function useField<Name extends FieldPath<SimulationFormValues>>(name: Name) {
  const { control, trigger } = useFormContext<SimulationFormValues>();
  const { field } = useController<SimulationFormValues, Name>({ control, name });

  const setValue = (next: FieldPathValue<SimulationFormValues, Name>) => {
    field.onChange(next);
    // 選択した直後にエラー表示が消えるよう、その項目だけ再検証します
    void trigger(name);
  };

  return [field.value as FieldPathValue<SimulationFormValues, Name>, setValue] as const;
}
