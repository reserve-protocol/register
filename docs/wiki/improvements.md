---
title: Improvements
updated: 2026-07-03
type: context
---

# Improvements — prioritized tech debt

Synthesized from a 7-dimension architecture audit (2026-07-03: structure, state, data-fetching, duplication, type-safety, build/perf, testing). **How to use:** before a feature/bugfix, scan the Anti-patterns list (never add a new instance) and check whether your area appears below (fix opportunistically, or at least don't deepen it). Each item is scoped to be LLM-executable. Cross out / delete items as they ship.

## Anti-patterns — never add a new instance

- `useEffect` that only mirrors props/query/contract data into an atom — use a derived atom or read the hook directly (~290 existing sites; don't add #291).
- Query keys without `chainId` for chain-scoped data.
- `(await res.json()) as X` — zod-parse network responses at the boundary.
- `fetch()` without a `res.ok` check.
- `Number(formatUnits(...))`/`parseFloat` on on-chain amounts **before** business logic; float→`parseUnits(x.toString())` round-trips (scientific-notation throw). Bigint until display leaves.
- Eager route imports in `app-routes.tsx` — new routes are `lazy()`.
- New PascalCase filenames; new `react-loading-skeleton` or `legacy-table` consumers (use `ui/skeleton`, `DataTable`).
- Hardcoded `api-staging.reserve.org` / shadow `RESERVE_API` constants.
- A second mounted `Zapper` instance on one route (module-level singleton state — see [[zapper]]).
- Cross-wiring yield↔index helpers/state (extract neutral primitives instead).

## P0 — release blockers / broken safety nets

1. **Staging pins ship staging data to prod.** `src/utils/constants.ts` `RESERVE_API = true ? VITE_STAGING_API : …` (38 importers) **plus** hardcoded staging URLs in `src/hooks/useIndexDTFList.ts:5` and `src/views/home/hooks/use-featured-dtfs.ts:7`, **plus** `src/hooks/use-dtf-status.ts:4` re-defining `RESERVE_API` as prod (two environments served in one session). Fix: restore the `isStaging` ternary, replace both literals with `${RESERVE_API}…`, delete the shadow constant. Quick win. *Status: acknowledged (Luis 2026-07-03) — deliberate while staging-testing the release; MUST flip at the release cut. All three sites, not just constants.ts.*
2. **Vitest never runs in CI.** No workflow runs `pnpm test:run` — 45 test files of pinned money-math can't fail a PR. Fix: add a test job to `.github/workflows/lint.yml` (reuse its pnpm/node setup); also bump playwright.yml node 18→24 and add `release/**` triggers. Quick win.
3. **Highest-blast-radius calldata is untested.** Pin in this order: (a) `governance/views/propose/shared/utils/governance.ts` encoders (`encodeQuorum`, `encodeProposalThreshold` — pure, round-trippable); (b) `auctions/views/rebalance/utils/transforms.ts` `transformV4/V5Rebalance` RPC tuple decoders; (c) `src/lib/index-rebalance/numbers.ts` then `get-auctions.ts`; (d) extract `args` assembly from `confirm-manual-deploy-button.tsx` into a pure `build-deploy-params.ts`, then pin it.
4. **Float round-trips in deploy money paths.** `deploy-assets-approvals.tsx:134` `parseUnits((amount * 2).toString(), decimals)` (throws on scientific notation for large balances — approvals break); `use-liquidity-check.ts:66` similar. Fix: stay in bigint (`data * 2n`). Quick win.

## P1 — high-leverage correctness & performance

5. **Routes are NOT lazy — the ~10MB bundle cause.** `src/app-routes.tsx` statically imports ~50 views (deploy ≈10.5k LOC, propose ≈17.2k LOC, factsheet, internal, explorer); only `AsyncMintWizard` is `lazy()`. Fix: wrap route elements in `React.lazy` (Suspense pattern already in-file at line ~118), heaviest first: deploy, propose/*, factsheet, internal, explorer, auctions/rebalance. Recharts (15 files) then falls into route chunks. Mechanical, big TTI payoff.
6. **`useWatchReadContract` refetches every block.** `hooks/useWatchReadContract.ts` `useRefreshSignal` reads raw `blockAtom` (Base ≈2s blocks) — every mounted watched read refetches per block. Fix: point it at the existing `debouncedBlockAtom` (one-line) or a min-interval gate. Quick win, high leverage.
7. **Auction/rebalance query keys omit `chainId`** (`auctions/updater.tsx:43`, `use-rebalance-auctions.ts:67`, legacy updater) → cross-chain cache collisions; also a `console.log('response', …)` ships at `updater.tsx:55`. Fix: add `chainId` to keys now; proper fix is SDK `useIndexDtfRebalances`/`useIndexDtfRebalanceAuctions` (exist in installed 0.2.0). Quick win for keys+log.
8. **Zod at network boundaries.** ~20 `as`-cast `json()` sites, zero runtime validation outside forms. Start with the 4 price/performance endpoints: `use-dtf-price.ts`, `use-dtf-price-history.ts`, `useIndexPrice.ts`, `use-btc-price-history.ts`; add `if (!res.ok) throw` to the no-check `fetch()` sites (`index-dtf-icons-updater`, `useSnapshotBasket`, `useSimulatedBasket`, `use-asset-prices-with-snapshot`, `use-query.ts useMultiFetch`).
9. **Effect-mirror state machine in propose-dtf-settings.** `updater.tsx` (731 lines, 16 effects syncing 18 atoms, `setTimeout(…,100)` ordering hack) + `atoms.ts` (952). Fix: replace per-field mirror effects with one derived change-set (`useMemo`/derived atom → `proposalChangesAtom`); split `atoms.ts` into an `atoms/` folder with barrel (import paths stable).
10. **Per-row recharts sparklines** in `top100-table.tsx` and `index-dtf-table-columns.tsx` (≈20 chart instances per page turn). Fix: memoized inline `<svg><polyline>`. Quick win.

## P2 — structure & consolidation

11. **`quote-summary.tsx` (1,726 lines, one component)** — async-mint step mixing RPC, react-query, 8 handlers, execution lifecycle. Fix order: extract `use-mint-preflight` (readContracts block), `use-input-prices`, `use-quote-actions` hooks; split JSX last. UI parity sacred.
12. **`index-dtf-container.tsx` defines 7 data-fetching updaters inline** (12 effects, 6 queries). Fix: cut-paste each `*Updater` into `updaters/`; container composes only. Safe one-at-a-time.
13. **Single-consumer "shared" components**: `components/rtoken-setup` (31 consumers, all yield), `transaction-modal` (all yield), `stake-drawer` (all earn), `index-basket-setup`/`max-auction-size-editor`/`token-selector-drawer` (all index). Fix: relocate under their feature; keep `vote-lock`, `charts`, `token-logo`, `ui` shared. Mechanical import-prefix replace each.
14. **`deploy` is a de-facto shared library** — 20 import edges from governance/propose into deploy internals. Fix: promote form-fields schema, token-selector, shared atoms into a neutral `views/index-dtf/shared/`; both import from there. Needs a boundary decision first.
15. **Data-source consolidation**: top100 N+1 (300+ requests where one bulk `discover/dtfs` call has the data — `top100/api.ts`); market cap computed 4 ways (`use-dtf-market-caps.ts`, `top100/api.ts:259`, discover `marketCap`, SDK); brand/icon 3 ways. Fix: bulk discover as single list-view source; SDK `useIndexDtfPrice` for detail views.
16. **SDK-first migration is gated on the 0.2.0→0.3.x bump.** Installed react-sdk 0.2.0 lacks the config-constant exports (`INDEX_DTF_SUBGRAPH_URL` etc.) the SDK repo now ships — do NOT "just import" them today. Also missing SDK equivalents for `use-governed-dtfs` and deploy stToken lookups — request upstream, don't hand-migrate. Sequence: deliberate bump → replace `chainAtoms.ts` URL literals → migrate auction/rebalance hooks (#7) → discover consolidation (#15).
17. **Dual systems**: `react-loading-skeleton` (27 files) vs `ui/skeleton` (70) — migrate the 2 index-dtf stragglers now, yield later; `legacy-table` (14, yield/explorer) vs `DataTable` (18) — freeze legacy, migrate neutral consumers opportunistically. Yield/index governance proposal-detail near-copies (12+13 files) — extract neutral primitives (`components/governance/`: vote buttons, md description, tally bar), never cross-wire.
18. **rTokenStateAtom god-atom** (13-field object, effect-copied from multicall) and data-fetch updaters (`stake-drawer/updater` 6 reads, `yield-index-updater` 5, `PriceUpdater` 3…) — convert to react-query/wagmi hooks; atoms only for genuine cross-tree client state.

## P3 — hygiene

19. **Naming/lint gates**: 390 PascalCase files (icons/abis excluded = mostly yield); add a new-files-only kebab-case CI grep. Lint: 573 warnings, 89% = `exhaustive-deps` (308) + `no-unused-vars` (200) — one `pnpm lint:fix` pass clears most unused-vars; promote `no-unsafe-optional-chaining` (3) to deny.
20. **console.log in money paths** (41 sites; `lib/index-rebalance/*`, `auctions/updater`, `propose/basket/atoms.ts`) — add vite `esbuild.drop: ['console']` for prod (one line) or clean the money-path ones by hand.
21. **Basket atom collision**: two `export const basketAtom` (rtoken-setup vs index deploy) — rename to `setupBasketAtom`/`deployBasketAtom`. Quick win. Funnel 15-writer atoms through action atoms.
22. **chainId gaps**: `top100-basket-hover-card.tsx:42`, `yield-dtf … CollateralItem.tsx:104` missing `chainId`. Quick win.
23. **Misc quick wins**: remove unused `next-themes` dep; drop the Arbitrum link entry in `deploy/steps/governance/form-existing-erc20.tsx`; mark `utils/rsv.ts` with a "legacy-live, don't delete" comment (RSV + zapV2 are reachable — NOT dead code); fonts OTF→WOFF2; make `refresh-token-logos`/SEO build steps non-fatal on network failure; 1s `setInterval` on rebalance page → single ticker.

## Do-NOT list (audited, leave alone)

- RSV redemption + yield zapV2: legacy-live, reachable. Deletion breaks real flows.
- `useTokenList`-style float math at display leaves: acceptable; only kill the silent `?? '1'` fallbacks.
- Charting stack: recharts-only (no d3/lightweight-charts/ethers/moment/lodash duplication — verified). Tailwind is v3.4; the v4 upgrade is a separate planned effort.
- index.html loading setup (deferred trackers, preconnects) is already well-tuned.
