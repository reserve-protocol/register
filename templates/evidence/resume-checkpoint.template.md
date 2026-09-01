---
protocol: resume-work/v1
checkpoint_status: active # active | resume-ready | paused-known-risk | snapshot-unproven | resumed | superseded
created_at: <ISO-8601>
project_identity: <portable project identifier; no absolute machine path>
task_id: <stable task/stage identifier>
fixed_point: <immutable ref>
work_snapshot_kind: <commit | deterministic-worktree>
work_snapshot: <commit SHA | digest>
snapshot_method: <deterministic command/tool + version>
snapshot_manifest: <project-relative evidence pointer>
snapshot_exclusions: <this checkpoint + its manifest only | none for commit>
durability: <committed-with-authority | worktree-only | external-artifact-ref>
---

# Resume Checkpoint: <task>

## Goal and intent

- Goal/contract pointer: `<path/ref>`
- Privacy-safe prompt/intent pointer or digest: `<path/ref/digest>`
- Acceptance evidence pointer: `<path/ref>`
- Non-goals pointer: `<path/ref>`

## Completed and pending

- Completed slices: `<plan item ids + evidence pointers | none>`
- Current atomic step: `<id + state + path/ref>`
- Pending slices: `<plan item ids + blockers>`
- Decisions: `<project-owned decision refs | none>`

## Live state

- Tree state evidence: `<status/diff manifest pointer + observed time>`
- Build/runtime state: `<artifact/ref + green/red/unknown>`
- Active workers and owned paths: `<coordination artifact ref | none>`
- Running external operations: `<operation/status ref | none>`
- Known broken state: `<evidence pointer | none>`

## Permissions and authority

- Granted scope: `<approval/capability pointer>`
- Pending approval: `<pointer + blocked action | none>`
- Forbidden or expired authority: `<pointer | none>`

## Data and migrations

- Current schema/migration: `<path/ref | not-applicable: reason>`
- Data checkpoint: `<snapshot/backup ref | not-applicable: reason>`
- Recovery status/evidence: `<artifact/ref + tested/untested | not-applicable: reason>`

## External side effects

| Effect | Target pointer | Live state | Compensation/reconciliation | Owner/status |
| --- | --- | --- | --- | --- |
| `<message/payment/device/remote write | none>` | `<privacy-safe ref>` | `<not-emitted | emitted | unknown>` | `<artifact/ref | unavailable>` | `<owner + open/resolved>` |

## Evidence freshness

| Claim | Evidence pointer | Evidence snapshot | Freshness trigger | Current status |
| --- | --- | --- | --- | --- |
| `<claim id>` | `<command/report/artifact>` | `<ref/digest>` | `<changed path/target/time condition>` | `<fresh | stale | unknown>` |

## Resume point

- Next atomic action: `<one concrete action>`
- Prerequisites: `<path/ref/list | none>`
- Owned paths: `<project-relative paths>`
- Completion/stop condition: `<observable predicate>`
- Unresolved risks: `<pointer/list | none>`
- First verification: `<exact command or artifact seam>`

## Privacy and lifecycle

- Redactions/access boundary: `<pointer or concise classification>`
- Transcript dependency: `none`
- Known missing context: `<pointer/list | none>`
- Supersedes/superseded by: `<checkpoint ref | none>`
- Resume reconciliation result: `<snapshot-match | divergence pointer | not-yet-resumed>`
