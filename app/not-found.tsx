import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="container-app flex min-h-screen max-w-md flex-col items-center justify-center text-center">
      <p className="text-xs tracking-[0.2em] text-muted">404</p>
      <h1 className="mt-4 font-serif text-2xl text-ink">ページが見つかりません</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        URLが間違っているか、企画が削除された可能性があります。
        <br />
        お手数ですが幹事の方にご確認ください。
      </p>
      <Link href="/" className="btn-secondary mt-8">
        トップへ戻る
      </Link>
    </main>
  );
}
