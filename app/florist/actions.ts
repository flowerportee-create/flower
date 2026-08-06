'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { PRODUCTION_STATUS_ORDER } from '@/lib/utils';
import type { ActionResult, ProductionStatus } from '@/lib/types';
import { isArrangementKind, isColorKey, isPurposeKey } from '@/lib/flower';

async function requireFlorist() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  return profile?.role === 'florist' ? supabase : null;
}

export async function updateProduction(
  projectId: string,
  status: ProductionStatus
): Promise<ActionResult> {
  if (!PRODUCTION_STATUS_ORDER.includes(status)) {
    return { error: '不正なステータスです。' };
  }

  const supabase = await requireFlorist();
  if (!supabase) return { error: '花屋アカウントでログインしてください。' };

  const { error } = await supabase
    .from('projects')
    .update({ production_status: status })
    .eq('id', projectId);

  if (error) return { error: 'ステータスを更新できませんでした。' };

  revalidatePath(`/florist/${projectId}`);
  revalidatePath('/florist');
  return { error: null };
}

export async function updateFloristComment(
  projectId: string,
  comment: string
): Promise<ActionResult> {
  const supabase = await requireFlorist();
  if (!supabase) return { error: '花屋アカウントでログインしてください。' };

  const { error } = await supabase
    .from('projects')
    .update({ florist_comment: comment.trim().slice(0, 800) })
    .eq('id', projectId);

  if (error) return { error: 'コメントを保存できませんでした。' };

  revalidatePath(`/florist/${projectId}`);
  return { error: null };
}

export async function registerPhoto(
  projectId: string,
  storagePath: string,
  publicUrl: string
): Promise<ActionResult> {
  const supabase = await requireFlorist();
  if (!supabase) return { error: '花屋アカウントでログインしてください。' };

  const { error } = await supabase
    .from('project_photos')
    .insert({ project_id: projectId, storage_path: storagePath, public_url: publicUrl });

  if (error) return { error: '写真を登録できませんでした。' };

  const { data: existing } = await supabase
    .from('projects')
    .select('completed_photo_url')
    .eq('id', projectId)
    .maybeSingle();

  if (!existing?.completed_photo_url) {
    await supabase.from('projects').update({ completed_photo_url: publicUrl }).eq('id', projectId);
  }

  revalidatePath(`/florist/${projectId}`);
  return { error: null };
}

export async function deletePhoto(projectId: string, photoId: string): Promise<ActionResult> {
  const supabase = await requireFlorist();
  if (!supabase) return { error: '花屋アカウントでログインしてください。' };

  const { data: photo } = await supabase
    .from('project_photos')
    .select('storage_path, public_url')
    .eq('id', photoId)
    .eq('project_id', projectId)
    .maybeSingle();

  if (!photo) return { error: '写真が見つかりませんでした。' };

  await supabase.storage.from('flower-photos').remove([photo.storage_path]);
  await supabase.from('project_photos').delete().eq('id', photoId);

  const { data: project } = await supabase
    .from('projects')
    .select('completed_photo_url')
    .eq('id', projectId)
    .maybeSingle();

  if (project?.completed_photo_url === photo.public_url) {
    const { data: next } = await supabase
      .from('project_photos')
      .select('public_url')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    await supabase
      .from('projects')
      .update({ completed_photo_url: next?.public_url ?? null })
      .eq('id', projectId);
  }

  revalidatePath(`/florist/${projectId}`);
  return { error: null };
}

/**
 * 見本写真（用途 × 色 × 花の形）の登録。
 * 登録があれば、参加ページで自動生成のイラストの代わりに表示される。
 */
export async function registerSample(input: {
  purpose: string;
  colorKey: string;
  arrangement: string;
  storagePath: string;
  publicUrl: string;
  caption: string;
}): Promise<ActionResult> {
  const supabase = await requireFlorist();
  if (!supabase) return { error: '花屋アカウントでログインしてください。' };

  if (
    !isPurposeKey(input.purpose) ||
    !isColorKey(input.colorKey) ||
    !isArrangementKind(input.arrangement)
  ) {
    return { error: '用途・色・花の形の指定が正しくありません。' };
  }

  const { error } = await supabase.from('flower_samples').insert({
    purpose: input.purpose,
    color_key: input.colorKey,
    arrangement: input.arrangement,
    storage_path: input.storagePath,
    public_url: input.publicUrl,
    caption: input.caption.trim().slice(0, 120)
  });

  if (error) return { error: '見本写真を登録できませんでした。' };

  revalidatePath('/florist/samples');
  return { error: null };
}

export async function deleteSample(sampleId: string): Promise<ActionResult> {
  const supabase = await requireFlorist();
  if (!supabase) return { error: '花屋アカウントでログインしてください。' };

  const { data: sample } = await supabase
    .from('flower_samples')
    .select('storage_path')
    .eq('id', sampleId)
    .maybeSingle();

  if (!sample) return { error: '見本写真が見つかりませんでした。' };

  await supabase.storage.from('flower-photos').remove([sample.storage_path]);
  await supabase.from('flower_samples').delete().eq('id', sampleId);

  revalidatePath('/florist/samples');
  return { error: null };
}
