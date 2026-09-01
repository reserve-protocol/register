# Pair Review Protocol

Shared contract for `skills/pair.md` (reviewer) and `skills/pair-reviewer.md` (implementer). Load this file from either role. The coordination artifact is `${PAIR_REVIEW_FILE:-/tmp/CODE_REVIEW.mdx}`.

## Session Header

Create the artifact with this frontmatter; never join a file whose `session_id`, `repo_root`, or `base_ref` names different work.

```yaml
---
protocol: pair-review/v1
session_id: <unique-id>
repo_root: <absolute-path>
base_ref: <commit>
state: IDLE
work_status: ACTIVE
round: 0
event_seq: 0
review_snapshot: null
updated_by: <worker|reviewer>
updated_at: <ISO-8601>
---
```

If the default path belongs to another live session, use `/tmp/CODE_REVIEW.<session_id>.mdx` and tell the peer the exact path. Keep the file context-light:

```markdown
# Current round
## Findings
### R<round>-F<n> [OPEN] <Critical|Important|Minor>
<path:line; violated requirement; evidence; impact>

## Worker responses
### R<round>-F<n> [FIXED|DISPUTED|DEFERRED|CANNOT_VERIFY]
<reason; changed paths; verification evidence>

## Reviewer verification
### R<round>-F<n> [VERIFIED|REOPENED]
<evidence>

# Event log
- <event_seq> <timestamp> <role> <transition and concise reason>
```

Replace the current round when a new round starts; retain only concise outcomes in the event log. The Git diff remains the source of truth for code changes—do not narrate every edit.

## State Machine

- `IDLE`: no unanswered review batch; never means approval.
- `REVIEWED`: reviewer published round `N` against `review_snapshot`.
- `READ`: worker acknowledged that exact round and snapshot.
- `REPLIED`: worker dispositioned every finding in that round.
- `LGTM`: reviewer verified all findings and the final current snapshot while `work_status: DONE`. Terminal approval.

Allowed transitions:

```text
IDLE -> REVIEWED
REVIEWED -> READ
READ -> REPLIED
REPLIED -> REVIEWED | IDLE | LGTM
IDLE -> LGTM
```

The reviewer alone writes `REVIEWED`, `IDLE`, finding verification, and `LGTM`. The worker alone writes `READ`, `REPLIED`, responses, and `work_status`. Increment `round` for each new findings batch and `event_seq` for every transition. A response must name its round and `review_snapshot`; ignore stale generations.

Bind review to an immutable commit when possible. Otherwise record a deterministic digest covering HEAD plus staged, unstaged, deleted, and untracked content. Any code change after the recorded snapshot invalidates a prospective `LGTM` and requires a fresh final snapshot.

## Safe Writes

Before every mutation, acquire `<artifact>.lock` with atomic directory creation. While holding it: re-read the file, verify session/round/event sequence, patch only role-owned fields/sections, increment `event_seq`, then re-read and validate before releasing the lock. Never overwrite from a stale read or remove a fresh peer lock.

## Silence

**There are no heartbeats, timeouts, or liveness probes, and no `ORPHANED` state.** They were removed after a session in which they produced two false alarms, zero true detections, and a steady drip of notifications restating an unchanged idle state — while the daemon meant to prove liveness kept dying, because it refreshed on activity and therefore went stale exactly when a peer was heads-down or deliberately paused.

The safety property they were meant to defend is already structural, which is why removing them costs nothing: **only the reviewer writes `LGTM`, and only while `work_status: DONE`.** A stalled, crashed, or cancelled peer cannot produce approval by going quiet, because approval requires an act by the other role. `IDLE` never means approval either. Silence is not consent here by construction, not by timer.

So:

- **Wake on events, not on a clock.** Act when the artifact changes, when work lands, or when a peer messages you directly. Do not poll a peer to re-learn a state you already know.
- **When you pause deliberately, write one line in the event log saying so.** That converts ambiguous silence into documented silence, which is the whole value the heartbeat was reaching for.
- **If a peer is genuinely unresponsive and you need to stop, say so plainly** in the event log with the last observed activity, and stop. Report the surviving implementation and verification state as review-pending. Do not invent a terminal state for it; the session simply ends unapproved, which is the honest outcome and already the default.
- A crash, cancellation, token limit, malformed file, deleted file, or stale lock never becomes `LGTM`. Recovery starts a new `session_id`.
