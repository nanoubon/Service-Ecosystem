import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFindings } from '../api';
import { DataTable, PageHeader, QueryState } from '../components/ui';
import { STATUS_LABEL, findingColumns } from './findingColumns';

const STATUSES = ['', 'PENDING', 'VERIFIED', 'REJECTED', 'CLOSED'];

export default function Findings() {
  const q = useFindings();
  const nav = useNavigate();
  const [status, setStatus] = useState('');
  const [sev, setSev] = useState('');
  return (
    <>
      <PageHeader title="Findings" subtitle="ผลวิเคราะห์จาก rule engine · ต้องให้วิศวกรยืนยันก่อนสร้าง Work Order (ADR-003)" />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div role="tablist" className="inline-flex rounded-md bg-panel-2 p-1">
          {STATUSES.map((s) => (
            <button key={s} role="tab" aria-selected={status === s} onClick={() => setStatus(s)}
              className={`rounded-sm px-3 py-1 text-sm ${status === s ? 'bg-panel text-text' : 'text-muted'}`}>{s ? STATUS_LABEL[s] : 'ทั้งหมด'}</button>
          ))}
        </div>
        <select aria-label="severity" className="input w-40" value={sev} onChange={(e) => setSev(e.target.value)}>
          <option value="">ทุก Severity</option><option value="HIGH">HIGH</option><option value="MED">MED</option><option value="LOW">LOW</option>
        </select>
      </div>
      <QueryState q={q}>{(rows) => (
        <DataTable rows={rows.filter((f) => (!status || f.status === status) && (!sev || f.severity === sev))}
          columns={findingColumns} rowKey={(f) => f.finding_id} onRowClick={(f) => nav(`/findings/${f.finding_id}`)} empty="ไม่พบ Finding ตามตัวกรอง" />
      )}</QueryState>
    </>
  );
}
