import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { settleParticipantPayment } from '@/lib/payments';
import type { Participant, Project } from '@/lib/types';
import { formatYen } from '@/lib/utils';
import { tagSizeFor } from '@/lib/flower';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'ご参加ありがとうございます'
};

export default async function JoinCompletePage({
  params,
  searchParams
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const { token } = await params;
  const { t: paymentToken } = await searchParams;

  if (!paymentToken || !/^[0-9a-f]{8,64}$/.test(paymentToken)) {
    notFound();
  }

  const supabase = createAdminClient();
  const { data: participantRow } = await supabase
    .from('participants')
    .select('*')
    .eq('payment_token', paymentToken)
    .maybeSingle();

  if (!participantRow) notFound();
  const participant = participantRow as Participant;

  const { data: projectRow } = await supabase
    .from('projects')
    .select('*')
    .eq('id', participant.project_id)
    .maybeSingle();

  if (!projectRow) notFound();
  const project = projectRow as Project;

  // URLを直接開かれた場合に備え、必ず Square 側の状態を見て確定させる
  const result = await settleParticipantPayment(participant);
  const size = tagSizeFor(participant.amount);

  return (
    <div className="mx-auto max-w-lg px-5 py-12">
      {result === 'paid' ? (
        <div className="space-y-6 text-center">
          <div className="space-y-2">
            <p className="text-xs tracking-[0.24em] text-muted">THANK YOU</p>
            <h1 className="font-serif text-2xl leading-relaxed text-ink">
              ご参加ありがとうございます
            </h1>
            <p className="text-sm leading-loose text-muted">
              お支払いが完了し、ご参加が確定しました。
            </p>
          </div>

          <dl className="space-y-3 rounded-2xl border border-ivory bg-white p-6 text-left">
            <div className="flex justify-between gap-4">
              <dt className="text-xs text-muted">企画</dt>
              <dd className="text-sm text-ink">{project.title}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-xs text-muted">お名前</dt>
              <dd className="text-sm text-ink">{participant.name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-xs text-muted">ご参加金額</dt>
              <dd className="font-serif text-base text-ink">{formatYen(participant.amount)}</dd>
            </div>
            {participant.include_in_tag && !participant.is_anonymous && (
              <div className="flex justify-between gap-4">
                <dt className="text-xs text-muted">立て札のお名前</dt>
                <dd className="text-sm text-ink">{size.label}の大きさで掲載</dd>
              </div>
            )}
          </dl>

          <p className="text-xs leading-relaxed text-muted">
            領収書は Square から送信される決済完了メールをご利用ください。
            <br />
            お花の完成後、幹事の方から完成報告ページのURLが共有されます。
          </p>

          <Link href={`/j/${token}`} className="btn-secondary inline-flex">
            企画のページへ戻る
          </Link>
        </div>
      ) : (
        <div className="space-y-6 text-center">
          <div className="space-y-2">
            <h1 className="font-serif text-2xl leading-relaxed text-ink">
              お支払いを確認しています
            </h1>
            <p className="text-sm leading-loose text-muted">
              {result === 'pending'
                ? 'ただいま決済の確認中です。しばらくしてからこのページを再読み込みしてください。'
                : '決済の確認ができませんでした。お手数ですが、幹事の方にご連絡ください。'}
            </p>
          </div>

          <div className="rounded-2xl bg-ivory/60 p-5 text-left">
            <p className="text-xs leading-relaxed text-muted">
              カードの引き落としが発生している場合、ご参加は自動的に確定します。
              二重にお支払いいただく必要はありませんので、決済のやり直しはお控えください。
            </p>
          </div>

          <Link href={`/j/${token}`} className="btn-secondary inline-flex">
            企画のページへ戻る
          </Link>
        </div>
      )}
    </div>
  );
}
