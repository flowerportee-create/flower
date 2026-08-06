import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SignupForm from './SignupForm';

export const metadata = { title: '新規登録 | ハナタバ' };

export default function SignupPage() {
  return (
    <>
      <SiteHeader />
      <main className="container-app max-w-md py-12">
        <h1 className="text-center font-serif text-2xl text-ink">新規登録</h1>
        <p className="mt-2 text-center text-sm leading-relaxed text-muted">
          登録が必要なのは幹事と花屋管理者のみです。
          <br />
          参加者の方は共有URLからそのままご参加いただけます。
        </p>

        <div className="card mt-8">
          <SignupForm />
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          すでにアカウントをお持ちの方は{' '}
          <Link href="/login" className="text-ink underline underline-offset-4">
            ログイン
          </Link>
        </p>
      </main>
    </>
  );
}
