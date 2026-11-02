import { useDataQuality } from '../api';
import { DataTable, KpiCard, Mono, PageHeader, QueryState, StatusPill, fmtDate } from '../components/ui';

export default function DataQuality() {
  const q = useDataQuality();
  return (
    <>
      <PageHeader title="Data Quality" subtitle="คุณภาพข้อมูลจาก Snapshot adapter (quality_flag: GOOD / SUSPECT / MISSING)" />
      <QueryState q={q}>{(rows) => (
        <>
          <div className="mb-4 grid grid-cols-3 gap-4">
            {(['GOOD', 'SUSPECT', 'MISSING'] as const).map((k) => (
              <KpiCard key={k} label={k} value={rows.filter((r) => r.quality_flag === k).length} unit="tags" tone={k === 'GOOD' ? 'ok' : k === 'SUSPECT' ? 'warn' : 'crit'} hint={k === 'GOOD' ? 'พร้อมใช้' : 'ตรวจสอบ'} />
            ))}
          </div>
          <DataTable rows={rows} rowKey={(r) => r.tag} columns={[
            { key: 'a', header: 'Asset ID', render: (r) => <Mono>{r.asset_id}</Mono> },
            { key: 't', header: 'Tag', render: (r) => <Mono>{r.tag}</Mono> },
            { key: 'u', header: 'Unit', render: (r) => r.unit },
            { key: 'c', header: 'Completeness', render: (r) => `${r.completeness}%` },
            { key: 'l', header: 'Last seen', render: (r) => fmtDate(r.last_seen) },
            { key: 'q', header: 'quality_flag', render: (r) => <StatusPill value={r.quality_flag} /> },
          ]} />
        </>
      )}</QueryState>
    </>
  );
}
