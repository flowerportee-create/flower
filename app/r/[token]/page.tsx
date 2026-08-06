import { notFound } from 'next/navigation';
import MessageList from '@/components/MessageList';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Participant, Project, ProjectPhoto } from '@/lib/types';
import { displayName, formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('projects')
    .select('title')
    .eq('report_token', token)
    .maybeSingle();

  return { title: data?.title ? `${data.title} 完成報告 | ハナタバ` : '完成報告 | ハナタバ' };
}

export default async function ReportPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!/^[0-9a-f]{8,64}$/.test(token)) notFound();

  const supabase = createAdminClient();
  const { data: projectRow } = await supabase
    .from('projects')
    .select('*')
    .eq('report_token', token)
    .maybeSingle();

  if (!projectRow) notFound();
  const project = projectRow as Project;

  const { data: photoRows } = await supabase
    .from('project_photos')
    .select('*')
    .eq('project_id', project.id)
    .order('created_at', { ascending: true });

  const photos = (photoRows ?? []) as ProjectPhoto[];

  const { data: participantRows } = await supabase
    .from('participants')
    .select('*')
    .eq('project_id', project.id)
    .order('created_at', { ascending: true });

  const participants = (participantRows ?? []) as Participant[];
  const ready =
    project.production_status === 'completed' || project.production_status === 'delivered';

  return (
    <main className="min-h-screen bg-cream pb-16">
      <header className="border-b border-ivory bg-white">
        <div className="container-app max-w-xl py-10 text-center">
          <p className="text-xs tracking-[0.2em] text-muted">FLOWER REPORT</p>
          <h1 className="mt-3 font-serif text-2xl leading-relaxed text-ink">{project.title}</h1>
          <p className="mt-2 text-sm text-muted">
            {project.recipient_name} 様へ・{formatDate(project.delivery_date)} お届け
          </p>
        </div>
      </header>

      <div className="container-app max-w-xl space-y-4 py-6">
        {!ready ? (
          <section className="card text-center">
            <p className="font-serif text-lg text-ink">ただいま準備中です</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              お花が完成しましたら、こちらのページに写真を掲載いたします。
              <br />
              今しばらくお待ちください。
            </p>
          </section>
        ) : (
          <>
            {photos.length > 0 && (
              <section className="space-y-3">
                {photos.map((photo) => (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    key={photo.id}
                    src={photo.public_url}
                    alt={`${project.title} の完成したお花`}
                    className="w-full rounded-2xl border border-ivory bg-white object-cover shadow-soft"
                  />
                ))}
              </section>
            )}

            {project.florist_comment && (
              <section className="card">
                <h2 className="font-serif text-lg text-ink">花屋からのご挨拶</h2>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-loose text-ink">
                  {project.florist_comment}
                </p>
              </section>
            )}
          </>
        )}

        {project.message && (
          <section className="card text-center">
            <h2 className="font-serif text-lg text-ink">お贈りしたメッセージ</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-loose text-ink">
              {project.message}
            </p>
            {project.tag_name && <p className="mt-4 text-sm text-muted">{project.tag_name}</p>}
          </section>
        )}

        <section className="card">
          <h2 className="font-serif text-lg text-ink">ご参加くださった皆さま</h2>
          <p className="hint">{participants.length}名の方にご参加いただきました。</p>
          {participants.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2">
              {participants.map((p) => (
                <li key={p.id} className="badge bg-ivory text-ink">
                  {displayName(p)}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card">
          <h2 className="font-serif text-lg text-ink">皆さまからのメッセージ</h2>
          <div className="mt-3">
            <MessageList participants={participants} />
          </div>
        </section>

        <p className="pt-4 text-center text-xs text-muted">ハナタバ — お祝い花の取りまとめ</p>
      </div>
    </main>
  );
}
