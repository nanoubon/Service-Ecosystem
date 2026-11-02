/** EnCo Pilot Data Contract v0.2 (see CHANGELOG.md) — see docs/adr. Field names are snake_case to match the wire format. */

export const CONTRACT_VERSION = '0.2.0' as const;

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
  currency: Currency;
  method: string; // e.g. IPMVP Option B
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
