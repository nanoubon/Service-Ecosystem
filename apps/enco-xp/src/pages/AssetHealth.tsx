import { useNavigate } from 'react-router-dom';
import { useAssets } from '../api';
import { DataTable, Mono, PageHeader, QueryState } from '../components/ui';

const healthTone = (h: number) => (h >= 85 ? 'bg-ok' : h >= 75 ? 'bg-primary' : 'bg-warn');

export default function AssetHealth() {
  const q = useAssets();
  const nav = useNavigate();
  return (
    <>
      <PageHeader title="Asset Health" subtitle="อุปกรณ์ใน Chiller Plant · อ้างอิง EnPrompt Asset ID (ADR-001)" />
      <QueryState q={q}>{(rows) => (
        <DataTable rows={rows} rowKey={(a) => a.asset_id} onRowClick={(a) => nav(`/asset-health/${a.asset_id}`)} columns={[
          { key: 'id', header: 'Asset ID', render: (a) => <Mono>{a.asset_id}</Mono> },
          { key: 'name', header: 'Asset', render: (a) => <><b>{a.name}</b><div className="text-sm text-muted">{a.type}</div></> },
          { key: 'crit', header: 'Criticality', render: (a) => a.criticality },
          { key: 'health', header: 'Health', render: (a) => (
            <span className="flex items-center gap-2"><span className="h-2 w-24 overflow-hidden rounded-pill bg-panel-2"><i className={`block h-full ${healthTone(a.health)}`} style={{ width: `${a.health}%` }} /></span><b>{a.health}</b></span>) },
          { key: 'hours', header: 'Run hours', render: (a) => a.run_hours.toLocaleString() },
          { key: 'kw', header: 'kW/RT', render: (a) => a.kw_per_rt ?? '—' },
        ]} />
      )}</QueryState>
    </>
  );
}
