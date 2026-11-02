import { useNavigate } from 'react-router-dom';
import { useFindings, useOverview } from '../api';
import { LineChart } from '../components/Chart';
import { Card, DataTable, KpiCard, PageHeader, QueryState } from '../components/ui';
import { findingColumns } from './findingColumns';

export default function Overview() {
  const ov = useOverview();
  const fs = useFindings();
  const nav = useNavigate();
  return (
    <>
      <PageHeader title="Overview" subtitle="ภาพรวม Chiller Plant · Detect → Verify → Work Order → Verify ผล" />
      <QueryState q={ov}>{(o) => (
        <>
          <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-5">
            <KpiCard label="Plant efficiency" value={o.kw_per_rt.toFixed(2)} unit="kW/RT" hint={`baseline ${o.kw_per_rt_baseline}`} tone="ok" />
            <KpiCard label="Plant load" value={o.plant_load_rt.toLocaleString()} unit="RT" />
            <KpiCard label="Energy today" value={o.energy_today_kwh.toLocaleString()} unit="kWh" />
            <KpiCard label="Findings รอ Verify" value={o.pending_findings} hint="ต้องให้วิศวกรยืนยัน" tone={o.pending_findings ? 'warn' : 'ok'} />
            <KpiCard label="Savings (MTD)" value={`฿${o.savings_thb_mtd.toLocaleString()}`} hint="mv_status: PENDING" tone="warn" />
          </div>
          <div className="mb-4"><Card title="kW/RT · 7 วัน" subtitle="Actual vs Baseline">
            <LineChart labels={o.trend.labels} series={[{ name: 'Actual', data: o.trend.actual, color: 'color-primary' }, { name: 'Baseline', data: o.trend.baseline, color: 'color-text-subtle', dashed: true }]} />
          </Card></div>
        </>
      )}</QueryState>
      <Card title="Findings ล่าสุด">
        <QueryState q={fs}>{(rows) => <DataTable rows={rows.slice(0, 5)} columns={findingColumns} rowKey={(f) => f.finding_id} onRowClick={(f) => nav(`/findings/${f.finding_id}`)} />}</QueryState>
      </Card>
    </>
  );
}
