import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import SignOutButton from '@/components/SignOutButton';

export default async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  let role: string | null = null;
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();
    role = data?.role ?? null;
  }

  return (
    <header className="sticky top-0 z-20 border-b border-ivory bg-cream/90 backdrop-blur">
      <div className="container-app flex h-14 items-center justify-between">
        <Link href="/" className="font-serif text-lg tracking-wide text-ink">
          ハナタバ
        </Link>

        <nav className="flex items-center gap-1 text-sm">
          {user ? (
            <>
              <Link
                href={role === 'florist' ? '/florist' : '/organizer'}
                className="btn-ghost px-3"
              >
                {role === 'florist' ? '花屋管理' : 'マイ企画'}
              </Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost px-3">
                ログイン
              </Link>
              <Link href="/signup" className="btn-primary px-4 py-2">
                新規登録
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
