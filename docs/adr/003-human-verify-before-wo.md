# ADR-003: Human verifies before a Work Order is created
- Status: Proposed
- Decision: Findings start `PENDING`. Only an engineer action (Verify) creates a Work Order in EnPrompt; Reject requires `rejection_reason`, which feeds rule tuning.
- Consequences: No automatic WO creation. Audit fields `verified_by`, `work_order_ref`.

## Update (Contract v0.2)
`CLOSED` is allowed only from `VERIFIED` (after the Work Order is done and the result verified). `PENDING`/`REJECTED` → `CLOSED` is rejected (HTTP 409 in mocks). See `packages/contract/CHANGELOG.md`.
