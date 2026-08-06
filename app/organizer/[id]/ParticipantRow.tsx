'use client';

import { useTransition } from 'react';
import type { Participant } from '@/lib/types';
import { formatDateTime, formatYen } from '@/lib/utils';
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
          {participant.name}
          {participant.is_anonymous && (
            <span className="ml-2 badge bg-ivory text-muted">匿名表示</span>
          )}
          {!participant.include_in_tag && (
            <span className="ml-2 badge bg-ivory text-muted">札名なし</span>
          )}
        </p>
        {participant.message && (
          <p className="mt-1 whitespace-pre-wrap text-xs leading-relaxed text-muted">
            {participant.message}
          </p>
        )}
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
