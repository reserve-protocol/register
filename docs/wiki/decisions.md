---
title: Decisions
updated: 2026-07-02
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

## 2026-07-03 — Referral tracking is attribution-only; conversions settle on-chain

The referral campaign (influencer links → `/?referral=<code>`) deliberately stores only wallet↔code↔timestamp relations (reserve-api `referral_links`, full history — last-touch client-side, every code a wallet arrives under gets its own row). No conversion/mint tracking in either repo: client "minted" events are spoofable, so credit is settled post-campaign from subgraph transfer data by whoever runs the analysis. Mixpanel gets the latest code as a `referral` super property for funnels; Postgres rows are the payout-relevant truth. The link endpoint is origin-filtered (reserve.org hosts) as a browser-level deterrent only — acknowledged spoofable, acceptable because fake links pollute rows, not money. Escalation path if abuse appears: wallet-signature on link. See [[referral]].
