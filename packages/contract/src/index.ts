/** EnCo Pilot Data Contract v0.2 (see CHANGELOG.md) — see docs/adr. Field names are snake_case to match the wire format. */

export const CONTRACT_VERSION = '0.2.1' as const;

export type AssetId = string; // EnPrompt Asset ID is the canonical key (ADR-001)

export type QualityFlag = 'GOOD' | 'SUSPECT' | 'MISSING';
export type DataSource = 'SNAPSHOT' | 'API' | 'MANUAL';

export interface Telemetry {
  asset_id: AssetId;
  tag: string;
  value: number | null;
  unit: string;
  timestamp: string; // ISO-8601
  source: DataSource;
  quality_flag: QualityFlag;
}

export type Severity = 'HIGH' | 'MED' | 'LOW';
export type FindingStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'CLOSED';

export interface Finding {
  finding_id: string;
  asset_id: AssetId;
  rule_id: string;
  severity: Severity;
  evidence: string;
  recommended_action: string;
  verified_by: string | null;
  status: FindingStatus;
  rejection_reason: string | null; // required when status = REJECTED
  work_order_ref: string | null;
}

/** Default PENDING. Savings figures may only be displayed when VERIFIED. */
export type MvStatus = 'PENDING' | 'VERIFIED' | 'DISPUTED';
export const MV_STATUS_DEFAULT: MvStatus = 'PENDING';
export type Currency = 'THB';
export type MvMethod = 'IPMVP_A' | 'IPMVP_B' | 'IPMVP_C' | 'IPMVP_D';
export const MV_METHODS: readonly MvMethod[] = ['IPMVP_A', 'IPMVP_B', 'IPMVP_C', 'IPMVP_D'];

/** Allowed Finding transitions. CLOSED is reachable only from VERIFIED. */
export const FINDING_TRANSITIONS: Record<FindingStatus, FindingStatus[]> = {
  PENDING: ['VERIFIED', 'REJECTED'],
  VERIFIED: ['CLOSED'],
  REJECTED: [],
  CLOSED: [],
};
export const canTransition = (from: FindingStatus, to: FindingStatus) => FINDING_TRANSITIONS[from].includes(to);

export interface Savings {
  savings_id: string;
  finding_id: string;
  asset_id: AssetId;
  period_start: string; // ISO date
  period_end: string; // ISO date
  baseline_energy_kwh: number;
  actual_energy_kwh: number;
  savings_energy_kwh: number;
  savings_amount_thb: number;
  tariff_thb_per_kwh: number;
  currency: Currency;
  method: MvMethod;
  mv_status: MvStatus;
}

/** UI-side read models (not part of the wire contract) */
export interface Asset {
  asset_id: AssetId;
  name: string;
  type: string;
  criticality: 'A' | 'B' | 'C';
  health: number;
  run_hours: number;
  maker: string;
  year: number;
  kw_per_rt: number | null;
  tags: { tag: string; unit: string; quality_flag: QualityFlag }[];
}

export type WorkOrderState = 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'CLOSED';

export interface FindingView extends Finding {
  title: string;
  detected_at: string;
  metric: string;
  unit: string;
  before: number;
  target: number;
  after: number | null;
  wo_state: WorkOrderState | null;
}

export interface CreateWorkOrderRequest { finding_id: string; priority: 'High' | 'Medium' | 'Low'; due_date: string; }
export interface RejectFindingRequest { finding_id: string; reason: string; }

export const SAVINGS_THB_TOLERANCE = 0.01;
const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/** Savings consistency rules (v0.2.1). Returns a list of violations; empty = valid. */
export function validateSavings(s: Savings): string[] {
  const e: string[] = [];
  if (!MV_METHODS.includes(s.method)) e.push(`method must be one of ${MV_METHODS.join('|')}`);
  if (!(Date.parse(s.period_end) > Date.parse(s.period_start))) e.push('period_end must be after period_start');
  if (!(s.tariff_thb_per_kwh > 0)) e.push('tariff_thb_per_kwh must be > 0');
  if (round2(s.baseline_energy_kwh - s.actual_energy_kwh) !== round2(s.savings_energy_kwh)) e.push('savings_energy_kwh must equal baseline_energy_kwh - actual_energy_kwh');
  // tolerance 0.01 THB (+ tiny epsilon for float error)
  if (Math.abs(s.savings_amount_thb - s.savings_energy_kwh * s.tariff_thb_per_kwh) > SAVINGS_THB_TOLERANCE + 1e-9) e.push(`savings_amount_thb must be within ${SAVINGS_THB_TOLERANCE} THB of savings_energy_kwh * tariff_thb_per_kwh`);
  return e;
}
