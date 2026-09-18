# Yield and Portfolio feedback packet

Status: implementation-verified; [coordinator closeout](README.md) owns final
combined evidence and review. Base: `49f9f22ae94d579b4c530de845e8637d299a9c7d`. This is a
lab presentation candidate, not production adoption or palette acceptance.

## Result

- Yield export now occupies the readout header's top-right while preserving the
  canonical 32px icon-button target and the existing download handler, filename,
  rows and disabled explanations. The 44px range targets remain in the footer.
- The Yield review canvas uses a 24px top and 12px bottom step. Together with the
  target's internal centering, the rendered first and last text glyph edges differ
  by no more than 2px from their immediate canvas edges. The chart still owns the
  existing 16px plot-to-range relationship; the review canvas does not duplicate it.
- Portfolio ranges occupy the top-right at container widths of 640px and above.
  Below that cutover they follow the dated readout and precede the plot, retaining
  horizontal access and all seven supplied options. Browser pressure checks cover
  620px and 688px as well as 320px, 390px and 1400px.
- The Portfolio date retains its 14px role with one existing 8px spacing step after
  the total. The category key follows the plot directly with a 16px gap and no
  range row, divider or repeated total between them.
- Composition adds a 1.5px contour from the supplied `value` field, without a new
  total calculation. Inspection adds one 1px vertical guide and one top marker;
  the guide is painted after the filled bands and spans more than 200px in the
  exercised chart.
- All four Yield plots and both Portfolio states show a static 3px latest-point
  mark with a 2px `--card` ring. Inspection replaces, rather than duplicates, the
  resting mark; pointer exit, blur and range/source-state changes restore it.
  Marker fill is the exact computed contour/line stroke.
- Recharts axes remain direct chart children. Y labels are start-aligned 8px from
  the plot and the reserved width is fitted locally instead of using the old fixed
  52/60px gutters.

## Geometry seam and limitation

The local gutter fitter measures formatted full-series values after the Lausanne
font is ready, with conservative initial character sizing plus zero and padded-edge
candidates. It intentionally does not read Recharts' private tick generator or
change the domain. Rounded tick labels could theoretically differ from the input
candidates, so the real mounted SVG remains the authority: the browser checks every
rendered Y label for the 7–9px plot gap and right containment, checks range geometry
for jitter, and exercises short `$0` labels alongside longer price and compact labels.

Endpoint proof uses the mounted SVG path length, transforms its real final point to
screen coordinates, and compares both axes with the marker center within 1px. The
inspection proof searches the path at the selected marker X, compares Y within 1px,
checks the selected timestamp's independent linear X position, and checks the guide
X against the same marker. The 3px radius plus 2px ring is also checked against all
four SVG edges. This is numerical placement evidence, not presence-only coverage.

## Verification

- RED: `pnpm exec vitest run src/views/internal/design-system/charts/next-families/tests/axis-geometry.test.ts` — 2/2 failed against the old fixed 52px result
  (expected fitted widths 49px and 32px).
- GREEN: `pnpm exec vitest run src/views/internal/design-system/charts/next-families/tests/axis-geometry.test.ts src/views/internal/design-system/charts/next-families/tests/fixture-data.test.ts` — 9/9 passed.
- `pnpm exec prettier --check src/views/internal/design-system/charts/next-families e2e/design-system/chart-next-families-lab-regressions.spec.ts e2e/design-system/chart-next-families-integration-lab-regressions.spec.ts e2e/design-system/chart-yield-price-pilot-lab-regressions.spec.ts e2e/design-system/chart-yield-price-pilot-integration-lab-regressions.spec.ts` — clean.
- `pnpm exec oxlint` over the same owned source/spec paths — clean.
- `pnpm typecheck` — app and e2e TypeScript compilers completed without diagnostics.
- `DESIGN_SYSTEM_BASE_URL=http://127.0.0.1:3005 node node_modules/@playwright/test/cli.js test e2e/design-system/chart-next-families-lab-regressions.spec.ts e2e/design-system/chart-next-families-integration-lab-regressions.spec.ts e2e/design-system/chart-yield-price-pilot-lab-regressions.spec.ts e2e/design-system/chart-yield-price-pilot-integration-lab-regressions.spec.ts -c playwright.design-system.config.ts --project=design-system-review` — final 25/25 passed against the existing user preview. The archived JSON report is [`evidence/next-families/playwright-report.json`](evidence/next-families/playwright-report.json), SHA-256 `bc9747af8b8d87d13b09ae8e73e566b0b23fb05ca57f610596cfe1c661d7ed00`.

The first sandboxed browser attempt produced 25 infrastructure failures before page
creation because Chromium MachPort registration was denied. The permission-corrected
run reached the UI. Its first pass was 17/25: all eight failures were test-oracle
errors (the helper selected the range radiogroup as the plot, then compared inset
content to the header's outer box). No product assertion failed. After correcting
those locators, the focused next-family run passed 10/10 and the final combined run
passed 25/25. No assertion threshold or requested geometry was weakened.

Protected owners remained byte-identical:

| Path                      | SHA-256                                                            |
| ------------------------- | ------------------------------------------------------------------ |
| `fixture-data.ts`         | `42a6e629c57c59406f2f5df2078dc1cc23ab51de1bdfc9b81a4f0181a202c89e` |
| `metric-formatters.ts`    | `db63c96a812231de904ecacc4cdbb4823800044d31d8c673d5e6d1617fcae3f2` |
| `portfolio-formatters.ts` | `1fe429ca2a00f80bb4c68c7fea9e1a9b76a90eac5d1d6dd40ebe8e73eb9dc8b5` |
| `range-control.tsx`       | `447a0dabf8dc98398d49947c306609a3523cbe19c873755c1f1ba442530441b2` |

## Visual evidence and review boundary

The evidence folder contains full-family light/dark 1400px captures; complete
Yield review canvases at 320, 390, 824 and 1400px; Portfolio total and composition
rest/inspection at desktop and 390px; 320px pressure; and the two range-cutover
checks. Useful entry points are:

- `metrics-portfolio-light-1400-rest.png` *(capture generated locally; not tracked)*
  and `metrics-portfolio-dark-1400-rest.png` *(capture generated locally; not tracked)*
- `portfolio-light-1400-composition-inspection.png` *(capture generated locally; not tracked)*
  and `portfolio-dark-1400-composition-inspection.png` *(capture generated locally; not tracked)*
- `portfolio-light-390-rest.png` *(capture generated locally; not tracked)*
  and `portfolio-dark-390-composition-inspection.png` *(capture generated locally; not tracked)*
- `portfolio-light-620-narrow-ranges.png` *(capture generated locally; not tracked)*
  and `portfolio-light-688-desktop-ranges.png` *(capture generated locally; not tracked)*

The inspected compositions retain the established readout hierarchy and plot sizes,
bring short and long Y labels visibly close to their lines, make the Yield canvas
bottom feel materially less padded, and keep Portfolio controls/key usable without
horizontal page overflow. The interior 13 Jul composition captures show a subtle but
readable guide through every band and a contour-centered marker in both themes.

Human review still owns the final optical inset balance, guide/contour subtlety and
provisional Portfolio palette. The screenshots and passing geometry checks do not
promote those choices into design authority. Data, calculations, units, copy,
formatters, ranges, export semantics, production renderers, shared defaults and
global tokens are unchanged.

## Exact owned files

Source and unit:

- `src/views/internal/design-system/charts/next-families/axis-geometry.ts`
- `src/views/internal/design-system/charts/next-families/tests/axis-geometry.test.ts`
- `src/views/internal/design-system/charts/next-families/metric-line-chart.tsx`
- `src/views/internal/design-system/charts/next-families/yield-price-plot.tsx`
- `src/views/internal/design-system/charts/next-families/portfolio-history.tsx`
- `src/views/internal/design-system/charts/next-families/portfolio-legend.tsx`
- `src/views/internal/design-system/charts/next-families/review.tsx`

Browser:

- `e2e/design-system/chart-next-families-lab-regressions.spec.ts`
- `e2e/design-system/chart-next-families-integration-lab-regressions.spec.ts`
- `e2e/design-system/chart-yield-price-pilot-lab-regressions.spec.ts`
- `e2e/design-system/chart-yield-price-pilot-integration-lab-regressions.spec.ts`

Receipt and evidence:

- `docs/plans/design-system-next-charts/feedback-pass/next-families.md`
- `docs/plans/design-system-next-charts/feedback-pass/evidence/next-families/`
