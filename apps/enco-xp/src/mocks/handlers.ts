// The ONLY place in the app that reads fixtures from /mocks. Pages use src/api.
import { http, HttpResponse, delay } from 'msw';
import { assets, findings as seed, savings, series, telemetry } from '@enco/mocks';
import { canTransition, validateSavings, type Savings, type CreateWorkOrderRequest, type FindingView } from '@enco/contract';

const findings: FindingView[] = structuredClone(seed);
let woSeq = 1200;
const byId = (id: string) => findings.find((f) => f.finding_id === id);

/** Test/demo scenario override: localStorage 'enco-mock-scenario' = loading | empty | error */
const scenario = () => (typeof localStorage !== 'undefined' ? localStorage.getItem('enco-mock-scenario') : null);
const conflict = (msg: string) => HttpResponse.json({ error: msg }, { status: 409 });

export const handlers = [
  http.get('/api/*', async ({ request }) => {
    const sc = scenario();
    if (sc === 'loading') { await delay('infinite'); }
    if (sc === 'error') return HttpResponse.json({ error: 'simulated' }, { status: 500 });
    if (sc === 'empty' && !/\/api\/(overview|energy)$|\/api\/(assets|findings)\/./.test(new URL(request.url).pathname)) return HttpResponse.json([]);
    return undefined;
  }),
  http.get('/api/overview', async () => {
    await delay(200);
    return HttpResponse.json({
      kw_per_rt: 0.68, kw_per_rt_baseline: 0.72, plant_load_rt: 1380, energy_today_kwh: 18420,
      pending_findings: findings.filter((f) => f.status === 'PENDING').length,
      verified_savings_amount_thb_mtd: savings.filter((x) => x.mv_status === 'VERIFIED').reduce((s, x) => s + x.savings_amount_thb, 0),
      trend: { labels: Array.from({ length: 84 }, (_, i) => new Date(Date.parse('2026-10-26T14:00:00+07:00') + i * 2 * 3600_000).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })), actual: series(84, 0.68, 0.05, 7), baseline: series(84, 0.72, 0.02, 11) },
    });
  }),
  http.get('/api/assets', async () => { await delay(150); return HttpResponse.json(assets); }),
  http.get('/api/assets/:id', ({ params }) => {
    const a = assets.find((x) => x.asset_id === params.id);
    return a ? HttpResponse.json(a) : new HttpResponse(null, { status: 404 });
  }),
  http.get('/api/telemetry', ({ request }) => {
    const u = new URL(request.url); const asset = u.searchParams.get('asset_id')!; const tag = u.searchParams.get('tag')!;
    const t = assets.find((a) => a.asset_id === asset)?.tags.find((x) => x.tag === tag);
    return t ? HttpResponse.json(telemetry(asset, tag, t.unit, t.quality_flag)) : HttpResponse.json([]);
  }),
  http.get('/api/energy', () => HttpResponse.json({
    hourly_load_rt: [620, 580, 560, 600, 760, 980, 1210, 1380, 1490, 1520, 1500, 1460, 1400, 1320, 1180, 980, 820, 700],
    kw_per_rt_by_chiller: assets.filter((a) => a.kw_per_rt != null).map((a) => ({ asset_id: a.asset_id, name: a.name, kw_per_rt: a.kw_per_rt })),
  })),
  http.get('/api/findings', async () => { await delay(150); return HttpResponse.json(findings); }),
  http.get('/api/findings/:id', ({ params }) => {
    const f = byId(String(params.id)); return f ? HttpResponse.json(f) : new HttpResponse(null, { status: 404 });
  }),
  http.post('/api/findings/:id/work-order', async ({ params, request }) => {
    const f = byId(String(params.id)); if (!f) return new HttpResponse(null, { status: 404 });
    if (!canTransition(f.status, 'VERIFIED')) return conflict(`${f.status} -> VERIFIED not allowed`);
    const body = (await request.json()) as CreateWorkOrderRequest; void body;
    Object.assign(f, { status: 'VERIFIED', verified_by: 'Demo Engineer', work_order_ref: `WO-DEMO-${++woSeq}`, wo_state: 'IN_PROGRESS', after: +(f.target + (f.before - f.target) * 0.15).toFixed(1) });
    return HttpResponse.json(f);
  }),
  http.post('/api/findings/:id/reject', async ({ params, request }) => {
    const f = byId(String(params.id)); const { reason } = (await request.json()) as { reason: string };
    if (!f || !reason?.trim()) return HttpResponse.json({ error: 'rejection_reason required' }, { status: 400 });
    if (!canTransition(f.status, 'REJECTED')) return conflict(`${f.status} -> REJECTED not allowed`);
    Object.assign(f, { status: 'REJECTED', verified_by: 'Demo Engineer', rejection_reason: reason });
    return HttpResponse.json(f);
  }),
  http.post('/api/findings/:id/wo-complete', ({ params }) => {
    const f = byId(String(params.id)); if (!f) return new HttpResponse(null, { status: 404 });
    f.wo_state = 'DONE'; return HttpResponse.json(f);
  }),
  http.post('/api/findings/:id/close', ({ params }) => {
    const f = byId(String(params.id)); if (!f) return new HttpResponse(null, { status: 404 });
    if (!canTransition(f.status, 'CLOSED')) return conflict(`${f.status} -> CLOSED not allowed (only from VERIFIED)`);
    Object.assign(f, { status: 'CLOSED', wo_state: 'CLOSED' }); return HttpResponse.json(f);
  }),
  http.post('/api/findings/:id/reopen', ({ params }) => {
    const f = byId(String(params.id)); if (!f) return new HttpResponse(null, { status: 404 });
    f.wo_state = 'IN_PROGRESS'; return HttpResponse.json(f);
  }),
  http.get('/api/savings', () => {
    const bad = savings.map((s) => [s.savings_id, validateSavings(s)] as const).filter(([, e]) => e.length);
    return bad.length ? HttpResponse.json({ error: 'invalid fixtures', bad }, { status: 500 }) : HttpResponse.json(savings);
  }),
  http.post('/api/savings/validate', async ({ request }) => {
    const errors = validateSavings((await request.json()) as Savings);
    return HttpResponse.json({ errors }, { status: errors.length ? 422 : 200 });
  }),
  http.get('/api/data-quality', () => HttpResponse.json(
    assets.flatMap((a) => a.tags.map((t) => ({ asset_id: a.asset_id, tag: t.tag, unit: t.unit, quality_flag: t.quality_flag,
      completeness: t.quality_flag === 'GOOD' ? 99.6 : t.quality_flag === 'SUSPECT' ? 94.2 : 61.0, last_seen: '2026-11-02T12:00:00+07:00' }))),
  )),
];
