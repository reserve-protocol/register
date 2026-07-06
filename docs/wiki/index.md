---
title: Wiki Index
updated: 2026-07-06
type: ledger
---

# Wiki Index

One line per page. Agents: start here, follow links, keep this list current on ingest.

- [[project]] — product context, stack specifics, safety rules, UI register, active risks, kit overrides
- [[sdk]] — Index DTF data goes through `@reserve-protocol/react-sdk`; discovery, boundaries, gotchas, data-source routing
- [[progress]] — stage ledger and backlog
- [[decisions]] — durable decisions with reasoning
- [[log]] — append-only chronological record

## Domains

- [[design-system]] — tokens, type, motion, ui primitives; never hardcode colors or change shared defaults
- [[zapper-prompt]] — CoW Swap suggestion card beside the instant zapper: variant priority, latch reducer invariants, Ondo capacity gating
- [[referral]] — influencer campaign attribution: ?referral= capture, last-touch Mixpanel super property, wallet↔code POST to reserve-api; conversions settled on-chain, out of scope
- [[overview-charts]] — Index DTF price/candles charts: per-range fetch interval + client-side display buckets (shared `chart-downsample`), API supports only 5m/1h/1d, dedupe + no young-DTF hourly override
- [[home]] — landing page: featured cards downsample the server's hourly 90d series to daily at the data layer; ref-driven packing animation and memoized cards are perf invariants
