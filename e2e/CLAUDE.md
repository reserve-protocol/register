# E2E Suite — Agent Guide

Mock cookbook for writing/updating specs. Architecture, trust contract, and
CI split live in `docs/wiki/domains/e2e.md` — read it before changing anything
under `e2e/helpers/` or `e2e/fixtures/`. Domain-specific guides (which spec
covers what, domain states, edge cases) live next to each view:
`src/views/index-dtf/<area>/CLAUDE.md`.

## Did a diff — should I test?

- Touched `src/views/index-dtf/**`, `src/views/home/**`, `src/state/**`, or
  `src/hooks/**` → run `pnpm e2e:smoke` (the scoped gate does this too).
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

## Commands

`pnpm e2e:smoke` (fast, per-diff) · `pnpm e2e:full` (flows) · `pnpm e2e` (both)
· `pnpm e2e:ui` (headed debug) · `pnpm exec vitest run e2e/helpers/tests`
(mock contracts) · `pnpm e2e:check` / `pnpm e2e:capture` (snapshots).
