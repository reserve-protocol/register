# Engineering Risk — Dark

Verdict: no remaining scoped engineering blocker identified after repair. This reviews only feedback-pass ownership against `49f9f22ae`, treating inherited dirty work as input—not production adoption or human visual acceptance.

## Findings

- **Important, confirmed/fixed:** `src/views/index-dtf/overview/components/charts/price-chart-body.tsx:211` previously reset the marker on every pointer leave while the replay retained touch-selected historical text, violating synchronized inspection. The inspected repair limits pointer-leave reset to mouse input and removes redundant Recharts mouse-leave reset. `e2e/design-system/chart-review-lab-regressions.spec.ts:898` now pins the marker to the selected timestamp immediately after finger release and after 300ms, in header and existing-tooltip modes; the archived Overview run passes. No additional scoped finding.

## Evidence and limits

Fresh independent focused verification passed **23/23 tests across five files**; `git diff --check` passed. The four protected fixture/formatter/range fingerprints match the receipt. Inspected source keeps supplied totals/domains, direct Recharts axes, opt-in renderer behavior, unchanged omitted gradient/active-dot defaults, and lab-only adoption. Portfolio contour/guide/marker coordinate oracles and Portfolio/Home captures were inspected. The final Home memo repair includes opt-in presence in the geometry dependency list.

Inspected coordinator `final-report.json`: **46/46 passing, zero skipped/flaky/unexpected**, SHA-256 `e7d55b09abe4bffd058708d1888c2a523433ca984f8dbf06e59e4b7f1e6bc684`. This supersedes slice reports and their earlier hash discrepancy. Real-renderer assertions cover marker centers, gradient/launch alignment, readout modes, repaired touch release, mobile clearance and complete Empty canvases. The corrected desktop hover oracle targets a fixture timestamp through mounted curve geometry while retaining exact price/date/layout assertions.

Unavailable proof at the time of this review: universal product hosts, arbitrary dynamic opt-in/data changes, candle touch/keyboard repair, and human optical acceptance. The separately authorized September 15 G7 repair subsequently supplied lab keyboard/stable-touch evidence; universal hosts, human acceptance and production adoption remain outside this review. Optional production renderer seams retain **Engineer review required**.

Strongest disconfirming checks: inspected installed Recharts defaults and touch dispatch, actual SVG/path assertions rather than selection attributes alone, and protected-file fingerprints. Defaults and next-family evidence held; touch dispatch exposed the now-repaired mismatch rather than a financial-data problem.
