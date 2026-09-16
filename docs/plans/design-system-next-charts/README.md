# Next chart families — isolated preparation receipt

## State

**Historical isolated-worker receipt, not the current visual candidate.**
The [completion package](completion/README.md) owns the current revision and
fresh verification; the [revision plan](revision-plan.md) records the feedback.
This receipt and [initial integration](integration.md) preserve earlier evidence
only. Their original layout/palette descriptions must not guide new work.

- Task ID: `01a0a20e-2880-7b23-af6e-1e21a8318502`
- Worktree: `/Users/lill-kire/.codex/worktrees/5c5c/register`
- Checkpoint: `49f9f22ae94d579b4c530de845e8637d299a9c7d`
- Git state: detached HEAD; no commit, branch, push, or production adoption
- Preview:
  `http://127.0.0.1:3041/src/views/internal/design-system/charts/next-families/preview.html`
- Shared-lab anchor: `#chart-next-families-review`

Dependencies were installed in this isolated worktree with the exact pnpm
lockfile after explicit authorization. Lifecycle scripts were disabled; no
dependency or lockfile version changed.

## Integration seam

The candidate is an embeddable section with no page-level padding, width, or
`main` ownership. The exact mount is:

```tsx
import { NextChartFamiliesReview } from './charts/next-families/review'
;<NextChartFamiliesReview />
```

It takes no props. The standalone `preview.tsx` owns page chrome and exposes
Normal, Narrow, 390px iframe, and 320px iframe modes without changing the
existing chart review or its mobile preview.

## Product reachability and protected behavior

Yield Overview mounts Price, APY, Supply, and RSR Staked through
`HistoricalMetrics`. This study keeps their distinct units, product range
meanings, and captured schemas. It does not propose removing the current shared
chart's Gain field. The hyUSD fixture is USD-only, so it does not represent the
existing ETH exchange-rate branch.

Portfolio mounts `PortfolioChart` on `/portfolio`. The study is explicitly a
presentation-only composition candidate using simulated balances and no account
identity. The current percentage and absolute change fields and total-to-stacked
hover/click behavior remain product-owned and are not proposed for removal.

Touch value inspection is intentionally unsupported here: the installed
Recharts chart-level contract does not expose a source-faithful touch payload.
The rejected alternative mapped container coordinates to array indices, which
would be incorrect around chart margins and nonuniform timestamps. Native page
scrolling remains uninterrupted. Keyboard and pointer inspection use an exact
selected data point and one explicit plotted marker; native cursor/active-dot
indicators are suppressed so mixed input cannot show two selected samples.

## Data provenance

`fixtures/hyusd-history.json` contains unresampled captured GraphQL payloads
from `e2e/snapshots/base/hyusd/yield-graph.json`: 29 price, 365 supply, and 365
staked-RSR points for hyUSD on Base, captured 2026-08-25.

- Yield source SHA-256:
  `daa0af6de543bf9e3f736d4fccf8d41a11aa19fe9a9556cad5a8b0111d86f452`
- The independent RSR/USD input is the recorded Chainlink response from
  `e2e/snapshots/mainnet/eusd/rtoken-chain-state.json`, SHA-256
  `ed147b9db026e1837f506db2f19c6f1bef5aa279277e036bcfe2383cef724e87`,
  decoded as `$0.00144684`.
- APY is visibly labeled lab-simulated because the repository capture lacks the
  external yield-history inputs required to replay the production derivation.
- Portfolio is visibly labeled lab-simulated because the repository has no
  captured non-empty `/v1/historical/portfolio` response. Every synthetic point
  exactly sums the five production categories to its displayed USD total.

The requested public-source check found official Reserve documentation for
[Yield DTF mechanics](https://docs.reserve.org/core-components/yield-dtfs/yield-dtf-overview)
and [Index DTF composition](https://docs.reserve.org/core-components/index-dtfs/overview),
but no authoritative replayable historical APY input or identity-free non-empty
account Portfolio history. The study therefore keeps those two inputs synthetic
instead of substituting an unapproved source or calculation.

## Presentation and control decisions

- Yield uses realistic two-column desktop cards and one-column mobile cards,
  with grid-free plots, automatic domains only for Price/APY, and product-default
  domains for Supply/RSR Staked. Price axis precision is sufficient for every
  visible tick to remain distinct at desktop and mobile widths.
- Yield range and CSV controls sit below plots using canonical 16px text-only
  segmented controls and the canonical icon button. Daily captures disable 24H
  with a visible reason. APY export is disabled because its input is synthetic.
- Enabled exports reuse the existing export hook and preserve captured/current
  field schemas. Browser evidence reads the downloaded price CSV header and a
  captured literal, not only the filename.
- Portfolio uses the five existing chart tokens as a provisional categorical
  palette, a persistent legend, stacked category areas, and a foreground total
  line rendered by `ComposedChart`.
- Provenance and synthetic labels sit immediately outside each content card;
  detailed product-preservation boundaries are in a collapsed details block so
  mobile reviewers reach the charts promptly.
- All new copy is internal-lab-only. No production Lingui catalog or shared
  localization surface was changed.

## Owned delta

Implementation is confined to
`src/views/internal/design-system/charts/next-families/`, including the local
HTML/React/CSS preview, review section, chart components, fixtures, formatters,
controls, types, and focused unit tests. One dedicated browser regression file
was added at
`e2e/design-system/chart-next-families-lab-regressions.spec.ts`. Evidence and
manifests live in this receipt directory.

No existing product chart, shared component/default, route, token, SDK, source,
calculation, API, candle, pie, Factsheet, or production adoption file was edited.

## Verification record

Fresh final checks:

| Check                                         | Result                                                                                          |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Focused fixture/contract unit suite           | 7/7 passed                                                                                      |
| Full `tsc --noEmit`                           | Passed                                                                                          |
| Oxlint on owned chart family and browser spec | Passed, no findings                                                                             |
| Prettier check/write on owned files           | Passed                                                                                          |
| Dedicated Playwright review suite             | 5/5 passed                                                                                      |
| Desktop light/dark                            | Passed at 1400px; screenshots captured                                                          |
| Standalone Normal/Narrow/390/320 controls     | Passed; 390/320 are real same-origin iframes                                                    |
| Real mobile layout                            | Passed at 390px and 320px with touch contexts and no horizontal overflow                        |
| Price tick labels                             | Every visible formatted tick unique at desktop and mobile                                       |
| Portfolio total line                          | Exactly one rendered line path asserted                                                         |
| Ranges and disabled reasons                   | 7D filtering and daily-capture 24H disablement asserted                                         |
| CSV                                           | Filename, raw header, and captured literal asserted; simulated APY disabled reason asserted     |
| Inspection                                    | Keyboard/pointer exact selection and one selected marker asserted; touch non-selection asserted |
| Empty → Default                               | Both transitions asserted                                                                       |
| Grid policy                                   | No Cartesian grids rendered                                                                     |
| Implementation and reference manifests        | Passed                                                                                          |
| Captured Yield and RSR/USD source hashes      | Passed                                                                                          |
| Wiki lint                                     | Passed: 20 pages green                                                                          |

The repository-wide scope gate passed typecheck and lint (with existing
repository warnings), then reported 1335/1337 tests passing. Its two failures
are outside this owned delta and arise from the inherited coordinator snapshot:
the inventory reconciliation test still expects Chart to be `not-started` while
the inherited catalog marks it `ready`, and the review-source watcher test
received `watcher-error` instead of a native `src` edit event in this isolated
environment. The owned unit and browser suites above are green. The full gate
is therefore recorded as non-green rather than claimed as passed.

Evidence:

- `evidence/next-chart-families-light-1400.png`
- `evidence/next-chart-families-dark-1400.png`
- `evidence/next-chart-families-light-390.png`
- `evidence/next-chart-families-light-320.png`
- `evidence/next-chart-families-dark-390.png`

## Reference snapshot and review disposition

The isolated baseline is the checkpoint above plus the authorized 142-file
reference snapshot. `reference-snapshot-paths.txt` and
`reference-snapshot.sha256` record its exact inventory and hashes; manifest
fingerprint:
`d0cd87bfcd721afa3597a2421fba31c2a62b4be3d1adb72794412f34c70ba30f`.
The destination snapshot remains byte-identical. The live coordinating checkout
later changed only the handoff and candlestick plan documents; those changes did
not overwrite this isolated input.

Coordinator review findings were adopted: controls moved below Yield plots;
grids, arbitrary minimum heights, fake sidebar/account identity, invented
domains, and in-card provenance were removed; 24H and CSV limitations are
explicit; production behaviors are protected; the section is embeddable; local
real-width iframe controls were added; and chart density was reduced. Follow-up
mounted findings fixed duplicate price labels, ensured the Portfolio total line
really renders, eliminated inaccurate touch approximation, suppressed mixed-
input double selection, and restored native preview document flow.

Human visual acceptance, palette promotion, real APY/Portfolio source capture,
and any production integration remain open. Engineer review is required before
adopting the independently timed RSR/USD presentation series in production.
