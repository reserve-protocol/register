# E2E Hardening & Execution Plan

_Response to the Codex audit (`CODEX_FEEDBACK.md`) + the standing goal. This is
the **execution plan**; `E2E_TEST_MAP.md` becomes the single machine-readable
coverage ledger (see §8). Where an item maps to a Codex backlog ID (`HARN-001`,
`IDX-AUC-008`, …) it is cited so nothing is lost._

## Execution status (live)

| Phase | State | Evidence |
|---|---|---|
| **0 — Trust** | 8/9 done | chain enforcement (HARN-001/002, incl. proposal-only path) +5 unit tests · yield identity (HARN-006/007, `pendingUnstakings` rToken-scoped) canonizing tests replaced · M10+redeem green-bugs → fixmes · fake version-reset removed · egress default-deny (HARN-004/005) · fixme-validity static lint in `e2e:check` (HARN-021 **partial** — runtime unfix-gate still open). Remaining: HARN-008 yield-price. |
| **1 — Fast authoring** | started | `e2e/templates/{read,write,lifecycle}` + guide entry. Remaining: `e2e:new` scaffold, META-004 lint. |
| **2 — Math unit tests** | started (3 files, 22 tests) | governance (Z18 + wei-precision), factsheet (Z12), portfolio (Z22 + wei-precision) — independent vectors + `it.fails` bug capture. Remaining: fee/dutch/throttle/cooldown/rebalance (Z26). |
| **CI** | done | every PR + concurrency + nightly mobile. |
| **Reviewer sweep** | converged | 5 passes → 38 findings (P0:0 P1:10 P2:16 P3:12) in `REGISTER_HARDENING.md` Appendix Z. |
| 3 (controller/wallet), 4/7 (mock refresh), 8 (wiki→single ledger), rest of 2 | pending | next-session, multi-week. |

Verified green throughout: e2e unit 52 · app unit 627+ · smoke 47 · flows 100 · `e2e:check` · app+e2e tsc 0.

## 0. The one goal, and what it implies

**The suite is the source of truth for "is this feature done / is this bug
actually fixed."** An LLM (or human) should be able to trust a green run and move
on. That only holds if **green means something**. So the priority order is
deliberately *not* test count:

1. **Trust** — kill every false-green path first. A suite that can pass with a
   wrong-chain response, a fabricated fee, or an arbitrary-token read is worse
   than no suite, because it lies confidently.
2. **Reliability + DX** — an LLM must be able to write a correct test *fast*, and
   a flake must never be mistaken for a real failure.
3. **The math/behavior it can't see** — e2e proves *wiring*; on-chain math needs
   *unit tests*.
4. **Coverage** — only then, the backlog.

Codex's closing line is exactly right and is the spine of this plan: _"The next
quality gain is not more test count; it is ensuring every new abstraction and
coverage claim is as strict and semantically exact as the best existing
transaction tests."_

---

## 1. Corroboration of the audit

I verified the two most consequential findings against the code myself, and a
corroboration agent checked the remaining 13 mechanical claims. **All 15 are
CONFIRMED.** The audit is trustworthy; adopt it as fact, with these nuances:

| # | Claim | Verdict | Nuance / my note |
|---|---|---|---|
| 1 | Index subgraph chain enforcement removed (`resolveIndexQuery` never gets `urlChain`) | **CONFIRMED** | Explicitly *documented* as a workaround for a known app bug (subgraph.ts:160-171), not hidden. Still a real P0 false-green. |
| 2 | `spa-chain-identity.spec.ts` says suite stays green regardless of wrong-chain traffic | **CONFIRMED** | It's the *only* place the contract is asserted. |
| 3 | `base.ts` aborts every `image` request host-agnostically before logging egress | **CONFIRMED** | Named inert hosts are an *additional* allowance, not the gate. |
| 4 | `**/cdn-cgi/trace**` handler host-agnostic | **CONFIRMED** | Restrict to real geolocation host. |
| 5 | Yield `balanceOf`/`allowance` returns 0 for the test wallet on ANY `to` (no known-token check) | **CONFIRMED** | **My code.** Index branch is strict; yield branch isn't. |
| 6 | `pendingUnstakings` (`0xe5cea2f6`) empty for any target/args | **CONFIRMED** | **My code.** Selector-only. |
| 7 | New yield unit tests canonize the identity hole | **CONFIRMED** | **My code.** 2 of 5 are fine (fail-loud for non-wallet owner); the arbitrary-token silent-zero ones must be replaced with known-identity-success + unknown-target-fail. |
| 8 | `spa-state-cleanup.spec.ts:96-99` fake version-reset (only checks fixture chain) | **CONFIRMED** | Would pass un-fixmed; violates the fixme rule. |
| 9 | `seedManualIssuance` hardcodes Base deployer, no zero-supply guard | **CONFIRMED** | Called for any chain; mainnet/BSC use different deployers. |
| 10 | Hold identity coarse (no chain/variables/method/query/full-calldata) | **CONFIRMED** | Selector is a 4-byte prefix. |
| 11 | Overlapping holds don't compose (`gate()` awaits first match only) | **CONFIRMED** | Staged L1→L2 composition is unproven. |
| 12 | `settings.spec.ts:225-238` codifies the fabricated 50% fee as green | **CONFIRMED** | Ties to `FALLBACK_PLATFORM_FEES[8453]=50` (M10). |
| 13 | `issuance-manual-boundaries.spec.ts:402-438` codifies redeem `minOut=0` as green | **CONFIRMED** | Real spendable amount, documents the bug as acceptance. |
| 14 | Mobile never runs in CI | **CONFIRMED** | **Fixed this session** — now on the nightly `full` job. |
| 15 | `package.json` wholesale reindent masking 3 real changes | **CONFIRMED** | `git diff -w` = 3 changes (sdk 0.2→0.4, zapper 2.5.1→2.6.0, `e2e:mobile`). Restore formatting. |

**Bottom line:** Codex found real holes, including in the code I wrote this
session. I'm not going to defend the looseness — it was a conscious
ship-yield-writes trade-off, and it's now debt to pay in Phase 0.

---

## 2. My re-review — agreements, differences, and what to add

**Where I fully agree (adopt as-is):**
- The trust P0s (§3 of the audit) and the harness identity/compose fixes.
- "Rename the CLS helper" — `expectStablePosition` samples two boxes and ignores
  size; it is not a layout-shift budget. Call it box-stability or make it a real
  `PerformanceObserver` shift budget.
- "Avoid blanket lifecycle combinatorics" — one lifecycle contract per unique
  *loading architecture*, not per route×state. This is the single biggest lever
  for keeping the suite fast and deletable.
- The minimum-oracle contract for writes (exact-one tx, chain/from/to/value,
  decoded args, terminal state, reject/revert) — bake it into the template (§4).

**Where I'd weight differently / push back mildly:**
- Codex treats the shell-only render specs as near-worthless. I'd keep a *thin*
  route-mount smoke as a boot-critical canary (it catches white-screens fast on
  PR) — but **rename it honestly** ("route mounts") and never mark the coverage
  cell "covered" from it. The value is speed-of-signal, not acceptance.
- The audit is exhaustive on *test* trust but under-weights that several findings
  are **live product bugs**, not just test gaps: GH0 (explorer `.map` crash),
  M9/M10 (fee `Infinity`/fabricated fallback), the raw-iframe XSS, the phantom
  `setProposalThreshold`. These are catalogued in `REGISTER_HARDENING.md` with
  one-line fixes. The e2e job is to **pin each with a real desired-behavior
  fixme**; the app fix is a parallel track. Don't let "fixme'd" read as "handled."

**What the audit under-specifies that you explicitly asked for (added below):**
- A concrete **on-chain-math unit-test layer** (§5) — Codex mentions an
  "independent oracle vector" (HARN-018) but not the extract-and-unit-test
  strategy for the hooks/atoms.
- **Wallet state as a first-class controller concern** (§6.4) — the audit lists
  the symptoms (static `wallet.chain`, lax yield reads, hand-seeded storm); the
  fix is a real wallet-state model + a connected-wallet capture mode.
- **"Any LLM writes any test fast"** as a DX deliverable with concrete mechanisms
  (§4), not just rules.
- **Mock-refresh ergonomics** (§7) and **wiki LLM-optimization** (§8).

---

## 3. Phase 0 — Trust restoration (make green mean something)

**Nothing else ships until this is done.** Every item here closes a confirmed
false-green. This is the first PR I'd open.

> **STATUS (executed this session — 8/9 done, all green: 52 unit · 47 smoke · 100 flows):**
> ✅ Chain enforcement (HARN-001/002) — `resolveIndexQuery` now gets `urlChain`;
> wrong-chain DTF requests are refused (transient self-heals, persistent regression
> fails). **Proposal-only ops** (voting snapshot, no dtf address) are now gated via
> the proposal's owning DTF too; +5 negative unit tests. ✅ Yield identity
> (HARN-006/007) — balanceOf/allowance/pendingUnstakings gated on a known-address
> set (yield replay ∪ common majors); `pendingUnstakings` additionally requires a
> **known rToken** (1st arg), not just the facade + account — an arbitrary rToken
> now fails loud. Canonizing unit tests replaced with known-success + unknown-fail-loud.
> ✅ Fake version-reset test removed (kept as documented gap). ✅ M10 fee + redeem
> `minOut=0` characterizations → desired-behavior fixmes (no longer green bugs).
> ✅ Image egress default-deny (HARN-004) — unlisted image hosts fail loud
> (surfaced + allowlisted `discourse-cdn`). ✅ cdn-cgi/trace scoped to the app's
> real Cloudflare hosts (HARN-005). 🟡 fixme-validity check in `e2e:check`
> (HARN-021 **PARTIAL**) — a **static** lint rejects placeholder fixmes that never
> observe the app (now comment-stripped, so a signal must be in executable code).
> It does NOT yet prove a fixme *fails* when un-skipped — the runtime
> unfix-and-require-failure gate (below) remains open.
> ✅ `package.json` already clean (reindent was reconciled). ✅ Chain gate extended
> to governance-stats (`governanceIds`/`ids`) — a base governor id served on the
> mainnet host is now refused (was a hole; +2 unit tests). ✅ Base ZAP stablecoins
> (USDbC / base USDC / DAI) registered as KNOWN at module load — a base yield wallet
> read is now silent-zero regardless of worker order (was an order-dependent
> fail-loud landmine; +1 unit test). ⬜ **REMAINING:**
> HARN-008 yield price identity (capture `{chainId,token,price}` fixtures, reject
> non-token addresses, no synthetic `$1`) — the larger item, deferred to its own pass.
>
> **e2e trust backlog (LOW, from the Dark trust review — not blocking):**
> (1) `knownYieldAddresses` is not chain-scoped — a right-address-wrong-chain
> balanceOf/allowance/pendingUnstakings of `TEST_ADDRESS` is answered silent-zero
> instead of failing loud (blast radius tiny: the value is always 0). Chain-scope
> the known-set to fully honor "wrong chain fails loud" for those 3 selectors.
> (2) `check.ts` `//`-strip can over-truncate a line where `//` appears inside a
> string/URL alongside a real signal (false FAIL) — acceptable for a static lint;
> tighten if it ever bites.

| Item | Codex ID | What | Acceptance |
|---|---|---|---|
| Restore Index subgraph chain enforcement | HARN-001/002 | Pass `subgraphChainForUrl(url)` into `resolveIndexQuery`; require URL chain == registry chain before snapshot/overlay fulfillment (unless a spec declares a negative wrong-chain case). Restore the negative helper unit test. | Base/BSC/Mainnet DTF succeeds only on its chain's Goldsky URL; wrong host → modeled error + unmocked-identity failure. Keep the SPA journey as supplemental. |
| Tighten yield wallet reads | HARN-006 | In the yield branch, gate `balanceOf`/`allowance` silent-zero on `knownTokenAddresses.has(to)` (and `knownContractAddresses` for spender) — mirror the Index branch. **Dependency:** register the yield connect-storm token set as known (from the yield snapshots) so legitimate reads stay green. Decode both allowance args. | Arbitrary-contract `balanceOf(TEST_ADDRESS)` fails loud; known-token reads stay silent-zero; stake/unstake specs still green. |
| Scope `pendingUnstakings` | HARN-007 | Restrict the empty-array response to the known `FacadeRead` address + selected fixture rToken + `TEST_ADDRESS` (decode the 3 args), else fail loud. | Wrong facade/rToken/era/account fails loud. |
| Replace the canonizing unit tests | HARN-006/007 | Swap the arbitrary-token silent-zero tests for known-identity-success + unknown-target/argument-fail. Keep the 2 that already fail-loud. | No unit test asserts an unknown identity passes silently. |
| Fix the fake version-reset test | HARN-021, IDX-OVR-013 | Either add a stable version-gated observable + real v5→v4 SPA nav, or delete the fake test and leave the item in the ledger only. | Un-fixmed, it fails for the stated reason. |
| De-characterize the fee/redeem tests | IDX-SET-002, IDX-MAN-006, YLD-ISS-004 | Convert the M10 fabricated-fee and redeem-`minOut=0` green tests into desired-behavior fixmes tied to the ledger (or narrowly-labeled characterizations *outside* the acceptance gate). | Green suite never presents unsafe behavior as product truth. |
| Image + trace egress default-deny | HARN-004/005 | Allow only named inert image hosts; unknown image hosts log + fail. Restrict `cdn-cgi/trace` to the real geolocation host. | Unlisted image host fails teardown. |
| Yield price identity | HARN-008, P1 | Capture explicit `{chainId, tokenAddress, price}` fixtures; reject non-token addresses; no synthetic `$1`. | Unknown/non-token price read fails, not `$1`. |
| Restore `package.json` formatting | — | Reindent back; keep only the 3 semantic changes. Note the SDK/zapper bumps are production-contract changes needing scoped app verification, not e2e plumbing. | `git diff package.json` shows 3 changes. |

**Meta-check to add (HARN-021):** a CI step that temporarily un-fixmes each
committed fixme and asserts it fails — so a placeholder fixme (like #8) can never
sneak in again.

---

## 4. Phase 1 — "Any LLM writes any test fast" (the DX contract)

> **STATUS (executed this session):** ✅ Spec templates shipped
> (`e2e/templates/{read,write,lifecycle}.spec.template.ts`) — each carries the
> minimum-oracle as its comments (the write template forbids `txLog.length>0`/
> `last()`-only). ✅ `e2e/CLAUDE.md` "Writing a new test" now opens with
> "START FROM A TEMPLATE." ⬜ REMAINING: the `pnpm e2e:new <domain>/<route>
> --kind=` scaffold script; the META-004 lint that statically rejects the
> forbidden patterns.

The goal: an LLM opens the repo, and there is **exactly one obvious way** to write
each kind of test, with the oracle baked in so it can't under-assert. Mechanisms:

1. **Spec templates** (`e2e/templates/`): `read.spec.template.ts`,
   `write.spec.template.ts`, `lifecycle.spec.template.ts`, each a copy-paste
   skeleton whose comments *are* the minimum-oracle checklist (from Codex §10):
   - read: exact route/fixture/chain/boundary; snapshot-derived semantic
     assertion; product-distinct empty/error/loading; zero unmodeled calls.
   - write: disconnected/unauthorized guard + empty `txLog`; decode exact
     target/chain/value/function/args/order; pending→confirmed; reject + revert;
     terminal refresh + double-submit.
   - lifecycle: hold exact chain/request/island; prove the hold hit; skeleton
     shape/count only where product-relevant; release into exact content/error;
     peer stability after settle; mobile-specific behavior.
2. **A scaffold command** (`pnpm e2e:new <domain>/<route> --kind=read|write|lifecycle`):
   stamps the template into the right domain folder, wires the fixture from the
   registry, and prints the exact next steps (capture if needed, run command).
3. **The minimum-oracle as a lint** (META-004): a static check that rejects
   `allowUnmocked: true`, spec-local `page.route`, `waitForTimeout`, raw
   `page.clock`, English-copy locators, `.only`, unannotated skips/fixmes, and
   `txLog.length > 0`/`last()`-only write assertions. If the pattern can't pass
   review, it can't pass CI.
4. **One "write a test" entry doc** (`e2e/CLAUDE.md` stays the cookbook) with a
   decision tree: _diff touched X → this template, this fixture, this command._
   Every domain guide links back to it.
5. **Fast feedback tiers documented and enforced:** unit (<1s) → one scoped spec
   (~3-5s) → smoke (~46s) → full. The scaffold prints the narrowest tier for the
   change.

Acceptance: a fresh LLM, given "test the auctions bid flow," finds the write
template, the fixture, the capture step, and the run command without reading
900-line helpers — and the template makes it *impossible* to ship a
`txLog.length > 0` assertion.

---

## 5. Phase 2 — On-chain math & abstracted-hook unit tests

**This is your explicit ask, and it's the right instinct:** e2e proves the call
*fires* with the right shape; it cannot prove the *numbers* are correct offline.
The fix is to lift the math into pure functions and unit-test them against
**independent reviewed vectors** (never the same formula the code uses — Codex
HARN-018).

> **STATUS (executed this session — 3 files, 22 tests, green):**
> ✅ `proposal-detail/tests/atom.test.ts` (10) — correct on-chain proposal-state
> derivation + the **Z18 bug** (tie→SUCCEEDED vs bigint tie→DEFEATED) via `it.fails`,
> plus a **wei-precision vector** (>2^53, 1-wei winner that `Number()` collapses to
> a tie): the bigint path respects the margin, the Number path loses it (`it.fails`).
> ✅ `factsheet/utils/tests/calculations.test.ts` (6) — `calculatePerformance` +
> `calculateMonthlyChartData` vectors + the **Z12 bug** (zero prior-month price →
> Infinity, unguarded) via `it.fails`.
> ✅ `portfolio-page/tests/atoms.test.ts` (6) — the **Z22 duplicate of Z18** (tie +
> the same wei-precision vector) via `it.fails`. All use the pattern: independent
> vectors lock correct math; a known bug is captured by `it.fails` that flips when fixed.
> ⬜ REMAINING: fee math (needs extraction from the component first — money
> surface), dutch price, cooldown/endId, throttle, rebalance `getRebalanceOpenAuction`.

Surfaces to extract (if inline) and unit-test:

| Surface | Where | Vector source |
|---|---|---|
| `getRebalanceOpenAuction` weights/prices/limits | auctions rebalance | Reviewed protocol vectors from `dtf-rebalance-lib` or a fixed golden tuple, decoded independently |
| Fee share allocation + `PERCENT_ADJUST` | `index-settings-fees` / `dtf-settings-preview` | Hand-computed conservation cases incl. `platformFee=0/typical/100`; assert no NaN/Infinity, shares sum to the contract total |
| `calculatePerformance`, monthly P&L, inception clamp | factsheet | Independent P&L vectors incl. negative/zero returns, missing months, leap boundaries |
| Dutch-auction price at time T | auctions/yield bid | Closed-form price at start/mid/end vs the hook |
| Cooldown `endId` / draft-era math | yield withdraw | Multi-draft mixed pending/available fixtures |
| Throttle (issuance/redemption) bigint math | yield issuance | Zero-remaining/exact/one-above/refill-over-time |
| Proposal state derivation (votingState) | governance | State from raw+tally+clock at boundaries (PENDING/ACTIVE/DEFEATED/QUEUED/EXPIRED) |
| Timelock operation-hash / SDK-derived IDs | governance cancel/queue | Independent vector, NOT the app's own derivation (Codex §6) |

Rule (Codex "cases not worth adding"): **never duplicate a production formula in
the fixture and compare the UI to it.** Use reviewed vectors or snapshot truth.
Each extracted function gets a `*.test.ts` next to it; the e2e spec then asserts
only that the decoded calldata *matches the unit-verified function's output* for
the fixture — wiring, not math.

This directly answers "complex surfaces partly covered by e2e and correctly
abstracted into hooks/atoms get a proper unit test."

---

## 6. Phase 3 — Controller / harness hardening (rock-solid as tests scale)

As cycles add tests, the controller is the shared blast radius. Harden it before
migrating volume onto it.

**6.1 Hold identity completeness (HARN-009).** Extend `HoldMatcher` to the same
semantic identity as strict replay:
```
subgraph: { urlChain, operationName, variablesSubset }
api:      { method, exactPathname, searchSubset }   // exact path default; substring explicit
rpc:      { chainId, method, to, fullCalldata | selector }
```
Unit-test that Multicall3 inner calls with identical selectors but different args
are distinguished.

**6.2 Overlapping holds compose (HARN-010).** `gate()` must await *all* matching
holds (or reject overlapping registration with a precise error). Unit test:
broad L1 + specific L2, both release orders, `releaseAll()` teardown.

**6.3 Diagnostics + bounded waits (HARN-011).** Add `hold.waitForHit({timeout})`
that on failure prints the expected identity, nearest observed identities, hit
count, elapsed, and pending holds — so a mis-scoped hold fails in ~1s with a
useful message instead of a 20-30s UI timeout. On teardown, report unreleased
holds.

**6.4 Wallet state — first-class (HARN-012/013/014 + your ask).** This is where
the current controller is weakest:
- `WalletControl.chain` is the static fixture option, not the provider's live
  chain after `wallet_switchEthereumChain`. Make it a **live wallet-state model**:
  current chain (from recorded provider requests), account, and a **seedable
  per-token balance/allowance ledger** so a spec declares holdings once and every
  read resolves from it (replacing the hand-seeded storm I hit building yield
  writes). Network-switch updates chain + request routing + tx ledger together;
  rejection leaves all consistent.
- **Connected-wallet capture mode** (ties to §7): capture the connected-account
  reads (balances/allowances/delegates/pending) so writes stop hand-seeding
  15+ calls. This retires the looseness Phase 0 tightens.
- Transaction-ledger exactness: `expectOneTx({to,chain,value,fn,args})` helper so
  no write test can pass with an extra/duplicate/wrong-target tx (kills the
  `last()`-only pattern at the source).

**6.5 Seeding correctness (HARN-015/016/017).** Resolve `seedManualIssuance`
deployer from `dtf.chainId` (+ Ethereum/Base/BSC helper tests); guard
`totalSupply === 0n`; add runtime schema validation to the rebalance-tuple
builder (reject number/string drift, mismatched arrays, invalid windows,
out-of-order limits) before encoding.

**6.6 Modest extraction (Codex §9).** Split `rpc.ts` (900+ lines) by seam
(dispatch / index-replay / yield-replay / receipts); split governance fixture
builders from lifecycle assertions. Do **not** build a page-object hierarchy or
one-line wrappers — the small controller classes are already at the useful limit.

---

## 7. Phase 4 — Mock data: easy, atomic, drift-checked refresh

Current: `e2e:capture`, `e2e:capture:yield`, `e2e:check`, and the `--dtf=<slug>`
targeted flag I added. Make refresh a no-fear operation:

- **Atomicity (HARN-019):** `--dtf` (and full capture) publish all required files
  + manifest atomically, preserve byte-identical unrelated snapshots, and clean
  up temp output on failure. (The `--dtf` flag already does copy-then-publish;
  add the failure-cleanup + manifest assertions.)
- **Drift check (HARN-010/META-010):** `e2e:check` gains a "no-change recapture is
  a no-op" assertion — after re-capturing without protocol changes, semantic
  identities/counts and unrelated bytes are unchanged. An *intentional* protocol
  change produces a focused reviewed diff, not whole-tree churn.
- **Registry integrity (HARN-020):** `e2e:check` fails on duplicate address/slug,
  chain-dir mismatch, missing proposal/rebalance joins, malformed governance
  identity, stale targeted manifests.
- **Connected-wallet capture mode:** a `--account` capture that records the
  connected-account read surface (see §6.4).
- **One-command refresh doc:** `e2e/CLAUDE.md` § "snapshots stale?" → the exact
  command + what to re-paste after an SDK bump (already partly there; make it the
  canonical, only place).

Acceptance: an LLM can refresh one DTF or all, sees a clean reviewed diff, and
`e2e:check` catches any capture that would silently weaken a test.

---

## 8. Wiki / docs — LLM-optimization + single source of truth

Codex §9 is right: `E2E_TEST_MAP`, `E2E_BUILDOUT_PLAN`, `E2E_BUG_LEDGER`, wiki
progress, README, and the domain guides currently disagree (stale counts, chain
bugs listed both open and closed, lifecycle rows marked complete before assertion,
a nonexistent Whitelist proposal, Bridge form-vs-static). Fix the *structure*, not
just the contents:

- **One machine-readable coverage ledger.** `E2E_TEST_MAP.md` becomes the single
  route→state→testID→status map (ideally a table/YAML a script can lint). A route
  addition *requires* either a mapped test or an explicit debt entry. Generate
  summary tables from it; stop hand-maintaining counts.
- **Retire the append-only planning docs.** `E2E_BUILDOUT_PLAN.md` and this file
  are *execution* history/plan; fold their live claims into the ledger and
  **rewrite current truth in place** — no "supersedes above" sections (the thing
  that made the docs contradict).
- **`E2E_BUG_LEDGER.md`** stays the bug source of truth, each entry linked from
  its fixme (Codex fixme rule).
- **Front-load the contracts.** The e2e domain guide + `e2e/CLAUDE.md` should open
  with the minimum-oracle checklist and the decision tree (§4), because that's
  what an LLM needs in the first 20 lines.
- **Keep the wiki-lint discipline** (row limits, index-on-ingest) — it already
  works; extend it to fail on a coverage-map/ledger drift.
- **Narrow the overclaims now** (Codex §2 tail): "permission matrix" → "two
  positive role/window paths"; "harness sufficient across ALL dimensions" →
  scoped truth; "routes covered" only where semantically asserted.

---

## 9. CI & reliability (largely done)

**Done this session:** smoke on **every PR** (was master-only), `concurrency`
cancels stale runs, **mobile runs on the nightly `full` job** (resolving the
"declared but never run" finding). Node 24, typecheck + mock-unit + snapshot-check
+ smoke gate.

**Remaining (META-001/002/003/009/011):**
- **Port-exclusion lock:** local `reuseExistingServer` on fixed port 3005 lets two
  suites clobber each other. Add a lockfile/owner check so a second suite gets an
  immediate "another suite is active" error, not an ambiguous timeout. (This bit
  the audit itself.)
- **Keep slow writes out of PR smoke:** the auction/yield write specs (~10s each)
  are engineer-review paths; move them to `full`/nightly. Smoke stays boot-critical
  and fast.
- **Retry-determinism gate:** run high-risk lifecycle/write specs with 5 workers +
  randomized order; require zero retries before "stable."
- **Explicit project scripts:** document `e2e` (all declared projects) vs an
  all-desktop vs all-including-mobile intent so `pnpm e2e` isn't ambiguous.

---

## 10. The coverage backlog

Codex's `MISSING_TEST_CASES` (sections A-M, ~150 items, P0-P3) is the **canonical
backlog** — do not re-derive it. Adopt it into `E2E_TEST_MAP.md` as debt entries.
Sequence after Phases 0-3, by risk:

1. **Index P1:** RPC-chain SPA regression (tokenJar) · automated CoW issuance ·
   auction write/role/window matrix + exact payload + reject/revert · manage/SIWE ·
   optimistic governance · deployment.
2. **Yield P1:** full stake→unstake→cooldown→withdraw/cancel lifecycle · issuance
   state-gate matrix (active/paused/frozen/undercollateralized) · zap · auctions ·
   governance · settings pause/freeze matrix.
3. **General P2:** Portfolio (holdings/empty/past-activity/history) · Explorer 5
   tabs (unfix GH0) · Earn semantic lists · Tokens/Top100 · Bridge links.
4. **Cross-cutting:** representative lifecycle-per-architecture (LIFE-001..004),
   mobile chrome (MOB-001..004), a11y (A11Y-001), reliability/meta (META-*).

Each write inherits the minimum oracle; each lifecycle covers an *architecture*
once, states semantically. Money/governance/permissions/SDK/auction-math/routing
carry an **Engineer review required** handoff.

---

## 11. Recommended first move

Open **one Phase-0 PR** titled "make green mean something": restore chain
enforcement (HARN-001/002/003) + tighten the yield identity holes I introduced
(HARN-006/007) + replace the canonizing unit tests + fix the fake version-reset
test + de-characterize the fee/redeem tests + image/trace default-deny + restore
`package.json` formatting. Add the fixme meta-check (HARN-021) so this class can't
regress. That PR converts the suite from "broad and green" to "green means the
feature works" — the prerequisite for every later phase and the whole point of the
effort.

I did not fold those code fixes into this planning turn on purpose: trust fixes
must land with a clean, isolated verification run, and shipping them unverified at
the tail of a long session would contradict the goal. Say the word and I'll run
Phase 0 as its own focused pass.
