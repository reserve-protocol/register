# E2E Buildout Plan — fill the map, 3 dimensions per page

Plan for filling `E2E_TEST_MAP.md` under the new domain org. Follows
`skills/planning.md` (slices sized for one fresh context; setup/lifecycle/mobile
travel WITH the behavior they cover, not as horizontal phases).

## Goal

Every route→subroute in `E2E_TEST_MAP.md` covered across all three dimensions —
state-space, loading lifecycle (L0→L3), mobile — with strict-mock/snapshot-
derived assertions, organized under `e2e/tests/<domain>/<route>/`.

## Current state

42 flat specs (`smoke/` + `flows/`), 123 tests, desktop-happy-path-only. Index
DTF core is broad; yield is overview/issuance/staking render only; General
(home/discover/earn/portfolio/explorer/bridge), manage/factsheet, most write
flows, ALL mobile, and ALL loading-lifecycle are gaps. Several specs assert on
skeleton-phase testids (race hydration). 23 app findings in
`INDEX_DTF_FINDINGS.md` are documented as `test.fixme` — fixes await triage.

## Non-goals (this plan)

Forked-chain execution, pixel/visual regression, v6 fixtures, permissionless
deploy wizard writes. The app FIXES (INDEX_DTF_FINDINGS) — coverage first, fixes
after triage (each fix un-fixmes its regression test).

## Acceptance evidence

- `pnpm e2e` (desktop-full + mobile-full) green; per-route L0–L3 asserted.
- Layout-shift probe reports 0 unexpected reflows per covered route (or a
  logged finding for each real shift).
- `E2E_TEST_MAP.md` status column: no ⬜ for a shipped route; 🐛 rows have a
  `test.fixme` regression.
- Each map node reachable from `e2e/tests/<domain>/<route>/`.

## Test seams

- Playwright `page` + `boundaryRequests` (identity/counts) + `txLog` (decoded
  writes) + `overrides.*` (per-test state) — existing.
- NEW seam (S0): `overrides.hold(boundary)` / a controllable-latency response so
  a spec can FREEZE L1 (skeleton) and L2 (one island resolved, others pending),
  plus a `layoutShift(locator)` probe (boundingRect deltas across a transition),
  plus a `mobile` project + viewport fixture. Without these the lifecycle
  dimension has no seam — S0 is the blocker for every lifecycle assertion.

## Slices (work the first unblocked; each is one fresh context)

**S0 · Lifecycle+mobile seam (expand) — blocks all lifecycle/mobile slices.**
Add `overrides.hold`/delayed-response, the `layoutShift` probe, a `@mobile`
Playwright project (iPhone-13 viewport) + fixture, and a `_shared/lifecycle.ts`
helper encoding the L0–L3 assertion pattern + a `describeLifecycle(route)` sugar.
Unit-test the probe. Demonstrable: one existing route (overview) asserts L0–L3 +
mobile via the new helper. Blocked by: none.

**S1 · Domain-tree migration (migrate, green batches) — blocked by: none.**
Move the 42 specs into `e2e/tests/<domain>/<route>/` + retag (`@smoke`/`@mobile`),
no logic change, keep green each batch (expand→migrate→contract: leave the
old dirs until the last batch, then delete). Demonstrable: `pnpm e2e` green from
the new tree; old dirs gone.

**S2 · Overview (index) full — blocked by: S0.** Highest traffic + layout-shift
home + SPA nav. State-space (render×3, chart ranges, empty/single-point/price-0
#20, deprecated), L0–L3 with the layout-shift review (the known shift work),
mobile. Un-fixme SPA assertions only after FIX-A (post-triage).

**S3 · Issuance (index) full — blocked by: S0.** Zap + manual + automated,
across states + L0–L3 + mobile. Rolls in the existing math/edge specs.

**S4 · Governance proposal matrix — blocked by: S0.** Split by TYPE (one slice
each: basket, dtf-settings, basket-settings, DAO/other, WHITELIST) × STATE ×
standard/optimistic, each with its detail-preview + decoded action + L0–L3 +
mobile. The largest area; sub-slice per type so each fits one context.

**S5 · Auctions/rebalance states — blocked by: S0.** idle/running/restricted/
permissionless/completed/expired + launch/community/bid write + permission
matrix + legacy v2, L0–L3 + mobile.

**S6 · Settings/roles + manage + factsheet — blocked by: S0.** Value assertions
(rolls in existing settings spec), distributeFees, manage SIWE/upload/save,
factsheet, L0–L3 + mobile.

**S7 · Yield full — blocked by: S0.** overview/issuance/stake/auctions/gov/
settings across states + L0–L3 + mobile (extends the yield capture per view).

**S8 · General routes — blocked by: S0.** home, discover, earn (index/yield/
defi), portfolio, explorer (transactions/tokens/collaterals/governance/revenue),
bridge, create-gates — each state-space + L0–L3 + mobile. Needs new snapshots
(explorer/portfolio/bridge boundaries) — capture per route.

## Sequencing

S0 first (unblocks everything). Then S1 (migration) in parallel-safe batches.
Then S2–S8 by value: S2 (overview/layout-shift) → S3 (issuance/money) → S4
(governance matrix) → S5/S6 → S7 (yield) → S8 (general). Each S2–S8 slice is a
candidate for one focused agent (area-owned specs; `overrides`/capture as the
escape hatch; shared helpers stay orchestrator-owned). Fixes (INDEX_DTF_FINDINGS)
land in a separate post-triage pass, each un-fixme-ing its regression.

## Unresolved decisions (need Luis)

- **Mobile in CI**: run `@mobile` on every PR (2× smoke cost) or nightly-only?
- **Layout-shift budget**: is "0 unexpected reflows" the bar, or a small CLS
  threshold? (Some intentional expand-animations exist, e.g. balance card.)
- **Fix ordering**: confirm coverage-first, fixes-after-triage (each fix flips a
  `test.fixme`) — vs. fixing FIX-A/FIX-B (chain-init, DoS) early since they clear
  5+ findings and would un-block clean SPA/settings coverage.
