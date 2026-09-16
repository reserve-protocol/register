# Chart feedback pass

Status: historical pre-refinement evidence within the approved-for-now frozen
chart lab baseline. Production adoption remains separate.

This is the pre-refinement receipt. The user's subsequent feedback is owned by
the [optical refinement plan](../optical-refinement/plan.md); its right-aligned
axes, quiet CSV action, readout spacing and local preview controls supersede
the corresponding candidate choices below. These results remain historical
evidence, not fresh verification of that next change.

## Review changes

- Yield export is in the header; the review canvas uses 24px top and 12px bottom
  spacing around unchanged control targets for balanced visible edges.
- Portfolio ranges are above the plot (top-right at a 640px container), with the
  category key directly below the plot. The date has an 8px gap after the total.
- Fitted, start-aligned Y labels sit close to the plots. Overview candle drawing
  padding is separately reduced only in the lab opt-in.
- Portfolio composition has one thin supplied-total contour and one selected-date
  vertical guide, not outlines or markers on every category.
- Overview, Home, Discover and Yield/Portfolio lines have static line-colored
  endpoint dots with host-matched rings. They are centered on the true endpoint
  with drawing clearance. Inspection replaces the resting dot; touch release
  retains the Overview sample rather than resetting only its marker.

These mark latest plotted values, not guaranteed live prices. The simulated
Portfolio palette and existing data/interaction boundaries remain provisional.

## Ownership and reconciliation

The [plan](plan.md) was implemented by two cold-context Sol High workers:
[Yield/Portfolio](next-families.md) and [source family](source-family.md).
Coordinator retained design decisions, integration and final verification.
[Intent](light-review.md) and [Engineering Risk](dark-review.md) cover the whole
bounded pass, not separate approvals for every file.

Confirmed/fixed: touching and lifting could leave a historical header with a
latest-point marker. The source body now resets only for mouse exit, matching
the host. Exact timestamp assertions cover finger release and a 300ms hold in
both readout modes. Coordinator also caught inconsistent marker anatomy,
gradient-coordinate sampling, a Home omitted-option launch-placement regression,
and the fact that moving a 32px export cannot shrink a footer dominated by 44px
range targets. Their scoped repairs are in the packet receipts.

Verification-only reconciliation: the old header stability test hovered at 54%
of the container and expected a different fixed date at each width. A narrower
axis gutter legitimately changed the selected sample. The final test instead
targets the known 2 Jun fixture timestamp using the mounted curve extent and
keeps exact price/date and no-layout-shift assertions. Empty-state screenshots
now include complete review canvases, rather than cropping away their padding.

## Final verification

- Coordinator [combined browser report](final-report.json): **46/46**, no skips,
  retries, flaky or unexpected results; SHA-256
  `e7d55b09abe4bffd058708d1888c2a523433ca984f8dbf06e59e4b7f1e6bc684`.
- Focused units: **23/23** across next-family axis/fixture tests, Overview
  presentation and Home presentation/motion tests. React's SVG-in-HTML test
  warnings remain non-failing; actual SVG is covered in the browser matrix.
- App and e2e TypeScript, scoped oxlint/Prettier, diff and wiki lint checks passed.
- Seven protected file hashes match their pre-pass values: the two fixture
  owners, two formatter owners, range control, production Portfolio chart and
  production candle tooltip. No financial owner was edited.
- Whole-family Intent and Engineering Risk reviews have no remaining scoped
  blocker. The touch mismatch is confirmed/fixed; missing Empty and source
  lifecycle evidence is supplied. Human optical acceptance is still separate.

The **2/2 passing** capture-only follow-up [report](final-capture-report.json) refreshes Overview
rest/inspection/restoration with its title clear of the sticky lab navigation.
Only screenshot scrolling changed after the combined run; app sources did not.
Slice reports are historical evidence, not a competing final candidate verdict.

Coordinator inspected light/dark source rest/inspection/restoration, dark
Home/Discover, mobile source/candle captures, Portfolio interior composition and
range-cutover captures, Yield insets and full Empty canvases. Key entry points:

- [Yield and Portfolio overview](evidence/next-families/metrics-portfolio-light-1400-rest.png)
- [Portfolio interior inspection](evidence/next-families/portfolio-light-1400-composition-inspection.png)
- [Overview inspection](source-family-evidence/captures/light-1400-inspection.png)
- [Overview restored, dark](source-family-evidence/captures/dark-1400-restored.png)
- [Empty phone canvases](evidence/next-families/empty-review-light-320.png)

Final browser selection uses the eight specifications in the two packet receipts,
the existing `http://127.0.0.1:3005` preview, `playwright.design-system.config.ts`,
project `design-system-review`, and this exact grep:

```text
chart-next-families|chart-yield-price-pilot|source line and Discover markers|source inspection changes only|source Overview holds|source header stays compact|mobile preview owns|touch and keyboard inspect|Home latest point|Home source opts|Home launch annotation is visible|chart review selects the real Overview candlestick|candlestick source keeps|candlesticks render in the genuine
```

`--reporter=list,json` writes `final-report.json`; `CHART_HOVER_CAPTURE_DIR` and
`CURRENT_REBALANCE_CAPTURE_DIR` point to `source-family-evidence/captures` in
this package. The next-family specs write `evidence/next-families` directly.
Source and browser-spec writers remain frozen through this combined run.

## Boundaries

No source/SDK/RPC/subgraph, financial calculation, precision, domain, fixture,
range or CSV changes. Protected-file fingerprints remain recorded in the slice
receipts. No production caller adopts the renderer props; their default behavior
is unit-pinned. [Engineer review required](../../design-system-engineering-handoff.md#chart-endpoint-and-axis-presentation-opt-ins)
before adoption, especially Recharts payload compatibility, gradient coordinates,
host ownership, resizing and file size. This presentation matrix did not itself
fix candle touch/keyboard inspection; the separately authorized September 15 G7
repair subsequently passed focused 2/2, protected 5/5, full candlestick 12/12
and integrated charts 86/86 without changing production defaults.

No full repository, production-page or deployment gate was run: this is the
bounded lab tier of the V1 cadence, not a migration/checkpoint. No commit, push,
checkpoint, preview restart, dependency installation or Claude small-component
integration. No workflow-kit changes: the existing source-freeze and mounted
geometry rules cover the friction encountered here.
