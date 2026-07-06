---
title: Decisions
updated: 2026-07-06
type: decision
---

# Decisions

Durable decisions with the why. One `##` per decision, newest last. Split into linked pages if this file outgrows the split rule in `skills/wiki.md`.

## 2026-07-02 — llm-workflow kit adopted

Register moved from a monolithic `CLAUDE.md` to the llm-workflow router + wiki. `AGENTS.md` stays a symlink to `CLAUDE.md` (single source); `CLAUDE.md` now holds the router content. The full pre-adoption doc is archived verbatim at `docs/archive/CLAUDE-pre-llm-workflow-2026-07-02.md`; its rules live in [[project]], [[sdk]], [[design-system]], and `llm-workflow.config.json`. Repo rules won on every conflict (see [[project]] § Overrides).

## 2026-07-02 — DataTable pagination default unified

`DataTablePagination` (extracted from `data-table.tsx`) intentionally adopts the responsive style built for the DTF overview transaction table as the app-wide default: `px-5 pb-3 pt-4` padding, summary `hidden md:flex` (was `opacity-0 md:opacity-100`), full-width mobile page buttons. This is a deliberate, user-approved exception to the "never change shared defaults" rule — the old per-table `pagination*ClassName` props were removed in the same change. Verified visually on explorer governance (desktop + mobile, 12 pages); discover and top100 currently gate pagination behind >20 rows so they render none with today's data. The extraction initially also gave the page-number wrapper `flex-1`, which broke mobile layouts with many pages — fixed to match the original structure (only prev/next/page buttons stretch).

## 2026-07-02 — dtf-chat launcher styling contained, not upstreamed (yet)

The `.rc-*` overrides in `src/app.css` restyle `@reserve-protocol/dtf-chat` internals. Kept in register deliberately (release window; cross-repo change too heavy now) but contained in one documented block. Real fix — launcher theming props/CSS variables in the dtf-chat package (reserve-ai repo) — is in [[progress]] backlog.

## 2026-07-03 — Referral tracking is Mixpanel-only; conversions settle on-chain

The referral campaign (influencer links → `/?referral=<code>`) stores attribution exclusively in Mixpanel: the `referral` super property on all events plus `referral_landed` and `referral_wallet_linked` (explicit `{ wallet, code }` — the link record, extracted later via the Mixpanel export API). A reserve-api piece (`referral_links` Postgres table + origin-guarded endpoint) was built and reviewed, then cut the same day — one store is enough, and the Mixpanel API covers extraction (reserve-api PR #212 closed unmerged; its branch holds the code if a DB record is ever wanted again). No conversion/mint tracking anywhere client-side: client events are spoofable, so credit is settled post-campaign from subgraph transfer data. Last-touch, full-history-per-wallet via distinct wallet+code events. See [[referral]].

## 2026-07-03 — Ondo cap is weighted per asset; unavailable minting gets its own prompt variants

Supersedes the min-cap semantics recorded as "the confirmed product ask" in cowswap-prompt-rework: the Ondo per-transaction limits are per *asset*, and each asset only absorbs its basket-weight fraction of a DTF mint, so the binding DTF cap is `min(capacityUsd / weight)` — e.g. a $200k cap on an 18.68% weight binds at ~$1.07M of DTF, not $200k. Displayed and compared floored to $10k steps ($1k under $10k) so the trigger matches the label. Confirmed by the product owner (Jorge), who also set the rest of the model: the capacity card stays pre-quote but only fires while minting is *available* (market open, every reported cap > 0); while minting is *unavailable* (market closed or an asset paused at cap 0) quotes defer to un-arbitrageable secondary pools, so a resolved non-enso quote above the existing 1% `truePriceImpact` threshold (deliberately not the widget's 5% alert) shows `closed-impact` and a quote failure shows `closed-error` — both say when to come back (exact `market.nextOpen` when closed; next tradable session otherwise, missing session buckets falling back to the regular cap like the API's `sessionCapacity`) and never show a CoW CTA, since CoW liquidity is equally stale while arbitrage is blocked. Limits are per transaction, so the capacity copy invites splitting large orders.

## 2026-07-06 — Chart granularity: fetch what the API has, bucket client-side for display density

The "choppy charts" task was solved by granularity policy, not by smoothing: the DTF price series is a NAV estimate that reverses direction on ~50% of consecutive points, so any range rendering more than a few hundred points reads as noise. `historical/dtf` accepts exactly `5m`/`1h`/`1d` (everything else 400s; the reported "3h/6h granularity" was data holes, not server behavior), so intermediate display densities are produced client-side by bucketing the finest supported interval (see [[overview-charts]] for the per-range table: 24H fetches 5m and buckets to 15m, 1M fetches 1h and buckets to 6h, All buckets daily data to weekly past 400 points). The first pass landed on plain 1d for 1M and 1h for 24H; the user then asked for more density (31 and 25 points felt too sparse), which produced the fetch-fine/bucket-down pattern. 1Y deliberately stays daily (~366 pts is the standard year-chart density). The <30-day "young DTF → force hourly" override was removed outright: backfilled AI DTFs made it request thousands of hourly points on YTD/1Y, and 24H/7D already cover launch-week detail. Moving-average smoothing was rejected because it misrepresents price data.
