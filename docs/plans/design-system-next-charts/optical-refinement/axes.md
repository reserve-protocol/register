# Actual-tick axis refinement

## Candidate

The Yield, Portfolio, Overview line, and Overview candlestick gutters fit the
widest Y-axis label that Recharts actually rendered. Source values still own the
domain and tick generation; existing formatters and tick counts remain intact.

The measurement path reads rendered SVG text once before paint when available,
then refreshes only for a changed range/data extent, a chart-container resize,
or settled fonts. Equal measurements do not update state. Inspection and tooltip
state are not measurement inputs.

Right-aligned labels keep the existing 16px label lane allowance. The 4px outer
radius of a 3px endpoint marker with a 2px ring leaves 12px visible clearance;
the candlestick inset preserves the equivalent gap from the final glyph.
Mobile Overview continues to return a hidden, zero-width Y axis.

## Portfolio integration

`portfolio-axis.patch` is intentionally separate because the control packet is
the sole writer of `portfolio-history.tsx`. It changes only the axis measurement
input and the existing responsive-container ref; header and control composition
remain outside this packet.

## Verification

- Focused RED: the two rendered-tick measurement tests failed because the
  helpers did not exist.
- Focused GREEN: 10/10 axis and Overview presentation tests passed.
- E2E TypeScript RED: `chart-review-lab-regressions.spec.ts` could not call
  `getBBox()` on an insufficiently narrowed locator element union.
- E2E TypeScript GREEN: the label is now runtime-narrowed to
  `SVGGraphicsElement`; the same geometry assertion remains intact.
- Browser geometry and source-frozen results: pending coordinated browser slot.

No formatter, tick count, domain, source value, data, range, CSV, hover-return,
or production-default behavior is changed by this packet.
