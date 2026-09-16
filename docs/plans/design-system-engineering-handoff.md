# Design-system deferred engineering-review register

Read before sensitive-contract work, production-adoption planning, or project
engineering handoff. This is the register linked by the [active V1 plan](design-system-v1.md#deferred-engineering-review-register),
not a separate approval policy. Add or update the affected row when its existing
trigger applies; review the complete register at final engineering handoff.

The September 16 chart decision approves the current lab presentation for now
and freezes its evidence. Every chart entry below remains an adoption constraint;
the visual decision does not clear engineering, data, shared-default, or
production review.

## Responsive page-title opt-in

`src/components/design-system-v1/typography.ts` adds
`v1TypographyVariants.responsivePageTitle`, consumed by the Overview lab
name and the proposed Portfolio financial total: 24px/30px below 640px,
32px/38px above, light weight. Portfolio uses a financial paragraph, not a heading.
The fixed page-title
default, other roles and production callers are unchanged. **Engineer review
required before adoption:** confirm the shared API and per-consumer title role,
wrapping and breakpoint fit. [Bounded evidence](design-system-responsive-page-title/README.md)
does not certify other names/locales, product adapters or chart behavior changes.

The later `lightPanelTitle` variant is 20px/26px, weight 300, used only by the
Home chart-context name. It proposes lighter emphasis without changing size,
frame geometry or the default `panelTitle`. Both additional uses remain visual
candidates; confirm role naming and consumer fit before widening adoption.

## Chart mobile preview and Home annotation

Authorized bounded work is tracked in
[the chart preview closeout](design-system-chart-preview-closeout.md).
The lab-only child document needs a minimal `vite.config.ts` HTML build input;
it must not mount the product app, wallet providers or live updaters. Home's
launch-marker styling is an opt-in whose existing production pill, timestamp
placement and visibility behavior must remain unchanged. **Engineer review
required before deployment/adoption:** inspect emitted entry/chunk boundaries,
same-origin isolation, translations and label fit near chart-domain edges.
The existing `_headers` policy blocks framing; local Vite evidence does not
certify deployment. No security-header change, source/return calculation or
production migration is authorized. Implementation/verification status is owned
by the linked closeout rather than inferred from this register entry.

## Chart endpoint and axis presentation opt-ins

**Engineer review required before adoption.** The authorized
[feedback pass](design-system-next-charts/feedback-pass/plan.md) adds optional
`latestPointMarker` presentation to Overview line and Home renderers, and
`yAxisPresentation="compact"` to Overview line/candles. Only lab callers opt in.
The local helpers `chart-presentation.tsx` (Overview) and
`performance-chart-presentation.tsx` (Home) own drawing coordinates, not data.
The two existing gradient-def helpers accept optional user-space coordinates
so endpoint fill can match the line. Focused default-parity tests and mounted
lab checks cover these opt-ins; the final evidence index is owned by the
feedback pass. No production caller adopts them.

Review actual Recharts scales, gradient coordinate spaces, endpoint/launch
alignment, clipping ancestors, resizing, font/axis widths and inspection reset
before broader use. A marker identifies the latest plotted value, not a new
live-price or freshness guarantee. No source, SDK, calculation, sampling,
precision or financial-domain change is authorized. Home's omitted-option
launch placement must remain timestamp-only; it must not acquire a dependency
on measured height or financial value bounds.
The marker opt-in suppresses the built-in active dots to draw one selected or
latest point. Mouse exit restores the latest point; touch release retains the
same selected timestamp as the header. Review those distinct lifecycles before
adoption. Candlestick inspection has separate September 15 evidence below.

## Compact text-only control baseline

**Engineer review required before shared-default promotion or adoption.** The
[revised chart refinement](design-system-next-charts/optical-refinement/plan.md)
records the approved-for-now lab treatment separating text-only layout height from its usable
hit area and supplies a compact CSV utility without an oversized hover capsule.
This is not a shared-default change. Inspect canonical
segmented/text-action owners, clipping in horizontal scroll containers, actual
expanded hit testing, adjacent-control overlap, focus/disabled states and every
affected V1 consumer. Contained controls and ordinary Button/InlineAction
defaults must not silently change. Paused transaction layouts are not authorized
for bespoke redesign as a side effect. The linked plan owns final evidence; any
promotion requires a separately authorized adoption review.

## Overview candlestick lab opt-ins

Engineer review required before production adoption. The
[candlestick contract](design-system-candlesticks.md) and
[implementation receipt](design-system-candlesticks/README.md) own the exact
source and verification boundary. `candlestick-chart-body.tsx` and
`candlestick-launch-marker.tsx` pass through the existing optional annotation
presentation. The first experimental keyboard flag was removed after failed
touch verification; that historical attempt is not the retained solution.
Omitted options retain production behavior.
The later optional `tooltipContent` element lets the lab pass
`charts/source-candlestick-tooltip.tsx`: the existing tooltip-surface recipe,
paired OHLC rows and original timestamp/value formatting. Production callers
omit it and retain the original `CandlestickTooltip`; its file is unchanged.
For that same opt-in, `CandlestickChartBody` enables Recharts keyboard
inspection and records the actual pressed `activeTooltipIndex` as Tooltip
`defaultIndex`, preventing focus from resetting a stable non-first touch
selection to the first candle.
Before adopting this presentation seam, verify injected Recharts payloads,
localization, tooltip containment and all interval/unit combinations. The
[completion package](design-system-next-charts/completion/README.md) owns its
bounded evidence, not the earlier tooltip delegation.
No production caller, query, bucket selection, financial calculation or
launch-coordinate mapping is migrated by this lab work.

The new second-candle test originally exposed a focus reset to the first candle
with keyboard inspection enabled. Three bounded touch fixes failed and were
removed; none is retained as a solution. The separately authorized September 15
G7 repair then passed the unchanged keyboard/touch assertions 2/2, protected
geometry/hover 5/5, the full candlestick specification 12/12 and integrated
chart matrix 86/86. The retained tooltip remains the candle readout; the
rejected trial candle-header callback is not part of the implementation.

The original worker also reproduced failure of the desired keyboard and stable
second-candle touch checks with the opt-in omitted in the isolated replay.
That historical characterization is superseded for the lab opt-in, while still
not proving a defect or a fix in the unmodified production page and its
surrounding event context.

The dated public staging capture contains 37 raw PHOTON weekly buckets; one
bucket starting August 13, 2026 has `low: 0`. The unchanged production
`mapCandles` filter excludes it, so the replay renders 36. The raw response is
preserved. This is a reproduced source observation, not a diagnosed API defect
or an instruction to repair the filter. Engineers must establish whether the
zero is legitimate or missing-data encoding before changing its treatment.
The last bucket is partial, and headline/history/candle captures have different
dates; no returns or reconciliation are derived from them.

Before adoption verify real payload lifecycle, touch/keyboard compatibility,
all intervals and supported units, missing/invalid buckets, localization,
launch-straddling intervals and actual host layout. Human chart approval does
not resolve those data questions or certify every production state.

## Existing review surfaces

### Yield historical metrics and Portfolio composition study

**Engineer review required before production adoption.** The lab-only
`charts/next-families/` study combines captured Yield data with independently
timed RSR/USD and simulated APY/Portfolio. Validate valuation, periods/units,
real payloads and interaction compatibility. Preserve existing Gain, ETH
conversion, Portfolio change figures and hover/click behavior. Touch inspection
is unsupported in the study. No production adapter changed.
[Pre-feedback completion evidence](design-system-next-charts/completion/README.md)
separates visual readiness from data and interaction parity. The candidate shows
one dated historical total, not a live-account total; the production live total
and dated tooltip may legitimately differ and are not proposed for consolidation.
The lab now owns an explicit `day`/`minute` timestamp-precision input rather than
inferring display precision from cadence, range, or timestamp digits. Its weekly
Portfolio fixture supplies UTC day precision, including for the 23:59:59 path
sentinel; Yield inspection supplies UTC minute precision through the same local
formatter. Adoption must preserve visible/live-output agreement and choose
precision from the real source contract.
Total-area and composition modes are separate lab controls, not a replacement
for production hover/click. Category order follows production; source-related
token colors remain provisional adoption constraints even though the current lab
presentation is approved for now. No global categorical palette is approved.
The follow-up [feedback pass](design-system-next-charts/feedback-pass/plan.md)
changes layout/inspection presentation only. Its composition contour uses the
already supplied total; no new balance or return calculation is introduced.

| Review surface                                                                                                                          | Why engineering review is required at project closeout                                                                                                                                                                                                                                                                              | Current boundary                                                                                                                                                                                                                                                                                                                                          |
| --------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Governance record production adapter                                                                                                    | Governance owner must preserve individual proposal/governor identity, lifecycle/tally/deadline derivation, standard versus optimistic evidence and vote/queue/execute authority; loading/empty/expired/Show all and deadline crossings need real source coverage                                                                    | [Presentation closeout](design-system-governance-presentation-closeout.md): 13 frozen examples, explicit waiting versus ready, independent help, active-only timeline and local loading/empty. Overview reference links remain; no adapter, state derivation, shared timeline default or transaction change.                                              |
| Opt-in interactive content hover                                                                                                        | CSS/Tailwind/semantic role needs theme, contrast, focus/selection and real consumer-scope review before production use                                                                                                                                                                                                              | [Accepted lab rollout](design-system-content-hover-trial.md): solid pale ivory in light, subtle lightening in dark. Eligible content rows/cards opt in; static/loading/control states excluded. No production migration or shared-default change. Engineer review required for adoption.                                                                  |
| Same-view current rebalance lifecycle                                                                                                   | Auction live-state truth, indexer lag/double-send prevention, both launch paths, receipt reverts, permissions/network checks, weight units/persistence, cap policy and filler navigation need real integration evidence                                                                                                             | [Lab candidate](design-system-current-rebalance-workspace.md) only; local simulation and explicit unknown states, no SDK/wallet/RPC change. Engineer review required before adoption; v4/v2 and router-level blocking remain separate                                                                                                                     |
| Current/history table production adapter                                                                                                | Auctions integration owner must verify authoritative current/live membership, access/timing, version-correct destinations and Back/deep-link continuity; history needs source/sign/precision/unknown-value fidelity                                                                                                                 | [Near-term scope](design-system-current-rebalance-table.md#near-term-and-deferred-scope) only. Keep the existing detail/flow; dated lab references do not implement it or clear audited launch hazards. No production adoption.                                                                                                                           |
| Chart value-basis and freshness questions                                                                                               | Chart audit at checkpoint `289b2af86` reports different headline/series endpoints across Overview, Discover/Home and Factsheet (F-01/F-02/F-09), and stale-history/live-point behavior (F-03). Chart/data owners must establish intended periods, timestamps, units and SDK/source semantics before classifying or changing them    | [September 14 reconciliation](design-system-overnight-2026-09-14/chart-engineering.md) separates source-confirmed observations from historical/unverified claims; no calculation/source/freshness change. [Visual first slice](design-system-overnight-2026-09-14/charts.md) can use explicit supplied values/states without choosing a financial policy. |
| Overview header-readout/launch-annotation opt-ins and source-renderer reuse                                                             | `price-chart-body.tsx` accepts optional `onInspect`; `chart-inspection.ts` validates existing selected event payloads. The lab owns accessible readout, focus/touch/exit. Optional `launchMarkerVariant="annotation"` replaces the static pill with V1 text; launch dates/segmentation are unchanged. Production callers omit both. | **Engineer review required before adoption.** Verify modes/units, payload lifecycle, keyboard/touch/exit, header/series meaning, motion and source imports; check annotation translations and edge-of-domain placement. No query, SDK, return, sampling or chart-type default changes. [Bounded contract](design-system-charts-source-reset.md).          |
| Semantic `substrate-subtle` token and its CSS/Tailwind/semantic-role wiring                                                             | Adds an opaque shared surface role whose exact light/dark values and naming affect future consumers                                                                                                                                                                                                                                 | Accepted for the V1 lab; no production migration                                                                                                                                                                                                                                                                                                          |
| Exploratory `brand-surface-deep` token and Organic Brand `deep` tone                                                                    | Adds a shared theme alias and opt-in presentation whose extra depth currently applies only in dark mode and only attachment outcomes need it                                                                                                                                                                                        | Lab pressure only; do not consume or migrate until human disposition                                                                                                                                                                                                                                                                                      |
| Shared Link directional-icon spacing and Lifecycle Status intrinsic sizing defaults                                                     | Changes reusable component defaults outside a single transaction composition                                                                                                                                                                                                                                                        | Verified in the lab; production adoption remains separate                                                                                                                                                                                                                                                                                                 |
| Standalone Link hover feedback                                                                                                          | Adds the user-requested text underline on hover to the shared V1 standalone treatment; navigation and focus behavior stay unchanged                                                                                                                                                                                                 | Lab verified; engineer review before production adoption                                                                                                                                                                                                                                                                                                  |
| DataTable optional toolbar slot                                                                                                         | Exposes the existing TanStack table instance for caller-owned controls without a second sorting state                                                                                                                                                                                                                               | Used by constrained position sorting in the lab; existing callers/defaults unchanged; engineer review before adoption                                                                                                                                                                                                                                     |
| Link and InlineAction contextual treatment                                                                                              | Adds opt-in neutral body-type navigation/local-detail actions without changing defaults                                                                                                                                                                                                                                             | Table-family lab trial only; engineer review before production adoption                                                                                                                                                                                                                                                                                   |
| Copyable Value integrated action and Inline Message compact-summary/contained-icon contracts                                            | Adds reusable interaction/presentation variants, including copy feedback, tooltip eligibility, and an opt-in balanced icon treatment                                                                                                                                                                                                | Accepted V1 component contracts; production adoption remains separate                                                                                                                                                                                                                                                                                     |
| Restrained 8px transaction amount-region geometry, opt-in supporting-row reservation, and provisional transaction relationship geometry | Defines reusable input/output/replacement boundaries, stable responsive content height, and cross-flow spacing/divider ownership                                                                                                                                                                                                    | Consumable only in the active transaction review; not a universal Dialog or workflow contract                                                                                                                                                                                                                                                             |
| Stake delegation split versus the production `stakeAndDelegate` shortcut                                                                | Adopting the lab's distinct Delegate mode could remove or alter an existing combined contract call and changes the product interaction model                                                                                                                                                                                        | Lab-only information architecture proposal; retain the live shortcut until explicit migration review                                                                                                                                                                                                                                                      |
| Transaction result, RPC, package callback, order/queue identity, approval, and partial-success seams                                    | Visual fixtures cannot prove the live source of truth or execution/recovery correctness                                                                                                                                                                                                                                             | Keep exact behavior product-owned; reconcile against direct implementation before adoption                                                                                                                                                                                                                                                                |
| Automated issuance batch count, cancellation, executed amounts, recovery, and dormant outcome route                                     | The SDK owns call splitting and execution while the current UI reconciles quote, order, receipt, and balance sources without a persisted operation record                                                                                                                                                                           | Lab may model named states only; source priority and reconstruction require product/SDK review                                                                                                                                                                                                                                                            |
| Manual issuance address normalization, parallel/USDT approvals, zero-minimum Redeem leg, and result source                              | These boundaries can change balance validity, permission ordering, slippage protection, and the facts a consequential outcome may claim                                                                                                                                                                                             | Preserve production behavior in the lab; resolve before any production migration                                                                                                                                                                                                                                                                          |
| Any production migration of the current transaction candidates                                                                          | Adoption may change real flow behavior, shared defaults, analytics, accessibility, and integration boundaries                                                                                                                                                                                                                       | Requires separate explicit migration scope after human design review is complete                                                                                                                                                                                                                                                                          |
| Complete shared typography owner API                                                                                                    | Exposes all ten reviewed roles and usage guidance from typography.ts; four earlier keys stay compatible                                                                                                                                                                                                                             | Value-preserving lab consumption verified; engineer review before production adoption                                                                                                                                                                                                                                                                     |
| Compact item-title recipe and EntityIdentity nameLeading opt-in                                                                         | Adds a 16px/20px wrapping-title variant and preserves a 24px single-line floor; reviewed roles and shared defaults unchanged                                                                                                                                                                                                        | Bounded table presentations approved for now; engineer review of API and adoption scope before production use                                                                                                                                                                                                                                             |
| Consolidated semantic owner and Tailwind role aliases                                                                                   | Removes overlapping owner exports and names existing surface, feedback, disabled and neutral-status aliases; distinct focus contracts remain explicit                                                                                                                                                                               | Existing CSS values and component defaults preserved; engineer review before production adoption                                                                                                                                                                                                                                                          |
| EntityIdentity `wrapName`; DataTable `ariaLabel`, `renderToolbar` and `rowLimit` opt-ins                                                | Adds wrapping, accessible sort metadata, a same-instance toolbar and a post-sort preview limit for the position/withdrawal lab slice                                                                                                                                                                                                | Defaults and production callers unchanged; engineer review of shared APIs and real data/action adapters before adoption                                                                                                                                                                                                                                   |
| ChainBadgedLogo optical edge positioning                                                                                                | User-authorized shared candidate geometry change across all four sizes; verify separator/background relationship when adopting                                                                                                                                                                                                      | Visual trial in V1 consumers only; legacy production wrappers and stacked logos unchanged; engineer review before adoption                                                                                                                                                                                                                                |
| ChainBadgedLogo optional custom mark                                                                                                    | Accepts caller-sized artwork while retaining the existing badge owner; default TokenLogo path unchanged                                                                                                                                                                                                                             | Unadopted opt-in from the preceding DeFi trial; latest DeFi composition no longer consumes it; engineer review before production adoption                                                                                                                                                                                                                 |
| EntityIdentity 32px mark spacing                                                                                                        | User-authorized 12px gap trial keyed to direct ChainBadgedLogo size metadata; other marks keep 8px                                                                                                                                                                                                                                  | Shared candidate trial, not accepted migration policy; inspect consumers before adoption                                                                                                                                                                                                                                                                  |
| TokenStackTrigger opt-in                                                                                                                | Adds a named 44px logo-led trigger over existing Button and TokenLogoStack without altering their defaults                                                                                                                                                                                                                          | Discover trial; its local horizontal strip and production adoption remain separate review boundaries                                                                                                                                                                                                                                                      |
| DataTable alternative renderer and feature-chart animation opt-in                                                                       | Keeps one table state owner while rendering a caller-owned card list; lets the lab disable both chart layers for reduced motion without changing existing defaults                                                                                                                                                                  | Discover card lab only; engineer review before adoption, including list state, focus, and production page integration                                                                                                                                                                                                                                     |
| Portfolio viewed-account withdrawal ownership and table data adapters                                                                   | Independent review found enabled withdrawals while viewing another account; source combines the connected account with a viewed row's endId. Sorting/limiting, missing values and precision also differ between lab and product                                                                                                     | No production changes or transaction attempts; engineer review of account/row ownership and the [adoption contracts](design-system-table-family-reconciliation.md#production-adoption-contracts) before migration                                                                                                                                         |
