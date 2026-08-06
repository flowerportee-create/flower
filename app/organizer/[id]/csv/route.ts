import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { Participant, Project } from '@/lib/types';
import { buildCsv, formatDateTime, safeFileName, sumAmount } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { data: projectRow } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .eq('organizer_id', user.id)
    .maybeSingle();

  if (!projectRow) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }
  const project = projectRow as Project;

  const { data: participantRows } = await supabase
    .from('participants')
    .select('*')
    .eq('project_id', project.id)
    .order('created_at', { ascending: true });

  const participants = (participantRows ?? []) as Participant[];

  const rows: (string | number)[][] = [
    ['お名前', '参加金額', '札名掲載', '匿名表示', 'メッセージ', '登録日時'],
    ...participants.map((p) => [
      p.name,
      p.amount,
      p.include_in_tag ? '希望する' : '希望しない',
      p.is_anonymous ? 'はい' : 'いいえ',
      p.message,
      formatDateTime(p.created_at)
    ]),
    [],
    ['合計人数', participants.length],
    ['合計金額', sumAmount(participants)],
    ['目標金額', project.target_amount]
  ];

  // Excel での文字化けを避けるため BOM を付与する
  const csv = `﻿${buildCsv(rows)}`;
  const fileName = `${safeFileName(project.title, 'project')}_participants.csv`;

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="participants.csv"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
      'Cache-Control': 'no-store'
    }
  });
}
