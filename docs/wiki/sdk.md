---
title: SDK
updated: 2026-07-23
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
2. **SDK repo [`reserve-protocol/dtf-interface`](https://github.com/reserve-protocol/dtf-interface)** — agent docs in `docs/`: `docs/README.md` (index), `docs/sdk/api-surface.md` (API shape), `docs/sdk/architecture.md` (layering rules), `docs/register/interface.md` (+ governance/issuance flow docs), `docs/known-gotchas.md`, `docs/source-manifest.md` (which source owns which fact), `docs/yield-dtf/*` (yield surface docs), `AGENTS.md` (data-boundary rules).

Confirm exact current names in the installed package before use — never invent hook names.

## The three-tier ownership rule (decided 2026-07-21, Luis)

Every piece of DTF data code lands in exactly one layer:

1. **`sdk`** — transport + math primitives + types. No react, no product
   semantics. Data hygiene lives here (e.g. `selectPriceAtMark` skipping
   zero-price rows — an API artifact, not framing).
2. **`react-sdk`** — one hook per read, nothing above that: canonical query
   key, caching, enabled-gating. **Register never imports `useDtfSdk` or calls
   the sdk client directly** — if you need to, the react-sdk is missing a hook
   (add it there, incl. prefetch/invalidations: see
   `usePrefetchIndexDtfPriceHistory`). Parameterized data-completeness is fine
   (`useIndexDtfPerformance`'s opt-in live point).
3. **`register`** — product hooks composing react-sdk hooks + product math
   (e.g. `useWeekAgoPnl`: value-diff semantics, when to hide, settling).

The litmus test: **if a hook's semantics would change on a design revision,
it's too high in the stack.** SDK changes at protocol cadence; register changes
weekly. Known `useDtfSdk` escapees still to migrate: `use-vote-lock-refresh`,
`use-recent-proposal-receipt`, `use-proposal-type-eligibility` (each likely
needs an invalidate/prefetch-style react-sdk primitive).

## Repo & versioning facts

- pnpm+turbo monorepo: `packages/sdk` (`@reserve-protocol/sdk`) + `packages/react-sdk` (which `export *`s the core — import only from react-sdk) are **version-linked** via changesets and bump together; `packages/dtf-catalog` versions independently. ESM-only.
- **Register pins react-sdk exactly** (`"0.5.0"`, no caret) — SDK bumps are deliberate, reviewed upgrades, never silent installs.
- **Yield namespace is implemented** (`sdk.yield.*`, ~40 `useYieldDtf*` hooks + query options). Long-term migration target for register's hand-rolled yield reads.
- **Catalog**: `@reserve-protocol/dtf-catalog` (register pins `0.1.3`) is a static JSON registry — synchronous lookups, no fetch; `dtfCatalog`/`indexDtfCatalog`/`yieldDtfCatalog` also re-exported from the SDK barrel (successor to `@reserve-protocol/rtokens`); on address collisions index wins. **Index DTF `status` (active/deprecated) comes from here**, not the API.
- **Config constants are exported** — `INDEX_DTF_SUBGRAPH_URL`, `YIELD_DTF_SUBGRAPH_URL`, `DEFAULT_API_BASE_URL`, `DEFAULT_RPC_URLS`, `SUPPORTED_CHAINS`, `supportedChainIds`, type `SupportedChainId`. Consolidating register's duplicates onto them is open debt ([[improvements]] #16).
- **Write ABIs are version-gated, not auto-detected**: `getIndexDtfWriteAbi("5.0.0" | "6.0.0")`; v6-only ops throw for v5. Register must read `folio.version()` and thread it through (see [[index-protocol]] for the version landscape).
- Local linking: link **both** sdk and react-sdk (react-sdk re-exports the core; mismatched instances duplicate viem/react-query peers) — `docs/local-sdk-development.md`.

## What it gives you

- **Read hooks** (React Query): `useIndexDtf`, `useIndexDtfBasket`/`useCurrentIndexDtfBasket`, `useIndexDtfPrice`, `useIndexDtfProposals`/`useIndexDtfProposal`/`useIndexDtfProposalList`, `useIndexDtfCurrentRebalance`/`useIndexDtfRebalances`/`useIndexDtfRebalanceAuctions`, `useIndexDtfRevenue`, `useIndexDtfVoteLockState`/`useIndexDtfVoterState`, `useAccountPortfolio`, `useDiscoverDtfs`/`useIndexDtfList`/`useIndexCatalog`, and more.
- **Query options** (`*QueryOptions`) for every read — use with `useQuery`/`prefetchQuery` for custom caching or imperative fetches.
- **Proposal builders**: `useBuildIndexDtfBasketProposal`, `useBuildIndexDtfSettingsProposal`, `useBuildIndexDtfDaoSettingsProposal`, `useBuildIndexDtfBasketSettingsProposal`.
- **Tx-call hooks**: `useIndexDtfVoteCall`, `useIndexDtfQueueProposalCall`, `useIndexDtfExecuteProposalCall`, `useIndexDtfCancelProposalCall` — return `ContractCall` objects ready for `TransactionButton`.
- **Optimistic governance**: `useIndexDtfOptimisticProposalContext` + `useIndexDtfOptimistic*` family.
- **Providers**: `DtfSdkProvider` (wired in `src/state/chain/index.tsx`), `IndexDtfProvider` (wired in `src/views/index-dtf/index-dtf-container.tsx`). `useDtfSdk()` exists but is react-sdk-internal from register's perspective — the ownership rule above forbids importing it (the three escapees are the tracked exception).
- **Helpers**: `mapIndexDtfData`, `dtfQueryKeys`, `LIVE_STALE_TIME`/`STATIC_STALE_TIME`/`DEFAULT_STALE_TIME`.

## Math guarantees (audited against the governor contracts)

SDK math **fails loud** — no fabricated `$1`/`|| 1n`/50% fallbacks; deploy-basket and open-auction builders throw on zero/negative price and zero supply via `dtf-rebalance-lib`. Durable semantics to rely on:

- **A vote tie is DEFEATED.** OZ `GovernorCountingSimple._voteSucceeded` (FolioGovernor + yield `Governance.sol`, neither overrides) requires `for > against` strictly; SDK `votingState` implements this. Never re-derive proposal state register-side.
- **Yield proposal list state** is derived from one chain block per request (Anastasius off `block.timestamp`, Alexios off `block.number`), never the consumer wall clock; stale-PENDING past deadline resolves to the vote outcome, never EXPIRED.
- Yield staking-vault reward-period APY has no SDK equivalent (sidebar-only helper fails the boundary litmus) → stays register-side.

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
| Current price / discovery / vote-lock APR | Reserve API |
| Index DTF status (active/deprecated) | `@reserve-protocol/dtf-catalog` (static, synchronous) |
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
