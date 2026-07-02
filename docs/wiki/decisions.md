---
title: Decisions
updated: 2026-07-02
type: decision
---

# Decisions

Durable decisions with the why. One `##` per decision, newest last. Split into linked pages if this file outgrows the split rule in `skills/wiki.md`.

## 2026-07-02 — ai-loop kit adopted

Register moved from a monolithic `CLAUDE.md` to the ai-loop router + wiki. `AGENTS.md` stays a symlink to `CLAUDE.md` (single source); `CLAUDE.md` now holds the router content. The full pre-adoption doc is archived verbatim at `docs/archive/CLAUDE-pre-ai-loop-2026-07-02.md`; its rules live in [[project]], [[sdk]], [[design-system]], and `ai-loop.config.json`. Repo rules won on every conflict (see [[project]] § Overrides).

## 2026-07-02 — DataTable pagination default unified

`DataTablePagination` (extracted from `data-table.tsx`) intentionally adopts the responsive style built for the DTF overview transaction table as the app-wide default: `px-5 pb-3 pt-4` padding, summary `hidden md:flex` (was `opacity-0 md:opacity-100`), full-width mobile page buttons. This is a deliberate, user-approved exception to the "never change shared defaults" rule — the old per-table `pagination*ClassName` props were removed in the same change. Visual verification across explorer governance, top100, discover, and yield transaction tables is part of the stage closeout (see [[progress]]).

## 2026-07-02 — dtf-chat launcher styling contained, not upstreamed (yet)

The `.rc-*` overrides in `src/app.css` restyle `@reserve-protocol/dtf-chat` internals. Kept in register deliberately (release window; cross-repo change too heavy now) but contained in one documented block. Real fix — launcher theming props/CSS variables in the dtf-chat package (reserve-ai repo) — is in [[progress]] backlog.
