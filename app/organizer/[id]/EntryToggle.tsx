'use client';

import { useTransition } from 'react';
import type { ProjectStatus } from '@/lib/types';
import { closeEntry, reopenEntry } from '../actions';

export default function EntryToggle({
  projectId,
  status
}: {
  projectId: string;
  status: ProjectStatus;
}) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (status === 'open' && !confirm('受付を終了しますか？共有URLからの新規参加ができなくなります。')) {
      return;
    }
    startTransition(async () => {
      if (status === 'open') {
        await closeEntry(projectId);
      } else {
        await reopenEntry(projectId);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className={status === 'open' ? 'btn-secondary' : 'btn-primary'}
    >
      {pending ? '処理中…' : status === 'open' ? '受付を終了する' : '受付を再開する'}
    </button>
  );
}
