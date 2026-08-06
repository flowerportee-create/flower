'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { FormState } from '@/lib/types';

function text(formData: FormData, key: string, max: number): string {
  return String(formData.get(key) ?? '')
    .trim()
    .slice(0, max);
}

function amount(formData: FormData, key: string): number {
  const raw = Number(formData.get(key));
  if (!Number.isFinite(raw) || raw < 0) return 0;
  return Math.min(Math.floor(raw), 100_000_000);
}

export async function createProject(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'ログインが必要です。' };
  }

  const title = text(formData, 'title', 80);
  const recipientName = text(formData, 'recipient_name', 80);
  const deliveryAddress = text(formData, 'delivery_address', 300);
  const deliveryDate = text(formData, 'delivery_date', 10);
  const entryDeadline = text(formData, 'entry_deadline', 10);

  if (!title || !recipientName || !deliveryAddress || !deliveryDate || !entryDeadline) {
    return { error: '必須項目をすべてご入力ください。' };
  }

  if (entryDeadline > deliveryDate) {
    return { error: '参加締切はお届け希望日より前に設定してください。' };
  }

  const { data, error } = await supabase
    .from('projects')
    .insert({
      organizer_id: user.id,
      title,
      recipient_name: recipientName,
      delivery_address: deliveryAddress,
      delivery_date: deliveryDate,
      entry_deadline: entryDeadline,
      target_amount: amount(formData, 'target_amount'),
      unit_amount: amount(formData, 'unit_amount'),
      flower_type: text(formData, 'flower_type', 80),
      color_preference: text(formData, 'color_preference', 80),
      tag_name: text(formData, 'tag_name', 120),
      message: text(formData, 'message', 500),
      note: text(formData, 'note', 500),
      status: 'open',
      production_status: 'pending',
      florist_comment: '',
      completed_photo_url: null
    })
    .select('id')
    .single();

  if (error || !data) {
    return { error: '企画を作成できませんでした。時間をおいて再度お試しください。' };
  }

  revalidatePath('/organizer');
  redirect(`/organizer/${data.id}`);
}

export async function closeEntry(projectId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from('projects')
    .update({ status: 'closed' })
    .eq('id', projectId)
    .eq('organizer_id', user.id);

  revalidatePath(`/organizer/${projectId}`);
}

export async function reopenEntry(projectId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from('projects')
    .update({ status: 'open' })
    .eq('id', projectId)
    .eq('organizer_id', user.id);

  revalidatePath(`/organizer/${projectId}`);
}

export async function deleteParticipant(projectId: string, participantId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return;

  // RLS で幹事本人の企画のみ削除可能
  await supabase.from('participants').delete().eq('id', participantId).eq('project_id', projectId);

  revalidatePath(`/organizer/${projectId}`);
}
