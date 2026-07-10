---
title: E2E Suite
updated: 2026-07-10
type: domain
sources:
  - e2e/**
  - playwright.config.ts
  - .github/workflows/playwright.yml
---

# E2E Suite (Playwright)

Offline Index-DTF acceptance coverage for home/discover, overview, issuance,
zaps, compliance, auctions, governance, and settings. The suite characterizes
Register behavior at the installed `@reserve-protocol/react-sdk` version; SDK
mapper/math/calldata correctness remains the SDK repositories' responsibility.

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

## Transactions and time

The injected EIP-6963/EIP-1193 provider records every send in the per-test
`txLog` with a unique hash. Receipt and transaction lookups accept only recorded
hashes and echo the recorded from/to/data/value. Tests may queue pending success,
revert, or user rejection. Write specs assert chain, target, value, decoded
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
- `pnpm exec vitest run e2e/helpers/tests`: mock-contract unit tests.

CI uses pnpm, Node 24, current actions, and Chromium only. PR/push runs typecheck,
snapshot check, and smoke; nightly/manual runs typecheck, snapshot check, and the
full project. Workflow scope also routes Index DTF, home, state, and hook changes
through the smoke gate.

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

Coverage intentionally does not claim forked-chain execution, mobile matrices,
visual regression, Yield DTF flows, v6 contracts, vote-lock/deploy, or full
settings/auction write families. Those require new registry fixtures and
behavior specs rather than looser mocks. Governance, issuance, compliance, and
transaction-contract edits require engineer review.

Related: [[project]], [[sdk]].
