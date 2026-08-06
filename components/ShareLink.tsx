import { headers } from 'next/headers';
import { absoluteUrl } from '@/lib/utils';
import CopyField from '@/components/CopyField';

export default async function ShareLink({
  path,
  label,
  description
}: {
  path: string;
  label: string;
  description?: string;
}) {
  const headerList = await headers();
  const url = absoluteUrl(
    headerList.get('host'),
    headerList.get('x-forwarded-proto'),
    path
  );

  return (
    <div className="rounded-2xl border border-ivory bg-ivory/40 p-4">
      <p className="text-sm font-medium text-ink">{label}</p>
      {description && <p className="hint">{description}</p>}
      <div className="mt-3">
        <CopyField value={url} label={label} />
      </div>
    </div>
  );
}
