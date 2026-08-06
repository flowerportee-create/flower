import Link from 'next/link';
import { redirect } from 'next/navigation';
import SiteHeader from '@/components/SiteHeader';
import { createClient } from '@/lib/supabase/server';
import type { FlowerSample } from '@/lib/types';
import SampleManager from './SampleManager';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: '見本写真の管理 | ハナタバ'
};

export default async function FloristSamplesPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect('/login?next=/florist/samples');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.role !== 'florist') redirect('/organizer');

  const { data: sampleRows } = await supabase
    .from('flower_samples')
    .select('*')
    .order('created_at', { ascending: false });

  const samples = (sampleRows ?? []) as FlowerSample[];

  return (
    <>
      <SiteHeader />
      <main className="container-app py-8">
        <Link href="/florist" className="text-sm text-muted hover:text-ink">
          ← ご注文一覧へ戻る
        </Link>

        <h1 className="mt-4 font-serif text-2xl text-ink">見本写真の管理</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          用途と色の組み合わせごとに、お客さまへお見せする仕上がりイメージを設定します。
        </p>

        <div className="mt-6">
          <SampleManager samples={samples} />
        </div>
      </main>
    </>
  );
}
