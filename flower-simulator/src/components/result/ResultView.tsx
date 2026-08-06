'use client';

import { useMemo, useSyncExternalStore } from 'react';
import Link from 'next/link';

import { shopConfig } from '@/config/shop';
import { BudgetAllocation } from '@/components/result/BudgetAllocation';
import {
  ConsultationButton,
  CopyButton,
  DownloadJsonButton,
  EditButton,
  MailTextPanel,
  PrintButton,
  ResetButton,
} from '@/components/result/ActionButtons';
import { SummaryList, SummaryRow, SummarySection } from '@/components/result/SummarySection';
import { ColorPalette } from '@/components/ui/ColorPickerCard';
import { DisclaimerBox } from '@/components/ui/DisclaimerBox';
import { describeBudget } from '@/lib/budget';
import {
  availabilityLabels,
  brightnessLabels,
  contactMethodLabels,
  flexibilityLabels,
  locationTypeLabels,
  priceLevelLabels,
  priorityLabels,
  removalLabels,
  saturationLabels,
  taxTypeLabels,
  triStateLabels,
  venueSizeLabels,
} from '@/lib/labels';
import { buildSimulationResult } from '@/lib/plan';
import { getFlowersByIds } from '@/lib/season';
import { getRawState, parseState, subscribeToStorage } from '@/lib/storage';
import { formatJapaneseDate } from '@/lib/utils';
import type { ColorOption, SimulationFormValues, SimulationResult } from '@/types';

function findColors(ids: string[]): ColorOption[] {
  return ids
    .map((id) => shopConfig.colors.find((color) => color.id === id))
    .filter((color): color is ColorOption => Boolean(color));
}

function colorNames(ids: string[]): string {
  return findColors(ids)
    .map((color) => color.name)
    .join('、');
}

export function ResultView() {
  // localStorage の内容を読み込みます。
  // サーバー側では undefined（＝読み込み前）を返し、画面のちらつきを防いでいます。
  const raw = useSyncExternalStore(
    subscribeToStorage,
    getRawState,
    () => undefined as string | null | undefined,
  );

  const loaded = raw !== undefined;
  const values: SimulationFormValues | null = useMemo(
    () => (raw === undefined ? null : (parseState(raw)?.values ?? null)),
    [raw],
  );

  const result: SimulationResult | null = useMemo(
    () => (values ? buildSimulationResult(values) : null),
    [values],
  );

  if (!loaded) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-20 text-center text-sm text-muted">
        プランを読み込んでいます…
      </div>
    );
  }

  if (!result || !values || !values.sceneId) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 px-5 py-20 text-center">
        <p className="text-[15px] text-ink">まだ入力内容が保存されていません。</p>
        <Link
          href="/simulation"
          className="inline-flex items-center justify-center rounded-lg bg-brand px-6 py-3 text-sm font-medium text-brand-fg"
        >
          装花プランを作成する
        </Link>
      </div>
    );
  }

  const scene = shopConfig.scenes.find((item) => item.id === values.sceneId);
  const styles = values.styleIds
    .map((id) => shopConfig.styles.find((style) => style.id === id))
    .filter(Boolean);
  const impressions = values.theme.impressionTags
    .map((id) => shopConfig.impressionTags.find((tag) => tag.id === id)?.label)
    .filter(Boolean);
  const flowers = getFlowersByIds(values.flowerIds);
  const paletteColors = findColors([
    values.color.mainColorId,
    ...values.color.subColorIds,
    ...values.color.accentColorIds,
  ]);

  return (
    <div className="mx-auto max-w-3xl px-5 pb-20 pt-8 sm:pt-12">
      {/* プランのタイトルとコンセプト */}
      <header className="print-block mb-8 border-b border-line pb-8 text-center">
        <p className="text-[11.5px] tracking-[0.2em] text-muted">あなたの装花プラン</p>
        <h1 className="mt-4 font-heading text-[22px] leading-[1.7] text-ink sm:text-[27px]">
          {result.title}
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-left text-[13.5px] leading-loose text-muted sm:text-center">
          {result.concept}
        </p>
        <p className="mt-6 text-[11px] text-muted">
          {shopConfig.shopName}／作成日：{formatJapaneseDate(result.createdAt.slice(0, 10))}
        </p>
      </header>

      <div className="space-y-5">
        {/* 開催情報 */}
        <SummarySection title="開催情報">
          <SummaryList>
            <SummaryRow label="シーン" value={scene?.name} />
            <SummaryRow
              label="開催日"
              value={values.venue.eventDate ? formatJapaneseDate(values.venue.eventDate) : ''}
            />
            <SummaryRow label="会場名" value={values.venue.venueName} />
            <SummaryRow label="開催地域" value={values.venue.area} />
            <SummaryRow
              label="屋内／屋外"
              value={values.venue.locationType ? locationTypeLabels[values.venue.locationType] : ''}
            />
            <SummaryRow
              label="参加人数"
              value={values.venue.guestCount === '' ? '' : `${values.venue.guestCount}名`}
            />
            <SummaryRow
              label="会場の広さ"
              value={values.venue.venueSize ? venueSizeLabels[values.venue.venueSize] : ''}
            />
            <SummaryRow
              label="テーブル数"
              value={values.venue.tableCount === '' ? '' : `${values.venue.tableCount}卓`}
            />
            <SummaryRow label="開催時間" value={values.venue.eventTime} />
            <SummaryRow label="搬入希望時間" value={values.venue.loadInTime} />
            <SummaryRow
              label="撤去"
              value={values.venue.removal ? removalLabels[values.venue.removal] : ''}
            />
            <SummaryRow label="その他の会場情報" value={values.venue.venueNotes} />
          </SummaryList>
        </SummarySection>

        {/* ご予算 */}
        <SummarySection title="ご予算">
          <SummaryList>
            <SummaryRow label="装花全体の予算" value={describeBudget(values)} />
            <SummaryRow
              label="税込／税別"
              value={values.budget.taxType ? taxTypeLabels[values.budget.taxType] : ''}
            />
            <SummaryRow
              label="搬入設営費"
              value={
                values.budget.includesSetupFee
                  ? `予算に${triStateLabels[values.budget.includesSetupFee]}`
                  : ''
              }
            />
            <SummaryRow
              label="撤去費"
              value={
                values.budget.includesRemovalFee
                  ? `予算に${triStateLabels[values.budget.includesRemovalFee]}`
                  : ''
              }
            />
            <SummaryRow
              label="予算の柔軟性"
              value={values.budget.flexibility ? flexibilityLabels[values.budget.flexibility] : ''}
            />
          </SummaryList>
        </SummarySection>

        {/* テーマとテイスト */}
        <SummarySection title="テーマ・テイスト">
          <SummaryList>
            <SummaryRow label="テーマ" value={values.theme.theme} />
            <SummaryRow label="コンセプト" value={values.theme.concept} />
            <SummaryRow
              label="感じてほしい印象"
              value={
                impressions.length > 0 ? (
                  <span className="flex flex-wrap gap-1.5">
                    {impressions.map((label) => (
                      <span
                        key={label}
                        className="rounded-full border border-line px-2.5 py-0.5 text-[12px]"
                      >
                        {label}
                      </span>
                    ))}
                  </span>
                ) : (
                  ''
                )
              }
            />
            <SummaryRow label="使用したい言葉" value={values.theme.keywords} />
            <SummaryRow label="避けたい印象" value={values.theme.avoidImpression} />
            <SummaryRow
              label="テイスト"
              value={
                styles.length > 0 ? (
                  <span className="space-y-1">
                    {styles.map((style) => (
                      <span key={style!.id} className="block">
                        <span className="font-medium">{style!.name}</span>
                        <span className="ml-2 text-[12px] text-muted">{style!.description}</span>
                      </span>
                    ))}
                  </span>
                ) : (
                  ''
                )
              }
            />
          </SummaryList>
        </SummarySection>

        {/* カラー */}
        <SummarySection title="カラー">
          <div className="mb-4">
            <ColorPalette colors={paletteColors} emptyText="色は未選択です" />
          </div>
          <SummaryList>
            <SummaryRow label="メインカラー" value={colorNames([values.color.mainColorId])} />
            <SummaryRow label="サブカラー" value={colorNames(values.color.subColorIds)} />
            <SummaryRow label="アクセントカラー" value={colorNames(values.color.accentColorIds)} />
            <SummaryRow label="避けたい色" value={colorNames(values.color.avoidColorIds)} emptyText="特になし" />
            <SummaryRow
              label="彩度"
              value={values.color.saturation ? saturationLabels[values.color.saturation] : ''}
            />
            <SummaryRow
              label="明るさ"
              value={values.color.brightness ? brightnessLabels[values.color.brightness] : ''}
            />
          </SummaryList>
        </SummarySection>

        {/* 季節の花 */}
        <SummarySection title="季節の花">
          {values.flowersOmakase ? (
            <p className="text-[13.5px] text-ink">
              花材は指定せず、雰囲気に合わせて花屋におまかせいただく前提です。
            </p>
          ) : flowers.length > 0 ? (
            <ul className="space-y-2">
              {flowers.map((flower) => (
                <li key={flower.id} className="border-b border-line/60 pb-2 last:border-b-0">
                  <p className="text-[14px] font-medium text-ink">{flower.name}</p>
                  <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted">{flower.feature}</p>
                  <p className="mt-1 text-[11.5px] text-muted">
                    主な色：{flower.mainColors}／{priceLevelLabels[flower.priceLevel]}／
                    {availabilityLabels[flower.availability]}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[13px] text-muted">花材の指定はありません。</p>
          )}
        </SummarySection>

        {/* 装花場所 */}
        <SummarySection title="装花場所と優先度">
          {values.areas.length > 0 ? (
            <ul className="space-y-2">
              {values.areas.map((selected) => {
                const area = shopConfig.decorationAreas.find((item) => item.id === selected.areaId);
                if (!area) return null;
                return (
                  <li
                    key={selected.areaId}
                    className="flex items-start justify-between gap-3 border-b border-line/60 pb-2 last:border-b-0"
                  >
                    <span className="min-w-0">
                      <span className="block text-[14px] text-ink">{area.name}</span>
                      <span className="block text-[12px] text-muted">{area.description}</span>
                    </span>
                    <span className="shrink-0 rounded-full border border-line px-2.5 py-0.5 text-[11.5px] text-muted">
                      {priorityLabels[selected.priority]}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-[13px] text-muted">装花場所は未選択です。</p>
          )}
        </SummarySection>

        {/* 予算配分 */}
        <SummarySection title="予算配分の目安">
          <BudgetAllocation allocation={result.allocation} />
        </SummarySection>

        {/* 参考イメージ */}
        <SummarySection title="参考イメージ">
          {values.reference.images.length > 0 ? (
            <ul className="mb-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {values.reference.images.map((image) => (
                <li key={image.id} className="overflow-hidden rounded-lg border border-line">
                  <div className="aspect-square w-full bg-surface">
                    {/* ブラウザ内に保存された画像 */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image.dataUrl} alt={image.name} className="h-full w-full object-cover" />
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
          <SummaryList>
            <SummaryRow
              label="参考URL"
              value={
                values.reference.referenceUrls ? (
                  <span className="block whitespace-pre-wrap break-all">
                    {values.reference.referenceUrls}
                  </span>
                ) : (
                  ''
                )
              }
            />
            <SummaryRow label="好きなポイント" value={values.reference.likedPoints} />
            <SummaryRow label="避けたいデザイン" value={values.reference.avoidDesign} />
          </SummaryList>
        </SummarySection>

        {/* 花屋への要望 */}
        <SummarySection title="花屋への要望">
          <SummaryList>
            <SummaryRow label="相談したい内容" value={values.contact.message} emptyText="特になし" />
            <SummaryRow label="避けたい印象" value={values.theme.avoidImpression} emptyText="特になし" />
            <SummaryRow label="避けたいデザイン" value={values.reference.avoidDesign} emptyText="特になし" />
            <SummaryRow label="会場からの制約" value={values.venue.venueNotes} emptyText="特になし" />
          </SummaryList>
        </SummarySection>

        {/* 連絡先 */}
        <SummarySection title="ご連絡先">
          <SummaryList>
            <SummaryRow label="お名前" value={values.contact.name} />
            <SummaryRow label="会社名・団体名" value={values.contact.company} />
            <SummaryRow label="メールアドレス" value={values.contact.email} />
            <SummaryRow label="電話番号" value={values.contact.phone} />
            <SummaryRow
              label="希望する連絡方法"
              value={
                values.contact.preferredMethod
                  ? contactMethodLabels[values.contact.preferredMethod]
                  : ''
              }
            />
            <SummaryRow
              label="打ち合わせ希望日"
              value={
                values.contact.preferredMeetingDate
                  ? formatJapaneseDate(values.contact.preferredMeetingDate)
                  : ''
              }
            />
          </SummaryList>
        </SummarySection>

        {/* 注意事項 */}
        <DisclaimerBox items={shopConfig.disclaimers.result} title="ご確認いただきたいこと" />
      </div>

      {/* 操作ボタン（印刷時は非表示） */}
      <div className="no-print mt-10 space-y-5">
        <ConsultationButton result={result} />

        <div className="grid gap-2 sm:grid-cols-2">
          <EditButton />
          <PrintButton />
          <CopyButton result={result} />
          <DownloadJsonButton result={result} />
        </div>

        <MailTextPanel result={result} />

        <div className="pt-2">
          <ResetButton />
        </div>
      </div>
    </div>
  );
}
