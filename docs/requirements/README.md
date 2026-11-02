# Requirements (BA) — EnCo Service Ecosystem Pilot

| เอกสาร | เนื้อหา |
|---|---|
| [functional-spec.md](functional-spec.md) | Functional Spec ราย 10 หน้าจอ + Acceptance Criteria + Traceability ไป Playwright |
| [data-request-gcme.md](data-request-gcme.md) | Data Request ถึง GCME พร้อม Point List ของ Chiller Plant |
| [process-flow-work-order.md](process-flow-work-order.md) | Work Order flow (as-is / to-be) + state diagram ของ Finding และ `mv_status` |
| [assumptions-open-questions.md](assumptions-open-questions.md) | คำถามที่ยังเปิด 5 ข้อ + Working Assumption |

อ้างอิง: `packages/contract` (Contract v0.2.0 บน `main`, v0.2.1 ใน PR #3), `apps/enco-xp/src/mocks/handlers.ts`, `apps/enco-xp/e2e/*.spec.ts`, `docs/adr/`.
ตัวเลขทุกตัวในเอกสารชุดนี้เป็น **ตัวอย่าง (example)** ไม่ใช่ข้อมูลจริงของลูกค้า
