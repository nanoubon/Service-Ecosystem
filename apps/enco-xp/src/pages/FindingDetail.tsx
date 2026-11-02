import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { FindingView } from '@enco/contract';
import { useCreateWorkOrder, useFinding, useRejectFinding } from '../api';
import { LineChart } from '../components/Chart';
import { useToast } from '../components/Toast';
import { Card, Modal, Mono, PageHeader, QueryState, StatusPill, fmtDate } from '../components/ui';
import { STATUS_LABEL } from './findingColumns';

const STEPS = ['Detect', 'Diagnose', 'Engineer Verify', 'Work Order', 'แก้ไข', 'Verify ผล'];
const stepIdx = (f: FindingView) => ({ PENDING: 2, VERIFIED: 3, REJECTED: 2, CLOSED: 5 }[f.status] + (f.wo_state === 'DONE' ? 1 : 0));
const REASONS = ['Sensor noise / ข้อมูลผิดพลาด', 'สภาวะปกติตามการเดินเครื่อง', 'ซ้ำกับ Finding อื่น', 'อื่น ๆ'];

export default function FindingDetail() {
  const { findingId = '' } = useParams();
  const q = useFinding(findingId);
  const [modal, setModal] = useState<'wo' | 'reject' | null>(null);
  return (
    <QueryState q={q}>{(f) => {
      const idx = stepIdx(f);
      const ev = Array.from({ length: 48 }, (_, i) => +(i < 30 ? f.before * (0.75 + Math.sin(i / 3) * 0.04) : f.before * (0.85 + ((i - 30) / 18) * 0.15)).toFixed(2));
      return (
        <>
          <PageHeader title={<>{f.title} <StatusPill value={f.severity} /></>}
            subtitle={<><Mono>{f.finding_id}</Mono> · <Link className="text-primary-light" to={`/assets/${f.asset_id}`}>{f.asset_id}</Link> · ตรวจพบ {fmtDate(f.detected_at)}</>}
            actions={f.status === 'PENDING' ? <>
              <button className="btn btn-danger" onClick={() => setModal('reject')}>Reject</button>
              <button className="btn btn-primary" onClick={() => setModal('wo')}>Verify &amp; Create Work Order</button>
            </> : f.work_order_ref ? <Link className="btn" to="/work-orders">ดู Work Order</Link> : null} />
          <ol className="mb-4 flex flex-wrap gap-2">
            {STEPS.map((s, i) => (
              <li key={s} className={`rounded-pill border px-3 py-1 text-sm ${i < idx ? 'border-ok text-ok' : i === idx ? 'border-primary text-primary-light' : 'border-border text-subtle'}`}>{i < idx ? '✓' : i + 1} {s}</li>
            ))}
          </ol>
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <Card title="Evidence" subtitle={f.evidence}>
                <LineChart labels={ev.map((_, i) => `${i - 47}h`)} series={[{ name: f.metric, data: ev, color: f.severity === 'HIGH' ? 'color-crit' : 'color-warn' }]} threshold={f.target} />
              </Card>
              <Card title="Recommended action">
                <p className="mb-2">{f.recommended_action}</p>
                {f.status === 'PENDING' && <p className="rounded-md border border-border bg-pill-info-bg p-3 text-sm text-pill-info-fg">ยืนยันแล้วระบบจะสร้าง Work Order ใน EnPrompt (human-in-the-loop · ADR-003)</p>}
              </Card>
            </div>
            <Card title="Data Contract">
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                <dt className="text-muted">finding_id</dt><dd><Mono>{f.finding_id}</Mono></dd>
                <dt className="text-muted">asset_id</dt><dd><Mono>{f.asset_id}</Mono></dd>
                <dt className="text-muted">rule_id</dt><dd><Mono>{f.rule_id}</Mono></dd>
                <dt className="text-muted">severity</dt><dd><StatusPill value={f.severity} /></dd>
                <dt className="text-muted">status</dt><dd><StatusPill value={f.status} label={STATUS_LABEL[f.status]} /></dd>
                <dt className="text-muted">verified_by</dt><dd>{f.verified_by ?? '—'}</dd>
                <dt className="text-muted">work_order_ref</dt><dd><Mono>{f.work_order_ref ?? '—'}</Mono></dd>
                {f.rejection_reason && <><dt className="text-muted">rejection_reason</dt><dd>{f.rejection_reason}</dd></>}
              </dl>
            </Card>
          </div>
          {modal === 'wo' && <WorkOrderModal f={f} onClose={() => setModal(null)} />}
          {modal === 'reject' && <RejectModal f={f} onClose={() => setModal(null)} />}
        </>
      );
    }}</QueryState>
  );
}

function WorkOrderModal({ f, onClose }: { f: FindingView; onClose: () => void }) {
  const m = useCreateWorkOrder();
  const toast = useToast();
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>(f.severity === 'HIGH' ? 'High' : 'Medium');
  const [due, setDue] = useState('2026-11-09');
  const submit = () => m.mutate({ finding_id: f.finding_id, priority, due_date: due }, {
    onSuccess: (r) => { toast(`สร้าง ${r.work_order_ref} ใน EnPrompt แล้ว (จำลอง)`); onClose(); },
    onError: () => toast('สร้าง Work Order ไม่สำเร็จ'),
  });
  return (
    <Modal title="สร้าง Work Order ใน EnPrompt" subtitle="ตรวจข้อมูลก่อนส่ง" onClose={onClose}>
      <dl className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-3 text-sm">
        <dt className="text-muted">Asset</dt><dd><Mono>{f.asset_id}</Mono></dd>
        <dt className="text-muted">จาก Finding</dt><dd><Mono>{f.finding_id}</Mono></dd>
        <dt className="text-muted">งาน</dt><dd>{f.recommended_action}</dd>
        <dt className="text-muted">Priority</dt><dd><select aria-label="priority" className="input" value={priority} onChange={(e) => setPriority(e.target.value as typeof priority)}><option>High</option><option>Medium</option><option>Low</option></select></dd>
        <dt className="text-muted">Due date</dt><dd><input aria-label="due date" type="date" className="input" value={due} onChange={(e) => setDue(e.target.value)} /></dd>
      </dl>
      <div className="mt-5 flex justify-end gap-2"><button className="btn" onClick={onClose}>ยกเลิก</button><button className="btn btn-primary" disabled={m.isPending} onClick={submit}>ยืนยันและส่ง</button></div>
    </Modal>
  );
}

function RejectModal({ f, onClose }: { f: FindingView; onClose: () => void }) {
  const m = useRejectFinding();
  const toast = useToast();
  const [cat, setCat] = useState(REASONS[0]);
  const [detail, setDetail] = useState('');
  const [touched, setTouched] = useState(false);
  const invalid = !detail.trim();
  const submit = () => {
    setTouched(true);
    if (invalid) return;
    m.mutate({ finding_id: f.finding_id, reason: `${cat} · ${detail.trim()}` }, {
      onSuccess: () => { toast('Reject แล้ว · ส่ง feedback ไปจูน rule'); onClose(); },
      onError: () => toast('Reject ไม่สำเร็จ'),
    });
  };
  return (
    <Modal title="Reject Finding" subtitle="เหตุผลจะถูกใช้จูน rule เพื่อลด false alarm (บังคับกรอก)" onClose={onClose}>
      <select aria-label="reason category" className="input mb-3" value={cat} onChange={(e) => setCat(e.target.value)}>{REASONS.map((r) => <option key={r}>{r}</option>)}</select>
      <textarea aria-label="rejection reason" aria-invalid={touched && invalid} rows={3} placeholder="รายละเอียดเพิ่มเติม (จำเป็น)" value={detail} onChange={(e) => setDetail(e.target.value)}
        className={`input ${touched && invalid ? 'border-crit' : ''}`} />
      {touched && invalid && <p className="mt-1 text-sm text-pill-crit-fg">กรุณาระบุเหตุผล (rejection_reason)</p>}
      <div className="mt-5 flex justify-end gap-2"><button className="btn" onClick={onClose}>ยกเลิก</button><button className="btn btn-danger" disabled={m.isPending} onClick={submit}>Reject</button></div>
    </Modal>
  );
}
