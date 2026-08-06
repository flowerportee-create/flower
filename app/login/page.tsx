import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import LoginForm from './LoginForm';

export const metadata = { title: 'ログイン | ハナタバ' };

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <>
      <SiteHeader />
      <main className="container-app max-w-md py-12">
        <h1 className="text-center font-serif text-2xl text-ink">ログイン</h1>
        <p className="mt-2 text-center text-sm text-muted">
          幹事・花屋管理者の方はこちらから
        </p>

        <div className="card mt-8">
          <LoginForm next={next} />
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          アカウントをお持ちでない方は{' '}
          <Link href="/signup" className="text-ink underline underline-offset-4">
            新規登録
          </Link>
        </p>
      </main>
    </>
  );
}
