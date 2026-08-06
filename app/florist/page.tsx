import Link from 'next/link';
import { redirect } from 'next/navigation';
import SiteHeader from '@/components/SiteHeader';
import { EntryBadge, ProductionBadge } from '@/components/StatusBadge';
import { createClient } from '@/lib/supabase/server';
import type { Participant, Project } from '@/lib/types';
import { formatDate, formatYen, sumAmount, todayInJst } from '@/lib/utils';

export const metadata = { title: '花屋管理 | ハナタバ' };
export const dynamic = 'force-dynamic';

export default async function FloristHomePage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect('/login?next=/florist');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.role !== 'florist') {
    return (
      <>
        <SiteHeader />
        <main className="container-app py-16 text-center">
          <h1 className="font-serif text-xl text-ink">閲覧権限がありません</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            この画面は花屋アカウントの方のみご利用いただけます。
          </p>
          <Link href="/organizer" className="btn-secondary mt-6">
            マイ企画へ
          </Link>
        </main>
      </>
    );
  }

  const { data: projectRows } = await supabase
    .from('projects')
    .select('*')
    .order('delivery_date', { ascending: true });

  const projects = (projectRows ?? []) as Project[];

  const { data: participantRows } = await supabase
    .from('participants')
    .select('*')
    .eq('payment_status', 'paid');
  const participants = (participantRows ?? []) as Participant[];

  const todayJst = todayInJst();
  const upcoming = projects.filter((p) => p.delivery_date >= todayJst);
  const past = projects.filter((p) => p.delivery_date < todayJst);

  return (
    <>
      <SiteHeader />
      <main className="container-app py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-serif text-2xl text-ink">ご注文一覧</h1>
            <p className="mt-2 text-sm text-muted">お届け日の近い順に表示しています。</p>
          </div>
          <Link href="/florist/samples" className="btn-secondary text-sm">
            見本写真の管理
          </Link>
        </div>

        <Section title="これからお届け" projects={upcoming} participants={participants} />
        <Section title="お届け済み・過去" projects={past} participants={participants} />
      </main>
    </>
  );
}

function Section({
  title,
  projects,
  participants
}: {
  title: string;
  projects: Project[];
  participants: Participant[];
}) {
  return (
    <section className="mt-8">
      <h2 className="font-serif text-lg text-ink">{title}</h2>
      {projects.length === 0 ? (
        <p className="card mt-3 text-center text-sm text-muted">該当するご注文はありません。</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {projects.map((project) => {
            const mine = participants.filter((p) => p.project_id === project.id);
            return (
              <li key={project.id}>
                <Link
                  href={`/florist/${project.id}`}
                  className="card block transition hover:border-moss/40"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <ProductionBadge status={project.production_status} />
                    <EntryBadge status={project.status} />
                  </div>
                  <h3 className="mt-3 font-serif text-lg text-ink">{project.title}</h3>
                  <p className="mt-1 text-sm text-muted">{project.recipient_name} 様へ</p>
                  <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <dt className="text-xs text-muted">お届け日</dt>
                      <dd className="mt-0.5 text-sm text-ink">{formatDate(project.delivery_date)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted">参加人数</dt>
                      <dd className="mt-0.5 text-sm text-ink">{mine.length}名</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted">ご予算</dt>
                      <dd className="mt-0.5 text-sm text-ink">{formatYen(sumAmount(mine))}</dd>
                    </div>
                  </dl>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
