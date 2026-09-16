# Light review — Engineering Risk

Initial verdict: blocked by one confirmed Portfolio rendering defect. This bounded
review covers the completion delta against `49f9f22ae94d579b4c530de845e8637d299a9c7d`,
not the inherited dirty tree. Human acceptance and production adoption remain separate.

## Important

- `src/views/internal/design-system/charts/next-families/portfolio-history.tsx:159`:
  `<PortfolioXAxis>` is a custom child of `ComposedChart`. Installed Recharts
  2.15.4 discovers axes and renders children by component name; it does not
  execute this wrapper. Its timestamp axis is therefore omitted and the chart
  falls back to an inferred categorical axis. A timestamp-based `ReferenceDot`
  then disappears, violating the required visible dates, accurate positioning
  and selected-point/header agreement. A read-only reproduction with the
  installed React/Recharts returned zero discovered/rendered X axes and zero
  marker circles for the wrapper; the otherwise-identical direct `<XAxis>`
  returned one of each. Repair is pending with the owner. Use a direct axis
  child and prove the actual mounted result before calling this ready.

## Evidence and remaining proof

The APY/Staked hyUSD context, Supply Empty unit and interior-tick anchor fixes
are present. Timestamp lookup, range-reset handlers and CSV filtering retain
their supplied-data meaning. The legacy `candlestick-tooltip.tsx` is byte-identical
to the fixed point; `tooltipContent ?? <CandlestickTooltip />` preserves omission
behavior. `lightPanelTitle` is additive and leaves `panelTitle` unchanged.

Inspected the recorded 6/6 refinement browser result and four screenshots:
light/dark candle tooltips, dark 320px Home, light 1400px Home. They support the
compact tooltip and retained Home geometry, not Yield/Portfolio readiness.

No completed next-family browser packet was available. Required: post-repair
mounted Portfolio X ticks, exact selected timestamp/value/category totals and
marker coordinates; range/empty recovery; combined catalog mounting; 320/390px,
constrained and wide light/dark text bounds and ordinary-height inspection
captures, including long/large/negative/zero-value pressure and native touch-scroll
safety. The existing unsupported touch-inspection boundary is not a new defect.

Strongest disconfirming check: test whether Recharts transparently resolves the
axis wrapper. Installed parser inspection and paired rendering both disproved
that possibility. Passing fixture/type checks cannot detect this rendering seam.

## Focused repair recheck

Disposition: confirmed/fixed at the discovery/render seam. The direct `XAxis`
at `portfolio-history.tsx:171` replaces the wrapper. Fresh rendering of the
actual repaired axis JSX with the supplied fixture and installed Recharts
discovers/renders one axis, preserves start/middle/end anchors, and produces
the selected marker at expected timestamp-derived X (680.333px; error below
0.001px). The browser assertion checks this relationship. Mounted-browser
verification remains pending for the coordinator; no unrelated review repeated.
