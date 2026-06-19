# Register — Agent Knowledge Base

Register is the web interface for Reserve Protocol: **Index DTFs** (current focus) and **Yield DTFs** (legacy).

- **Stack:** React 18 + Vite · TypeScript (strict) · Jotai · wagmi + viem + RainbowKit · TailwindCSS + shadcn/ui · React Query · React Router v6.
- **Package manager:** pnpm (NOT npm). **Chains:** Ethereum, Base, BSC. **Arbitrum is deprecated for Index DTFs — never add it.**

This doc is written for agents: terse rules, verified facts, pointers — not prose. When unsure, copy the nearest existing feature. Index DTF code is current best practice; Yield DTF is legacy.

**`AGENTS.md` is a symlink to this file** — edit `CLAUDE.md` only; both Claude Code and AGENTS.md-aware tools read the same content.

---

## Contribution Model

The goal: agents help humans ship reliable, on-standard code quickly. The codebase will see more LLM-authored work; quality degradation is possible, so contain it early: isolate features, keep code boring, flag risky changes loudly, and make cleanup predictable. Verification surface = the running app + `pnpm typecheck` + `pnpm lint` + changed-code checks + the review pass.

Rules are identity-blind. Do not infer whether a designer or engineer is driving the work. Classify risk by code touched, behavior changed, and blast radius.

### Boundaries — do not cross

- **Index DTF data → the SDK.** Don't hand-roll hooks, updaters, scripts, or derivation for Index DTF reads, governance, builders, or tx calls. (See **SDK — Use It First** below.)
- **Feature isolation.** A feature may import from `components/ui`, shared `components/`, `hooks/`, `utils/`, `state/`, and the SDK. Shared code must NOT import from a feature folder; features must NOT reach into each other's internals. Lift shared needs up to `components/` or `utils/`.
- **Index ≠ Yield.** Never reuse Yield DTF helpers/state for Index DTF or vice versa. Yield lives under `views/yield-dtf/*`.
- **Live state → RPC, not subgraph.** Basket balances, live proposal state, and live rebalance/auction state come from RPC. The subgraph is metadata/history only.
- **Money is `Amount` / `bigint`.** Keep SDK `Amount` objects intact; convert to `Number` only at display leaves. Never use `Number` for on-chain math.
- **Design tokens only.** No hardcoded hex/hsl — use semantic Tailwind tokens. (See **Design System** below.)
- **Shared components keep their defaults.** `DataTable` / `Table` etc. are app-wide — add behavior via opt-in props, never change defaults.
- **Never auto-commit or push.** Commits and pushes are the user's call. (See **Workflow & Ops** below.)

### Coding rules

- **Dumb beats clever.** Explain it in 30s or it's too complex. Three similar lines beat a premature abstraction. No abstractions for one-time use, no features nobody asked for, no error handling for impossible cases.
- **Explicit over implicit.** Verbose names over abbreviations, early returns over nested ifs, booleans prefixed `is`/`has`/`can`/`should`. `const` arrow functions.
- **Size:** components < 200 lines, files < 300. Strict unless a reviewer signs off. Extract sub-components into the feature folder.
- **State → Jotai.** Small focused atoms; derived atoms for computed values; action atoms for coordinated writes. Never `useEffect` to sync or derive state. `useAtomValue` for reads, `useSetAtom` for writes, `useAtom` only when you need both. Atom families for dynamic instances.
- **Logic → hooks.** Fetching, derivation, and non-trivial effects live in a hook in the feature's `hooks/`. Components stay dumb: call hooks, render, early-return on loading/empty.
- **Loading + error states** on every async surface. **Named constants with context** over magic numbers (`MIN_MINTING_FEE = parseEther('0.0015') // 0.15%`).
- **Comments explain WHY, not WHAT** (`// WHY:` / `// NOTE:`). A better name beats a comment that explains what code does.
- **`console.log` / `any`:** fine for staging and debugging — just don't ship them as permanent. They are lint **warnings, not errors**. Don't leave TypeScript errors.
- **Forms:** react-hook-form + zod, `mode: 'onChange'`, `FormProvider` for complex forms.
- **i18n:** Wrap new user-facing strings with Lingui (`<Trans>` or `t`). Do not wrap intentionally external/user-authored placeholder content unless requested.
- **Tailwind utilities** (`px-4`, `gap-2`, `h-12`); arbitrary values only for measured/chart geometry. `cn()` (`src/lib/utils.ts`) for conditional classes. No custom CSS files, no inline `style`.
- **Direct wagmi hooks in components are fine** when simple — not an anti-pattern.
- **UI parity:** Refactors must preserve spacing, copy, hover/focus states, animation timing, responsive behavior, and accessibility unless the task explicitly changes them.

### Containment & Reuse

A feature should be addable without understanding the whole app, and deletable in one `rm -rf` without breaking anything else. Flexible, not dogmatic — if reuse would force a bad abstraction, write the three dumb lines instead.

- **One feature = one folder** under `views/<domain>/<feature>/` owning its `components/`, `hooks/`, `atoms.ts`, and local `utils.ts`. It owns its atoms; don't mutate another feature's.
- **Reuse before you build:** UI → `src/components/ui` (don't rebuild a dialog or table). Helpers → `src/utils` (grep first — formatting, validation, routes, time helpers already exist). Data → the SDK. State → Jotai.
- **Fix local bugs locally.** Do not solve a feature layout/animation issue by changing app containers, routing shells, shared providers, or component defaults unless the task is explicitly about that shared surface.

### Engineer Review Flags

Agents cannot know who is driving the change. They can and must identify risky surfaces. You may implement these when explicitly requested, but final handoff must clearly say **Engineer review required** and explain why:

- on-chain math, `Amount`, `bigint`, decimals, rounding, token units, or tx builders
- governance, proposal, vote-lock, rebalance, auction, issuance, redemption, or zap behavior
- SDK/API contracts, request/response shapes, persistence schemas, or backend assumptions
- shared component defaults, shared atoms/providers, routing, app containers, or global layout
- cross-feature imports, shared mutable state, or new app-wide utilities
- security, compliance, geolocation, wallet, transaction, or chain-switching flows

Required handoff note:

- files touched
- behavior changed
- why engineer review is required
- validation performed
- remaining risk or assumptions

### Agent Review Workflow (run them smart, not every step)

Review agents catch real issues every time but cost time — run them where they pay off, as parallel threads, not blockers.

- **Small change** (one file, copy, a prop, styling, a rename): self-review against the rules above. No agents.
- **Large change** (multi-file, real logic, new data flow, money/on-chain math):
  1. **Split into stages** (e.g. "data hook + atoms" → "list UI" → "detail UI").
  2. **Triage each stage cheaply:** worth a review? Skip trivial/mechanical stages — `pnpm typecheck` + `pnpm lint` + self-review cover those. If a feature keeps triaging to "skip," review once at the end.
  3. **Worth it → spawn Dark + Light as _background_ subagents and keep building.** Don't idle waiting.
     - **Dark (hostile):** hallucinated APIs / fake SDK hook names, instruction violations, bugs, missing validation, races, scope creep.
     - **Light (constructive):** solves the ask? reuses existing patterns / SDK / utils? testable? a simpler way?
  4. **Reconcile when they land** in one neat pass — fix what's real, drop what isn't, don't re-litigate.
  5. **Always review the whole feature at least once** at the end (or whenever the user asks), lens on _improving_ quality against these rules.

Loop: build → triage → review-in-parallel → reconcile → ship. Skip reviews that won't pay off; never skip the end-of-feature one. Never leave items "for next session."

### Enforcement (automated)

- **Pre-commit** (`.husky/pre-commit`): `oxlint` on staged `.ts/.tsx`. Most rules are warnings, but a small correctness set is denied on changed files. `any`/`console.log`/unused are warnings, not blockers. Fast; no typecheck.
- **CI** (`.github/workflows/lint.yml`): `pnpm typecheck` (**blocking** — type errors are real bugs) + `pnpm lint` (full-repo report) + strict oxlint on changed `.ts/.tsx` files for high-signal correctness issues.
- **Linter:** `oxlint`, config `.oxlintrc.json` (plugins `typescript`, `unicorn`, `oxc`, `react`, `react-perf`). Baseline ~600 warnings / 0 errors — legacy grandfathered, fix incrementally. New code shouldn't add warnings (guidance), and changed files must pass the strict correctness subset.

---

## Design System

Source of truth: `tailwind.config.ts` (tokens) + `src/app.css` (CSS variables, light + `.dark`). Dark mode is class-based (`darkMode: ['class']`) — prefer `dark:` utilities over JS theme branching.

### Color tokens (semantic — never hardcode hex/hsl)

Every color is an HSL CSS variable exposed as a Tailwind color. Use the utility, not a raw value:

- **Surfaces:** `background`, `card`, `container`, `popover`, `muted`, `secondary`, `accent` — each with a `-foreground` pair (e.g. `bg-card text-card-foreground`).
- **Brand / intent:** `primary`, `success`, `destructive` (+ `-foreground`); `warning` (no `-foreground` pair).
- **Lines / inputs:** `border`, `borderSecondary`, `input`, `ring`.
- **Data viz:** `chart-1`…`chart-5`, `legend`, `tvl`.

Examples: `text-muted-foreground`, `border-border`, `bg-primary text-primary-foreground`, `text-destructive`. A new color means adding the CSS var in **both** `:root` and `.dark` in `src/app.css` first — never a one-off hex.

### Type, radius, layout, motion

- **Font: TWK Lausanne.** Only three weights exist — `font-light`/`font-normal` = 300, `font-medium`/`font-semibold` = 500, `font-bold` = 700. Don't expect 400/600; they collapse to these.
- **Radius:** `rounded-sm/md/lg` derive from `--radius` (0.5rem); plus `rounded-3xl` (1.25rem) and `rounded-4xl` (1.5rem) for cards/dialogs/drawers.
- **Layout:** centered `container` capped at 1400px. Standard spacing (`p-4`, `gap-2`, `h-12`); arbitrary values only for measured/chart geometry.
- **Motion:** animations predefined in `tailwind.config.ts` (`animate-fade-in`, `animate-slide-up`, `animate-spin-slow`, `animate-shimmer`, accordion/dialog). Reuse them; don't write keyframes for standard motion.

### Components (don't rebuild these)

shadcn/ui primitives in `src/components/ui`: Dialog, Drawer, Modal, Card, Button, Input, Textarea, Select, Multiselect, Checkbox, Switch, Tabs, Accordion, Collapsible, Tooltip, HoverCard, Popover, DropdownMenu, Command, Table / DataTable / legacy Table, Progress, Slider, Skeleton, Spinner, Sonner (toasts) — plus blockchain-aware ones: `TransactionButton`, `Transaction`, `Swap`, `CopyValue`. Shared composites (token logos, tables, icons) live in `src/components`.

> `DataTable` / legacy `Table` are used app-wide — never change their defaults; add behavior via opt-in props.

---

## SDK — Use It First (Index DTF)

The SDK is `@reserve-protocol/react-sdk` (it wraps `@reserve-protocol/sdk`, a transitive dep — import from `react-sdk`, not `sdk`). It is Register's primary source for Index DTF reads, governance state, proposal builders, and transaction calls. **Before writing a new hook, updater, script, or data utility for Index DTF data, check whether the SDK already exposes it — it almost always does.**

**Two sources you always have, no local setup:**

1. **The installed package** — `node_modules/@reserve-protocol/react-sdk/dist/index.d.mts` is the version-accurate list of every export. Source of truth for what exists; use the discovery command below.
2. **The SDK repo `reserve-protocol/dtf-interface`** — its `docs/` folder is agent-optimized docs (browse on GitHub or read locally if checked out). Read instead of guessing:
   - `docs/README.md` — index with per-task reading orders.
   - `docs/sdk/api-surface.md` — API shape (namespaces, refs, `ContractCall`).
   - `docs/register/interface.md` (+ `register/governance-flows.md`, `register/issuance-deploy-flows.md`) — how SDK behavior must match Register.
   - `docs/known-gotchas.md` — pitfalls.
   - `AGENTS.md` — SDK data-boundary rules (money is always `Amount`, mappers stay deterministic).

**What the SDK gives you** (confirm the exact current name in the installed package before use — don't invent names):

- **Read hooks** (React Query): `useIndexDtf`, `useIndexDtfBasket` / `useCurrentIndexDtfBasket`, `useIndexDtfPrice`, `useIndexDtfProposals` / `useIndexDtfProposal` / `useIndexDtfProposalList`, `useIndexDtfCurrentRebalance` / `useIndexDtfRebalances` / `useIndexDtfRebalanceAuctions`, `useIndexDtfRevenue`, `useIndexDtfVoteLockState` / `useIndexDtfVoterState`, `useAccountPortfolio`, `useDiscoverDtfs` / `useIndexDtfList` / `useIndexCatalog`, and dozens more.
- **Query options** (`*QueryOptions`, e.g. `indexDtfProposalsQueryOptions`) for every read — use with `useQuery`/`prefetchQuery`/`queryClient` for custom caching or imperative fetches.
- **Proposal builders:** `useBuildIndexDtfBasketProposal`, `useBuildIndexDtfSettingsProposal`, `useBuildIndexDtfDaoSettingsProposal`, `useBuildIndexDtfBasketSettingsProposal`.
- **Transaction-call hooks:** `useIndexDtfVoteCall`, `useIndexDtfQueueProposalCall`, `useIndexDtfExecuteProposalCall`, `useIndexDtfCancelProposalCall` — return SDK `ContractCall` objects (`{ chainId, to, data, value, contract: { address, abi, functionName, args } }`) ready to feed `TransactionButton`.
- **Optimistic governance:** `useIndexDtfOptimisticProposalContext` + the `useIndexDtfOptimistic*` family.
- **Providers:** `DtfSdkProvider` (wired in `src/state/chain/index.tsx`) and `IndexDtfProvider` (wired in `src/views/index-dtf/index-dtf-container.tsx`, binds active DTF address/chain). `useDtfSdk()` returns the imperative client.
- **Helpers/constants:** `mapIndexDtfData`, `dtfQueryKeys`, `LIVE_STALE_TIME` / `STATIC_STALE_TIME` / `DEFAULT_STALE_TIME`.

Discover the current surface anytime:

```bash
grep -oE "export \{[^}]*\}" node_modules/@reserve-protocol/react-sdk/dist/index.d.mts \
  | tr ',' '\n' | grep -oE "[A-Za-z0-9_]+" | sort -u
```

**Boundary — who owns what:** Register owns UI state, routing, transaction sending, toasts, product copy. The SDK owns proposal reads, voting-state derivation, builders, exact on-chain math.

- Keep SDK `Amount` objects in atoms/intermediate types. Don't convert `Amount.formatted` → `Number` then rebuild fake `Amount`s.
- Use SDK `proposal.votingState` for Index DTF proposal display state. Don't add a Register-local `getProposalState`.
- Convert amounts to `Number` only at display leaves, never before business logic or proposal-state checks.
- For optimistic proposals, call `useIndexDtfOptimisticProposalContext` on detail/voting flows when exact veto threshold, snapshot, or optimistic voting power is needed; pass it into SDK voter-state helpers.
- Proposal list/overview: avoid hidden per-row RPC hydration — use SDK list data + documented refresh.

For linking Register against a local SDK checkout while developing the SDK, see `docs/local-sdk-development.md`.

---

## Product Knowledge

Read the relevant doc in `dtf-interface/docs` before building a flow — don't guess protocol behavior:

| Building… | Read |
| --- | --- |
| Index DTF reads / discovery | `protocol/data-sources.md` → `index-dtf/overview.md` → `index-dtf/discovery-holders.md` |
| Mint / Redeem / Zap | `index-dtf/issuance-redemption.md` → `integrations/zapper.md` |
| Governance / proposals | `protocol/governance.md` → `index-dtf/governance.md` → `register/governance-flows.md` |
| Rebalance / auctions | `index-dtf/rebalance-auctions.md` → `index-dtf/contracts-and-versions.md` |
| Revenue / fees / vote-lock | `index-dtf/revenue-fees.md` → `index-dtf/vote-lock.md` |
| Matching Register behavior | `register/interface.md` |

**Data-source routing** (who owns the truth — never infer from the wrong source). Full table in `docs/data-sources.md`:

| Data | Source |
| --- | --- |
| Basket / balances, live supply (incl. pending fee shares) | RPC (`totalAssets()`, `totalSupply()`) |
| Current price / discovery / status / vote-lock APR | Reserve API |
| Metadata, governance history, roles, holders | Index subgraph |
| **Live** proposal state | RPC (`governor.state()`) — NOT subgraph |
| **Live** rebalance / auction state | RPC (`getRebalance()`) — NOT subgraph |
| Historical charts | Reserve API |

**Top gotchas** (full list in `docs/known-gotchas.md`):

- The subgraph is not live truth — don't read basket balances, final proposal state, or active auction state from it.
- Standard vs optimistic governance are separate — never merge their voting powers or delegation.
- Vote-lock ≠ stRSR, and the vote-lock underlying token is not always RSR. Keep Index vote-lock and Yield stRSR logic apart.
- Contract versions differ (v5/v6): `startRebalance` / `openAuction` / `bid` signatures vary — don't hardcode an old ABI.
- `totalSupply()` includes pending fee shares — ignoring them breaks price/share math.

---

## Architecture Notes (pointers, not boilerplate)

- **Updater components** sync chain → atoms and return `null` (see `src/state/**/updater*.tsx`, `views/index-dtf/governance/updater.tsx`). Use only for imperative chain reads that don't fit a hook.
- **Feature entry** (`index.tsx`) renders sections + an optional `<Updater/>`; wrap with `withNavigationGuard` (`src/hoc/with-navigation-guard.tsx`) where wallet-gated.
- **Transaction flow:** pending → confirming → success/error with toast feedback. Use `TransactionButton` (`src/components/ui/transaction-button.tsx`) — it handles wallet/chain validation. SDK tx-call hooks return `ContractCall` objects to feed it.
- **`chainIdAtom` is the chain source of truth** — pass it to wagmi hooks; omitting `chainId` falls back to wallet/mainnet.
- **Routes** are code-split with `lazy()`.

---

## Project Map

```
src/
├── components/
│   ├── ui/          # shadcn/ui primitives + blockchain-aware components
│   └── ...          # shared composite components
├── hooks/           # cross-feature hooks (blockchain priority)
├── lib/             # cn() and low-level helpers
├── state/           # Jotai atoms + providers (chain, dtf, wallet, ...)
├── types/           # TypeScript definitions
├── utils/           # pure utilities (formatters, validation, routes, chains)
└── views/           # route-based pages
    ├── index-dtf/   # Index DTF features (CURRENT)
    │   ├── governance/
    │   ├── auctions/views/rebalance/   # v4 rebalance UI
    │   └── issuance/
    └── yield-dtf/    # Yield DTF features (LEGACY, e.g. staking/)
```

**Key locations:**
- Rebalance v4: `views/index-dtf/auctions/views/rebalance/` — `components/launch-auctions-button.tsx`, `hooks/use-rebalance-params.ts`, `utils/get-rebalance-open-auction.ts`, `updaters/rebalance-metrics-updater.tsx`.
- Governance: `views/index-dtf/governance/`. Issuance: `views/index-dtf/issuance/` (zapper / manual / direct).
- SDK provider wiring: `src/state/chain/index.tsx`, `views/index-dtf/index-dtf-container.tsx`.
- Utilities: `src/utils` (+ `cn` in `src/lib/utils.ts`).

**Naming:** files & dirs `kebab-case` (mandatory) · PascalCase component exports from kebab-case files · `UPPER_SNAKE_CASE` constants · branches `feature/…` or `chore/…`.

---

## Protocol Fundamentals

**Index DTFs** — on-chain token portfolios (like ETFs); 100+ tokens on Base, 10+ on Ethereum. Two basket types:
- **Native** (`weightControl = true`): maintain percentage allocations.
- **Tracking** (`weightControl = false`): maintain fixed token units.
Governance via vote-locking; permissionless mint/redeem.

**Yield DTFs (legacy, formerly RTokens)** — asset-backed yield-bearing stablecoins, secured by RSR stakers (first-loss capital), yield from collateral.

**Rebalancing (v4)** — single governance proposal executes the whole rebalance. Dual window (Auction Launcher → Community), Dutch auctions via CoWSwap. Volatility controls LOW 5% / MEDIUM 10% / HIGH 50%. Progressive via percent slider. Lifecycle: proposal `startRebalance` → execution opens launcher window → `openAuction` → CoWSwap fills → basket updates on-chain.

**Governance** — OpenZeppelin Governor: Proposal → Voting → Timelock → Execution. Vote-locking (Index) / RSR staking (Yield). Delegation supported. Standard + optimistic modes.

**Terms:** Folio = Index DTF token contract · RSR = Reserve Rights (governance/staking) · D27 = 27-decimal price format · Geometric mean = fair-price method · Absolute vs Relative progression = actual vs user-visible rebalance progress.

---

## Workflow & Ops

**Git:** `feature/`/`chore/` branches → push triggers Cloudflare Pages preview → PR with ≥1 reviewer. **Never push to main/master. Never commit or push unless told. No `Co-Authored-By` lines. PR descriptions: clean human summary, no AI attribution.**

**Commands:**

```bash
pnpm install         # install deps (pnpm, not npm)
pnpm start           # dev server (port 3000)
pnpm build           # production build (runs tsc)
pnpm typecheck       # tsc --noEmit
pnpm lint            # oxlint full-repo report
pnpm lint:fix        # safe autofixes only
pnpm lint:fix:dangerous # behavior-changing oxlint fixes; use only after review
pnpm test            # vitest watch  ·  pnpm test:run for single run
```

**Env:** `VITE_WALLETCONNECT_ID` (required); `VITE_ALCHEMY_KEY`, `VITE_INFURA_KEY` (recommended).

**Testing:** Vitest + jsdom. Tests in `src/**/tests/**/*.test.{ts,tsx}`. Test behavior in hooks, not implementation; tests are disposable when requirements change.

**Known issues:** large SPA bundle (~10MB); Tailwind v4 upgrade planned.

**Security:** static SPA; contracts audited; timelock + role-based access; single active rebalance; no sensitive data in frontend.

---

## Resources

**Internal docs:** `/docs/protocol-context.md` · `/docs/data-sources.md` · `/docs/specs/rebalance-v4-specification.md` · `/docs/specs/index-dtf-governance-and-proposal.md` · `/docs/architecture/*.md` · `/docs/prd.md` · `/docs/local-sdk-development.md`.

**Repos:**
- **SDK:** `@reserve-protocol/react-sdk` + `@reserve-protocol/sdk`, monorepo [`reserve-protocol/dtf-interface`](https://github.com/reserve-protocol/dtf-interface) — agent docs in `docs/`, start at `docs/README.md`.
- **Subgraphs:** [`dtf-index-subgraph`](https://github.com/reserve-protocol/dtf-index-subgraph) (Index), [`reserve-subgraph`](https://github.com/reserve-protocol/reserve-subgraph) (Yield).
- **Contracts:** [`reserve-index-dtf`](https://github.com/reserve-protocol/reserve-index-dtf). **API:** `reserve-protocol/reserve-api`.

**External:** [Reserve Protocol](https://reserve.org/protocol/) · [wagmi](https://wagmi.sh) · [RainbowKit](https://rainbowkit.com/docs) · [Jotai](https://jotai.org) · [shadcn/ui](https://ui.shadcn.com).
