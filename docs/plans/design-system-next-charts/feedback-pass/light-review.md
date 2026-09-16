# Intent review — Light

Verdict: Intent pass for this bounded feedback candidate; no scoped implementation
blocker identified. Human visual acceptance and production adoption remain separate.

## Findings

None verified. Paths abbreviated below `next-families/` are relative to
`src/views/internal/design-system/charts/`. Inspected source and rendered output
support the requested changes:

- `src/views/internal/design-system/charts/next-families/metric-line-chart.tsx:83`
  places export at the header's top-right without replacing its canonical target;
  `next-families/review.tsx:87` removes duplicated-looking bottom whitespace.
  Full Yield canvases retain balanced visible insets at 1400, 390 and 320px.
- `next-families/portfolio-history.tsx:110` places ranges above the plot at both
  responsive positions; `:127` gives the date modest breathing room.
  `next-families/portfolio-legend.tsx:18` keeps the breakdown adjacent to the plot.
  The 620/688px captures demonstrate the intended cutover without header collision.
- `next-families/portfolio-history.tsx:281` supplies one thin total contour,
  timestamp guide and marker. Interior 13 Jul light/dark captures show a useful
  guide through the bands without category outlines or duplicate dots.
- Next-family marker and axis source, SVG assertions and inspected captures agree:
  labels sit close to the plot; endpoint marks are restrained and replaced during
  inspection. Home/Discover and candle captures preserve their retained framing,
  title and mobile-axis choices. Final light/dark Overview lifecycle captures show
  one line-colored selected marker replacing the endpoint, then restoring it;
  the dark Home and actual 90×40 Discover marks remain understated. Palette was
  not reopened.

## Remaining proof

The previous evidence gaps are closed: inspected all six `empty-review-*` canvases,
both desktop source lifecycle sequences, dark Home/Discover and mobile evidence.
Empty canvases preserve header/export/footer relationships without stale markers.
`final-report.json` records 46 passed, zero failed/skipped/flaky. This confirms
the exercised seams, not every possible production input. Human judgment still
owns optical balance and marker/contour treatment; Engineer review remains
required before adopting source-renderer props.

## Strongest disconfirming evidence sought

Looked for deceptively balanced numeric padding, narrowed targets, controls
separating plot/key, unreadable dark inspection guides, and dots detached from
curves or doubled during inspection. Actual full/default/empty canvases, interior
composition captures, source lifecycle/theme captures and mounted coordinate
assertions did not establish those failures. The endpoint returns to the same
curve position without a second marker or financial readout reinterpretation.
