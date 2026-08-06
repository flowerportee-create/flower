import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { getOrderPaymentState } from '@/lib/square';
import type { Participant } from '@/lib/types';

/**
 * Square に問い合わせて、参加者の支払い状況を確定させる。
 *
 * 戻り先URLのクエリではなく必ず Square の注文情報を見る。
 * 支払い済みの行はそのまま返し、二重更新しない。
 */
export async function settleParticipantPayment(
  participant: Pick<Participant, 'id' | 'amount' | 'payment_status' | 'square_order_id'>
): Promise<'paid' | 'pending' | 'unavailable'> {
  if (participant.payment_status === 'paid') return 'paid';
  if (!participant.square_order_id) return 'unavailable';

  let state;
  try {
    state = await getOrderPaymentState(participant.square_order_id);
  } catch (error) {
    console.error('Square の注文照会に失敗しました', error);
    return 'unavailable';
  }

  if (!state.paid) return 'pending';

  // 支払われた金額が申込額と食い違う場合は自動確定させず、人が確認する
  if (state.amountYen !== null && state.amountYen !== participant.amount) {
    console.error(
      `支払金額が一致しません participant=${participant.id} ` +
        `申込=${participant.amount} 決済=${state.amountYen}`
    );
    return 'pending';
  }

  const supabase = createAdminClient();
  await supabase
    .from('participants')
    .update({
      payment_status: 'paid',
      square_payment_id: state.paymentId,
      paid_at: new Date().toISOString()
    })
    .eq('id', participant.id)
    .eq('payment_status', 'pending');

  return 'paid';
}
