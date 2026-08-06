import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';

const STEPS = [
  {
    title: '幹事が企画をつくる',
    body: '贈り先・お届け日・目標金額・札名などを入力すると、共有用のURLが発行されます。'
  },
  {
    title: '参加者がURLから登録',
    body: 'ログインは不要。お名前と参加金額、贈る言葉を送るだけ。匿名での参加もできます。'
  },
  {
    title: '花屋が制作して報告',
    body: '注文内容はそのまま花屋の管理画面へ。完成写真は参加者全員に共有されます。'
  }
];

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="container-app py-16 text-center sm:py-24">
          <p className="text-xs tracking-[0.2em] text-muted">CELEBRATION FLOWERS</p>
          <h1 className="mt-4 font-serif text-2xl leading-relaxed text-ink sm:text-4xl">
            みんなで贈るお祝いの花を、
            <br />
            ひとつのURLで。
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-loose text-muted">
            開店祝い・就任祝い・発表会。有志で贈るお花の取りまとめを、
            <br className="hidden sm:block" />
            幹事にも参加者にも花屋にもやさしいかたちに。
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/organizer/new" className="btn-primary w-full sm:w-auto">
              企画をつくる
            </Link>
            <Link href="/login" className="btn-secondary w-full sm:w-auto">
              ログイン
            </Link>
          </div>
        </section>

        <section className="border-t border-ivory bg-white py-14">
          <div className="container-app">
            <h2 className="text-center font-serif text-xl text-ink">ご利用の流れ</h2>
            <ol className="mt-8 space-y-4">
              {STEPS.map((step, index) => (
                <li key={step.title} className="card flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sakura font-serif text-sm text-ink">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="text-base text-ink">{step.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-8 text-center text-xs leading-relaxed text-muted">
              ※ 本サービスにオンライン決済機能はありません。集金は幹事の皆さまでお願いいたします。
            </p>
          </div>
        </section>

        <footer className="border-t border-ivory py-10 text-center text-xs text-muted">
          ハナタバ — お祝い花の取りまとめ
        </footer>
      </main>
    </>
  );
}
