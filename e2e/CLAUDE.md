# E2E Suite — Agent Guide

Mock cookbook for writing/updating specs. Architecture, trust contract, and
CI split live in `docs/wiki/domains/e2e.md` — read it before changing anything
under `e2e/helpers/` or `e2e/fixtures/`. Domain-specific guides (which spec
covers what, domain states, edge cases) live next to each view:
`src/views/index-dtf/<area>/CLAUDE.md`.

## FOUNDATIONAL RULE — how every page is tested (not optional)

The suite is organized by **route → subroute** (domain), NOT by test-type. The
canonical map is `E2E_TEST_MAP.md` — a new page test goes at its domain node
there, and EVERY page is tested across THREE dimensions:

1. **State-space** — every meaningful state, not one happy render. Combinatorial
   surfaces (governance proposals = TYPE × STATE × standard/optimistic; rebalance
   = idle/running/restricted/permissionless/completed/expired) get one test per
   product-distinct state, because each renders + does different things.
2. **Loading lifecycle** — assert the ordered phases, do NOT assert on a
   skeleton-phase testid as if it were the loaded page:
   - **L0 blank** — mounts, no crash.
   - **L1 skeleton** — right shape/count, occupies the content's box (no reflow).
   - **L2 partial** — each data island resolves independently; resolving one must
     not shift another. Layout-shift budget: 0 unexpected reflows.
   - **L3 full** — all islands resolved → the actual behavior/value assertions.
   Delay per-island boundary responses (`overrides` holds a response) to freeze
   each phase; add attribute-only `<area>-skeleton` testids where missing.
3. **Mobile** — the same L0–L3 at a phone viewport (`@mobile` project), plus
   mobile chrome (bottom nav, portal menu, mobile CTA bar, table→card, dialogs).

A spec that only checks the fully-loaded desktop happy path is INCOMPLETE — it
misses the loading UX (where the layout shifts live) and mobile entirely. This
is how the suite should have been built from the start; apply it to all new
work and when touching an existing spec.

## Did a diff — should I test?

- Touched `src/views/index-dtf/**`, `src/views/yield-dtf/**`,
  `src/views/home/**`, `src/state/**`, or `src/hooks/**` → run `pnpm e2e:smoke`
  and `pnpm exec vitest run e2e/helpers/tests` (the scoped gate does both).
- Changed behavior in an area with a flow spec → also run it:
  `pnpm exec playwright test --project=full e2e/tests/flows/<area>.spec.ts`.
- New user-visible behavior in a covered area → extend that area's spec.
  New surface → new spec; check the domain CLAUDE.md first.
- Copy or styling-only diffs → no e2e change (selectors never use copy).

## Ground rules

- Committed specs are strict: ANY unmocked call fails the test at teardown.
  Never commit `allowUnmocked: true`; if a real boundary is missing, model it
  centrally in the right helper (with a negative unit test in
  `e2e/helpers/tests/`), not with a spec-local `page.route`.
- If you route AROUND a mock gap instead of modeling it (pin a different fixture,
  pick a non-triggering input, assert less), that is COVERAGE DEBT — add a line
  to `docs/wiki/progress.md` § E2E coverage debt. Strictness that authors avoid
  silently shrinks what's actually covered; the debt list keeps it honest.
- Selectors: `data-testid="<area>-<element>"` (kebab-case). Never English
  copy or name-based role queries — accessible names are Lingui-translated.
- No `waitForTimeout`, no raw `page.clock.*` in specs. Wait on an observable
  (`boundaryRequests`, `txLog`, UI state via `expect.poll`), then pump with
  `advanceTime` — a paused clock freezes React Query's notifyManager, so data
  never reaches React without a pump.
- Specs are area-owned. `e2e/helpers/**`, `e2e/fixtures/**`, and app testids
  are shared: extending them affects every spec — prefer per-test `overrides`.
- Assert values derived from snapshots (`loadSnapshot`, helpers like
  `proposalTime`), never hardcoded numbers — re-captures must not break specs.

## Recipes

**Render a DTF page.** Pick a DTF from `helpers/registry.ts` (base/lcap and
bsc/cmc20 are v5, mainnet/open and base/deprecated are v4 — use v4 to test
version gates) and navigate with `dtfPath(dtf, 'overview' | 'issuance' | ...)`.
Never hardcode addresses/chains outside the registry.

**Override a boundary response per-test** (the `overrides` fixture, matched
strictly — subgraph by operation + variables subset, API by method + path +
query subset, RPC by address + FULL calldata):

```ts
overrides.subgraph({ operationName: 'GetIndexDtfProposal' }, { dtf, proposal })
overrides.api({ pathname: '/current/dtf', search: { address } }, data)
overrides.ethCall(folio, calldata, encodeAbiParameters(...))   // exact calldata
overrides.ethBalance(TEST_ADDRESS, 2_000n * 10n ** 18n)        // vs 100 ETH default
```

Swap mid-test to model post-transaction state (submit → change the mock →
pump time → assert new UI).

**Wallet + transaction writes.** Import `test` from `fixtures/wallet` and call
`connectWallet(page)` (EIP-6963 mock, account = `TEST_ADDRESS`). Every send
lands in the `txLog` fixture — assert the payload, not the toast: `to`,
`chainId`, `value`, and `decodeFunctionData` on `data`. Queue outcomes with
`overrides.transaction({ kind: 'revert' })` / `{ kind: 'reject' }` to test
failure paths. Receipts resolve only recorded hashes.

**Frozen time.** `freezeTime(page, seconds)` BEFORE navigation (browser +
Node RPC clocks in lockstep), `advanceTime(page, ms)` after actions. Compute
timestamps relative to snapshot data (`proposalTime`, `rebalanceTime`) so
re-captures keep working.

**Compliance/geolocation.** `test.use({ compliance: {...} })` sets the
API-level geolocation for the whole spec; per-DTF restriction goes through
`overrides.api` on `/v2/compliance/geolocation/dtf/...`. Restricted flows must
assert inputs disabled AND `txLog` stays empty.

**Zaps.** `mockZapperRoutes` serves pinned quotes keyed by
(chainId, tokenIn, tokenOut, amountIn) from `loadZapSnapshot`; unknown quote
params fail loud. `seedDtfBalance` seeds balance/allowance for the sell side.
Assert the submitted tx equals the quote's `tx` byte-for-byte.

**Snapshots stale or missing.** `pnpm e2e:check` explains what's wrong.
Refresh: `pnpm e2e:capture` (full, atomic) or `--only=dtf|chain` (targeted).
After any SDK version bump, re-paste the `GetIndexDTF` query in
`scripts/capture.ts` from the SDK dist first — see the wiki.

**Debugging "unmocked call" failures.** The teardown error lists every call
with method + URL/operation/selector. Extend the central mock for product
boundaries; only truly inert hosts belong in the base-fixture inert list. A
call appearing AFTER a fix often means new UI hydrated and made new reads —
that's the fail-loud system working, not a regression.

## Boundary map — where to model a new request

A failing test's `[E2E] unmocked …` line names the boundary and the helper; this
is the same map. Every mock matches on CHAIN + identity — a right address on the
wrong chain fails loud.

| Request | Helper | Matches on |
|---|---|---|
| RPC `eth_call` (index) | `helpers/rpc.ts` `callOverrides` / `seedChainState` | address + calldata |
| RPC `eth_call` (yield) | `helpers/rpc.ts` yield replay map | chainId + address + calldata (captured) |
| RPC receipt / tx | `helpers/rpc.ts` (from `txLog`) | chainId + recorded hash |
| Subgraph (index) | `helpers/subgraph.ts` `resolveIndexQuery` | URL chain + operation + variables |
| Subgraph (yield) | `helpers/subgraph.ts` `resolveYieldQuery` | chainId + operation + query + identity |
| Reserve API | `helpers/api.ts` (path branches) | method + path + query identity |
| Zapper quote | `helpers/zapper.ts` pinned fixtures | chainId + tokenIn/out + amountIn |
| Per-test override (any) | the `overrides` fixture | exact identity you supply |

Rule: model a product boundary CENTRALLY (+ a negative unit test in
`helpers/tests/`); use `overrides.*` for a per-test state swap; never a
spec-local `page.route` or a wildcard that could answer the wrong identity.

## Writing a new test (recipe)

**START FROM A TEMPLATE.** Copy the matching skeleton from `e2e/templates/`
(`read.spec.template.ts`, `write.spec.template.ts`, `lifecycle.spec.template.ts`)
into `e2e/tests/<domain>/<route>/`. Its comments ARE the minimum oracle — a write
template will not let you ship a `txLog.length > 0` / `last()`-only assertion.
Then follow the steps below to fill it in.

0. Place it by DOMAIN — find the route→subroute node in `E2E_TEST_MAP.md`; the
   spec lives under `e2e/tests/<domain>/<route>/`. Enumerate the page's STATES
   there (one test per product-distinct state), and plan the L0–L3 lifecycle +
   `@mobile` variant (see the Foundational Rule). A single happy-path desktop
   test is not a complete page test.
1. Pick the tier: pure mock/helper logic → a `helpers/tests/*.test.ts` unit test
   (sub-second). One view's behavior → a spec (~3–5s). Read the area's
   `src/views/.../CLAUDE.md` for its states + testids first.
2. Navigate via `dtfPath`/`rtokenPath`; assert `data-testid`s and
   snapshot-derived values (never copy, never hardcoded numbers). For lifecycle:
   hold a boundary response via `overrides` to freeze L1/L2, assert the skeleton
   shape + no reflow, then release and assert content in the same box.
3. Run it; for every `[E2E] unmocked …` line, model that boundary per the map
   above (add a negative unit test if it's a new central branch).
4. Writes: `connectWallet`, assert the decoded `txLog` payload; add the
   reject/revert case via `overrides.transaction`.
5. Verify: `pnpm exec vitest run e2e/helpers/tests` then your spec (desktop +
   `@mobile`), then `pnpm e2e:smoke`. Strict teardown must stay green.

## Commands

`pnpm e2e:smoke` (fast, per-diff) · `pnpm e2e:full` (flows) · `pnpm e2e` (both)
· `pnpm e2e:ui` (headed debug) · `pnpm exec vitest run e2e/helpers/tests`
(mock contracts, fastest tier) · `pnpm e2e:check` / `pnpm e2e:capture` /
`pnpm e2e:capture:yield` (snapshots).

Speed tiers for a quick validation loop: unit tests (<1s) → one scoped spec
(~3–5s) → smoke (~16s) → full (~78s). Prefer the narrowest tier that covers
your change; the domain guides' diff→test tables say which spec.

Do NOT run two suites at once against the reused dev server (e.g. smoke + full,
or two agents) — they contend on the single Vite server and produce false
flakes. Run one suite at a time, or let the webServer spin up fresh (kill :3005
first). A "failure" that vanishes when re-run in isolation is contention, not a
real regression — check before touching timeouts.
