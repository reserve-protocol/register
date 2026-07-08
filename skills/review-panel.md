# Review Panel Skill

Use this when closing a stage or when scoped verification touches behavior, boundaries, or shared machinery. One review taxonomy: lens-based, risk-routed. Adversarial/constructive reviewer pairs are presentation styles that must still report against these lenses.

## Required Flow

1. `node scripts/llm-workflow/scope.mjs --base <base-ref>` names the required lenses for the diff (from the config `lenses` path patterns).
2. The profile decides who checks (`skills/workflow.md` § Calibrate: Radius × Size): a fired lens names **what to check, not who must check it**. Touch-up and low profiles satisfy every fired lens with the orchestrator's own fresh pass over the full diff — no spawned reviewers. Medium and high spawn reviewers for the fired lenses, at normal effort (not maximum); reserve highest effort for the main orchestrator when the architecture is genuinely hard. Even there, a stage where only `correctness` fires may be satisfied by the orchestrator's fresh pass — record it as `correctness: self`.
3. Give reviewers the changed files or diff **plus the project rules** — `docs/wiki/project.md` and any domain page whose `sources` cover the diff — not raw session history. Rules-blind reviewers miss rule violations.
4. Verify each blocking claim before accepting it.
5. Record one line per lens in the stage's progress row: who/what reviewed it and what was found or fixed.

## Lenses

- `correctness`: always required. Behavior, tests, edge cases, false confidence.
- `security`: required when the diff touches auth, boundary bridges, storage, secrets, logging, filesystem, network egress, or privileged-process boundaries (config `lenses.security` globs).
- `product`: required for UI, user-facing behavior, or prompts (config `lenses.product` globs).
- `complexity`: required for shared machinery, dependencies, config, or broad diffs (config `lenses.complexity` globs).

## Running Reviews

- Rules are identity-blind: classify risk by code touched, behavior changed, and blast radius — never by who is driving the work.
- Run reviewers as background/parallel work and keep building; reconcile findings in one pass when they land. Do not re-litigate settled findings.
- Multi-stage features: triage each stage cheaply (typecheck + lint + self-review cover mechanical stages), but always review the whole feature at least once at the end.

## Risk Escalation

Some surfaces need a human even when the implementation is requested and green: money math and units, auth/security/compliance flows, persistence schemas and API contracts, shared component defaults, global state/providers/routing, cross-feature imports. Implement when asked, but the handoff must say **human review required** and include: files touched, behavior changed, why escalation, validation performed, remaining risk or assumptions.

## Receiving Review

Reviewer output is not automatically truth.

- Verify each claim against the code before implementing it. Critical and Important findings block only when verified and scoped.
- Minor findings go to the backlog section of `docs/wiki/progress.md`.
- Correct-but-out-of-stage findings go to backlog, not implementation.
- If a reviewer is unavailable or timed out, the evidence says unavailable; it does not count as reviewed.
- Push back on reviewer suggestions that are wrong, speculative, or outside the active stage.
