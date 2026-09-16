# Small-component overnight handoff

## Goal and authority

Prepare strong, source-grounded first drafts for Toast and Progress, plus a
Slider need assessment and a draft only if existing consumers justify it.
This is a prepared handoff: execution begins when the user sends the assignment
to Claude. Human visual acceptance and production adoption remain separate.
The chart workstream owns all charts and the main review surface concurrently.

## Starting state and isolation

Starting HEAD at preparation: `49f9f22ae94d579b4c530de845e8637d299a9c7d`.
The original checkout is dirty and includes relevant newer design-system work;
HEAD alone is not a complete baseline. Read this handoff and repository routing
from the original checkout before creating an isolated working copy. Record the
actual starting HEAD and a manifest/hashes of copied, relevant uncommitted
source/docs/tests so the coordinator can distinguish inherited input from your
delta. Preserve current accepted component/foundation implementations. Do not
copy secrets, personal data, dependencies, generated results or unrelated files.
If necessary baseline files cannot be established, report that blocker rather
than replacing current designs with the older committed version.

Use a separate worktree and isolated preview; check port 3044 is free, otherwise
choose another free port and report it. Never stop/restart ports 3005, 3041,
3042 or 3043, alter the user's browser tabs or edit the original checkout.
No commits, pushes, dependency changes or production migration are authorized.

## Read and preserve

Follow `CLAUDE.md`, the design-system router, active V1 plan and common lab guide.
Read the Toast and Progress entries in
`src/views/internal/design-system/component-catalog-support.ts`, Slider in
`component-catalog-primary.ts`, and follow their relevant accepted foundation,
component and decision links. Inspect actual consumers before choosing states
or policies. Use accepted Inline message, Spinner, controls, typography, motion
and floating-surface contracts where applicable. Existing app visuals are job
and behavior evidence, not permission to retain legacy styling.

Render only the candidate and necessary controls, with clearly separate lab
context. A plain review surface is allowed; no invented product page, decorative
hero, beige nesting or arbitrary card treatment. Own every inset once. Build one
ordinary state and one meaningful constrained/long-content state, visually
correct them, then expand the state sheet. A list of token imports is not a
visual-quality proof.

## Work order

1. Toast: classify representative existing notifications into transient results
   versus information that must remain in context. Keep the compact, readable
   result/action/dismissal hierarchy. Retain installed behavior primitives.
   Show real-supported success, failure and action cases; check long copy,
   stacking, keyboard dismissal/focus and announcement behavior. Distinguish
   retained timing from proposed duration/pause/stacking policy. Do not silently
   auto-dismiss consequential errors or invent transaction completion truth.
2. Progress: inspect the actual shared Progress consumers. Draft determinate
   progress with truthful supplied values, accessible label/value semantics,
   useful zero/partial/complete states, and interruption only if justified by
   a consumer. Indeterminate activity is not a fabricated percentage; retain
   the Spinner boundary. Do not redesign steppers, deploy flows or transactions.
3. Slider: inspect all three recorded consumers. Decide whether they require a
   distinct reusable control or are better served by an existing numeric field.
   Build only evidenced variants. Preserve each consumer's bounds, steps,
   precision and meaning; demonstrate keyboard/disabled/value-label behavior.
   Do not invent a range slider or change financial input constraints to fill
   an inventory slot. A justified deferral is a successful outcome.

Finish and verify Toast and Progress before optional Slider implementation.
New policies and unresolved design choices remain labeled proposals, not
accepted baselines. Do not use your own unreviewed component proposals as
authority for further speculative work.

## Ownership

Keep candidate implementations and the standalone preview under the new
`src/views/internal/design-system/small-components-overnight/` directory.
Keep focused tests under a task-named file/directory in the established test
location. Return evidence, integration instructions and the report under
`docs/plans/design-system-small-components-overnight/`.

Do not edit chart sources, accepted shared components/defaults/tokens,
production consumers, the main lab router, catalog, Current Review or shared
wiki ledgers. Document proposed reusable destinations and required wiring for
the coordinator instead. Do not modify this coordinator-owned handoff. Reuse
installed libraries and existing verification configuration; report a tooling
blocker rather than changing shared build/configuration to bypass isolation.

## Acceptance evidence and return

Inspect normal-sized light/dark desktop and 320/390px renders, long text,
relevant keyboard/touch interactions and reduced-motion behavior. Verify at the
real component seam, not a mocked replacement. Include focused tests, applicable
type/lint checks, replay commands and screenshots linked to exact source
fingerprints. Reserve time for visual repairs, not just first implementation.

Return a concise `report.md`: baseline identity, changed/new files only,
standalone preview entry/port, completed candidates, retained/proposed policy,
verification results and skipped checks, genuine remaining human choices, and
integration instructions. Keep inherited dirty files out of the candidate delta.
Document sensitive findings separately with explicit "no implementation";
do not fix data, financial, wallet or transaction behavior. Clean your own
temporary artifacts and stale claims without touching other workers' material.

The coordinator inspects and integrates the result. A worker's pass count is
evidence of those checks only, not human approval or production readiness.
