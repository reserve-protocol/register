# Home + Discover View — Agent Guide

Self-contained context for changing the landing page and discover view. Mock
mechanics live in `e2e/CLAUDE.md` (cookbook); architecture in
`docs/wiki/domains/e2e.md`; the featured-downsample / packing-animation / memo
perf invariants live in `docs/wiki/domains/home.md` — read it before touching
`highlighted-dtfs/` or the featured hook, and do not re-derive them here.

## What this view is

`/` (`views/home/index.tsx`) = marketing hero + packing animation, highlighted
(featured) DTF cards, exposure marquee, protocol metrics. `/discover`
(`views/home/discover.tsx`) = tabbed index/yield DTF browser reusing the same
`components/`. Both are read-only, offline, and **connection-independent** — no
wallet, no frozen clock in their specs (real timers let React Query flush
naturally; the clock-pump protocol only applies to frozen write flows).

Yield DTF rows appear in the discover yield tab, but **Yield flows are a
declared non-goal** — assert only that the index table unmounts on tab switch,
not yield card contents.

## Did a diff here — which test?

| You changed | Run / extend |
|---|---|
| App shell / home boots at all | `e2e/tests/smoke/boot.spec.ts` (renders `/`) |
| Discover table mount/render | `e2e/tests/smoke/home.spec.ts` (renders `/discover`) |
| Hero shell, featured card set | `e2e/tests/flows/home-discover.spec.ts` |
| Discover search, tabs, row nav | `e2e/tests/flows/home-discover.spec.ts` |
| Featured hook / `highlighted-dtfs/` internals | flow + smoke; watch perf invariants (wiki) |
| Anything in `hooks/` or `atoms.ts` here | `pnpm exec playwright test e2e/tests/flows/home-discover.spec.ts` + `pnpm e2e:smoke` |

Copy/styling-only diffs need no e2e change (selectors never key on copy).

## How to mock this domain's states

All boundaries are served **centrally** in `e2e/helpers/api.ts` from shared
snapshots — no spec-local `page.route`:

- **Featured cards** come from the CAPTURED `/discover/featured` response
  (`shared/featured-dtfs.json`, `order` + `items`). Spec-local featured routes
  were deliberately removed — **never re-add one**. Per-test overlay:
  `overrides.api({ pathname: '/v1/discover/featured' }, payload)`.
- **Discover table** = `/discover/dtf` → `shared/discover-dtfs.json` (active
  index DTFs, market-cap desc; page size 20 so the top entry is on page 1).
  Overlay via `overrides.api({ pathname: '/discover/dtfs' }, rows)`.
- **Protocol metrics** = `/protocol/metrics` → `shared/protocol-metrics.json`.
- Derive assertions from the snapshot (`loadSnapshot`, `topIndexDtfs()`),
  never hardcode symbols/counts — re-captures must not break the specs.

## Edge cases

Covered:
- Boot / app-shell offline (boot smoke) and discover-table render (home smoke).
- Hero shell + featured card COUNT = `order.length + 1` (the `+1` is the
  intentional "discover all" end card) — flow spec, `unmockedCalls` empty.
- Discover search narrow-then-restore; index↔yield tab switch (index table
  unmounts on yield); row click → overview navigation (case-insensitive URL,
  `getFolioRoute` lowercases).

Planned (not yet written):
- Featured card VALUES (price / YTD `priceChange`) asserted vs snapshot.
- Marquee ordering: the weight-descending invariant
  (`mapExposureGroupsToTickers`, top-N by weight before `BACKING_LIMIT`).

Deferred (conscious skip):
- Empty / error discover states (no rows, failed fetch).
- Deprecated-DTF discover behavior — upcoming Stage-2 feature (searchable
  deprecated DTFs in discover); no spec until it ships.

## Traps

- **`hooks/use-featured-dtfs.ts:7` hardcodes the api-STAGING host**
  (`api-staging.reserve.org`, deliberate TODO — missed by hotfix #1032). The
  mock routes BOTH `api.reserve.org` and `api-staging.reserve.org` through the
  same handler for exactly this reason (`api.ts` bottom). If you "fix" the host
  in src, the staging `page.route` still catches it — but keep them in sync.
- **Perf invariants are load-bearing, not cosmetic** (see wiki): the packing
  animation is ref-driven (`computePackingFrame`, no per-frame `setState`) and
  `feature-card.tsx` / `feature-card-header.tsx` are `React.memo` with stable
  props. A test that forces re-renders (or a change that adds per-frame state)
  destabilizes the charts — don't introduce either.
- Featured order is server-driven (`order`); the skeleton `featured-dtfs.ts`
  list mirrors it so cards don't reshuffle when live data lands. Changing one
  without the other reshuffles cards on hydration.
</content>
</invoke>
