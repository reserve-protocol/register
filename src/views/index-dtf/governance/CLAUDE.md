# Governance View — Agent Guide

Self-contained context for changing this view. Mock mechanics live in
`e2e/CLAUDE.md` (cookbook); architecture in `docs/wiki/domains/e2e.md`;
protocol semantics in `docs/wiki/index-protocol.md` (roles, timelocks) and
`docs/wiki/sdk.md` (all governance data flows through the SDK — read before
touching hooks/updaters here).

## What this view is

Proposal list + detail, voting, proposing (basket/whitelist/fee changes via
owner/trading/vote-lock governors), queue/execute through the timelock, and
delegation. Display proposal state is DERIVED client-side by the SDK
(`votingState.state`) from raw subgraph state + vote tallies + the clock —
it is NOT the raw subgraph `state` field. That derivation is why tests pin
time.

## Did a diff here — which test?

| You changed | Run / extend |
|---|---|
| Proposal list, filters, pagination | `e2e/tests/smoke/governance.spec.ts` |
| Proposal detail, state banners/CTAs | `e2e/tests/flows/governance-states.spec.ts` |
| Vote UI/submission | `e2e/tests/flows/governance-vote.spec.ts` + `flows/failures-governance.spec.ts` (reject/revert) |
| Propose flow — DAO settings | `e2e/tests/flows/governance-propose.spec.ts` |
| Propose flow — fees (dtf-settings) | `e2e/tests/flows/governance-propose-dtf-settings.spec.ts` (fee calldata round-trip) |
| Propose flow — basket | `e2e/tests/flows/governance-propose-basket.spec.ts` (form + guards; full submit blocked on golden `startRebalance` fixture) |
| Propose flow — basket-settings (trading-gov params) | `e2e/tests/flows/governance-propose-basket-settings.spec.ts` (setVotingPeriod round-trip; phantom-threshold + empty-guard `test.fixme` pending app fix) |
| Proposal description markdown/XSS rendering | `e2e/tests/flows/governance-description-render.spec.ts` |
| Queue/execute CTAs | `e2e/tests/flows/governance-queue-execute.spec.ts` + `flows/failures-governance.spec.ts` |
| Chain/version-gated behavior | `e2e/tests/flows/governance-multichain.spec.ts` (bsc v5 + mainnet v4) + `flows/governance-writes-v4.spec.ts` (v4 castVote/queue/execute calldata) |
| Delegation UI | `e2e/tests/smoke/governance.spec.ts` (delegates section) |
| Anything in hooks/updaters/atoms here | all of the above: `pnpm exec playwright test --project=full e2e/tests/flows/governance-*.spec.ts` + smoke |

Quick loop: `pnpm exec playwright test e2e/tests/smoke/governance.spec.ts`
(seconds), full governance flows (~15s).

## How to mock governance states

The pinned proposal is `PROPOSAL_ID` on base/lcap (captured snapshot;
`loadEnrichedProposal(id)` returns it with the `governance` sub-object the SDK
mapper dereferences — serve proposals ONLY through it or the list breaks).

- **Lifecycle state**: combine `freezeTime` relative to the proposal's
  `voteStart`/`voteEnd` (`proposalTime` helper) with a
  `overrides.subgraph({ operationName: 'GetIndexDtfProposal' }, overlay)` that
  mutates exactly the fields the SDK derivation reads. Existing patterns:
  PENDING (raw PENDING + clock before voteStart), DEFEATED (clock after
  voteEnd + against > for), QUORUM_NOT_REACHED (for wins, misses
  `quorumVotes`), EXECUTED (raw state + execution fields) in
  `governance-states.spec.ts`; ACTIVE (clock inside the vote window) in
  `governance-vote.spec.ts`; QUEUED (raw state + eta) in
  `governance-queue-execute.spec.ts`.
- **Voting power**: `getVotes`/`getPastVotes` answer 100k votes for any
  address by default (central baseline in `e2e/helpers/rpc.ts`). Zero-power
  states need a per-test `overrides.ethCall` with the exact calldata.
- **Vote/propose/queue/execute writes**: wallet fixture + `txLog`; decode and
  assert args (`castVote(proposalId, support)`, propose calldatas, timelock
  operation hashes). Post-tx UI: swap the subgraph override, pump
  `advanceTime`.
- **Governor version gates**: base/lcap + bsc/cmc20 are v5, mainnet/open is
  v4 — write-ABI selection is version-gated, so exercise both when touching
  write paths.

## Edge cases to keep covered (or consciously skip)

- Disconnected visitor: states + CTAs render without a wallet (states spec
  runs disconnected on purpose).
- Voting with zero power / after voteEnd (CTA must not submit; txLog empty).
- Proposal list empty state (DTF with no proposals) vs list slicing
  ("Show all" beyond `DEFAULT_PAGE_SIZE = 10`).
- Rejected/reverted tx — COVERED for vote, queue, AND execute in
  `failures-governance.spec.ts` (recovery, no false state, staged data hidden).
- Multi-governor DTFs: owner vs trading vs vote-lock governance routes to
  different governor addresses — assert the tx `to`, not just success.
- Timelock delay between queue and execute (frozen clock must cross `eta`).
- Multichain: COVERED for list + PENDING/DEFEATED/EXECUTED states + chain-
  correct explorer hosts on bsc/cmc20 (v5) and mainnet/open (v4). v4/v5
  WRITE-ABI gates on mainnet now COVERED (`governance-writes-v4.spec.ts`:
  castVote/queue/execute — v4 uses standard OZ selectors, decodes correctly).
  Still open: rebalance-preview price path on non-lcap chains (central price
  mock only knows current-basket tokens).
- Description XSS (`governance-description-render.spec.ts`): `<script>` inert,
  `onerror`/`javascript:` neutralized, control markdown renders — but raw
  `<iframe>` RENDERS AND LOADS ITS SRC (attacker-controlled on-chain
  description → live external frame). BUG, `test.fixme`'d, engineer triage;
  same renderer in yield governance too (`ProposalMdDescription.tsx` ×2).
- Validation: zod form bounds (fee min/max etc.) are bypassed on localhost/dev
  (`shouldBypassFormValidation`) but NOT in e2e — the harness Vite server sets
  `VITE_E2E`, which pins the bypass off, so bounds are assertable
  (`index-dtf/governance/fee-bounds.spec.ts`).

## Traps

- The auctions subgraph query is misnamed `getGovernanceStats` in
  `use-rebalance-auctions.ts` — body-matched in the mock BEFORE the real
  governance branch. Renaming it requires updating `e2e/helpers/subgraph.ts`.
- Vote weights come from RPC (`getVotes`), proposals/history from the
  subgraph. Don't "fix" a test by moving live state into the subgraph mock.
- ERC-6372 `clock()` is mocked (timestamp mode); governor deadline math
  breaks silently if a new read bypasses the frozen clock.
- KNOWN APP BUG (`propose-basket-settings/updater.tsx`): the threshold
  change-detector seeds the field from the already-percentage
  `proposalThreshold` (identity `proposalThresholdToPercentage`) but compares
  it against `Number(proposalThreshold) / 1e18` — never equal, so EVERY
  basket-settings proposal appends a phantom `setProposalThreshold` calldata
  and the empty-change guard never trips. Two tests `test.fixme`'d until fixed.
- Wallet-connected MAINNET specs need mainnet ZAP_TOKENS `balanceOf` +
  `/current/prices` seeding — the central mock only seeds base/bsc, so a
  connected mainnet spec fails teardown without per-test `overrides.ethCall`/
  `overrides.api` (promote to `rpc.ts`/`api.ts` when mainnet writes grow).

Engineer review is required for behavior changes here (repo stop-condition
surface) — tests passing is not sign-off.
