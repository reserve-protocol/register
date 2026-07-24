# Hardening Effort — Deep Review (Claude)

> **Superseded — historical audit (final disposition 2026-07-23).** Written
> against the 2026-07-22 fixed point. The release blocker below (R1,
> unpublished/linked SDK) is resolved — SDK 0.5.0 published and pinned exact —
> and the post-review Codex blockers (malformed optimistic portfolio rows,
> manage-weights partial metadata, zap max) are fixed with RED-verified tests.
> Current state: `docs/wiki/progress.md` + `docs/plans/FOLLOWUPS.md`. Keep this
> file only for per-finding detail.

Final review of the full hardening × SDK-integration effort on `feature/hardening`
(diff `9065b3e27...HEAD`, 166 files, +5185/−6171; SDK counterpart `sdk/hardening`
vs `main`). Method: three specialized review agents (safety / tester / code
quality), each working the diff independently with fresh gates, synthesized here,
plus a docs/wiki context-quality pass. Written 2026-07-22. A parallel Codex
review runs independently — findings here are Claude's own.

## Executive summary

- **Safety: SAFE-WITH-NOTES.** No unintended runtime behavior change beyond the
  nine known-intended ones — every other delta is a fail-closed guard or a
  byte-equivalent refactor, verified file-by-file. One **release blocker**
  (R1): the committed manifest cannot build from a fresh clone — register
  imports SDK symbols that exist only in the *unpublished* integration branch;
  publish SDK 0.5.0 and commit the pin before merge. One new MEDIUM (R3): old
  rebalance proposals whose window predates historical data now show a silent
  permanent skeleton (the fabrication was correctly killed; the degraded state
  needs explicit copy). Two unlisted-but-defensible visible deltas (R4 earn
  filter pill, R5 optimistic-portfolio semantics) worth a PR-description line.
- **Test suite: A−.** The fail-loud architecture is real and the money-path
  assertions are wei-exact, but the newest harness-era specs undershoot the
  suite's own templates and a handful of silent absorb rules answer product
  boundaries with plausible emptiness.
- **Code quality: B.** The engineering is right (real deletions, correct
  guards, SDK consolidation); the surface texture still carries ~15 comment-rule
  violations from earlier waves and a few machine-shaped helpers.
- **Docs/wiki: good after the retirement pass**, with three stale claims and two
  oversized history files remaining.

No fix work has been done for any finding below (review-only, per instruction).
Each finding carries enough location detail to action independently.

---

## 1. Safety review — verdict: SAFE-WITH-NOTES (one release blocker)

No unintended runtime behavior change found beyond the nine known-intended ones
and the notes below: every other delta traced to a fail-closed guard or a
byte-equivalent refactor. Evidence base: full tsc clean; 94 files / 832 tests
green; scoped re-runs by domain (governance 61/61, rebalance 80/80,
money/display 131/131); each of the 166 diffed files line-by-line diffed
against its `9065b3e27` pre-image or cleared as docs/test-infra; SDK
derivations verified at source.

### R1 — BLOCKER (release engineering, not runtime): committed manifest cannot build

- Committed `package.json` pins `@reserve-protocol/react-sdk: ^0.4.0`, but
  committed source imports symbols that exist in **no published version**:
  `getYieldDtfProposalState` (`portfolio-page/atoms.ts:10`,
  `yield-dtf/.../proposal-detail/atom.ts:11`), `useIndexDtfPerformance` /
  `usePrefetchIndexDtfPriceHistory` (`use-dtf-price-history.ts:4-6`),
  `selectPriceAtMark` / `useIndexDtfAccountBalanceSnapshot`
  (`use-week-ago-pnl.ts:2-3`), plus the reshaped `IndexDtfBrand`, sync
  `useIndexDtfStatus`, `period: 'ytd'`, `interval: '5m'`.
- The tree builds only via **uncommitted** `link:` entries pointing at the SDK's
  `feature/hardening-integration` — a **9-commit superset of `sdk/hardening`**;
  two of the register hooks are integration-only, so merging `sdk/hardening`
  alone is not enough.
- Fresh `pnpm install && pnpm build` from committed HEAD → hard failure. CI
  cannot be green as committed (known/accepted during dev; formalized here).
- **Required sequence:** publish the SDK from the integration branch as
  **0.5.0** (minor — see R2; note `sdk/hardening`'s own `strict-tie-semantics`
  changeset says *patch*, which would leak breaking surface into every `^0.4.x`
  consumer; the integration branch corrects it to minor — that is what must
  ship), then commit register's pin bump + lockfile and drop the `link:`.

### R2 — SDK breaking surface vs published 0.4.1 (version-bump sanity)

Breaking: `IndexDtfBrand` reshaped (flat optionals → nested required `dtf{…}`
with `""` defaults, + `mobileCover`, narrowed `basketType`);
`getIndexDtfStatus` async scan → sync catalog lookup; `useIndexDtfStatus`
returns plain `DtfStatus` (not a query result); `indexDtfStatusQueryOptions` +
`dtfQueryKeys.index.status` removed; `getIndexDtfPlatformFee` throws on zero
denominator (was `percent: 0`); `ReserveApiIndexDtfRebalanceDetail.auctions`
optional→required; `YieldDtfProposalState` gains `"QUORUM_NOT_REACHED"`
(breaks exhaustive switches). Behavior-fixes: completed-rebalance detail
unwraps the array envelope (the read **always threw** on 0.4.x);
`getYieldDtfProposals` makes one extra `getBlock()` RPC. Additive:
performance/PnL/prefetch hooks, `getYieldDtfProposalState`, exposure typing.

### R3 — MEDIUM: old rebalance-proposal preview degrades to a silent, indefinite skeleton

`src/hooks/use-rebalance-basket-preview.ts:194-231`: an empty historical
timeseries previously fell back to *current* weights mislabeled as the
proposal-time snapshot (fabrication — correctly killed). Now it throws; after
react-query's retries, `rebalance-preview/index.tsx:89-90` renders the skeleton
forever with no error copy. Scenario: open an old rebalance proposal whose
window predates the API's historical data → permanent skeleton. Guard direction
right; the degraded state needs an explicit "snapshot unavailable" render. The
one place the branch trades fabrication for a *silent* dead state.

### R4 — LOW: unlisted product delta — earn pools chain filter set

`pools-chain-filter.tsx:12`: options were Ethereum/Base/**Binance** (the Index
set, wrong for this Yield surface — "All chains" silently hid Arbitrum pools);
now Ethereum/Base/**Arbitrum**. Correct for the domain, but a visible pill
change not on the known-intended list. No previously-working state regressed
(the Binance pill never had data behind it).

### R5 — LOW: portfolio/optimistic deltas riding the SDK adoption (defensible, beyond "pure guard")

- **Veto is now real:** the old portfolio hardcoded `vetoReached: false` — a
  vetoed optimistic proposal displayed as passing; now `against ≥ threshold →
  DEFEATED` and the row leaves the Active list.
- **Optimistic `against` % semantics** changed from share-of-total to
  progress-toward-veto-threshold (can exceed 100) — consistent with the index
  governance UI, but a value change.
- **Boundary seconds** now match OZ `state()` exactly: `== voteEnd` → ACTIVE
  (was an off-by-one EXPIRED), `== voteStart` → PENDING; zero-votes past
  deadline labels DEFEATED (OZ doesn't distinguish QUORUM_NOT_REACHED there).
- **`BigInt(value)` on API vote strings** throws on decimal-formatted values
  where `Number()` tolerated them; reserve-api ships integer wei — worth a
  one-line confirm with the API owner.

### R6 — LOW: proposal markdown now sanitized (deliberate hardening)

Two identical unsanitized `MDEditor.Markdown` wrappers replaced by the shared
sanitized renderer (`rehype-sanitize`, GitHub schema + Prism-token class
allowlist). Raw HTML/scripts in attacker-controlled on-chain descriptions are
stripped; legit markdown preserved (134-line test suite). No other consumers.

### INFO (verified, no action needed)

Auction polling stops at `availableUntil` (mitigated by the completed-card
flip); unbranded-DTF cover skeleton now collapses on settle (was permanent);
chain iteration order change affects internal-list row order pre-sort only;
`decimal-display` finite rendering byte-identical (only NaN/∞ → "—");
price-history cache key no longer churns on price ticks (no refetch storm; same
data; `selectPriceAtMark` ≡ old reverse-find); internal dtf-listed degrades
per-chain (internal tool, logged); reset-on-nav = old list − a zero-consumer
atom + transactions/mcap (fixes stale cross-DTF leakage), version-atom
deliberately un-reset as before; unified `IndexDtfUpdaters` sets the exact atom
set of the five deleted updaters with equivalent values/triggers; brand-file
invalidation retargets the SDK full-query key correctly; `VITE_E2E` truth table
unchanged term-by-term.

### Known-intended changes — confirmation table

| # | Change | Confirmed | Key evidence |
|---|---|---|---|
| 1 | Nonzero tie → DEFEATED | Yes | strict bigint `for ≤ against` in both SDK oracles; exact-wei seams; tie + 1-wei-margin-over-2^53 tests |
| 2 | Stale-PENDING → real outcome | Yes | fall-through to vote-count derivation; every register EXPIRED-fallback branch deleted; subgraph-reported EXPIRED still passes through |
| 3 | 0/missing price hard-blocks launch, visibly | Yes | same builder runs pre-click; destructive copy; no over-block (finite>0 on consumed prices only; the lib already threw on all blocked inputs) |
| 4 | Status = sync catalog | Yes | curated `dtf-catalog` lookup; unknown → active (same fail direction as the old load window, now deterministic); new deprecations require a catalog release — by design |
| 5 | Money fails closed | Yes | sentinel atoms + `isLoaded(0)`=true + `isDisplayablePlatformFee(0)`=true — legit zeros not over-blocked; $1/$0 fabrications gone |
| 6 | 1s skeleton floor removed | Yes | `setTimeout` floor deleted; mapping/dedupe/range semantics preserved |
| 7 | Intervals removed; SDK reads, same shapes | Yes | value parity traced into SDK mappers (`mapAmount(…,18)` ≡ `formatEther`); chainId from `useIndexDtfIdentity` everywhere (fixes the init-order bug) |
| 8 | isHybridDTF revert leaves zero residue | Yes | atom body byte-identical to pre-image (comment only); full-tree grep: no consumer derives hybrid from weightControl |
| 9 | Discover filter resets per domain | Yes | effect keyed on tab writes the domain set; scoped to discover; also fixes invisible Arbitrum Yield DTFs + a BSC-mislabeled-as-Base bug |

**Engineer-review handoff (repo stop-condition surfaces):** the openAuction
guard placement, the multi-action timelock operation-id (`hashOperationBatch`),
and the tie/stale-state oracles all check out against OZ semantics with
exact-preimage tests — but they sit on the engineer-review list and get Luis's
eyes before ship.

---

## 2. Test-suite review — grade A−

Fresh gate runs this review:

| Gate | Result | Duration |
|---|---|---|
| `pnpm exec vitest run e2e/helpers/tests` | 70/70 (6 files) | 1.8s |
| `pnpm e2e:smoke` | 55 passed, 2 skipped (both `test.fixme` bug pins) | 58s |
| `pnpm e2e:full` | 105 passed, 1 failed, 1 skipped, 2 not-run (serial abort) | 3.0m |
| failing spec isolated | 4/4 green (22.5s) | 59s |

The one full-gate failure is **contention, not regression**: `failures-zap.spec.ts:144`
re-arms the widget only after a fresh quote round-trip; under 5-worker load quotes
take 20–26s against a 15s inner budget. Correct behavior confirmed in the error
context (no success view, button present, still re-quoting).

### Findings (ranked)

1. **Six harness-era write specs violate the suite's own write-template oracle.**
   `e2e/templates/write.spec.template.ts` forbids `txLog.length > 0` + `last()`
   checks and demands exact-one count + every argument decoded. Violated by:
   `index-dtf/issuance/manual-write.spec.ts:27-31` (functionName only),
   `index-dtf/settings/distribute-fees.spec.ts:26`,
   `index-dtf/auctions/launch-write.spec.ts:114,180` (decodes only nonce),
   `yield-dtf/staking/stake-write.spec.ts:97-106` (accepts either of two
   functions), `unstake-write.spec.ts:67`. Partially mitigated where an older
   flows-tier sibling does full decode — but **`openAuction` args
   (weights/limits/prices) and yield stake/unstake have no deeper sibling and
   are effectively unasserted.**
2. **Silent absorb rules answering product boundaries with plausible emptiness**
   (none declared in the debt ledger):
   - `e2e/fixtures/base.ts:163-166` — llama.fi / yields.reserve.org / merkl
     fulfilled as empty success, unlogged; Earn specs then "cover" the route on
     top of this absorber.
   - `e2e/helpers/api.ts:336-338` — `/dtf/price` → unconditional `{price: 1.0}`
     for any address, no identity check, no log (inconsistent with every
     neighboring branch, which 500s loud on unknown identity).
   - `e2e/helpers/rpc.ts:926` — `eth_getLogs` → `[]` for any filter.
   - `e2e/helpers/subgraph.ts:284-286` — substring dispatches
     (`'auctions('`, `'rebalances'`, …) can silently claim a future query whose
     body merely contains the token, instead of failing loud.
   - `e2e/fixtures/base.ts:172-174` — a contentful restriction surface pinned
     permanently `{restricted:false}`.
3. **Wrapper-visible-only render specs count as coverage** against the read
   template's explicit ban ("the error boundary can leave the wrapper up while
   the child crashed"): `general/earn/render.spec.ts:10`, `earn/tabs.spec.ts`,
   `index-dtf/manage/render.spec.ts:12`, `factsheet/render.spec.ts:11`,
   `general/explorer/render.spec.ts:13,21`. Fix is one snapshot-derived value or
   empty-state testid each.
4. **Full-gate flake budget**: the zap family runs on real time by design; inner
   expects use 15s budgets while the suite's own comments admit >20s quotes under
   load. Raise the re-arm budgets to the 45s used by quote waits, or isolate the
   zap serial group.
5. **Copy-based selectors in propose flows** (against the suite's own rule):
   `flows/governance-propose-basket.spec.ts:62,69`,
   `governance-propose-basket-settings.spec.ts:128-130`,
   `index-dtf/governance/fee-bounds.spec.ts:61`. Breaks the day propose copy is
   translated. (Related "propose-form testids" debt is ledgered, so declared-ish.)
6. **Doc staleness (conservative direction)**: TEST_MAP still marks
   Earn/Portfolio/Explorer/Bridge "entirely uncovered" though thin specs exist;
   `general/portfolio/state-space.spec.ts` contains exactly one state; the
   "full ~78s" claim is really 3.0m; `index-dtf/settings/` has specs but no
   domain CLAUDE.md.
7. **Mock-identity nits**: `chainIdForUrl` substring-routes any URL containing
   "base" to 8453; `**walletconnect.com**` globs match anywhere in the URL.
   Harmless today, tighten if hosts grow.

### What is genuinely strong

- The mock is itself under adversarial test: for every convenience default in
  `rpc.ts` a negative unit test proves the wrong identity fails loud
  (wrong-chain receipts, unknown-token balances, yield/index isolation,
  chain-keyed Chainlink replay with differing values).
- Real money-math depth: `issuance-manual-boundaries.spec.ts` asserts wei-exact
  `minSharesOut`/`minAmountsOut`/MAX-ceil decoded from txLog, snapshot-derived;
  plus a deliberate `test.fixme` refusing to codify a real zero-slippage bug as
  green.
- Byte-for-byte write fidelity where it matters most: submitted zap tx equals
  the pinned quote's `to/data/value` exactly.
- Failure paths for every write family (reject + revert), with
  staged-data-stays-hidden assertions.
- Lifecycle testing is real: hold-gated L1/L2 with reflow budgets and island
  independence proven by holding one boundary while another resolves.
- Honest culture: `test.fixme` pins desired behavior for known bugs; RED-verify
  instructions embedded in regression specs; all 133 titles product-termed and
  clean of ticket IDs; zero `allowUnmocked` / `waitForTimeout` / spec-local
  `page.route` in committed specs.

### Coverage gaps

**Declared and verified honest** (the ledger is complete enough that no hidden
routed-around mock gap was found inside specs): optimistic-proposal fixture
missing; multichain lifecycle pinned to non-basket proposals; yield =
3 render smokes + stake/unstake writes only; async-mint wizard uncovered
(deliberate); Arbitrum egress assertion owed; index RPC reads not chain-keyed;
mobile + L1/L2 dimensions incomplete suite-wide.

**Undeclared (this review's additions)**: the five silent absorbs above; the
write-oracle drift in six specs (functions as an assertion gap for `openAuction`
args and yield stake/unstake); wrapper-only render specs counting as route
coverage; `EMPTY_SHAPE` for any non-index/non-yield Goldsky host.

---

## 3. Code-quality review — grade B

The engineering underneath is genuinely good — real deletions, correct
fail-loud guards, SDK consolidation — but the surface texture violates the
(freshly-written) comment rules in ~15 places and carries machine-shape tells.

### Findings (ranked)

1. **Finding-IDs still in production comments** — 13 hits across 10 files that
   pre-date the comment-diet sweep (the sweep covered only the final wave's
   additions): `src/state/dtf/reset-index-dtf-atoms.ts:27`,
   `src/components/decimal-display/index.tsx:7,21`,
   `src/views/portfolio-page/hooks/use-historical-portfolio.ts:63`,
   `.../async-mint/steps/input-token-price.ts:2`, `.../quote-summary.tsx:235`,
   `.../zapV2/context/ZapContext.tsx:291,338`, `.../context/max-token-in.ts:5`,
   `src/views/tokens/components/UnlistedTokensTable.tsx:32`,
   `e2e/helpers/subgraph.ts:526`.
2. **Multi-line comment blocks that survived**: `proposal-md-description.tsx`
   (two 5–6-line paragraphs + a 3-line comment inside JSX props — also violates
   no-inline-render-comments; the WHY is earned but belongs in the area guide,
   one line in source), `reset-index-dtf-atoms.ts:22-24,40-44`,
   `max-token-in.ts:1-5` (ends "Money surface — engineer review", review-process
   residue), `dtf-cover.tsx`, `use-dtf-status.ts:9-10`.
3. **The auction builder stack is the most machine-shaped code in the diff**:
   `buildOpenAuctionArrays` (9 positional args) → `buildRebalanceOpenAuctionArrays`
   (11) → `getRebalanceOpenAuction` (14), threaded twice through
   `launch-auctions-button.tsx` (useMemo + click handler repeat nearly the same
   arg list). `RebalanceParams` already exists — the human shape is one object
   param. The sibling naming (`build…Arrays` / `build…OpenAuctionArrays` /
   `get…OpenAuction`) is the single strongest AI tell.
4. **`as Parameters<typeof fn>[0]` casts at governance trust boundaries**
   (`portfolio-page/atoms.ts` ×2, `yield-dtf/.../proposal-detail/atom.ts`):
   disables excess/missing-property checking exactly where a wrong field
   silently changes a displayed proposal outcome. Fix shape: a typed
   `const input: Parameters<…>[0] = {…}` keeps the compiler checking; if it
   doesn't compile, the cast was hiding a real mismatch.
5. **Rule-of-three crossed (duplicate direction)**: `CHAIN_LABELS` ×3
   (`chain-filter/index.tsx:10`, `discover-filters.tsx:13` — both new —
   `highlighted-dtfs/utils.ts:11` pre-existing); `discover-filters` also rebuilt
   the shared ChainFilter's options block locally instead of reusing it.
6. **Effect-sync against the stated jotai rule**: `discover-filters.tsx:76-80`
   (`useEffect` + eslint-disable syncing atoms on `dtfType`) — the rule says
   coordinate in the action, not an effect. `chain-filter/index.tsx` kept a
   useState/useEffect prop mirror through a full rewrite of surrounding lines.
7. **Test-shaped DI seams**: `fetchListedDTFGovernanceRows(…, request)` injects
   a request callback purely for tests (`mapGovernanceResponse` alone was the
   testable concept); same pattern in `use-rebalance-basket-preview.ts` (its
   comment admits it).
8. **Gratuitous e2e `any`s**: `launch-price-guard.spec.ts:55,93`
   (`harness/overrides/page: any` where typed fixtures + `Page` exist).
   Production code is clean — every `as any` in the diff is a test-file
   pragmatic cast.
9. **Minor batch**: `chain-filter` useMemo over static options + a stuffed
   `label: undefined` field; relocated narration in `decimal-display`
   ("Convert to number if it's a string"); `index-settings-fees.tsx:150-151`
   compound condition inline in JSX that wants a named `feeIndeterminate` const.

SDK secondary: clean and idiomatic (readonly types, `SdkError` codes, matching
factory idioms). Two flags: consecutive WHY paragraphs mid-function in
`yield-dtf/governance.ts` (one floats above no statement), and the OZ tie-break
WHY duplicated verbatim in the index governance utils.

### Genuinely human/excellent (specific)

`index-dtf-container.tsx` (five updaters + two mappers collapsed, net −240
lines); `yield-dtf/.../proposal-detail/atom.ts` (twin hand-rolled state machines
deleted for one SDK derivation); `lib/index-rebalance/open-auction.ts` (shipping
console.logs deleted, hoisted index lookup); `isLoaded` + `utils/fees.ts`;
`computeFormValidationBypass`; `StakeHistoryTitle`; the e2e `priceGap` seam; the
SDK zero-denominator fail-loud.

### AI-fingerprint verdict

**Yes, moderately** — from texture, not design: the finding-ID trail woven into
comments; one essayistic comment voice repeated in identical cadence across ~40
files; 9/11/14-positional-arg builders with over-qualified names; DI params that
exist only for tests. Fixing findings 1–3 removes most of the fingerprint.

---

## 4. Docs & wiki — LLM-context quality

State after the retirement pass (six plan docs deleted, ledger/log compacted,
`FOLLOWUPS.md` created): **good**, with the following residuals. No edits made
(review-only); each is a small follow-up.

1. **Stale — `docs/wiki/domains/e2e.md` (status paragraph)**: still describes
   deprecation status as the SDK `/discover/dtfs` fetch + KNOWN_DEPRECATED
   fail-safe. Post-effort reality: sync static-catalog lookup, zero fetches; the
   fail-safe survives only inside the wider `useDTFStatus` hook (28 non-container
   consumers), not the container path.
2. **Stale — `src/views/index-dtf/overview/CLAUDE.md:63`**: same status claim.
3. **Stale — `docs/wiki/domains/overview-charts.md:88`**: points at
   `dedupeByTimestamp` in `use-dtf-price-history.ts`; dedupe now lives in the
   SDK's `useIndexDtfPerformance` — the keep-last semantics note should
   re-anchor there.
4. **Possibly-dead harness branch**: `e2e/helpers/api.ts` `/discover/dtfs`
   status expectations may be partially dead for the container path (the
   deprecated-DTF spec passes with zero status fetches). Confirm before pruning.
5. **Context weight**: post-compaction `log.md` is still 39KB and `progress.md`
   24KB — the remaining bulk is pre-hardening history (older log entries, 15
   feature-ledger rows). The same compaction treatment is available; flagged as
   an option, not applied.
6. **Fresh/correct**: `sdk.md` (three-tier rule), auctions + governance area
   guides, `FOLLOWUPS.md`, `skills/code-standards.md` comment section;
   wiki-lint 19 pages green.
7. From the tester's pass (also doc issues): TEST_MAP staleness (conservative
   direction), the "~78s" duration claim, and the missing settings-domain
   CLAUDE.md — listed in section 2 finding 6.

---

## 5. Cross-agent synthesis & recommended actions

The three reviews converge on one theme: **the architecture and the standards
are strong; the drift is at the edges.** The suite's newest specs undershoot
its own templates; the code's earliest waves undershoot its newest comment
rules; the one build-system gap (R1) was known-and-accepted during development
and simply must close at release. Nothing found contradicts the effort's core
claim: guards fail closed, migrations preserve values, and the nine deliberate
behavior changes are implemented exactly as described.

Cross-agent corroborations worth noting:

- The tester's "openAuction args unasserted in e2e" (§2.1) + the code review's
  "11-arg builder threaded twice" (§3.3) point at the same surface: the auction
  launch path would get safer *and* cleaner from one reshape + one spec upgrade.
- The safety INFO "price-history key no longer churns on price ticks" is the
  quiet perf win of the SDK migration — worth keeping in mind when the perf
  pass happens.
- The safety R3 (silent skeleton) is the only place all three agree the effort
  over-corrected: fabrication → silence instead of fabrication → explicit
  unavailable.

Recommended action order (no work started, per instruction):

1. **R1 (gate):** publish SDK **0.5.0 from the integration branch** (verify the
   minor-intent changesets are the ones shipping), commit register's pin +
   lockfile, drop the `link:` — CI green, then `feature/hardening` → master.
2. **R3:** explicit "snapshot unavailable" render for the old-rebalance preview
   (small; the guard stays, the silence goes).
3. **R4/R5:** one PR-description paragraph acknowledging the earn filter pill
   and the optimistic-portfolio semantics changes; one-line integer-wei confirm
   with the reserve-api owner (R5.4).
4. Write-oracle convergence: bring the six write specs up to the template
   (decode `openAuction` args fully; single-function assertions for yield
   stake/unstake).
5. Absorb-rule hygiene: log every silent absorb once per test; make substring
   subgraph dispatches conditional on an op-name miss; give `/dtf/price` the
   same identity discipline as its neighbors.
6. Comment-diet completion sweep over the pre-final-wave files (13 ID hits +
   the multi-line blocks in §3.1–3.2).
7. The auction builder reshape onto `RebalanceParams` + the typed-const
   replacement for the three `as Parameters<>[0]` casts.
8. Docs: the three stale wiki claims + TEST_MAP/duration corrections + a
   settings-domain CLAUDE.md; optional pre-hardening history compaction
   (log.md / progress.md).

---

## 6. Codex cross-review reconciliation (2026-07-22)

Codex ran the same three-lens review independently
(`docs/codex-hardening-review.md`). Reconciliation, each claim verified against
code before adoption:

**Independent convergence (both reviews, unprompted):** the release blocker and
its exact mechanics (unpublished SDK symbols; publish must come from the
integration branch); "guards-only" being too strong a framing (their
three-category classification ≈ our nine-intended-changes table); the
governance/sanitizer/launch-guard strengths; incomplete comment diet in
pre-final waves; the same three `useDtfSdk` escapees; materially stale
SDK/e2e/area docs.

**Codex-unique findings verified TRUE and actioned:**
- **I-02** staking history rendered "No data" while loading (introduced by the
  partial-response guard collapsing the tri-state) — **fixed**: tri-state
  restored, revert-verified render seam test added.
- (Authorized separately) **R3/our-#2** snapshot-unavailable preview — **fixed**:
  explicit copy replaces the indefinite skeleton.
- **K-04** `deriveDtfStatus` tested but unused by production (the hook
  duplicates the fallback inline) — verified by grep; queued.
- **S-11** auction metadata dereferenced upstream of the fail-closed guard
  (`use-rebalance-params.ts`, `manage-weights-view.tsx`) — credible ordering
  catch, engineer-review surface; queued for verification + fix.

**Pushed back / corrected:**
- **T-02** "the comment at portfolio atoms is wrong" — misread: the comment
  states *why* partial contexts are refused (a partial context would make the
  oracle report CANCELED); the implementation accordingly builds none. Could be
  worded clearer; not incorrect.
- **K-01** (their own qualification concurred): the yield `parseEther`
  double-scaling preserves ratio comparisons — type-contract debt, not a
  lifecycle regression.

**Adopted process criticisms:**
- **D-07**: deleting the plan docs orphaned owners/acceptance criteria for the
  pre-existing hardening backlog, and the progress row's "shipped" overstated a
  release-blocked branch — both corrected (FOLLOWUPS absorbed the backlog with
  acceptance criteria; progress reworded to "integration-complete ·
  release-blocked").
- Their broader pre-existing sweep (S-01…S-14: deploy prices/fees, USDT
  zero-first approvals, sticky impact consent, stale-signer quotes, frozen
  redeem, staking-vault APY, version identity, transport validation) is now
  itemized in FOLLOWUPS rather than implied.

**Relative coverage:** Codex is broader on the pre-existing backlog and the
documentation topology; this review is broader on fresh browser evidence (their
tester could not run Playwright — port ownership), the AI-texture/style
analysis, and the auction-builder reshape. Together they form the reconciled
finding ledger for the next checkpoint.

---

## 7. SDK release-readiness verification (2026-07-22)

Fresh verification of `dtf-sdk` for the 0.5.0 release. **Verdict: READY** — no
blockers found; every check below ran green this session.

| Check | Result |
|---|---|
| Branch parity | `feature/hardening-integration` == `origin/sdk/hardening` (`f1ee8f5`) — PR #27's head IS the full release state (the "9-commit superset" gap both reviews flagged has since closed) |
| Changesets | 10 present; `changeset status` computes **minor for both packages** → 0.4.1 → **0.5.0**. The patch-leak risk (strict-tie-semantics) is resolved — it's minor |
| Gates | sdk: tsc clean, 309 passed/17 skipped · react-sdk: tsc clean, 77 passed · both `pnpm build` green |
| Register-needed symbols | All present in built dists: performance/prefetch/snapshot/status hooks in react-sdk; `getYieldDtfProposalState`, `selectPriceAtMark`, `getIndexDtfAccountBalanceSnapshot`, `getIndexDtfStatus`, `getProposalState` in sdk, re-exported via react-sdk's `export *` (verified in dist, not source) |
| Catalog dependency | `@reserve-protocol/dtf-catalog` is **published** (0.1.3, matches workspace version); sdk dist imports it externally (not bundled); catalog content **unchanged vs main** — published resolution serves identical data. `workspace:*` deps convert to real versions at `pnpm`/changeset publish |
| Package integrity | `files`/`exports` maps point at existing dist artifacts; engines fields present; `publish.yml` (changesets) + `release: changeset publish` script in place. Note: react-sdk ships ESM-only (`index.mjs` + `.d.mts`) — fine for register (Vite/vitest ESM) |

Release-day sequence (unchanged from R1, now verified executable):
1. Merge PR #27 → run the changeset version/publish flow → 0.5.0 on the registry.
2. Register: pin `0.5.0`, drop the `link:` entries, clean `pnpm install`.
3. Full register gates against the pinned build (the true clean-install proof —
   the one check that structurally cannot run before publish), then
   `feature/hardening` → master.
