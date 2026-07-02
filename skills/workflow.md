# Workflow Skill

Use this for staged implementation, scoped verification, debugging, and completion checks. Project-specific stack and product context live in `docs/wiki/project.md`, not here.

## Quick Fix or Stage?

Not every change is a stage. A change that is single-domain, touches no boundary or shared machinery, and needs no new decision is a **quick fix**: edit, run `node scripts/llm-workflow/scope.mjs --base HEAD~1` (or the branch base), self-review the diff, commit. No ledger row, no ingest — the ledger-drift lint is the backstop that quick fixes haven't quietly become a feature. If you are debating which one it is, it's a stage.

## Operating Loop

1. Define stage, non-goals, exit criteria, and base ref. Do not edit code until those exist; if deriving them is risky, ask the human.
2. Run `node scripts/llm-workflow/workflow-start.mjs --stage "<stage>"` for real stages. If the worktree is dirty, inspect `git status --short`; do not hide unrelated user changes.
3. Implement the smallest complete slice. Keep code domain-gated and easy to rewrite.
4. Add one runnable check for non-trivial logic.
5. Inner loop: `node scripts/llm-workflow/scope.mjs --base <base-ref>` — runs the verify commands mapped to touched files and names the required review lenses.
6. Review through the required lenses only (see `skills/review-panel.md`).
7. Reconcile verified scoped findings only.
8. Close out (below), then ingest into the wiki (see `skills/wiki.md`).

## Closeout — one tier

Every stage closes the same way. A lighter closeout is a skipped closeout.

1. **Fresh full gate** after the final edit: `node scripts/llm-workflow/scope.mjs --gate` runs the config `gate` list and prints the verifier line for the progress row. Scoped verification is an inner-loop tool; it does not replace the full gate. Green gates are not proof of correct behavior — they are the floor.
2. **Visual check for UI stages**: see `skills/ui-ux.md` § Verification — automation passing on a broken screen is a recorded failure mode.
3. **One progress row** in `docs/wiki/progress.md`: stage, status, verifier line (the exact fresh commands that ran green), one line per reviewed lens, next action.
4. **Wiki ingest**: update the domain pages whose `sources` cover the diff, decisions if any were made, and `log.md`. Then `node scripts/llm-workflow/wiki-lint.mjs` green.

## Scoped Verification (inner loop)

`scope.mjs` maps touched files to commands via the config `verify` rules (glob groups → commands, union of all matching rules). Boundary-crossing files (IPC, config, package, shared) belong in rules that expand verification wider — impact is wider than the diff.

## Laziness Ladder

Run the ladder after understanding the task and tracing the touched flow:

1. Does this need to exist?
2. Does this codebase already have the pattern?
3. Does the standard library or platform do it?
4. Does an installed dependency do it?
5. Can a tiny helper solve it?
6. Only then add a new dependency or abstraction.

Lazy is not negligent — never simplify away: input validation at trust boundaries, error handling that prevents data loss, security measures, accessibility basics, or explicitly requested behavior. Use deliberate-shortcut comments only when they name the ceiling and the upgrade trigger.

## Session Budget

- Work one stage at a time; preserve state in `docs/wiki/progress.md` before context gets large.
- Prefer one scoped review over many personas. Never run reviewer fan-out by default.
- Raw logs stay in scratch space; durable docs stay short.
- Unavailable or skipped reviewers: `skills/review-panel.md` § Receiving Review owns the rule.
- Stop expanding workflow machinery unless a gate blocks product work.

## Debugging Protocol

Reproduce, inspect the real boundary, form one hypothesis, fix root cause. Do not propose fixes before root-cause investigation. When changing behavior gated on a state variable, grep every writer of that variable before calling the change complete — fixing the obvious trigger is a trap when many code paths write the same state. After three failed attempts on the same symptom, stop and question the architecture or ask the human.

## Verification Gate

No completion claim without fresh evidence from this turn:

- The full gate ran green after the final edit.
- Every exit criterion has concrete evidence in the progress row.
- Required review lenses are recorded in the progress row.
- Known failures are named. Skipped external reviewers are named with reason.
- Scratch output is cleaned or ignored.

Hard-won specifics that stay true across projects:

- Typecheck tests too. Untyped tests silently drift from the interfaces they claim to cover; the drift surfaces as latent type errors, not test failures.
- If a check runs against build output, guard staleness (rebuild when any source is newer than each output tree, checked per tree). A stale bundle passing is worse than no check.

## Concise Output

Status in one or two sentences; one line per finding (`path:line: severity: problem. fix.`); durable summaries as decision/evidence/next action. Raw logs go to scratch files. Never compress destructive-action confirmations, security warnings, ordered command sequences, or exact code/paths/error strings.

## Red Flags

Stop before finishing on: raw payload logs, `console.log` in app code (outside the config allowlist), broad `any`, skipped tests, unbounded buffers, rendering raw model HTML, secrets in local artifacts, unverified review changes, or process work displacing product work. `scope.mjs` scans for the mechanical ones; the rest are on you.
