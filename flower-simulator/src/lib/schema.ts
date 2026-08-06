/**
 * Zod によるフォームのバリデーション定義と、初期値。
 * 必須項目を増やしたい場合は、該当項目の .min(1, ...) などを追加してください。
 */

import { z } from 'zod';
import type { SimulationFormValues } from '@/types';

/** 数値入力（未入力のときは空文字を許容します） */
const numberOrEmpty = z.union([z.number(), z.literal('')]);

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* -------------------------------------------------------------------------- */
/* 各ステップのスキーマ                                                        */
/* -------------------------------------------------------------------------- */

export const venueSchema = z.object({
  // ※必須
  eventDate: z.string().min(1, { message: '開催日を選択してください' }),
  venueName: z.string(),
  area: z.string(),
  // ※必須
  locationType: z.enum(['indoor', 'outdoor', 'both', 'unknown'], {
    message: '屋内／屋外を選択してください',
  }),
  // ※必須
  guestCount: numberOrEmpty
    .refine((value) => typeof value === 'number' && Number.isFinite(value), {
      message: '参加人数を入力してください',
    })
    .refine((value) => typeof value !== 'number' || (value >= 1 && value <= 100000), {
      message: '1〜100000の範囲で入力してください',
    }),
  venueSize: z.union([z.enum(['small', 'medium', 'large', 'unknown']), z.literal('')]),
  tableCount: numberOrEmpty,
  eventTime: z.string(),
  loadInTime: z.string(),
  removal: z.union([z.enum(['required', 'notRequired', 'undecided']), z.literal('')]),
  venueNotes: z.string(),
});

export const budgetSchema = z.object({
  inputMode: z.enum(['amount', 'range']),
  amount: numberOrEmpty,
  rangeId: z.string(),
  taxType: z.union([z.enum(['included', 'excluded', 'unknown']), z.literal('')]),
  includesSetupFee: z.union([z.enum(['yes', 'no', 'unknown']), z.literal('')]),
  includesRemovalFee: z.union([z.enum(['yes', 'no', 'unknown']), z.literal('')]),
  flexibility: z.union([z.enum(['strict', 'negotiable', 'idealFirst']), z.literal('')]),
});

export const themeSchema = z.object({
  theme: z.string().max(200, { message: '200文字以内で入力してください' }),
  concept: z.string().max(1000, { message: '1000文字以内で入力してください' }),
  impressionTags: z.array(z.string()),
  keywords: z.string().max(300, { message: '300文字以内で入力してください' }),
  avoidImpression: z.string().max(500, { message: '500文字以内で入力してください' }),
});

export const colorSchema = z.object({
  mainColorId: z.string(),
  subColorIds: z.array(z.string()),
  accentColorIds: z.array(z.string()),
  avoidColorIds: z.array(z.string()),
  saturation: z.union([z.enum(['pale', 'muted', 'vivid', 'deep', 'any']), z.literal('')]),
  brightness: z.union([z.enum(['bright', 'calm', 'dark', 'any']), z.literal('')]),
});

export const areaSchema = z.object({
  areaId: z.string(),
  priority: z.enum(['high', 'medium', 'low']),
});

export const referenceImageSchema = z.object({
  id: z.string(),
  name: z.string(),
  dataUrl: z.string(),
  kind: z.enum(['reference', 'venue']),
});

export const referenceSchema = z.object({
  images: z.array(referenceImageSchema),
  referenceUrls: z.string().max(2000, { message: '2000文字以内で入力してください' }),
  likedPoints: z.string().max(1000, { message: '1000文字以内で入力してください' }),
  avoidDesign: z.string().max(1000, { message: '1000文字以内で入力してください' }),
});

export const contactSchema = z.object({
  // ※必須
  name: z.string().min(1, { message: 'お名前を入力してください' }).max(100),
  company: z.string().max(100),
  // ※必須
  email: z
    .string()
    .min(1, { message: 'メールアドレスを入力してください' })
    .refine((value) => emailPattern.test(value), {
      message: 'メールアドレスの形式が正しくありません',
    }),
  phone: z
    .string()
    .max(20)
    .refine((value) => value === '' || /^[0-9+\-() ]{6,20}$/.test(value), {
      message: '電話番号の形式が正しくありません',
    }),
  preferredMethod: z.union([z.enum(['email', 'phone', 'line', 'any']), z.literal('')]),
  message: z.string().max(2000, { message: '2000文字以内で入力してください' }),
  preferredMeetingDate: z.string(),
  // ※必須
  privacyAgreed: z.boolean().refine((value) => value === true, {
    message: '個人情報の取り扱いへの同意が必要です',
  }),
});

/* -------------------------------------------------------------------------- */
/* 全体スキーマ                                                                */
/* -------------------------------------------------------------------------- */

export const simulationSchema = z.object({
  // ※必須
  sceneId: z.string().min(1, { message: 'シーンを選択してください' }),
  venue: venueSchema,
  budget: budgetSchema,
  theme: themeSchema,
  styleIds: z.array(z.string()),
  color: colorSchema,
  flowerIds: z.array(z.string()),
  flowersOmakase: z.boolean(),
  areas: z.array(areaSchema),
  reference: referenceSchema,
  contact: contactSchema,
});

/* -------------------------------------------------------------------------- */
/* 初期値                                                                      */
/* -------------------------------------------------------------------------- */

export const defaultValues: SimulationFormValues = {
  sceneId: '',
  venue: {
    eventDate: '',
    venueName: '',
    area: '',
    locationType: '',
    guestCount: '',
    venueSize: '',
    tableCount: '',
    eventTime: '',
    loadInTime: '',
    removal: '',
    venueNotes: '',
  },
  budget: {
    inputMode: 'range',
    amount: '',
    rangeId: '',
    taxType: '',
    includesSetupFee: '',
    includesRemovalFee: '',
    flexibility: '',
  },
  theme: {
    theme: '',
    concept: '',
    impressionTags: [],
    keywords: '',
    avoidImpression: '',
  },
  styleIds: [],
  color: {
    mainColorId: '',
    subColorIds: [],
    accentColorIds: [],
    avoidColorIds: [],
    saturation: '',
    brightness: '',
  },
  flowerIds: [],
  flowersOmakase: false,
  areas: [],
  reference: {
    images: [],
    referenceUrls: '',
    likedPoints: '',
    avoidDesign: '',
  },
  contact: {
    name: '',
    company: '',
    email: '',
    phone: '',
    preferredMethod: '',
    message: '',
    preferredMeetingDate: '',
    privacyAgreed: false,
  },
};

/** ステップごとに検証するフィールド名（「次へ」を押したときに使います） */
export const stepFieldNames = {
  1: ['sceneId'],
  2: ['venue.eventDate', 'venue.locationType', 'venue.guestCount'],
  3: [],
  4: ['theme.theme', 'theme.concept', 'theme.keywords', 'theme.avoidImpression'],
  5: [],
  6: [],
  7: [],
  8: [],
  9: ['reference.referenceUrls', 'reference.likedPoints', 'reference.avoidDesign'],
  10: [
    'contact.name',
    'contact.email',
    'contact.phone',
    'contact.message',
    'contact.privacyAgreed',
  ],
} as const;
