'use client';

import { useState, useTransition } from 'react';
import { updateFloristComment } from '../actions';

export default function CommentEditor({
  projectId,
  comment
}: {
  projectId: string;
  comment: string;
}) {
  const [value, setValue] = useState(comment);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save() {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const result = await updateFloristComment(projectId, value);
      if (result.error) {
        setError(result.error);
      } else {
        setMessage('保存しました。');
      }
    });
  }

  return (
    <div className="space-y-3">
      <label htmlFor="florist_comment" className="sr-only">
        花屋からのコメント
      </label>
      <textarea
        id="florist_comment"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        maxLength={800}
        className="textarea"
        placeholder="季節のグリーンを合わせて、やわらかな印象に仕上げました。"
      />
      <div className="flex items-center gap-3">
        <button type="button" onClick={save} disabled={pending} className="btn-primary">
          {pending ? '保存中…' : 'コメントを保存'}
        </button>
        {message && <span className="text-sm text-moss">{message}</span>}
      </div>
      {error && (
        <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
