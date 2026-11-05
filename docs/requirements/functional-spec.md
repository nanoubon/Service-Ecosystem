# Functional Spec — EnCo XP (Pilot)

> Version: draft 0.1 · อ้างอิง Contract v0.2.0 (`main`) และ v0.2.1 (PR #3, ยังไม่ merge) · ตัวเลขทั้งหมดเป็น **ตัวอย่าง**

## 0. ขอบเขตและกฎร่วม (Global Rules)
- **G1 Scope:** Pilot แบบ **read-only advisory** สำหรับ **Chiller Plant 1 แห่ง** ระบบไม่สั่งงาน/เขียนค่ากลับ BMS (ADR-004)
- **G2 System of Record:** **EnPrompt** เป็นเจ้าของ Asset และ Work Order; `asset_id` = EnPrompt Asset ID (ADR-001); EnCo XP เก็บแค่ `work_order_ref`
- **G3 Human-in-the-loop:** สร้าง Work Order ได้หลังคน Verify Finding แล้วเท่านั้น (ADR-003)
- **G4 Demo label:** ทุกหน้าต้องแสดงแถบ `DEMO DATA` (`role="note"`) ตลอดช่วงที่ยังใช้ mock
- **G5 Units:** ค่าพลังงาน/เงินต้องมีหน่วย ชื่อฟิลด์ลงท้ายด้วยหน่วย (`_kwh`, `_thb`, `_thb_per_kwh`) และ UI แสดงหน่วยทุกครั้ง (kW, kWh, RT, kW/RT, °C, THB)
- **G6 Data quality:** ทุก Telemetry มี `quality_flag` = `GOOD | SUSPECT | MISSING` และต้องแสดงในจุดที่ใช้ค่านั้น
- **G7 Finding transitions:** `PENDING → VERIFIED | REJECTED`, `VERIFIED → CLOSED` เท่านั้น (`FINDING_TRANSITIONS`) อย่างอื่น API ตอบ **409**
- **G8 Reject:** ต้องมี `rejection_reason` (ไม่ว่าง/ไม่ใช่ whitespace) ไม่งั้น API ตอบ **400**
- **G9 Savings:** แสดงตัวเลข Saving ได้เฉพาะ `mv_status = VERIFIED`; `PENDING`/`DISPUTED` ซ่อนตัวเลข แสดงแค่สถานะ
- **G10 Savings v0.2.1 (PR #3):** `method` ∈ `IPMVP_A|IPMVP_B|IPMVP_C|IPMVP_D`; มี `tariff_thb_per_kwh > 0`; `savings_energy_kwh = baseline_energy_kwh − actual_energy_kwh`; `savings_amount_thb = savings_energy_kwh × tariff_thb_per_kwh` (ปัด 2 ตำแหน่ง); `period_end > period_start` ผิดกฎ → 422
- **G11 Page states:** ทุกหน้ามี Loading (skeleton), Empty, Error (มีปุ่ม Retry)
- **G12 Timestamp:** ISO-8601 พร้อม offset `+07:00` (Asia/Bangkok)
- **G13 A11y:** WCAG 2.1 AA (axe clean), ใช้ keyboard ได้ทั้ง flow, heading order + landmarks

## ผู้ใช้ (Personas — Assumption ดู assumptions-open-questions.md Q4)
| Role | ใช้ทำอะไร |
|---|---|
| Energy/Reliability Engineer (EnCo) | ดู Finding, Verify/Reject, สร้าง WO |
| Facility/Maintenance Supervisor | ติดตาม WO, ยืนยันงานเสร็จ |
| M&V Engineer | ตรวจ Baseline/Savings และตั้ง `mv_status` |
| Manager/ลูกค้า (GCME) | ดูภาพรวม, Saving ที่ VERIFIED |

## Data fields หลัก (จาก `packages/contract`)
- **Telemetry:** `asset_id, tag, value, unit, timestamp, source (SNAPSHOT|API|MANUAL), quality_flag`
- **Finding:** `finding_id, asset_id, rule_id, severity (HIGH|MED|LOW), evidence, recommended_action, verified_by, status, rejection_reason, work_order_ref` (+ view: `title, detected_at, metric, unit, before, target, after, wo_state`)
- **Savings:** `savings_id, finding_id, asset_id, period_start, period_end, baseline_energy_kwh, actual_energy_kwh, savings_energy_kwh, savings_amount_thb, currency (THB), method, mv_status` (+ v0.2.1: `tariff_thb_per_kwh`, `method: MvMethod`)
- **Asset (read model):** `asset_id, name, type, criticality (A|B|C), health, run_hours, maker, year, kw_per_rt, tags[{tag, unit, quality_flag}]`
- **CreateWorkOrderRequest:** `finding_id, priority (High|Medium|Low), due_date` · **RejectFindingRequest:** `finding_id, reason`

## Traceability keys (Playwright, `apps/enco-xp/e2e`)
| Key | Test name |
|---|---|
| R1 | `route ${path} renders heading + demo banner, no console errors, axe clean` (routes.spec) |
| R2 | `sidebar nav links reach correct routes` |
| R3 | `no horizontal overflow at ${width}px` |
| S1 | `states on ${path}: loading skeleton, empty/error with retry` (states.spec) |
| F1 | `Findings filter by status and severity` |
| F2 | `Full flow: PENDING → Verify/WO → VERIFIED → WO done → Close → CLOSED` |
| F3 | `Verification reopen returns WO to in-progress` |
| F4 | `Reject: blank reason blocked; with reason → REJECTED, reason in list, no Create WO` |
| F5 | `Transition rule: PENDING or REJECTED cannot go to CLOSED; VERIFIED can` |
| F6 | `Keyboard-only Tab/Enter through Verify flow` |
| F7 | `M&V: figures hidden unless VERIFIED; PENDING shown` |
| F8 | `Data Quality flags on page and on asset charts` |
| F9 | `Asset Health row opens detail; kW/RT with unit and quality_flag` |
| F10 | `Findings rows keyboard reachable via title link` |
| F11 | `Heading order and landmarks` |
| U1 | contract unit tests `packages/contract/test/savings.test.ts` (PR #3) |

R1, R3, S1 ใช้กับทุกหน้า จึงไม่ซ้ำในแต่ละหัวข้อ

---

## 1. Overview (`/`)
- **Purpose:** ภาพรวม Chiller Plant: KPI (เช่น plant kW/RT, Findings ค้าง, WO เปิด), Finding ล่าสุด
- **Users:** ทุก role · **API:** `GET /api/overview`
- **Business rules:** G4, G5; KPI ที่มาจาก Savings ต้องเป็น VERIFIED เท่านั้น (G9)
- **States:** Loading / Empty (ยังไม่มีข้อมูล) / Error+Retry
- **AC:**
  - Given ผู้ใช้เปิด `/` When โหลดเสร็จ Then เห็น h1, แถบ `DEMO DATA` และ KPI ทุกตัวมีหน่วย
  - Given API error When เปิดหน้า Then เห็นข้อความ error และปุ่ม Retry
- **Trace:** R1, R2, S1, F11

## 2. Asset Health (`/assets`)
- **Purpose:** รายการ Asset ใน plant พร้อม health, criticality, run hours
- **Users:** Engineer, Supervisor · **API:** `GET /api/assets`
- **Fields:** `asset_id, name, type, criticality, health, run_hours, kw_per_rt`
- **Rules:** `asset_id` ต้องเป็น EnPrompt ID (G2); แถวกดไป Asset Detail ได้ทั้งเมาส์และ keyboard
- **AC:** Given รายการ Asset When กดแถว Then ไปที่ `/assets/{asset_id}`
- **Trace:** F9, R1, S1

## 3. Asset Detail (`/assets/:assetId`)
- **Purpose:** รายละเอียด Asset + กราฟ Telemetry 7 วัน (เช่น kW/RT)
- **API:** `GET /api/assets/:id` (404 ถ้าไม่พบ), `GET /api/telemetry`
- **Fields:** `name, maker, year, kw_per_rt, tags[].unit, tags[].quality_flag`, Telemetry
- **Rules:** แสดง kW/RT **พร้อมหน่วย** และ `quality_flag`; แกน X ของกราฟเป็นวันที่/เวลา (+07:00) ไม่ใช่ index; จุดที่ `MISSING` ห้ามแสดงเป็น 0
- **AC:**
  - Given Asset มี `kw_per_rt` When เปิดหน้า Then เห็นค่าพร้อม "kW/RT" และ badge `quality_flag`
  - Given `asset_id` ไม่มีอยู่ When เปิดหน้า Then เห็นสถานะ not found/error
- **Trace:** F9, F8

## 4. Finding List (`/findings`)
- **Purpose:** รายการ Finding จาก rule engine เพื่อคัดกรอง
- **Users:** Engineer · **API:** `GET /api/findings`
- **Fields:** `finding_id, title, asset_id, severity, status, detected_at, rejection_reason, work_order_ref`
- **Rules:** filter ตาม `status` และ `severity`; ชื่อ Finding เป็น link (keyboard ได้); Finding ที่ REJECTED แสดง `rejection_reason` ในรายการ
- **AC:**
  - Given มี Finding หลายสถานะ When เลือก filter `PENDING` + `HIGH` Then เห็นเฉพาะที่ตรงเงื่อนไข
  - Given ใช้ keyboard When Tab ไปที่ชื่อ Finding แล้ว Enter Then เปิด Finding Detail
- **Trace:** F1, F4, F10

## 5. Finding Detail / Verify (`/findings/:findingId`)
- **Purpose:** ดู evidence และตัดสิน Verify (→ สร้าง WO) หรือ Reject
- **API:** `GET /api/findings/:id`, `POST .../work-order`, `POST .../reject`, `POST .../close`
- **Fields:** `evidence, recommended_action, rule_id, severity, metric/unit, before/target/after, verified_by, status, work_order_ref`
- **Rules:** G3, G7, G8; ปุ่ม Verify/Reject ใช้ได้เฉพาะ `PENDING`; Finding ที่ REJECTED ไม่มีปุ่ม Create WO; ปุ่ม Close ใช้ได้เฉพาะ `VERIFIED`
- **AC:**
  - Given Finding `PENDING` When กด Verify และยืนยัน Create WO Then ได้ `work_order_ref` และ status = `VERIFIED`
  - Given dialog Reject When ส่งโดย reason ว่าง Then ส่งไม่ได้ (API 400) และ status คง `PENDING`
  - Given ใส่ reason When ส่ง Then status = `REJECTED` และเห็น `rejection_reason` ใน Finding List
  - Given Finding `PENDING` หรือ `REJECTED` When เรียก close Then API ตอบ 409 และ status ไม่เปลี่ยน
- **Trace:** F2, F4, F5, F6

## 6. Create Work Order (dialog จาก Finding Detail + `/work-orders`)
- **Purpose:** ส่งคำแนะนำไปเป็น WO ใน EnPrompt และติดตามสถานะ
- **API:** `POST /api/findings/:id/work-order` (body `CreateWorkOrderRequest`), `POST .../wo-complete`
- **Fields:** `priority (High|Medium|Low), due_date, work_order_ref, wo_state (OPEN|IN_PROGRESS|DONE|CLOSED)`
- **Rules:** สร้างได้เฉพาะ Finding ที่ผ่าน Verify; OPEN WO ได้ 1 ตัวต่อ Finding (planned in Contract v0.3); EnPrompt เป็นเจ้าของ `wo_state` ฝั่ง XP แสดงอย่างเดียว; Pilot ใช้ mock แทน EnPrompt API (Q2)
- **AC:**
  - Given Finding VERIFIED When เปิด `/work-orders` Then เห็น WO พร้อม `work_order_ref`, priority, due date
  - Given priority หรือ due_date ว่าง When กด Create Then ส่งไม่ได้
- **Trace:** F2, F6

## 7. Verification (`/verification`)
- **Purpose:** ตรวจผลหลัง WO เสร็จ (before/after) แล้ว Close หรือ Reopen
- **API:** `POST .../close`, `POST .../reopen`
- **Rules:** Close ได้เฉพาะ `VERIFIED` ที่ WO = DONE; Reopen คืน WO เป็น `IN_PROGRESS`
- **AC:**
  - Given WO DONE When กด Close Then Finding = `CLOSED`
  - Given WO DONE When กด Reopen Then `wo_state` = `IN_PROGRESS`
- **Trace:** F2, F3, F5

## 8. Energy Efficiency (`/energy`)
- **Purpose:** แนวโน้ม plant kW/RT, kWh, cooling load (RT)
- **API:** `GET /api/energy`
- **Rules:** G5, G6; แสดงเป็น "ข้อมูลตัวอย่าง" จนกว่าจะต่อข้อมูลจริง; ไม่แสดงเป็นตัวเลข Saving (Saving อยู่ที่ M&V เท่านั้น)
- **AC:** Given โหลดสำเร็จ When เปิดหน้า Then ทุกกราฟ/ค่ามีหน่วยและแกนเวลา
- **Trace:** R1, S1, F11

## 9. Baseline / M&V (`/mv`)
- **Purpose:** แสดง Baseline vs Actual และ Savings ตาม IPMVP
- **API:** `GET /api/savings`
- **Fields:** ตาม Savings (+ `tariff_thb_per_kwh`, `method` enum เมื่อ PR #3 merge)
- **Rules:** G9, G10; แสดง Method และ Tariff บนหน้า; DISPUTED แสดงสถานะชัดเจนและซ่อนตัวเลข
- **AC:**
  - Given Savings `mv_status = PENDING` When เปิดหน้า Then เห็นสถานะ PENDING และไม่เห็นตัวเลข kWh/THB
  - Given `VERIFIED` Then เห็น `savings_energy_kwh` (kWh), `savings_amount_thb` (THB), method, tariff (THB/kWh)
  - Given payload ที่ `savings_amount_thb ≠ savings_energy_kwh × tariff` When validate Then ได้ 422
- **Trace:** F7, U1

## 10. Data Quality (`/data-quality`)
- **Purpose:** สรุปคุณภาพข้อมูลราย tag (completeness, ล่าสุด, flag)
- **API:** `GET /api/data-quality`
- **Rules:** G6; tag ที่ `SUSPECT/MISSING` ต้องเห็นชัดและสอดคล้องกับ badge บน Asset Detail
- **AC:** Given tag มี `MISSING` When เปิดหน้า Then เห็น flag ที่หน้านี้และบนกราฟของ Asset นั้น
- **Trace:** F8

---
## Out of scope (Pilot)
ตัวเลือก Site, กระดิ่งแจ้งเตือน, sort/pagination ของตาราง (Story แยก), การเขียนค่ากลับ BMS, หลาย plant

---
## Planned in Contract v0.3 (Architect decision — ยังไม่มีในโค้ด)
- **WorkOrder entity:** `{ work_order_id, finding_id, status: OPEN | CANCELLED | DONE, cancel_reason, created_at }`
- `Finding.work_order_ref` ชี้ไปที่ WO ที่ `OPEN` อยู่ **เพียงตัวเดียว**
- 1 Finding มี WO ที่ `OPEN` ได้สูงสุด 1 ตัว → ถ้าสร้างตัวที่สอง mock ตอบ **409**
- WO ที่ `CANCELLED` ต้องเก็บไว้ (ไม่ลบ) พร้อม `cancel_reason`
- การยกเลิก WO **ต้องมี** `cancel_reason` ไม่งั้น mock ตอบ **422** (ยืนยันโดย PO & Architect, 2 Nov 2026 — เหตุผล: audit trail ว่าแต่ละ WO ถูกยกเลิกเพราะอะไร)
- `mv_status` DISPUTED → PENDING: เก็บ `dispute_reason` และประวัติการเปลี่ยนสถานะ (status-change history)
- **AC (planned v0.3):** Given Finding มี WO `OPEN` อยู่แล้ว When สร้าง WO ใหม่ Then API ตอบ 409 และ `work_order_ref` ไม่เปลี่ยน · Given ยกเลิก WO (status → `CANCELLED`) When ไม่ใส่ `cancel_reason` Then ส่งไม่ได้ และ mock ตอบ **422** เหมือนกรณี `rejection_reason` (กฎยืนยันแล้ว — PO & Architect, 2 Nov 2026, planned in Contract v0.3; เหตุผล: audit trail ว่าแต่ละ WO ถูกยกเลิกเพราะอะไร) · Given WO ถูกยกเลิก Then ยังเห็นในประวัติ
