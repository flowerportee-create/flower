/**
 * 相談用テキストの生成と、問い合わせ先URLの組み立て
 * -----------------------------------------------------------------------------
 * 「クリップボードにコピー」「メール本文」「この内容で花屋に相談する」で使用します。
 * 問い合わせ方法の切り替えは src/config/shop.ts の contactChannel で行います。
 */

import { shopConfig } from '@/config/shop';
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
import { describeBudget } from '@/lib/budget';
import { getFlowersByIds } from '@/lib/season';
import { formatJapaneseDate, formatYen } from '@/lib/utils';
import type { SimulationResult } from '@/types';

/** mailto の本文が長くなりすぎるとメールソフトが開けないため、上限を設けます */
const MAILTO_BODY_MAX_LENGTH = 1800;

function colorNames(ids: string[]): string {
  return ids
    .map((id) => shopConfig.colors.find((color) => color.id === id)?.name)
    .filter(Boolean)
    .join('、');
}

function line(label: string, value: string | undefined | null): string | null {
  if (!value || !value.trim()) return null;
  return `${label}：${value}`;
}

/** 相談内容の全文（クリップボードコピー・メール本文に使用） */
export function buildConsultationText(result: SimulationResult): string {
  const { values, allocation } = result;
  const scene = shopConfig.scenes.find((item) => item.id === values.sceneId);
  const styles = values.styleIds
    .map((id) => shopConfig.styles.find((style) => style.id === id)?.name)
    .filter(Boolean)
    .join('、');
  const impressions = values.theme.impressionTags
    .map((id) => shopConfig.impressionTags.find((tag) => tag.id === id)?.label)
    .filter(Boolean)
    .join('、');
  const flowers = values.flowersOmakase
    ? '花屋におまかせ'
    : getFlowersByIds(values.flowerIds)
        .map((flower) => `${flower.name}（${priceLevelLabels[flower.priceLevel]}／${availabilityLabels[flower.availability]}）`)
        .join('、');
  const areas = values.areas
    .map((area) => {
      const master = shopConfig.decorationAreas.find((item) => item.id === area.areaId);
      return master ? `${master.name}（${priorityLabels[area.priority]}）` : null;
    })
    .filter(Boolean)
    .join('、');

  const blocks: string[] = [];

  blocks.push(
    ['【装花プラン】', result.title, '', result.concept].join('\n'),
  );

  blocks.push(
    [
      '■ 基本情報',
      line('シーン', scene?.name),
      line('開催日', values.venue.eventDate ? formatJapaneseDate(values.venue.eventDate) : ''),
      line('会場名', values.venue.venueName),
      line('開催地域', values.venue.area),
      line('屋内／屋外', values.venue.locationType ? locationTypeLabels[values.venue.locationType] : ''),
      line('参加人数', values.venue.guestCount === '' ? '' : `${values.venue.guestCount}名`),
      line('会場の広さ', values.venue.venueSize ? venueSizeLabels[values.venue.venueSize] : ''),
      line('テーブル数', values.venue.tableCount === '' ? '' : `${values.venue.tableCount}卓`),
      line('開催時間', values.venue.eventTime),
      line('搬入希望時間', values.venue.loadInTime),
      line('撤去', values.venue.removal ? removalLabels[values.venue.removal] : ''),
      line('その他の会場情報', values.venue.venueNotes),
    ]
      .filter(Boolean)
      .join('\n'),
  );

  blocks.push(
    [
      '■ ご予算',
      line('装花全体の予算', describeBudget(values)),
      line('税込／税別', values.budget.taxType ? taxTypeLabels[values.budget.taxType] : ''),
      line('搬入設営費', values.budget.includesSetupFee ? `予算に${triStateLabels[values.budget.includesSetupFee]}` : ''),
      line('撤去費', values.budget.includesRemovalFee ? `予算に${triStateLabels[values.budget.includesRemovalFee]}` : ''),
      line('予算の柔軟性', values.budget.flexibility ? flexibilityLabels[values.budget.flexibility] : ''),
    ]
      .filter(Boolean)
      .join('\n'),
  );

  blocks.push(
    [
      '■ テーマ・雰囲気',
      line('テーマ', values.theme.theme),
      line('コンセプト', values.theme.concept),
      line('感じてほしい印象', impressions),
      line('使用したい言葉', values.theme.keywords),
      line('避けたい印象', values.theme.avoidImpression),
      line('テイスト', styles),
    ]
      .filter(Boolean)
      .join('\n'),
  );

  blocks.push(
    [
      '■ カラー',
      line('メインカラー', colorNames([values.color.mainColorId])),
      line('サブカラー', colorNames(values.color.subColorIds)),
      line('アクセントカラー', colorNames(values.color.accentColorIds)),
      line('避けたい色', colorNames(values.color.avoidColorIds)),
      line('彩度', values.color.saturation ? saturationLabels[values.color.saturation] : ''),
      line('明るさ', values.color.brightness ? brightnessLabels[values.color.brightness] : ''),
    ]
      .filter(Boolean)
      .join('\n'),
  );

  blocks.push(['■ 季節の花', line('希望の花材', flowers)].filter(Boolean).join('\n'));

  blocks.push(['■ 装花場所', line('希望の装花場所', areas)].filter(Boolean).join('\n'));

  if (allocation.items.length > 0) {
    const allocationLines = allocation.items.map((item) =>
      allocation.hasAmount && item.amount !== null
        ? `・${item.name}：${formatYen(item.amount)}（${item.ratio}%）`
        : `・${item.name}：${item.ratio}%`,
    );
    blocks.push(
      [
        '■ 予算配分の目安（参考）',
        allocation.hasAmount && allocation.totalAmount !== null
          ? `総額：${formatYen(allocation.totalAmount)}（${allocation.taxLabel}）`
          : '予算未定のため割合のみ',
        ...allocationLines,
      ].join('\n'),
    );
  }

  const referenceBlock = [
    '■ 参考イメージ',
    line('参考URL', values.reference.referenceUrls),
    line('好きなポイント', values.reference.likedPoints),
    line('避けたいデザイン', values.reference.avoidDesign),
    values.reference.images.length > 0
      ? `参考画像：${values.reference.images.length}枚（打ち合わせ時に共有します）`
      : null,
  ].filter(Boolean);
  if (referenceBlock.length > 1) {
    blocks.push(referenceBlock.join('\n'));
  }

  blocks.push(
    [
      '■ ご連絡先',
      line('お名前', values.contact.name),
      line('会社名・団体名', values.contact.company),
      line('メールアドレス', values.contact.email),
      line('電話番号', values.contact.phone),
      line('希望する連絡方法', values.contact.preferredMethod ? contactMethodLabels[values.contact.preferredMethod] : ''),
      line('打ち合わせ希望日', values.contact.preferredMeetingDate ? formatJapaneseDate(values.contact.preferredMeetingDate) : ''),
      line('相談したい内容', values.contact.message),
    ]
      .filter(Boolean)
      .join('\n'),
  );

  blocks.push(
    [
      '───────────────',
      `※ ${shopConfig.appName}で作成した参考資料です。`,
      '※ 記載の金額・花材・内容は目安であり、確定した見積もりではありません。',
    ].join('\n'),
  );

  return blocks.join('\n\n');
}

/** メールの件名（例:「装花相談：2026年10月15日 展示会装花について」） */
export function buildMailSubject(result: SimulationResult): string {
  const scene = shopConfig.scenes.find((item) => item.id === result.values.sceneId);
  const datePart = result.values.venue.eventDate
    ? formatJapaneseDate(result.values.venue.eventDate).replace(/（.）$/, '')
    : '開催日未定';
  const scenePart = scene ? `${scene.titleWord}装花` : '装花';
  return `装花相談：${datePart} ${scenePart}について`;
}

/**
 * 「この内容で花屋に相談する」ボタンの遷移先URLを組み立てます。
 * 設定ファイルの contactChannel.type によって遷移先が変わります。
 */
export function buildConsultationUrl(result: SimulationResult): string {
  const channel = shopConfig.contactChannel;
  const text = buildConsultationText(result);

  switch (channel.type) {
    case 'mailto': {
      const to = channel.mailTo ?? shopConfig.contact.email ?? '';
      const subject = encodeURIComponent(buildMailSubject(result));
      const body = encodeURIComponent(
        text.length > MAILTO_BODY_MAX_LENGTH
          ? `${text.slice(0, MAILTO_BODY_MAX_LENGTH)}\n\n（内容が長いため一部省略しています。詳細はプランシートをご確認ください）`
          : text,
      );
      return `mailto:${to}?subject=${subject}&body=${body}`;
    }
    case 'googleForm': {
      const base = channel.url ?? '';
      if (!base) return '';
      const entryIds = channel.googleFormEntryIds ?? {};
      const params = new URLSearchParams();
      if (entryIds.name) params.set(entryIds.name, result.values.contact.name);
      if (entryIds.email) params.set(entryIds.email, result.values.contact.email);
      if (entryIds.phone) params.set(entryIds.phone, result.values.contact.phone);
      if (entryIds.summary) params.set(entryIds.summary, text);
      const query = params.toString();
      if (!query) return base;
      return base.includes('?') ? `${base}&${query}` : `${base}?${query}`;
    }
    case 'externalForm':
    case 'line':
    default:
      return channel.url ?? '';
  }
}

/**
 * 相談内容をJSONとしてダウンロードするための文字列。
 * 画像そのもの（データが非常に大きいため）はファイル名のみを書き出します。
 */
export function buildJsonExport(result: SimulationResult): string {
  const { images, ...restReference } = result.values.reference;
  return JSON.stringify(
    {
      appName: shopConfig.appName,
      shopName: shopConfig.shopName,
      createdAt: result.createdAt,
      title: result.title,
      concept: result.concept,
      values: {
        ...result.values,
        reference: {
          ...restReference,
          images: images.map(({ id, name, kind }) => ({ id, name, kind })),
        },
      },
      allocation: result.allocation,
    },
    null,
    2,
  );
}
