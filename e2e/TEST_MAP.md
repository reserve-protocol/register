# E2E Test Map

Route/state coverage matrix for the e2e suite. Regenerate the ground truth
before editing this file:

```
find e2e/tests -name "*.spec.ts" | sort              # spec inventory
grep -rn "test.fixme\|it.fixme" e2e/tests             # active fixmes
grep -rln "@mobile" e2e/tests                         # mobile-tagged specs
```

Harness architecture (mock layer, trust contract, CI split) lives in
`docs/wiki/domains/e2e.md`; mock mechanics and recipes live in `e2e/CLAUDE.md`.
Playwright runs 3 projects (`playwright.config.ts`): **smoke** (`@smoke`-tagged,
Desktop Chrome), **full** (everything else, Desktop Chrome), **mobile**
(`@mobile`-tagged, Pixel 7 viewport — off CI, `pnpm e2e:mobile`).

73 specs across 5 top-level dirs: `general/` (8), `index-dtf/` (17),
`yield-dtf/` (6), `smoke/` (12), `flows/` (30). `index-dtf/` and `yield-dtf/`
hold render/lifecycle/mobile specs per route; `flows/` holds deeper
behavior/write/edge-case specs (desktop only, no `@mobile` tags anywhere in
the directory).

## General (top-level routes)

| Area | Spec file(s) | States covered | Lifecycle | Mobile | Gaps |
|---|---|---|---|---|---|
| Bridge | [general/bridge/render](tests/general/bridge/render.spec.ts) | static page render | none (static) | yes | — |
| Discover | [general/discover/lifecycle](tests/general/discover/lifecycle.spec.ts), [flows/home-discover](tests/flows/home-discover.spec.ts) | skeleton→rows; search narrow/restore; tab switch; row→overview nav; home hero+featured render | partial | no | — |
| Earn | [general/earn/render](tests/general/earn/render.spec.ts), [general/earn/tabs](tests/general/earn/tabs.spec.ts) | DeFi tab empty-state render; index-dtf vote-lock tab render; yield-dtf staking tab render (disconnected empty-state) | none | yes | sort, non-empty list, error state |
| Explorer | [general/explorer/render](tests/general/explorer/render.spec.ts) | transactions tab (default) render; governance tab proposals render; one chain returning malformed transactions body doesn't blank the page | none | no | filters, pagination, tokens/collaterals/revenue tabs |
| Portfolio | [general/portfolio/state-space](tests/general/portfolio/state-space.spec.ts), [general/portfolio/partial-response](tests/general/portfolio/partial-response.spec.ts) | disconnected shows connect prompt; malformed proposal row survives, healthy row still renders | none | partial (state-space only) | connected-with-holdings render, empty-vs-past-activity-only |
| Tokens | [general/tokens/unlisted-partial](tests/general/tokens/unlisted-partial.spec.ts) | one chain returning an rtokens-less bucket doesn't crash the table | none | no | plain listed-table render, sort |
| Create (Index/Yield deploy) | — | — | — | — | entirely uncovered |

## Index DTF (`/:chain/index-dtf/:tokenId/*`)

| Area | Spec file(s) | States covered | Lifecycle | Mobile | Gaps |
|---|---|---|---|---|---|
| Overview | [overview/lifecycle](tests/index-dtf/overview/lifecycle.spec.ts), [overview/state-space](tests/index-dtf/overview/state-space.spec.ts), [overview/edge-cases](tests/index-dtf/overview/edge-cases.spec.ts), [flows/overview](tests/flows/overview.spec.ts), [flows/overview-edge](tests/flows/overview-edge.spec.ts), [flows/dtf-nav-state-cleanup](tests/flows/dtf-nav-state-cleanup.spec.ts), [flows/reload-chain-identity](tests/flows/reload-chain-identity.spec.ts) | hero L1→L3 no-reflow; chart island resolves independently; deprecated badge; holdings/mcap framings; empty/single-point/0-supply chart; SPA cross-chain nav (symbol, stat-card cleanup); full-reload cross-chain query-chain correctness | full (hero+chart) | yes (index-dtf/ specs); flows/ desktop only | fixme below (Market Cap datatype) |
| Issuance – Zap | [issuance/zap-render](tests/index-dtf/issuance/zap-render.spec.ts), [issuance/compliance](tests/index-dtf/issuance/compliance.spec.ts), [flows/zap-buy-sell](tests/flows/zap-buy-sell.spec.ts), [flows/zap-edge](tests/flows/zap-edge.spec.ts), [flows/failures-zap](tests/flows/failures-zap.spec.ts) | widget+tabs render; geo-restriction gates trade surface; buy/sell full tx flow; high-impact warning+ack gate; quote-error recovery; insufficient-funds gating; reject/revert on buy and sell | none | partial (render+compliance only) | — |
| Issuance – Manual | [issuance/manual-write](tests/index-dtf/issuance/manual-write.spec.ts), [flows/issuance-manual](tests/flows/issuance-manual.spec.ts), [flows/issuance-manual-boundaries](tests/flows/issuance-manual-boundaries.spec.ts), [flows/issuance-deprecated](tests/flows/issuance-deprecated.spec.ts), [flows/failures-issuance](tests/flows/failures-issuance.spec.ts), [flows/compliance-surfaces](tests/flows/compliance-surfaces.spec.ts) | mint/redeem full tx flow; MAX/minSharesOut/decimal-truncation/disabled-input math boundaries; mint-twice no re-approve; deprecated forces sell-only; reject/revert recovery; per-DTF restriction disables mint, redeem stays open | none | no | fixme below (redeem zero-slippage leg) |
| Issuance – Automated (CoW) | — | — | — | — | entirely uncovered, no testids yet |
| Governance – list/overview | [governance/lifecycle](tests/index-dtf/governance/lifecycle.spec.ts), [governance/photon-featured](tests/index-dtf/governance/photon-featured.spec.ts) | list skeleton→proposals; real captured proposal history renders | partial | yes | — |
| Governance – proposal (view/vote) | [flows/governance-states](tests/flows/governance-states.spec.ts), [flows/governance-multichain](tests/flows/governance-multichain.spec.ts), [flows/governance-permissions](tests/flows/governance-permissions.spec.ts), [flows/governance-support-variants](tests/flows/governance-support-variants.spec.ts), [flows/governance-vote](tests/flows/governance-vote.spec.ts), [flows/governance-queue-execute](tests/flows/governance-queue-execute.spec.ts), [flows/governance-writes-v4](tests/flows/governance-writes-v4.spec.ts), [flows/failures-governance](tests/flows/failures-governance.spec.ts), [flows/governance-description-render](tests/flows/governance-description-render.spec.ts) | PENDING/DEFEATED/QUORUM_NOT_REACHED/EXECUTED/QUEUED states (×chains, v4 governor); For/Against/Abstain vote encode; zero-power/already-voted/window-closed CTA gating; canceller-gated cancel; vote/queue/execute full tx + reject/revert; markdown sanitizer XSS hardening (script/iframe/img-onerror) | none | no | optimistic governance flow (see gaps) |
| Governance – create Basket | [flows/governance-propose-basket](tests/flows/governance-propose-basket.spec.ts) | form renders current basket; empty-change guard blocks prepare | none | no | price/liquidity preview, submitted calldata assertion |
| Governance – create DTF Settings | [flows/governance-propose-dtf-settings](tests/flows/governance-propose-dtf-settings.spec.ts) | TVL fee / Mint fee round-trip into setter calldata; no-change keeps confirm disabled | none | no | — |
| Governance – create Basket Settings | [flows/governance-propose-basket-settings](tests/flows/governance-propose-basket-settings.spec.ts), [governance/fee-bounds](tests/index-dtf/governance/fee-bounds.spec.ts) | voting-period round-trips setVotingPeriod calldata (trading governor); single-action guard (no phantom threshold); no-change disabled; out-of-range TVL fee rejected | none | no | — |
| Governance – create DAO (Other) | [flows/governance-propose](tests/flows/governance-propose.spec.ts) | DAO-settings proposal full submit flow | none | no | — |
| Auctions – rebalance list | [auctions/lifecycle](tests/index-dtf/auctions/lifecycle.spec.ts), [flows/auctions](tests/flows/auctions.spec.ts), [flows/auctions-multichain](tests/flows/auctions-multichain.spec.ts) | list skeleton→list; idle/historical bucketing; auctions-less 0-metrics row; in-window active row (×chains) | partial | yes (lifecycle spec only) | — |
| Auctions – rebalance detail + writes | [auctions/launch-price-guard](tests/index-dtf/auctions/launch-price-guard.spec.ts), [auctions/launch-write](tests/index-dtf/auctions/launch-write.spec.ts), [flows/auctions](tests/flows/auctions.spec.ts) | active detail from encoded `getRebalance()`; expired→completed card; price-error / single-0-price blocks launch; launcher `openAuction()`; non-launcher-in-permissionless-window `openAuctionUnrestricted()` | none | no | legacy v2 auctions UI, bid writes |
| Settings / Roles | [settings/lifecycle](tests/index-dtf/settings/lifecycle.spec.ts), [settings/distribute-fees](tests/index-dtf/settings/distribute-fees.spec.ts), [settings/fee-edge](tests/index-dtf/settings/fee-edge.spec.ts), [flows/settings](tests/flows/settings.spec.ts) | roster skeleton→roster; any-wallet `distributeFees()`; platformFee=100 shows Unavailable not a fabricated split; snapshot-scaled fee %s; registry-read-failure→UNAVAILABLE; zero-denominator/zero-numerator edges; public roles roster; governance cards; disconnected hides submit control | partial | yes (lifecycle only) | — |
| Manage | [manage/render](tests/index-dtf/manage/render.spec.ts) | form renders offline | none | yes | SIWE→upload→save write flow |
| Factsheet | [factsheet/render](tests/index-dtf/factsheet/render.spec.ts) | renders offline | none | yes | performance math (CSV, inception clamp) |

## Yield DTF (`/:chain/token/:tokenId/*`)

| Area | Spec file(s) | States covered | Lifecycle | Mobile | Gaps |
|---|---|---|---|---|---|
| Overview | [overview/render](tests/yield-dtf/overview/render.spec.ts) | renders offline from captured RPC+subgraph | none | yes | edge cases (empty/error chart) |
| Issuance | [issuance/state-space](tests/yield-dtf/issuance/state-space.spec.ts) | active DTF: mint+redeem panels; mint-paused DTF: redeem-only, no mint panel | none | yes | zap variant, write flow |
| Staking | [staking/render](tests/yield-dtf/staking/render.spec.ts), [staking/history-partial](tests/yield-dtf/staking/history-partial.spec.ts), [staking/stake-write](tests/yield-dtf/staking/stake-write.spec.ts), [staking/unstake-write](tests/yield-dtf/staking/unstake-write.spec.ts) | exchange-rate+APY render; staked-history survives a snapshots-less response; `stake()`/`unstake()` submit to stRSR | none | partial (render + history only) | withdraw, cancel, cooldown-vs-available |
| Governance | — | — | — | — | entirely uncovered |
| Auctions | — | — | — | — | entirely uncovered |
| Settings / Roles | — | — | — | — | entirely uncovered (pause/freeze writes, roles) |

## Smoke tier (`e2e/tests/smoke/`, fast per-diff confidence check)

Cross-cutting offline renders reused as the fast gate (`pnpm e2e:smoke`), not
additional state coverage: [boot](tests/smoke/boot.spec.ts) (home shell),
[home](tests/smoke/home.spec.ts) (discover table), [overview](tests/smoke/overview.spec.ts)
(×3 chains), [dtf-data](tests/smoke/dtf-data.spec.ts), [issuance](tests/smoke/issuance.spec.ts),
[zap](tests/smoke/zap.spec.ts), [governance](tests/smoke/governance.spec.ts),
[auctions](tests/smoke/auctions.spec.ts), [settings](tests/smoke/settings.spec.ts),
[yield-overview](tests/smoke/yield-overview.spec.ts), [yield-issuance](tests/smoke/yield-issuance.spec.ts),
[yield-staking](tests/smoke/yield-staking.spec.ts).

## Known gaps

- Optimistic governance: no dedicated flow test. Existing specs pin
  `isOptimistic: false`; `governance/photon-featured.spec.ts` documents that
  none of its 8 captured proposals are optimistic, so the badge/tally path is
  unexercised.
- Automated (CoW) issuance wizard: zero specs, zero testids.
- Legacy v2 auctions UI and bid writes: no specs.
- Yield DTF governance, auctions, and settings/roles: no specs at all (no
  `yield-dtf/governance|auctions|settings` dirs exist).
- Create Index DTF / Create Yield DTF deploy wizards: no specs.
- Explorer: only 3 of the tab surfaces render-tested (transactions, governance,
  malformed-body edge); tokens/collaterals/revenue tabs, filters, and
  pagination are untested.
- Portfolio: no connected-with-holdings render test; only disconnected and a
  malformed-row edge case exist.
- Mobile: only tagged in `general/`, `index-dtf/`, and `yield-dtf/` render/
  lifecycle specs. The entire `flows/` directory (30 specs — all governance/
  auction/issuance write and edge-case behavior) and all of `smoke/` have zero
  `@mobile` coverage.

## Active fixmes (2)

- `tests/index-dtf/overview/edge-cases.spec.ts:22` — Market Cap data-type
  shows the market cap, not the unit price. Reason: `chart-overlay.tsx` always
  reads the unit-price atom for the hero value, so switching the chart
  data-type doesn't change the hero.
- `tests/flows/issuance-manual-boundaries.spec.ts:407` — redeem must never
  ship zero slippage protection on a leg. Reason: a low-rate/low-decimal asset
  (e.g. cbBTC) can round its required amount to 0 below a dust threshold,
  collapsing the 5% floor to 0 and silently removing that leg's slippage
  protection; engineer must pick enforce-nonzero-floor vs. block-the-redeem.
