/**
 * 入力途中の内容をブラウザの localStorage に保存・復元します。
 * サーバーには一切送信されません。
 */

import type { SimulationFormValues, StoredState } from '@/types';
import { defaultValues } from '@/lib/schema';

/** localStorage のキー。複数のアプリを同じドメインに置く場合は変更してください。 */
export const STORAGE_KEY = 'flower-simulator:state:v1';

/** 保存フォーマットのバージョン。構造を変えたときに数字を上げると古いデータを破棄します。 */
const STORAGE_VERSION = 1;

/** 画像を含めて保存できなかった場合に立つフラグ（画面で案内を出すために使用） */
export type SaveResult = 'saved' | 'saved-without-images' | 'failed';

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

/**
 * 保存されている生データ（文字列）を返します。
 * 結果画面が保存内容の変化を検知するために使用します。
 */
export function getRawState(): string | null {
  if (!isBrowser()) return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/** 他のタブでの保存内容の変更を購読します */
export function subscribeToStorage(onChange: () => void): () => void {
  if (!isBrowser()) return () => undefined;
  window.addEventListener('storage', onChange);
  return () => window.removeEventListener('storage', onChange);
}

/** 保存されたデータを読み込みます。無い場合や壊れている場合は null を返します。 */
export function loadState(): StoredState | null {
  return parseState(getRawState());
}

/** 保存されている文字列を StoredState に変換します */
export function parseState(raw: string | null): StoredState | null {
  try {
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredState>;
    if (!parsed || parsed.version !== STORAGE_VERSION || !parsed.values) return null;
    return {
      version: STORAGE_VERSION,
      currentStep: typeof parsed.currentStep === 'number' ? parsed.currentStep : 1,
      values: mergeWithDefaults(parsed.values),
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
      completed: parsed.completed === true,
    };
  } catch {
    return null;
  }
}

/**
 * 入力内容を保存します。
 * 画像を含めると容量制限を超える場合は、画像を除いて保存します。
 */
export function saveState(state: Omit<StoredState, 'version' | 'updatedAt'>): SaveResult {
  if (!isBrowser()) return 'failed';
  const payload: StoredState = {
    ...state,
    version: STORAGE_VERSION,
    updatedAt: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return 'saved';
  } catch {
    // 容量オーバー（QuotaExceededError）の場合は画像を外して再挑戦します
    try {
      const withoutImages: StoredState = {
        ...payload,
        values: {
          ...payload.values,
          reference: { ...payload.values.reference, images: [] },
        },
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(withoutImages));
      return 'saved-without-images';
    } catch {
      return 'failed';
    }
  }
}

/** 保存された内容をすべて削除します（「最初からやり直す」で使用）。 */
export function clearState(): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // 削除できない場合も画面の動作は継続します
  }
}

/**
 * 保存データに足りない項目を初期値で補います。
 * （設定ファイルの更新後に古い保存データを読み込んでも壊れないようにするため）
 */
export function mergeWithDefaults(values: Partial<SimulationFormValues>): SimulationFormValues {
  return {
    ...defaultValues,
    ...values,
    venue: { ...defaultValues.venue, ...values.venue },
    budget: { ...defaultValues.budget, ...values.budget },
    theme: { ...defaultValues.theme, ...values.theme },
    color: { ...defaultValues.color, ...values.color },
    reference: { ...defaultValues.reference, ...values.reference },
    contact: { ...defaultValues.contact, ...values.contact },
    styleIds: values.styleIds ?? [],
    flowerIds: values.flowerIds ?? [],
    areas: values.areas ?? [],
  };
}
