# Process Flow — Work Order (EnPrompt)

> EnPrompt เป็น System of Record ของ Asset และ Work Order · as-is เป็น **Assumption** รอยืนยัน (Q2)

## As-is (ปัจจุบัน — Assumption)
```mermaid
flowchart LR
  A[ช่าง/Operator พบปัญหา<br/>หรือ alarm จาก BMS] --> B[แจ้งหัวหน้า<br/>โทร/LINE/ฟอร์ม]
  B --> C[Supervisor สร้าง WO<br/>ใน EnPrompt ด้วยมือ]
  C --> D[มอบหมายช่าง]
  D --> E[ปฏิบัติงาน]
  E --> F[ปิด WO ใน EnPrompt]
  F -.ไม่มีการวัดผลพลังงาน.-> G((จบ))
```
Pain points: ตรวจพบช้า (reactive), ไม่มี evidence เชิงข้อมูล, ไม่วัด Saving หลังแก้

## To-be (Pilot กับ EnCo XP)
```mermaid
flowchart TD
  T[Telemetry snapshot<br/>quality_flag] --> R[Rule engine<br/>สร้าง Finding PENDING]
  R --> V{Engineer ตรวจ evidence}
  V -- Reject + rejection_reason --> X[REJECTED<br/>จบ]
  V -- Verify --> W[สร้าง WO<br/>priority, due_date]
  W --> EP[(EnPrompt<br/>System of Record)]
  EP --> WR[work_order_ref กลับมา<br/>Finding = VERIFIED]
  EP --> J[ช่างทำงาน<br/>wo_state OPEN→IN_PROGRESS→DONE]
  J --> C{Verification<br/>before/after}
  C -- Reopen --> J
  C -- Close --> CL[Finding = CLOSED]
  CL --> MV[M&V: Savings<br/>mv_status]
```
หมายเหตุ: ระบบไม่สั่งงาน BMS; ใน Pilot การสร้าง WO ใช้ mock จนกว่าจะยืนยัน EnPrompt API

## Finding status
```mermaid
stateDiagram-v2
  [*] --> PENDING
  PENDING --> VERIFIED: Verify + Create WO
  PENDING --> REJECTED: Reject (rejection_reason required)
  VERIFIED --> CLOSED: Close (after WO DONE)
  REJECTED --> [*]
  CLOSED --> [*]
```
Transition อื่น (เช่น PENDING→CLOSED, REJECTED→CLOSED) → **409 Conflict**

## Work Order state (`wo_state`, เจ้าของคือ EnPrompt)
```mermaid
stateDiagram-v2
  [*] --> OPEN
  OPEN --> IN_PROGRESS
  IN_PROGRESS --> DONE
  DONE --> IN_PROGRESS: Reopen
  DONE --> CLOSED
```

## WorkOrder status — planned in Contract v0.3
```mermaid
stateDiagram-v2
  [*] --> OPEN: create (สูงสุด 1 OPEN ต่อ Finding, ตัวที่สอง → 409)
  OPEN --> DONE
  OPEN --> CANCELLED: cancel_reason required (422 if missing)
  DONE --> [*]
  CANCELLED --> [*]: เก็บไว้ ไม่ลบ
```
`Finding.work_order_ref` ชี้ไป WO ที่ OPEN ตัวเดียว (planned in Contract v0.3)

## M&V status (`mv_status`)
```mermaid
stateDiagram-v2
  [*] --> PENDING
  PENDING --> VERIFIED: M&V Engineer ยืนยันตาม IPMVP
  PENDING --> DISPUTED: ลูกค้า/ผู้ตรวจโต้แย้ง
  DISPUTED --> PENDING: บันทึก dispute_reason + history (planned v0.3)
```
แสดงตัวเลข Saving เฉพาะ `VERIFIED` · DISPUTED→PENDING พร้อม `dispute_reason` และ status-change history = **planned in Contract v0.3** (Architect ยืนยันแล้ว ยังไม่มีในโค้ด)
