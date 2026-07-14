# Review Panel Skill

Use this when a profile requires review or a diff changes behavior, shared machinery, trust boundaries, or public contracts. Review answers two independent questions; neither can mask the other.

## Axis 1: Intent

Compare the fixed-point diff with the task contract/spec:

- missing or partial acceptance criteria;
- behavior built but not requested;
- requirements implemented with the wrong semantics;
- unresolved assumptions silently converted into code.

No spec is itself a finding for medium/high work. Recover it from the task contract, issue, plan, or explicit user instruction before review.

## Axis 2: Engineering Risk

`scope.mjs --base <fixed-point>` names applicable lenses:

- **correctness** (always): behavior, failure modes, independent test oracle, edge cases, false confidence;
- **security:** auth, trust/storage/network/filesystem boundaries, secrets, privileged operations. Never reproduce a secret value in any output — cite `path:line` and type, recommend rotation;
- **product:** user-visible behavior, interaction, copy, accessibility, realistic states;
- **complexity:** shared machinery, dependencies, configuration, abstraction and migration shape.

Also apply the project's documented rules. Tool-enforced style is not a reviewer task.

Use these smells as judgment prompts, never automatic violations: mysterious names; duplicated logic; data clumps; repeated conditionals; shotgun surgery; pass-through abstractions; speculative generality. Project rules and intentional compatibility constraints win.

## Fixed Point and Inputs

Before dispatching review:

1. Resolve the fixed point and confirm the diff is non-empty.
2. Identify the task contract/spec.
3. Select only project rules relevant to touched sources: `docs/wiki/project.md` plus covering domain pages.
4. Give the reviewer paths to the diff/plan/report when large. Never paste raw session history.

A review input is: fixed point + diff, task contract, relevant rules, and exact verification evidence. Worker summaries are claims, not truth.

## Budget

- **Touch-up/low:** orchestrator self-review covers both axes and fired lenses. No spawned reviewer.
- **Medium:** at most one concise independent review combining Intent and Engineering Risk. Correctness-only work may remain self-reviewed.
- **High:** at most two independent reports—one Intent, one Engineering Risk—run in parallel when available and authorized. Review the whole goal once at the end; slices receive focused self-review unless their risk independently demands escalation.

Do not spawn personas per lens. Do not rerun a reviewer after non-material edits. Any exception above the budget requires explicit user request and a named independent question that the existing reports cannot answer.

## Output Contract

Each report stays under 400 words and contains only:

1. verdict for its axis;
2. findings ordered Critical → Important → Minor;
3. `path:line`, violated requirement/rule, concrete evidence, and impact;
4. requirements the diff cannot prove and the exact evidence needed;
5. the strongest disconfirming evidence sought against the verdict, and what it showed.

Do not manufacture findings, harshness, or alternatives to perform independence — an evidence-supported pass is a valid review result.

Critical/Important findings block only when verified and scoped. Minor findings go to the progress backlog when worth keeping. Correct-but-out-of-scope findings are deferred, not implemented.

## Reconciliation

For every finding, record one disposition: confirmed/fixed; confirmed/deferred; rejected with evidence; or cannot verify. Reconcile once after all reports land. If a material fix changes the reviewed behavior, rerun only the affected axis.

Unavailable or timed-out review is `review-pending`, never passed. Review output with no inspected diff, no requirement/rule, or only generic advice does not count as review.

## Human Escalation

Money/units, auth/security/compliance, persistence schemas, public API contracts, shared defaults, global state/providers/routing, and cross-feature imports require explicit human review unless the project's rules narrow the list. Handoff names files, changed behavior, why judgment is required, evidence run, and remaining assumptions.
