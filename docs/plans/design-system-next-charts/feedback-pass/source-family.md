# Source line family feedback receipt

Status: implementation-verified; [coordinator closeout](README.md) owns the final
combined evidence and reconciled reviews. Human visual acceptance and production
adoption remain separate.

## Scope

Fixed point: `49f9f22ae94d579b4c530de845e8637d299a9c7d`, with the inspected inherited
dirty checkout preserved. This packet changes only source-faithful chart
presentation: the Overview line, Home highlighted chart, actual 90×40 Discover
sparkline and Overview candle axis spacing. It does not change data sources,
values, formatting, domains, ranges, chart-type defaults, product callers or
candle interaction behavior.

## Implementation

- The line review opts into a static latest-point marker with a 3px fill and
  2px host-surface ring, real drawing clearance and the existing inspection
  lifecycle. One marker follows the inspected sample, including the final
  sample and split-series launch boundary, then pointer exit or keyboard blur
  restores the latest point. Touch release keeps the selected header and
  marker synchronized instead of applying mouse-exit behavior.
- The Home review uses the same marker geometry above its existing fill, fade
  and stroke layers. Both chart layers and the launch marker use the same
  horizontally padded scale. The line and marker use the same user-space
  gradient coordinates; the ring repeats the immediate source-card host
  gradient in the same screen coordinate space.
- The Discover specimen remains the actual 90×40 source sparkline and adds a
  2px marker with a 1.5px card-surface ring at the final plotted coordinate.
- Overview line and candles opt into formatted-label-sized Y-axis width with a
  small explicit label gap. The candle review also reduces only its
  right drawing padding so the final visible candle sits near those labels.
  Mobile axes remain hidden.

The renderer additions are opt-in. Omitted props retain the prior Y-axis
geometry, object-bounding-box gradients, Home launch-position calculation and
absence of endpoint markers. The source lab is the only new caller.

## Test evidence

- RED: focused gradient-coordinate cases failed because both renderer helpers
  ignored supplied user-space coordinates (2 expected assertion failures).
- GREEN: `pnpm exec vitest run src/views/index-dtf/overview/components/charts/tests/price-chart-presentation.test.tsx src/views/home/components/highlighted-dtfs/tests/performance-chart-motion.test.tsx src/views/home/components/highlighted-dtfs/tests/performance-chart-presentation.test.tsx` — 14/14.
- `pnpm typecheck` — app and e2e TypeScript green after the final frozen source
  and browser assertions.
- `git diff --check` — green.

The serialized attached-preview browser matrix passed 13/13: Overview/Discover
3/3, mobile/touch 3/3, Home 3/3 and candles 4/4. These mounted assertions cover
actual SVG path/marker centers, clearance, line/marker gradient coordinates and
stops, the Home host-gradient coordinate system, launch alignment, single-marker
inspection/restoration in both readout modes, touch-release synchronization,
320/390 mobile clipping, hidden mobile axes and candle-glyph-to-label distance.
Reports, hashes, commands and the inspected capture inventory are recorded in
[evidence](source-family-evidence/README.md).

## Engineer review boundary

Engineer review is required before any production adoption of the optional
renderer props. Review the new presentation props and helpers in the Overview
and Home renderer folders, especially Recharts scale payload compatibility,
ResizeObserver lifecycle, split pre/post-launch user-space gradient appearance,
formatted-label width estimation and host-ref gradient ownership. Defaults are
unit-pinned and existing product callers do not opt in, but lab evidence does
not certify every product host, theme transition or candle interaction state.

This visual packet excluded candle touch/keyboard inspection. The separately
authorized September 15 G7 repair subsequently closed that lab gate while
preserving production defaults. The source renderers now exceed the preferred 300-line file
size, so future production adoption should consider a narrow presentation-only
extraction without widening the public renderer seam. Final optical balance,
endpoint treatment and the small user-space gradient difference across split
segments still require human review.
