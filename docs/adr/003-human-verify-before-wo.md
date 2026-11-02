# ADR-003: Human verifies before a Work Order is created
- Status: Proposed
- Decision: Findings start `PENDING`. Only an engineer action (Verify) creates a Work Order in EnPrompt; Reject requires `rejection_reason`, which feeds rule tuning.
- Consequences: No automatic WO creation. Audit fields `verified_by`, `work_order_ref`.
