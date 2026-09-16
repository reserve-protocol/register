# Compact chart text controls

## Candidate boundary

`SegmentedControl` now exposes opt-in `textOnlyDensity="compact"`. It separates
the 16/24px or 14/20px visible line box from a 44px vertical interaction area.
The existing omitted-prop text-only geometry and all contained geometry remain
unchanged. Chart `RangeControl` is the first composition consumer; broader
promotion remains blocked on human visual acceptance and engineer review of
the consumer evidence.

`InlineAction` adds only `treatment="utility"` for the chart CSV job. It keeps
the existing FileDown icon and Download CSV wording in a 14/20px foreground
text action with a 44px vertical interaction area. Existing standalone and
contextual treatments, ordinary Button variants, handlers, disabled reasons,
and CSV data are unchanged.

## Consumer inventory

Sixteen non-test source modules currently render V1 Segmented Control:

- Contained-only and unchanged: `mobile-global-header.tsx`,
  `transaction-composition-manual-task.tsx`,
  `transaction-composition-rfq-support.tsx`,
  `transaction-composition-rfq.tsx`,
  `transaction-composition-staged-configure.tsx`,
  `transaction-composition-stake.tsx`,
  `transaction-composition-vote-lock.tsx`, and
  `transaction-paired-review.tsx`.
- Text-only chart/lab controls retaining the omitted-prop geometry:
  `charts/review.tsx`, `charts/panels.tsx`,
  `charts/next-families/preview.tsx`,
  `charts/next-families/responsive-review.tsx`, and the review-state controls
  in `charts/next-families/review.tsx`.
- Text-only candidate adopters: `charts/next-families/range-control.tsx` and
  the dedicated specimen in `segmented-control-state-sheet.tsx`.
- Paused transaction dependency retaining current behavior:
  `transaction-composition-frame.tsx`. Its compact text-only state selector
  remains inside its existing horizontal overflow owner and does not opt in.

The shared implementation and its colocated behavior test are not counted as
consumers. `component-visual-output.tsx` only routes the canonical state sheet.

## Geometry and clipping contract

The compact text-only item owns transparent pseudo-element reach: 10px above
and below a default 24px line, or 12px above and below a compact 20px line.
Horizontal reach is 4px beyond the visible label; narrow labels are not claimed
as 44px wide. `RangeControl` owns 10px transparent vertical and 4px horizontal
scrollport padding with matching negative margins. This keeps the complete hit
and focus region inside the clipping ancestor while the visible text remains on
the composition's content axis.

Yield keeps range and export actions beside one another in the same interaction
band, including phone widths. Its review surface keeps the intended 24px top,
side, and bottom inset after removing the old 44px-visible-target compensation.
Portfolio reserves mobile clearance below its range band so the expanded target
cannot overlap the plot. At desktop widths, the taller readout already supplies
that clearance while the visible range text stays approximately 24px from the
review surface's top and right edges.

## Evidence route

- Component RED: `pnpm test:run src/components/design-system-v1/tests/candidate-behavior.test.tsx`
  failed on the missing opt-in density and utility treatment.
- Component GREEN: the same command passed 21/21 after implementation.
- Dedicated real-browser seam:
  `e2e/design-system/chart-text-controls-lab-regressions.spec.ts` covers actual
  off-glyph clicks, first/last horizontal reach, focus containment, disabled
  states, target non-overlap, CSV hover/focus, Portfolio optical inset, and
  320/390/1400 light/dark presentation.

Browser evidence remains pending until all watched writers freeze and the
coordinator grants the shared browser slot.
