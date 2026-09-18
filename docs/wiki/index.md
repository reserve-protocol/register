---
title: Wiki Index
updated: 2026-08-27
type: ledger
---

# Wiki Index

One line per page. Agents: start here, follow links, keep this list current on ingest.

- [[project]] — product context, stack specifics, safety rules, UI register, active risks, kit overrides
- [[sdk]] — Index DTF data goes through `@reserve-protocol/react-sdk`; discovery, boundaries, gotchas, data-source routing
- [[ecosystem]] — map of sibling repos (GitHub links), where register wires each, version-bump blast radius
- [[subgraphs]] — index + yield Goldsky subgraphs: entities, type semantics, USD caveats, what's NOT indexed
- [[index-protocol]] — Folio contracts: version landscape 1→6, rebalance lifecycle, roles, trusted fillers
- [[yield-protocol]] — RToken contracts: components, facades, throttles/redeemCustom, collateral status, spells
- [[zapper]] — react-zapper package (one-instance rule, v2 contract), async-zap-sdk wizard, legacy yield zapV2
- [[improvements]] — prioritized tech debt: read before features/bugfixes to avoid repeating bad patterns
- [[progress]] — stage ledger and backlog
- [[decisions]] — durable decisions with reasoning
- [[log]] — append-only chronological record

## Domains

- [[design-system]] — concise V1 authority router: foundations, components, Current Review, evidence roles, and adoption boundaries
- [[design-system-reference]] — accepted design-system usage guidance for foundations, components, and complex patterns; load on demand
- [[zapper-prompt]] — informational Ondo-market prompt beside the instant zapper: variant priority, latch invariants, capacity gating, and host constraints
- [[referral]] — influencer campaign attribution: ?referral= capture, last-touch Mixpanel super property, wallet↔code POST to reserve-api; conversions settled on-chain, out of scope
- [[overview-charts]] — Index DTF price/candles charts: per-range fetch interval + client-side display buckets (shared `chart-downsample`), API supports only 5m/1h/1d, dedupe + no young-DTF hourly override
- [[basket-overview]] — Holdings table (Exposure/Collateral tabs): two mcap numbers, one per tab (underlying tradfi vs tokenized supply, never cross them); exposure route schema strips undeclared fields; lowercased mcap-map keys
- [[e2e]] — strict offline Playwright contract: exact boundary identity, correlated transactions, atomic snapshots, smoke/full CI split
- [[home]] — landing page: featured cards downsample the server's hourly 90d series to daily at the data layer; ref-driven packing animation and memoized cards are perf invariants
