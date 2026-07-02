---
title: SDK
updated: 2026-07-02
type: context
---

# SDK — Use It First (Index DTF)

`@reserve-protocol/react-sdk` (wraps `@reserve-protocol/sdk` — always import from `react-sdk`) is Register's primary source for Index DTF reads, governance state, proposal builders, and transaction calls. Before writing any new hook/updater/script for Index DTF data, check the SDK — it almost always has it.

## Two sources of truth, no local setup

1. **Installed package** — `node_modules/@reserve-protocol/react-sdk/dist/index.d.mts` is the version-accurate export list. Discover anytime:
   ```bash
   grep -oE "export \{[^}]*\}" node_modules/@reserve-protocol/react-sdk/dist/index.d.mts \
     | tr ',' '\n' | grep -oE "[A-Za-z0-9_]+" | sort -u
   ```
2. **SDK repo `reserve-protocol/dtf-interface`** — agent docs in `docs/`: `docs/README.md` (index), `docs/sdk/api-surface.md` (API shape), `docs/register/interface.md` (+ governance/issuance flow docs), `docs/known-gotchas.md`, `AGENTS.md` (data-boundary rules).

Confirm exact current names in the installed package before use — never invent hook names.

## What it gives you

- **Read hooks** (React Query): `useIndexDtf`, `useIndexDtfBasket`/`useCurrentIndexDtfBasket`, `useIndexDtfPrice`, `useIndexDtfProposals`/`useIndexDtfProposal`/`useIndexDtfProposalList`, `useIndexDtfCurrentRebalance`/`useIndexDtfRebalances`/`useIndexDtfRebalanceAuctions`, `useIndexDtfRevenue`, `useIndexDtfVoteLockState`/`useIndexDtfVoterState`, `useAccountPortfolio`, `useDiscoverDtfs`/`useIndexDtfList`/`useIndexCatalog`, and more.
- **Query options** (`*QueryOptions`) for every read — use with `useQuery`/`prefetchQuery` for custom caching or imperative fetches.
- **Proposal builders**: `useBuildIndexDtfBasketProposal`, `useBuildIndexDtfSettingsProposal`, `useBuildIndexDtfDaoSettingsProposal`, `useBuildIndexDtfBasketSettingsProposal`.
- **Tx-call hooks**: `useIndexDtfVoteCall`, `useIndexDtfQueueProposalCall`, `useIndexDtfExecuteProposalCall`, `useIndexDtfCancelProposalCall` — return `ContractCall` objects ready for `TransactionButton`.
- **Optimistic governance**: `useIndexDtfOptimisticProposalContext` + `useIndexDtfOptimistic*` family.
- **Providers**: `DtfSdkProvider` (wired in `src/state/chain/index.tsx`), `IndexDtfProvider` (wired in `src/views/index-dtf/index-dtf-container.tsx`); `useDtfSdk()` for the imperative client.
- **Helpers**: `mapIndexDtfData`, `dtfQueryKeys`, `LIVE_STALE_TIME`/`STATIC_STALE_TIME`/`DEFAULT_STALE_TIME`.

## Boundary — who owns what

Register owns UI state, routing, tx sending, toasts, product copy. The SDK owns proposal reads, voting-state derivation, builders, exact on-chain math.

- Keep SDK `Amount` objects intact in atoms/intermediate types; never rebuild fake `Amount`s from `formatted`.
- Use SDK `proposal.votingState` for proposal display state — no Register-local `getProposalState`.
- Convert to `Number` only at display leaves, never before business logic or proposal-state checks.
- Optimistic flows needing exact veto threshold/snapshot/voting power: `useIndexDtfOptimisticProposalContext`, passed into SDK voter-state helpers.
- Proposal lists: SDK list data + documented refresh; no hidden per-row RPC hydration.

Local SDK checkout linking: `docs/local-sdk-development.md`.

## Read before building a flow (`dtf-interface/docs`)

| Building… | Read |
| --- | --- |
| Index DTF reads / discovery | `protocol/data-sources.md` → `index-dtf/overview.md` → `index-dtf/discovery-holders.md` |
| Mint / Redeem / Zap | `index-dtf/issuance-redemption.md` → `integrations/zapper.md` |
| Governance / proposals | `protocol/governance.md` → `index-dtf/governance.md` → `register/governance-flows.md` |
| Rebalance / auctions | `index-dtf/rebalance-auctions.md` → `index-dtf/contracts-and-versions.md` |
| Revenue / fees / vote-lock | `index-dtf/revenue-fees.md` → `index-dtf/vote-lock.md` |
| Matching Register behavior | `register/interface.md` |

## Data-source routing (full table: `docs/data-sources.md`)

| Data | Source |
| --- | --- |
| Basket/balances, live supply (incl. pending fee shares) | RPC (`totalAssets()`, `totalSupply()`) |
| Current price / discovery / status / vote-lock APR | Reserve API |
| Metadata, governance history, roles, holders | Index subgraph |
| **Live** proposal state | RPC (`governor.state()`) — NOT subgraph |
| **Live** rebalance/auction state | RPC (`getRebalance()`) — NOT subgraph |
| Historical charts | Reserve API |

## Top gotchas (full list: `dtf-interface/docs/known-gotchas.md`)

- Subgraph is not live truth — no basket balances, final proposal state, or active auction state from it.
- Standard vs optimistic governance are separate; never merge voting powers or delegation.
- Vote-lock ≠ stRSR; the vote-lock underlying token is not always RSR.
- Contract versions differ (v5/v6): `startRebalance`/`openAuction`/`bid` signatures vary — don't hardcode an old ABI.
- `totalSupply()` includes pending fee shares — ignoring them breaks price/share math.

Key feature locations: rebalance v4 `src/views/index-dtf/auctions/views/rebalance/` · governance `src/views/index-dtf/governance/` · issuance `src/views/index-dtf/issuance/` (zapper/manual/direct).
