# Final feedback packet receipt

Status: source and tests frozen; coordinated browser verification pending.

## Preserved defaults

- Home's legacy launch-marker presentation still owns its original dashed guide and pill. The shorter resting guide is limited to the lab's `annotation` presentation.
- Omitting `tooltipContent` from `PriceChartBody` still renders `PriceTooltip`. Yield mode still renders `YieldTooltip`, and the candlestick tooltip path is unchanged.
- Portfolio amount, date, range behavior, axis integration, source data and inspection semantics are unchanged. Yield descriptors remain on supporting typography.
- The floating line tooltip remains a selectable, explicitly provisional lab alternative; this packet does not promote it to an accepted or production default.

## Implementation

- `src/views/home/components/highlighted-dtfs/performance-chart.tsx`
- `src/views/home/components/highlighted-dtfs/performance-chart-launch-marker.tsx`
- `src/views/home/components/highlighted-dtfs/tests/performance-chart-launch-marker-presentation.test.tsx`
- `src/views/index-dtf/overview/components/charts/price-chart-body.tsx`
- `src/views/internal/design-system/charts/source-line-tooltip.tsx`
- `src/views/internal/design-system/charts/tests/source-line-tooltip.test.tsx`
- `src/views/internal/design-system/charts/source-overview.tsx`
- `src/views/internal/design-system/charts/review.tsx`
- `src/views/internal/design-system/charts/next-families/portfolio-history.tsx` — descriptor line only, after the coordinator integrated the axis patch
- `e2e/design-system/chart-final-feedback-lab-regressions.spec.ts`

The annotation marker now owns its guide and derives the guide endpoint from the same `isCreatedLabelVisible` state as the label. Resting desktop geometry ends at the 18px badge top; hover, focus, phone-default and clipped-badge visibility reserve the label's four-pixel clearance. The Portfolio descriptor uses the existing 16px/24px light body style with its muted role. The lab line chart supplies a V1 tooltip surface through an optional renderer seam while retaining the existing price formatter, dollar unit, timestamp format, selection marker and header-inspection alternative.

## RED / GREEN

RED established two missing seams: the annotation guide was not owned by label visibility, and the V1 line-tooltip module did not exist.

GREEN:

- Focused unit suite: 14/14 passed.
- Application TypeScript: passed.
- E2E TypeScript: passed, including the new final-feedback spec.
- Focused Oxlint: passed.
- Prettier: passed.
- `git diff --check`: passed.

The unit suite covers the preserved Home pill default, compact annotation, resting endpoint, active/clipped clearance state, exact line-tooltip value/date output, V1 surface recipe and null handling for inactive or incomplete payloads.

## Remaining browser proof

The new dedicated spec is source-frozen and ready for the coordinator's single browser slot. It checks light/dark desktop hover and focus, 320/390 phone-default launch clearance, exact Portfolio/Yield computed typography and non-overlap, exact `$103.36` / `2026-6-2 00:00` tooltip output, V1 surface geometry and clipping, marker restoration, and the switch back to header inspection. No browser or preview server was started by this packet before the coordinator grant.

## Release

All packet C source and E2E writers are released. `portfolio-history.tsx` is explicitly released after the descriptor-only edit. Any browser-discovered repair must remain inside the named packet C files and be followed by a fresh source-frozen run.
