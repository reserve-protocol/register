# Maintain Real-Surface Verification Skill

Use this when a project-local `skills/verify-<surface>.md` or its feature map may have drifted after user-facing changes, or when explicitly asked to audit it. Skip for changes outside its mapped surface and when no verification skill exists; use `skills/create-verification.md` only if a runnable surface actually needs one.

Influence: adapted from pstack's `maintain-verification-skill` (MIT), preserving live coverage while removing mandatory fan-out and PR assumptions.

## Outcome Contract

Return one honest outcome:

- **clean:** every mapped feature received source and live coverage; no correction remains.
- **changed:** drift or a harness gap was corrected inside the verification package and every correction was re-proved live.
- **blocked:** coverage or a safe correction could not complete; name each feature, attempted route, and missing prerequisite.

Never commit, push, or open a PR without authority. Behavioral confidence remains unproven for any feature not driven live.

## Edit Boundary

Edit only the verification skill, its feature map, and helpers it owns. Do not edit product code during maintenance. If documented behavior no longer works, classify it as source drift, harness drift, an unreachable prerequisite, or a product regression. Report a product regression; do not paper it over or fix it in this pass.

## Maintenance Pass

1. **Locate and pin.** Identify exactly one verification skill, its feature map, evidence location, current fixed point/build, and launch ownership model. Multiple candidates require selecting the affected surface; none returns `blocked` with the creation re-entry condition.
2. **Index hygiene.** Compare the feature index with its files. Remove duplicate/dead entries, restore missing links, and inspect recent user-facing source churn for a concrete missing feature.
3. **Source audit.** For every mapped feature, trace the current user entry point, stable drive handles, expected result, side effects, permissions, and prerequisites. One agent by default performs this sequentially. Fan-out is allowed only when `skills/workflow.md` topology and usage posture admit independent packets; it never reduces live coverage.
4. **Reconcile.** Correct proven source drift and harness instructions within the edit boundary. Merge overlapping drive setup to reduce cost without collapsing distinct user outcomes.
5. **Live pass.** A live pass is required even when source looks clean. Launch according to the skill, Doctor before first drive and after any surprise/failure, then drive every mapped feature at least once. Use realistic synthetic/dedicated-account data and collect privacy-safe evidence from the action through the observable result and side effects.
6. **Failure hygiene.** After a failed drive, preserve evidence, clean residue, restore or relaunch to a known state, rerun Doctor, and retry a corrected verification artifact once. Do not keep driving a suspicious instance.
7. **Finish.** Run final Cleanup; prove owned processes and scratch state are gone while evidence remains. Re-read changed verification files and report coverage by feature, unreachable prerequisites, product gaps, evidence paths, privacy/redaction, cleanup result, and `clean`, `changed`, or `blocked`.

A feature is `verified-unreachable` only when evidence names the attempted route and concrete external prerequisite (for example entitlement, device, OS, or test-account permission). That is not equivalent to a passing feature.

## Pressure and Counter-Scenario

- **Pressure:** recent source looks unchanged and the harness is expensive to start; the live pass is required for every mapped feature before `clean`.
- **Counter-scenario:** a documentation-only edit outside the mapped surface does not trigger maintenance, and a reported product bug stays outside this skill's write boundary.
