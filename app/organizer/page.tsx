import Link from 'next/link';
import { redirect } from 'next/navigation';
import SiteHeader from '@/components/SiteHeader';
import { EntryBadge, ProductionBadge } from '@/components/StatusBadge';
import { createClient } from '@/lib/supabase/server';
import type { Participant, Project } from '@/lib/types';
import { formatDate, formatYen, sumAmount } from '@/lib/utils';

export const metadata = { title: 'マイ企画 | ハナタバ' };
export const dynamic = 'force-dynamic';

export default async function OrganizerHomePage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect('/login?next=/organizer');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.role === 'florist') redirect('/florist');

  const { data: projectRows } = await supabase
    .from('projects')
    .select('*')
    .eq('organizer_id', user.id)
    .order('delivery_date', { ascending: true });

  const projects = (projectRows ?? []) as Project[];

  const { data: participantRows } = await supabase
    .from('participants')
    .select('*')
    .in('project_id', projects.length > 0 ? projects.map((p) => p.id) : ['00000000-0000-0000-0000-000000000000']);

  const participants = (participantRows ?? []) as Participant[];

  return (
    <>
      <SiteHeader />
      <main className="container-app py-10">
        <div className="flex items-center justify-between gap-4">
          <h1 className="font-serif text-2xl text-ink">マイ企画</h1>
          <Link href="/organizer/new" className="btn-primary">
            企画をつくる
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="card mt-8 text-center">
            <p className="text-sm leading-relaxed text-muted">
              まだ企画がありません。
              <br />
              「企画をつくる」から最初のお祝い花を立ち上げましょう。
            </p>
          </div>
        ) : (
          <ul className="mt-6 space-y-3">
            {projects.map((project) => {
              const mine = participants.filter((p) => p.project_id === project.id);
              const total = sumAmount(mine);

              return (
                <li key={project.id}>
                  <Link
                    href={`/organizer/${project.id}`}
                    className="card block transition hover:border-moss/40"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <EntryBadge status={project.status} />
                      <ProductionBadge status={project.production_status} />
                    </div>
                    <h2 className="mt-3 font-serif text-lg text-ink">{project.title}</h2>
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
                        <dt className="text-xs text-muted">合計金額</dt>
                        <dd className="mt-0.5 text-sm text-ink">{formatYen(total)}</dd>
                      </div>
                    </dl>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </>
  );
}
