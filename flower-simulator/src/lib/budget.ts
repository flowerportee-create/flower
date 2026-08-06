/**
 * 予算配分ロジック
 * -----------------------------------------------------------------------------
 * 【計算の考え方】
 *   1. 予算総額を求める（直接入力された金額、または予算帯の代表金額）
 *   2. 搬入設営費・撤去費を先に確保する（割合は設定ファイルで変更できます）
 *   3. 残りを「装花場所の重み × 優先度の係数」の比率で配分する
 *
 * 割合や係数を変えたい場合は src/config/shop.ts の budgetRules を編集してください。
 */

import { shopConfig } from '@/config/shop';
import { priorityLabels, taxTypeLabels } from '@/lib/labels';
import type {
  BudgetAllocationItem,
  BudgetAllocationResult,
  SimulationFormValues,
} from '@/types';

/** 入力内容から予算総額（円）を求めます。決まっていない場合は null。 */
export function resolveBudgetAmount(values: SimulationFormValues): number | null {
  const { budget } = values;
  if (budget.inputMode === 'amount') {
    return typeof budget.amount === 'number' && budget.amount > 0 ? budget.amount : null;
  }
  const range = shopConfig.budgetRanges.find((item) => item.id === budget.rangeId);
  return range?.representativeAmount ?? null;
}

/** 予算総額の表示用ラベル（結果画面のヘッダーで使用） */
export function describeBudget(values: SimulationFormValues): string {
  const { budget } = values;
  if (budget.inputMode === 'amount' && typeof budget.amount === 'number' && budget.amount > 0) {
    return `${budget.amount.toLocaleString('ja-JP')}円`;
  }
  const range = shopConfig.budgetRanges.find((item) => item.id === budget.rangeId);
  return range ? range.label : '未入力';
}

function roundTo(value: number, unit: number): number {
  if (unit <= 0) return Math.round(value);
  return Math.round(value / unit) * unit;
}

/**
 * 予算配分を計算します。
 * 予算が未定の場合は金額を出さず、割合のみを返します（hasAmount === false）。
 */
export function calculateBudgetAllocation(values: SimulationFormValues): BudgetAllocationResult {
  const rules = shopConfig.budgetRules;
  const totalAmount = resolveBudgetAmount(values);
  const hasAmount = totalAmount !== null && totalAmount > 0;

  // --- 1. 諸経費（搬入設営費・撤去費）として確保する割合 ---
  const setupRatio = values.budget.includesSetupFee === 'yes' ? rules.setupFeeRatio : 0;
  const removalRatio =
    values.budget.includesRemovalFee === 'yes' && values.venue.removal !== 'notRequired'
      ? rules.removalFeeRatio
      : 0;
  const decorationRatio = Math.max(0, 1 - setupRatio - removalRatio);

  // --- 2. 装花場所ごとのスコア（重み × 優先度の係数）---
  const selected = values.areas
    .map((selectedArea) => {
      const area = shopConfig.decorationAreas.find((item) => item.id === selectedArea.areaId);
      if (!area) return null;
      const coefficient = rules.priorityCoefficients[selectedArea.priority] ?? 1;
      return { area, priority: selectedArea.priority, score: area.weight * coefficient };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const totalScore = selected.reduce((sum, item) => sum + item.score, 0);

  const items: BudgetAllocationItem[] = [];

  if (selected.length === 0 || totalScore <= 0) {
    // 装花場所が未選択のときは「装花一式」としてまとめて表示します
    items.push({
      areaId: 'all',
      name: '装花一式',
      amount: hasAmount ? roundTo((totalAmount as number) * decorationRatio, rules.roundUnit) : null,
      ratio: Number((decorationRatio * 100).toFixed(1)),
      priority: null,
      description: '装花場所が未選択のため、装花全体の目安として表示しています',
    });
  } else {
    for (const item of selected) {
      const share = (item.score / totalScore) * decorationRatio;
      items.push({
        areaId: item.area.id,
        name: item.area.name,
        amount: hasAmount ? roundTo((totalAmount as number) * share, rules.roundUnit) : null,
        ratio: Number((share * 100).toFixed(1)),
        priority: item.priority,
        description: `${item.area.description}（${priorityLabels[item.priority]}）`,
      });
    }
    // 配分金額の大きい順に並べ替えます
    items.sort((a, b) => b.ratio - a.ratio);
  }

  // --- 3. 諸経費の行を追加 ---
  if (setupRatio > 0) {
    items.push({
      areaId: 'setupFee',
      name: '搬入・設営関連費',
      amount: hasAmount ? roundTo((totalAmount as number) * setupRatio, rules.roundUnit) : null,
      ratio: Number((setupRatio * 100).toFixed(1)),
      priority: null,
      description: '会場への搬入、設営作業、資材、交通費などの目安です',
      isExpense: true,
    });
  }
  if (removalRatio > 0) {
    items.push({
      areaId: 'removalFee',
      name: '撤去関連費',
      amount: hasAmount ? roundTo((totalAmount as number) * removalRatio, rules.roundUnit) : null,
      ratio: Number((removalRatio * 100).toFixed(1)),
      priority: null,
      description: '終演後の撤去作業、廃棄、搬出にかかる費用の目安です',
      isExpense: true,
    });
  }

  // --- 4. 端数調整（丸めによる差額を、最も配分の大きい装花項目で吸収します）---
  if (hasAmount && items.length > 0) {
    const sum = items.reduce((acc, item) => acc + (item.amount ?? 0), 0);
    const diff = (totalAmount as number) - sum;
    if (diff !== 0) {
      const target = items.find((item) => !item.isExpense && (item.amount ?? 0) + diff > 0);
      if (target && target.amount !== null) {
        target.amount += diff;
      }
    }
  }

  const taxLabel = values.budget.taxType
    ? taxTypeLabels[values.budget.taxType]
    : '税込／税別 未選択';

  return { totalAmount: hasAmount ? totalAmount : null, hasAmount, items, taxLabel };
}
