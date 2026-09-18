# Table-family evidence

The current review target is
[Discover browsing cells](../design-system-table-family-discover-slice.md#completion-boundary).
The [mobile card follow-up](../design-system-discover-mobile-cards.md) supersedes
the earlier constrained Discover row projection. Compact and full-chart cards
use the source chart/ticker, not the desktop basket popup. Earlier phone-row
captures below are historical; they are not the current narrow candidate.
Its [final record](mobile-cards-2026-09-11/record.json) retains 21 passing lab
cases, 7 existing Home/Discover regression receipts and 24 card screenshots.
Compare compact phone *(capture generated locally; not tracked)*,
full chart *(capture generated locally; not tracked)*,
long content *(capture generated locally; not tracked)*
and canonical loading *(capture generated locally; not tracked)*.
The [whole-row link refinement](row-links-2026-09-11/record.json) verifies neutral
same-destination identity/title hover across Discover, Index/Yield positions and
rich governance/rebalance records. It retains keyboard focus, independent action
affordances and basket-trigger regression checks: seven cases, 20 selected images.
The [count-padding touch-up](discover-count-padding-2026-09-11/record.json)
checks 16px trailing padding after the count while preserving the logo inset,
44px height and interactions, in three desktop/phone light/dark cases.
The [overflow-edge refinement](discover-strip-edges-2026-09-11/record.json)
adds conditional 12px fades and a stationary fitting-basket case, including
resize and quick-reopen coverage. It also rechecks the original motion and
trigger interactions; wider composition evidence remains in the prior records.

The [horizontal-strip follow-up](discover-hover-2026-09-11/record.json) supersedes
the vertical expanded list. It retains the closed-trigger geometry and adds
source-speed motion samples, looping, hover transit/pause, touch swiping,
reduced motion, keyboard access and responsive focus recovery.

The [2026-09-11 closed-trigger refinement](discover-trigger-2026-09-11/record.json)
supersedes its initial closed-control geometry: 9 passing cases cover the
balanced trigger and the 1151/1152px transition, with 37 captures. Expanded-panel
captures retain the superseded temporary list, not an accepted design.
See row hover *(capture generated locally; not tracked)*
and keyboard-only focus *(capture generated locally; not tracked)*.

The initial expansion evidence remains below as historical proof.
Its [source record](discover-source-2026-09-10/record.json),
[candidate record](discover-candidate-2026-09-10/record.json) and
[Holdings/Portfolio recheck](discover-predecessor-check-2026-09-10/record.json)
keep new design evidence separate from regression proof. The source record has
2 cases; the final candidate/regression run has 21 passing cases. No record
grants design acceptance or production adoption.

Selected initial-expansion images: desktop *(capture generated locally; not tracked)*,
dark phone *(capture generated locally; not tracked)*,
basket inspection *(capture generated locally; not tracked)*,
constrained long content *(capture generated locally; not tracked)*,
and retained Holdings rhythm *(capture generated locally; not tracked)*.
Asset-loading/fallback and ordinary-viewport limits are recorded in the brief.

The earlier [Portfolio hardening checkpoint](checkpoint.md),
[source-bound measurements and image hashes](checkpoint-2026-09-09/record.json),
[historical Portfolio observations](first-slice.md) and Holdings predecessor
evidence below remain scoped to their original states.

## Holdings predecessor

Supports the [first table-family brief](../design-system-table-family-first-slice.md).
This is an observation of existing product UI under fixtures, not a new V1
candidate, pixel baseline, or production-data correctness claim.

## Observed

Eight cases passed without retries or skips: 375, 639, 640 and 1400px wide,
900px high, each in light and dark. The fixture is the existing Base LCAP
snapshot selected through `e2e/helpers/registry.ts`; the route is its Index DTF
overview. The owned Vite server used this checkout on port 3042, not the user's
preview. It was stopped after the run. No real wallet or transaction was used.

Each case exercised the visible Exposure → Collateral tab switch, checked its
active state and visible explorer links, then focused Exposure and pressed
Enter to return. Transaction logs remained empty. Tab checks use the visible
controls inside `overview-basket`: mobile has a separate tab list without the
desktop tab test IDs. Desktop-only IDs explain the earlier research capture's
mobile selector timeout; this was not evidence that the mobile tabs were broken.

[Measurements](observations.json) retain all eight cases. The document width
equaled the viewport width in each case. The observed basket widths were 375,
639, 632 and 820px respectively. This rules out document-level horizontal
overflow in these fixtures, not every possible local overflow or long-content
case. Below 640px the records stack; at 640px the desktop table appears.

## Selected images

All seven retained images were visually inspected. They capture ordinary
viewports with the Holdings region brought into view; they are not full-page
montages or isolated component renders.

| Evidence                                                      | What it shows                                                                                                                               |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Exposure, light, 375px *(capture generated locally; not tracked)*     | Asset/weight first; three supporting facts below; inset row separators.                                                                     |
| Collateral, light, 375px *(capture generated locally; not tracked)* | Wrapper identity, explorer affordance and bridge information. Some image assets have not settled; do not use this capture as logo approval. |
| Exposure, dark, 375px *(capture generated locally; not tracked)*       | Same hierarchy in the other theme.                                                                                                          |
| Collateral, dark, 375px *(capture generated locally; not tracked)*   | Wrapped token names and supporting metadata without changing the overall row structure.                                                     |
| Collateral, light, 639px *(capture generated locally; not tracked)* | Last mobile width tested.                                                                                                                   |
| Collateral, light, 640px *(capture generated locally; not tracked)* | First desktop width tested; table columns rather than stacked records.                                                                      |
| Exposure, light, 1400px *(capture generated locally; not tracked)*   | Dense table within its actual page column, not full viewport width.                                                                         |

The fixed page actions remain visible in phone captures. Their overlap near the
viewport edge is not part of row acceptance. Image loading/fallbacks, the page
shell, legacy rounded surfaces and exact legacy spacing are not design authority.

## Provenance and limits

[Record](record.json) contains artifact hashes and a selected **public-file**
fingerprint taken at closeout. No private configuration, environment values or
private-file hashes are retained. This is not an all-source before/after
stability attestation. The selected production sources were checked against
`adef9ee76ffe2a579f6811cae2f5cf152cd0cf99`; they had no changes. Shared V1
consolidation work remains in the working tree and is not hidden by that claim.

[Observation spec](holdings-observation.spec.ts) preserves the executed test
body with its imports made repository-relative. It is not part of CI and does
not change the production suite. A rerun needs a temporary Playwright config
with this directory as `testDir`, `testMatch: 'holdings-observation.spec.ts'`,
one worker, no retries, 60-second test timeout, 20-second expect timeout, and
`reducedMotion: 'reduce'`. Use the existing strict mock/environment setup from
`playwright.config.ts`, but bind an unused owned port and use temporary output
and Vite cache directories. Never reuse or stop the user's preview. This record
is not a new general capture runner or a replacement for the source-bound V1
verification harness.

The initial temporary setup needed ESM import/config corrections and permission
to bind a localhost port; those were setup failures, not product regressions.
The final capture run passed 8/8 in 43.6 seconds.

Not exercised: sorting, View all/View less (LCAP has eight rows), filtering,
loading/empty/error Holdings branches, external-page navigation, bridge
tooltips, wallet actions, touch gestures, full keyboard traversal, motion,
or Portfolio interactions. Do not promote these captures into proof of those
behaviors. The later [first-slice record](first-slice.md) owns direct Portfolio
observations and candidate interaction proof; it does not retroactively extend
these Holdings captures.
