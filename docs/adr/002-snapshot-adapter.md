# ADR-002: Snapshot adapter now, API adapter later
- Status: Proposed
- Decision: Pilot ingests periodic snapshot exports (CSV/Excel) through a Snapshot adapter producing Data Contract v0.1. An API adapter replaces it behind the same contract once EnPrompt/BMS APIs are confirmed.
- Consequences: `source` field = SNAPSHOT | API | MANUAL. Frontend is unaffected by the switch.
