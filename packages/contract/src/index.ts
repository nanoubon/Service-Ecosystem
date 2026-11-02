/** EnCo Pilot Data Contract v0.1 — see docs/adr. Field names are snake_case to match the wire format. */

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

export type MvStatus = 'PENDING' | 'VERIFIED' | 'DISPUTED';

export interface Savings {
  savings_id: string;
  finding_id: string;
  asset_id: AssetId;
  period_start: string;
  period_end: string;
  baseline_kwh: number;
  actual_kwh: number;
  savings_kwh: number;
  savings_thb: number;
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
