# @enco/contract changelog

## 0.2.0 — 2026-11-02
- Added `CONTRACT_VERSION = '0.2.0'`.
- `FindingStatus`: `CLOSED` reachable **only from `VERIFIED`** (`FINDING_TRANSITIONS`, `canTransition`).
- `MvStatus` = `PENDING` (default, `MV_STATUS_DEFAULT`) | `VERIFIED` | `DISPUTED`. UI must hide savings figures unless `VERIFIED`.
- `Savings` fields renamed with explicit units: `baseline_energy_kwh`, `actual_energy_kwh`, `savings_energy_kwh`, `savings_amount_thb` + new `currency: 'THB'`. (Breaking: replaces `baseline_kwh`, `actual_kwh`, `savings_kwh`, `savings_thb`.)

## 0.1.0
- Initial Telemetry, Finding, Savings types.
