import { useSavings } from '../api';
import { Card, DataTable, KpiCard, Mono, PageHeader, QueryState, StatusPill } from '../components/ui';

export default function MV() {
  const q = useSavings();
  return (
    <>
      <PageHeader title="M&V" subtitle="Measurement & Verification ของผลประหยัด · ตัวเลขยังไม่ยืนยันจนกว่า mv_status = VERIFIED" />
      <QueryState q={q}>{(rows) => (
        <>
          <div className="mb-4 grid grid-cols-3 gap-4">
            <KpiCard label="Savings (kWh)" value={rows.reduce((s, r) => s + r.savings_kwh, 0).toLocaleString()} unit="kWh" />
            <KpiCard label="Savings (THB)" value={`฿${rows.reduce((s, r) => s + r.savings_thb, 0).toLocaleString()}`} hint="ประมาณการ" tone="warn" />
            <KpiCard label="รอ M&V" value={rows.filter((r) => r.mv_status === 'PENDING').length} unit="รายการ" tone="warn" hint="mv_status: PENDING" />
          </div>
          <Card title="Savings ledger">
            <DataTable rows={rows} rowKey={(r) => r.savings_id} columns={[
              { key: 'id', header: 'ID', render: (r) => <Mono>{r.savings_id}</Mono> },
              { key: 'f', header: 'Finding / Asset', render: (r) => <><Mono>{r.finding_id}</Mono> · <Mono>{r.asset_id}</Mono></> },
              { key: 'p', header: 'Period', render: (r) => `${r.period_start} → ${r.period_end}` },
              { key: 'b', header: 'Baseline kWh', render: (r) => r.baseline_kwh.toLocaleString() },
              { key: 'a', header: 'Actual kWh', render: (r) => r.actual_kwh.toLocaleString() },
              { key: 's', header: 'Savings', render: (r) => <b>{r.savings_kwh.toLocaleString()} kWh · ฿{r.savings_thb.toLocaleString()}</b> },
              { key: 'm', header: 'Method', render: (r) => r.method },
              { key: 'st', header: 'mv_status', render: (r) => <StatusPill value={r.mv_status} /> },
            ]} />
          </Card>
        </>
      )}</QueryState>
    </>
  );
}
