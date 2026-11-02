import type { ReactNode } from 'react';

type Tone = 'crit' | 'warn' | 'ok' | 'info';
const TONE: Record<string, Tone> = {
  HIGH: 'crit', REJECTED: 'crit', MISSING: 'crit', DISPUTED: 'crit',
  MED: 'warn', PENDING: 'warn', SUSPECT: 'warn',
  LOW: 'ok', VERIFIED: 'ok', CLOSED: 'ok', GOOD: 'ok', DONE: 'ok',
  IN_PROGRESS: 'info', OPEN: 'info',
};
const TONE_CLS: Record<Tone, string> = {
  crit: 'bg-pill-crit-bg text-pill-crit-fg', warn: 'bg-pill-warn-bg text-pill-warn-fg',
  ok: 'bg-pill-ok-bg text-pill-ok-fg', info: 'bg-pill-info-bg text-pill-info-fg',
};
export function StatusPill({ value, label }: { value: string; label?: string }) {
  return <span className={`inline-flex items-center gap-1 rounded-pill px-2 py-1 text-xs font-semibold ${TONE_CLS[TONE[value] ?? 'info']}`}>● {label ?? value}</span>;
}

export function PageHeader({ title, subtitle, actions }: { title: ReactNode; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
      <div><h1 className="text-xl font-bold">{title}</h1>{subtitle && <p className="mt-1 text-muted">{subtitle}</p>}</div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}

export function KpiCard({ label, value, unit, hint, tone }: { label: string; value: ReactNode; unit?: string; hint?: ReactNode; tone?: 'ok' | 'warn' | 'crit' }) {
  const toneCls = tone === 'ok' ? 'text-ok' : tone === 'warn' ? 'text-warn' : tone === 'crit' ? 'text-crit' : 'text-muted';
  return (
    <div className="card">
      <div className="text-sm text-muted">{label}</div>
      <div className="mt-2 text-kpi font-bold">{value} {unit && <small className="text-md font-medium text-muted">{unit}</small>}</div>
      {hint && <div className={`mt-1 text-sm ${toneCls}`}>{hint}</div>}
    </div>
  );
}

export function Card({ title, subtitle, children, right }: { title?: string; subtitle?: string; children: ReactNode; right?: ReactNode }) {
  return (
    <section className="card">
      {title && <div className="mb-3 flex items-center justify-between"><div><h3 className="text-md font-semibold">{title}</h3>{subtitle && <p className="text-sm text-muted">{subtitle}</p>}</div>{right}</div>}
      {children}
    </section>
  );
}

export interface Column<T> { key: string; header: string; render: (row: T) => ReactNode }
export function DataTable<T>({ rows, columns, rowKey, onRowClick, empty = 'ไม่มีข้อมูล' }: { rows: T[]; columns: Column<T>[]; rowKey: (r: T) => string; onRowClick?: (r: T) => void; empty?: string }) {
  if (!rows.length) return <EmptyState message={empty} />;
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-panel">
      <table className="w-full border-collapse">
        <thead><tr>{columns.map((c) => <th key={c.key} className="th">{c.header}</th>)}</tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={rowKey(r)} onClick={onRowClick ? () => onRowClick(r) : undefined} className={onRowClick ? 'cursor-pointer hover:bg-panel-2' : ''}>
              {columns.map((c) => <td key={c.key} className="td">{c.render(r)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Modal({ title, subtitle, children, onClose }: { title: string; subtitle?: string; children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40 grid place-items-center" style={{ background: "color-mix(in srgb, var(--color-bg) 80%, transparent)" }} onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} className="w-full max-w-lg rounded-xl border border-border bg-panel p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold">{title}</h3>
        {subtitle && <p className="mb-4 text-muted">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}

export const LoadingState = () => <div className="card animate-pulse text-muted">กำลังโหลด… / Loading…</div>;
export const EmptyState = ({ message = 'ไม่มีข้อมูล' }: { message?: string }) => <div className="card text-center text-muted">{message}</div>;
export const ErrorState = ({ error }: { error: unknown }) => (
  <div className="card border-crit text-pill-crit-fg">โหลดข้อมูลไม่สำเร็จ: {error instanceof Error ? error.message : 'unknown error'}</div>
);

/** Renders loading/error/empty states around a TanStack Query result */
export function QueryState<T>({ q, children }: { q: { isLoading: boolean; error: unknown; data: T | undefined }; children: (d: T) => ReactNode }) {
  if (q.isLoading) return <LoadingState />;
  if (q.error) return <ErrorState error={q.error} />;
  if (q.data === undefined) return <EmptyState />;
  return <>{children(q.data)}</>;
}

export const Mono = ({ children }: { children: ReactNode }) => <span className="font-mono text-sm text-mono">{children}</span>;
export const fmtDate = (iso: string) => new Date(iso).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Bangkok' });
