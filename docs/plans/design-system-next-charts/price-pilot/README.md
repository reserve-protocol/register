# Yield Price pilot — implementation receipt

September 15, 2026, including the user-approved follow-up refinements. Slice 1
only; prepared for human review, not accepted or
adopted. The [revision plan](../revision-plan.md) owns authorization and the
remaining slices. This receipt does not establish a chart-family rule.

## Scope and ownership

- [YieldPricePilot](../../../../src/views/internal/design-system/charts/next-families/yield-price-pilot.tsx)
  owns the isolated Price readout, unchanged range/CSV selection semantics,
  keyboard selection and exit restoration.
- [YieldPricePlot](../../../../src/views/internal/design-system/charts/next-families/yield-price-plot.tsx)
  owns this pilot's measured axes and existing Recharts selected-point payload.
- [Review wiring](../../../../src/views/internal/design-system/charts/next-families/review.tsx)
  adds a plain, maximum-672px lab context before the unchanged earlier examples;
  their explicit unrevised label prevents implied rollout.
- Shared MetricLineChart, Portfolio, Overview, Home, candles, fixtures,
  formatting/range/export helpers, production owners and shared defaults were
  not edited by this worker. Preview wiring is unchanged. The coordinator
  independently compared its seven protected-file hashes with its starting
  snapshot and reported them unchanged.

No analytics event was added: this is isolated lab presentation, not a product
interaction or adoption. No dependency install, commit, push, server restart,
or user-browser manipulation was performed. An isolated preview on port 3043
was used; sandbox connection restrictions are not evidence that 3005 was down.

## Presentation and preservation

The candidate has no beige substrate, icon, border or rounded host. Its plain
`surface.content` background belongs only to the review wrapper, explicitly
labeled “Review surface only—host card not included.” No border, shadow,
or radius is applied. Following human review, the wrapper now owns 24px top
and bottom padding; it adds no horizontal padding to the chart's existing
24px content inset. Control hit areas and plot geometry remain unchanged.
This is review-surface spacing, not a universal chart or host-card rule.
External provenance, coverage and unsupported-touch notes use 14px. The 672px lab
cap reflects a single Yield chart rather than stretching a 208px plot into an
Overview-width composition; it is not a new universal host width.

Price uses supporting 14/20. The financial row is `$1.137 · hyUSD`, using body
16/24 with primary financial value, muted ticker and muted decorative dot.
The dot is hidden from assistive technology and has equal 8px gaps on both sides.
The ticker remains visible during inspection. Explicit `USD per hyUSD` meaning
remains in the accessible live readout and external lab context, not as a
dominant inline caption. The date uses supporting 14/20 on its own
line, with just a 20px line-height reservation so the plot does not move. There
are no fixed-width value/date fields or heading recipes on the financial data.

The candidate owns one 24px horizontal content inset. Y labels are end-anchored
at the same right edge as the footer control box. Their 52px lane contains the
largest captured label measured at 40.86px plus breathing room; the old 64px
axis/20px margin combination is not inherited. The first X label is start-anchored
at the actual first timestamp and the final label end-anchored at the actual last
timestamp. At 672px a middle captured timestamp is shown; phone widths show the
two endpoints. Interior data, timestamp positions, domain, automatic Y scale,
monotone interpolation, plot height and axis precision remain unchanged.

The existing captured hyUSD source has 29 default points and seven points in
the 7D range. Its history covers only 27 Jul–24 Aug 2026. The retained 1Y choice
cannot add missing history; the external note states this explicitly and the
test proves its 29-point curve is identical to the default captured curve.
24H remains disabled with its existing accessible title; its visible capture
limitation now lives outside the candidate, leaving only controls in the footer.

The resting headline retains the captured latest value at three-decimal
precision. Inspection now uses the existing four-decimal maximum price formatter
in this pilot only. For example, captured timestamps `1785122241` and `1785276971`
were both displayed as `$1.137`; they now display `$1.1372` and `$1.1371`.
This distinguishes these steps, not every possible point. Axis formatting
remains the existing four-decimal maximum. CSV retains the exact captured string
values and row order, range filter and filename. No new financial derivation,
touch mapping or data abstraction was introduced.

### Exact 12px inventory

Only two authored type uses in the new pilot are 12px:

| Owner / role                      | Rendered occurrences                   | Evidence                                                              |
| --------------------------------- | -------------------------------------- | --------------------------------------------------------------------- |
| YieldPricePlot X-axis date ticks  | 2 at real 320/390; 3 at capped desktop | `price-*-*-rest.png`, `price-*-*-inspection.png`, `geometry-*-*.json` |
| YieldPricePlot Y-axis price ticks | 4 at every tested width/theme          | same evidence                                                         |

These are constrained axis annotations. No descriptor, value, ticker, dot, date,
control or explanatory caption uses 12px. The browser checks inspect computed
font sizes as well as actual SVG/text-range bounds. This inventory does not
claim the older unrevised examples have been corrected.

## Fresh verification

Latest spacing-only correction: eight light/dark 320/390/824/1400 geometry and
inspection cases passed against3005. Tests assert 24px top/bottom and zero
additional horizontal wrapper padding; screenshots include the full review
surface. Desktop light and phone dark images were inspected. Initial phone
assertions observed screenshot-induced scrolling, not layout movement; scrolling
the full surface into view before measurement corrected the test setup.
The prior14-case functional report below predates this padding-only correction.

The bounded lab cadence applies. Base reference is
`49f9f22ae94d579b4c530de845e8637d299a9c7d`; the shared tree already contained
unrelated work. Scope dry-run saw 212 changed files and suggested high due to
the entire inherited tree. This isolated opt-in slice adds no shared/production
radius, so focused verification is used rather than an unrelated whole-tree gate.

- Final follow-up browser run: **14 passed**, 14.6s. Includes twelve pilot cases
  and two main-route context cases. The six older family cases passed during
  the initial slice; they were not rerun for this isolated presentation follow-up.
- Captured-fixture tests: **7 passed**.
- Application and E2E TypeScript checks: both passed.
- Focused lint over the changed pilot owner, review wiring and two pilot browser
  specs passed. `git diff --check` and wiki lint passed.

Browser command:

```sh
DESIGN_SYSTEM_BASE_URL=http://127.0.0.1:3043 node node_modules/@playwright/test/cli.js test --config=playwright.design-system.config.ts --project=design-system-review e2e/design-system/chart-yield-price-pilot-lab-regressions.spec.ts e2e/design-system/chart-yield-price-pilot-integration-lab-regressions.spec.ts
```

Other checks used the installed direct Node entry points for Vitest, TypeScript
and oxlint. The final [browser report](browser-report.json) retains the exact
test outcomes. Pilot [behavior/geometry tests](../../../../e2e/design-system/chart-yield-price-pilot-lab-regressions.spec.ts)
and [main-route tests](../../../../e2e/design-system/chart-yield-price-pilot-integration-lab-regressions.spec.ts)
are the repeatable seams.

Follow-up RED evidence: the focused `distinguishes captured` browser test failed
at the actual first timestamp because it received `$1.137` instead of `$1.1372`.
After the pilot-only formatter change, that same test passed for both literal
captured values and the unchanged 1Y curve/explicit coverage note. The complete
four-width/two-theme pilot matrix then passed, including exact text bounds,
equal dot gaps, identity/accessible-unit permanence, downloads, empty recovery,
pointer/keyboard payloads and touch suppression.

Initial-slice RED evidence: the public rendered-seam test failed because
`yield-price-pilot` did not exist, then passed after implementation. A real
inside-plot touch tap subsequently failed at both 320 and 390 because browser
compatibility mouse movement selected a historical point. Pilot-local pointer
provenance now suppresses that compatibility selection; the same tests pass,
including subsequent keyboard and actual mouse recovery. Native `touch-action`
remains `auto`; there is no touch `preventDefault` or scrolling lock.

The retained Empty check failed during a now-superseded intermediate history
experiment because its unscoped `No data` locator matched two charts. It now
targets the original `next-metric-price`; its assertion meaning is unchanged.
Test-only corrections also replaced an incorrect eight-point assumption with the
seven captured 7D rows and initialized main-route theme through the app-owned
preference before navigation. Actual light/dark mode is asserted before capture.

## Inspected evidence

All listed images and matrix captures were refreshed after the follow-up's
compact ticker row, plain review background and external capture notes. Standalone
viewport height is 844px; main-route context is 1400×900. Both themes cover
320, 390, 824 and 1400 viewport widths, at rest and keyboard inspection. The
actual candidate widths are 296, 366, 672 and 672 respectively.

- [320 light resting](evidence/price-light-320-rest.png)
- [390 dark inspected](evidence/price-dark-390-inspection.png)
- [Desktop light resting](evidence/price-light-1400-rest.png)
- [1Y selected with explicit capture context](evidence/price-light-1y-context.png)
- [Main-route light context](evidence/main-route-light-context.png)
- [Main-route dark context](evidence/main-route-dark-context.png)
- [Measured 320 light text/plot bounds](evidence/geometry-light-320.json)

The evidence directory also contains the complete width/theme/state matrix and
ordinary-height context screenshots. Inspection uses one ReferenceDot, not an
additional active-dot marker. Keyboard focus remains visibly indicated.

Self-review found the compact value/ticker row, persistent date position,
external capture explanation and label/control edge coherent. The closest Overview
precedent's ordinary financial hierarchy, visible identity and compact date
are preserved. Its page title, hero host and full-width plot are deliberately
not imported into this single Yield chart. Coordinator visual critique and
human acceptance remain separate from these checks.

## Limitations and next decision

For the initial slice, the coordinator checked the 20-case report, reran app/e2e types,
seven fixture tests and scoped lint, inspected the main3005 mount in Chrome and
light390/dark320 plus main-route dark captures, and confirmed seven protected
source hashes unchanged. The follow-up applies only the user's named Price
refinements; coordinator review of the refreshed evidence and the user's bounded
visual judgment remain separate. The broader revision plan remains pending.

- `#yield-price-pilot` identifies the mounted candidate. A cold SPA navigation
  can mount it after the browser's initial hash-scroll opportunity. Main-route
  tests explicitly scroll the mounted candidate for capture; they do not prove
  automatic cold-link scrolling. No global routing effect was added.
- Mobile evidence uses Chromium phone-sized/touch-enabled contexts, not a
  physical-device gesture suite. Touch inspection remains unsupported.
- The original next-family touch test taps outside the data plot and therefore
  does not establish suppression of compatibility selection inside older
  charts. Those owners were not changed; no claim is made that this older gap
  is fixed.
- This pilot deliberately retains captured hyUSD data only. Large/negative/zero
  values, arbitrary long identity and other metric families are not certified
  by these screenshots or this 52px axis lane. They belong to separately
  reviewed presentation pressure/rollout work, not a new universal API here.
- The lab-only candidate is unadopted. No shared contract or product correctness
  change was made; engineering gates for future production adoption remain in
  the owning plan. The next action is human review of this Price pilot, not
  Portfolio work, Overview changes, or Yield rollout.
