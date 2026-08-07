/**
 * プランタイトル・コンセプト文の自動生成（ルールベース）
 * -----------------------------------------------------------------------------
 * 外部のAIは一切使用していません。
 * 選択されたカラー・テイスト・季節・シーンを組み合わせて文章を作ります。
 * 言い回しを変えたい場合は、この中の文字列を書き換えてください。
 */

import { shopConfig } from '@/config/shop';
import { calculateBudgetAllocation } from '@/lib/budget';
import { getFlowersByIds, getMonthFromDate, getSeasonPhrase, getSeasonWord } from '@/lib/season';
import type { SimulationFormValues, SimulationResult, StyleOption } from '@/types';

function findColorName(colorId: string): string {
  return shopConfig.colors.find((color) => color.id === colorId)?.name ?? '';
}

function findStyles(styleIds: string[]): StyleOption[] {
  return styleIds
    .map((id) => shopConfig.styles.find((style) => style.id === id))
    .filter((style): style is StyleOption => Boolean(style));
}

/* -------------------------------------------------------------------------- */
/* プランタイトル                                                              */
/* -------------------------------------------------------------------------- */

/**
 * 例:「ホワイトとグリーンでつくる、洗練された初夏のウェディング装花」
 */
export function generatePlanTitle(values: SimulationFormValues): string {
  const mainColor = findColorName(values.color.mainColorId);
  const subColor = findColorName(values.color.subColorIds[0] ?? '');
  const styles = findStyles(values.styleIds);
  const styleWord = styles[0]?.titleWord ?? '';
  const seasonWord = getSeasonWord(getMonthFromDate(values.venue.eventDate));
  const scene = shopConfig.scenes.find((item) => item.id === values.sceneId);
  const sceneWord = scene?.titleWord ?? '';

  // 前半（色の表現）
  let colorPhrase = '';
  if (mainColor && subColor) {
    colorPhrase = `${mainColor}と${subColor}でつくる`;
  } else if (mainColor) {
    colorPhrase = `${mainColor}を基調にした`;
  }

  // 後半（テイスト＋季節＋シーン）
  const seasonPart = seasonWord ? `${seasonWord}の` : '';
  const scenePart = sceneWord ? `${sceneWord}装花` : '装花';
  const tail = `${styleWord}${seasonPart}${scenePart}`;

  if (colorPhrase) {
    return `${colorPhrase}、${tail}`;
  }
  return tail || '装花プラン';
}

/* -------------------------------------------------------------------------- */
/* コンセプト文                                                                */
/* -------------------------------------------------------------------------- */

/**
 * 例:「白とグリーンを基調に、初夏らしい軽やかな花材を取り入れた装花プランです。
 *     作り込みすぎない自然な質感を大切にしながら、会場全体が上質で開放的に
 *     見える構成を目指します。」
 */
export function generatePlanConcept(values: SimulationFormValues): string {
  const sentences: string[] = [];

  // --- 1文目: 色 ＋ 季節 ---
  const colorNames = [values.color.mainColorId, ...values.color.subColorIds]
    .map(findColorName)
    .filter(Boolean)
    .slice(0, 3);
  // 2色なら「AとB」、3色なら「A、B、C」とつなぎます
  const colorPhrase = colorNames.length === 2 ? colorNames.join('と') : colorNames.join('、');
  const seasonPhrase = getSeasonPhrase(getMonthFromDate(values.venue.eventDate));

  if (colorNames.length > 0 && seasonPhrase) {
    sentences.push(`${colorPhrase}を基調に、${seasonPhrase}花材を取り入れた装花プランです。`);
  } else if (colorNames.length > 0) {
    sentences.push(`${colorPhrase}を基調にした装花プランです。`);
  } else if (seasonPhrase) {
    sentences.push(`${seasonPhrase}花材を取り入れた装花プランです。`);
  } else {
    sentences.push('ご希望をもとに方向性を整理した装花プランです。');
  }

  // --- 2文目: テイスト ＋ 感じてほしい印象 ---
  const styles = findStyles(values.styleIds);
  const stylePhrase = styles[0]?.conceptPhrase ?? '全体のバランスを見ながら';
  const impressionLabels = values.theme.impressionTags
    .map((tagId) => shopConfig.impressionTags.find((tag) => tag.id === tagId)?.label)
    .filter((label): label is string => Boolean(label))
    .slice(0, 3);
  // 印象タグは「上質」「温かい」「凛とした」のように品詞がそろわないため、
  // かぎかっこで囲んでそのまま並べます（お店がタグを増やしても文が崩れません）
  if (impressionLabels.length > 0) {
    sentences.push(
      `${stylePhrase}、会場全体で「${impressionLabels.join('・')}」という印象が伝わることを目指します。`,
    );
  } else {
    sentences.push(`${stylePhrase}、会場全体が心地よく感じられることを目指します。`);
  }

  // --- 3文目: 花材の方針 ---
  if (values.flowersOmakase) {
    sentences.push('花材は指定せず、雰囲気に合わせて花屋におまかせいただく前提で考えています。');
  } else {
    const flowers = getFlowersByIds(values.flowerIds).slice(0, 3);
    if (flowers.length > 0) {
      const names = flowers.map((flower) => flower.name).join('、');
      sentences.push(`${names}などを候補にしながら、当日の入荷状況に合わせて調整します。`);
    }
  }

  // --- 4文目: 避けたい印象 ---
  if (values.theme.avoidImpression.trim()) {
    sentences.push(`「${values.theme.avoidImpression.trim()}」という印象にならないよう配慮します。`);
  }

  return sentences.join('');
}

/* -------------------------------------------------------------------------- */
/* 結果全体                                                                    */
/* -------------------------------------------------------------------------- */

/** 入力内容から、結果画面に表示するプラン一式を組み立てます。 */
export function buildSimulationResult(values: SimulationFormValues): SimulationResult {
  return {
    title: generatePlanTitle(values),
    concept: generatePlanConcept(values),
    values,
    allocation: calculateBudgetAllocation(values),
    createdAt: new Date().toISOString(),
  };
}
