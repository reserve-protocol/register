# E2E Test Map

Route/state coverage matrix for the e2e suite. Regenerate the ground truth
before editing this file:

```
find e2e/tests -name "*.spec.ts" | sort              # spec inventory
grep -rn "test.fixme\|it.fixme" e2e/tests             # active fixmes
grep -rln "@mobile" e2e/tests                         # mobile-tagged specs
```

Harness architecture (mock layer, trust contract, CI split) lives in
`docs/wiki/domains/e2e.md`; mock mechanics and recipes live in `e2e/CLAUDE.md`.
Playwright runs 3 projects (`playwright.config.ts`): **smoke** (`@smoke`-tagged,
Desktop Chrome), **full** (everything else, Desktop Chrome), **mobile**
(`@mobile`-tagged, Pixel 7 viewport — off CI, `pnpm e2e:mobile`).

73 specs across 5 top-level dirs: `general/` (8), `index-dtf/` (17),
`yield-dtf/` (6), `smoke/` (12), `flows/` (30). `index-dtf/` and `yield-dtf/`
hold render/lifecycle/mobile specs per route; `flows/` holds deeper
behavior/write/edge-case specs (desktop only, no `@mobile` tags anywhere in
the directory).

## General (top-level routes)

[Source-bound review capture](design-system/source-capture.spec.ts) runs with
`pnpm design-system:review` (owned port 3022; `DESIGN_SYSTEM_PORT` overrides it).
Use a free port; it owns a strict-port preview and rejects external URLs. Four
light/dark × 375/1400px cases attach normal-viewport overview, focused Button,
open Select, three positions across the ten-role Typography map, and
source/runtime/geometry metadata to the JSON and HTML reports. Typography
records computed font family, size, weight, line height, tracking, color and
text bounds for every role; inner scroll offsets are recorded separately from
window scroll. The test configuration and mocked remote assets are explicit.
Escape returns focus from Select. Snapshot verification is read-only; these
captures do not approve pixel baselines or design changes. The manifest and
watcher check selected repository content during each test, not Vite startup or
dependency binary identity. It is selected by workflow mapping and the path-filtered
`Design system` PR/manual CI job, retaining reports and captures for 30 days. CI
does not compare the existing macOS pixel sheets on Linux. This bounded seam does
not replace existing composition or full-content checks.
Environment fingerprints stay in an in-memory guard and are excluded from both
the serialized file list and aggregate digest. The watcher covers source
directories and root-level changes without recursively watching dependencies.

The capture also visits dedicated Checkbox, Switch, Field, Inline Message,
Lifecycle Status, Entity Identity, Metric and Link routes. Checkbox/Switch
keyboard focus and Space transitions are exercised. Visible images must finish
loading before capture. The semantic migration's earlier comparison predates
the dedicated-route and image-readiness checks; do not upgrade that historical
evidence retroactively.

[Lab regressions](design-system/lab-regressions.spec.ts) check overview start
position and document overflow at 320/375/1400, reachable table columns at 375,
Stake label boundaries at 320/359/360/375, and contained-dialog focus entry,
Tab/Shift+Tab confinement and Escape return at a short 375×600 viewport.
Helper tests exercise actual missing-baseline failure, required attachments,
source drift/private-data exclusion, and positive/negative workflow routing.

[Source-based chart review](design-system/chart-review-lab-regressions.spec.ts)
covers actual Overview/Home renderers, Home square inner/outer framing with a
4px surround and preserved 24px content axis at 320/390/1400 in both themes,
90×40 Discover geometry, six/five desktop
axes, unboxed launch annotation typography/centering/caption separation at
320/390/1400, responsive Overview page-title computed 24px/30px versus
32px/38px at 320/390/640/1400 in both themes with long-title containment and
unchanged plot dimensions/paths/ticks, source-tooltip versus header-readout,
persistent selected ticker, exact price/timestamp pairs, compact header/plot
geometry across value lengths, focus/blur, first-touch exact
January 2 value/date after a hold and mode round trip, native touch scrolling,
reset, and settled curve bounds at 320/390/768/1400 plus
a constrained parent in both themes. Captures wait for the actual SVG curve
to reach its new plot boundary; CSS animation disabling alone is insufficient.
The collapsed generic fixtures separately cover density, range focus/loading,
zero/missing/gaps, estimates, sparse/long values, reduced motion and Spanish.
Those do not certify production-renderer edge states or reduced motion. Fixture
units preserve supplied pairs without deduping/reconciling captures. This is not
financial adapter or production-page integration proof;
[review and engineer boundary](../docs/plans/design-system-charts-source-reset.md).

[Chart mobile preview](design-system/chart-mobile-preview-lab-regressions.spec.ts)
owns the lab's actual child-document viewport, separate narrow-desktop mode,
single source-set mounting and parent/child review state. The
[Home launch annotation](design-system/chart-home-launch-marker-lab-regressions.spec.ts)
pins the lab-only unboxed label and default mobile visibility; the Home marker
unit test pins the retained production pill. See the
[follow-up receipt](../docs/plans/design-system-chart-preview-closeout.md)
for final executed coverage and the local-only/deployment boundary. Neither
suite certifies a production migration or hovered-return calculation.

[Candlestick lab checks](design-system/chart-candlestick-lab-regressions.spec.ts)
exercise real captured OHLC, renderer selection, axes, selected footer labels,
viewport/type round trips and inspection. The original second-candle touch hold
exposed a reset with the first keyboard opt-in, and three bounded repairs failed;
that history is retained in the
[candlestick receipt](../docs/plans/design-system-candlesticks.md). The separately
authorized September 15 repair synchronizes the actual pressed candle index with
Recharts keyboard focus. The unchanged keyboard and stable-touch assertions now
pass: focused 2/2, protected geometry/hover 5/5, full candlestick 12/12 and the
integrated chart matrix 86/86.

[Yield/Portfolio chart preparation](design-system/chart-next-families-lab-regressions.spec.ts)
covers ranges, CSV contents, unique price ticks, one inspection marker, rendered
total-area/composition modes, dated total and category key, all four metrics in
Empty/Default and light/dark mobile presentation. The
[integration check](design-system/chart-next-families-integration-lab-regressions.spec.ts)
keeps the existing chart review accessible beside the new section. These are
lab-only studies; simulated APY/Portfolio and unsupported touch inspection do not
certify production parity. See the
[feedback pass](../docs/plans/design-system-next-charts/feedback-pass/plan.md).
Its focused additions measure visible canvas insets, fitted Y-label gaps, exact
SVG endpoint/inspection coordinates, the Portfolio guide/contour, above-plot
ranges at 620/688px and full Empty canvases at 320/390/1400 in both themes.
The final plot-edge assertions distinguish the 4px local left drawing clearance
from the retained 24px content and right axes, keep the focus wrapper full width,
and require Portfolio total/composition horizontal bounds to match.
Portfolio header coverage keeps the latest date visible at rest, pins the 8px
total-to-date gap, verifies non-overlap at 320/390 and desktop, and keeps visible
and live output synchronized. The weekly fixture's May 31 23:59:59 path sentinel
renders only its UTC day, while Yield inspection proves exact UTC minute output.
Portfolio-key coverage also pins semantic dt/dd grouping, full-width aligned
rows and shared amount edges at 320/390 in both themes, including long wrapping
label plus long non-wrapping value pressure, total/composition, known-zero and
empty states. The 1400 case retains intrinsic compact entries with 24px item and
8px term/value gaps.
Source-family checks pin default opt-in parity, touch-release marker/header
agreement, gradient-matched Home endpoints and candle glyph-to-label spacing;
the September 15 candlestick matrix additionally certifies complete keyboard and
stable-touch OHLC for the lab opt-in. Production adoption remains uncertified.
The history-boundary extension pins normal Yield available-data bounds and the
Portfolio lab fixture's explicit known-zero pre-holdings lifecycle. Component
coverage proves YTD/1Y/All can select zero history while 7D/1M remain positive.
Its light/dark 320/1400 replay covers pointer inspection of an earlier zero,
keyboard inspection of the May 31 zero, visible/live zero categories, and samples
the rendered SVG path one pixel before the June 1 onset to prove the baseline
does not rise early. The generic interrupted-data fixture remains separate.
Production does not synthesize or prepend Portfolio zeros, and this lab proof
does not authorize adoption.

[Yield Price pilot](design-system/chart-yield-price-pilot-lab-regressions.spec.ts)
isolates the revised ordinary-value readout, permanent units/date, axis text
bounds, 4px plot-left versus 24px content/right edges, full-width focus wrapper,
marker clearance, focus-visible treatment, ranges/CSV and non-selecting touch
behavior.
[Text-control coverage](design-system/chart-text-controls-lab-regressions.spec.ts)
pins one 20px InlineAction with stable `Download CSV` accessibility and disabled
reason semantics. Exact 320/351/352/390 chart-container widths prove visible
`CSV` below 22rem and `Download CSV` from 22rem onward; light/dark evidence also
checks downloads plus visual and expanded-target separation from the range track.
[Main-route context](design-system/chart-yield-price-pilot-integration-lab-regressions.spec.ts)
checks light/dark mounting within the revised four-metric family. User-authorized
rollout remains a lab candidate, not human visual acceptance or production
adoption; see the [completion receipt](../docs/plans/design-system-next-charts/completion/README.md).

[Holdings source observations](design-system/holdings-source-lab-regressions.spec.ts)
exercise fixture-driven production Exposure/Collateral sorting, tab reset, mobile
ten-row expansion and crypto/stock bridge open/close. Focus return is recorded,
not presumed to pass; one unavailable exchange logo is explicitly mocked as 404.
[Holdings candidate regressions](design-system/holdings-family-lab-regressions.spec.ts)
cover the new isolated lab slice: crypto/stock, Exposure/Collateral, 320/375/1400
light/dark, 767/768 available-width boundaries, sorting, expansion, independent
loading, zero/unavailable, new-asset help, long names, bridge keyboard return and
constrained layout. Compact header tabs have alignment/size checks, unique control
IDs, keyboard switching, and focus continuity across the narrow/wide boundary.
Narrow records verify name/allocation alignment, compact metadata marks, accessible
Weight labeling, long-name containment, and supporting-group reflow at 511/512px.
Stacked Holdings and Portfolio row dividers are checked at a 24px left inset and
flush right edge; content padding remains independent.

The narrow expanding 44px tabs and adjacent 44px icon-only sort control are checked
with an 8px gap, including the active accessible label and selected menu field.
The controls-to-first-row content gap is checked at 24px.
Desktop Holdings captures also measure 24px from the final content block to the
card bottom, including overview width, long content and loading. The 12px cell
inset remains unchanged; only the outer table bottom supplies the difference.
Phone metadata sits 8px below the name, with 16px before the financial facts. Additional
checks cover separated skeleton bars, decorative metadata dots, underlined bridge
actions, and no-shift external arrows on hover/focus versus an emulated touch pointer.
Product dialogs remain reference-only; tests do not adopt them.

[Owned Portfolio lab](design-system/owned-positions-lab-regressions.spec.ts)
covers current stakes/vote-locks, both families and five states in 320/390/1400
light/dark views, nested-scroller and value/action containment, 1023/1024 container
boundaries, a 390px constrained preview, and focus/disclosure recovery after Empty.
The inline governed-DTF count has hover, click, touch and keyboard popover checks,
full independent links, stable row height and responsive focus return.
[Owned source capture](design-system/owned-positions-source-capture.spec.ts)
uses strict offline holdings and RPC overlays for API fallback, redeemable
underlying/rate, successful zero, empty-result decode failure and a zero-active
stake with a separate pending withdrawal. These do not prove transport failures,
production writes or account authority. See the
[receipt](../docs/plans/design-system-owned-positions-evidence/index.md).

[Discover source captures](design-system/discover-family-source-capture.spec.ts)
inspect the existing desktop table/basket hover and mobile card with the frozen
LCAP boundary, including its supported address/slug navigation forms.
[Discover cell regressions](design-system/discover-family-lab-regressions.spec.ts)
cover the bounded lab sample: held-basket keyboard inspection and long-list
scrolling, sorting, zero/missing, loading, inactive and long-name pressure states,
native navigation, desktop themes and the 1151/1152px available-width band.
[Discover mobile cards](design-system/discover-cards-lab-regressions.spec.ts)
cover exclusive table/card mounting, sorted order and focus across that band,
including open basket/sort-menu dismissal and no focus theft after outside
content or an unrelated menu is clicked. Compact/full chart, long content,
zero/missing, inactive, loading-height parity and native navigation are checked at
320/390/768px, including dark 390px.
Card performance checks require accessible `1M` to match visible `(1M)`,
including zero and unavailable values; desktop period wording is unchanged.
The captures also check square card/media regions, steady matching fills,
24px total primary-content edge insets and filled grid cells across content/loading
states. Both sides of the inline Market Cap footer must compute to 14px/20px,
including missing and loading states in both chart layouts.
The 2px secondary surround/seams are inspection-only lab framing, not a
product container contract.
Separate motion cases check loading recovery, the production 18-second ticker
cycle, keyboard-focus pause and reduced motion.
Static captures disable motion; shared chart animation defaults have unit proof.
[Discover trigger checks](design-system/discover-trigger-lab-regressions.spec.ts)
pin the balanced 44px target, 24px artwork, artwork/header alignment, ordinary
one-line desktop subtext, 16px count-side padding, absent chevron, resting border, and distinct row/direct
hover feedback and opening without a click.
[Discover strip motion](design-system/discover-motion-lab-regressions.spec.ts)
checks source-speed cruising, looping, pointer transit, pause, restart and
reduced-motion manual horizontal access (the phone case uses the cell gallery,
not the replaced narrow row). The 1.2-second ramp has literal unit
checks in the lab's discover-motion test. The expanded strip remains a review
candidate, not a production migration.
[Discover strip edges](design-system/discover-strip-edges-lab-regressions.spec.ts)
checks 12px non-intercepting fades at manual start/end, a stationary synthetic
Short basket preview, and overflow-to-fit resizing in light/dark desktop.
Search, page filters, production pagination and production card adoption are not
claimed by this lab slice; they remain production-owned migration obligations.

[Earn rate layout](design-system/earn-rate-layout-lab-regressions.spec.ts)
checks Default/Long content at 320/390px in both themes: help on the label line,
unshifted right-aligned numeric line, retained literal APR, and keyboard/touch
opening of the existing FAQ. Real hit-testing checks the expanded target outside
the visible line; the standard Earn suite covers loading, missing values and desktop.

[Compact layout regressions](design-system/overnight-lab-regressions.spec.ts)
measure Earn supporting-text/rate intersection and unbroken literal Owned
amounts at 320px in both themes, plus a 13-state governance visual inventory
at 320/390/768/1400px. [Governance layout checks](design-system/governance-record-layout-lab-regressions.spec.ts)
pin full-width narrow titles, qualifiers above them, evidence following status,
labelled standard evidence groups
without an orphan divider, and intact inline evidence above the 448px content
boundary. They check unchanged text while resizing, content-height review notes,
Tab traversal and Enter opening the existing overview reference in a new tab.
The governance-only 390px toggle preserves all examples and Earn width; both
themes check a retained card surface and opaque hover fill.
The [governance status checks](design-system/governance-status-lab-regressions.spec.ts)
cover one-pill hierarchy, foreground voting/challenge deadlines, quiet Passed,
Waiting period versus supplied Ready to execute, and active-only timeline strips.
They exercise 320/390/528/1400px and both themes, persistent helper tap/toggle,
outside dismissal without navigation, next-touch navigation and visible-row
keyboard focus/Enter/Escape. Loading checks pin width/content inset, inactivity
and unchanged recovery; empty and es/ko/zh wrapping are included. These are frozen
review states, not real deadline crossings. Shared tooltip scroll dismissal is
unchanged; viewport focus auto-scroll may dismiss an open tooltip.
The [content-hover checks](design-system/content-hover-lab-regressions.spec.ts)
cover proposal, Earn, current-rebalance, Portfolio and Discover at 390/1400 in both themes:
matching opaque fills, light warmth versus beige seams, dark lightening,
unchanged geometry, and no new hover on static history, withdrawals or loading
Earn/Discover. Full-card mask and strip continuity, loading-mask exclusion,
foundation group fill and neutral catalog links have explicit checks.
These do not establish real proposal destinations, source-derived lifecycle/data
states, live timeline calculations, vote/queue/execute permissions or any
production adapter. Show all and real loading/recovery remain integration work.

[Whole-row link checks](design-system/table-row-links-lab-regressions.spec.ts)
cover neutral identity text on hover in Discover and Index/Yield positions,
neutral hover titles in governance/rebalance records, retained row feedback and
keyboard focus, and unchanged independent link/action affordances at 390/1400px
in both themes.

[Current table checks](design-system/current-rebalance-table-lab-regressions.spec.ts)
cover the separate navigation-only current table: role/data/state precedence,
round and time ownership, empty/loading/multiple rows, desktop/phone and both
themes, real Details links and back/focus, controls, responsive focus, independent
proposer activation, and dated reference identity distinct from selected context.
These checks do not prove retained production transaction-flow parity.
[Closeout checks](design-system/auctions-closeout-lab-regressions.spec.ts) pin
the June completed Reference independently of the selected August fixture,
omit unknown-round blocks only in compact/detail projections, scope desktop
expiry, and distinguish a touch dismissal from intentional row/arrow/proposer
navigation. The historical help tests sample continuous presence for 1.5 seconds
after first and third taps at 320/390px in both themes; a transient flash is a failure.
[Combined constrained checks](design-system/auctions-table-constrained-lab-regressions.spec.ts)
cover current status/auction separation at phone/intermediate widths, the removed
4px bottom strip, full-width historical phone titles, real historical help taps,
both themes, a 390px constrained column and all 18 current states around the
352/1024px cutovers. Compact auction context precedes status; the arrow centres
against the status pill at 352px and above, or auction context below that width.
When no round is known, the compact arrow pairs with status at every width;
the desktop Auction column retains its unknown-value dash.
Locale checks pin single-line pills and separated help/link targets at intermediate
widths. The separate rebalance-expiry row keeps its translated label left and
remaining time on the right content edge, aligned with the arrow's visible circle
rather than its larger invisible touch area.
[All-state list checks](design-system/current-rebalance-all-states-lab-regressions.spec.ts)
cover 18 separately labeled one-row tables in the default matrix, labels outside
identity cells, history appearing once, unique preview destinations, exact Back
and proposer resize focus, phone overflow and switching to single-table previews.
The status/navigation refinement checks 32px circles and actual 44px link hit
regions (including clicks outside the visible circle), ready-state access labels,
visible weight/data exceptions, auction-owned bid counts
and retained wallet or weight prompts in the selected detail context.
[Launcher-help checks](design-system/current-rebalance-launcher-help-lab-regressions.spec.ts)
cover the approved explicit-access labels and launcher-only explanation: keyboard
focus, phone taps at 320/390px, Escape, responsive focus and help-content clicks without row
navigation. Weight setup keeps a single supporting access line and the complete
restriction in help and selected detail. [Locale checks](design-system/current-rebalance-table-locales-lab-regressions.spec.ts)
cover es/ko/zh labels, weight-restriction help and phone containment.
No actual launch permissions or transaction controls are changed.

[Current workspace checks](design-system/current-rebalance-actions-lab-regressions.spec.ts)
exercise local launch/receipt/indexing, rejection/revert recovery, viewer/network
gates, mounted phase changes, missing data, live bid access, repeats and history
handoff without wallet sends. [Editor checks](design-system/current-rebalance-editor-lab-regressions.spec.ts)
cover all eight hybrid tokens, actual 44px input hits, non-preset units and limits,
CSV validation/template, save/back, width changes, memory-only reload and
independent record operations, including guarded browser Back confirmation.
[Weight-comparison checks](design-system/current-rebalance-weights-clarity-lab-regressions.spec.ts)
distinguish actual holdings, the starting target and saved edits at 1400/900/390/320,
retain the comparison across reopening, and verify unchanged confirmation and reload loss.
They also pin static unconfirmed estimate placeholders, unchanged term order after
confirmation, missing-price guards and the familiar Current units / New units labels.
[State-composition checks](design-system/current-rebalance-state-composition-lab-regressions.spec.ts)
cover visible non-preset saved units and independently expected allocations,
discard retention, borderless table rows, unbroken narrow token identity, both bid
legs and selected chart ownership, compact first-run context and all seven outcome
metrics. Frozen-clock cases inspect wallet/receipt/indexing feedback before the
action and cap ownership beside the affected terms. Light captures use
1400/900/390/320px; the independent-review suite supplies dark pressure coverage.
[Detail checks](design-system/current-rebalance-details-lab-regressions.spec.ts)
cover token-level liquidity reasons, retry, limited/closed Ondo session facts,
keyboard/Escape return, and expiry accounting with outcome help and dollar impact
retained through history. [Lifecycle captures](design-system/current-rebalance-matrix-lab-regressions.spec.ts)
bind light/dark 390/1400 states, the actual 832px workspace boundary, unknown
routes and loading recovery to source fingerprints. The local simulator proves
review behavior, not RPC truth, signatures or production transaction correctness.
[Hierarchy checks](design-system/current-rebalance-hierarchy-lab-regressions.spec.ts)
cover shared auction ownership, transparent action surface, bottom-aligned wide
preparation terms/actions (including non-launcher copy), top-aligned live bids,
separate cumulative context, full-width liquidity tables and actual 32px logos
at 1400/900/390/320px.
They check readable failed-row identity, focused disclosure through resize, general
reference scope, natural outcome spacing and one recovery owner after expiry
during indexing.
[Header checks](design-system/current-rebalance-header-lab-regressions.spec.ts)
cover expiry within compact provenance, normal-weight metadata, outlined Details
centered against the title/metadata block on desktop, retained narrow top alignment
and 24px card insets, title/metadata spacing, canonical button treatment and actual 44px hits,
popover/chevron state, Space/Escape focus return and expired inspection across
light/dark 1400/900/390/320px.
[Recent-feedback checks](design-system/current-rebalance-feedback-lab-regressions.spec.ts)
cover 8px heading/description ownership, Basket-owned editing before/after save,
disabled launch with the existing prerequisite explanation, viewer/data gates,
live chart/Bids alignment, shared plot/timestamp/caption/note edges, unknown-state marker removal,
default ticking and explicit pause under both motion preferences, and the guarded
history handoff inside lab controls rather than the outcome.
[Section-boundary checks](design-system/current-rebalance-sections-lab-regressions.spec.ts)
cover inset header/auction/progress separators, heading hierarchy, 8px inline liquidity/live-timer pairs, compact liquidity
disclosure/count and full-width expanded tables, keyboard collapse, live/expired
continuity and light/dark 1400/900/390/320px captures.
[Composition checks](design-system/current-rebalance-composition-lab-regressions.spec.ts)
cover the full-width heading/status, paired desktop assets, plan-owned disclosure
spacing without a detached footer, responsive separator, full-width
expanded tables, and preserved inspection/bid selection through resize. Live
title/status stay aligned even at 320px. All four ordinary-width captures use
the same source guard as the lifecycle suites.
[Independent visual-review checks](design-system/current-rebalance-visual-review-lab-regressions.spec.ts)
cover heading-owned event clocks, operation-independent disclosure position,
bid expansion under its selected row, bottom liquidity collapse/focus return,
associated field errors, one outcome owner and history handoff/scene reset.
They capture responsive stacked/inline results with percentage-only execution
progress and matched neighboring-label alignment at 900px, plus invalid inputs,
warnings and expiry during indexing with unavailable metrics. Long-list closing
captures await disclosure motion and verify that the control is in view. All
captures use actual viewport widths and the source guard.
The [workspace contract](../docs/plans/design-system-current-rebalance-workspace.md)
owns unresolved adoption/copy gates and the retained evidence index.

[Clarity checks](design-system/current-rebalance-clarity-lab-regressions.spec.ts)
cover scenario-specific auction purpose, unknown-data suppression, permission-clock
copy with unchanged member/launcher gates, target-help keyboard access and inline
fit, and simulation controls outside the product card. Light/dark captures span
1400/900/390/320px; header and action checks retain their independent ownership.
The hierarchy suite also checks computed top/bottom borders on every Selling and
Buying header/body row, guarding against TableHeader reintroducing a divider.
Header checks retain matched 14px expiry label/value sizing while checking the
remaining time's foreground color and medium weight against muted provenance.

[Preparation asset-summary checks](design-system/current-rebalance-assets-lab-regressions.spec.ts)
cover complete 32px logo stacks, matching comma-separated ticker order, muted
14px/20px ticker text, 8px label
spacing, adaptive overlap with a 17-asset removal list, metadata-unavailable and
pending-price states, resize recovery and the retained full-list disclosure.
At 1400px the full Buying list, including SUI, fits one line while preserving the
24px plan-to-operation separator gap; narrower widths keep natural wrapping.
Captures span light/dark 1400/900/390/320px without changing the shared logo-stack
component.

[Historical table checks](design-system/auctions-history-lab-regressions.spec.ts)
cover the historical part of `#auctions-browse-review`: full-width desktop
columns and constrained rows, actual visible-cell width, 896px projection boundary,
signed/missing/zero metrics, independent lifecycle, loading-height parity,
empty recovery, static rows without hover/navigation, signed NAV change, dollar
impact, independent proposer destinations and projection focus transfer.
It also pins the wider identity column, whole-cell vertical centering, natural
provenance wrapping and accuracy/NAV help (focus, click, Escape and hit area).
The [history brief](../docs/plans/design-system-auctions-history-slice.md)
records source fidelity and the history-only sequencing that preceded the current
workspace candidate.

The following retained record suites use `#auctions-records-review`.
[Auction browse-record checks](design-system/auctions-browse-lab-regressions.spec.ts)
cover snapshot identities, distinct record/proposer destinations, keyboard access,
independent phase/width/state controls, pending → unavailable → ready metrics,
list loading, empty and zero-auction outcomes in light/dark at 390/1400px.
The 512px container transformation and 1280px context-frame boundary are checked
separately, alongside reduced-motion skeletons. These are frozen lab fixtures:
live state adapters, routing selection, detail/actions and production metrics
recovery are not implemented or proven. The [record transfer brief](../docs/plans/design-system-auctions-browse-slice.md)
owns fixture provenance and retained source-bound evidence.
The [record hit-target regression](design-system/auctions-record-links-lab-regressions.spec.ts)
physically clicks date, metric and padding regions, and independently checks the
proposer destination. Its date target failed before the metadata hit-layer fix.
The [launcher-wallet preview checks](design-system/auctions-launcher-lab-regressions.spec.ts)
cover authorized versus ordinary restricted-phase viewers, unchanged countdowns,
phase/state/width continuity, keyboard toggling and no transaction effects. They
simulate a role; they do not prove real wallet authorization or launch readiness.
The [repeated-auction preview checks](design-system/auctions-repeat-lab-regressions.spec.ts)
cover two auctions already run with the third ready or ongoing, keyboard count
selection, independent phase/wallet/state/width controls, unchanged history,
loading-height parity and no transaction effects in both themes at 390/1400px.
They do not predict a final auction count or derive live rebalance completion.
The [composition checks](design-system/auctions-composition-lab-regressions.spec.ts)
cover the 640px reading-width trial, active/history section surfaces, subordinate
headings, access independent of readiness, a wrapping title/status header and separate round context,
equal 14px/20px inline labels/values, blocked → ongoing recovery, history-only group omission, loading-height continuity
and complete inline-fact reflow. Source-bound light/dark captures include repeat, launcher, price failure,
ongoing, permissionless and unavailable history. The [earlier refinement](../docs/plans/design-system-auctions-composition-refinement.md)
supersedes the older preparation's viewer-dependent readiness and inline-only
history composition; actual permissionless preflight remains engineer-owned.

The Holdings width selector additionally exercises Full width, the 836px
overview estimate and 390px Mobile without resetting tab/condition/sorting.
PHOTON natural and synthetic long names, loading and a narrow parent are covered
in both themes. The existing source check pins the 1400px overview's 820px card,
88px navigation footprint, 480px right column and 12px frame budget; the
72px candidate rail yields the explicitly provisional 836px lab estimate.
The overview regression checks that Lumentum and Applied Optoelectronics
(Ondo Tokenized) collateral names fit one line with the tighter numeric columns,
MACOM can still wrap naturally, and its name block reaches the column's padded
right edge. The compact-title trial pins 20px leading and a 40px two-line MACOM
name while preserving Lumentum's 24px single-line box. Shared units retain default
title leading, compact-density type and supporting text; withdrawal browser and
mounted checks explicitly retain ordinary 24px symbol leading. Header containment
is checked alongside body content.

[Table-family regressions](design-system/table-family-lab-regressions.spec.ts)
are included in the same source-bound review project. They render the two
position/withdrawal anchors at 320/375/1400px in both themes, and at available
container widths 639/640/1023/1024px. Checks cover cell containment **and**
collapsed identity/availability grouping and label-above-value geometry, long
content, loading, expansion, keyboard position
links (including standalone hover underline), title-baseline section navigation,
divider-free desktop headers with 16px bottom and 16px desktop/24px collapsed row insets,
24px desktop Withdrawal content/footer-to-card bottom spacing,
hidden constrained headers, a shared-state Sort by menu (fields, directions,
return focus, popup containment), measured 24px record-to-divider offsets,
sorting, accessible sort direction, pending/ready actions and a
non-executing receipt preview. Focus is checked through sort/expansion and
phone-width reflow within the stacked projection. The cell gallery also checks
equal-height, vertically centered samples; tabs and preview conditions are
exercised independently, including Yield with long content.
[Table hardening](design-system/table-family-hardening-lab-regressions.spec.ts)
adds both-theme desktop/stacked focus transfer for sorting, identity, source
actions and processing feedback; deliberately blurred/outside focus must remain
outside. An open menu closes back to the active desktop sort on widening.
Loading preserves sort selection; below 640px an otherwise hidden selected
metric remains visible. Expansion checks pin the first five sorted records.
Source checks cover neutral 16px desktop/14px mobile type, keyboard focus and
local-detail activation. Identity supporting lines compare line height and actual
text position against identical plain text so a link/icon cannot silently alter
the two-line rhythm. Withdrawal checks cover the countdown → content-sized
button → processing → withdrawn sequence, 32px region/button height at every width,
and ready-button center alignment with the token logo,
stable desktop right edge, content-driven header wrapping on mobile, and keyboard
focus retained when the button becomes feedback. Both Index and Yield are
captured with ordinary/long content; the explicit constrained control is captured
for both families and withdrawals, not just the desktop breakpoint boundary.
The desktop Value-to-Withdrawal gap is
measured at 24px minimum; both tables are checked at container boundaries.
The same checks measure chain-badge colored edges after subtracting the border;
desktop cases also inspect the shared Entity identity page and compact variant.
The same identity checks measure 12px for direct 32px chain-badged marks and 8px
for their smaller variants, including the table and shared identity specimens.
Two Retina-emulation cases also check badge borders and optical edges;
both densities allow headless Chromium's measured half-pixel quantization.
No live wallet/chain gates,
screen-reader session or transaction execution
is claimed. The earlier horizontal-table regression remains on the overview's
compact information-row specimen, not this new stacked Table detail.

[Earn candidate](design-system/earn-family-lab-regressions.spec.ts) checks
Index/Yield opportunity states at 320/390/1400px in both themes, including
zero versus unavailable value/amount, independent wallet loading, Empty
recovery, nested governed-asset and rate-help actions, and non-executing row
boundaries. In-place 1023/1024px crossings retain sort/focus, close hidden
disclosures and restore focus after resized boundary dismissal.
Desktop checks pin descriptive-before-numeric column order and retained alignment
in both families/wallet states, plus long-content containment at 1024px.
Desktop known-zero wallet values retain 16px/300 supporting-text tone; nonzero
values keep the primary color. Mobile keeps Governs-left/TVL-right geometry
independent of wallet state and a 4px rate-label gap. Only non-zero or unknown
positions receive a left-aligned 14px/300 supporting line with an 8px label/value
gap and dot-separated amounts (44px split-footer RED, 20px ordinary line).
Long-amount fixtures check wrapping/containment; loading remains explicit.
Known-zero rows have no wallet footer. Sparse wallet positions renders
one funded row per family. Units distinguish raw presence from zero USD, unknown
and loading states, and preserve TVL's default tone. Presence is a local fixture
fact, not a verified production balance adapter.
[Earn recovery](design-system/earn-recovery-lab-regressions.spec.ts) additionally
pins row height through loading (23px-shift RED), inline mobile wallet placeholders
and retained right-aligned desktop placeholders,
and functioning disclosure observation after loading at 390/1400px.
[DeFi candidate](design-system/defi-family-lab-regressions.spec.ts) covers all
seven source fields in four desktop data columns plus a pool-action column, light/dark 320/390/1400,
1023/1024 container focus transfer,
separate keyboard pool/DefiLlama links, exact rate help, numeric sort and
loading/long/zero-unavailable/empty recovery. The grouped trial checks the
all-width seven-field sort menu, visible base/reward breakdown, combined APY help
and the relocated analytics link independently of the pool destination.
The DeFi identity is not a link and pins 32px horizontal stacked artwork with a 12px text gap.
Its fifth fixture is the three-token Curve ETH+/eUSD/RSR pool; actual image sources,
three-logo count, containment, equal 52px two/three-token footprints and matching
loading name axes are checked.
The varied RSR/WETH and ETH-based fixtures pin underlying-token artwork separately
from display labels, including Yearn's LP-token symbol, without new production adapters.
Desktop keeps the compact “View pool” action with an expanded 44px vertical target.
Phone uses a top-right 32px square external-link action with a 44px square target,
platform-specific accessible name/tooltip, keyboard destination, and no footer action.
Its expanded target stays clear of the identity, including long names. Pool identity includes the
12px chain icon/name in a 20px supporting line aligned beneath the token names;
constrained rows add dot-separated platform text with matching 12px artwork.
Desktop Platform retains the plain uncropped 20px mark, 16px/300 name and 8px gap.
Narrow APY/TVL facts use 4px label/value gaps; the Base/Rewards breakdown occupies
the full row width. A single toolbar APY-help control and separate 44px sort
target are checked for overlap, and help/analytics/pool focus survive the
1023/1024 projection change. Default rows stay at most 240px tall; per-row loading
height and name-axis continuity, long names and all rate values remain covered.
Tests pin both dimensions and line spacing, plus loading continuity.
The combined APY/arrow analytics link pins its 4px gap, unfilled underline hover,
24px line box with a separately expanded 44px target, no added breakdown gap,
right-edge alignment on desktop/left-edge alignment on phone, source-named tooltip,
Escape dismissal and keyboard destination. The help and label centers align.
Base/Reward sorting gives only that supporting rate foreground emphasis without
changing 14px/300 typography; changing to TVL clears the emphasis. Mounted tests
also cover Base/Reward selection, both directions and the explicit Total APY label.
[DeFi source](design-system/defi-source-capture.spec.ts) replays CMS-backed pool
identities with illustrative API values through the
fixture-owned exact DefiLlama pools route; other tests retain its empty default.
It observes the production 390/1400 layouts and APY/TVL descending order without
visiting external destinations. Neither suite proves live yield accuracy,
filtering, featured-pool cards or transaction execution.
[Index source](design-system/earn-index-source-capture.spec.ts),
[wallet source](design-system/earn-wallet-source-capture.spec.ts),
[vote-lock boundary](design-system/earn-drawer-source-capture.spec.ts), and
[Yield source](design-system/earn-yield-source-capture.spec.ts) use exact API,
subgraph and RPC overlays with strict unmocked-request checks and zero
transactions. They prove selected populated lists, Index loading/filtered-empty
recovery, governed disclosure/FAQ, a synthetic converted wallet amount and
drawer entry/dismissal—not live rates, full filtering, errors or transaction
execution. Yield's empty yield feed makes its 0% captures fixture artifacts.
See the [source-transfer brief](../docs/plans/design-system-table-family-earn-preparation.md).

The [independent table reconciliation](../docs/plans/design-system-table-family-reconciliation.md)
pins Holdings' newly selected descending header direction with concrete CMC20
leader/laggard order in the lab and source checks. Separate mobile direction
selection remains independent of field selection. [Holdings sort continuity](design-system/holdings-sort-continuity-lab-regressions.spec.ts)
pins explicit ascending → field change → 767/768px crossing → new descending
header selection → phone, including actual row order and focus in both themes.
Production viewer ownership,
page loading/error, near-zero sign and large-list automatic-comparator coverage
are adoption gaps, not implied by green lab checks.

[Transaction review canvas](design-system/transaction-review-canvas.spec.ts)
checks navigation hit-testing over scrolled transaction previews, edge-to-edge
Stake/Vote Lock backdrops at phone/desktop widths, and contained tall previews.
These checks protect lab framing, not production overlay behavior.

The separate `playwright.design-system.config.ts` suite includes
[manual anchors](design-system/manual-anchors.spec.ts): Mint/Redeem layout
previews in light/dark at 320–1280px, including column-breakpoint containment,
24px text axes and between-row content gaps, matched 16px/24px identity and primary-value typography, 8px control edges, 32px token marks, address visibility, 16px above/below the Mint approval setting versus an 8px direct Redeem action gap, and stable row geometry/non-overlapping labels across insufficient-balance transitions. Fixture interactions
live in the focused Manual unit tests; the mounted checks also pin the V1
checkbox's 28px slot/20px mark, keyboard toggling, and over-balance/long-value
Redeem containment.
They also verify equal desktop column surface heights without stretching task
contents, scroll access to an overflowing ledger, and natural-height stacked
columns with a 2px seam on mobile. Lifecycle checks pin the lab-only 736px desktop
workspace height across all states.

[Manual lifecycle](design-system/manual-lifecycle.spec.ts) exercises all 29 lab
states in light/dark at 320/390/1024/1280px, plus a non-preset Mint journey through
partial approval failure, individual USDT Revoke/Approve, final rejection,
recovery, outcome, and reset. Independent per-token progress and finite/max
allowance policy are reducer-tested. These are simulated lab transitions, not
production wallet or on-chain verification.

[Issuance stage emphasis](design-system/issuance-stage-emphasis.spec.ts) checks
Manual and Automated current-stage semantics and computed label/value colors in
light/dark at 320/390/1280px. It distinguishes complete permissions from sufficient
collateral, preserves available approvals with an input-level balance message,
and checks neutral completion text with a small success check. Manual's final
summary uses the same responsive headline typography and label gap as the amount
and approval count, rather than a duplicate amount. Geometry checks straddle
the 360px and 640px text breakpoints. Its explanation
has a 24px gap to the ordinary action, or 16px to a recovery message followed by
an 8px message/action gap.
Reducer/unit checks cover empty/loading inputs,
permission progress, insufficient balances despite complete allowances, and the
no-swaps path without a fabricated filled-order check.

[Manual mobile](design-system/manual-mobile.spec.ts) also checks that permission
and received-value blocks remain beside token identity, visible address text is
not clipped, approval transitions preserve row geometry, and Switch to Zapper
shows an honest lab preview without changing the manual amount. Recovery copy
is checked in the mounted journey because the unit harness stubs Lingui Plural.

[Automated entry](design-system/automated-entry.spec.ts) verifies that the neutral
Swap guidance icon has a nontransparent, distinct circle fill in both themes at
desktop/mobile widths, retaining the same 32px height as its adjacent action.

[Issuance outcomes](design-system/issuance-outcomes.spec.ts) compares Automated
and Manual Mint/Redeem in light/dark at 320/390/1024/1280px: full desktop column
height, flexible brand region, default-sized footer actions 8px from the bottom,
width containment, and a single final-transaction footer link without a hash row.
Both blue result regions retain 24px below the visible fiat row.
Transaction controls additionally verify keyboard access, secure new-tab footer
navigation, and compact header restart geometry in both families. Automated
restart returns to empty configuration in the same operation; unit checks also
preserve Base/BSC and clear completed state. Manual retains its simulated
explorer destination and existing header restart/reset.

[Transaction action loading](design-system/transaction-action-loading.spec.ts)
checks Zapper signing, Vote-lock/Stake/Manual approvals and Automated collateral
authorization in both themes at 320/390/1280px. Active actions retain primary
emphasis, a visible animated spinner and busy/disabled semantics; Manual's
separate upcoming action stays neutral and non-busy.

[Transaction accessibility](design-system/transaction-accessibility.spec.ts)
checks initial-shell Shift+Tab containment, Escape/focus return and keyboard
reopening for the Vote Lock/Stake lab modal wrapper. It also verifies reduced
motion for Zapper/Vote Lock/Stake committed logos and Zapper outcome attachments.
This does not establish a complete keyboard-only issuance journey or reduced
motion for the pre-existing shared Button spinner.
Manual's three-section Mint checks compare amount/progress typography and the
readiness-led final region, without a duplicate amount or wallet/chain phase.
They verify stable final-section geometry across readiness/signing/confirmation
and pin edge-to-edge 2px connected-arrow boundaries,
24px label insets, 8px horizontal action insets and arrow/button clearance.
The route alternative is verified inside the first section; factual approval
help is exercised through its tooltip. The final Mint action is
present but gated until approvals and balances are sufficient. The readiness check verifies compact completion without hidden controls; the
final explanation/action gap is 24px and both desktop review hosts have equal dimensions.
Redeem remains a direct action without a permissions section.
Manual's non-preset completion journey also checks that its USD share estimate scales
with the entered amount rather than reverting to a fixed fixture value.

[Manual mobile](design-system/manual-mobile.spec.ts) compares asset/quantity
positions through approval signing, confirmation, and completion at seven
widths from 320 to 1024px. Short/landscape viewports cover amount entry, contained
approval help, retained amount on mode change, and reachable main/last-row
controls. This is browser viewport coverage, not a native keyboard test.
Its readiness journey additionally verifies that completed approvals compact
without reserving hidden controls, then restores Unlimited-off on increased
requirements; finite aggregate and individual USDT behavior remain unchanged.
The readiness-summary checks also cover Spanish, Korean and Chinese at
320/1024px, verifying translated labels and non-clipping text in approvals,
ready and in-progress states.

[Zapper layering](design-system/zapper-layering.spec.ts) checks that the lower
half of the direction control remains above the output during Review and Quote
search at 320/390/1280px in both themes, including its disabled search state.

| Area                        | Spec file(s)                                                                                                                                                                                                                               | States covered                                                                                                                             | Lifecycle     | Mobile                                    | Gaps                                                                                                                                                                                        |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bridge                      | [general/bridge/render](tests/general/bridge/render.spec.ts)                                                                                                                                                                               | static page render                                                                                                                         | none (static) | yes                                       | —                                                                                                                                                                                           |
| Discover                    | [general/discover/lifecycle](tests/general/discover/lifecycle.spec.ts), [flows/home-discover](tests/flows/home-discover.spec.ts)                                                                                                           | skeleton→rows; search narrow/restore; tab switch; row→overview nav; home hero+featured render                                              | partial       | no                                        | —                                                                                                                                                                                           |
| Earn                        | [general/earn/render](tests/general/earn/render.spec.ts), [general/earn/tabs](tests/general/earn/tabs.spec.ts)                                                                                                                             | DeFi tab empty-state render; index-dtf vote-lock tab render; yield-dtf staking tab render (disconnected empty-state)                       | none          | yes                                       | sort, non-empty list, error state                                                                                                                                                           |
| Explorer                    | [general/explorer/render](tests/general/explorer/render.spec.ts)                                                                                                                                                                           | transactions tab (default) render; governance tab proposals render; one chain returning malformed transactions body doesn't blank the page | none          | no                                        | filters, pagination, tokens/collaterals/revenue tabs                                                                                                                                        |
| Portfolio                   | [general/portfolio/state-space](tests/general/portfolio/state-space.spec.ts), [general/portfolio/partial-response](tests/general/portfolio/partial-response.spec.ts), [owned source](design-system/owned-positions-source-capture.spec.ts) | disconnected prompt; malformed proposal isolation; synthetic owned stake/vote-lock values; held/zero/decode-failed underlying read         | none          | partial, including held phone source read | account switching and Modify execution; rewards/voting-power/activity interactions; empty-vs-past-activity-only. [Coverage audit](../docs/plans/design-system-portfolio-coverage-review.md) |
| Tokens                      | [general/tokens/unlisted-partial](tests/general/tokens/unlisted-partial.spec.ts)                                                                                                                                                           | one chain returning an rtokens-less bucket doesn't crash the table                                                                         | none          | no                                        | plain listed-table render, sort                                                                                                                                                             |
| Create (Index/Yield deploy) | —                                                                                                                                                                                                                                          | —                                                                                                                                          | —             | —                                         | entirely uncovered                                                                                                                                                                          |

## Index DTF (`/:chain/index-dtf/:tokenId/*`)

| Area                                 | Spec file(s)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | States covered                                                                                                                                                                                                                                                                                                                                                               | Lifecycle         | Mobile                                      | Gaps                                                        |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ------------------------------------------- | ----------------------------------------------------------- |
| Overview                             | [overview/lifecycle](tests/index-dtf/overview/lifecycle.spec.ts), [overview/state-space](tests/index-dtf/overview/state-space.spec.ts), [overview/edge-cases](tests/index-dtf/overview/edge-cases.spec.ts), [flows/overview](tests/flows/overview.spec.ts), [flows/overview-edge](tests/flows/overview-edge.spec.ts), [flows/dtf-nav-state-cleanup](tests/flows/dtf-nav-state-cleanup.spec.ts), [flows/reload-chain-identity](tests/flows/reload-chain-identity.spec.ts)                                                                                                                                                                                                                                                                                                                         | hero L1→L3 no-reflow; chart island resolves independently; deprecated badge; holdings/mcap framings; empty/single-point/0-supply chart; SPA cross-chain nav (symbol, stat-card cleanup); full-reload cross-chain query-chain correctness                                                                                                                                     | full (hero+chart) | yes (index-dtf/ specs); flows/ desktop only | fixme below (Market Cap datatype)                           |
| Issuance – Zap                       | [issuance/zap-render](tests/index-dtf/issuance/zap-render.spec.ts), [issuance/compliance](tests/index-dtf/issuance/compliance.spec.ts), [flows/zap-buy-sell](tests/flows/zap-buy-sell.spec.ts), [flows/zap-edge](tests/flows/zap-edge.spec.ts), [flows/failures-zap](tests/flows/failures-zap.spec.ts)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | widget+buy panel+direction flip render; geo-restriction gates trade surface; buy/sell full tx flow; high-impact warning+ack gate (impact pinned into the [5%, 8%) window; >8% is toxic-filtered); dead quote round = silent sourcing + recovery; insufficient-funds gating (quote resolves, submit disabled); reject/revert on buy and sell                                  | none              | partial (render+compliance only)            | —                                                           |
| Issuance – Manual                    | [issuance/manual-write](tests/index-dtf/issuance/manual-write.spec.ts), [flows/issuance-manual](tests/flows/issuance-manual.spec.ts), [flows/issuance-manual-boundaries](tests/flows/issuance-manual-boundaries.spec.ts), [flows/issuance-deprecated](tests/flows/issuance-deprecated.spec.ts), [flows/failures-issuance](tests/flows/failures-issuance.spec.ts), [flows/compliance-surfaces](tests/flows/compliance-surfaces.spec.ts)                                                                                                                                                                                                                                                                                                                                                           | mint/redeem full tx flow; MAX/minSharesOut/decimal-truncation/disabled-input math boundaries; mint-twice no re-approve; deprecated forces sell-only; reject/revert recovery; per-DTF restriction disables mint, redeem stays open                                                                                                                                            | none              | no                                          | fixme below (redeem zero-slippage leg)                      |
| Issuance – Automated (CoW)           | —                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | —                                                                                                                                                                                                                                                                                                                                                                            | —                 | —                                           | entirely uncovered, no testids yet                          |
| Governance – list/overview           | [governance/lifecycle](tests/index-dtf/governance/lifecycle.spec.ts), [governance/photon-featured](tests/index-dtf/governance/photon-featured.spec.ts)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | list skeleton→proposals; real captured proposal history renders                                                                                                                                                                                                                                                                                                              | partial           | yes                                         | —                                                           |
| Governance – vote-lock drawer        | [flows/vote-lock-drawer](tests/flows/vote-lock-drawer.spec.ts)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | unlock submits `redeem(shares, account, account)` with previewRedeem-quoted output (self-appreciating rate); lock tab shows previewDeposit shares-out quote                                                                                                                                                                                                                  | none              | no                                          | delegate tab; lock full tx (approve+deposit); reject/revert |
| Governance – proposal (view/vote)    | [flows/governance-states](tests/flows/governance-states.spec.ts), [flows/governance-multichain](tests/flows/governance-multichain.spec.ts), [flows/governance-permissions](tests/flows/governance-permissions.spec.ts), [flows/governance-support-variants](tests/flows/governance-support-variants.spec.ts), [flows/governance-vote](tests/flows/governance-vote.spec.ts), [flows/governance-queue-execute](tests/flows/governance-queue-execute.spec.ts), [flows/governance-writes-v4](tests/flows/governance-writes-v4.spec.ts), [flows/failures-governance](tests/flows/failures-governance.spec.ts), [flows/governance-description-render](tests/flows/governance-description-render.spec.ts), [governance/vote-modal-long-title](tests/index-dtf/governance/vote-modal-long-title.spec.ts) | PENDING/DEFEATED/QUORUM_NOT_REACHED/EXECUTED/QUEUED states (×chains, v4 governor); For/Against/Abstain vote encode; zero-power/already-voted/window-closed CTA gating; canceller-gated cancel; vote/queue/execute full tx + reject/revert; markdown sanitizer XSS hardening (script/iframe/img-onerror); address-length title stays inside the vote modal (desktop + mobile) | none              | yes (vote modal)                            | optimistic governance flow (see gaps)                       |
| Governance – create Basket           | [flows/governance-propose-basket](tests/flows/governance-propose-basket.spec.ts)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | form renders current basket; empty-change guard blocks prepare                                                                                                                                                                                                                                                                                                               | none              | no                                          | price/liquidity preview, submitted calldata assertion       |
| Governance – create DTF Settings     | [flows/governance-propose-dtf-settings](tests/flows/governance-propose-dtf-settings.spec.ts)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | TVL fee / Mint fee round-trip into setter calldata; unchanged invalid distribution state does not block an unrelated mandate proposal; no-change keeps confirm disabled                                                                                                                                                                                                      | none              | no                                          | —                                                           |
| Governance – create Basket Settings  | [flows/governance-propose-basket-settings](tests/flows/governance-propose-basket-settings.spec.ts), [governance/fee-bounds](tests/index-dtf/governance/fee-bounds.spec.ts)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | voting-period round-trips setVotingPeriod calldata (trading governor); single-action guard (no phantom threshold); no-change disabled; out-of-range TVL fee rejected                                                                                                                                                                                                         | none              | no                                          | —                                                           |
| Governance – create DAO (Other)      | [flows/governance-propose](tests/flows/governance-propose.spec.ts)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | DAO-settings proposal full submit flow                                                                                                                                                                                                                                                                                                                                       | none              | no                                          | —                                                           |
| Auctions – rebalance list            | [auctions/lifecycle](tests/index-dtf/auctions/lifecycle.spec.ts), [flows/auctions](tests/flows/auctions.spec.ts), [flows/auctions-multichain](tests/flows/auctions-multichain.spec.ts)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | list skeleton→list; idle/historical bucketing; auctions-less 0-metrics row; in-window active row (×chains)                                                                                                                                                                                                                                                                   | partial           | yes (lifecycle spec only)                   | —                                                           |
| Auctions – rebalance detail + writes | [auctions/launch-price-guard](tests/index-dtf/auctions/launch-price-guard.spec.ts), [auctions/launch-write](tests/index-dtf/auctions/launch-write.spec.ts), [flows/auctions](tests/flows/auctions.spec.ts)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | active detail from encoded `getRebalance()`; expired→completed card; price-error / single-0-price blocks launch; launcher `openAuction()`; non-launcher-in-permissionless-window `openAuctionUnrestricted()`                                                                                                                                                                 | none              | no                                          | legacy v2 auctions UI, bid writes                           |
| Settings / Roles                     | [settings/lifecycle](tests/index-dtf/settings/lifecycle.spec.ts), [settings/distribute-fees](tests/index-dtf/settings/distribute-fees.spec.ts), [settings/fee-edge](tests/index-dtf/settings/fee-edge.spec.ts), [flows/settings](tests/flows/settings.spec.ts)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | roster skeleton→roster; any-wallet `distributeFees()`; platformFee=100 shows Unavailable not a fabricated split; snapshot-scaled fee %s; registry-read-failure→UNAVAILABLE; zero-denominator/zero-numerator edges; public roles roster; governance cards; disconnected hides submit control                                                                                  | partial           | yes (lifecycle only)                        | —                                                           |
| Manage                               | [manage/render](tests/index-dtf/manage/render.spec.ts)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | form renders offline                                                                                                                                                                                                                                                                                                                                                         | none              | yes                                         | SIWE→upload→save write flow                                 |
| Factsheet                            | [factsheet/render](tests/index-dtf/factsheet/render.spec.ts)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | renders offline                                                                                                                                                                                                                                                                                                                                                              | none              | yes                                         | performance math (CSV, inception clamp)                     |

## Yield DTF (`/:chain/token/:tokenId/*`)

| Area             | Spec file(s)                                                                                                                                                                                                                                                                     | States covered                                                                                                     | Lifecycle | Mobile                          | Gaps                                            |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | --------- | ------------------------------- | ----------------------------------------------- |
| Overview         | [overview/render](tests/yield-dtf/overview/render.spec.ts)                                                                                                                                                                                                                       | renders offline from captured RPC+subgraph                                                                         | none      | yes                             | edge cases (empty/error chart)                  |
| Issuance         | [issuance/state-space](tests/yield-dtf/issuance/state-space.spec.ts)                                                                                                                                                                                                             | active DTF: mint+redeem panels; mint-paused DTF: redeem-only, no mint panel                                        | none      | yes                             | zap variant, write flow                         |
| Staking          | [staking/render](tests/yield-dtf/staking/render.spec.ts), [staking/history-partial](tests/yield-dtf/staking/history-partial.spec.ts), [staking/stake-write](tests/yield-dtf/staking/stake-write.spec.ts), [staking/unstake-write](tests/yield-dtf/staking/unstake-write.spec.ts) | exchange-rate+APY render; staked-history survives a snapshots-less response; `stake()`/`unstake()` submit to stRSR | none      | partial (render + history only) | withdraw, cancel, cooldown-vs-available         |
| Governance       | —                                                                                                                                                                                                                                                                                | —                                                                                                                  | —         | —                               | entirely uncovered                              |
| Auctions         | —                                                                                                                                                                                                                                                                                | —                                                                                                                  | —         | —                               | entirely uncovered                              |
| Settings / Roles | —                                                                                                                                                                                                                                                                                | —                                                                                                                  | —         | —                               | entirely uncovered (pause/freeze writes, roles) |

## Smoke tier (`e2e/tests/smoke/`, fast per-diff confidence check)

Cross-cutting offline renders reused as the fast gate (`pnpm e2e:smoke`), not
additional state coverage: [boot](tests/smoke/boot.spec.ts) (home shell),
[home](tests/smoke/home.spec.ts) (discover table), [overview](tests/smoke/overview.spec.ts)
(×3 chains), [dtf-data](tests/smoke/dtf-data.spec.ts), [issuance](tests/smoke/issuance.spec.ts),
[zap](tests/smoke/zap.spec.ts), [governance](tests/smoke/governance.spec.ts),
[auctions](tests/smoke/auctions.spec.ts), [settings](tests/smoke/settings.spec.ts),
[yield-overview](tests/smoke/yield-overview.spec.ts), [yield-issuance](tests/smoke/yield-issuance.spec.ts),
[yield-staking](tests/smoke/yield-staking.spec.ts).

## Known gaps

- Optimistic governance: no dedicated flow test. Existing specs pin
  `isOptimistic: false`; `governance/photon-featured.spec.ts` documents that
  none of its 8 captured proposals are optimistic, so the badge/tally path is
  unexercised.
- Automated (CoW) issuance wizard: zero specs, zero testids.
- Legacy v2 auctions UI and bid writes: no specs.
- Yield DTF governance, auctions, and settings/roles: no specs at all (no
  `yield-dtf/governance|auctions|settings` dirs exist).
- Create Index DTF / Create Yield DTF deploy wizards: no specs.
- Explorer: only 3 of the tab surfaces render-tested (transactions, governance,
  malformed-body edge); tokens/collaterals/revenue tabs, filters, and
  pagination are untested.
- Portfolio: current stakes/vote-locks now have a separate design-system source
  capture with synthetic account amounts. No broad connected Portfolio lifecycle,
  account-switching, rewards/voting-power/activity or Modify write proof is claimed.
- Mobile: only tagged in `general/`, `index-dtf/`, and `yield-dtf/` render/
  lifecycle specs. The entire `flows/` directory (30 specs — all governance/
  auction/issuance write and edge-case behavior) and all of `smoke/` have zero
  `@mobile` coverage.

## Active fixmes (2)

- `tests/index-dtf/overview/edge-cases.spec.ts:22` — Market Cap data-type
  shows the market cap, not the unit price. Reason: `chart-overlay.tsx` always
  reads the unit-price atom for the hero value, so switching the chart
  data-type doesn't change the hero.
- `tests/flows/issuance-manual-boundaries.spec.ts:407` — redeem must never
  ship zero slippage protection on a leg. Reason: a low-rate/low-decimal asset
  (e.g. cbBTC) can round its required amount to 0 below a dust threshold,
  collapsing the 5% floor to 0 and silently removing that leg's slippage
  protection; engineer must pick enforce-nonzero-floor vs. block-the-redeem.
