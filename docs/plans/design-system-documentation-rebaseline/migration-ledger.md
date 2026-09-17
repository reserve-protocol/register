# Design-system documentation migration ledger

Status: S1 rebaseline input; documentation only. Snapshot: local
`design-system-v1` at `02434707c0614d2262b10560eebb05cde4319931` on
2026-09-16.

This ledger inventories compatibility and migration work. It is not design
authority and does not restate component or foundation rules. The typed
catalogs, accepted decisions, implementations, Current Review record, family
guides, tests, and retained evidence remain the owners named below.

## Reading the ledger

- **Fact** means read directly from the post-merge source named in the row or
  section. Catalog facts use exact enum values in this order: design authority,
  output, catalog status, review status, implementation status, and adoption
  status. Foundation rows omit the last three component-only fields.
- **Planned classification** means a destination or slice derived from the
  approved documentation-experience plan. It does not change the typed fact.
- **Unresolved** is an explicit decision or verification gap. An unresolved row
  cannot be deleted or redirected in S8.
- **Canonical** is the human projection of `current-baseline` guidance.
  **Workbench** hosts exploratory/review tooling. **Records** hosts readiness,
  evidence, adoption, and no-output inventory. A semicolon in a destination
  cell means the existing mixed surface must be split, not duplicated as a new
  authority.
- **Legacy alias** is not approved authority. It is available only if U1/U3
  approves the temporary sidebar aliases.

Compatibility actions used by catalog rows:

- **C1:** retain `/internal/design-system/foundations/<id>` and
  `foundation-detail-<id>` until the continuous reference and optional detail
  route have replacement coverage.
- **C2:** retain `/internal/design-system/components/<id>` and
  `component-detail-<id>`; project typed facts without importing the existing
  state sheet into an overview.
- **C3:** retain the component route and its honest no-output state; do not
  import a parked draft or create a specimen as part of documentation migration.
- **C4:** retain the component route plus every separately listed
  hash/query/preview contract while Canonical, Workbench, and Records wrappers
  are split.

Verification owners used below:

- **Index owner:** S2a-1 projection/search/direct-reload tests.
- **Foundation owner:** S2a-2 for the continuous reference and canvas; S2b for
  Typography; S6 for the remaining content migrations.
- **Ordinary owner:** S3 for Button; S6 for Select and remaining ordinary
  catalog batches.
- **Chart owner:** S4 wrapper migration plus the existing Chart browser suites.
- **Heavy owner:** S7 owner-bounded Table, auction, transaction, Studies, and
  product-context migrations.
- **Cleanup owner:** S8 consumer scan, replacement coverage, and housekeeping.

## Catalog snapshot

The post-merge typed sources contain 9 foundations and 45 components. The
foundation authority count is 8 `current-baseline` and 1 `exploratory`. The
component authority count is 34 `current-baseline`, 6 `exploratory`, and 5
`undefined`. Component output is 35 `rendered`, 5 `in-composition`, and 5
`none`. `CURRENT_REVIEW` contains 0 entries.

These counts were derived by importing the typed modules, not by counting
rendered cards or copied audit text.

## Foundation catalog rows

Current owner for all rows:
`src/views/internal/design-system/foundation-catalog.ts`. Current routes are
`/internal/design-system/foundations/<id>`; current detail test IDs are
`foundation-detail-<id>`.

| Key             | Name                          | Source fact: `authority / output / status` | Planned destination                              | Slice                   | Compatibility                                         | Verification owner |
| --------------- | ----------------------------- | ------------------------------------------ | ------------------------------------------------ | ----------------------- | ----------------------------------------------------- | ------------------ |
| `color`         | Color                         | `current-baseline / rendered / defined`    | Canonical; evidence in Records                   | S6 after overview shell | C1                                                    | Foundation owner   |
| `typography`    | Typography                    | `current-baseline / rendered / defined`    | Canonical; candidate/history material in Records | S2b                     | C1; retain Typography test IDs through test migration | Foundation owner   |
| `spacing`       | Spacing & density             | `current-baseline / rendered / defined`    | Canonical; evidence in Records                   | S6                      | C1                                                    | Foundation owner   |
| `radius`        | Radius                        | `current-baseline / rendered / defined`    | Canonical; evidence in Records                   | S6                      | C1                                                    | Foundation owner   |
| `layout`        | Layout & responsive structure | `exploratory / rendered / evidence-found`  | Workbench; evidence in Records                   | S7 with Studies         | C1                                                    | Heavy owner        |
| `elevation`     | Elevation                     | `current-baseline / rendered / defined`    | Canonical; evidence in Records                   | S6                      | C1                                                    | Foundation owner   |
| `motion`        | Motion                        | `current-baseline / rendered / defined`    | Canonical; evidence in Records                   | S6                      | C1                                                    | Foundation owner   |
| `iconography`   | Iconography                   | `current-baseline / rendered / defined`    | Canonical; evidence in Records                   | S6                      | C1                                                    | Foundation owner   |
| `accessibility` | Accessibility                 | `current-baseline / rendered / defined`    | Canonical; evidence in Records                   | S6                      | C1                                                    | Foundation owner   |

Planned `/internal/design-system/foundations#<id>` anchors do not exist yet.
S2a-2 owns their creation and must keep the existing detail routes valid.

## Component catalog rows

The owner is the typed file named for each group. Every current detail route is
`/internal/design-system/components/<id>` and exposes
`component-detail-<id>`. `Records` is implicit for exact catalog metadata and
evidence even when the primary destination is Canonical or Workbench.

### Primary catalog

Owner: `src/views/internal/design-system/component-catalog-primary.ts`.

| Key                   | Name                | Source fact: `authority / output / status / review / implementation / adoption`        | Planned destination                                              | Slice                                        | Compatibility                                                        | Verification owner      |
| --------------------- | ------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------- | -------------------------------------------------------------------- | ----------------------- |
| `button`              | Button              | `current-baseline / rendered / evidence-found / ready / canonical-candidate / none`    | Canonical                                                        | S3                                           | C2                                                                   | Ordinary owner          |
| `icon-button`         | Icon button         | `current-baseline / rendered / evidence-found / ready / canonical-candidate / none`    | Canonical                                                        | S6                                           | C2                                                                   | Ordinary owner          |
| `button-group`        | Action group        | `current-baseline / rendered / evidence-found / ready / reusable-recipe / none`        | Canonical                                                        | S6                                           | C2                                                                   | Ordinary owner          |
| `transaction-action`  | Transaction system  | `exploratory / rendered / evidence-found / ready / specimen / none`                    | Workbench; Records; Legacy alias unresolved                      | S7                                           | C4                                                                   | Heavy owner             |
| `input`               | Text input          | `current-baseline / rendered / evidence-found / ready / canonical-candidate / none`    | Canonical                                                        | S6                                           | C2; retain `#complex-field-group-review` separately                  | Ordinary owner          |
| `textarea`            | Textarea            | `current-baseline / rendered / evidence-found / ready / canonical-candidate / none`    | Canonical                                                        | S6                                           | C2                                                                   | Ordinary owner          |
| `select`              | Select              | `current-baseline / rendered / evidence-found / ready / canonical-candidate / none`    | Canonical                                                        | S6 clean-composition check                   | C2                                                                   | Ordinary owner          |
| `combobox`            | Combobox            | `undefined / none / not-needed / deferred / none / none`                               | Records (`Not planned` derives only from `not-needed`)           | S6 catalog batch                             | C3                                                                   | Index + Ordinary owners |
| `multi-select-filter` | Multi-select filter | `current-baseline / rendered / evidence-found / ready / canonical-candidate / none`    | Canonical                                                        | S6                                           | C2                                                                   | Ordinary owner          |
| `search`              | Search field        | `current-baseline / rendered / evidence-found / ready / canonical-candidate / none`    | Canonical                                                        | S6                                           | C2                                                                   | Ordinary owner          |
| `amount-field`        | Amount field        | `exploratory / in-composition / evidence-found / exploration / reusable-recipe / none` | Workbench under Transactions                                     | S7                                           | C4; typed composition anchor is `#transaction-composition-rfq`       | Heavy owner             |
| `asset-picker`        | Asset picker        | `exploratory / in-composition / evidence-found / exploration / reusable-recipe / none` | Workbench under Transactions                                     | S7                                           | C4; typed composition anchor is `#transaction-composition-rfq`       | Heavy owner             |
| `checkbox`            | Checkbox            | `current-baseline / rendered / evidence-found / ready / canonical-candidate / none`    | Canonical                                                        | S6                                           | C2                                                                   | Ordinary owner          |
| `radio-group`         | Radio group         | `current-baseline / rendered / evidence-found / ready / canonical-candidate / none`    | Canonical                                                        | S6                                           | C2                                                                   | Ordinary owner          |
| `switch`              | Switch              | `current-baseline / rendered / evidence-found / ready / canonical-candidate / none`    | Canonical                                                        | S6                                           | C2                                                                   | Ordinary owner          |
| `segmented-control`   | Segmented control   | `current-baseline / rendered / evidence-found / ready / canonical-candidate / none`    | Canonical                                                        | S6                                           | C2                                                                   | Ordinary owner          |
| `slider`              | Slider              | `undefined / none / evidence-found / not-started / none / none`                        | Records until separately authorized work exists                  | S6 index only; later component work separate | C3; preserve detached assessment outside this migration              | Index + Ordinary owners |
| `global-navigation`   | Global navigation   | `current-baseline / rendered / defined / ready / canonical-candidate / none`           | Canonical; current full comparison in Workbench                  | S7 navigation system                         | C4; retain `#navigation-review`                                      | Heavy owner             |
| `product-navigation`  | Product navigation  | `current-baseline / rendered / defined / ready / canonical-candidate / none`           | Canonical; current full comparison in Workbench                  | S7 navigation system                         | C4; retain `#navigation-review`                                      | Heavy owner             |
| `link`                | Link                | `current-baseline / rendered / evidence-found / ready / canonical-candidate / none`    | Canonical                                                        | S6                                           | C2                                                                   | Ordinary owner          |
| `tabs`                | Tabs                | `current-baseline / rendered / evidence-found / ready / canonical-candidate / none`    | Canonical                                                        | S6                                           | C2                                                                   | Ordinary owner          |
| `pagination`          | Pagination          | `current-baseline / rendered / evidence-found / ready / canonical-candidate / none`    | Canonical                                                        | S6                                           | C2                                                                   | Ordinary owner          |
| `stepper`             | Stepper             | `exploratory / in-composition / evidence-found / exploration / specimen / none`        | Workbench under Transactions                                     | S7                                           | C4; typed composition anchor is `#transaction-composition-vote-lock` | Heavy owner             |
| `breadcrumb`          | Breadcrumb          | `undefined / none / evidence-found / deferred / none / none`                           | Records (`Not started`; deferred readiness is not `Not planned`) | S6 catalog batch                             | C3                                                                   | Index + Ordinary owners |

### Support catalog

Owner: `src/views/internal/design-system/component-catalog-support.ts`.

| Key               | Name                  | Source fact: `authority / output / status / review / implementation / adoption`      | Planned destination                                                          | Slice                                     | Compatibility                                          | Verification owner      |
| ----------------- | --------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------ | ----------------------- |
| `dialog`          | Dialog                | `current-baseline / rendered / evidence-found / ready / canonical-candidate / none`  | Canonical; pressure studies in Workbench                                     | S6/S7                                     | C4; retain modal-study link                            | Ordinary + Heavy owners |
| `drawer`          | Drawer                | `exploratory / rendered / evidence-found / exploration / canonical-candidate / none` | Workbench                                                                    | S6                                        | C2                                                     | Ordinary owner          |
| `popover`         | Popover               | `current-baseline / in-composition / defined / ready / canonical-candidate / none`   | Canonical                                                                    | S6                                        | C2; preserve composition link to `multi-select-filter` | Ordinary owner          |
| `dropdown-menu`   | Menu                  | `current-baseline / rendered / defined / ready / canonical-candidate / none`         | Canonical                                                                    | S6                                        | C2                                                     | Ordinary owner          |
| `tooltip`         | Tooltip               | `current-baseline / rendered / defined / ready / canonical-candidate / none`         | Canonical                                                                    | S6                                        | C2                                                     | Ordinary owner          |
| `alert`           | Inline message        | `current-baseline / rendered / evidence-found / ready / canonical-candidate / none`  | Canonical                                                                    | S6                                        | C2                                                     | Ordinary owner          |
| `toast`           | Toast                 | `undefined / none / evidence-found / not-started / none / none`                      | Records until separately authorized integration                              | S6 index only; integration slice separate | C3; do not import the parked draft                     | Index + Ordinary owners |
| `progress`        | Progress indicator    | `undefined / none / evidence-found / not-started / none / none`                      | Records until separately authorized integration                              | S6 index only; integration slice separate | C3; do not import the parked draft                     | Index + Ordinary owners |
| `spinner`         | Spinner               | `current-baseline / rendered / evidence-found / ready / canonical-candidate / none`  | Canonical                                                                    | S6                                        | C2                                                     | Ordinary owner          |
| `skeleton`        | Skeleton              | `current-baseline / rendered / evidence-found / ready / canonical-candidate / none`  | Canonical                                                                    | S6                                        | C2                                                     | Ordinary owner          |
| `empty-state`     | Empty state           | `current-baseline / rendered / evidence-found / ready / canonical-candidate / none`  | Canonical                                                                    | S6                                        | C2                                                     | Ordinary owner          |
| `badge`           | Lifecycle status      | `current-baseline / rendered / evidence-found / ready / canonical-candidate / none`  | Canonical                                                                    | S6                                        | C2                                                     | Ordinary owner          |
| `entity-identity` | Entity identity       | `current-baseline / rendered / evidence-found / ready / canonical-candidate / none`  | Canonical                                                                    | S6                                        | C2                                                     | Ordinary owner          |
| `metric`          | Metric                | `current-baseline / rendered / evidence-found / ready / canonical-candidate / none`  | Canonical                                                                    | S6                                        | C2                                                     | Ordinary owner          |
| `card`            | Card / content region | `current-baseline / rendered / evidence-found / provisional / specimen / none`       | Canonical with sourced bounded-scope line; current review sheet in Workbench | S6                                        | C4                                                     | Ordinary owner          |
| `table`           | Table                 | `current-baseline / rendered / evidence-found / ready / specimen / none`             | Canonical summary; family tools in Workbench; Legacy alias unresolved        | S7                                        | C4                                                     | Heavy owner             |
| `data-table`      | Data table            | `exploratory / in-composition / evidence-found / provisional / specimen / none`      | Workbench under Tables                                                       | S7                                        | C4; typed composition anchor is `#table-family-review` | Heavy owner             |
| `chart`           | Chart                 | `current-baseline / rendered / evidence-found / ready / specimen / none`             | Canonical pattern summary; Workbench; Records                                | S4                                        | C4                                                     | Chart owner             |
| `copy-value`      | Copyable value        | `current-baseline / rendered / evidence-found / ready / canonical-candidate / none`  | Canonical                                                                    | S6                                        | C2                                                     | Ordinary owner          |
| `accordion`       | Accordion             | `current-baseline / rendered / evidence-found / ready / canonical-candidate / none`  | Canonical                                                                    | S6                                        | C2                                                     | Ordinary owner          |
| `collapsible`     | Collapsible           | `current-baseline / rendered / evidence-found / ready / canonical-candidate / none`  | Canonical                                                                    | S6                                        | C2                                                     | Ordinary owner          |

## Non-catalog route ledger

Current route owner:
`src/views/internal/design-system/index.tsx`. All destinations below are current
facts; proposed routes such as `/workbench/*` and `/records/*` are not treated as
existing contracts.

| Contract                                            | Current behavior and owner                                 | Planned destination                                                        | Slice        | Compatibility action                                                          | Verification owner                |
| --------------------------------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------- | ------------ | ----------------------------------------------------------------------------- | --------------------------------- |
| `/internal/design-system`                           | Index redirect to `/foundations`                           | Start route after shell approval                                           | S2a-1        | Preserve as a verified redirect; change target only with route tests          | Index owner                       |
| `/internal/design-system/foundations`               | `FoundationsOverview`; `foundations-overview`              | Canonical continuous reference                                             | S2a-2        | Same route; replace card gateway without mounting nine detail trees           | Foundation owner                  |
| `/internal/design-system/foundations/:foundationId` | `FoundationDetail`; invalid IDs redirect to `/foundations` | Canonical optional deep dive                                               | S2a-2/S2b/S6 | Preserve all 9 IDs and invalid-ID fallback                                    | Foundation owner                  |
| `/internal/design-system/components`                | `ComponentsOverview`; `components-overview`                | Canonical result-bearing index                                             | S2a-1        | Same route; remove live state-sheet wall only with replacement index coverage | Index owner                       |
| `/internal/design-system/components/:componentId`   | `ComponentDetail`; invalid IDs redirect to `/components`   | Destination selected by catalog authority; stable catalog identity remains | S3–S7        | Preserve all 45 IDs and invalid-ID fallback                                   | Index plus owning migration slice |
| `/internal/design-system/studies`                   | `LayoutStudiesPage`; `layout-studies-page`                 | Workbench                                                                  | S7           | Retain route as alias until every study has a classified replacement          | Heavy owner                       |
| `/internal/design-system/screens`                   | `ScreensPage`; `screens-overview`                          | Split by host purpose; launchers/adoption evidence in Records              | S7           | Retain route until each golden-screen entry is classified                     | Heavy owner                       |
| `/internal/design-system/status`                    | `StatusPage`; `project-status-page`                        | Current Review in Workbench; tracker in Records                            | S2a-1/S7     | Retain route until both projections have parity                               | Index + Heavy owners              |
| `/internal/design-system/*`                         | Unknown lab paths redirect to `/foundations`               | Shell-defined fallback                                                     | S2a-1        | Test direct reload and fallback after route changes                           | Index owner                       |

## Hash and fragment contracts

Contract-role labels distinguish why a fragment is protected:

- **Source-owned:** a typed catalog, router/dispatcher, or visible in-page link
  emits or branches on the fragment.
- **Evidence-owned:** a durable plan/evidence receipt names the fragment as its
  review URL. Its source anchor still supplies the DOM target.
- **Test-owned:** browser tests navigate directly to the fragment, but no typed
  catalog link, visible navigation link, or durable evidence URL was recovered.

A row may have more than one role. A native-scroll fragment still needs fresh-tab
reload verification even when no React branch reads it.

| Fragment on current route                                          | Contract role and current owner                                                                                                        | Current target/test seam            | Planned destination                                              | Slice and action                                                 |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------- |
| `/foundations/color#color-contrast-review`                         | Test-owned; `color-contrast-review.tsx`                                                                                                | `color-contrast-review`             | Canonical/Records split                                          | S6; preserve until color tests migrate                           |
| `/studies#modal-family-study`                                      | Source-owned; link in `components-pages.tsx`, target in `modal-family-study.tsx`                                                       | `modal-family-study`                | Workbench                                                        | S7; preserve link and fragment                                   |
| `/components/product-navigation#navigation-review`                 | Source-owned; `navigation-systems-state-sheet.tsx` and fixtures                                                                        | `navigation-systems-state-sheet`    | Canonical/Workbench split                                        | S7; preserve fragment                                            |
| `/components/input#complex-field-group-review`                     | Test-owned; `contained-form-row-review.tsx`                                                                                            | `contained-form-row-review`         | Workbench                                                        | S6; preserve through field test migration                        |
| `/components/chart#chart-first-review`                             | Evidence-owned; target `charts/review.tsx`, named by the mobile-axis pilot                                                             | `chart-first-review`                | Workbench entry for source review                                | S4; wrapper-only preservation                                    |
| `/components/chart#chart-next-families-review`                     | Evidence-owned; target `charts/next-families/responsive-review.tsx`, named by next-chart completion/integration records                | `next-chart-families-review`        | Workbench                                                        | S4; wrapper-only preservation                                    |
| `/components/chart#yield-price-pilot`                              | Test-owned; target `metric-line-chart.tsx`                                                                                             | `yield-price-pilot`                 | Workbench                                                        | S4; preserve direct test URL                                     |
| `/components/table#table-family-review`                            | Source-owned by `data-table.compositionSource`; target `table-family/review.tsx`                                                       | `table-family-review`               | Workbench                                                        | S7; preserve typed composition link                              |
| `/components/table#holdings-family-review`                         | Test-owned; target `table-family/holdings-review.tsx`                                                                                  | `holdings-review`                   | Workbench                                                        | S7; preserve direct browser-test URL                             |
| `/components/table#discover-family-review`                         | Evidence-owned; target `table-family/discover-review.tsx`                                                                              | `discover-review`                   | Workbench                                                        | S7; preserve evidence URL                                        |
| `/components/table#earn-family-review`                             | Evidence-owned; target `table-family/earn-review.tsx`                                                                                  | `earn-review`                       | Workbench                                                        | S7; preserve evidence URL                                        |
| `/components/table#owned-positions-review`                         | Evidence-owned; target `table-family/owned-review.tsx`                                                                                 | `owned-positions-review`            | Workbench                                                        | S7; preserve evidence URL                                        |
| `/components/table#auctions-browse-review`                         | Source- and evidence-owned; dispatcher default/history target in `auctions-browse/review.tsx` and `history-review.tsx`                 | `auctions-history-review`           | Workbench                                                        | S7; preserve deferred-workspace/history behavior and query state |
| `/components/table#auctions-current-table-review`                  | Source- and evidence-owned; dispatcher branch in `auctions-browse/review.tsx`, target assembled by `auctions-current-table/review.tsx` | `current-table-review`              | Canonical approved-current-table wrapper plus Workbench controls | S7; preserve before correcting the hashless default              |
| `/components/table#auctions-records-review`                        | Source- and evidence-owned; dispatcher branch and visible history link                                                                 | `auctions-browse-review`            | Workbench/Records                                                | S7; preserve earlier-record exploration                          |
| `/components/transaction-action#transaction-truth-spectrum`        | Evidence- and test-owned; root target in `transaction-truth-spectrum.tsx`                                                              | `transaction-system-review`         | Workbench                                                        | S7; preserve paused board entry                                  |
| `/components/transaction-action#transaction-composition-rfq`       | Source- and evidence-owned; typed composition links plus transaction navigation                                                        | `transaction-composition-rfq`       | Workbench                                                        | S7; preserve                                                     |
| `/components/transaction-action#transaction-composition-staged`    | Source- and evidence-owned; transaction navigation                                                                                     | `transaction-composition-staged`    | Workbench                                                        | S7; preserve                                                     |
| `/components/transaction-action#transaction-composition-stake`     | Source- and evidence-owned; transaction navigation                                                                                     | `transaction-composition-stake`     | Workbench                                                        | S7; preserve                                                     |
| `/components/transaction-action#transaction-composition-vote-lock` | Source- and evidence-owned; typed Stepper composition link plus transaction navigation                                                 | `transaction-composition-vote-lock` | Workbench                                                        | S7; preserve                                                     |
| `/components/transaction-action#transaction-paired-review`         | Source- and evidence-owned; transaction navigation                                                                                     | `transaction-paired-review`         | Workbench                                                        | S7; preserve                                                     |
| `/components/transaction-action#transaction-composition-atomic`    | Source- and evidence-owned; transaction navigation                                                                                     | `transaction-composition-atomic`    | Workbench                                                        | S7; preserve                                                     |
| `/components/transaction-action#transaction-review-reference`      | Source-owned; transaction navigation and status target                                                                                 | `transaction-system-review` subtree | Workbench/Records boundary                                       | S7; preserve                                                     |

## Table URL-state contracts

There are two different owners. They must not be collapsed into one query
matrix.

### Deferred current-rebalance workspace

- Route: hashless `/components/table` today and
  `/components/table#auctions-browse-review` in evidence/tests.
- Hash dispatch owner:
  `src/views/internal/design-system/auctions-browse/review.tsx`.
- URL-state owner:
  `src/views/internal/design-system/auctions-current/use-scene.ts`.
- URL-backed key: **`current` only**. Values come from
  `CURRENT_SCENARIOS` in `auctions-current/fixtures.ts`; an absent key defaults
  to `ready`, and an unrecognized value becomes `not-found`.
- `viewer`, `data`, `outcome`, `network`, clock, and archived records are local
  React state in `auctions-current/review.tsx`; they are not URL contracts.
- Contract roles: source-owned by `useCurrentScene`; evidence-owned by the
  current-rebalance visual-review report/coverage; heavily test-owned by the
  current-rebalance browser suites.
- Planned action: preserve through S7, then give the approved current table the
  hashless default without losing an explicit route to this deferred workspace.

### Approved current-table surface

- Route: `/components/table#auctions-current-table-review`, with optional query
  state.
- URL-state owner:
  `src/views/internal/design-system/auctions-current-table/review.tsx`.
- URL-backed keys are exactly:
  - **`current`** — values from `TABLE_SCENARIOS` in
    `auctions-current-table/model.ts`;
  - **`viewer`** — values from `VIEWERS`;
  - **`data`** — values from `DATA_STATES`;
  - **`network`** — `wrong` selects the wrong-network state; other/absent is
    the correct-network state;
  - **`rebalance-preview`** — opens the matching retained-detail preview and is
    removed by its return link.
- **`outcome` is not read by this owner.** It belongs only to local controls in
  the deferred workspace above.
- Contract roles: source-owned by `CurrentTableReview`; evidence-owned by the
  current-table evidence receipt; test-owned by the current-table, constrained,
  locale, hover, and all-states browser suites.
- Planned action: preserve all five keys through S7 and verify fresh-tab reload,
  invalid values, detail return, and hash retention before changing the default.

## Chart preview-document contracts

| Current document                                                      | Source fact and parameters                                                                                                                                                                      | Role                                                 | Planned action                                                                                   | Verification owner |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------ |
| `/src/views/internal/design-system/charts/mobile-preview.html`        | Explicit Vite input; `mobile-preview.tsx` reads `theme` (`light` or `dark`), `inspection` (`header` or `current`), and `chart` (`line` or `candles`) from the hash; root `chart-preview-root`   | Source- and test-owned; loopback iframe tool         | Preserve in S4; verify built output/direct navigation and the existing non-loopback inline path  | Chart owner        |
| `/src/views/internal/design-system/charts/next-families/preview.html` | Development source document, **not** a Vite input; `preview.tsx` reads `embedded` (`true` or `false`) and `theme` (`light` or `dark`) from the hash; responsive review uses it only on loopback | Source-, evidence-, and test-owned local review tool | Preserve local URL in S4; do not promise a hosted build artifact without explicit build evidence | Chart owner        |

## Important test-identifier contracts

This is the migration boundary, not an inventory of every fixture control. IDs
below identify a page, destination boundary, or deep-link family and therefore
must either remain or receive an explicit test migration in the owning slice.

| Surface                           | Current important IDs                                                                                                                                                                                                             | Current test owner                                                                                                                                                                                                                                                                                                                                                   | Migration owner                        |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| Shell and primary routes          | `design-system-lab`, `foundations-overview`, `components-overview`, `layout-studies-page`, `screens-overview`, `project-status-page`                                                                                              | `e2e/design-system/lab.spec.ts`, `lab-regressions.spec.ts`                                                                                                                                                                                                                                                                                                           | Index/Foundation/Heavy owners by route |
| Catalog detail routing            | `foundation-detail-<id>`, `component-detail-<id>`, `detail-navigation`                                                                                                                                                            | `e2e/design-system/lab.spec.ts` and catalog tests                                                                                                                                                                                                                                                                                                                    | Owning catalog slice                   |
| Current Review/status             | `current-review-empty`, `current-review-spotlight`, `component-delivery-status`, `component-catalog-metadata`                                                                                                                     | lab and catalog UI tests                                                                                                                                                                                                                                                                                                                                             | Index owner                            |
| Foundation progressive disclosure | `foundation-visual-overview`, `foundation-secondary-details`; Typography and color/radius IDs used by `lab.spec.ts`                                                                                                               | `e2e/design-system/lab.spec.ts`                                                                                                                                                                                                                                                                                                                                      | Foundation owner                       |
| Component index/detail disclosure | `canonical-component-overview`, `component-secondary-details`, `component-output-missing`                                                                                                                                         | lab and regression suites                                                                                                                                                                                                                                                                                                                                            | Index + Ordinary owners                |
| Charts                            | `chart-first-review`, `chart-pressure-toggle`, `next-chart-families-review`, `yield-price-pilot`, `chart-mobile-preview`, `chart-preview-root`                                                                                    | `e2e/design-system/chart-*-lab-regressions.spec.ts`                                                                                                                                                                                                                                                                                                                  | Chart owner                            |
| Chart responsive previews         | `next-families-mobile-preview-320`, `next-families-mobile-preview-390`, `next-families-preview-normal`, `next-families-preview-narrow`                                                                                            | `e2e/design-system/chart-next-families-integration-lab-regressions.spec.ts`                                                                                                                                                                                                                                                                                          | S4 Chart owner                         |
| Table families                    | `table-family-review`, `holdings-review`, `discover-review`, `earn-review`, `owned-positions-review`                                                                                                                              | corresponding family browser suites                                                                                                                                                                                                                                                                                                                                  | Heavy owner                            |
| Auction families                  | `current-rebalance-review`, `current-table-review`, `auctions-history-review`, `auctions-browse-review`                                                                                                                           | `current-rebalance-*` and `auctions-*` browser suites                                                                                                                                                                                                                                                                                                                | Heavy owner                            |
| Current/historical auction tables | `current-rebalances-table`, `historical-rebalances-table`, `current-retained-detail`                                                                                                                                              | `e2e/design-system/current-rebalance-{table,table-locales,all-states,launcher-help,matrix,actions,details}-lab-regressions.spec.ts`; `e2e/design-system/auctions-{history,table-constrained,closeout}-lab-regressions.spec.ts`; `e2e/design-system/content-hover-lab-regressions.spec.ts`; `src/views/internal/design-system/auctions-browse/tests/history.test.tsx` | S7 Heavy owner                         |
| Transaction board                 | `transaction-system-review`, `transaction-composition-rfq`, `transaction-composition-staged`, `transaction-composition-stake`, `transaction-composition-vote-lock`, `transaction-paired-review`, `transaction-composition-atomic` | transaction unit/browser suites                                                                                                                                                                                                                                                                                                                                      | Heavy owner                            |

## Cleanup-candidate ledger

These rows authorize later revalidation only. None authorizes deletion in S1.

| Candidate                                         | Current owner/evidence                                                                                                                                                       | Current fact                                                                                                                                                                          | Owning slice and required proof                                                                                          |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Stale Studies status/copy                         | `modal-geometry-study.tsx`; `layout-architecture-study.tsx`; accepted decision ledger                                                                                        | Current Studies presentation contains candidate-era status/copy that the reconciled audit marked stale                                                                                | S7; compare each statement to its current accepted owner, then update tests                                              |
| Meaning-colors classification                     | `meaning-color-study.tsx` plus color/performance owners                                                                                                                      | Its “Values open” presentation conflicts with newer accepted areas but the exact remaining open boundary is not yet derived                                                           | S7; reconcile both authorities before moving or editing                                                                  |
| Accepted-foundation candidate scaffolding         | `foundation-candidate-direction.tsx`                                                                                                                                         | Current-baseline items still render “Accepted direction” with candidate-era validation sections                                                                                       | S2b/S6; move only source-backed current guidance, retain history/provenance where unique                                 |
| Typography relative copy and accepted refinements | `src/views/internal/design-system/typography-recommended-refinements.tsx`; `src/views/internal/design-system/tests/typography-review.test.tsx`; remaining Typography studies | The relative copy still needs correction; Recommended refinements explicitly identifies its group as part of the accepted current baseline, and the test verifies that accepted group | S2b; correct the stale relative copy while preserving and projecting the accepted refinements rather than reopening them |
| Foundation evidence placeholders                  | `foundation-reference.tsx` fallback used by spacing, elevation, and accessibility                                                                                            | The shared fallback says no structured evidence exists                                                                                                                                | S6; replace only after a current source is named, otherwise retain an honest gap in Records                              |
| Hashless Table default                            | `auctions-browse/review.tsx` and `components-pages.tsx`                                                                                                                      | Hashless Table currently reaches the deferred workspace/history composition, not `CurrentTableReview`                                                                                 | S7; preserve both URL-state owners and all deep links before changing default                                            |
| Unimported control-geometry matrix                | `control-geometry-matrix.tsx`; current source import scan                                                                                                                    | No import was recovered                                                                                                                                                               | S8; repeat consumer/reference scan after migrations, then delete only if no unique content remains                       |
| Test-only product-facing audit                    | `product-facing-component-audit.ts`                                                                                                                                          | Imported by `component-catalog.test.ts` and `inventory-reconciliation.test.tsx`, not by the rendered lab                                                                              | S8; replace its unique decision lanes and deliberately migrate both tests before removal                                 |
| Repeated disclaimer/provenance copy               | chart/table/transaction specimens                                                                                                                                            | Similar frozen/simulated/not-live notes are repeated across existing tools                                                                                                            | S4/S7; replace with the planned single provenance shape without erasing unique constraints                               |
| Duplicate Chart viewport controls                 | `charts/review.tsx` and `charts/next-families/responsive-review.tsx`                                                                                                         | Two control conventions remain in the frozen Chart surface                                                                                                                            | Separate bounded follow-up after S4; not wrapper cleanup                                                                 |
| Old overview/dispatcher/navigation structures     | `lab-shell.tsx`, `lab-navigation.tsx`, overview/dispatcher files                                                                                                             | Still required by current routes and tests                                                                                                                                            | S8 only after every ledger row has route/evidence parity                                                                 |

## Unresolved rows and S1 convergence

The following classifications remain intentionally unresolved and block the
corresponding implementation or cleanup action:

1. **U1/U3 — Legacy aliases:** whether Tables/records, Forms, Navigation
   systems, and Transactions appear as temporary `Legacy lab` sidebar aliases.
   Catalog identity and current URLs are known; the alias presentation is not
   approved.
2. **U2 — activity ownership:** whether paused transaction activity is a typed
   additive field or the single presentation-only annotation permitted by U13.
   The typed `transaction-action` authority remains `exploratory`; the ledger
   does not infer Paused from prose.
3. **U13 — markdown/inline derivation:** tested build-time heading/source
   extraction versus a minimal presentation index restricted to source key,
   route, question, owner, and activity. No normative prose may be copied into
   that index.
4. **Screens classification:** each golden-screen launcher still needs an
   item-level Canonical host / Workbench comparison / Records launcher decision
   in S7. The current `/screens` route is protected until that is complete.
5. **Meaning colors:** the remaining open boundary must be reconciled against
   both current color and performance owners before migration.
6. **Hosted next-family preview:** the source-path document is a loopback tool
   and not a Vite input. S4 must not claim it is hosted unless a built target is
   explicitly added and verified.

S1 ledger convergence at this snapshot:

- 54 catalog IDs recorded: 9 foundations and 45 components.
- 9 current route/fallback contracts recorded.
- 23 current fragment contracts recorded.
- 2 distinct Table URL-state owners recorded; the approved current-table matrix
  has 5 keys and does not include `outcome`.
- 2 Chart preview documents recorded with different build status.
- 11 groups of page/family-level test identifiers recorded, including the
  specifically pinned Chart responsive-preview and auction-table/detail IDs.
- 11 cleanup candidates recorded; all remain later-slice work.
- 6 unresolved classification/verification items remain. They are explicit
  gates, not missing inventory.

Before S8 removes any old structure, the owning slice must update this ledger
so its row has a final destination, replacement URL or verified alias, current
test/evidence pointer, and no unresolved marker.
