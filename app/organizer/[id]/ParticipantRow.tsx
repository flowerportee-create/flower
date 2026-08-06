'use client';

import { useTransition } from 'react';
import type { Participant } from '@/lib/types';
import { formatDateTime, formatYen } from '@/lib/utils';
import { tagLine } from '@/lib/flower';
import { deleteParticipant } from '../actions';

export default function ParticipantRow({
  projectId,
  participant
}: {
  projectId: string;
  participant: Participant;
}) {
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`${participant.name} さんの参加を削除しますか？`)) return;
    startTransition(async () => {
      await deleteParticipant(projectId, participant.id);
    });
  }

  return (
    <li className="flex items-start justify-between gap-3 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm text-ink">
          {participant.title && (
            <span className="mr-1 text-xs text-muted">{participant.title}</span>
          )}
          {participant.name}
          {participant.is_anonymous && (
            <span className="ml-2 badge bg-ivory text-muted">匿名表示</span>
          )}
          {!participant.is_anonymous && participant.tag_style === 'none' && (
            <span className="ml-2 badge bg-ivory text-muted">札名なし</span>
          )}
        </p>
        <p className="hint">
          立て札：{tagLine(participant) ?? '掲載なし'}
        </p>
        <p className="hint">{formatDateTime(participant.created_at)}</p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className="font-serif text-sm text-ink">{formatYen(participant.amount)}</span>
        <button
          type="button"
          onClick={handleDelete}
          disabled={pending}
          className="text-xs text-muted underline underline-offset-4 hover:text-red-600 disabled:opacity-50"
        >
          {pending ? '削除中…' : '削除'}
        </button>
      </div>
    </li>
  );
}
