# Workflow Skill

Use this for implementation, debugging, scoped verification, and completion. Project facts live in `docs/wiki/`; review mechanics live in `skills/review-panel.md`.

## Trust Target

Optimize for evidence a non-engineer can inspect, not a promise of one-shot correctness. No workflow eliminates model mistakes. This one makes intent explicit, forces the shortest useful feedback loop, bounds review cost, and labels uncertainty instead of laundering it into “done.”

## Calibrate: Radius × Size

Answer before editing:

1. **Blast radius:** isolated → domain → shared/trust/money/public contract. Radius buys verification and review.
2. **Work size:** one edit → coherent slice → multi-slice goal. Size buys planning and durable state.

Profiles:

- **Touch-up:** trivial, isolated, no control-flow change. Scoped verify + diff self-review. Inspect rendered output only when clipping/wrapping can change.
- **Low:** contained behavior or UI change in one domain. Scoped verify + self-review through fired lenses; inspect the changed surface when output changed.
- **Medium:** modest work with wide radius. One stage, one independent review at most, full gate (or gate-equivalent final scoped run), visual evidence when applicable, one ledger row, targeted wiki ingest.
- **High:** multi-slice, cross-domain/package, or contract-shaping work. Load `skills/planning.md`; final whole-goal review and full closeout.

`scope.mjs` prints mechanical signals; semantics decide. A low/touch-up downgrade despite a radius signal must name the signal and why it does not apply. Change profile boundaries only after a recorded real misfire.

The **fixed point** is the single commit/ref the whole task diffs against — every scoped run, review, and completion claim compares to it. `workflow-start` prints it as the base ref.

**Medium and high work loads `skills/stage.md`** — the staged loop it owns (task contract, operating loop, ordered stage closeout, valid states). Touch-up and low tasks skip it: scoped verify, self-review through the fired lenses, done.

## Topology Gate

**One implementation agent is the default.** Load `skills/topology.md` only for parallel-looking work, competing candidates, or a requested agent count — it owns the fan-out admission criteria (substantive independent packets, low overlap, stable cut edges, enough work, real speedup, permitted posture, cheap convergence). If one answer is unclear, stay single-agent. A requested count authorizes Burst spend, not skipped proof or trust gates.

## Feedback Branches

- Bug, failure, flake, or regression: read `skills/debugging.md` before proposing a fix.
- New or changed non-trivial behavior: read `skills/testing.md` before implementation.
- Consequential experience, agent-interaction, public-seam, ownership, or persistent-shape choice: use `skills/experience-design.md` before planning or implementation.
- Assigning a workflow role or widening agent authority: use `skills/model-capabilities.md`; capability evidence never replaces human approval.
- Missing repeatable real-surface proof: use `skills/create-verification.md`. If an existing verification package may have drifted, use `skills/maintain-verification.md`.
- Evaluate a workflow/skill change with `skills/evaluate-workflow.md` only when its behavior is uncertain or has misfired; ordinary work never pays this tax.
- Explicit pause, unavoidable context boundary, or multi-session resume: use `skills/resume-work.md`; ordinary same-session next steps do not create checkpoints.
- Copy, docs, data-only config, generated code, and trivial wiring use mapped checks; do not manufacture low-value tests.

## Scoped Verification

`scope.mjs` unions commands mapped to touched files and prints `verify-gap` for unmapped files. Run focused tests during iteration, scoped verification after a coherent edit, and the full gate once after the final edit. Boundary-crossing files must map to wider commands. A code/config gap requires a mapping or an explicit appropriate check; docs/scratch may close with stated self-review.

## Shared-Tree Safety

Before reverting, restoring, or reconciling a shared-tree file, inspect its live diff and latest handoff. Unexpected changes belong to the user or another worker until proven otherwise; report them, never discard them from a stale instruction.

## Laziness Ladder

Need → existing pattern → platform/stdlib → installed dependency → tiny helper → only then a new abstraction/dependency. Never simplify away trust-boundary validation, data-loss prevention, security, accessibility, or requested behavior.

## Completion Gate

No completion claim without fresh evidence from this turn:

- each acceptance criterion maps to inspected evidence;
- final profile checks ran after the final edit;
- applicable debugging/testing evidence from their owning skills is present;
- required review is complete, or state says pending/human-required;
- known failures, skipped live checks, assumptions, unknowns, and unavailable tools are named — "I don't know" beats manufactured confidence;
- scratch/debug output is removed or ignored.

Green commands prove only what they cover. Confidence is not evidence; worker/reviewer reports are claims until checked.
