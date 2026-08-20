# Resume Work Skill

Use this for an explicit safe pause, an unavoidable context boundary, or resuming a multi-session task from durable state. Do not load it for ordinary same-session next steps, final reports, or a request to keep working.

Influence: adapted from pstack's `recall`, `session-pickup`, and `pause-safely` (MIT), without Cursor paths, automatic transcript mining, mandatory fan-out, or automatic commits.

## Pause Contract

Create or refresh one project-owned checkpoint from `templates/evidence/resume-checkpoint.template.md`.

1. Stop at the end of the smallest atomic step. Start nothing new. Record live workers, owned paths, and unfinished external operations; do not discard shared-tree changes or cross an irreversible boundary merely to make the pause neat.
2. Bind the checkpoint to an immutable user-authorized commit or a deterministic snapshot covering HEAD plus all staged, unstaged, deleted, and untracked work content. Record exact exclusions. When the checkpoint/manifest live inside the worktree, they are the only permitted exclusions so the digest does not contain itself; never exclude source, config, data, or another work artifact. If the state cannot be reproduced, label it `snapshot-unproven` and name the blocker.
3. Point to the goal, fixed point, privacy-safe prompt/intent, plan, decisions, completed slices, and exact evidence. Use paths and artifact IDs instead of diff dumps or transcript summaries.
4. Record current tree/build state, known broken checks, permissions/approvals, data or migration checkpoint, and unresolved external side effects. `green`, `clean`, and `safe` require pointers; otherwise use `unknown`.
5. Name one next atomic action, its prerequisites, owned paths, stop condition, and unresolved risks. A cold-start agent should not need hidden conversational context to act.
6. Store no secrets, credentials, proprietary payloads, raw private prompts, or unrelated conversation. Use redacted stable pointers or digests and state the evidence's access boundary.
7. Never commit or push automatically. If persistence is worktree-only because no commit was authorized, say so explicitly. A checkpoint on disk is still better than state held only in context.

A pause is `resume-ready` only when the snapshot is reproducible, active operations are quiescent or explicitly owned, the next action is concrete, and every load-bearing claim has a resolvable pointer. Otherwise leave `paused-known-risk` or `snapshot-unproven`; do not manufacture a clean handoff.

## Resume Contract

1. Read the checkpoint and its direct pointers first. No transcript dependency: do not require or automatically search private chat histories. If no checkpoint exists, reconstruct only from user-provided context, live repository state, and project-owned durable records, then label the reconstruction incomplete.
2. Validate repository identity, goal, fixed point, and snapshot against the live tree. Preserve unexpected changes. If the tree diverged, enumerate the divergence by path/ref, decide what is inherited versus new, and stop for human direction only when ownership or intent is materially ambiguous.
3. Resolve load-bearing evidence and check its freshness. Historical evidence remains evidence for its exact snapshot, not for a changed tree or external system. Re-run the smallest sufficient check for current claims; broken pointers, changed targets, and unobservable side effects become `stale` or `unknown`, never silently `passed`.
4. Inspect live permission, data/migration, release, and external-side-effect state when the next action depends on it. Git state cannot prove remote or physical state.
5. Report what was inherited, snapshot match/divergence, stale claims, unresolved risks, and the exact resume point. Then route the next action through the normal workflow. Do not redo completed exploration merely for comfort.
6. When the checkpoint is consumed, mark it `resumed` or supersede it with a pointer. Delete it only under the project's retention policy; it may be release evidence.

Resume is complete when live state is reconciled with the checkpoint, stale claims are labeled or refreshed, and the next workflow action can proceed without transcript-only knowledge.

## Pressure and Counter-scenarios

**Pressure:** the user needs an immediate pause while authorized edits are uncommitted. Outcome: finish or clearly delimit the atomic edit, write a deterministic snapshot and checkpoint, and leave it worktree-only; never commit or push automatically.

**Pressure:** the checkpoint says tests passed, but the live snapshot or external target differs. Outcome: call the claim `stale`, preserve the divergent work, and run only the smallest evidence needed before relying on it.

**Counter-scenario:** the user says “keep going,” “do not stop,” or asks for the next command in the current session. Outcome: do not pause and do not create checkpoint ceremony; continue the active workflow.

**Counter-scenario:** no checkpoint exists but repository state and a project-owned plan fully identify the next action. Outcome: proceed from those durable sources, note that no prior checkpoint was inherited, and never mine unrelated or private transcripts to fill narrative gaps.

Static template tests prove structure only. Behavioral confidence stays unproven until a cold-start agent resumes a real interrupted task from the artifact.
