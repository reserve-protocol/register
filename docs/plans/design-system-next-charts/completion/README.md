# Chart completion execution

Status: historical pre-feedback verification receipt within the approved-for-now
frozen chart lab baseline. The later
[chart feedback pass](../feedback-pass/plan.md) and optical refinement supersede
its presentation status; results below still apply to the preceding candidate.

User authorized Priority execution after switching away from
the overnight Standard-mode constraint. Sol High implementation is approved.
Base: `49f9f22ae94d579b4c530de845e8637d299a9c7d`, with inspected existing dirty
chart work retained as input. No commits, production adoption or financial
changes. Continue the existing Chart candlestick lab review stage, not a new
checkpoint. Contract: [revision plan](../revision-plan.md).

## Ownership and topology

Two independent implementation packets have stable, disjoint edit boundaries.
Fresh Sol High workers own implementation; coordinator owns brief, source review,
integration, shared documentation/catalog and final visual verification. Recent
Yield pilot evidence establishes a useful bounded seam, not general model
capability. Preserve final combined verification and one repair pass before any
optional expansion. Unexpected overlap stops parallel editing.

- `metric_portfolio_finish`: only `charts/next-families/` source, its existing
  next-family/pilot specs, and `completion/metrics-portfolio.md` evidence. Preserve
  fixture data, financial formatters/ranges/CSV contents. No global type/color
  tokens. Own Yield rollout and Portfolio candidate.
- `chart_refinements_finish`: only `charts/source-overview.tsx`,
  `charts/source-small.tsx`, new local tooltip/presentation files under charts,
  optional additive title recipe/test in V1 typography, and a narrowly necessary
  opt-in tooltip prop on the candle renderer (existing production default must
  remain unchanged). Own candle/refinement specs and
  `completion/refinements.md`. Do not edit next-families, catalog or shared docs.
- Coordinator: integration wiring outside those boundaries, documentation,
  acceptance checks. Claude's small-component work is isolated and untouched.

One browser suite at a time. Workers return code ready for review before browser
captures; coordinator assigns the browser verification slot. Existing preview
3005 remains running; 3043 may be used if its identity is confirmed. No new
dependencies, server termination, screenshot-baseline rewrites or secret reads.
No full-file history fork: workers read the current brief and owners directly.
Every source/test writer freezes during final browser runs: serial browser use
alone does not prevent source-watcher invalidation from concurrent UI edits.

## Required outcome

Yield Price/APY/Supply/RSR staked share deliberate 14px descriptors, 16px ordinary
financial rows, persistent units and supporting inspection dates. Portfolio uses
a dominant page-level total, quieter descriptor, bottom period controls, one
dated total, a compact 14px category key, source-grounded ordering and explicitly
provisional category colors. Strong Overview/Home qualities remain intact.
Candle tooltip keeps its small paired OHLC layout but uses the V1 floating
surface. Home name is lighter at the same size. Overview second separator
appears only when ticker and change share a line.

Compare desktop, constrained and mobile in both themes, default/inspection/empty
and long-value pressure. Check visible axis/footer bounds, header/footer insets,
exact point/date and marker agreement, keyboard recovery, native touch scrolling,
range/reset/CSV behavior and unchanged source/financial contracts. This is lab
readiness, never human acceptance. Worker reports require coordinator inspection.

## Results

Implementation and bounded verification are complete. Human visual acceptance
and production adoption remain separate. Independent review repairs are included,
not deferred to the user.

- Coordinator: 55/55 focused unit/catalog checks and app/e2e TypeScript pass.
  The stale catalog expectation that Chart was not started is corrected; the
  review remains exploratory and unadopted.
- [Refinement packet](refinements.md): 6/6 frozen browser checks on existing
  preview 3005; [machine-readable report](refinements-browser-report.json).
- [Yield/Portfolio packet](metrics-portfolio.md): current source, category
  rationale and detailed verification. Coordinator final combined browser run:
  **23/23 passed**, no skips/flakes, against existing preview 3005; see
  [report](coordinator-browser-report.json). The preceding expanded family run
  passed 8/8; see [worker report](metrics-portfolio-browser-report.json).
- [Intent review](dark-review.md) and [engineering review](light-review.md)
  inspect the whole bounded completion. Their original findings are retained;
  reconciliation below owns final disposition.
- Final scoped lint, formatting, diff and wiki checks passed. Coordinator
  inspected current light/dark OHLC, Home phone/desktop, full Yield family,
  Yield inspection, Portfolio total/inspection/composition and 320/390 phone
  captures. The combined suite proves actual axis bounds, selected marker X,
  readout/key dates, range/CSV/empty reset and native swipe safety.

## Review reconciliation

| Finding                                         | Disposition                           | Proof                                                                                                                                           |
| ----------------------------------------------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Persistent Yield identity and Empty Supply unit | Confirmed/fixed                       | APY/Staked retain inline hyUSD context; Supply Empty retains its unit. Header readouts remain three compact lines.                              |
| Portfolio interior date anchoring               | Confirmed/fixed                       | First/start, interior/middle, last/end; repeated timestamps deduplicated.                                                                       |
| Custom XAxis wrapper ignored by Recharts        | Confirmed/fixed                       | Real XAxis is a direct ComposedChart child. Light review's installed-renderer recheck and final mounted marker-coordinate/axis assertions pass. |
| Staked descriptor copy change                   | Confirmed/fixed after reconsideration | Restored planned `RSR staked`; visible dollars and persistent unit context retain meaning without changing source wording.                      |

This packet originally deferred the unrelated candle keyboard/nonfirst-touch
limitation. The separately authorized September 15 G7 repair now passes the
unchanged active assertions: focused keyboard/touch 2/2, protected
geometry/hover 5/5, full candlestick 12/12 and integrated charts 86/86. No
acceptance test was deleted, weakened or marked skipped; production adoption
remains separate.

## Protected source identity

Coordinator rechecked SHA-256 against the inspected pre-work snapshot:

```text
42a6e629c57c59406f2f5df2078dc1cc23ab51de1bdfc9b81a4f0181a202c89e fixture-data.ts
db63c96a812231de904ecacc4cdbb4823800044d31d8c673d5e6d1617fcae3f2 metric-formatters.ts
1fe429ca2a00f80bb4c68c7fea9e1a9b76a90eac5d1d6dd40ebe8e73eb9dc8b5 portfolio-formatters.ts
447a0dabf8dc98398d49947c306609a3523cbe19c873755c1f1ba442530441b2 range-control.tsx
343973922aab55859edd6518dc163d56cb5fc09f7ef50613d3cb458290478d6c fixtures/portfolio-pressure.ts
885a152a0a6160616757b3ad09b568f5e98ca447eb6639a846994411563f5284 production candlestick-tooltip.tsx
ea984c1f4cecfe54b3711d859d9d717ea263e74abf23fdd5474fdca4e8724402 production portfolio-chart.tsx
```

Unqualified files above belong to `charts/next-families/`. Production tooltip
and Portfolio owners are unchanged. The new optional tooltip-content prop and
light title recipe are recorded in the
[engineer handoff](../../design-system-engineering-handoff.md); engineer review
is required before adoption. No production interactions or analytics changed;
lab-only inspection controls do not introduce production tracking.

## Scope and remaining decisions

This is the V1 plan's bounded/coherent lab cadence, not a production integration
gate. The accumulated diff includes earlier work outside this completion; no
full-repository/release claim is made. Human review still owns the revised
presentation, provisional Portfolio category colors and whether resting key
amounts earn their space. APY/Portfolio simulation, independently timed RSR/USD,
return semantics and production touch/data integration remain engineer-owned.
Factsheet bars, Yield allocation/pie work and Claude's separate small-component
package are not completed or approved by this packet.

## Human review entry

Open `/internal/design-system/components/chart#chart-next-families-review`.
Review Yield first, then Portfolio's hierarchy and compact key; use the external
Total area / Composition controls to compare source states. Those controls are
lab context, not a proposed production toggle. On 320px the existing range
control scrolls horizontally to its final option; period semantics are retained.
Then return to `#chart-first-review` for Candles and the lighter Home name.
The responsive-preview links provide genuine phone frames rather than merely
narrowing a desktop container. External remote-logo loading was not certified
by Home screenshots; retained fallback/loading behavior was not changed.
