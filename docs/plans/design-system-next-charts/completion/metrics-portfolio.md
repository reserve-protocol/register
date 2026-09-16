# Yield metrics and Portfolio completion packet

Status: implementation-verified; coordinator and human visual review remain.
Base: `49f9f22ae94d579b4c530de845e8637d299a9c7d`. This is a lab
candidate, not visual acceptance or production adoption.

## Result and source decisions

- Price, APY, Supply and RSR staked value use one chart composition: a 14px
  descriptor, 16px ordinary financial row and reserved 14px inspection-date
  line. Price keeps the reviewed `value · hyUSD` row. APY's `%`, Supply's
  existing `hyUSD` suffix and `RSR staked · hyUSD` descriptor carry their visible
  units without a duplicate unit line. Full unit meaning remains in the
  accessible output and adjacent 14px lab context.
- The four plots share the Price pilot's 24px content axis, measured 52px Y-axis
  label bound, responsive two/three X ticks, exact selected marker and guarded
  pointer/keyboard seam. The chart stays 208px high; the two-column desktop
  review gives each candidate roughly 544px and switches to one column before
  that would become cramped.
- The Portfolio total is a paragraph with numeric semantics, using the existing
  responsive 24px/32px foundation scale. Its subordinate descriptor and 14px
  historical date distinguish the supplied latest historical point from a live
  account total. The chart grows to 288px/320px rather than compressing this
  opening-page composition.
- Portfolio exposes named `Total area` and `Composition` source states in lab
  chrome. The first preserves the source resting total area; the second preserves
  its category composition. Both use the same selected point for the header,
  marker, accessible description and persistent key amounts. Range controls sit
  below the plot. The compact key keeps each 14px name and amount together,
  becomes vertical on phones, and has no repeated Total or divider.
- Empty review keeps all four Yield metrics present with meaningful identity and
  disabled export behavior, plus a Portfolio no-history state. Returning to
  Default clears stale inspection while preserving the user's chosen range.
- Existing production percentage and absolute period-change fields are preserved
  outside this scoped candidate. No removal or production behavior change is
  proposed. Captured/simulated data, range meanings, CSV rows, precision and
  financial formatters are unchanged.

## Provisional Portfolio mapping

The array remains the source stack order, bottom to top:

| Category    | Candidate token          | Reason                                                                                                    |
| ----------- | ------------------------ | --------------------------------------------------------------------------------------------------------- |
| RSR         | `--primary`              | Preserves the source's primary Reserve blue at the stack base.                                            |
| Vote-locked | `--chart-4`              | Existing gold category token, closest to the source identity.                                             |
| Staked RSR  | `--chart-1`              | Existing coral category token, matching the source category.                                              |
| Yield DTFs  | `--chart-2`              | Existing teal category token, matching the source category.                                               |
| Index DTFs  | `--primary` at 58% alpha | Keeps Index blue while separating it from base RSR without adding a palette or redefining a global token. |

The visible key reverses that array to match the source tooltip's visual
top-to-bottom reading order. This mapping is deliberately provisional and still
needs human review in both themes; labels remain present so color is never the
only identifier.

## Predecessor comparison

- Preserved from Overview/Yield: flat chart-first surface, 24px content axis,
  restrained 16px financial values, bottom canonical range control, exact-point
  inspection and clear axis labels.
- Preserved from Home/Portfolio: a confident total-area rest state, a substantial
  plot and category composition as a distinct source state.
- Improved for this review: no beige/product host shell, decorative historical
  icon, duplicate Price candidate, top-right range controls, stretched
  three-column balance grid, repeated same-time Total or hidden unit/date swap.
- Intentionally not copied: production Portfolio's 46px live total and period
  return row, because this fixture is historical and this packet does not own
  live-account or return semantics.

## Typography and 12px inventory

The only retained 12px text in the owned candidates is X/Y axis annotation. It
is space-constrained chart metadata and remains subject to rendered bounds and
contrast checks. Descriptors, inspection dates, key names, key amounts,
limitations and provenance are 14px. Yield values are 16px; Portfolio total is
24px on phone and 32px from the existing responsive foundation breakpoint.

## Verification

- RED: `pnpm exec vitest run src/views/internal/design-system/charts/next-families/tests/fixture-data.test.ts` — failed only on the old sequential generic
  palette/order (`Index, Yield, Staked, Vote-locked, RSR`).
- GREEN: the same focused test — 7/7 passed after source-order/token mapping.
- `pnpm exec oxlint src/views/internal/design-system/charts/next-families e2e/design-system/chart-next-families-lab-regressions.spec.ts e2e/design-system/chart-next-families-integration-lab-regressions.spec.ts e2e/design-system/chart-yield-price-pilot-lab-regressions.spec.ts e2e/design-system/chart-yield-price-pilot-integration-lab-regressions.spec.ts` — clean.
- `pnpm typecheck` — app and e2e TypeScript compilers completed without
  diagnostics.
- `git diff --check` over owned source/spec paths — clean.
- Final combined browser run against the coordinator-verified existing preview:
  21/21 passed across the two next-family and two Price pilot specs. The final
  expanded next-family evidence run then passed 8/8 after adding dark 320/390
  and native-swipe proof. The changed specs cover light/dark desktop and mobile;
  320/390 pressure; four-metric roles;
  no duplicate units; fixed header height; axis uniqueness; exact date/value/key
  correlation; total/composition states; bottom ranges; empty recovery; CSV;
  keyboard marker coordinates, native touch scrolling and touch compatibility-
  event suppression. The first sandboxed browser attempt never launched
  Chromium and is not product evidence; the permission-corrected run is the
  evidence above.

Named evidence includes:

- `completion/evidence/metrics-portfolio-light-1400-rest.png`
- `completion/evidence/metrics-portfolio-dark-1400-rest.png`
- `completion/evidence/metrics-portfolio-light-390-rest.png`
- `completion/evidence/metrics-portfolio-light-320-rest.png`
- `completion/evidence/metrics-portfolio-dark-390-rest.png`
- `completion/evidence/metrics-portfolio-dark-320-rest.png`
- `completion/evidence/portfolio-{light,dark}-1400-{total-rest,inspection,composition}.png`
- `completion/evidence/portfolio-{light,dark}-{320,390}-rest.png`
- `completion/evidence/yield-{price,apy,supply,staked-rsr}-{light,dark}-1400-inspection.png`

Rendered inspection covered the complete light 1400 family, dark 1400 Portfolio
composition, light 320 Portfolio and complete dark 390 family. These show the
intended hierarchy, inset/axis alignment, footer balance, phone key wrapping and
theme separation without visible clipping. They do not establish human taste
acceptance.

## Open evidence and decisions

- Human review still owns categorical acceptance, whether resting key amounts
  earn their space, and comparison of the total-area/composition states as a
  production-direction candidate.
- Automated pointer mapping, touch-scroll safety, text/axis bounds, footer
  balance, dark-theme fill separation and 288px key pressure are verified by the
  final browser suite and named evidence. Human judgment of those relationships
  remains with the coordinator/user.
- The supplied Portfolio history is simulated and the last point is dated
  historical data, not a live account total. No non-empty captured portfolio
  fixture exists in the repository.
