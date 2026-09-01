---
protocol: release-evidence/v1
receipt_status: draft # draft | snapshot-unproven | blocked | approved | released | rollback-required | rolled-back
created_at: <ISO-8601>
artifact_id: <stable project-relative identifier>
fixed_point: <immutable ref>
release_snapshot_kind: <commit | deterministic-worktree>
release_snapshot: <commit SHA | digest>
snapshot_method: <deterministic command/tool + version>
snapshot_manifest: <project-relative evidence pointer>
snapshot_exclusions: <this receipt + its manifest only | none for commit>
---

# Release Receipt: <candidate>

## Prompt / intent

- Request or contract pointer: `<path/ref>`
- Privacy-safe prompt/intent pointer or digest: `<path/ref/digest>`
- Acceptance criteria pointer: `<path/ref>`
- Non-goals pointer: `<path/ref>`

## Scope

- Product surfaces: `<path/ref>`
- Public contracts: `<path/ref | not-applicable: reason>`
- Data domains: `<path/ref | not-applicable: reason>`
- Explicit exclusions: `<path/ref or concise list>`

## Permissions and capabilities

- Requested permissions: `<pointer | none>`
- Permission changes: `<pointer | none>`
- Approval required: `<yes/no + authority rule pointer>`
- Snapshot-bound approval: `<approval artifact/ref | blocked>`

## Verification evidence

Evidence is a pointer, not prose. One row per acceptance claim.

| Claim | Command or artifact pointer | Result | Observed at | Verifier snapshot |
| --- | --- | --- | --- | --- |
| `<criterion id>` | `<command + output path / screenshot / trace / report>` | `<passed | failed | skipped | unknown | unavailable>` | `<ISO-8601>` | `<ref/digest>` |

## Data and migration checkpoint

- Schema/migration identity: `<path/ref | not-applicable: reason>`
- Pre-change data checkpoint: `<snapshot/backup ref | not-applicable: reason>`
- Recovery procedure: `<path/ref | not-applicable: reason>`
- Recovery evidence: `<artifact/ref + tested/untested | not-applicable: reason>`
- Irreversible effects: `<pointer | none>`

## Human authority

- Consequential action class: `<shared release | remote write | external message | money | device | destructive data | permission expansion | none>`
- Exact action: `<privacy-safe action pointer | not-applicable: reason>`
- Exact target: `<privacy-safe target pointer | not-applicable: reason>`
- Approved scope: `<scope/limits pointer | not-applicable: reason>`
- Approval actor scope: `<role or stable non-secret id | not-applicable: reason>`
- Approval evidence: `<artifact/ref bound to release_snapshot | blocked | not-applicable: reason>`
- Approval expiry: `<time/condition/ref | not-applicable: reason>`
- Credentials/general request/prior approval rejected as new authority: `<check evidence | not-applicable: reason>`

## Release and rollback

- Release target: `<environment/surface ref>`
- Release reference: `<deployment/build/promotion ref | not-yet-released>`
- Post-release evidence: `<artifact/ref | not-yet-released>`
- Rollback artifact/reference: `<known-good ref>`
- Rollback trigger: `<observable predicate pointer>`
- Rollback procedure: `<path/ref>`
- Rollback verification: `<artifact/ref + tested/untested>`

## Unresolved external side effects

| Effect/action | Exact target | Approved scope and snapshot-bound evidence | Emitted state | Compensation/reconciliation evidence | Owner/status |
| --- | --- | --- | --- | --- | --- |
| `<message/payment/device/remote write | none>` | `<privacy-safe ref>` | `<approval ref | blocked | not-applicable: already emitted without authority>` | `<not-emitted | emitted | unknown>` | `<artifact/ref | unavailable>` | `<owner + open/resolved>` |

## Freshness and privacy

- Pointer-resolution check: `<command/report + observed time>`
- Snapshot match check: `<command/report + observed time>`
- Stale claims: `<claim ids + reason | none>`
- Redactions/access boundary: `<pointer or concise classification>`
- Known gaps: `<pointer/list | none>`
- Supersedes/superseded by: `<receipt ref | none>`

## Final disposition

- Status: `<draft | snapshot-unproven | blocked | approved | released | rollback-required | rolled-back>`
- Reason pointer: `<evidence/approval/blocker ref>`
- Behavioral confidence: `<proven-on-recorded-release | unproven>`
