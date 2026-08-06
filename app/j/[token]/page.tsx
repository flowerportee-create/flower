import Link from 'next/link';
import { notFound } from 'next/navigation';
import ProgressBar from '@/components/ProgressBar';
import ProjectSummary from '@/components/ProjectSummary';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Participant, Project } from '@/lib/types';
import { displayName, formatDate, formatYen, isDeadlinePassed, sumAmount } from '@/lib/utils';
import JoinForm from './JoinForm';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('projects')
    .select('title')
    .eq('share_token', token)
    .maybeSingle();

  return { title: data?.title ? `${data.title} | ハナタバ` : 'お祝い花のご案内 | ハナタバ' };
}

export default async function JoinPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!/^[0-9a-f]{8,64}$/.test(token)) notFound();

  const supabase = createAdminClient();
  const { data: projectRow } = await supabase
    .from('projects')
    .select('*')
    .eq('share_token', token)
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
  const closed = project.status === 'closed' || isDeadlinePassed(project.entry_deadline);
  const reportReady =
    project.production_status === 'completed' || project.production_status === 'delivered';

  return (
    <main className="min-h-screen bg-cream pb-16">
      <header className="border-b border-ivory bg-white">
        <div className="container-app max-w-xl py-8 text-center">
          <p className="text-xs tracking-[0.2em] text-muted">お祝い花のご案内</p>
          <h1 className="mt-3 font-serif text-2xl leading-relaxed text-ink">{project.title}</h1>
          <p className="mt-2 text-sm text-muted">{project.recipient_name} 様へ</p>
        </div>
      </header>

      <div className="container-app max-w-xl space-y-4 py-6">
        <section className="card">
          <ProgressBar current={total} target={project.target_amount} />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="stat">
              <p className="stat-value">{participants.length}</p>
              <p className="stat-label">参加人数</p>
            </div>
            <div className="stat">
              <p className="stat-value">{formatDate(project.entry_deadline)}</p>
              <p className="stat-label">参加締切</p>
            </div>
          </div>
        </section>

        <section className="card">
          <h2 className="font-serif text-lg text-ink">お花の内容</h2>
          <div className="mt-2">
            <ProjectSummary project={project} />
          </div>
        </section>

        {reportReady && (
          <Link
            href={`/r/${project.report_token}`}
            className="card block text-center transition hover:border-moss/40"
          >
            <p className="font-serif text-base text-ink">完成報告ページを見る</p>
            <p className="hint">お届けしたお花の写真をご覧いただけます。</p>
          </Link>
        )}

        <section className="card" id="join">
          <h2 className="font-serif text-lg text-ink">参加する</h2>
          {closed ? (
            <p className="mt-4 rounded-xl bg-ivory/60 px-4 py-5 text-center text-sm leading-relaxed text-muted">
              この企画の受付は終了しました。
              <br />
              ご参加をご希望の場合は幹事の方へ直接ご連絡ください。
            </p>
          ) : (
            <>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                ログインは不要です。集金方法は幹事の方からのご案内をご確認ください。
              </p>
              <div className="mt-5">
                <JoinForm token={token} unitAmount={project.unit_amount} />
              </div>
            </>
          )}
        </section>

        <section className="card">
          <h2 className="font-serif text-lg text-ink">ご参加のみなさま</h2>
          {participants.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">まだ参加者はいません。</p>
          ) : (
            <ul className="mt-3 flex flex-wrap gap-2">
              {participants.map((p) => (
                <li key={p.id} className="badge bg-ivory text-ink">
                  {displayName(p)}
                </li>
              ))}
            </ul>
          )}
          <p className="hint mt-3">個々の参加金額は幹事のみが確認できます。</p>
        </section>

        <p className="px-2 text-center text-xs leading-relaxed text-muted">
          本サービスにオンライン決済機能はありません。
          <br />
          お支払い方法は幹事の方のご案内に従ってください。
        </p>
        {project.target_amount > 0 && (
          <p className="text-center text-xs text-muted">
            現在の合計 {formatYen(total)} / 目標 {formatYen(project.target_amount)}
          </p>
        )}
      </div>
    </main>
  );
}
