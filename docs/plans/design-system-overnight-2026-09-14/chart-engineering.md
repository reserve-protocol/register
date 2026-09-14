# Chart preparation — engineering questions, not changes

September 14. Companion to the [visual brief](charts.md) and the
[central handoff register](../design-system-v1.md#deferred-engineering-review-register).
**No data/SDK/financial code changed.** The later
[source-faithful lab reset](../design-system-charts-source-reset.md) adds one
optional display-only callback to the existing Overview renderer. It forwards the
selected Tooltip payload to a caller-owned header and enables keyboard inspection
only when provided. Existing production callers omit it and retain their tooltip.
No engineering recommendation below is implemented. All items
below are investigation dispositions or separately gated future integration needs.

## Evidence and authority

Input: `design-system-chart-readiness-audit/` in the detached
`register-claude-charts-audit-289b2af86` worktree, checkpoint
`289b2af86e8245ced89d9058a09182799c65f825`. Its real-data captures are dated
September 13; other views use offline or explicitly synthetic overlays. Its
report, source map and scenarios are evidence, not a new product contract.
Fresh inspection found no tracked changes from that checkpoint in the chart,
Overview/Factsheet, Home, Portfolio or legacy-yield source areas examined.
This does not claim independent replay of all historical measurements.

The design-system owner may define how explicit supplied data/states look.
Product/data owners must decide whether values ought to match, which timestamps
and units define them, and what completeness/freshness information is available.
Read `docs/wiki/sdk.md` before any separately authorized Index adapter work.

| Item / owner                                                                      | Observed versus unresolved                                                                                                                                                                                                                                                                                                  | Change made / required verification before a future change                                                                                                                                                                    |
| --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Headline/series basis — Overview, Home/Discover, Factsheet (audit F-01/F-02/F-09) | Source-confirmed: Overview `PercentageChange` uses first and penultimate displayed points; display series may be bucketed; Factsheet uses its own calculations; Discover accepts a server percentage. The audit's numeric comparisons are historical observations, not proof all figures have the same intended definition. | None. Owners must compare exact period boundaries, timestamps, valuation basis, live/served points and bucket treatment with representative real payloads. Document intended differences before choosing any normalization.   |
| Sparse/stale history — SDK/Overview (F-03/F-04)                                   | Audit shows an old fixture connected to a now-point and an empty-history presentation. Fresh inspection confirms Overview consumes SDK history and formats a display series; no new freshness threshold was established. A visually flat/long segment alone does not diagnose a broken feed.                                | None. Verify SDK/live-point intent, session clock, missing-period policy and whether a reliable freshness/completeness signal exists. Visual lab can accept explicit supplied states; it must not invent one from timestamps. |
| Dense card history — API/SDK (F-15/F-17)                                          | Audit measured basket-heavy historical payloads and compared coarse/dense renders. Those are dated, endpoint-specific measurements and visual trials, not production budgets or permission to substitute OHLC close data.                                                                                                   | None. Any future transport/sampling change needs owners to verify payload coverage, units, cache keys, cost and value preservation. Current visual preparation requires no new endpoint.                                      |
| Discover cache key without chainId (part of F-17)                                 | Not established as a defect. Fresh inspection of `useIndexDTFList.ts` shows one all-chain endpoint, with `exposure` in both query shape and key; no chain-dependent request parameter is omitted by that code.                                                                                                              | None. Reject an automatic key change based only on absence of chainId. Reopen only with evidence of a chain-dependent response/input or cache collision.                                                                      |
| Factsheet range coupling (F-09/F-18)                                              | Source-confirmed: Monthly P&L selection writes the shared range atom to `all`; other range/availability differences are in the audit. The desired product behavior and full cross-route impact are not settled here.                                                                                                        | None. Governance of range state, direct entry, route switching and existing period calculations belong to a separate product integration decision, not a chart-style cleanup.                                                 |
| Missing/zero price filtering                                                      | Audit source map says `price <= 0` is dropped; current code uses `Boolean(price)`, which is not that predicate for negative inputs. Do not carry the audit's wording into a new data contract.                                                                                                                              | None. Any input validation or zero-price policy change needs the data owner and realistic boundary tests. Preserve current behavior during visual work.                                                                       |
| OHLC default and meaning (F-06)                                                   | Source and audit identify candles as the current default, with separate bucket/axis behavior. A preferred line-chart style is not evidence candles are unnecessary.                                                                                                                                                         | None. Retention/default is a product decision. Preserve OHLC information, bucket extents, fallback and current formatting until separately reviewed.                                                                          |
| Palette / shared helpers (F-12)                                                   | Existing financial palette is a shared TS utility; `PerformanceValue` consumes it. It is not equivalent to success/error status. The audit proposes new semantic tokens and deleting wrapper machinery.                                                                                                                     | None. Route canonical aliases/palette and shared API changes through a separate foundation scope; verify existing consumers rather than changing them as a side effect of a new specimen.                                     |
| Auction curve, yield-index/third-party feeds, portfolio composition               | Audit has synthetic/blocked limits: auction bids overlay, portfolio synthetic holdings, unrendered BTC+ modes, empty yield APY and no live 5xx capture.                                                                                                                                                                     | None. Keep existing auction audit and product-owner gates. Do not fix numerical semantics or certify coverage from these captures. These are not prerequisites for the first time-series visual.                              |

## Handoff checklist for any later sensitive implementation

Name exact files/owners, old behavior and intended new behavior; list actual
changes separately from suggestions; bind evidence to source/data snapshots;
record unresolved assumptions and user impact; define required real integration,
unit/edge and route-continuity checks. Obtain separate authorization and engineer
review for the affected boundary. Visual approval cannot clear these questions.

**Engineer review required before adoption of the lab chart:** the current
`charts/fixtures.ts` supplies USD labels, UTC dates, domains, range availability,
direction and estimate/gap flags. These are demonstration inputs, not a reusable
financial adapter. An integration owner must supply equivalent verified facts
from the real feature without copying these fixture policies. The local plot
preserves every supplied timestamp/value and the existing monotone visual;
it does not validate whether a source or domain is financially appropriate.

The source-based primary examples now reuse `PriceChartBody` and `PerformanceChart`.
`PriceChartBody.onInspect` and the finite-payload helper `chart-inspection.ts` form an opt-in presentation
seam, not a financial adapter. Only the isolated lab caller adopts it; it owns
visible focus, the accessible readout, restoration and estimated-price caption.
Before another caller adopts it, verify all selected modes/units, payload lifecycle,
touch and keyboard, header/series meaning, reduced motion and cross-feature import
ownership. The retained Overview animation has not been hardened by the generic
pressure fixture's reduced-motion proof. Production integration is not approved.

Useful source anchors:
[Overview headline](../../../src/views/index-dtf/overview/components/charts/percentage-change.tsx),
[display series](../../../src/views/index-dtf/overview/components/charts/use-price-chart-data.ts),
[Discover query](../../../src/hooks/useIndexDTFList.ts),
[Factsheet](../../../src/views/index-dtf/factsheet/components/factsheet-chart.tsx),
[monthly calculation](../../../src/views/index-dtf/factsheet/utils/calculations.ts),
[palette](../../../src/utils/chart-performance-colors.ts).
