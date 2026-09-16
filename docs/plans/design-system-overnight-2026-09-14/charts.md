# Chart system — first review brief

Prepared September 14 from Claude's chart-readiness audit at `289b2af86` and
fresh source inspection. This is a visual-system proposal, not chart adoption,
new data policy or acceptance of every audit recommendation. This preparation
brief is refined by the [source-faithful review](../design-system-charts-source-reset.md);
its original audit findings are not automatically accepted.
[Sensitive questions are separate](chart-engineering.md).

Current sequencing: after the source-faithful line/Home/Discover review, the
user authorized [Overview candlesticks](../design-system-candlesticks.md).
Factsheet bars are no longer scheduled: the `/performance` route is retained
but no current navigation link was found. Preserve it as inventory evidence,
not an active-product assumption or deletion instruction. Yield historical
charts and the two composition families remain future review candidates.

## Outcome

Build a small visual vocabulary that makes the existing chart jobs feel like
the stronger Home/Overview examples: quiet supporting text, a clear plotted
signal, restrained financial color, subtle optional fill, and legible inspection.
Share appearance and interaction recipes; retain different encodings when the
information genuinely differs. A source file count is not a desired component count.

The first lab slice starts from the actual Overview and Home renderers, plus a
realistic Discover plot-only cell. Preserve each host's typography and geometry;
do not invent wrappers and ask the user to approve unknown downstream changes.
Generic supplied-state tests belong in a separate collapsed section. It need not wait for an
SDK/API rewrite, financial-basis decision or dense-history transport change.

## Necessary visual families

| Family                         | Existing job and source                                                           | What should feel shared                                                   | What must stay distinct                                                                                                                               |
| ------------------------------ | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Time-series line/optional area | Price/NAV, exchange rate, supply or APY level; Home, Overview, yield and Discover | Stroke, optional fill, axes, inspection, supporting type, loading anatomy | A level is not a return; supplied units, period and semantic color remain explicit. APY/supply need not look like investment gains.                   |
| OHLC candles                   | Overview's current default view                                                   | Full-chart frame, controls, type, inspection styling                      | Four values per interval and bucket meaning. Do not remove candles or change the default overnight.                                                   |
| Discrete signed bars           | Factsheet Monthly P&L                                                             | Axes, label/tooltip treatment and financial colors                        | Monthly interval returns around zero, not a continuous price line or categories summing to a portfolio. Preserve this encoding in the inventory.      |
| Composition over time          | Portfolio stacked series                                                          | Frame, axes, focus/inspection and typography                              | Categories, total and legend relationships; use distinguishable categorical treatment, not positive/negative return colors.                           |
| Composition at a point         | Yield backing/allocation pie's current job                                        | Category/legend treatment with composition-over-time                      | A snapshot has no time axis. Keep pie versus stacked bar/list as a later visual decision; no automatic replacement or loss of allocation information. |

Progress/threshold bars, elapsed-time rings and governance stage timelines are
related indicators, not more time-series charts. They can share style without
one universal numeric contract: a ratio, threshold and multi-stage timeline do
different jobs. The deferred auction schematic is illustrative, not price data.

## First slice: one time-series comparison, three containers

| Container     | Intended reading                                           | Visual contract                                                                                                                                                                                         |
| ------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Compact trend | Direction/shape beside an existing value and period        | No axes or embedded controls. Supporting signal, stable footprint, no duplicated accessible narration. Existing 90×40/112×48 sizes are evidence, not mandatory global sizes.                            |
| Card          | A readable period trend within a product card              | Bounded plot with optional subtle fill; retain identity/value hierarchy. Estimated-history annotation only when supplied and legible. Do not import card radius/media activation as chart-system rules. |
| Full          | Inspect a value at a time and switch supplied views/ranges | Quiet axes, coherent plot edges, one inspection panel, visible selected controls, keyboard/touch access. No extra decorative card around an already-framed chart.                                       |

Each primary example uses a named captured product context. Overview's existing
tooltip and proposed header inspection compare the same supplied inputs and
renderer. Separately show generic state and coarse/dense capture evidence. No new
fetch, smoothing, live-point append, resampling or aggregation policy in this slice.

### Ownership and component reuse

- Product supplies series, displayed headline/period, available ranges, units,
  annotations and known state. The visual does not calculate a headline return
  or infer readiness/freshness from an absent value. Missing is not zero.
- Reuse canonical typography, controls, Skeleton and existing financial value
  treatment only for its matching meaning. `PerformanceValue` is a percent
  display, not a formatter for prices, APY levels, shares or arbitrary precision.
- Reuse Home/Overview's presentational renderers to avoid visual drift. A local
  Provider isolates the Overview replay's mode; no query updater is mounted.
  Retained source layering is not a new universal chart API or acceptance of
  source accessibility/motion debt. Do not copy endpoint selection or raw colors.
- The current performance palette already has a shared owner. Do not create a
  competing palette. Its move into canonical stroke/fill/categorical tokens is
  a separately scoped foundation question; do not silently change shared defaults.
- Range/type selection should consume an appropriate accepted selection control.
  Do not cram seven choices into tiny phone targets. A supported compact selection
  presentation is preferable to shrinking labels or losing options.
- Distinguish tick-label presentation from domain/bucket policy. Improve legibility
  without relabeling timestamps, rounding supplied values differently, or making
  candle buckets pretend to be continuous samples.

### States and inspection to show

Normal positive/negative/neutral; supplied estimated-history annotation; loading;
empty; one/two points; explicitly supplied unavailable/delayed/gapped examples;
long values/units; light/dark; reduced motion. New empty/error/delayed copy requires
approval; existing source wording may be retained verbatim. Demonstrating a state
does not establish that production has the information to derive it.

Full inspection must be reachable by keyboard and touch, with no hover-only
essential information. Keep the inspected time/value clear, selected controls
semantically exposed, hit regions large enough, and loading/plot geometry stable.
Compare 320/390px, a constrained parent and ordinary desktop height. Retain
estimated versus actual history distinctions rather than smoothing them away.

## Disposition of the audit's main recommendations

| Audit direction                                                                   | Reconciliation                                                                                                                                               |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Home/Overview as the style lead; three sizes                                      | Carry forward visually. Container recipes do not require one component to own all data/state behavior.                                                       |
| Fix the headline contract before visuals                                          | Separate: technical integration needs an agreed meaning; the first visual lab can accept explicitly supplied values without choosing one.                    |
| Only three other patterns; monthly bars are just a view                           | Amend: signed period bars and static composition have distinct visual jobs. Reuse foundations, not semantics.                                                |
| Replace legacy charts                                                             | Treat as a migration/design recommendation, not deletion authorization. Retain needed information/interaction and verify source-specific requirements first. |
| 122 points, ≤40 compact samples, ≤100KB/card                                      | Audit trials/budgets, not accepted universal rules. No fetching or downsampling change in the visual slice.                                                  |
| Decide candles retention; remove dead controls or unused ChartContainer machinery | Defer. Product/shared-code changes are not necessary to prepare the lab comparison.                                                                          |
| Accessible summaries, controls, clear states and motion                           | Carry forward as visual/interaction requirements, with evidenced copy and explicit state inputs.                                                             |

## Tomorrow's review and acceptance

First confirm that the primary examples preserve the liked product character,
then review header inspection and bounded improvements in those real contexts.
Generic state treatments remain a separate question, not a replacement layout.
Do not ask the user to settle API transport or every legacy chart migration to
begin. Follow with candles; Factsheet signed bars are excluded as noted above.
Composition comes after a category
palette/legend decision. No chart type is retired by this sequencing.

First-slice proof is owned by the source-reset receipt. Keep the reused renderer's
visual/inspection checks separate from generic pressure-state evidence; generic
reduced-motion proof does not certify Overview. No query or financial
transformation changes. Keep chart work isolated from production auction flows.

Source anchors: [Overview](../../../src/views/index-dtf/overview/components/charts/price-chart-body.tsx),
[Home](../../../src/views/home/components/highlighted-dtfs/performance-chart.tsx),
[Factsheet bars](../../../src/views/index-dtf/factsheet/components/factsheet-chart.tsx),
[Portfolio](../../../src/views/portfolio-page/components/portfolio-chart.tsx),
[backing pie](../../../src/views/yield-dtf/overview/components/collateral-pie-chart.tsx),
[catalog](../../../src/views/internal/design-system/component-catalog-support.ts).
