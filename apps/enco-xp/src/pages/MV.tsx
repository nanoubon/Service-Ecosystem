import type { Savings } from '@enco/contract';
import { useSavings } from '../api';
import { Card, DataTable, KpiCard, Mono, PageHeader, QueryState, StatusPill } from '../components/ui';

/** Savings figures are only shown once M&V is VERIFIED (Contract v0.2). */
const Hidden = () => <span className="text-muted" title="รอผล M&V">— ซ่อนจนกว่า VERIFIED</span>;
const show = (r: Savings, v: string) => (r.mv_status === 'VERIFIED' ? v : <Hidden />);

export default function MV() {
  const q = useSavings();
  return (
    <>
      <PageHeader title="M&V" subtitle="Measurement & Verification · ตัวเลขผลประหยัดแสดงเฉพาะ mv_status = VERIFIED" />
      <QueryState q={q}>{(rows) => {
        const ver = rows.filter((r) => r.mv_status === 'VERIFIED');
        return (
          <>
            <div className="mb-4 grid grid-cols-3 gap-4">
              <KpiCard label="Verified savings (energy)" value={ver.reduce((s, r) => s + r.savings_energy_kwh, 0).toLocaleString()} unit="kWh" tone="ok" hint={`${ver.length} รายการ VERIFIED`} />
              <KpiCard label="Verified savings (THB)" value={`฿${ver.reduce((s, r) => s + r.savings_amount_thb, 0).toLocaleString()}`} unit="THB" />
              <KpiCard label="รอ M&V / โต้แย้ง" value={rows.length - ver.length} unit="รายการ" tone="warn" hint="PENDING / DISPUTED ไม่นับรวม" />
            </div>
            <Card title="Savings ledger">
              <DataTable rows={rows} rowKey={(r) => r.savings_id} columns={[
                { key: 'id', header: 'ID', render: (r) => <Mono>{r.savings_id}</Mono> },
                { key: 'f', header: 'Finding / Asset', render: (r) => <><Mono>{r.finding_id}</Mono> · <Mono>{r.asset_id}</Mono></> },
                { key: 'p', header: 'Period', render: (r) => `${r.period_start} → ${r.period_end}` },
                { key: 'b', header: 'Baseline (kWh)', render: (r) => show(r, r.baseline_energy_kwh.toLocaleString()) },
                { key: 'a', header: 'Actual (kWh)', render: (r) => show(r, r.actual_energy_kwh.toLocaleString()) },
                { key: 's', header: 'Savings', render: (r) => show(r, `${r.savings_energy_kwh.toLocaleString()} kWh · ${r.savings_amount_thb.toLocaleString()} ${r.currency}`) },
                { key: 'm', header: 'Method', render: (r) => r.method.replace('_', ' Option ') },
                { key: 't', header: 'Tariff (THB/kWh)', render: (r) => r.tariff_thb_per_kwh.toFixed(2) },
                { key: 'st', header: 'mv_status', render: (r) => <StatusPill value={r.mv_status} /> },
              ]} />
            </Card>
          </>
        );
      }}</QueryState>
    </>
  );
}
