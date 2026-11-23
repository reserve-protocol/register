# Index DTF v6 — operable from Register

Fixed point: `feat/index-dtf-v6` at `eeb707c25`. Precedes the manual real-chain QA (test DTF 5.0.0 → governance migration → 6.0.0 upgrade → v6 rebalance).

## Goal

A Folio 6.0.0 DTF can be governed and rebalanced from Register: basket proposals, DTF settings proposals and the settings/auction reads show and encode the 6.0 contract surface. v4/v5 calldata stays byte-identical.

## Current state

- Launch (launcher + community), rebalance reads, v6 proposal decoding and the 5.0.0 → 6.0.0 upgrade already work for 6.0.
- Basket proposals for 6.0 are gated (`basket-propose-v6-unavailable`): the local builder has no nonce/deadline.
- Settings proposals for 6.0 are gated (`settings-propose-v6-unavailable`): local encoders emit `setAuctionLength` and one-table `setFeeRecipients`; several sections hide behind `version.startsWith('5')`; optimistic action selectors are v5-only.
- Settings page and auction labels read the subgraph `auctionLength`; the revenue split ignores immutable recipients and the self fee.

## Non-goals

- Native 6.0.0 deploy (manual or zap).
- End-rebalance / close-auction / bid UI (absent for every version).
- Optimistic-governance migration for DTFs already on 6.0.

## Decisions

- Basket proposal deadline = proposal time + on-chain governance lifecycle of the trading governor (standard: `votingDelay + votingPeriod + timelock minDelay`; optimistic: `vetoDelay + vetoPeriod`) + 3 days. Shown in the preview; an expired deadline is flagged before execution.
- Nonce = live `getRebalanceNonce() + 1`, read when the proposal is confirmed.
- 6.0-specific calls go through SDK `prepareIndexDtf*` primitives; unchanged setters keep the local encoders so v4/v5 bytes do not move.
- Immutable fee recipients are passed back unchanged; mutable shares split what they leave (SDK `prepareRevenueDistribution` semantics).

## Acceptance evidence

- Unit: v6 start-rebalance calldata decodes to `(nonce, tokens, limits, window, ttl, deadline)` with the v6 ABI; v5 bytes unchanged (existing test). Deadline math per topology. Settings v6 calldata for max auction length, fee recipients (immutable preserved), self fee, allowlist; v5 bytes unchanged.
- Offline e2e: v6 basket and settings propose flows reach the submit button with mocked 6.0 reads; gates removed.
- Fork e2e (Base): a 6.0.0 DTF (MIDAS after the upgrade lane) proposes a basket from the UI, the proposal passes, executes, and the launcher opens an auction.
- Visual check of the basket preview (nonce/deadline), settings sections and the settings page on a 6.0 DTF.

## Test seams

- `buildStartRebalanceCalldata` (pure) and a pure deadline helper.
- Settings calldata atom via a jotai store test.
- Playwright offline specs with `e2e/helpers/rpc.ts` mocks; fork lane for the real execution.

## Slices

- Slice 1 — v6 basket proposal: nonce + deadline + trade-allowlist guard + preview; blocked by: none.
- Slice 2 — v6 settings proposal: lift the gate, version gates `>= 5`, max auction length, fee recipients with immutable table, self fee, trade allowlist editor, v6 optimistic action selectors; blocked by: none.
- Slice 3 — v6 reads: settings page (max auction length, revenue split with immutable + self fee, allowlist, bids), launch labels from `maxAuctionLength`, previews for the new setters; blocked by: none.
- Slice 4 — fork proof: basket proposal → execute → launch on a 6.0 DTF; blocked by: slices 1, 3.

## Unresolved decisions

- None blocking. Engineer review required: deadline policy, fee-recipient math with immutable recipients, and the lone-recipient normalization (now exactly 1e18 on every version; v5 could previously emit 1.00005e18 with a fractional platform fee and revert).

## Status (2026-10-06)

Slices 1–4 implemented and verified (unit, offline settings e2e, Base fork: upgrade → settings → basket on MIDAS, plus the enforced-allowlist block). The fork lane found and fixed two settings bugs: a lone fee recipient off 1e18, and an SDK rejection thrown out of the proposal atom (blank page). Not covered on the proxy lane: launching the new rebalance's auctions from the UI (no indexed proposal at the fork block) — covered by the BSC CMC20 and native-v6 launch lanes.
