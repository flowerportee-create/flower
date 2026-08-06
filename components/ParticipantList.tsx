import type { Participant } from '@/lib/types';
import { displayName, formatDateTime, formatYen } from '@/lib/utils';

export default function ParticipantList({
  participants,
  showAmount = true,
  showDate = false
}: {
  participants: Participant[];
  showAmount?: boolean;
  showDate?: boolean;
}) {
  if (participants.length === 0) {
    return <p className="py-6 text-center text-sm text-muted">まだ参加者はいません。</p>;
  }

  return (
    <ul className="divide-y divide-ivory">
      {participants.map((p) => (
        <li key={p.id} className="flex items-center justify-between gap-3 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm text-ink">
              {displayName(p)}
              {!p.is_anonymous && p.tag_style === 'none' && (
                <span className="ml-2 text-xs text-muted">札名なし</span>
              )}
            </p>
            {showDate && <p className="hint">{formatDateTime(p.created_at)}</p>}
          </div>
          {showAmount && (
            <span className="shrink-0 font-serif text-sm text-ink">{formatYen(p.amount)}</span>
          )}
        </li>
      ))}
    </ul>
  );
}
