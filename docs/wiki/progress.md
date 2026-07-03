---
title: Progress
updated: 2026-07-03
type: ledger
---

# Progress

Stage ledger. One row per stage; keep entries short. Verifier = exact fresh commands that ran green. Lenses = one line each in the Review column.

| Stage | Status | Verifier | Review | Next |
|---|---|---|---|---|
| zapper: weighted ondo mint limits + off-hours prompts | done | `scope.mjs --gate` green: `pnpm typecheck` + `pnpm lint` + `pnpm test:run` (518 tests, 32 new) · live on BSC PHOTON vs staging (market closed): closed-error card with localized reopen time, closed-impact card on a resolved −8.16% zap quote, no CoW CTA on either | correctness+product+complexity: Dark & Light subagents, per-claim verify; adopted: signals extracted to `deriveMintPromptSignals` + tests, CoW-latch reset on unavailable flip (Dark, Important), session-bucket regular fallback matching reserve-api, lowercase session casing, shared `formatOndoTime`, wrap-to-current fallback copy; declined: tri-state minting-status helper; rest backlogged | engineer review handoff (zap behavior + shared `dtf-ondo` util); Crowdin pass for 13 new msgids |
| referral tracking: capture ?referral, Mixpanel attribution | done | `pnpm typecheck` + `pnpm lint` + `pnpm test:run` green (477 tests) · browser smoke: 8/8 (capture, lowercase, last-touch overwrite, persistence, event props, invalid-code reject, hash+query link form, no page errors) + landing screenshot | correctness+security+product+complexity: Dark & Light on plan and diff, then /code-review high (15-agent workflow, adversarial verify) — 8 verified findings applied; final scope cut by user to Mixpanel-only (reserve-api PR #212 closed unmerged, register PR #1022) | engineer review handoff: referral_wallet_linked at connect (AtomUpdater) |
| cowswap-prompt-rework | done | `pnpm typecheck` + `pnpm lint` + `pnpm test:run` green (473 tests, 21 new) · screenshots: candles default + OHLC tooltip, capacity/large/impact prompt cards on BSC ondo DTF | correctness+security+product+complexity: Dark & Light subagents, findings verified per-claim; adopted: impact input floor, empty-candles line fallback, Arbitrum entry removed, capitalize reuse; rest backlogged | engineer review handoff (zap-adjacent behavior, new app-wide hook); product acks: 1% threshold on mobile dialog, min-cap semantics |
| adopt-llm-workflow | done | `wiki-lint` green (7 pages) · `scope.mjs --base HEAD --dry-run` maps lint/typecheck/test + lenses | complexity: self (docs/tooling only) | — |
| chat-overrides-containment | done | `pnpm typecheck` + `pnpm lint` + `pnpm test:run` green · launcher screenshot identical post-move | product: self + screenshot | upstream theming to dtf-chat (backlog) |
| ui-stabilization-sweep | done | `pnpm typecheck` + `pnpm lint` + `pnpm test:run` green (458 tests, 21 new) · screenshots: explorer pagination desktop+mobile, header menu, search dialog, chat launcher | correctness+product+complexity: Dark & Light subagents, findings verified per-claim; security: no tx/money paths changed | engineer review flags in handoff (see log 2026-07-02) |

## Backlog

<!-- Minor/deferred findings. Delete items when done or obsolete. -->

- Referral: `RESERVE_API` staging pin (`src/utils/constants.ts` "USE PROD BEFORE RELEASING" TODO) is now load-bearing — referral link POSTs land on staging until flipped.
- Referral: Mixpanel funnel for marketing must key on `referral_landed` (the auto pageview at init fires before the super property is registered, so the first pageview is unattributed).
- Zapper prompt: fold `currentTab` into the mint-prompt reducer so the tab-reset stops depending on effect declaration order (both reviewers flagged the fragility; behavior verified correct today).
- Zapper prompt: localize the Ondo session label (Premarket/Regular/Postmarket/Overnight) instead of injecting the capitalized English API word into translated sentences.
- Zapper prompt: capacity trigger can re-pop the mobile dialog if the input value straddles the cap when the quote's `amountInValue` replaces the local estimate — add hysteresis if reported.
- Zapper prompt: a sub-$1k weighted cap floors to $0 and suppresses the capacity card (the quote-failure path owns it) — revisit with a $100 step if it ever occurs in practice.
- Zapper prompt: an enso quote resolving above 1% impact while minting is unavailable renders no card (deliberate fail-safe: enso resolving means minting works) — pending product ack.
- Async-mint: `maxOrderValueUsd` (`async-zap-context.tsx`) still feeds un-weighted per-asset caps to the SDK while the instant zapper now uses weighted caps — likely correct there (the SDK splits per leg, where per-asset caps apply directly), but confirm with an engineer.
- Mixpanel: zapper prompt CTA label changed `compare_automated_mint` → `cowswap_redirect` (props: variant, tab) — repin any AI-DTF board charts using the old label.
- Locales: ~117 pre-existing missing msgstr in es/ko/zh surfaced by re-extract (unrelated to any stage) — needs a translation pass.
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
