# Assumptions & Open Questions

> ทุกข้อด้านล่างคือ **ASSUMPTION** สำหรับใช้ทำงานต่อ จนกว่าคุณ NanoBoot จะยืนยัน ไม่ใช่ข้อเท็จจริง

| # | คำถาม (Open) | Working Assumption | กระทบ |
|---|---|---|---|
| Q1 | เป้าหมายธุรกิจ, timeline, งบประมาณ, วันรายงาน GCME | **ASSUMPTION:** เป้าหมายคือพิสูจน์ว่า Finding → WO → Saving ที่ VERIFIED ทำได้จริงใน 1 plant; Pilot ประมาณ 3 เดือน; ยังไม่มีตัวเลขงบ; วันรายงาน GCME = TBD | Roadmap, Sprint goal |
| Q2 | EnPrompt มี API ไหม, data model, auth | **ASSUMPTION:** ยังไม่มี API ที่ใช้ได้ → Pilot ใช้ snapshot/mock (ADR-002); Asset ID ของ EnPrompt เป็น key; auth = service account ผ่านช่องทางที่ Security อนุมัติ | Create WO, ADR-002 |
| Q3 | Site ที่ทำ Pilot, ยี่ห้อ/protocol BMS, ข้อมูลย้อนหลังกี่เดือน | **ASSUMPTION:** Chiller Plant 1 แห่ง (ยังไม่ระบุชื่อ); BMS ใช้ BACnet/IP หรือ export CSV; มีย้อนหลัง ≥ 12 เดือน | Data Request, Baseline |
| Q4 | ผู้ใช้หลัก, UI guideline | **ASSUMPTION:** Energy Engineer ของ EnCo เป็นผู้ใช้หลัก รองลงมาคือ Supervisor/M&V; ใช้ Design System ปัจจุบันของทีม (dark theme, WCAG AA) จนกว่าจะได้ CI ของ EnCo | UX, Functional Spec |
| Q5 | On-prem หรือ Cloud, ใครเป็นเจ้าของ action ฝั่ง GCME | **ASSUMPTION:** Cloud ในไทย (data residency) สำหรับ Pilot; GCME มี Facility Manager 1 คนเป็นผู้รับ/ปิด WO | ADR-005, Security |

## Assumptions อื่น
- ~~1 Finding : 1 WO~~ → แทนด้วย Architect decision: OPEN WO ได้ 1 ตัวต่อ Finding, WO ที่ CANCELLED เก็บไว้ (planned in Contract v0.3)
- DISPUTED → PENDING พร้อม `dispute_reason` + history (planned in Contract v0.3)
- Tariff เป็นอัตราเดียวต่อช่วง Savings (ยังไม่แยก TOU)
