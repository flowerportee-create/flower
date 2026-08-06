import Link from 'next/link';
import { notFound } from 'next/navigation';
import ProgressBar from '@/components/ProgressBar';
import ProjectSummary from '@/components/ProjectSummary';
import FlowerImage from '@/components/FlowerImage';
import { createAdminClient } from '@/lib/supabase/admin';
import type { FlowerSample, Participant, Project } from '@/lib/types';
import { displayName, formatDate, formatYen, isDeadlinePassed, sumAmount } from '@/lib/utils';
import {
  colorLabel,
  defaultArrangement,
  isArrangementKind,
  purposeLabel
} from '@/lib/flower';
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

  // 決済が完了した参加者のみを表示・集計の対象にする
  const { data: participantRows } = await supabase
    .from('participants')
    .select('*')
    .eq('project_id', project.id)
    .eq('payment_status', 'paid')
    .order('created_at', { ascending: true });

  const participants = (participantRows ?? []) as Participant[];
  const total = sumAmount(participants);

  // 花屋が見本写真を登録していれば、自動生成のイラストより優先して見せる
  const { data: sampleRow } = await supabase
    .from('flower_samples')
    .select('*')
    .eq('purpose', project.purpose)
    .eq('color_key', project.color_preference)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  const sample = (sampleRow ?? null) as FlowerSample | null;
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
            <div className="stat flex flex-col justify-center">
              <p className="stat-value-sm">{formatDate(project.entry_deadline)}</p>
              <p className="stat-label">参加締切</p>
            </div>
          </div>
        </section>

        <section className="card">
          <h2 className="font-serif text-lg text-ink">お花の内容</h2>
          <div className="mt-4">
            <FlowerImage
              colorKey={project.color_preference}
              arrangement={
                isArrangementKind(project.arrangement)
                  ? project.arrangement
                  : defaultArrangement(project.purpose)
              }
              photoUrl={sample?.public_url ?? null}
              alt={`${purposeLabel(project.purpose)}向け、${
                colorLabel(project.color_preference) || project.color_preference
              }のお花のイメージ`}
            />
            <p className="hint mt-2 text-center">
              {sample
                ? sample.caption || 'これまでのお仕立て例です。'
                : 'イメージです。実際のお花の種類・本数はお届け時期により変わります。'}
            </p>
          </div>
          <div className="mt-4">
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
                ログインは不要です。お支払いはカード決済のみとなります。
              </p>
              <div className="mt-5">
                <JoinForm
                  token={token}
                  unitAmount={project.unit_amount}
                  tagName={project.tag_name}
                  existingNames={participants
                    .filter((p) => p.include_in_tag && !p.is_anonymous)
                    .map((p) => ({ name: p.name, amount: p.amount }))}
                />
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
          お支払いは Square の決済ページで行います。
          <br />
          カード情報が当サイトに保存されることはありません。
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
