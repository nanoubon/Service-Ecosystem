import { Link } from 'react-router-dom';
import type { FindingView } from '@enco/contract';
import { Mono, StatusPill, fmtDate, type Column } from '../components/ui';

export const STATUS_LABEL: Record<string, string> = { PENDING: 'Pending', VERIFIED: 'Verified', REJECTED: 'Rejected', CLOSED: 'Closed' };

export const findingColumns: Column<FindingView>[] = [
  { key: 'id', header: 'ID', render: (f) => <Mono>{f.finding_id}</Mono> },
  { key: 'title', header: 'Finding', render: (f) => <><Link to={`/findings/${f.finding_id}`} className="font-bold text-text underline-offset-2 hover:underline focus-visible:underline" onClick={(e) => e.stopPropagation()}>{f.title}</Link><div className="text-sm text-muted"><Mono>{f.asset_id}</Mono> · {f.rule_id}</div>{f.rejection_reason && <div className="text-sm text-pill-crit-fg" data-testid="rejection-reason">เหตุผล: {f.rejection_reason}</div>}</> },
  { key: 'sev', header: 'Severity', render: (f) => <StatusPill value={f.severity} /> },
  { key: 'status', header: 'Status', render: (f) => <StatusPill value={f.status} label={STATUS_LABEL[f.status]} /> },
  { key: 'det', header: 'Detected', render: (f) => <span className="text-muted">{fmtDate(f.detected_at)}</span> },
  { key: 'wo', header: 'Work Order', render: (f) => <Mono>{f.work_order_ref ?? '—'}</Mono> },
];
