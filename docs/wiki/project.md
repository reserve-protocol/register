---
title: Project
updated: 2026-07-14
type: context
---

# Project

Register — the web interface for Reserve Protocol: **Index DTFs** (current focus) and **Yield DTFs** (legacy, `src/views/yield-dtf/*`). Protocol grounding: `docs/protocol-context.md`. Data ownership: `docs/data-sources.md`. Full pre-adoption agent doc archived at `docs/archive/CLAUDE-pre-llm-workflow-2026-07-02.md`.

## Product

- Index DTFs: on-chain token portfolios (ETF-like); governance via vote-locking; permissionless mint/redeem. Yield DTFs (legacy RTokens): asset-backed yield-bearing stablecoins secured by RSR stakers.
- Index DTF code is current best practice — when unsure, copy the nearest existing Index feature. **Never reuse Yield DTF helpers/state for Index or vice versa.**
- Chains: Ethereum, Base, BSC. **Arbitrum is deprecated for Index DTFs — never add it.**
- Vote-lock ≠ stRSR; standard vs optimistic governance are separate — never merge their voting powers or delegation.

## Team & Ownership

- Luis — lead; architects and **owns the DTF SDK** (dtf-interface monorepo:
  `@reserve-protocol/sdk`, `react-sdk`, `dtf-catalog`); final review for SDK
  changes. Juampi and Jorge — fullstack. Josh — design. Devin + claude/codex
  agents — most register iteration is agent-driven.
- **SDK boundary rule of thumb: if a routine design change requires an SDK PR,
  the line is in the wrong place.** The SDK moves at protocol cadence (~2-3
  versions/year at maturity); register changes constantly. Protocol
  data/math/calldata → SDK; anything design/product-shaped → register. See [[sdk]].

## Stack Specifics

- React 18 + Vite · TypeScript strict · Jotai · wagmi/viem/RainbowKit · TailwindCSS + shadcn/ui · React Query · React Router v6 · Lingui i18n. Package manager is **pnpm, not npm**.
- Commands: `pnpm start` (dev :3000) · `pnpm typecheck` · `pnpm lint` (oxlint) · `pnpm test:run` (vitest) · `pnpm build`. Env: `VITE_WALLETCONNECT_ID` required; `VITE_ALCHEMY_KEY`/`VITE_INFURA_KEY` recommended.
- CI: typecheck is **blocking**; oxlint strict correctness subset on changed files; pre-commit runs oxlint on staged files. Baseline ~600 warnings grandfathered — new code shouldn't add warnings.
- `chainIdAtom` is the chain source of truth — pass it to every wagmi hook; omitting `chainId` falls back to wallet/mainnet.
- Transaction flow: pending → confirming → success/error with toasts, via `TransactionButton` (`src/components/ui/transaction-button.tsx`) — it handles wallet/chain validation.
- Updater components sync chain → atoms and return `null` (`src/state/**/updater*.tsx`); only for imperative chain reads that don't fit a hook. Routes SHOULD be code-split with `lazy()` — today only async-mint actually is ([[improvements]] #5); new routes must be lazy.
- Naming: kebab-case files/dirs (mandatory) · PascalCase component exports · UPPER_SNAKE_CASE constants · branches `feature/…`/`chore/…`.
- Testing: vitest + jsdom, tests in `src/**/tests/**/*.test.{ts,tsx}`. Any hook/helper that transforms SDK/API/RPC data, derives financial values, coordinates tx state, or owns timers must have colocated tests covering weird paths (zero/missing data, invalid amounts, already-completed state, timer cleanup), not just happy paths.
- Forms: react-hook-form + zod, `mode: 'onChange'`, `FormProvider` for complex forms.

## Analytics / Instrumentation

- Register tracks user interactions in **Mixpanel**. When adding or changing a user-facing interaction (button, link, modal open, tab, toggle, media play, download), decide whether it needs an event — if product/analytics would want to see it, instrument it **in the same change**.
- **How**: on Index DTF surfaces use `useTrackIndexDTFClick(page, subpage)` / `useTrackIndexDTF(event, …)` (`src/views/index-dtf/hooks/useTrackIndexDTFPage.ts`) — they auto-attach `ca`/`ticker`/`chain` from `indexDTFAtom`. Elsewhere use `trackClick(page, cta, ca?, ticker?, chain?)` / `useTrackPage` (`src/hooks/useTrackPage.ts`). Page views go through `useTrackPage` / `useTrackIndexDTFPage`.
- New interactions ride the existing **`tap`** event as a new `cta` value (snake_case) — not a new event name — so they break down cleanly and, carrying `ca`, scope to a specific DTF. Reserve new event names for non-tap telemetry (tx, api, compliance).
- Autocapture (`$mp_click`/`$mp_scroll`/…) is enabled app-wide (`src/app.tsx`, `capture_text_content` on) — a coarse net, **not** a substitute for a semantic `tap` cta on interactions you actually want to measure.

## Safety Rules

- **Index DTF data → the SDK first.** Never hand-roll hooks, updaters, or derivation for Index DTF reads, governance, builders, or tx calls — see [[sdk]].
- **Live state → RPC, not subgraph.** Basket balances, live proposal state, live rebalance/auction state come from RPC. Subgraph = metadata/history only.
- **Money is `Amount`/`bigint`.** Never `Number` for on-chain math; convert only at display leaves. Keep SDK `Amount` objects intact through atoms and logic.
- **Feature isolation.** One feature = one folder under `views/<domain>/<feature>/` owning its `components/`, `hooks/`, `atoms.ts`, `utils.ts`. Shared code never imports from a feature; features never reach into each other's internals. Fix local bugs locally — never via shared containers, providers, routing shells, or component defaults.
- **Shared components keep their defaults** (`DataTable`, legacy `Table`, …) — behavior via opt-in props only.
- **Design tokens only** — no hardcoded hex/hsl anywhere; see [[design-system]].
- **e2e suite health is part of every stage.** Register work is agent-driven and the offline suite ([[e2e]]) is the contract that makes that safe. Stages touching covered surfaces update mocks/snapshots as part of the stage (fail-loud misses are work, not noise), never leave a new `test.fixme` without a tracked owner, and keep re-capture cheap. A red or routed-around e2e is a blocker.
- **Git: never commit or push unless told. Never push to main/master. No Co-Authored-By lines. PR descriptions: clean human summary, no AI attribution.**
- Engineer review required — handoff must say so with files/behavior/validation/remaining risk — for: on-chain math, `Amount`/`bigint`/decimals/tx builders; governance, vote-lock, rebalance, auction, issuance, redemption, zap behavior; SDK/API contracts or persistence shapes; shared component defaults, shared atoms/providers, routing, global layout; cross-feature imports or new app-wide utilities; security, compliance, geolocation, wallet, chain-switching flows; route components over size limits mixing UI with RPC/timers/tx orchestration.

## UI Register

- Professional DeFi product. **UI parity is sacred in refactors**: spacing, copy, hover/focus states, animation timing, responsive behavior, and accessibility preserved unless the task explicitly changes them.
- Wrap new user-facing strings with Lingui (`<Trans>` or `t`) **and fill es/ko/zh in the same change** — the agent generates all translations, following the glossary in `docs/i18n.md`. Don't wrap user-authored/external placeholder content unless asked.
- Reuse `src/components/ui` primitives (incl. blockchain-aware `TransactionButton`, `Transaction`, `Swap`, `CopyValue`); never rebuild dialogs/tables. Tailwind utilities + `cn()`; no custom CSS files, no inline `style`; arbitrary values only for measured/chart geometry.

## Active Risks

- `release/ai-dtf` window: cleanups must preserve JSX structure, classes, copy, and flow unless the task explicitly changes UI. Prefer pure helper/hook extraction + tests; no visual decomposition without screenshot/e2e coverage or explicit approval.
- `src/app.css` overrides `@reserve-protocol/dtf-chat` internal `.rc-*` classes (launcher theming). Contained deliberately; real fix (theming props/CSS vars) is backlogged upstream in reserve-ai.
- Large SPA bundle (~10MB); Tailwind v4 upgrade planned.

## Overrides (vs kit skills)

- `console.log` / `any` are lint **warnings, not blockers** here — fine while staging, don't ship them as permanent. Kit red-flags console.log; register is deliberately softer.
- Tests are colocated per feature (`src/**/tests/**`), not a top-level `tests/` dir — same spirit (feature owns its tests), different location.
- Review pairs run as **Dark (hostile: hallucinated APIs, instruction violations, bugs, scope creep) + Light (constructive: solves the ask? reuses patterns? simpler way?)** background subagents — a presentation style over the kit's lens taxonomy; reconcile in one pass, don't re-litigate. Pairs spawn at **medium/high profiles only** (wide radius); touch-up and low self-review through the fired lenses (`skills/workflow.md` § Calibrate: Radius × Size).
- Size gates: component < 200 lines, file < 300, > 500 auto engineer-review, > 1000 is cleanup work — register's stricter numbers win.
- Feature-level agent docs (e.g. `src/views/index-dtf/issuance/async-mint/CLAUDE.md`) add local context only and never weaken root rules.
