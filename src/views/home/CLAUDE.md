# Home + Discover View — Agent Guide

Self-contained context for changing the landing page and discover view. Mock
mechanics live in `e2e/CLAUDE.md` (cookbook); architecture in
`docs/wiki/domains/e2e.md`; the data sources, generated geography and perf
invariants live in `docs/wiki/domains/home.md` — read it before touching the
globe, the country list or `highlighted-dtfs/`, and do not re-derive them here.

## What this view is

`/` (`views/home/index.tsx`) = the eUSD and UGLYCASH page: globe hero, three
UGLYCASH data cards, country map, UGLYCASH card, fintech contact card, a link
to Discover, and the protocol metrics pill. `/discover`
(`views/home/discover.tsx`) = tabbed index/yield DTF browser in the same
folder. Both are read-only, offline, and **connection-independent** — no
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
| Home stage, card set, UGLYCASH data wiring | `e2e/tests/flows/home-discover.spec.ts` |
| Discover search, tabs, row nav | `e2e/tests/flows/home-discover.spec.ts` |
| `use-uglycash-metrics.ts` (shape, onchain merge) | `hooks/tests/use-uglycash-metrics.test.ts` |
| `data/countries.ts` or `data/geography.json` | `data/tests/countries.test.ts` (regenerate first, see wiki) |
| Globe arc math | `components/tests/globe-arc.test.ts` |
| `highlighted-dtfs/` internals (Discover mobile cards) | flow + smoke at the mobile project; watch perf invariants (wiki) |
| Anything else in `hooks/` or `atoms.ts` here | `pnpm exec playwright test e2e/tests/flows/home-discover.spec.ts` + `pnpm e2e:smoke` |

Copy/styling-only diffs need no e2e change (selectors never key on copy). New
copy needs Lingui plus es/ko/zh in the same change.

## How to mock this domain's states

All boundaries are served **centrally** in `e2e/helpers/api.ts` from shared
snapshots — no spec-local `page.route`:

- **UGLYCASH data** = `/metrics/uglycash/daily`, `/metrics/uglycash/monthly`
  and `/uglycash/onchain-balance` → `shared/uglycash-*.json` (daily and
  onchain series downsampled to 200 points by capture). Overlay one with
  `overrides.api({ pathname: '/uglycash/onchain-balance' }, payload)`; a 500
  on any of the three puts the data cards in the error state.
- **Discover table** = `/discover/dtfs` → `shared/discover-dtfs.json` (active
  index DTFs, market-cap desc; page size 20 so the top entry is on page 1).
  Overlay via `overrides.api({ pathname: '/discover/dtfs' }, rows)`.
- **Protocol metrics** = `/protocol/metrics` → `shared/protocol-metrics.json`.
- Derive assertions from the snapshot (`loadSnapshot`, `topIndexDtfs()`),
  never hardcode symbols/counts — re-captures must not break the specs.

## Edge cases

Covered:
- Boot / app-shell offline (boot smoke) and discover-table render (home smoke).
- Home stage + cards: the held card shows the onchain balance from the
  snapshot, four cards navigate, `unmockedCalls` empty — flow spec.
- Discover search narrow-then-restore; index↔yield tab switch (index table
  unmounts on yield); row click → overview navigation (case-insensitive URL,
  `getFolioRoute` lowercases).

Planned (not yet written):
- Home data-card error state (one UGLYCASH endpoint fails).
- Marquee ordering on Discover mobile cards: the weight-descending invariant
  (`mapExposureGroupsToTickers`, top-N by weight before `BACKING_LIMIT`).

Deferred (conscious skip):
- Empty / error discover states (no rows, failed fetch).
- Deprecated-DTF discover behavior — upcoming Stage-2 feature (searchable
  deprecated DTFs in discover); no spec until it ships.

## Traps

- **`highlighted-dtfs/` is not home code any more.** It is the Discover mobile
  card (`discover-index-dtf/index.tsx`); the home only borrows its
  `FEATURE_CARD_*` classes. It still carries chain-version and transcript
  options that Discover does not use.
- **`data/geography.json` is generated** from `data/countries.ts`
  (`scripts/home-geography/generate.py`). Editing one without regenerating
  leaves a listed country with no dot; the unit test catches it.
- **The DTF logos on the "Discover more DTFs" card are a fixed list** of
  hosted brand icons, not a fetch. A renamed or delisted DTF needs a manual
  edit.
- **Perf invariants are load-bearing, not cosmetic** (see wiki): the globe is
  one ref-driven canvas loop (no per-frame `setState`) and
  `feature-card.tsx` / `feature-card-header.tsx` are `React.memo` with stable
  props. A test that forces re-renders (or a change that adds per-frame state)
  destabilizes the charts — don't introduce either.
