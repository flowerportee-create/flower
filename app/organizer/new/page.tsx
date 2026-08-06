import { redirect } from 'next/navigation';
import SiteHeader from '@/components/SiteHeader';
import { createClient } from '@/lib/supabase/server';
import ProjectForm from './ProjectForm';

export const metadata = { title: '企画をつくる | ハナタバ' };
export const dynamic = 'force-dynamic';

export default async function NewProjectPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect('/login?next=/organizer/new');

  return (
    <>
      <SiteHeader />
      <main className="container-app py-10">
        <h1 className="font-serif text-2xl text-ink">企画をつくる</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          作成すると、参加者にお渡しする共有URLが発行されます。
        </p>

        <div className="mt-8">
          <ProjectForm />
        </div>
      </main>
    </>
  );
}
