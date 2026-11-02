import { useSearchParams } from 'react-router-dom';
import type { FindingView } from '@enco/contract';
import { useCloseFinding, useCompleteWorkOrder, useFindings, useReopenWorkOrder } from '../api';
import { LineChart } from '../components/Chart';
import { useToast } from '../components/Toast';
import { Card, EmptyState, KpiCard, Mono, PageHeader, QueryState, StatusPill } from '../components/ui';

const passes = (f: FindingView) => f.after != null && (f.target > f.before ? f.after >= f.target * 0.9 : f.after <= f.target * 1.15);

export default function Verification() {
  const q = useFindings();
  const [params, setParams] = useSearchParams();
  return (
    <>
      <PageHeader title="Verification" subtitle="เทียบผลก่อน/หลังแก้ไขกับเป้าหมาย แล้วปิดหรือเปิดงานต่อ" />
      <QueryState q={q}>{(rows) => {
        const list = rows.filter((f) => f.work_order_ref);
        if (!list.length) return <EmptyState message="ยังไม่มีงานที่รอ Verify" />;
        const sel = list.find((f) => f.finding_id === params.get('f')) ?? list[0];
        return (
          <div className="grid gap-4 lg:grid-cols-3">
            <Card title="รายการ">
              <ul className="space-y-2">{list.map((f) => (
                <li key={f.finding_id}><button onClick={() => setParams({ f: f.finding_id })} className={`w-full rounded-md border p-3 text-left ${f.finding_id === sel.finding_id ? 'border-primary bg-panel-2' : 'border-border'}`}>
                  <Mono>{f.finding_id}</Mono> <StatusPill value={f.status === 'CLOSED' ? 'CLOSED' : f.wo_state ?? 'OPEN'} /><div className="text-sm">{f.title}</div></button></li>))}
              </ul>
            </Card>
            <div className="lg:col-span-2"><VerifyPanel f={sel} /></div>
          </div>
        );
      }}</QueryState>
    </>
  );
}

function VerifyPanel({ f }: { f: FindingView }) {
  const toast = useToast();
  const close = useCloseFinding();
  const reopen = useReopenWorkOrder();
  const done = useCompleteWorkOrder();
  const ready = f.wo_state === 'DONE' || f.status === 'CLOSED';
  const ok = passes(f);
  if (!ready) return (
    <Card title={f.title} subtitle={`${f.finding_id} · ${f.work_order_ref}`}>
      <div className="rounded-md border border-dashed border-border p-6 text-center text-muted">กำลังแก้ไขใน EnPrompt · รอ Work Order เสร็จ
        <div className="mt-3"><button className="btn" onClick={() => done.mutate(f.finding_id)}>จำลอง: งานเสร็จ</button></div></div>
    </Card>
  );
  const amp = Math.abs(f.before - f.target) * 0.08;
  const data = [...Array.from({ length: 28 }, (_, i) => +(f.before + Math.sin(i) * amp).toFixed(2)), ...Array.from({ length: 28 }, (_, i) => +((f.after ?? 0) + Math.cos(i) * amp).toFixed(2))];
  return (
    <Card title={f.title} subtitle={`${f.finding_id} · ${f.work_order_ref} · ${f.metric}`} right={f.status === 'CLOSED' ? <StatusPill value="CLOSED" label="Closed" /> : undefined}>
      <div className="mb-4 grid grid-cols-3 gap-3">
        <KpiCard label="ก่อนแก้ไข" value={f.before} unit={f.unit} tone="crit" hint="before" />
        <KpiCard label="หลังแก้ไข (7 วัน)" value={f.after ?? '—'} unit={f.unit} tone={ok ? 'ok' : 'warn'} hint="after" />
        <KpiCard label="เป้าหมาย" value={f.target} unit={f.unit} hint="target" />
      </div>
      <LineChart height={200} labels={data.map((_, i) => (i === 28 ? 'งานเสร็จ' : `${i - 28}d`))} series={[{ name: f.metric, data, color: 'color-primary' }]} threshold={f.target} />
      {f.status === 'CLOSED'
        ? <p className="mt-3 rounded-md bg-pill-ok-bg p-3 text-pill-ok-fg">✓ ปิด Finding แล้ว · ผลผ่านเกณฑ์ ตรวจสอบย้อนกลับได้</p>
        : <>
          <p className={`mt-3 rounded-md p-3 ${ok ? 'bg-pill-ok-bg text-pill-ok-fg' : 'bg-pill-warn-bg text-pill-warn-fg'}`}>{ok ? 'ผลหลังแก้ไขเข้าเกณฑ์' : 'ผลยังไม่เข้าเกณฑ์ แนะนำเปิดงานต่อ'}</p>
          <div className="mt-3 flex justify-end gap-2">
            <button className="btn" onClick={() => reopen.mutate(f.finding_id, { onSuccess: () => toast('Reopen Work Order แล้ว (จำลอง)') })}>ยังไม่ผ่าน · Reopen</button>
            <button className="btn btn-primary" onClick={() => close.mutate(f.finding_id, { onSuccess: () => toast(`${f.finding_id} ปิดแล้ว`) })}>ผ่าน · Close Finding</button>
          </div>
        </>}
    </Card>
  );
}
