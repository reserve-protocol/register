---
title: E2E Suite
updated: 2026-07-23
type: domain
sources:
  - e2e/**
  - playwright.config.ts
  - .github/workflows/playwright.yml
---

# E2E Suite (Playwright)

Offline Index-DTF acceptance coverage for home/discover, overview, issuance,
zaps, compliance, auctions, governance, and settings, plus Yield (RToken)
render smokes. The suite characterizes Register behavior at the installed
`@reserve-protocol/react-sdk` version; SDK mapper/math/calldata correctness
remains the SDK repositories' responsibility.

## How the suite is organized (foundational)

Tests are grouped by **route → subroute** (domain), not by test-type; the
canonical coverage matrix is `e2e/TEST_MAP.md`. EVERY page is
tested across three dimensions, and a spec missing any of them is incomplete:

1. **State-space** — every product-distinct state (governance proposals =
   TYPE × STATE × standard/optimistic; rebalance = idle/running/restricted/
   permissionless/completed/expired), not one happy render.
2. **Loading lifecycle** — ordered phases L0 blank → L1 skeleton (right
   shape/box, no reflow) → L2 partial (each island resolves independently, 0
   unexpected layout shift) → L3 full (behavior/value assertions). Do NOT assert
   on a skeleton-phase testid as if it were the loaded page.
3. **Mobile** — the same L0–L3 at a phone viewport (`@mobile` project) + mobile
   chrome.

Some pre-tree specs are still desktop-happy-path only; per-spec coverage,
lifecycle depth, and gaps live in `e2e/TEST_MAP.md`. `e2e/CLAUDE.md`
§ Foundational Rule is binding for all new specs.

## Trust contract

- Only Vite on port 3005 and Chromium are live. The base fixture registers a
  default-deny egress route first, then exact RPC, Goldsky, Reserve API, zapper,
  wallet, analytics, and inert-asset handlers. Unknown egress is a test failure.
- Every committed smoke and flow test fails when a helper logs an unmocked
  request. `allowUnmocked` exists only for local exploration and must not appear
  in committed acceptance specs.
- API overrides match method + exact path + selected query identity; subgraph
  overrides match operation + selected variables; RPC overrides match address +
  full calldata. `boundaryRequests` records API/subgraph/HTTP and wallet RPC
  traffic for source, parameter, and request-count assertions.
- Live protocol state comes from RPC. Subgraph captures supply history/events.
  Registry DTF reads are seeded from captured chain state; captured v4 and v5
  versions stay address-specific so version gates cannot collapse to one value.
- The webServer boots its own :3005 every run (`reuseExistingServer: false`) —
  a foreign server can't bypass the pinned env (`VITE_E2E` keeps production
  form validation ON, so zod bounds ARE assertable in specs).

## Transactions and time

The injected EIP-6963/EIP-1193 provider records every send in the per-test
`txLog` with a unique hash. Receipt and transaction lookups accept only recorded
hashes AND require the querying chain to match the tx's chain (a hash sent on
one chain fails loud when queried from another). Tests may queue pending
success, revert, or user rejection. Write specs assert chain, target, value, decoded
function/arguments, approval spender/amount, order, and explorer hash—not just a
success toast.

Frozen specs call `freezeTime` before navigation and only `advanceTime` after
actions/queries. `advanceTime` advances browser timers and the Node-side RPC
clock together. Raw `page.clock.runFor` and fixed `waitForTimeout` calls in specs
are forbidden; wait for a boundary request or observable UI state, then pump the
clock for React Query notification/receipt timers.

## Snapshots

`helpers/registry.ts` is the single catalog. Full capture writes a temporary
tree, captures shared featured/discover/protocol data plus every required DTF
file, validates the manifest, and atomically publishes only on complete success.
Targeted capture updates its requested files without advancing global freshness.
`e2e:check` validates the complete manifest (`snapshot-manifest.ts` owns the
required-file list — don't hardcode counts in docs), each file timestamp, global
age, and DTF/chain identity.

## Commands and CI

- `pnpm e2e:smoke`: the `@smoke` project.
- `pnpm e2e:full`: all non-smoke behavior specs.
- `pnpm e2e`: both projects.
- `pnpm e2e:check`: manifest, identity, and freshness.
- `pnpm e2e:capture:yield`: re-capture the yield RToken eth_call + subgraph maps.
- `pnpm exec vitest run e2e/helpers/tests`: mock-contract unit tests.

CI uses pnpm, Node 24, current actions, and Chromium only. PR/push runs
typecheck, the mock-contract unit tests, snapshot check, and smoke; nightly/
manual adds the full project. Workflow scope routes Index+Yield DTF, home,
state, and hook changes through that gate.

Speed: local workers are capped at 5 (one Vite server doesn't scale past it).
Quick-loop tiers — unit tests <1s → one scoped spec ~3–5s → smoke ~16s → full
~78s; snapshots are parse-cached per worker. Prefer the narrowest tier for a
change (the domain guides' diff→test tables name the spec). An unmocked-call
failure names the function + the helper to model it in (`e2e/CLAUDE.md` has the
boundary map + new-test recipe).

## Maintenance rules

Prefer snapshot-derived identities and value assertions over shell visibility.
Model a new boundary centrally; do not add spec-local catch-alls. Keep translated
copy out of selectors, use structural test IDs, and never duplicate the registry.
When migrating an SDK consumer, first land a behavior characterization against
the old implementation, change the consumer, then run its focused flow + smoke.
Link both SDK workspaces together when validating unreleased paired changes; pin
the released paired versions before merge. On any SDK version bump, re-paste the
hand-copied `GetIndexDTF` query in `e2e/scripts/capture.ts` from the new SDK
dist (it is not exported) and re-run `pnpm e2e:capture` — the `dtf-data` canary
smoke fails on drift but only a fresh capture fixes it.

Non-goals: forked-chain execution, visual/pixel regression, v6 contracts.
Coverage state and open gaps live in `e2e/TEST_MAP.md`; harness-level debt in
[[progress]] § Backlog. Governance, issuance, compliance, and
transaction-contract edits require engineer review.

Hard-won spec traps:

- Error-path specs that wait for react-query retry exhaustion must pump ~10s
  past the retry backoff (see the settings fee-unavailable spec).
- Atom-reset specs must drive a REAL in-app DTF→DTF navigation — `page.goto`
  reboots the app and proves nothing about resets; the reset list is unit-pinned
  in `src/state/dtf/tests/reset-index-dtf-atoms.test.ts`.
- Index DTF status is a synchronous `@reserve-protocol/dtf-catalog` lookup —
  zero fetches, nothing to mock; the `KNOWN_DEPRECATED` fail-safe survives only
  inside `useDTFStatus` (unit-pinned in `src/hooks/tests/use-dtf-status.test.ts`).
- Brand is ONE folio-manager request (the SDK full-DTF read); unbranded (`{}`)
  is a settled state — the cover slot collapses, not a skeleton forever.

## Yield DTF (RToken) replay architecture

Yield views read almost everything from RPC via vendored ABIs (FacadeRead,
Main, StRSR, BasketHandler, RToken, governor), not the SDK — so the yield seam
is a **record/replay eth_call map** (`chainId:address:calldata → return`)
captured at a pinned block per RToken (eUSD mainnet, hyUSD base;
`pnpm e2e:capture:yield`). Two extra captured boundary kinds, both fail-loud:

- **Storage reads** — exact `address:slot → word` for `eth_getStorageAt` (the
  staking withdraw updater); no blanket zero word.
- **Allow-failure reverts** — legacy probes (e.g. `Broker.auctionLength()`)
  that revert on modern contracts are captured as a sentinel and replayed as a
  genuine multicall `success: false`, keeping the app on its on-chain branch.
- **Yield geo-compliance** — RToken issuance probes Cloudflare `cdn-cgi/trace`
  (distinct from index compliance); the base fixture serves a deterministic
  trace carrying the `compliance` fixture's country.

Trust rules (a yield test can't go green while wrong):

- Chain-scoped keys everywhere (eth_call map + subgraph
  `chainId::op::query::identity`) — a shared address can't serve another
  chain's data.
- Under replay, an uncaptured contract read fails loud — no borrowing the index
  `*:selector` tables or the $1 price default; no blanket `hasRole`/storage
  answers.
- Index isolation: the yield subgraph resolver engages only while a yield test
  is active; off-chain/zero-address transients are absorbed unlogged, but an
  on-chain-shaped read at the fixture's chain still fails loud.
- `e2e:check` validates yield snapshot identity, pinned block, nonempty map,
  and within-chain key collisions.

Covered: overview / issuance / staking render smokes. Remaining yield phases
(auctions/governance/settings smokes, then mint → stake → vote flows) and
deferred writes are tracked in `e2e/TEST_MAP.md` § gaps.

Related: [[project]], [[sdk]], [[yield-protocol]], [[subgraphs]].
