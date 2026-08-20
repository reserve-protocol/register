# Stage Skill

Use this for **medium and high** work — the staged loop from contract to closeout. Touch-up and low tasks skip it: they scoped-verify, self-review through the fired lenses, and finish (see `skills/workflow.md` § Calibrate). `skills/workflow.md` is already loaded; this file owns the stage mechanics it points to.

## Medium Task Contract

Before medium edits, pin:

- fixed point (commit/ref);
- current and desired behavior;
- non-goals;
- acceptance evidence: commands, behavior, visual state, or artifact that proves each criterion;
- highest stable test seam for changed behavior;
- unresolved decisions or assumptions.

Keep it compact in the active progress note. Ask the human only when an unresolved choice materially changes behavior, architecture, risk, or scope. Routine implementation details are the agent's responsibility. High work uses `skills/planning.md` for the contract instead.

## Operating Loop (Medium and High)

1. Pin the medium contract, or follow `skills/planning.md` for high.
2. Run `node scripts/llm-workflow/workflow-start.mjs --stage "<name>"` for medium. High adds `--contract <plan>`. `--allow-dirty` is only for inspected in-progress/adoption input.
3. Implement the smallest unblocked slice.
4. For changed behavior, use `skills/testing.md`.
5. Run `node scripts/llm-workflow/scope.mjs --base <fixed-point>`; fix mapped failures and inspect red flags.
6. Follow the ordered Stage Closeout below; it owns review, reconciliation, and ingest.

## Stage Closeout

1. Fresh full gate with `scope.mjs --gate`, unless the final post-edit scoped run printed `gate-equivalent: yes`.
2. Changed user surface: use its project-local verification skill when mapped; otherwise inspect the real surface with realistic data, default plus one edge state, and every crossed breakpoint. Do not label static checks as live proof.
3. For an intended medium/high promotion, deploy, or publish, bind a draft release receipt (`skills/release-evidence.md`) to the candidate snapshot before review.
4. Review through Intent and Engineering Risk at the allowed budget, resolving the receipt's pointers and stale claims when present.
5. After material fixes, rerun affected evidence, refresh the receipt to the new snapshot, and re-review only the affected axis before approval or release.
6. Update the progress row with exact verifier evidence, review disposition, state, and next action.
7. Ingest only stale wiki pages; run wiki-lint.
8. Docs housekeeping: if the stage created or invalidated documentation (plans, ledgers, wiki claims, area guides, coverage maps), delete/merge the superseded content and update the stale claims now — cleanup is part of the stage, never a follow-up the human has to request.

Valid states:

- `active` — implementation in progress;
- `implementation-verified` — automated/behavior evidence green, review incomplete;
- `review-pending` — required independent review unavailable;
- `human-review-required` — named risk needs human judgment;
- `done` — acceptance evidence, required review, closeout, and documentation are complete.

Unavailable review never becomes `done`. Human-review-required work may be handed off but must keep that label.
