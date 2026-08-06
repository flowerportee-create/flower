import type { ProductionStatus, ProjectStatus } from '@/lib/types';
import { PRODUCTION_STATUS_LABEL, productionStatusClass } from '@/lib/utils';

export function ProductionBadge({ status }: { status: ProductionStatus }) {
  return <span className={`badge ${productionStatusClass(status)}`}>{PRODUCTION_STATUS_LABEL[status]}</span>;
}

export function EntryBadge({ status }: { status: ProjectStatus }) {
  return status === 'open' ? (
    <span className="badge bg-moss/15 text-moss">受付中</span>
  ) : (
    <span className="badge bg-ivory text-muted">受付終了</span>
  );
}
