import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import ParticipantList from '@/components/ParticipantList';
import ProjectSummary from '@/components/ProjectSummary';
import ShareLink from '@/components/ShareLink';
import SiteHeader from '@/components/SiteHeader';
import { EntryBadge } from '@/components/StatusBadge';
import FlowerImage from '@/components/FlowerImage';
import { createClient } from '@/lib/supabase/server';
import type { Participant, Project, ProjectPhoto } from '@/lib/types';
import { formatYen, sumAmount } from '@/lib/utils';
import {
  colorLabel,
  defaultArrangement,
  isArrangementKind,
  purposeLabel,
  tagLine,
  tagSizeFor
} from '@/lib/flower';
import CommentEditor from './CommentEditor';
import PhotoManager from './PhotoManager';
import StatusSelect from './StatusSelect';

export const dynamic = 'force-dynamic';

export default async function FloristProjectPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect(`/login?next=/florist/${id}`);

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.role !== 'florist') redirect('/organizer');

  const { data: projectRow } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (!projectRow) notFound();
  const project = projectRow as Project;

  const { data: participantRows } = await supabase
    .from('participants')
    .select('*')
    .eq('project_id', project.id)
    .eq('payment_status', 'paid')
    .order('created_at', { ascending: true });

  const participants = (participantRows ?? []) as Participant[];
  const budget = sumAmount(participants);

  const { data: photoRows } = await supabase
    .from('project_photos')
    .select('*')
    .eq('project_id', project.id)
    .order('created_at', { ascending: true });

  const photos = (photoRows ?? []) as ProjectPhoto[];

  // 立て札は金額の大きい順。名前の大きさもこの順で変わる。
  const tagEntries = participants
    .map((p) => ({ line: tagLine(p), amount: p.amount }))
    .filter((e): e is { line: string; amount: number } => e.line !== null)
    .sort((a, b) => b.amount - a.amount);

  return (
    <>
      <SiteHeader />
      <main className="container-app py-8">
        <Link href="/florist" className="text-sm text-muted hover:text-ink">
          ← ご注文一覧へ戻る
        </Link>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <EntryBadge status={project.status} />
        </div>
        <h1 className="mt-3 font-serif text-2xl leading-relaxed text-ink">{project.title}</h1>
        <p className="mt-1 text-sm text-muted">{project.recipient_name} 様へ</p>

        <section className="card mt-6">
          <h2 className="font-serif text-lg text-ink">制作ステータス</h2>
          <div className="mt-4">
            <StatusSelect projectId={project.id} status={project.production_status} />
          </div>
        </section>

        <section className="card mt-4">
          <h2 className="font-serif text-lg text-ink">ご注文内容</h2>
          <div className="mt-2">
            <ProjectSummary project={project} showAddress showNote />
          </div>
          <div className="mt-4 rounded-2xl bg-ivory/50 p-4">
            <p className="text-sm text-muted">ご予算（参加者合計）</p>
            <p className="mt-1 font-serif text-2xl text-ink">{formatYen(budget)}</p>
            {project.target_amount > 0 && (
              <p className="hint">目標金額 {formatYen(project.target_amount)}</p>
            )}
          </div>
        </section>

        <section className="card mt-4">
          <h2 className="font-serif text-lg text-ink">ご希望のイメージ</h2>
          <div className="mx-auto mt-4 max-w-[260px]">
            <FlowerImage
              colorKey={project.color_preference}
              arrangement={
                isArrangementKind(project.arrangement)
                  ? project.arrangement
                  : defaultArrangement(project.purpose)
              }
              alt={`${purposeLabel(project.purpose)}向け、${
                colorLabel(project.color_preference) || project.color_preference
              }のイメージ`}
            />
          </div>
          <p className="hint mt-2 text-center">
            参加ページで参加者にお見せしているイメージです。
          </p>
        </section>

        {tagEntries.length > 0 && (
          <section className="card mt-4">
            <h2 className="font-serif text-lg text-ink">立て札のご指定</h2>
            <p className="hint mt-1">
              ご参加金額の大きい方から順に、お名前を大きくお入れします。
            </p>
            <ul className="mt-4 divide-y divide-ivory text-sm">
              {tagEntries.map((entry, index) => (
                <li key={`${entry.line}-${index}`} className="flex justify-between gap-3 py-2">
                  <span className="text-ink">{entry.line}</span>
                  <span className="whitespace-nowrap text-muted">
                    {formatYen(entry.amount)}・{tagSizeFor(entry.amount).label}
                  </span>
                </li>
              ))}
            </ul>
            <p className="hint mt-3">
              肩書きの有無は参加者ご本人の選択です。連名の札をお仕立ての際の参考にしてください。
            </p>
          </section>
        )}

        <section className="card mt-4">
          <h2 className="font-serif text-lg text-ink">完成写真</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            アップロードした写真は完成報告ページで参加者全員に公開されます。
          </p>
          <div className="mt-4">
            <PhotoManager projectId={project.id} photos={photos} />
          </div>
        </section>

        <section className="card mt-4">
          <h2 className="font-serif text-lg text-ink">花屋からのコメント</h2>
          <div className="mt-3">
            <CommentEditor projectId={project.id} comment={project.florist_comment} />
          </div>
        </section>

        <section className="card mt-4">
          <ShareLink
            path={`/r/${project.report_token}`}
            label="完成報告ページのURL"
            description="幹事・参加者の皆さまにご覧いただけるページです。"
          />
        </section>

        <section className="card mt-4">
          <h2 className="font-serif text-lg text-ink">参加者一覧（{participants.length}名）</h2>
          <div className="mt-2">
            <ParticipantList participants={participants} showAmount={false} />
          </div>
        </section>
      </main>
    </>
  );
}
