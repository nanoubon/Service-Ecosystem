# @enco/contract changelog

## 0.2.1 — 2026-11-02
- `Savings.method` is now `MvMethod` = `IPMVP_A | IPMVP_B | IPMVP_C | IPMVP_D` (was free `string`).
- Added `Savings.tariff_thb_per_kwh: number`.
- Added `validateSavings()`: `savings_energy_kwh = baseline_energy_kwh - actual_energy_kwh`; `period_end > period_start`; `|savings_amount_thb - savings_energy_kwh * tariff_thb_per_kwh| <= 0.01` (`SAVINGS_THB_TOLERANCE`); tariff > 0; valid method. Mock API rejects invalid savings (422 on `POST /api/savings/validate`, 500 if fixtures are inconsistent).

## 0.2.0 — 2026-11-02
- Added `CONTRACT_VERSION = '0.2.0'`.
- `FindingStatus`: `CLOSED` reachable **only from `VERIFIED`** (`FINDING_TRANSITIONS`, `canTransition`).
- `MvStatus` = `PENDING` (default, `MV_STATUS_DEFAULT`) | `VERIFIED` | `DISPUTED`. UI must hide savings figures unless `VERIFIED`.
- `Savings` fields renamed with explicit units: `baseline_energy_kwh`, `actual_energy_kwh`, `savings_energy_kwh`, `savings_amount_thb` + new `currency: 'THB'`. (Breaking: replaces `baseline_kwh`, `actual_kwh`, `savings_kwh`, `savings_thb`.)

## 0.1.0
- Initial Telemetry, Finding, Savings types.
