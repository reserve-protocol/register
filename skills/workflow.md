# Workflow Skill

Use this for staged implementation, scoped verification, debugging, and completion checks. Project-specific stack and product context live in `docs/wiki/project.md`, not here.

## Calibrate: Radius × Size

The expensive parts of the workflow — spawned reviewers, the closeout gate, visual evidence, wiki ingest, plans — are earned, not paid on every diff. Running the full loop on a copy change is waste, and waste teaches agents to route around gates. Two independent questions, answered before editing:

1. **Blast radius — how far can this break?** Isolated (one surface, nothing imports it) → domain (one feature folder) → shared (shared machinery, trust/process boundaries, money math, engineer-review surfaces). Radius buys **checks and review**: which gate runs, who reviews, how much visual evidence.
2. **Work size — how much work is it?** One edit → one coherent slice → a multi-phase plan. Size buys **ceremony**: whether the work gets a ledger row, a stage, or a plan of stages.

The axes are independent: a one-line fix in shared machinery is small work with a wide radius — heavy review, light ceremony. A four-phase feature inside one domain is the reverse. Collapsing them into one ladder over-processes small risky fixes and under-reviews big "simple" ones.

The profiles:

- **Touch-up** — trivial and isolated: copy/strings, docs, comments, styling values on one surface, data-only config; no control flow changed. Ship with: scoped verify green + self-review of the diff. Glance at the surface only if the change can clip, wrap, or overflow. Nothing else.
- **Low** — small and contained: a button, an isolated component or hook, a visual change, a small fix inside one domain. Ship with: scoped verify green + self-review through each lens scope named + eyeball the changed surface if rendered output changed. No spawned reviewers, no ledger row, no ingest.
- **Medium** — wide radius, modest size: the bugfix in shared machinery, the change on a money or engineer-review surface, the small diff many features sit on. One stage: spawned reviewers for the fired lenses, full gate (or gate-equivalent final scoped run), full visual evidence if UI behavior changed, one progress row, ingest only the pages the diff made stale. No plan, no phases.
- **High** — big work: a multi-phase plan, a feature crossing domains or packages, anything needing new decisions along the way. Plan first, split into stages, run each stage at its own radius, review the whole feature once at the end, full closeout with ingest.

`scope.mjs` prints the mechanical signals for both axes (risk lenses → radius, file count → size) plus a profile hint; you make the semantic call. The signals also work mid-flight: a "low" task whose diff starts firing radius signals gets re-tiered up, not argued down. When debating two profiles, take the heavier one — an under-reviewed wide-radius diff is the expensive mistake; an over-ceremonied small one is only slow.

Two guardrails on the semantic call:

- **Downgrades are explicit.** Shipping below medium while `scope.mjs` prints a radius signal (e.g. a copy-only change inside shared machinery) requires one stated line: the signal and why it doesn't apply. State it in the turn's summary and the commit message. A silent downgrade is how medium gets misfiled as low.
- **Iterate boundaries from misfires, not theory.** Profile definitions change only when a real misfire is recorded in `log.md` — process work must not displace product work. The ledger-drift lint is the backstop that lower profiles haven't quietly become a feature.

## Operating Loop (medium and high)

1. Define stage, non-goals, exit criteria, and base ref. Do not edit code until those exist; if deriving them is risky, ask the human.
2. Run `node scripts/llm-workflow/workflow-start.mjs --stage "<stage>"` for real stages. If the worktree is dirty, inspect `git status --short`; do not hide unrelated user changes.
3. Implement the smallest complete slice. Keep code domain-gated and easy to rewrite.
4. Add one runnable check for non-trivial logic.
5. Inner loop: `node scripts/llm-workflow/scope.mjs --base <base-ref>` — runs the verify commands mapped to touched files and names the required review lenses.
6. Review through the required lenses only (see `skills/review-panel.md`).
7. Reconcile verified scoped findings only.
8. Close out (below), then ingest into the wiki (see `skills/wiki.md`).

## Stage Closeout

Every stage (medium and high work) closes the same way. A lighter closeout is a skipped closeout — if a stage seems to deserve less, it was a lower profile: re-tier it, don't shave the closeout.

1. **Fresh full gate** after the final edit: `node scripts/llm-workflow/scope.mjs --gate` runs the config `gate` list and prints the verifier line for the progress row. Exception: if the final inner-loop `scope.mjs` run (after the last edit) printed `gate-equivalent: yes`, that run already is the fresh gate — don't pay for it twice. Green gates are not proof of correct behavior — they are the floor.
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

- The profile's closing checks ran green after the final edit: full gate (or a gate-equivalent scoped run) for medium and high, scoped verify for touch-ups and low.
- Medium and high only: every exit criterion has concrete evidence in the progress row; required review lenses are recorded there.
- Known failures are named. Skipped external reviewers are named with reason.
- Scratch output is cleaned or ignored.

Hard-won specifics that stay true across projects:

- Typecheck tests too. Untyped tests silently drift from the interfaces they claim to cover; the drift surfaces as latent type errors, not test failures.
- If a check runs against build output, guard staleness (rebuild when any source is newer than each output tree, checked per tree). A stale bundle passing is worse than no check.

## Concise Output

Status in one or two sentences; one line per finding (`path:line: severity: problem. fix.`); durable summaries as decision/evidence/next action. Raw logs go to scratch files. Never compress destructive-action confirmations, security warnings, ordered command sequences, or exact code/paths/error strings.

## Red Flags

Stop before finishing on: raw payload logs, `console.log` in app code (outside the config allowlist), broad `any`, skipped tests, unbounded buffers, rendering raw model HTML, secrets in local artifacts, unverified review changes, or process work displacing product work. `scope.mjs` scans for the mechanical ones; the rest are on you.
