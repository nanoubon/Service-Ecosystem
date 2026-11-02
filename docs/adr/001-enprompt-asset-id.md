# ADR-001: EnPrompt Asset ID is the canonical key
- Status: Proposed (draft v0.1)
- Decision: Every entity (Telemetry, Finding, Savings, Work Order) references `asset_id` = EnPrompt Asset ID. BMS point names are mapped to it in the adapter, never used as primary keys.
- Consequences: Requires an asset/point mapping table per site. Open: confirm EnPrompt ID format.
