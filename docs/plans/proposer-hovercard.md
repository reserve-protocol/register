# Proposer hovercard

Status (2026-11-17): slices 1–5 are implemented and verified. The hovercard now also covers Yield governance and moved to `src/components/governance/address-hovercard/`. reserve-api is in PR #293, which now also has a batch route (`/governance/accounts?addresses=`) and `fresh=true`; the hovercard reads fresh next to a proposal created in the last 10 minutes, and the proposal lists and delegate tables preload their other addresses through the batch route on the first hover. Register is on `feat/proposer-hovercard`, uncommitted. Independent review is pending. Delete this plan once both PRs merge.

## Goal

Show on-chain context for any wallet address in the Index DTF governance section, without a curated list of trusted wallets. Design: "Split header" (Explorations · 5) from the Proposer Context canvas.

The card shows:
- ENS (or the address), the blockie, and copy and explorer links.
- Role chips for this DTF and a Safe multisig chip.
- Voting power in this DTF: the %, own vs delegated, and the number of delegators.
- Proposals and votes cast for this DTF and across all listed Index DTFs.
- Executed, defeated and vetoed outcomes. Zero rows are hidden; proposals and votes cast always show.
- "Voting power since": the first lock or delegation in this DTF's stToken.
- First action and last action, dates only.
- Links to Proposals (governance explorer filtered by proposer) and Portfolio (`/portfolio?account=`).

Desktop opens on hover. Mobile opens a bottom sheet on tap.

## Current state

- No react-sdk hook takes a proposer or voter filter. The SDK subgraph queries have no address `where` clause.
- reserve-api has no per-address governance profile. The closest code is:
  - `TransactionHistoryService` and `getIndexUserTransactions`: proposals, votes, delegateChanges and locks for one address. Capped at `first: 100`, with no outcome state.
  - `getIndexDelegatedStTokens`: `tokenHoldersRepresentedAmount`.
- The subgraph only writes CANCELED, EXECUTED, QUEUED and ACTIVE. DEFEATED and VETOED never appear raw. `@reserve-protocol/sdk` exports the pure `getProposalState(input, timestamp)`; the API is on 0.7.0 and Register on 0.8.2.
- Register already has what this needs:
  - Roles in `indexDTFAtom` (`roles.admin`, guardians, `brandManagers`, `auctionLaunchers`, `feeRecipients`).
  - `useIndexDtfVoterState` (live own balance, voting power and vote supply over RPC).
  - `useIsSafeAccount` (works for any address).
  - `EnsName`, `BlockiesAvatar` and `ExplorerAddress`.
  - Radix `HoverCard`, plus a hover-and-tap pattern in `governance-vote-lock.tsx`.
- Addresses render today in:
  - "Proposed by" (`proposal-header.tsx`)
  - the delegates table (`governance-delegate-list.tsx`)
  - the votes list (`proposal-detail-votes.tsx`)

  Proposal list rows show no proposer.
- The governance explorer has no URL params and does not fetch the proposer. It already limits itself to listed DTFs.

## Non-goals

- A trusted or verified list, or any label Reserve assigns.
- Action types on "last action".
- Roles in other DTFs.
- Changes to the proposal detail page layout beyond the hovercard trigger.
- The hovercard on Yield DTF governance pages. "All Reserve" totals do include listed Yield DTFs; only the surfaces are Index-only.
- Deploying reserve-api, and publishing anything.

## Acceptance evidence

- **reserve-api, `GET /dtf/governance/accounts/{address}`:**
  - Zod schema, listed in `/documentation`.
  - Aggregates over `indexChains`, restricted to listed catalog DTFs (active, unsupported and deprecated).
  - Derives outcomes with `getProposalState`.
  - Reports `degradedChains`.
  - Service unit tests: outcome derivation (executed, defeated, vetoed, canceled, still open), listed-DTF filter, shared stToken mapped per DTF, voting-power-since, first and last action, pagination cap, one chain down → degraded.
  - Worker route test. `pnpm test`, `pnpm typecheck` and `pnpm build` green.
- **Register:**
  - The hovercard renders the Split header design with live data on a DTF page, verified in the browser against the local API.
  - States covered: known proposer, first proposal, delegate with no proposals, loading, API error or degraded.
  - Wired into "Proposed by", proposal list rows (new "by" line), the delegates table and the votes list.
  - Mobile tap opens the sheet.
  - The explorer `?proposer=` filter works from the Proposals link.
  - e2e: extend `smoke/governance.spec.ts` and `governance-states.spec.ts` with the API mocked; add an explorer filter spec.
  - Mixpanel event on open. es, ko and zh translations for new msgids.
  - `scope.mjs --gate` green; wiki-lint green.

## Test seams

- **API:** the service seam (deps mocked: subgraph, catalog, clock) for the aggregation and derivation, and the worker route for the contract.
- **Register:**
  - a pure mapper from the API response plus voter state plus roles to the card view model (unit);
  - the component through e2e with `overrides.api` and the subgraph mocked;
  - the explorer filter through e2e.

## Slices

- **Slice 1 · API endpoint.** Schema, service and route in reserve-api, unit and worker tests. Blocked by: none.
- **Slice 2 · Hovercard on "Proposed by".**
  - Data hook (API through react-query, enabled on open) plus voter state, roles and Safe.
  - Split header component, loading and error states.
  - e2e with the API mocked, and a live check against the local API.

  Blocked by: slice 1 (the contract shape; a mock is enough to start).
- **Slice 3 · Other surfaces.** Delegates table, votes list, and a proposer "by" line on proposal list rows. Mobile tap sheet. Blocked by: slice 2.
- **Slice 4 · Explorer filter.** Fetch the proposer, add `?proposer=` seeding the filter, and point the Proposals link to it. Blocked by: none (it can run in parallel with slice 2).
- **Slice 5 · Closeout.** Mixpanel, locales, wiki (`sdk.md` note on the API exception, governance area guide, TEST_MAP), gate, visual check, progress row. Blocked by: slices 2–4.

## Decisions (confirmed 2026-11-17)

- **Data source:** a new reserve-api endpoint, not a react-sdk hook. Register fetches it directly, like `/portfolio`.
- **Surfaces:** "Proposed by", proposal list rows (new "by" line), the delegates table and the votes list.
- **"All Reserve":** listed Index DTFs (active, unsupported, deprecated; Ethereum, Base, BSC) plus listed Yield DTFs from their governance subgraph, with outcomes from `getYieldDtfProposalState`.

## Unresolved decisions

- **Yield listed set:** confirm which chains and catalog statuses the API already uses for listed Yield DTFs.
- **"This DTF" votes for shared vote-lock vaults (vlRSR):** count votes on this DTF's governance proposals only, not every vote by that stToken delegate.
- **API SDK bump:** 0.7.0 → 0.8.x, if `getProposalState` is missing or differs in 0.7.0.

Strongest case against: per-address subgraph scans are capped (`first` pagination). Very active voters could be undercounted unless we paginate. The plan paginates up to a fixed cap and returns `truncated: true` when it hits it.
