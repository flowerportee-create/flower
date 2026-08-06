import type { Project } from '@/lib/types';
import { formatDate, formatYen } from '@/lib/utils';

function Row({ label, value }: { label: string; value: string }) {
  if (!value || value === '—') {
    return null;
  }
  return (
    <div className="flex flex-col gap-0.5 border-b border-ivory py-3 last:border-b-0 sm:flex-row sm:gap-4">
      <dt className="w-32 shrink-0 text-sm text-muted">{label}</dt>
      <dd className="whitespace-pre-wrap text-sm leading-relaxed text-ink">{value}</dd>
    </div>
  );
}

export default function ProjectSummary({
  project,
  showAddress = false,
  showNote = false
}: {
  project: Project;
  showAddress?: boolean;
  showNote?: boolean;
}) {
  return (
    <dl>
      <Row label="贈り先" value={project.recipient_name} />
      {showAddress && <Row label="お届け先" value={project.delivery_address} />}
      <Row label="お届け希望日" value={formatDate(project.delivery_date)} />
      <Row label="参加締切" value={formatDate(project.entry_deadline)} />
      <Row label="一口金額" value={project.unit_amount > 0 ? formatYen(project.unit_amount) : ''} />
      <Row label="花の種類" value={project.flower_type} />
      <Row label="希望カラー" value={project.color_preference} />
      <Row label="札名" value={project.tag_name} />
      <Row label="メッセージ" value={project.message} />
      {showNote && <Row label="備考" value={project.note} />}
    </dl>
  );
}
