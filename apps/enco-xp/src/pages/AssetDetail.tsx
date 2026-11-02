import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAsset, useTelemetry } from '../api';
import { LineChart } from '../components/Chart';
import { Card, KpiCard, Mono, PageHeader, QueryState, StatusPill } from '../components/ui';

export default function AssetDetail() {
  const { assetId = '' } = useParams();
  const q = useAsset(assetId);
  const [tag, setTag] = useState('');
  const current = tag || q.data?.tags[0]?.tag || '';
  const tq = useTelemetry(assetId, current);
  return (
    <QueryState q={q}>{(a) => (
      <>
        <PageHeader title={a.name} subtitle={<><Mono>{a.asset_id}</Mono> · {a.type} · Criticality {a.criticality}</>} />
        <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard label="Health score" value={a.health} unit="/100" />
          <KpiCard label="Run hours" value={a.run_hours.toLocaleString()} unit="h" />
          <KpiCard label="Maker / Year" value={a.year} hint={a.maker} />
          <KpiCard label="kW/RT" value={a.kw_per_rt ?? '—'} />
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2"><Card title={`${current} · 7 วัน`} right={
            <select aria-label="tag" className="input w-48" value={current} onChange={(e) => setTag(e.target.value)}>{a.tags.map((t) => <option key={t.tag}>{t.tag}</option>)}</select>}>
            <QueryState q={tq}>{(pts) => <LineChart labels={pts.map((p) => p.timestamp.slice(5, 13))} series={[{ name: current, data: pts.map((p) => p.value), color: 'color-primary' }]} />}</QueryState>
          </Card></div>
          <Card title="Telemetry tags">
            <ul className="space-y-2">{a.tags.map((t) => <li key={t.tag} className="flex justify-between"><Mono>{t.tag} ({t.unit})</Mono><StatusPill value={t.quality_flag} /></li>)}</ul>
          </Card>
        </div>
      </>
    )}</QueryState>
  );
}
