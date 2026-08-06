'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import type { JoinState, Project } from '@/lib/types';
import { isDeadlinePassed } from '@/lib/utils';

export async function joinProject(_prev: JoinState, formData: FormData): Promise<JoinState> {
  const token = String(formData.get('token') ?? '');
  if (!/^[0-9a-f]{8,64}$/.test(token)) {
    return { error: 'URLが正しくありません。', success: false };
  }

  const name = String(formData.get('name') ?? '').trim().slice(0, 60);
  const message = String(formData.get('message') ?? '').trim().slice(0, 500);
  const amountRaw = Number(formData.get('amount'));
  const includeInTag = formData.get('include_in_tag') === 'on';
  const isAnonymous = formData.get('is_anonymous') === 'on';

  if (!name) {
    return { error: 'お名前をご入力ください。', success: false };
  }

  if (!Number.isFinite(amountRaw) || amountRaw <= 0) {
    return { error: '参加金額は1円以上でご入力ください。', success: false };
  }

  const amount = Math.min(Math.floor(amountRaw), 10_000_000);

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

  const { error } = await supabase.from('participants').insert({
    project_id: project.id,
    name,
    amount,
    message,
    include_in_tag: isAnonymous ? false : includeInTag,
    is_anonymous: isAnonymous
  });

  if (error) {
    return { error: '登録できませんでした。時間をおいて再度お試しください。', success: false };
  }

  revalidatePath(`/j/${token}`);
  return { error: null, success: true };
}
