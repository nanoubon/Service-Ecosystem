/** FAKE DEMO DATA ONLY — no real customer data, sites, people or credentials. */
import type { Asset, FindingView, Savings, Telemetry } from '@enco/contract';

export const assets: Asset[] = [
  { asset_id: 'ENP-CH-001', name: 'Chiller #1', type: 'Centrifugal · 800 RT', criticality: 'A', health: 71, run_hours: 41250, maker: 'Demo Maker', year: 2016, kw_per_rt: 0.71,
    tags: [{ tag: 'CH1_kW', unit: 'kW', quality_flag: 'GOOD' }, { tag: 'CH1_CHWS_T', unit: '°C', quality_flag: 'GOOD' }, { tag: 'CH1_COND_APPR', unit: '°C', quality_flag: 'GOOD' }] },
  { asset_id: 'ENP-CH-002', name: 'Chiller #2', type: 'Centrifugal · 800 RT', criticality: 'A', health: 88, run_hours: 38900, maker: 'Demo Maker', year: 2016, kw_per_rt: 0.64,
    tags: [{ tag: 'CH2_kW', unit: 'kW', quality_flag: 'GOOD' }, { tag: 'CH2_CHWS_T', unit: '°C', quality_flag: 'GOOD' }] },
  { asset_id: 'ENP-CHP-001', name: 'CHW Pump #1', type: 'End-suction · 75 kW', criticality: 'B', health: 90, run_hours: 52100, maker: 'Demo Maker', year: 2016, kw_per_rt: null,
    tags: [{ tag: 'CHP1_kW', unit: 'kW', quality_flag: 'GOOD' }, { tag: 'CHP1_VIB', unit: 'mm/s', quality_flag: 'SUSPECT' }] },
  { asset_id: 'ENP-CT-001', name: 'Cooling Tower #1', type: 'Counterflow · 900 RT', criticality: 'B', health: 79, run_hours: 47300, maker: 'Demo Maker', year: 2017, kw_per_rt: null,
    tags: [{ tag: 'CT1_FAN_HZ', unit: 'Hz', quality_flag: 'MISSING' }, { tag: 'CT1_LWT', unit: '°C', quality_flag: 'GOOD' }] },
];

const f = (x: Omit<FindingView, 'verified_by' | 'work_order_ref' | 'rejection_reason' | 'after' | 'wo_state'> & Partial<FindingView>): FindingView =>
  ({ verified_by: null, work_order_ref: null, rejection_reason: null, after: null, wo_state: null, ...x });

export const findings: FindingView[] = [
  f({ finding_id: 'F-0012', asset_id: 'ENP-CH-001', rule_id: 'R-APPR-01', severity: 'HIGH', title: 'Condenser approach สูงผิดปกติ', evidence: 'CH1_COND_APPR 4.8 °C > threshold 3.0 °C ต่อเนื่อง 6 ชม.', metric: 'Condenser approach', unit: '°C', before: 4.8, target: 3.0, recommended_action: 'ตรวจและล้าง Condenser tube, ตรวจ water treatment และ cooling tower flow', status: 'PENDING', detected_at: '2026-11-02T12:10:00+07:00' }),
  f({ finding_id: 'F-0011', asset_id: 'ENP-CT-001', rule_id: 'R-CT-03', severity: 'MED', title: 'Fan VSD ไม่ตอบสนอง setpoint', evidence: 'CT1_FAN_HZ คงที่ 50 Hz ตลอด 24 ชม.', metric: 'Fan speed', unit: 'Hz', before: 50, target: 38, recommended_action: 'ตรวจ VSD และสัญญาณควบคุมจาก BMS', status: 'PENDING', detected_at: '2026-11-02T08:45:00+07:00' }),
  f({ finding_id: 'F-0009', asset_id: 'ENP-CH-002', rule_id: 'R-DT-02', severity: 'LOW', title: 'Low CHW ΔT', evidence: 'CHW ΔT เฉลี่ย 3.9 °C ต่ำกว่าเป้า 5.0 °C', metric: 'CHW ΔT', unit: '°C', before: 3.9, target: 5.0, recommended_action: 'ตรวจ 2-way valve ฝั่ง AHU', status: 'VERIFIED', verified_by: 'Demo Engineer', work_order_ref: 'WO-DEMO-1187', detected_at: '2026-10-28T10:20:00+07:00', after: 4.7, wo_state: 'IN_PROGRESS' }),
  f({ finding_id: 'F-0008', asset_id: 'ENP-CH-001', rule_id: 'R-OIL-02', severity: 'MED', title: 'Oil pressure differential ต่ำ', evidence: 'ΔP oil 18 psi < 20 psi', metric: 'Oil ΔP', unit: 'psi', before: 18, target: 20, recommended_action: 'เปลี่ยน oil filter', status: 'CLOSED', verified_by: 'Demo Engineer', work_order_ref: 'WO-DEMO-1102', detected_at: '2026-10-20T14:00:00+07:00', after: 23, wo_state: 'CLOSED' }),
  f({ finding_id: 'F-0007', asset_id: 'ENP-CHP-001', rule_id: 'R-VIB-01', severity: 'MED', title: 'Vibration spike', evidence: 'CHP1_VIB spike 7.1 mm/s ช่วง 3 นาที', metric: 'Vibration', unit: 'mm/s', before: 7.1, target: 4.5, recommended_action: 'ตรวจ bearing และ alignment', status: 'REJECTED', verified_by: 'Demo Engineer', rejection_reason: 'Sensor noise ระหว่างงานซ่อมบำรุงข้างเคียง', detected_at: '2026-10-18T09:30:00+07:00' }),
];

export const savings: Savings[] = [
  { savings_id: 'S-001', finding_id: 'F-0008', asset_id: 'ENP-CH-001', period_start: '2026-10-21', period_end: '2026-11-01', baseline_energy_kwh: 52400, actual_energy_kwh: 50100, savings_energy_kwh: 2300, savings_amount_thb: 9890, currency: 'THB', method: 'IPMVP Option B', mv_status: 'VERIFIED' },
  { savings_id: 'S-002', finding_id: 'F-0009', asset_id: 'ENP-CH-002', period_start: '2026-10-29', period_end: '2026-11-01', baseline_energy_kwh: 18100, actual_energy_kwh: 17450, savings_energy_kwh: 650, savings_amount_thb: 2795, currency: 'THB', method: 'IPMVP Option B', mv_status: 'PENDING' },
  { savings_id: 'S-003', finding_id: 'F-0006', asset_id: 'ENP-CT-001', period_start: '2026-10-10', period_end: '2026-10-20', baseline_energy_kwh: 9000, actual_energy_kwh: 8800, savings_energy_kwh: 200, savings_amount_thb: 860, currency: 'THB', method: 'IPMVP Option B', mv_status: 'DISPUTED' },
];

/** Deterministic pseudo-random series for charts */
export function series(n: number, base: number, amp: number, seed: number): number[] {
  let s = seed; const out: number[] = [];
  for (let i = 0; i < n; i++) { s = (s * 9301 + 49297) % 233280; out.push(+(base + Math.sin((i / n) * Math.PI * 6) * amp * 0.6 + (s / 233280 - 0.5) * amp).toFixed(3)); }
  return out;
}

export function telemetry(asset_id: string, tag: string, unit: string, quality_flag: Telemetry['quality_flag']): Telemetry[] {
  const base = unit === 'kW' ? 400 : unit === 'Hz' ? 50 : unit === 'mm/s' ? 3 : tag.includes('APPR') ? 4 : 7;
  const now = Date.parse('2026-11-02T12:00:00+07:00');
  return series(84, base, base * 0.12, tag.length * 7).map((v, i) => ({
    asset_id, tag, unit, source: 'SNAPSHOT', quality_flag,
    value: quality_flag === 'MISSING' && i > 70 ? null : v,
    timestamp: new Date(now - (83 - i) * 2 * 3600_000).toISOString(),
  }));
}
