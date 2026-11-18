# Explorer redesign

Status (2026-11-17): active. Fixed point `5705524a2` on `feat/proposer-hovercard`. Delete this plan when the branch merges.

## Goal

Rebuild the explorer tabs (Transactions, Collaterals, Governance, Revenue; Tokens was removed during the stage) on the surface language of the Index DTF overview, from the approved mockups ("Explorer redesign" page of the Explorer Header Options canvas).

- Warm gradient header with the tab title in primary; white card over it; no secondary fills inside the card.
- Desktop nav: a floating capsule with icon and label per tab; the active tab uses the accent fill.
- One toolbar per tab with uniform pills (label inside the control), a segmented control on the muted token, and a search field where a tab has one.
- Desktop keeps a table; below `sm` every tab renders a list of items, with no horizontal scroll and no clipped filters.
- The network is a badge on the token logo, never a separate chip or column.
- Primary is text only: the title, the sorted column and its values.

## Current state

- `src/views/explorer/index.tsx` owns the nav (underlined text links). Each tab owns its title and filters and renders the shared legacy `Table`, which scrolls sideways on mobile.
- Filters are label-above dropdowns built on `explorer/components/MultiselectDropdown.tsx`. On mobile, Transactions hides the wallet and token filters.
- Tokens dumps the row JSON on click. Collaterals has no filters and clips the APY column. Revenue repeats "Connect Wallet" on every Index card and uses secondary-filled cards.
- Governance already filters by `?proposer=` (chip `explorer-proposer-filter`).

## Non-goals

- Changing what data any tab reads, or its queries, beyond the new client-side filters.
- The shared `DataTable`, `legacy-table` and `TabMenu` components: the explorer gets its own table.
- Dark-mode redesign beyond what the tokens give.

## Scope changes during the stage

Requested after the mockups were approved; they override the lines above and below where they differ.

- The Tokens tab is removed. `/explorer/tokens` redirects to Transactions.
- Tables show a thin progress bar on the line under the toolbar until every source has answered.
- Revenue `Distribute` keeps one label for every wallet state: the click connects, switches chain and then sends. No "Switch to X" button.
- The address hovercard is in the Proposals list (it takes the row's DTF). It opens to the side on every page, and its skeleton reserves the final layout.
- Transactions: only Time is sortable. The two subgraphs share no other order field.
- The explorer hovercard reads voting power through the proposal's governor (Index) or the RToken's stake token (Yield).
- Filter menus are checkbox lists that apply on toggle. Inactive DTFs get the shared Inactive badge. A Revenue › Yield row toggles on a click anywhere.

## Acceptance evidence

- Each tab matches its mockup at 1440 px and 390 px with live data: screenshots in the session artifact, default state plus one edge state (active filter, expanded Yield row, empty result).
- Governance: `Period` filter (Last week, Last month, Last 3 months, Last year, All) on the creation date, default Last month, in the URL as `?period=`; the hovercard's Proposals link opens with `period=all`. Proposer can be set from the toolbar and from a row.
- Collaterals: search plus Network, Protocol and Target filters. Tokens: row opens the DTF.
- Transactions: Mint is a plus and Redeem a minus; Index DTF rows show their real logo.
- Unit tests for the new pure logic (period window, collateral filter, pager window). e2e: `general/explorer/render` still green, plus a mobile list check and the period default.
- `scope.mjs --gate` green; wiki-lint green; es, ko and zh filled for the new msgids.

## Test seams

- Pure helpers under `src/views/explorer/**/tests/` (period window, collateral filtering, page window).
- The rendered tabs through the offline e2e harness (`e2e/tests/general/explorer/`).

## Slices

- Slice 1 · Kit and shell: nav, header, card, toolbar, pill, segmented, search, explorer table with mobile list and pager; blocked by: none.
- Slice 2 · Governance: period and proposer filters, proposer in the description, mobile list; blocked by: slice 1.
- Slice 3 · Transactions; blocked by: slice 1.
- Slice 4 · Tokens; blocked by: slice 1.
- Slice 5 · Collaterals; blocked by: slice 1.
- Slice 6 · Revenue (Index, Yield, Trades); blocked by: slice 1.
- Slice 7 · Closeout: locales, e2e, TEST_MAP, wiki, visual check, gate; blocked by: slices 2–6.

## Unresolved decisions

None blocking. Assumptions, confirmed by the approval of the mockups: result counts in the header; "Yield DTFs" as the Tokens title; readable protocol names; one "Connect a wallet" hint instead of a per-row cell in Governance.

Strongest case against: a table per feature duplicates the shared `DataTable`. It stays local because the shared one cannot render a mobile list, a pager footer or the sorted-column emphasis without changing defaults that eight other views use.
