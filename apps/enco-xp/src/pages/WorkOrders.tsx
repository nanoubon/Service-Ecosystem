import { Link, useNavigate } from 'react-router-dom';
import { useCompleteWorkOrder, useFindings } from '../api';
import { useToast } from '../components/Toast';
import { DataTable, Mono, PageHeader, QueryState, StatusPill } from '../components/ui';

export default function WorkOrders() {
  const q = useFindings();
  const done = useCompleteWorkOrder();
  const toast = useToast();
  const nav = useNavigate();
  return (
    <>
      <PageHeader title="Work Orders" subtitle="งานที่สร้างใน EnPrompt จาก Finding ที่วิศวกรยืนยันแล้ว (จำลองสถานะ)" />
      <QueryState q={q}>{(rows) => (
        <DataTable rows={rows.filter((f) => f.work_order_ref)} rowKey={(f) => f.finding_id} empty="ยังไม่มี Work Order" columns={[
          { key: 'wo', header: 'Work Order', render: (f) => <Mono>{f.work_order_ref}</Mono> },
          { key: 'f', header: 'Finding', render: (f) => <Link className="text-primary-light underline" to={`/findings/${f.finding_id}`}>{f.finding_id} · {f.title}</Link> },
          { key: 'a', header: 'Asset', render: (f) => <Mono>{f.asset_id}</Mono> },
          { key: 'by', header: 'Verified by', render: (f) => f.verified_by },
          { key: 's', header: 'State', render: (f) => <StatusPill value={f.wo_state ?? 'OPEN'} label={f.wo_state?.replace('_', ' ')} /> },
          { key: 'act', header: <span className="sr-only">Actions</span>, render: (f) => f.wo_state === 'IN_PROGRESS'
            ? <button className="btn" disabled={done.isPending} onClick={() => done.mutate(f.finding_id, { onSuccess: () => { toast(`${f.work_order_ref} เสร็จใน EnPrompt · รอ Verify ผล`); nav(`/verification?f=${f.finding_id}`); } })}>จำลอง: งานเสร็จ</button>
            : f.wo_state === 'DONE' ? <Link className="btn" to={`/verification?f=${f.finding_id}`}>Verify ผล</Link> : null },
        ]} />
      )}</QueryState>
    </>
  );
}
