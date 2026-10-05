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
| Vote UI/submission | `e2e/tests/flows/governance-vote.spec.ts` + `flows/failures-governance.spec.ts` (reject/revert) + `index-dtf/governance/vote-modal-long-title.spec.ts` (modal layout) |
| Propose flow — DAO settings | `e2e/tests/flows/governance-propose.spec.ts` |
| Propose flow — fees (dtf-settings) | `e2e/tests/flows/governance-propose-dtf-settings.spec.ts` (fee calldata round-trip; Folio 6.0 shows `settings-propose-v6-unavailable` and never submits) + `propose-dtf-settings/tests/settings-version-gate.test.ts` (no calldata for 6.0, pending or unknown versions) |
| Propose flow — basket | `e2e/tests/flows/governance-propose-basket.spec.ts` (form + guards; full submit blocked on golden `startRebalance` fixture) |
| Propose flow — basket-settings (trading-gov params) | `e2e/tests/flows/governance-propose-basket-settings.spec.ts` (setVotingPeriod round-trip; phantom-threshold single-action + untouched-form-disabled regressions, live since E1) |
| Proposal description markdown/XSS rendering | `e2e/tests/flows/governance-description-render.spec.ts` |
| Queue/execute CTAs | `e2e/tests/flows/governance-queue-execute.spec.ts` + `flows/failures-governance.spec.ts` |
| Governance migration (upgradeFolio banner, legacy-vault retire banner, vote-lock migration CTA/modal in `components/vote-lock-migration`) | `components/vote-lock-migration/tests/*.test.ts` (eligibility, old-vault discovery, stepper state) + the Base fork lane `e2e/fork/tests/optimistic-governance-upgrade.fork.spec.ts` (full UI flow on real contracts) |
| Chain/version-gated behavior | `e2e/tests/flows/governance-multichain.spec.ts` (bsc v5 + mainnet v4) + `flows/governance-writes-v4.spec.ts` (v4 castVote/queue/execute calldata) |
| Delegation UI | `e2e/tests/smoke/governance.spec.ts` (delegates section) |
| Vote-lock card (claiming label, exchange rate) or drawer (lock/unlock quotes, redeem tx) | `e2e/tests/flows/vote-lock-drawer.spec.ts` + `governance/photon-featured.spec.ts` (card renders on the self-appreciating fixture) |
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
  `onerror`/`javascript:` neutralized, control markdown renders. The historical
  raw-`<iframe>` hole is FIXED (S3): one shared allowlist-sanitized renderer
  (`src/components/governance/proposal-md-description.tsx` — the two legacy
  unsanitized copies were deleted); iframe/object/embed are stripped, with a
  live regression test that also trips on any src egress.
- Validation: zod form bounds (fee min/max etc.) are bypassed on localhost/dev
  (`shouldBypassFormValidation`) but NOT in e2e — the harness Vite server sets
  `VITE_E2E`, which pins the bypass off, so bounds are assertable
  (`index-dtf/governance/fee-bounds.spec.ts`).

## Traps

- Governance migration: after `upgradeFolio` the subgraph moves `stToken` to the vlRSR singleton; the old vault survives only behind `roles.admin.legacyGovernances` (`getOldVoteLocks` reads both). The retire banner's "still governed" list is the on-chain admin role, not the subgraph. Only RSR vote-lock vaults take part: the upgrade banner, the retire banner and the migration CTA all hide for a non-RSR vault (vlPMF, vlVIRTUAL…), whose holders would redeem a token vlRSR cannot take.

- The auctions subgraph query is misnamed `getGovernanceStats` in
  `use-rebalance-auctions.ts` — body-matched in the mock BEFORE the real
  governance branch. Renaming it requires updating `e2e/helpers/subgraph.ts`.
- Vote weights come from RPC (`getVotes`), proposals/history from the
  subgraph. Don't "fix" a test by moving live state into the subgraph mock.
- Self-appreciating vote-lock vaults (catalog: `SELF_APPRECIATING_VOTE_LOCK_VAULTS`
  in `src/utils/constants.ts`; bsc/photon's vlRSR is one): the card fires an
  account-less `previewRedeem(1 share)` on page load. The central mock answers
  identity-rate (1:1) defaults for vault `previewRedeem`/`convertToAssets`/
  `balanceOf`; specs asserting a real rate override per-address (see
  `flows/vote-lock-drawer.spec.ts`). The unlock tx is `redeem(shares)` for ALL
  vaults — assert decoded share args, not asset amounts.
- Proposal titles can be address-length with nothing to wrap on. The vote modal
  is a fixed 420px box, so its title needs `[overflow-wrap:anywhere]` — plain
  `break-words` does not shrink a flex item's min-content width, and the
  overflow pushes the checkboxes and separators outside the dialog.
- Folio 6.0 settings writes are gated (`settingsWriteBlockAtom`): the local
  encoders emit `setAuctionLength` and one-table `setFeeRecipients`, neither
  of which exists on 6.0 (it has `setMaxAuctionLength` and two recipient
  tables). Lift the gate only by routing settings through the SDK's
  version-aware builders, including the v6 optimistic selectors
  (`INDEX_DTF_START_REBALANCE_SELECTOR['6.0.0']`); don't add a 6.0 branch to
  the atom encoder.
- ERC-6372 `clock()` is mocked (timestamp mode); governor deadline math
  breaks silently if a new read bypasses the frozen clock.
- Threshold change-detection MUST go through the shared
  `isProposalThresholdChanged` (percentage basis on both sides — all three
  settings updaters use it). The historical bug (E1, fixed): comparing the
  already-percentage form field against `raw / 1e18` never matched, so every
  basket-settings proposal appended a phantom `setProposalThreshold` calldata
  and the empty-change guard never tripped. Don't reintroduce a raw-basis
  comparison; the two e2e regressions in the basket-settings spec pin it.
- Wallet-connected MAINNET specs need mainnet ZAP_TOKENS `balanceOf` +
  `/current/prices` seeding — the central mock only seeds base/bsc, so a
  connected mainnet spec fails teardown without per-test `overrides.ethCall`/
  `overrides.api` (promote to `rpc.ts`/`api.ts` when mainnet writes grow).

Engineer review is required for behavior changes here (repo stop-condition
surface) — tests passing is not sign-off.
