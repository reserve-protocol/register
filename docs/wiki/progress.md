---
title: Progress
updated: 2026-07-02
type: ledger
---

# Progress

Stage ledger. One row per stage; keep entries short. Verifier = exact fresh commands that ran green. Lenses = one line each in the Review column.

| Stage | Status | Verifier | Review | Next |
|---|---|---|---|---|
| adopt-llm-workflow | done | `wiki-lint` green (7 pages) · `scope.mjs --base HEAD --dry-run` maps lint/typecheck/test + lenses | complexity: self (docs/tooling only) | — |
| chat-overrides-containment | done | `pnpm typecheck` + `pnpm lint` + `pnpm test:run` green · launcher screenshot identical post-move | product: self + screenshot | upstream theming to dtf-chat (backlog) |
| ui-stabilization-sweep | done | `pnpm typecheck` + `pnpm lint` + `pnpm test:run` green (458 tests, 21 new) · screenshots: explorer pagination desktop+mobile, header menu, search dialog, chat launcher | correctness+product+complexity: Dark & Light subagents, findings verified per-claim; security: no tx/money paths changed | engineer review flags in handoff (see log 2026-07-02) |

## Backlog

<!-- Minor/deferred findings. Delete items when done or obsolete. -->

- Upstream dtf-chat launcher theming (props/CSS vars) into `@reserve-protocol/dtf-chat` (reserve-ai repo), then delete the `.rc-*` overrides in `src/app.css`.
- Homepage animation hooks (from old IMPROVEMENTS_PLAN): move scroll/ticker/transcript side effects into focused hooks with observer/timer cleanup; respect `prefers-reduced-motion`.
- Accessibility audit of animated homepage cards: keyboard states, focus order, labels for chart-only info.
- Focused tests: home renders hero without discover list; discover renders filters/sections; highlighted card handles no-performance/inactive/chain-version tabs; animation hooks clean up observers and timers.
- Re-run i18n extraction after cleanup; prune obsolete messages from deleted prototype copy.
- Consolidate discover table + highlighted-card chart fetching into a shared hook with stable cache keys (avoid duplicated per-cell historical requests).
- Chat launcher overlaps bottom-right interactive content (e.g. last pagination button on explorer mobile, pre-existing) — consider auto-hiding near page bottom or reserving clearance.
- Add an imperative `open()` API to dtf-chat so `index-ctas-overview-mobile.tsx` stops DOM-clicking the launcher via querySelector.
- `views/index-dtf/components/navigation/index.tsx` is 483 lines mixing sidebar, mobile portal menu, clipboard, and bridged-address logic — split after release (needs screenshot coverage).
- "Native" chain in the navigation token-address menu is inferred as `bridgedAddresses[0]` — confirm the BRIDGED_INDEX_DTFS ordering convention or compare against the DTF address like `index-token-address.tsx`.
- MobileStat label/value block repeated 5x across basket-overview mobile rows — extract into `mobile-row-layout.tsx`.
- `tokenNames` map built independently in both exposure row files — lift into `use-basket-overview-data`.
- Portal nav menu declares `role="menu"` without arrow-key handling — implement the pattern or drop the roles.
- Tokenize the performance text colors (`PERFORMANCE_TEXT_CLASSES`) and the recurring rgba shadows as CSS vars in app.css.
- `hasReserveActivity` ignores transaction history — wallets with only past activity get the empty state and lose the Transactions section (product call).
- `dtf-cover.tsx` renders a disabled fake "Watch" button when a DTF has no video, and the cover video is a hardcoded Neocloud asset for every DTF (confirm intent).
- Account unsupported-network AlertCircle uses `fill="#FF0000"` (pre-dates the PR) — move to destructive token.
