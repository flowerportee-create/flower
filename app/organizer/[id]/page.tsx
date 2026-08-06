import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import MessageList from '@/components/MessageList';
import ProgressBar from '@/components/ProgressBar';
import ProjectSummary from '@/components/ProjectSummary';
import ShareLink from '@/components/ShareLink';
import SiteHeader from '@/components/SiteHeader';
import { EntryBadge, ProductionBadge } from '@/components/StatusBadge';
import { createClient } from '@/lib/supabase/server';
import type { Participant, Project } from '@/lib/types';
import { formatDateTime, formatYen, sumAmount } from '@/lib/utils';
import EntryToggle from './EntryToggle';
import ParticipantRow from './ParticipantRow';
import CsvButton from './CsvButton';

export const dynamic = 'force-dynamic';

export default async function OrganizerProjectPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect(`/login?next=/organizer/${id}`);

  const { data: projectRow } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .eq('organizer_id', user.id)
    .maybeSingle();

  if (!projectRow) notFound();
  const project = projectRow as Project;

  const { data: participantRows } = await supabase
    .from('participants')
    .select('*')
    .eq('project_id', project.id)
    .order('created_at', { ascending: true });

  const participants = (participantRows ?? []) as Participant[];
  const total = sumAmount(participants);
  const tagNames = participants
    .filter((p) => p.include_in_tag && !p.is_anonymous)
    .map((p) => p.name);

  return (
    <>
      <SiteHeader />
      <main className="container-app py-8">
        <Link href="/organizer" className="text-sm text-muted hover:text-ink">
          ← マイ企画へ戻る
        </Link>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <EntryBadge status={project.status} />
          <ProductionBadge status={project.production_status} />
        </div>
        <h1 className="mt-3 font-serif text-2xl leading-relaxed text-ink">{project.title}</h1>
        <p className="mt-1 text-sm text-muted">{project.recipient_name} 様へ</p>

        <section className="mt-6 grid grid-cols-3 gap-3">
          <div className="stat">
            <p className="stat-value">{participants.length}</p>
            <p className="stat-label">参加人数</p>
          </div>
          <div className="stat">
            <p className="stat-value">{formatYen(total)}</p>
            <p className="stat-label">合計金額</p>
          </div>
          <div className="stat">
            <p className="stat-value">{formatYen(Math.max(project.target_amount - total, 0))}</p>
            <p className="stat-label">目標までの残額</p>
          </div>
        </section>

        <section className="card mt-4">
          <ProgressBar current={total} target={project.target_amount} />
        </section>

        <section className="mt-4 space-y-3">
          <ShareLink
            path={`/j/${project.share_token}`}
            label="参加者用の共有URL"
            description="このURLを社内チャットなどで共有してください。ログインは不要です。"
          />
          {project.production_status === 'completed' || project.production_status === 'delivered' ? (
            <ShareLink
              path={`/r/${project.report_token}`}
              label="完成報告ページのURL"
              description="完成写真と花屋からのコメントを参加者全員にご覧いただけます。"
            />
          ) : null}
        </section>

        <section className="card mt-4">
          <h2 className="font-serif text-lg text-ink">企画内容</h2>
          <div className="mt-2">
            <ProjectSummary project={project} showAddress showNote />
          </div>
        </section>

        <section className="card mt-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-serif text-lg text-ink">参加者一覧</h2>
            <CsvButton projectId={project.id} projectTitle={project.title} />
          </div>

          {participants.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">まだ参加者はいません。</p>
          ) : (
            <ul className="mt-2 divide-y divide-ivory">
              {participants.map((p) => (
                <ParticipantRow key={p.id} projectId={project.id} participant={p} />
              ))}
            </ul>
          )}

          {tagNames.length > 0 && (
            <div className="mt-5 rounded-2xl bg-ivory/50 p-4">
              <p className="text-sm font-medium text-ink">札名への掲載を希望された方</p>
              <p className="mt-1.5 text-sm leading-relaxed text-ink">{tagNames.join('、')}</p>
              <p className="hint">連名の札をご希望の場合は、この内容を花屋にお伝えください。</p>
            </div>
          )}
        </section>

        <section className="card mt-4">
          <h2 className="font-serif text-lg text-ink">メッセージ一覧</h2>
          <div className="mt-3">
            <MessageList participants={participants} />
          </div>
        </section>

        <section className="card mt-4">
          <h2 className="font-serif text-lg text-ink">受付の管理</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {project.status === 'open'
              ? '受付を終了すると、共有URLからの新規参加ができなくなります。'
              : '現在は受付終了中です。再開すると共有URLから参加できるようになります。'}
          </p>
          <div className="mt-4">
            <EntryToggle projectId={project.id} status={project.status} />
          </div>
        </section>

        <p className="mt-8 text-center text-xs text-muted">
          最終更新 {formatDateTime(project.updated_at)}
        </p>
      </main>
    </>
  );
}
