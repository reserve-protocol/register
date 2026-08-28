# Release Evidence Skill

Use this when a medium/high stage is about to be promoted, deployed, published, or otherwise made available beyond its current development surface. It owns the auditable release receipt. Ordinary iteration and local prototypes stay with `skills/workflow.md` and do not load this skill.

Influence: adapted from pstack's `show-me-your-work` (MIT) into a project-agnostic, snapshot-bound release contract. The receipt records proof and authority; it is not a transcript, deployment tool, or permission to release.

## Output

Create one project-owned receipt from `templates/evidence/release-receipt.template.md`. Keep claims short and put detail behind paths, immutable references, commands, or artifact IDs. **Evidence is a pointer, not prose.** Use `not-applicable: <reason>` instead of blank fields.

Bind the receipt to exactly one release candidate:

- Prefer an immutable commit only when the user or project already authorized that commit.
- Otherwise use a deterministic snapshot whose manifest covers HEAD plus all staged, unstaged, deleted, and untracked candidate content. Record the snapshot method, manifest pointer, digest, and exclusions. When the receipt/manifest live inside the worktree, they are the only permitted exclusions so the digest does not contain itself; never exclude source, config, data, or another work artifact.
- Never commit or push automatically to manufacture a fixed point.
- If neither binding is trustworthy, stop at `snapshot-unproven`; do not call the candidate release-ready.

## Receipt Loop

1. **Pin intent.** Point to the request/contract and a privacy-safe prompt or intent record. Record acceptance criteria and non-goals by pointer; never paste private raw conversation merely to make the receipt complete.
2. **Record scope.** Name changed product surfaces, data domains, public contracts, and explicit exclusions. A diff summary is not a substitute for behavioral scope.
3. **Expose authority.** List requested and changed permissions/capabilities. Permission expansion, shared release, destructive data work, external communication, remote writes, money, or physical-device control requires explicit human approval bound to this exact snapshot and naming the exact action, target, and scope. Credentials, a general release request, or approval for an earlier action are not approval for a new consequence. Missing approval is `blocked`, never implied by a green test.
4. **Attach verification.** For each acceptance claim, record the exact command or real-surface artifact pointer, result, observed time, and verifier snapshot. Worker/reviewer summaries are claims until their pointers resolve. `skipped`, `unknown`, and `unavailable` are honest results, not passes.
5. **Protect data.** Record schema/migration identity, pre-change checkpoint, restore or forward-repair procedure, and recovery evidence. Code rollback is not data rollback. Destructive or irreversible migration without approved, tested recovery blocks release.
6. **Plan recovery.** Record the release target/reference, rollback artifact/reference, rollback trigger, and verification after rollback. A rollback command that has not been exercised must say `untested`.
7. **Account for the world.** Enumerate external side effects already emitted or expected, including messages, payments, device actions, remote writes, and third-party state. For each expected consequential effect, point to its exact-action/target/scope approval for this snapshot or block release. A receipt records authority; it never creates or retroactively supplies it. Git cannot reverse emitted effects; attach reconciliation or compensation evidence and leave unresolved effects visible.
8. **Re-check freshness.** Immediately before approval or release, resolve every load-bearing pointer and compare the candidate with the receipt snapshot. Any code, permission, migration, acceptance, or release-target change invalidates the affected proof and approval. Mark it `stale`, re-run the smallest sufficient evidence, and update the receipt against a new snapshot.
9. **Close honestly.** A receipt may be `draft`, `snapshot-unproven`, `blocked`, `approved`, `released`, `rollback-required`, or `rolled-back`. `snapshot-unproven` is mandatory when candidate binding cannot be reproduced; it never means approved. `released` requires an actual release reference and post-release evidence; `approved` alone is not released. Preserve a completed receipt; supersede it by pointer rather than rewriting history silently.

The receipt is complete when its snapshot resolves, every acceptance claim has inspected evidence, authority is explicit, data recovery is evidenced or honestly not applicable, release and rollback references are concrete for the current state, and unresolved external effects are named.

## Pressure and Counter-scenarios

**Pressure:** the deadline arrived, tests are green, and the candidate adds a shared permission, remote write, or destructive migration without snapshot-bound exact-action/target/scope approval or recovery evidence. Outcome: write the receipt as `blocked`; do not release and do not weaken the gate.

**Pressure:** no commit was authorized. Outcome: bind a deterministic worktree snapshot and leave the tree uncommitted; never commit or push automatically.

**Stale-claim scenario:** a receipt says green but the candidate, permission set, migration, or target changed afterward. Outcome: invalidate only the affected claims and approvals, produce fresh evidence, and bind a new snapshot. Never copy the old `passed` result forward.

**Counter-scenario:** a private throwaway prototype is being exercised locally and has no promotion, deployment, shared consumer, durable data, or external side effect. Outcome: skip the receipt; ordinary scoped completion evidence owns the work.

Static template tests prove structure only. Until a real release executes this loop and its rollback, behavioral confidence is unproven.
