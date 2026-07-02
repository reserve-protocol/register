---
title: Progress
updated: 2026-07-02
type: ledger
---

# Progress

Stage ledger. One row per stage; keep entries short. Verifier = exact fresh commands that ran green. Lenses = one line each in the Review column.

| Stage | Status | Verifier | Review | Next |
|---|---|---|---|---|

## Backlog

<!-- Minor/deferred findings. Delete items when done or obsolete. -->

- Upstream dtf-chat launcher theming (props/CSS vars) into `@reserve-protocol/dtf-chat` (reserve-ai repo), then delete the `.rc-*` overrides in `src/app.css`.
- Homepage animation hooks (from old IMPROVEMENTS_PLAN): move scroll/ticker/transcript side effects into focused hooks with observer/timer cleanup; respect `prefers-reduced-motion`.
- Accessibility audit of animated homepage cards: keyboard states, focus order, labels for chart-only info.
- Focused tests: home renders hero without discover list; discover renders filters/sections; highlighted card handles no-performance/inactive/chain-version tabs; animation hooks clean up observers and timers.
- Re-run i18n extraction after cleanup; prune obsolete messages from deleted prototype copy.
- Decide fate of untracked `.agents/skills/` dir (Codex-generated duplicates of `.claude` commands/skills) — delete or gitignore.
- Consolidate discover table + highlighted-card chart fetching into a shared hook with stable cache keys (avoid duplicated per-cell historical requests).
