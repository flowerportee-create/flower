import type { Participant } from '@/lib/types';
import { displayName } from '@/lib/utils';

export default function MessageList({ participants }: { participants: Participant[] }) {
  const withMessage = participants.filter((p) => p.message.trim().length > 0);

  if (withMessage.length === 0) {
    return <p className="py-6 text-center text-sm text-muted">まだメッセージはありません。</p>;
  }

  return (
    <ul className="space-y-3">
      {withMessage.map((p) => (
        <li key={p.id} className="rounded-2xl bg-ivory/50 p-4">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">{p.message}</p>
          <p className="mt-2 text-xs text-muted">— {displayName(p)}</p>
        </li>
      ))}
    </ul>
  );
}
