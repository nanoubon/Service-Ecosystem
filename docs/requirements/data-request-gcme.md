# Data Request ถึง GCME — Chiller Plant Pilot

> สถานะ: **Draft** (ยังไม่ส่ง) · ตัวอย่าง interval/ช่วงเวลาเป็นข้อเสนอ ไม่ใช่ข้อตกลง

## วัตถุประสงค์
ขอข้อมูลย้อนหลังและข้อมูลต่อเนื่องของ Chiller Plant 1 แห่ง เพื่อทำ rule-based Finding, kW/RT และ Baseline M&V (IPMVP) ใน Pilot แบบ read-only

## ⚠️ ข้อกำหนดด้านข้อมูล
- **ห้ามใส่ข้อมูลลูกค้าจริงหรือ BMS credentials ลงใน repo** — ส่งผ่านช่องทางที่ Security อนุมัติเท่านั้น
- ระบบไม่เขียนค่ากลับ BMS (ADR-004)
- Timestamp รูปแบบ ISO-8601 พร้อม **`+07:00`** เช่น `2026-10-28T14:15:00+07:00`
- ไฟล์ CSV/Parquet: `asset_id, tag, value, unit, timestamp, quality_flag` (ตรง Contract `Telemetry`)

## Point List (ต่อ Chiller/อุปกรณ์)
| # | Point | Tag (ตัวอย่าง) | Unit | Interval | History | Source | หมายเหตุ |
|---|---|---|---|---|---|---|---|
| 1 | Chiller power | `CH-1.KW` | kW | 15 min | ≥ 12 เดือน | BMS / power meter | ต่อเครื่อง |
| 2 | Chiller energy | `CH-1.KWH` | kWh | 15 min | ≥ 12 เดือน | power meter | สะสม |
| 3 | CHW supply temp | `CH-1.CHWS_T` | °C | 5–15 min | ≥ 12 เดือน | BMS | |
| 4 | CHW return temp | `CH-1.CHWR_T` | °C | 5–15 min | ≥ 12 เดือน | BMS | |
| 5 | CHW flow | `CHW.FLOW` | m³/h (หรือ L/s) | 5–15 min | ≥ 12 เดือน | flow meter | ระบุว่าวัดจริง/คำนวณ |
| 6 | CW supply temp | `CH-1.CWS_T` | °C | 5–15 min | ≥ 12 เดือน | BMS | |
| 7 | CW return temp | `CH-1.CWR_T` | °C | 5–15 min | ≥ 12 เดือน | BMS | |
| 8 | Cooling load | `PLANT.LOAD_RT` | RT | 15 min | ≥ 12 เดือน | BMS/คำนวณ | ระบุสูตรถ้าคำนวณ |
| 9 | Plant efficiency | `PLANT.KW_PER_RT` | kW/RT | 15 min | ≥ 12 เดือน | คำนวณ | XP คำนวณซ้ำเพื่อตรวจ |
| 10 | CHW pump power | `CHWP-1.KW` | kW | 15 min | ≥ 12 เดือน | BMS/meter | |
| 11 | CW pump power | `CWP-1.KW` | kW | 15 min | ≥ 12 เดือน | BMS/meter | |
| 12 | Cooling tower fan power | `CT-1.KW` | kW | 15 min | ≥ 12 เดือน | BMS/meter | |
| 13 | Chiller status / run | `CH-1.STATUS` | on/off | change-of-value | ≥ 12 เดือน | BMS | |
| 14 | Chiller % load / RLA | `CH-1.PCT_LOAD` | % | 15 min | ≥ 12 เดือน | BMS | |
| 15 | Outdoor DBT / RH (หรือ WBT) | `OA.DBT`, `OA.RH` | °C, %RH | 15 min | ≥ 12 เดือน | BMS/weather | ตัวแปร Baseline |
| 16 | CHW setpoint | `CH-1.CHWS_SP` | °C | COV | ≥ 12 เดือน | BMS | |
| 17 | Electricity tariff | — | THB/kWh | ต่อรอบบิล | ≥ 12 เดือน | บิลค่าไฟ | ใช้กับ `tariff_thb_per_kwh` |

## ข้อมูลประกอบ (Metadata)
- Asset register ที่ map กับ **EnPrompt Asset ID** (name, maker, model, year, capacity RT)
- Single-line / schematic ของ plant, ยี่ห้อและ protocol ของ BMS (BACnet/Modbus/อื่น)
- ประวัติ Work Order ใน EnPrompt ≥ 12 เดือน (ไม่ต้องมีข้อมูลส่วนบุคคล)

## ความคาดหวังเรื่อง `quality_flag`
| Flag | เงื่อนไข (ข้อเสนอ) |
|---|---|
| `GOOD` | ค่าอยู่ในช่วงทางกายภาพและมาตรงเวลา |
| `SUSPECT` | นอกช่วง (เช่น CHWS < 3 °C หรือ > 15 °C), ค่าค้าง (flat-line) นานเกินกำหนด, ΔT ติดลบ |
| `MISSING` | ไม่มีค่าใน interval นั้น — ส่งเป็น `value = null` ห้ามเติม 0 |

ถ้า GCME มี flag ของตัวเองจาก BMS ขอให้ส่งมาด้วยพร้อมความหมาย

## ขอให้ GCME ยืนยัน
1. Point ไหนมี/ไม่มี และ interval จริง 2. ระยะย้อนหลังที่มี (เดือน) 3. วิธีส่ง (SFTP/export/API) และผู้รับผิดชอบ 4. วันที่ส่งข้อมูลชุดแรก
