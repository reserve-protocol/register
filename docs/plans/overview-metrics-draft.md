---
title: Overview Metrics
updated: 2026-07-11
type: plan
status: draft
sources:
  - src/hooks/useIndexDTFTransactions.ts
  - src/state/dtf/atoms.ts
  - src/views/index-dtf/index-dtf-container.tsx
  - src/views/index-dtf/overview/components/fees-stats.tsx
  - src/views/index-dtf/overview/index.tsx
---

# Overview Metrics

Unimplemented proposal preserved from an untracked wiki draft. The current
transaction hook does not yet provide the pagination, SDK migration, or volume
helpers described below; the accompanying untracked test remains unfinished.

Fee & Stats transaction metrics share one issuance-volume definition:

- `24h Volume` = Mint + Redeem DTF amounts in the trailing 24 hours.
- `Volume` = all-time Mint + Redeem DTF amounts.
- `Mint Volume` = all-time Mint amounts only.

Buy/Sell rows are secondary-market Uniswap v4 swaps inferred from transfers to
or from the PoolManager. They stay transaction-table-only: treating them as
total market volume would be incomplete because other pools and venues are not
covered.

Transaction amounts come through the react SDK's Index-subgraph reader. The
overview paginates the full history, sums raw amounts as bigint, then applies
the current DTF price once at the display boundary. It retains only the recent
100 rows plus the trailing-24h window. A one-row five-minute head poll triggers
a full refresh only when activity changes; multi-page reads verify the head and
retry once if offset pagination moved during the load.

The three metrics skeleton until both transactions and current price resolve.
A successful empty history renders `$0`; a transaction-source failure renders
`—`, never a false zero. See [SDK](../wiki/sdk.md) and
[Subgraphs](../wiki/subgraphs.md) for source boundaries.
