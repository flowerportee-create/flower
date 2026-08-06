'use server';

import { randomUUID } from 'node:crypto';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { createPaymentLink, squareConfigured } from '@/lib/square';
import type { JoinState, Participant, Project, TagStyle } from '@/lib/types';
import { AMOUNT_MAX, CUSTOM_AMOUNT_MIN, UNIT_AMOUNT_OPTIONS, isTagStyle } from '@/lib/flower';
import { absoluteUrl, isDeadlinePassed } from '@/lib/utils';

function isAllowedAmount(amount: number): boolean {
  if (!Number.isInteger(amount) || amount <= 0 || amount > AMOUNT_MAX) return false;
  if (UNIT_AMOUNT_OPTIONS.includes(amount as (typeof UNIT_AMOUNT_OPTIONS)[number])) return true;
  // 「それ以上」は自由入力だが、下限は設ける
  return amount >= CUSTOM_AMOUNT_MIN;
}

/**
 * 参加申し込み。
 *
 * 参加者をいったん payment_status='pending' で仮登録し、Square の決済ページへ送る。
 * 支払いが確認できた時点（戻り先ページ、または Webhook）で 'paid' に変え、
 * そこで初めて集計・立て札・完成報告に反映される。
 */
export async function startJoin(_prev: JoinState, formData: FormData): Promise<JoinState> {
  const token = String(formData.get('token') ?? '');
  if (!/^[0-9a-f]{8,64}$/.test(token)) {
    return { error: 'URLが正しくありません。', success: false };
  }

  const name = String(formData.get('name') ?? '').trim().slice(0, 60);
  const title = String(formData.get('title') ?? '').trim().slice(0, 40);
  const amount = Number(formData.get('amount'));
  const isAnonymous = formData.get('is_anonymous') === 'on';

  const tagStyleRaw = String(formData.get('tag_style') ?? '');
  const tagStyle: TagStyle = isAnonymous
    ? 'none'
    : isTagStyle(tagStyleRaw)
      ? tagStyleRaw
      : 'name';

  if (!name) {
    return { error: 'お名前をご入力ください。', success: false };
  }

  if (!isAllowedAmount(amount)) {
    return {
      error: `参加金額を選び直してください。「それ以上」の場合は ${CUSTOM_AMOUNT_MIN.toLocaleString(
        'ja-JP'
      )} 円以上 ${AMOUNT_MAX.toLocaleString('ja-JP')} 円以下でご入力ください。`,
      success: false
    };
  }

  if (!squareConfigured()) {
    return {
      error: 'ただいまカード決済をご利用いただけません。恐れ入りますが幹事の方にご連絡ください。',
      success: false
    };
  }

  const supabase = createAdminClient();
  const { data: projectRow } = await supabase
    .from('projects')
    .select('*')
    .eq('share_token', token)
    .maybeSingle();

  if (!projectRow) {
    return { error: '企画が見つかりませんでした。', success: false };
  }
  const project = projectRow as Project;

  if (project.status === 'closed') {
    return { error: 'この企画は受付を終了しています。', success: false };
  }

  if (isDeadlinePassed(project.entry_deadline)) {
    return { error: '参加締切を過ぎています。幹事の方にご連絡ください。', success: false };
  }

  const { data: inserted, error: insertError } = await supabase
    .from('participants')
    .insert({
      project_id: project.id,
      name,
      title,
      amount,
      tag_style: tagStyle,
      is_anonymous: isAnonymous,
      payment_status: 'pending'
    })
    .select('id, payment_token')
    .maybeSingle();

  if (insertError || !inserted) {
    return { error: '登録できませんでした。時間をおいて再度お試しください。', success: false };
  }

  const participant = inserted as Pick<Participant, 'id' | 'payment_token'>;

  const headerList = await headers();
  const returnUrl = absoluteUrl(
    headerList.get('host'),
    headerList.get('x-forwarded-proto'),
    `/j/${token}/complete?t=${participant.payment_token}`
  );

  let checkoutUrl: string;
  try {
    const link = await createPaymentLink({
      name: `${project.title}（${project.recipient_name} 様へのお祝い花）`,
      amountYen: amount,
      redirectUrl: returnUrl,
      idempotencyKey: randomUUID(),
      note: `${project.title} / ${name}`
    });

    await supabase
      .from('participants')
      .update({
        square_payment_link_id: link.paymentLinkId,
        square_order_id: link.orderId
      })
      .eq('id', participant.id);

    checkoutUrl = link.url;
  } catch (error) {
    // 決済リンクが作れなかった仮登録は残さない
    await supabase.from('participants').delete().eq('id', participant.id);
    console.error('Square の決済リンク作成に失敗しました', error);
    return {
      error: '決済ページを開けませんでした。時間をおいて再度お試しください。',
      success: false
    };
  }

  // redirect は内部で例外を投げるため、必ず try/catch の外で呼ぶ
  redirect(checkoutUrl);
}
