# Overview hover header — coordinator integration

Status: integrated and verified. Human visual acceptance
and production adoption remain separate.

## Preserved contract

Keep the ticker visible beside the selected price; use the existing timestamp
readout. Withhold the unrelated headline return during inspection and restore it
unchanged on exit/blur. No hovered return calculation, fixed-width price/date
field, new space reservation, source/formatter or production-renderer change.
The existing compact responsive financial row is unchanged.

Integrated the delegated lab source/test hunks against `49f9f22ae`, preserving
the later responsive title, highlighted-card framing, and draw-settlement tests.
Did not replace whole files or import inherited documentation from the worktree.
Low, bounded integration; coordinator self-review, not another implementation.

## Delegated evidence

The isolated worker's completed receipt was inspected before integration.
Its source hash was `b2844adf5fc5fa85b6a25a590fc4948fce2d0b51e88fa0e352d29329bd61a99f`;
test hash `2907340063892363c1692eef9b0f13e6e34ff9d64a88986b792a1b9b6989ebf1`.
Both matched the submitted files. The worker reported a missing-selected-ticker
RED, 15/15 browser checks and a final 4/4 affected rerun, plus Dark/Light review
with evidence-only repairs. These are worker-reported results, not this combined
checkout's verification. Its normal app/e2e typecheck was blocked by absent
worktree dependency links; integration must close that gap here.

## Combined verification

Fresh combined browser run: **10/10**, no skips/retries/failures. Normal app and
e2e typechecks both pass, closing the worker's dependency-environment gap.
Focused typography/hygiene/chart-fixture units **9/9** and scoped lint pass.
Eight selected-state captures were inspected across both themes at 320/390,
desktop and constrained desktop: ticker retained, exact time/price, no overlap,
compact resting slot preserved, and plot position unchanged. Browser assertions
also recheck the newer title and highlighted-card framing. Evidence is in
`integrated/`; the [browser report](integrated/report.json) includes source
attachments. Replay with an isolated server (3037 used):

```sh
DESIGN_SYSTEM_BASE_URL=http://127.0.0.1:3037 CHART_HOVER_CAPTURE_DIR=docs/plans/design-system-chart-hover-header/integrated CURRENT_REBALANCE_CAPTURE_DIR=docs/plans/design-system-chart-hover-header/integrated PLAYWRIGHT_JSON_OUTPUT_NAME=docs/plans/design-system-chart-hover-header/integrated/report.json node_modules/.bin/playwright test --config=playwright.design-system.config.ts --project=design-system-review e2e/design-system/chart-review-lab-regressions.spec.ts --grep 'source inspection changes|source header stays|source Overview holds|responsive Overview page title|highlighted-card framing|source frames|source chart review preserves' --reporter=list,json
```

No dependency install/relink, commit, worktree removal or user-preview restart.
The coordinator-owned 3037 preview was stopped after verification. Wiki/diff
checks pass. Self-review confirmed only the delegated lab source/test changes
were merged; the newer title classes and draw-settlement guard remain intact.
No new interaction/analytics event: this restores identity in an existing lab
inspection mode. **Engineer review required before production adoption** remains
at the existing optional inspection seam; no new financial policy is introduced.

## Dot-spacing follow-up

User-approved local correction: the decorative separator is its own flex child,
with 8px on each side in resting and selected states. Previously the left side
used the layout gap while the right used a normal text space inside the ticker.
No fixed-width field or space reservation was added. The delegated task remained
unaddressable through task discovery, so the coordinator applied this narrow
follow-up rather than starting a duplicate task.

The added geometry assertion first failed on the absent separate dot. Final
hover/keyboard/touch checks **4/4**, e2e typecheck and scoped lint pass; resting
and selected geometry is checked at 320/390/desktop/constrained in both themes.
Light 390 and dark 320 selected captures were inspected. Evidence is under
`dot-spacing/`; its [report](dot-spacing/report.json) contains source attachments.
Replay the command above with both output paths changed to `dot-spacing` and
grep limited to `source inspection changes|source header stays|source Overview holds`.
The owned 3037 preview was stopped; production and the user's preview unchanged.
