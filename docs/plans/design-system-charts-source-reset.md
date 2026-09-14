# Chart review — source-faithful reset

Status: ready for human visual review, not adopted. Fixed point `289b2af86` plus the inspected inherited
worktree. This supersedes the generic compact/card/full compositions as proposed
product replacements; earlier receipts remain historical. The V1 conformance
correction below supersedes the initial reset's literal legacy host framing.

## Contract

The user wants to preserve the successful Overview line chart and Home highlight
cards, harden their presentation, then bring other charts into that family. The
approved local improvement is hover/touch/keyboard inspection updating the header
instead of a floating tooltip. Product calculations, source selection, available
periods, live reconciliation and chart-type defaults are not changed.

One product-renderer source change is an optional `PriceChartBody.onInspect`
callback: finite values from the existing event payload feed a caller-owned
readout; keyboard inspection is enabled only when supplied. Existing production
callers keep their tooltip. The lab owns focus, accessible output and restoration.
Recharts' touch-start path supplies its existing mouse-down payload directly;
the optional readout must not depend on emulated mouse-move events after a tap.
Hover and keyboard use Recharts' mouse-move callback. The Tooltip stays mounted
with null content in the opt-in mode, but its transient active state is not a
second authority over the header. Lab touch handling suppresses compatibility
mouse/focus events; native mouse-pointer exit and keyboard blur restore the header.
This opt-in seam and the cross-feature imports require engineer review before
adoption; there is no production-page migration in this stage.

The later `launchMarkerVariant="annotation"` opt-in applies V1 text treatment to
the existing static launch marker. Production callers omit it and retain the pill;
launch timestamps, chart domains and pre/post-launch segmentation are unchanged.

One implementation owner. Medium, one bounded UI stage; no repository checkpoint.
Project-required Light/Intent and Dark/Risk review runs read-only after the first
rendered candidate, while the owner verifies/types/documents. No competing design
candidate: a generic replacement has already been rejected by the user.

## Usage and transfer

1. Inspect a 90×40 Discover plot in a realistically sized cell, without invented
   price/name/period information. Cell padding is host context, not chart policy.
2. Compare the highlighted-card chart using its real identity/price/return
   arrangement and edge-to-edge plot. Prefer existing presentation owners.
3. Inspect the Overview line chart with its large identity, compact financial
   row, 332px desktop plot, six time labels, five price labels and historical
   annotation. Hover updates the selected value/date without calculating a new
   return. Compare the same supplied series in current-rendering and proposed
   inspection modes. Explicitly identify any frozen context controls.
4. Review pressure states separately as plot/inspection tests, not alternative
   product layouts. Loading/missing/zero/estimate/gap states stay supplied facts.

## Ownership and geometry

- Plot line/fill, axes and inspection are in scope. Shared palette unchanged.
- Overview uses the canonical 32px page-title and 16px body roles on a flat square
  surface, with a 24px header/footer content inset. Source height 288/332px and
  desktop axes remain; the edge-to-edge plot does not inherit content padding.
- Narrow lab financial groups wrap instead of overlapping; the frozen footer
  responds to the specimen width, not the desktop viewport. These local fixes
  are explicit candidate improvements, not shared/product default changes.
- Phone inspection reserves the two-line financial slot, keeping the plot's
  position fixed while the value/date replaces the resting summary.
- Home uses the accepted square outer shell, 8px shell inset/contained-media
  corners, 24px content axis, 16px logo-to-name and 8px name-to-market gaps.
  Its 20px panel-title/16px body roles and canonical ChainBadgedLogo replace
  legacy type and badge styling. No hidden title-height reservation. The 208px
  plot remains edge-to-edge within the media; this is not chart-owned padding.
- Discover uses its 90×40 plot. The prior 112×48 sample was the small card size,
  not the Discover table size. These must not be conflated.
- The lab preview frame and notes remain outside each product surface.
- Source replay controls/values are context, never claims about current live
  availability. Unimplemented product flows are named rather than fake-wired.

## Evidence and boundaries

Read source: Overview `chart-overlay`, `price-chart-body`, `price-chart-defs`,
`price-chart-series`, `price-chart-footer`; Home `feature-card-header`,
`constants`, `performance-chart`; Discover `index-dtf-table-columns`.
Use dated captured series from Claude's September 13 audit; retain provenance
and supplied observations. No new financial formatter or return derivation.

Visible pressure rubric: faithful hierarchy, realistic geometry, axis context,
explicit host insets, honest annotations, keyboard/touch and zero/missing values.
Phone/long-value is visible pressure, not a held-out test. RED browser regression
pins the wrong compact content/size and missing full-axis labels before edits.
Fresh focused browser proof at 320/390/768/1400, two themes, source/candidate
comparison, supplied input fidelity, units/types/lint/wiki and inspected renders.
No broad gate, install, commit, production adoption, new tracking or SDK changes.

Historical generic-fixture proof (not proof for the source renderer): 17/17
chart/navigation cases, 39/39 fixture/catalog/hygiene units; inspected keyboard
range-focus, estimated qualifier, touch, zero/missing/gaps and reduced motion.
That composition was rejected as a product replacement and its superseded plan
is removed. The generic renderer remains only in the collapsed pressure section.

Engineer review remains required before production adoption, with the existing
[financial/data questions](design-system-overnight-2026-09-14/chart-engineering.md)
unchanged. Visual approval is separate from source correctness.

## Review reconciliation

- Light and Dark confirmed narrow ticker/return collision and constrained-footer
  overflow. Fixed locally with wrapping and specimen-width footer layout; both
  reviewers inspected settled phone/constrained captures in both themes and cleared
  those findings.
- Dark confirmed absent keyboard focus/readout. The lab now supplies a focus ring
  and atomic accessible output. Shared ChartContainer defaults are unchanged.
- Apparent curve overflow/truncation in early captures was a Recharts JavaScript
  resize animation, not settled geometry. Capture preparation now polls actual
  SVG width and curve extent against the plot boundary before recording evidence.
- Real source touch tests were added separately from generic pressure touch proof.
  Mode round trips exposed competing tooltip-active and compatibility mouse events;
  direct event callbacks now report samples, with lab-owned native-pointer exit
  and blur restoration. The existing
  tooltip's first-touch behavior is not being hardened or newly certified.
- Reviewer-requested narrow inspection-position proof exposed a two-pixel inline
  return baseline difference; explicit flex alignment retains the same slot height.
- Prior broad fixture/catalog checks had one stale queue-copy expectation; the
  paused transaction/deferred-auction boundary was restored, not weakened.

## Remaining review boundary

The user still needs to review this source-based visual direction. Frozen period
and chart-type labels are context only, not interactive migration implementations.
Other Overview modes, candles, signed bars and composition need their own review.
Overview's existing draw animation/reduced-motion behavior is retained, not hardened.
The source-backed raw capture preserves duplicate timestamps and independent
headline capture dates; production's existing dedupe/live-point policy is not copied
into the lab or replaced. Financial questions remain separately engineer-owned.

## Initial reset verification — September 14 (historical framing)

This receipt predates the V1 frame correction below. It remains evidence for the
source reset, not proof that the copied card framing conformed to V1.

- Exact chart/lab browser run: **20/20**, no retries, skips or flaky results.
  All eleven chart-source attachments match
  `095a1eb34e48da2bec74b1f5ad751dff9215ad96a1058c799d57c38dc8e9f5d5`;
  the other nine checks cover retained lab navigation. Every attached source file
  was rehashed against the final tree after the run; no drift.
- Source hover/keyboard and native touch tests each repeated three times: **6/6**.
  Touch checks both value and timestamp after the hold and mode round trip,
  unchanged plot position, and native page scrolling. The selected-state capture
  avoids the general helper's intentional mouse-exit reset.
- Existing production Overview compatibility checks: **6/6** on isolated 3048,
  including chart range switching, empty/single-point history and retained
  holdings/inactive checks. This is bounded compatibility proof, not a full
  production chart certification.
- Fixture/catalog/hygiene/payload units **43/43**; app/E2E type checks, scoped
  formatting/lint/diff and wiki lint green. Independent source captures were
  checksum-checked and all 252 Home / 257 Overview pairs compared exactly.
- Source-faithful desktop, phone, constrained and Home captures were inspected
  in both themes; selected phone readout inspected separately. Light/Intent and
  Dark/Risk findings and the final event ownership were reconciled above.
- [Compact receipt and hashes](design-system-charts-source-reset/receipt.json).
  [Desktop Overview](design-system-charts-source-reset/evidence/charts-light-1400.png),
  [constrained dark](design-system-charts-source-reset/evidence/charts-constrained-dark.png),
  [Home/Discover context](design-system-charts-source-reset/evidence/charts-home-light-1400.png),
  [selected phone](design-system-charts-source-reset/evidence/charts-source-touch.png).
  Nine curated images; broad report remains in ignored `test-results`.

The owned 3047/3048 test servers stopped. The user's 3005 server was not restarted;
its existing tab was refreshed and left on the source-based review. No commit,
checkpoint, install, production migration or financial-policy change. The prior
generic-review plan was consolidated here; no competing current review plan remains.

## V1 conformance correction — September 14

User feedback confirmed that source preservation had been applied too literally
to legacy wrappers, and the Current Review radius claim was wrong. Accepted
foundations and the August 18 Home card decision govern framing; production
supplies the chart strengths and mechanics, not permission to override V1.

Low, isolated lab presentation pass; self-review, no new shared/default or
production-renderer change. Applied the ownership rules above, neutral semantic
identity/price text, and canonical badge/type owners. The Home gradient remains
retained contained-media treatment; its 8px media radius is deliberate, not a
rounded outer card. Plot lines, fills, axis policy, inputs and inspection code
are unchanged. Frozen footer labels still demonstrate placement rather than
being certified interactive V1 controls; broader plot-style decisions remain
the chart review's purpose.

The focused regression first failed on the mounted Overview's 20px outer radius
against the accepted 0px role. Fresh conformance, geometry, both-theme responsive
and actual source inspection/touch checks cover this correction. Older captures
above are historical; the conformance receipt records the new source identity.

Final focused browser checks **6/6**, units **43/43**, app/E2E types and scoped
lint/format/diff pass. Desktop/Home light, phone, dark constrained and the refreshed
3005 surface were inspected. The source chart renderer/helper hashes match the
initial reset; no behavior change was folded into this correction.
[Host conformance receipt (before launch-label refinement)](design-system-charts-source-reset/conformance/receipt.json),
[Overview](design-system-charts-source-reset/conformance/charts-light-1400.png),
[Home](design-system-charts-source-reset/conformance/charts-home-light-1400.png),
[phone](design-system-charts-source-reset/conformance/charts-light-320.png).
The isolated 3047 runner stopped; 3005 stays running. No checkpoint or commit.

## Launch annotation refinement — September 14

User-requested, low/domain presentation-only pass. The marker is static, not an
action: use unboxed 12px V1 auxiliary text, foreground for `DTF Launch` and
supporting color for `Est. Historical Price ✱`. Keep the label centered beneath
the original dashed timestamp line, with a small gap and separate caption. No
new pill, tooltip, click target or financial behavior. Home's interactive token
marker is a different control and remains unchanged.

The source renderer exposes an optional presentation variant; existing line and
candle callers keep their original default. This limited domain-file radius is
not a shared-default or money-logic change: self-review and focused source proof
are appropriate. **Engineer review required before production adoption**, including
long translations and launch positions near chart-domain edges. Current bounded
proof does not certify all production locales or states.

RED: the new mounted regression expected V1 12px annotation text and received the
old 10px pill. GREEN pins static text, no pointer interception, line centering,
caption separation and chart containment at 320/390/1400. Fresh final checks and
curated renders are recorded in the annotation receipt; earlier screenshots show
their historical stages, not the latest launch treatment.

Final browser checks **7/7**, retained Overview compatibility **6/6**, units
**43/43**, app/E2E types and scoped lint/format/diff pass. All seven source
attachments match the final rehashed tree. Desktop/phone light and constrained
dark inspected; 3005 refreshed, isolated 3047/3048 servers stopped.
[Annotation receipt](design-system-charts-source-reset/annotation/receipt.json),
[desktop](design-system-charts-source-reset/annotation/charts-light-1400.png),
[phone](design-system-charts-source-reset/annotation/charts-light-320.png),
[dark constrained](design-system-charts-source-reset/annotation/charts-constrained-dark.png).
The fixed-point scope scan includes 3,566 inherited files and recommends a high
profile for that whole tree; this bounded follow-up changes only the documented
domain presentation seam and its lab/tests. No whole-tree acceptance is claimed.
