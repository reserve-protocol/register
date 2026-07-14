# Register — Hardening Plan

_Findings from a deep pass through the app while building the e2e suite (Index
DTF overview/issuance/auctions/governance/settings, Yield DTF staking/issuance,
and the general surfaces: explorer, earn, bridge, portfolio, discover). This is
a focused hardening pass, **not** a rewrite — the architecture is sound; the risk
lives at the boundaries._

> **How to use this doc.** Each finding has a location, a concrete failure
> scenario, a fix, effort, and whether it's an engineer-review / on-chain-math
> surface. Line numbers were accurate at the time of writing — **verify against
> the code before you touch it** (grep every writer of a gated state variable
> before calling a fix done; reviewer/notes output is a lead, not truth).

> **⚠️ "Confirmed via `test.fixme`" ≠ confirmed.** Several findings here were
> tagged CONFIRMED because a `test.fixme` repro was written — but `fixme` blocks
> are **skipped**, so they never actually ran. When executed for real, A1 and A2
> did **not** reproduce through the mock harness (see each). Before trusting any
> "confirmed" tag, run the repro un-skipped and watch it go RED. This is exactly
> why the fixme-validity gate (HARN-021) is only **partial** — a static lint can
> confirm a fixme *observes* the app (A1/A2 both did: `getByTestId`, `toBeVisible`)
> yet the test still passes without the fix. The missing piece is the runtime
> unfix-and-require-failure gate. Treat every un-verified repro as a lead.

---

## The through-line

The bones are good: the **RPC(live-state) / subgraph(history) / API(pricing)**
separation is clean and consistently applied, the dumb-code style keeps views
readable, and a genuinely large surface (v4/v5 gates, hybrid vs tracking DTFs,
optimistic vs standard governance, three chains, two parallel DTF worlds) is
handled without heroics.

The risk isn't structural. It clusters in four places:

1. **Trusting backend shapes** — unguarded `.map`/array access on subgraph and
   API responses. This is a *bug class*, not a bug: a whole family of crashes
   lurks wherever a response can come back partial, empty, or errored.
2. **Money numbers that fall back instead of erroring** — fee/share math that
   renders a *confidently wrong* value (a fabricated fallback, an `Infinity`,
   a `$1` placeholder) with no indeterminate/error state. Worse than a crash.
3. **"Temporary" hardcodes that settled into shared state atoms** — address
   allowlists, deprecated-chain queries. Velocity debt parked where it quietly
   gates behavior.
4. **A couple of real security/trust items on governance surfaces** — live
   iframe from attacker-controlled on-chain content; validation bypassed on
   non-prod builds.

Severity legend: **P0** ship-blocker / live crash or wrong money · **P1** real
risk, fix this cycle · **P2** correctness/UX debt · **P3** latent, guard before
it bites.

---

## A. Backend-shape fragility (the crash class)

The highest-leverage category. Every one of these is "the backend returned a
shape we didn't guard, so the page (or a whole route) throws."

### A1 — `[P0]` Explorer transactions tab crashes the entire landing page (GH0)
- **Where:** `src/views/explorer/components/transactions/useTransactionData.ts:111-113`.
- **What:** guards `if (data[chain])` but then reads
  `data[chain].entries.map(...)` **unguarded**. A per-chain response without an
  `entries` field — subgraph error, partial response, schema drift, **or the
  still-queried deprecated Arbitrum chain returning nothing** — throws
  `Cannot read properties of undefined (reading 'map')`. The page-level error
  boundary then replaces the **entire** explorer with "An unexpected error
  occurred." Timing-dependent, so it hides in dev and surfaces under load/prod.
- **Fix (applied):** `(data[chain].entries ?? []).map(...)`. One line — shipped.
- **⚠️ Repro status (corrected this pass):** the earlier "reproduced
  deterministically" note was based on a `test.fixme` block — which **skips**, so
  it was never actually executed. Run for real, it does **not** reproduce through
  the mock harness: a whole-op `Transactions → {}` override makes the multichain
  query resolve to `data = {}` (or reject as a whole — the deprecated Arbitrum
  chain in `supportedChainList` has no index client), so `data[chain]` is falsy /
  `data` is undefined and the `.map` line is never reached. The bug needs one
  chain **truthy-but-`entries`-less** while others succeed — a per-chain shape the
  op-level override can't express. The guard is kept as correct defensive code,
  but there is **no e2e regression** (it would be a false green). A faithful test
  needs a per-chain override primitive (harness gap) or a unit test of an
  extracted transform. **This is still a real latent crash** (a genuine partial
  response on a live chain hits the render-path `useMemo` throw → error boundary
  → blank route); the guard is worth keeping regardless.
- **Effort:** trivial (done).

### A2 — `[P2 · FIXED]` Same unguarded pattern in the explorer governance tab (softer than A1)
- **Where:** `src/views/explorer/components/governance/use-proposals-data.ts`
  — `for (const dtf of governanceRes.dtfs)` (~L216) and
  `for (const entry of result.proposals)` (~L298).
- **What:** identical trust of the subgraph shape (`governanceRes.dtfs` /
  `result.proposals` undefined → "undefined is not iterable"). **Corrected
  severity (verified this pass):** unlike A1 (a `useMemo`, throws during render →
  error boundary → blank page), these loops run **inside the react-query
  `queryFn`** (async). A throw there is caught by react-query as query-error
  state — it does **not** reach the error boundary or blank the route. The real
  effect is a *degradation*: the whole index-proposals `Promise.all` rejects, so
  the governance tab loses its index proposals (error/empty state) instead of
  degrading per-chain. Bad UX on a partial response, not a crash.
- **Fix (applied):** `?? []` on both before iterating — the query now succeeds
  and skips only the unmapped proposals instead of rejecting wholesale.
- **Test:** intentionally NOT an e2e regression — a page-level assertion passes
  with or without the guard (the page never blanks). The correct tier is a unit
  test of the transform, which isn't extracted; left as coverage debt.
- **Effort:** trivial (done).

### A3 — `[P1]` Systematic sweep: unguarded array access on every subgraph/API consumer
- **What:** A1/A2 are the two I caught by accident. The pattern almost certainly
  repeats. Anywhere the code does `response.someArray.map/forEach/reduce/[i]`
  without a null guard, a partial backend response is a crash.
- **How to find them:** grep for `.map(`, `.forEach(`, `.reduce(`, `for (… of`
  in `src/views/**` and `src/state/**` where the operand is a `useQuery` /
  `useReadContract` / `gqlClient.request` result; audit each for a `?? []`.
  Prioritize multichain fan-outs (they multiply the failure surface by 3).
- **Fix pattern:** default-to-empty at the point of destructure, not deep in the
  render. Consider a small `safeArray(x)` helper if the count is high.
- **Effort:** 1 focused sweep. Highest crash-surface reduction per hour in the
  whole doc.

### A4 — `[P2]` Error boundaries are too coarse
- **What:** the crashes above take out a *whole route* because the nearest error
  boundary is page-level. A partial-data failure in one tab/card shouldn't blank
  the page.
- **Fix:** add card/section-level error boundaries around independently-loaded
  data islands (the same islands the e2e lifecycle model already identifies:
  hero, chart, basket, proposal list, etc.). A failed island degrades to a
  localized error, not a blank screen.
- **Effort:** medium; do it after A1–A3 so boundaries wrap already-guarded code.

---

## B. Money-display correctness & trust

Not crashes — **confidently wrong numbers**, which erodes trust harder than an
error screen. All of these are fee/share math on the settings + governance
fee-preview surfaces. **Engineer-review / on-chain-math surface.**

### B1 — `[P0]` Fabricated fee fallback shown as real (M10)
- **Where:** `src/views/index-dtf/index-dtf-container.tsx:~355` +
  `src/views/index-dtf/settings/components/index-settings-fees.tsx:~62,74`.
- **What:** on **any** `getFeeDetails` / DAO fee-registry read failure, a
  hardcoded fallback (≈50% / 33%) is displayed as the **real** platform fee —
  no error, no staleness flag. It then scales every recipient's share, so the
  whole fee breakdown is fiction on a transient RPC hiccup.
- **Fix:** surface an indeterminate/error state; never render a numeric fee you
  didn't actually read. If the registry read fails, show "unavailable," not a
  number.
- **Effort:** small-medium. Highest *trust* risk in the doc — pair with A1 as
  the two-fix sprint opener.

### B2 — `[P1]` `platformFee = 100` → `Infinity` zeroes every recipient (M9)
- **Where:** `index-settings-fees.tsx:~62` +
  `dtf-settings-preview.tsx:~280` (two copies: settings + governance
  fee-recipients preview).
- **What:** `PERCENT_ADJUST = 100 / (100 - platformFee)`; at `platformFee === 100`
  this is `Infinity`, and every recipient share renders `0%` / `NaN%`.
- **Fix:** guard `platformFee >= 100` (and generally clamp the divisor). Fix both
  copies — they drift otherwise.
- **Effort:** small. Two sites.

### B3 — `[P2]` Fee bounds can't be validated (validation bypass on non-prod)
- **Where:** `shouldBypassFormValidation` (localhost/dev builds).
- **What:** zod form bounds (fee min/max, thresholds) are **bypassed** on
  localhost/dev. Consequence: the bounds are untestable in the e2e harness *and*
  a broken bound could ship without anyone noticing in dev.
- **Fix:** move the bounds into schema **unit tests** (they run regardless of the
  bypass), and reconsider whether the bypass should be so broad.
- **Effort:** small (unit tests); the bypass-scope question is a judgment call.

---

## C. Security / trust on governance surfaces

### C1 — `[P1]` Live iframe from attacker-controlled on-chain proposal description
- **Where:** `ProposalMdDescription.tsx` — **two copies** (Index governance and
  Yield governance).
- **What:** the markdown renderer neutralizes `<script>` (inert) and
  `onerror` / `javascript:` — **but a raw `<iframe>` RENDERS and loads its
  `src`.** A proposal description is attacker-controlled on-chain content, so
  anyone can put a live external frame on a governance page (phishing surface,
  drive-by, tracking, clickjacking).
- **Confirmed:** `e2e/tests/flows/governance-description-render.spec.ts`
  (`test.fixme`) — `<script>` inert, `<iframe>` loads.
- **Fix:** strip/sandbox `<iframe>` (and audit the allowlist for other embed
  tags: `<object>`, `<embed>`, `<form>`). Prefer an allowlist of tags over a
  denylist of attributes.
- **Effort:** small; **do not defer** — it's a public governance surface.

### C2 — `[P2]` Description renderer is denylist-based
- **What:** C1 is a symptom. Neutralizing specific attributes (`onerror`,
  `javascript:`) is a losing game against untrusted input.
- **Fix:** switch the sanitizer to an **allowlist** (tags + attributes), applied
  identically in both governance renderers. One shared sanitized-markdown
  component.
- **Effort:** medium. Prevents the next C1.

---

## D. Hardcoded state & deprecation debt

Velocity debt parked in shared state atoms — the worst place for it, because it
quietly gates behavior across the app.

### D1 — `[P2]` `isHybridDTFAtom` hardcoded to two addresses
- **Where:** `src/state/dtf/atoms.ts:256-262` — hardcoded to LCAP + Venionaire,
  with a literal `// TODO: remove this after testing`.
- **What:** "hybrid vs tracking DTF" (which forces a Manage-Weights step before
  auction launch, among other things) is decided by an address allowlist, not by
  reading `weightControl` from the DTF. Every new hybrid DTF must be added by
  hand; forget one and its rebalance UX silently diverges.
- **Fix:** derive from the DTF's on-chain/subgraph `weightControl` (the data is
  already in the DTF payload). Delete the allowlist.
- **Effort:** small; needs a quick check that `weightControl` maps 1:1 to the
  intended "hybrid" semantics.

### D2 — `[P2]` Deprecated Arbitrum is still queried on **Index** paths (scope carefully)
- **Where:** `src/views/explorer/components/governance/use-proposals-data.ts:137`
  (`useBlockChains` reads an Arbitrum block number); grep `ChainId.Arbitrum`
  across `src/` for other fan-outs.
- **What:** Arbitrum is deprecated **for Index DTFs only** ("never add it"). The
  Index proposal fan-out in this same file already excludes it
  (`INDEX_DTF_CHAINS = [Mainnet, Base, BSC]`), so the Arbitrum block-number read
  is dead work *for the Index path*.
- **⚠️ Index-vs-Yield scoping (CODEX re-review):** Arbitrum is **still supported
  for Yield DTFs / RTokens** — they render redeem-only (no new minting) so users
  can withdraw. Do **NOT** blanket-prune `ChainId.Arbitrum`. Before removing any
  fan-out, confirm the surface's domain: **Index** → prune; **Yield/RToken** →
  keep (see [[Z32]] for a site that was mis-flagged as prunable). If the explorer
  lists RToken governance too, its Arbitrum read stays.
- **Fix:** prune Arbitrum only from confirmed Index-DTF query paths.
- **Effort:** small, but requires per-site domain check — not a mechanical grep-and-delete.

### D3 — `[P2]` `chainIdAtom` init-order race
- **What:** `chainIdAtom` is context-general (default mainnet), overridden
  per-DTF in the DTF container — but the override can land **after** SDK
  consumers mount, so early reads see mainnet. Produces transient wrong-chain
  queries (the e2e mock explicitly absorbs these as "pre-chain-switch
  transients").
- **Fix:** ensure the per-DTF chain override is set before SDK consumers read it
  (hoist the set, or gate consumers on a "chain ready" flag).
- **Effort:** medium; subtle — grep every reader of `chainIdAtom`.

---

## E. Semantic / UX correctness

### E1 — `[P2]` Every basket-settings proposal appends a phantom `setProposalThreshold`
- **Where:** `propose-basket-settings/updater.tsx`.
- **What:** the threshold change-detector seeds the field from the
  already-percentage `proposalThreshold` (via `proposalThresholdToPercentage`)
  but compares it against `Number(proposalThreshold) / 1e18` — the two are never
  equal, so **every** basket-settings proposal appends a phantom
  `setProposalThreshold` calldata and the empty-change guard never trips. Users
  submit a governance action they didn't intend.
- **Confirmed:** two `test.fixme`s in
  `governance-propose-basket-settings.spec.ts`.
- **Fix:** compare like-for-like (both in percentage, or both raw). Then the
  empty-change guard works and the phantom calldata disappears.
- **Effort:** small; **money/governance path — engineer review.**

### E2 — `[P2]` "Optimistic-capable DTF" ≠ "optimistic proposals"
- **What:** a DTF's governance can be optimistic (`isOptimistic=true` on the
  governor) while its actual proposals were submitted **standard**
  (`isOptimistic=false` per proposal). The "Fast" badge is per-proposal, so a
  DTF can be "optimistic" yet show no fast proposals. Confirmed on PHOTON (BSC):
  optimistic gov, all 8 historical proposals standard.
- **Risk:** UX that implies "this DTF is fast" when its proposals aren't, or vice
  versa. Not a bug today, but a landmine for any summary/badge that keys on the
  governor's flag instead of the proposal's.
- **Fix:** be explicit everywhere about *which* level a badge/label describes;
  never infer proposal speed from governor capability.
- **Effort:** small audit.

### E3 — `[P2]` Layout shift lives in the loading phases
- **What:** the e2e suite's 3-dimension model (state × L0–L3 lifecycle × mobile)
  exists because the reflows live in **partial-load** (L2), where one island
  resolving shifts another. This is a real UX quality axis, not just a test
  concern.
- **Fix:** where missing, reserve each data island's box during L1 (skeletons
  that occupy the loaded content's dimensions). The `*-skeleton` testids added
  this session mark the islands that already do; the rest are candidates.
- **Effort:** ongoing; pairs naturally with A4 (island error boundaries).

---

## F. Price / value landmines (latent)

### F1 — `[P3]` `$1` price fallbacks
- **Where:** `/dtf/price` flat `{price:1}`; `latestRoundData` unknown-feed → `$1`;
  `knownPriceResponse` uncaptured-token → `$1`.
- **What:** no *active* false-green today (the e2e specs assert snapshot-derived
  values), but several identity/fail-loud paths lean on a `$1` default. A new
  code path that trusts one of these renders a wrong dollar value silently.
- **Fix:** make unknown-token/unknown-feed price reads **fail or render
  "unavailable,"** never `$1`. Treat "price of a thing we can't price" as an
  error state, like B1.
- **Effort:** medium; touches the pricing API + Chainlink read defaults.

### F2 — `[P2]` `asset-prices` can throw
- **What:** noted in the ledger — an asset-prices path that throws rather than
  degrading. Any throw in a shared pricing hook is an A-class crash risk on
  every consumer.
- **Fix:** degrade to "unavailable," don't throw.
- **Effort:** small once located.

### F3 — `[P2]` Yield mint pause is invisible to a naive consumer (M11 neighbor)
- **Where:** yield `issuance/.../redeem/index.tsx:~36` (+ zap
  `issuance/index.tsx:~46`).
- **What:** redeem is gated only on `!isValid || !isCollaterized`, **never on
  `frozen`.** `RToken.redeem` is `notFrozen`, so on a frozen RToken the button
  shows enabled and the tx reverts. (hyUSD is mint-paused on-chain today, which
  is why the yield issuance spec asserts redeem-only — the pause states are
  real and reachable.)
- **Fix:** add `frozen` to the redeem gate.
- **Effort:** small; **money path — engineer review.**

---

## G. Frontend robustness (cross-cutting)

- **G1 `[P2]` Trust-boundary discipline.** A1–A3, B1, C1, F1 are all one root
  cause: **untrusted input (subgraph, API, on-chain content) consumed without a
  guard.** Adopt a rule: every response crossing a network/chain boundary is
  validated or defaulted at the seam (zod parse, `?? []`, or an explicit error
  state) before the render layer sees it. The e2e fail-loud contract already
  enforces the *test-time* version of this; make it a *runtime* norm too.
- **G2 `[P3]` BigInt/`Amount` money discipline** looks well-held (no obvious
  `Number` for on-chain amounts in what I read) — call it out as a *keep*, and
  add a lint/grep guard so it stays that way.
- **G3 `[P2]` Multichain fan-out cost.** Every general surface fans queries
  across eth/base/bsc (+ stray Arbitrum). Each added chain multiplies both the
  latency and the crash surface (A3). Centralize the "supported Index DTF
  chains" list (one const) and make deprecation a one-line change, not a
  grep-and-pray.

---

## What NOT to touch (the good parts — keep them)

- The **RPC / subgraph / API layer split** (live state vs history vs pricing).
  It's correct and consistent; most confusion comes from *violating* it, not
  from the split itself.
- The **fail-loud e2e contract.** It's why the crashes above are findable.
- The **dumb-code readability.** Views are graspable cold a month later — that's
  the point, don't abstract it away.
- **Snapshot-derived assertions** in tests (no hardcoded numbers) — re-captures
  don't rot the suite.

---

## Suggested sequencing

**Sprint 1 — stop the bleeding (mostly one-liners, huge risk reduction):**
1. A1 + A2 (explorer `?? []`) — kills the live crash class on the explorer.
2. B1 (fabricated fee fallback → error state) — biggest trust risk.
3. C1 (strip/sandbox iframe) — public governance security.
4. D2 (prune deprecated Arbitrum from **confirmed Index** fan-outs only — keep
   Yield/RToken Arbitrum queries, which stay for redeem-only display).
5. B2 (`platformFee >= 100` guard, both copies).

**Sprint 2 — sweep & harden:**
6. A3 (systematic unguarded-array sweep) + G1 (trust-boundary rule).
7. A4 (island-level error boundaries).
8. C2 (allowlist sanitizer) + F1 (kill `$1` fallbacks).
9. D1 (`isHybridDTFAtom` from `weightControl`) + E1 (phantom threshold) +
   F3 (frozen redeem gate) — the engineer-review money/governance batch.

**Backlog:** D3 (chainId race), E2/E3 (semantic/layout), B3/F2/G2/G3.

Each fix should land with a regression test. The e2e suite already has `fixme`
repros for GH0, C1, and E1 — un-fixme them as the fixes go in; that converts this
doc's confirmations into a green gate.

---

## The e2e suite: state, limits, and its own hardening

**State (all green, fresh):** 25 domain specs / 17 routes × 6 dimensions
(render · lifecycle L0–L3 · state-space · mobile · write · edge); a **7-flow
write matrix** (settings `distributeFees`; issuance `mint`/`redeem`/rejected-mint;
auctions `openAuction`/`openAuctionUnrestricted`; yield `unstake`/`stake`);
47 mock-contract unit tests; strict fail-loud teardown; offline via Vite +
Chromium with RPC/subgraph/API/zapper/wallet all mocked.

**What it's genuinely good at:** proving **UI behavior + calldata wiring** across
a large state space, and catching boundary regressions (it caught GH0 and my own
wildcard-leak this session). The fail-loud contract + snapshot-derived assertions
+ unit-tested mocks put it above the median for a startup suite.

**Its real limits — don't oversell green:**
- **Offline = wiring, not math.** `openAuction` fires with the right nonce to the
  right folio, but whether `getRebalanceOpenAuction`'s weights/prices are
  *numerically correct* is untested. Same for fee math. Those need fork tests or
  engineer review — e2e green ≠ on-chain math verified.
- **Wallet-less capture.** The record/replay snapshots were captured without a
  connected wallet, so every wallet-write spec hand-seeds the connected-wallet
  reads (I hit 15+ building yield unstake). This won't scale to broad write
  coverage without a **connected-wallet capture mode**.
- **The connected-wallet-yield layer is a strictness compromise.** Wallet
  `balanceOf`/`allowance` now default to a silent zero in the yield path (honest
  empty wallet, and a *non-wallet* balanceOf still fails loud — unit-guarded),
  but a real wallet-balance-reading bug wouldn't surface there.
- **Coverage is broad but uneven in depth** — lots of render/lifecycle smokes,
  fewer deep "does this number mean the right thing" assertions.

**Suite hardening backlog (from `docs/wiki/progress.md` § coverage debt):**
- Connected-wallet capture mode → retire the per-spec read seeding.
- Yield withdraw write (blocked on modeling the `rTokenStateAtom`
  collateralization/trading multicall — the button renders, the tx gates off).
- Index chain-identity assertions (api.ts/subgraph.ts assert request chainId vs
  snapshot chain; negative wrong-chain tests).
- Explicit price fixtures that reject unknown tokens (kills the F1 `$1` lean at
  test time).
- Fork/anvil tests for the on-chain math surfaces e2e can't verify
  (`getRebalanceOpenAuction`, fee math).

---

## Appendix — file-location index (verify before editing)

| Finding | Primary location |
|---|---|
| A1 explorer crash (GH0) | `src/views/explorer/components/transactions/useTransactionData.ts:111-113` |
| A2 governance-tab crash | `src/views/explorer/components/governance/use-proposals-data.ts` (`governanceRes.dtfs`, `result.proposals`) |
| B1 fabricated fee fallback | `src/views/index-dtf/index-dtf-container.tsx:~355`, `settings/components/index-settings-fees.tsx:~62,74` |
| B2 platformFee=100 | `index-settings-fees.tsx:~62`, `dtf-settings-preview.tsx:~280` |
| B3 validation bypass | `shouldBypassFormValidation` |
| C1/C2 iframe / sanitizer | `ProposalMdDescription.tsx` (Index + Yield governance) |
| D1 isHybridDTFAtom | `src/state/dtf/atoms.ts:256-262` |
| D2 Arbitrum still queried | `use-proposals-data.ts:137` + grep `ChainId.Arbitrum` |
| D3 chainId race | `chainIdAtom` readers |
| E1 phantom threshold | `propose-basket-settings/updater.tsx` |
| F3 frozen redeem gate | yield `issuance/.../redeem/index.tsx:~36`, zap `issuance/index.tsx:~46` |

_Cross-references: `E2E_BUG_LEDGER.md` (M9/M10/M11/GH0 with repro notes),
`docs/wiki/progress.md` (§ E2E coverage debt), and the `test.fixme` repros in
`e2e/tests/**` (GH0, iframe-XSS, phantom-threshold)._

---

## Appendix Z — Continuous review findings (agent-added)

_A second hardening sweep (2026-07). Same severity legend (**P0** crash/wrong
money · **P1** real risk · **P2** debt · **P3** latent). Every item was verified
against the current code; line numbers were accurate at write time — re-verify
before touching. None duplicate A1–G3 above._

### Z1 — [P1] Portfolio page white-screens on a partial portfolio API response
- **Where:** `src/views/portfolio-page/utils.ts:12-34` (`hasReserveActivity` —
  `data.indexDTFs.some(...)`, `data.yieldDTFs.some(...)`, `data.stakedRSR.some(...)`,
  called in render at `portfolio-page/index.tsx:167`) **and**
  `src/views/portfolio-page/atoms.ts:49-53` (`portfolioBreakdownAtom` —
  `data.indexDTFs.reduce(...)` × 5 fields).
- **What:** both guard only `if (!data)` then dereference five array *fields*
  of the `v1/portfolio/{address}` API response directly. A 200 response missing
  any field (schema drift, partial aggregate) throws "Cannot read properties of
  undefined (reading 'some'/'reduce')" on the **render path** → page-level error
  boundary blanks the whole Portfolio page. The tell that this is real: the
  sibling position atoms right above (`atoms.ts:26-43`) all defensively use
  `?? []` — these two consumers forgot it.
- **Fix:** default each field at the seam (`data.indexDTFs ?? []`, …) or validate
  the response shape once before it reaches render/atoms.
- **Effort:** trivial. Same class as A1/A2, render-path severity.

### Z2 — [P1] Unlisted-tokens multichain fan-out: unguarded `data[chain].rtokens.map` (GH0 twin)
- **Where:** `src/views/tokens/useUnlistedTokens.ts:74-76` —
  `if (data[chain]) { tokens.push(...data[chain].rtokens.map(...)) }`.
- **What:** structurally identical to the GH0 explorer crash (A1): guards that
  the per-chain bucket is truthy, then reads `.rtokens.map` **unguarded**. A
  subgraph error / partial response for one chain in the `supportedChainList`
  fan-out throws in the `useEffect` and crashes the unlisted-tokens table.
- **Fix:** `(data[chain]?.rtokens ?? []).map(...)`.
- **Effort:** trivial. Bundle with the A-sweep (A3).

### Z3 — [P1] Index DTF list: `data.filter` on the discover response with no array-shape guard
- **Where:** `src/hooks/useIndexDTFList.ts:76` — `normalizeIndexDtfList(data)`
  does `return data.filter((item) => item.type === 'index').map(...)`.
- **What:** `data` is cast straight from `response.json()` of
  `api.reserve.org/v1/discover/dtfs`. If the endpoint ever returns a non-array
  (error object, or a `{ dtfs: [...] }` shape drift), `.filter` throws. This hook
  feeds the **home landing page and the entire discover browser**, so the blast
  radius is the app's most-trafficked route.
- **Fix:** `Array.isArray(data) ? data : []` before `.filter`, or zod-parse the
  discover payload.
- **Effort:** trivial.

### Z4 — [P2] Timeseries transforms trust the API/subgraph shape in their queryFns
- **Where:** `src/views/portfolio-page/hooks/use-historical-portfolio.ts:37`
  (`data.timeseries.map`), `src/views/index-dtf/overview/hooks/use-week-ago-pnl.ts:115`
  (`[...data.timeseries].reverse()`), and
  `src/hooks/useIndexDTFTransactions.ts:56` (`data.transferEvents.map`).
- **What:** all three check `response.ok` (or nothing) then dereference an array
  field with no `?? []`. Unlike Z1/Z2 these run inside React-Query `queryFn`s, so
  a partial 200 degrades to a **hard query-error state** rather than a white
  screen — but the chart/table then shows an error where an empty state was
  intended, and any consumer that doesn't render the error branch shows nothing.
- **Fix:** `(data.timeseries ?? []).map(...)` etc.; treat missing arrays as empty.
- **Effort:** trivial; bundle with A3.

### Z5 — [P2] Listed-DTF governance fan-out rejects the whole query on one bad chain
- **Where:** `src/views/internal/dtf-listed/hooks/use-listed-dtf-governance.ts:89`
  — `return response.dtfs.map(...)` inside `Promise.all(SUPPORTED_CHAINS.map(...))`.
- **What:** `response.dtfs` is unguarded and, unlike the sibling
  `use-internal-dtf-list.ts` (whose identical `response.dtfs.map` is wrapped in
  per-chain `try/catch`), this fan-out has **no try/catch** — so one chain's
  malformed/partial subgraph response rejects the entire `Promise.all` and the
  whole internal governance list errors instead of degrading to the chains that
  answered. Internal tool, so lower user impact.
- **Fix:** `response.dtfs ?? []`, and/or wrap each chain request in try/catch like
  its sibling does.
- **Effort:** trivial.

### Z6 — [P1] Fabricated `$1` input-token price rendered as a real "You provide $X"
- **Where:** `src/views/index-dtf/issuance/async-mint/steps/quote-summary.tsx:228`
  — `const inputTokenPrice = inputPrices?.[0]?.price ?? 1`, then
  `provideValueUsd = parsedPay * inputTokenPrice` (L229-231), rendered as
  `$${formatCurrency(provideValueUsd)}` (L845/855).
- **What:** when the async-zap-sdk `fetchTokenPrices` returns nothing for the
  mint input token (any non-stablecoin, e.g. WETH), it's silently assumed worth
  exactly $1 and a **confidently wrong** dollar figure is shown with no "price
  unavailable" indicator. Distinct from the F1 `$1` fallbacks (different price
  feed). **Money surface — engineer review.**
- **Fix:** render "unavailable" / suppress the USD figure when the input price is
  missing; never default a token price to `1`.
- **Effort:** small.

### Z7 — [P1] Rebalance basket preview renders literal "Infinity" as a token weight
- **Where:** `src/hooks/use-rebalance-basket-preview.ts:242` —
  `const weight = ((price * amount) / dtfPrice) * 100`, then
  `acc[...] = weight.toFixed(2)` (L243).
- **What:** `dtfPrice` is taken straight from the `historical/dtf` API timeseries
  (`response.timeseries[middlePoint].price`, L235) with **no `> 0` guard**. A `0`
  price (young/newly-launched DTF snapshot, or a gap point) makes every token's
  `weight` `Infinity`, and `.toFixed(2)` renders the literal string `"Infinity"`
  as each basket weight. **On-chain/rebalance surface — engineer review.**
- **Fix:** guard `dtfPrice > 0` and surface an indeterminate state when it isn't.
- **Effort:** small.

### Z8 — [P1] Staking-vault APY divides by unguarded on-chain assets / reward period → ∞ / NaN
- **Where:** `src/views/yield-dtf/auctions/auctions-sidebar/StakingVaultRevenue.tsx:111,114,119`
  — `(rewards / assets) …`, `(stBalance - assets) / (assets * 52)`, and
  `(rewards * (currentTime - rewardsStart)) / (rewardsEnd - rewardsStart)`.
- **What:** `assets = +formatUnits(totalAssets, …)` (L106) is an on-chain read and
  `rewardsStart`/`rewardsEnd` are on-chain `rewardPeriodStart`/`End`. A vault with
  `0` assets makes `rewards / assets` (or `/(assets*52)`) `Infinity`; an
  unconfigured period (`rewardsStart === rewardsEnd`) makes the L119 denominator
  `0`. The result flows into `formatPercentage(currentAPY)` (L160, Intl renders
  `∞%`) and into `nextPeriodAPY`/`neededToHitAvg` (L182/194) as NaN/∞.
  **Money surface — engineer review.**
- **Fix:** guard each denominator (`assets > 0`, `rewardsEnd > rewardsStart`);
  render "—" when indeterminate.
- **Effort:** small.

### Z9 — [P2] Manage-weights folio uses a fabricated `supply || 1n` divisor
- **Where:** `src/views/index-dtf/auctions/views/rebalance/components/manage-weights/manage-weights-view.tsx:101,104`
  — `const totalSupply = rebalanceParams.supply || 1n` then
  `const folio = (assets * 10n ** 18n) / totalSupply` (already flagged in-code
  with `// TODO @audit`).
- **What:** the `|| 1n` guards against a divide-by-zero but **substitutes wrong
  math**: if `supply` is genuinely `0n`, `folio = assets * 1e18`, a wildly
  inflated per-share unit shown as `currentUnits` / proposed value (L107-113) with
  no error indicator — a confidently wrong number on the auction-weights surface.
  **On-chain/rebalance surface — engineer review.**
- **Fix:** treat `supply === 0n` as indeterminate (render nothing / error), not as
  `1n`.
- **Effort:** small.

### Z10 — [P2] Zap "Max" button computes a token amount with a fabricated `price || 1`
- **Where:** `src/views/yield-dtf/issuance/components/zapV2/context/ZapContext.tsx:287`
  — `maxTokenIn = maxAmount / (tokenIn.price || 1) || maxTokenIn`.
- **What:** `maxAmount` is a **USD** value (`tokenOut.price * issuanceAvailable`).
  When `tokenIn.price` is missing/0 the divisor falls back to `1`, so the Max
  button fills the input with a dollar figure treated as a **token quantity** — a
  confidently wrong max for any non-$1 input token. **Money surface — engineer review.**
- **Fix:** disable Max / show "unavailable" when `tokenIn.price` is missing rather
  than dividing by `1`.
- **Effort:** small.

### Z11 — [P2] `DecimalDisplay` silently renders `NaN` as a real-looking `0`
- **Where:** `src/components/decimal-display/index.tsx:53-65` — for `absNum < 1`,
  `NaN.toFixed(27)` → `"NaN"` → `split('.')` yields no decimal part →
  `formattedNumber` stays `"0"`, so the component returns `"0"`.
- **What:** this shared money-display component **masks** every upstream NaN as a
  confident `0` instead of surfacing an error — which is precisely how the
  division/price bugs above (Z7, Z8, Z10, and the fee/price findings in B/F)
  would present to a user: a plausible `$0` rather than a visible failure. (Note:
  `Infinity` instead renders `∞` via the `absNum >= 1` branch — only `NaN` gets
  silently zeroed.) Worse than a crash because it's invisible.
- **Fix:** detect non-finite input at the top of `useNumberFormat` and render an
  explicit "—"/"unavailable", never `0`.
- **Effort:** small; high leverage — it's the last line of defense for the whole
  money-display class.

### Z12 — [P3] Factsheet monthly P&L divides by the previous month's price with no `> 0` guard
- **Where:** `src/views/index-dtf/factsheet/utils/calculations.ts:269-271` —
  `((current.lastPrice - months[index - 1][1].lastPrice) / months[index - 1][1].lastPrice) * 100`.
- **What:** the surrounding code carefully guards `prevClose > 0` /
  `ytdBase > 0` everywhere else in the file, but this one `calculateMonthlyChartData`
  site does not. A `0` price point in a month's series makes `monthlyPL`
  `Infinity`, which then plots as a broken factsheet chart point.
- **Fix:** guard the denominator `> 0` (mirror the other sites) and return `null`.
- **Effort:** trivial.

### Z13 — [P2] Hardcoded brand-manager allowlist grants privileged UI across every DTF
- **Where:** `src/state/dtf/atoms.ts:206-225` — `WHITELISTED_ADDRESSES` (4
  hardcoded addresses, literal `// TODO: Retrieve from server, hardcoded for now`)
  is spread into `isBrandManagerAtom`'s manager set alongside the DTF's real
  on-chain `brandManagers`.
- **What:** a velocity hardcode parked in a shared state atom (same disease as D1),
  but this one gates a **privileged role**: those 4 wallets are treated as brand
  manager for **every** DTF regardless of on-chain role, unlocking brand-manager
  UI/proposal surfaces app-wide. An authorization allowlist should not live as a
  literal in front-end state.
- **Fix:** derive brand-manager status only from the DTF's on-chain
  `brandManagers`; move any genuine platform-admin allowlist server-side.
- **Effort:** small; confirm nothing depends on the hardcoded wallets first.

### Z14 — [P3] Shared `Link` sets `target="_blank"` without `rel="noopener noreferrer"`
- **Where:** `src/components/ui/link.tsx:9-11` — the shared `<a target="_blank">`
  wrapper omits `rel`. (Its sibling `src/components/ui/go-to.tsx:50-51` does set
  `rel="noopener noreferrer"` — inconsistent.)
- **What:** every external link built on this shared component (including ones
  fed URLs from DTF-brand / subgraph data) exposes `window.opener` (reverse
  tabnabbing) and leaks the referrer. Modern browsers default to `noopener` for
  `target=_blank`, so the active risk is low — but it's a one-line shared-default
  fix that only strengthens, and the doc already tracks this class.
- **Fix:** add `rel="noopener noreferrer"` as the default in `ui/link.tsx`
  (callers can still override).
- **Effort:** trivial. (Shared-component default, but strictly additive/safe.)

### Z15 — [P3] Operator-provided URLs rendered as `href` with no protocol validation
- **Where:** `src/views/index-dtf/overview/components/dtf-downloadable-resources.tsx:151`
  (`href={file.url}` where `file` comes from `brandData?.dtf?.files`, L57);
  same pattern at `index-campaign-overview.tsx:66` (`campaignData.rewardToken?.url`)
  and `overview/components/landing-mint/index.tsx:68` (`link.url`).
- **What:** these hrefs originate from DTF-operator-editable brand/campaign
  metadata served via the API. Nothing validates the URL protocol, so a
  `javascript:` (or `data:`) URL would execute in the app origin on click —
  a stored-XSS vector if brand submissions aren't server-side sanitized. Latent
  (depends on whether the API curates brand data), but cheap to close at the seam.
- **Fix:** validate `http(s):` (or an allowlist) before rendering any
  operator-provided URL as an anchor; drop/disable otherwise.
- **Effort:** small; a shared `isSafeHttpUrl()` helper covers all three sites.

---

_Third sweep (2026-07). Two fresh areas: (1) transaction/write correctness in
`src/` — approval sequencing, double-submit, failure recovery, stale/wrong
calldata; (2) on-chain math abstracted into hooks/atoms that should carry
independent unit tests. Same severity legend. All verified against current
code; re-verify line numbers before touching._

### Z16 — [P1] "Approve All" batch path skips the zero-first USDT revoke → reverts on any USDT-fork basket token
- **Where:** `src/hooks/use-batch-approval.ts:75-81` (`approveToken` fires a bare
  `approve(spender, item.amount)`), fed by
  `src/views/index-dtf/issuance/manual/components/approve-all-button.tsx:30-40`
  (items = every token in `tokensNeedingApprovalAtom`, i.e. allowance < required).
- **What:** the manual-issuance *individual* approve button handles USDT
  correctly — `asset-list.tsx:52` calls `useIsUSDT`, and L122-147 forces a
  `approve(0)` **Revoke** step before re-approving when a non-zero allowance
  already exists (USDT's `approve` reverts on a non-zero→non-zero change). The
  **batch** "Approve All" path bypasses all of that: it approves `amount * 2`
  directly with no `useIsUSDT` check and no zero-first. So a basket containing a
  USDT-fork on which the wallet already holds a partial (non-zero, insufficient)
  allowance lands in `tokensNeedingApproval`, the batch approve reverts on-chain,
  and the user is pushed into the per-token `error` fallback with no explanation.
  The same zero-first omission exists in two more shared approval sites —
  `src/components/transaction-modal/index.tsx:39` (`approve(spender, amount*120/100)`)
  and `src/views/index-dtf/overview/components/zap-mint/submit-zap.tsx:108`
  (`approve(approvalAddress, amountIn*120n/100n)`) — neither special-cases USDT.
- **Fix:** in `useBatchApproval`, detect USDT-forks (reuse `useIsUSDT`) and emit a
  `approve(0)` → `approve(n)` pair, mirroring the individual path; or reuse the
  individual per-token flow for the USDT subset instead of the bare batch approve.
- **Effort:** small-medium. **Money/issuance path — engineer review.**

### Z17 — [P2] `timelockIdAtom` hardcodes a single-element `[0n]` values array → wrong operation id for any multi-action proposal
- **Where:** `src/views/yield-dtf/governance/views/proposal-detail/atom.ts:300-317`
  (`timelockIdAtom`) — the `hashOperationBatch` preimage passes `[0n]` as the
  `values` array (L309), regardless of how many `targets`/`calldatas` the proposal
  has. Contrast the sibling `proposalTxArgsAtom:293`, which correctly builds
  `new Array(proposal.targets.length).fill(0n)`.
- **What:** the timelock operation id is `keccak256` over
  `(targets[], values[], calldatas[], predecessor, salt)`. For any proposal with
  more than one action, `targets`/`calldatas` have length N but `values` is length
  1, so the computed id does **not** match the on-chain operation. That id is fed
  straight into `Timelock.cancel(timelockId)` at `ProposalCancel.tsx:32`; the
  `useContractWrite` simulation fails (unknown operation), `isReady` never turns
  true, and the guardian's Cancel button silently stays disabled for every
  batched proposal — a governance safety control that quietly doesn't work when
  it's needed most. (Single-action proposals happen to work, which hides it.)
- **Fix:** build `values` as `new Array(proposal.targets.length).fill(0n)` (share
  one helper with `proposalTxArgsAtom` so they can't drift).
- **Effort:** trivial. **Governance path — engineer review.**

### Z18 — [P1] Proposal-outcome derivation uses JS `Number` vote weights and disagrees with its sibling on ties
- **Where:** `src/views/yield-dtf/governance/views/proposal-detail/atom.ts` —
  `getProposalState:181-192` computes `forVotes = +proposal.forWeightedVotes`
  (etc.) and decides `againstVotes > forVotes → DEFEATED, else SUCCEEDED`
  (tie ⇒ SUCCEEDED). The sibling `getProposalStatus:105-116` does the same
  decision in **bigint** via `parseEther(...)` and uses `forVotes <= againstVotes
  → DEFEATED` (tie ⇒ DEFEATED). Both are consumed together — the explorer
  governance list imports `getProposalStatus` (`use-proposals-data.ts`), the
  proposal detail/badges use `getProposalState`/`ProposalList.tsx`.
- **What:** two problems in the `Number` version. (a) **Precision:** vote weights
  are 18-decimal wei strings; `+"1000000000000000000000000"` exceeds `2^53`, so
  large/close votes lose precision and a near-tie can flip DEFEATED↔SUCCEEDED.
  (b) **Tie semantics:** OZ/Bravo governors require `forVotes > againstVotes`
  **strictly** to succeed, so a tie is DEFEATED — which `getProposalStatus`
  (bigint, `<=`) gets right and `getProposalState` (`>`) gets wrong. The same
  proposal can therefore render DEFEATED in the list and SUCCEEDED on the detail
  page (or vice-versa) at a tie / very-large-weight boundary.
- **Fix:** do the comparison in `bigint` (`parseEther` / `BigInt`) in
  `getProposalState`, and make the tie-break `forVotes <= againstVotes → DEFEATED`
  to match the contract and `getProposalStatus`. Collapse the two into one shared
  outcome function so they can't diverge.
- **Effort:** small. **Governance path — engineer review.**
- **Unit-test candidate:** both `getProposalStatus` and `getProposalState` are
  near-pure (only `getCurrentTime()`/`blockNumber` as inputs — inject them) and
  testable as-is. Vector: `for = against` (must be DEFEATED in both);
  `for = quorum-1, abstain = 1` at quorum (QUORUM check); and a
  `for/against` pair both `> 2^53` wei where the winner differs by 1 wei
  (guards the Number-precision regression). Assert both functions agree.

### Z19 — [P3] Legacy `openAuction` price/limit math divides by unguarded prices and supply
- **Where:** `src/lib/index-rebalance/open-auction.ts:91` (`prices[x].div(prices[y])`),
  L108-109 (`price.div(ONE.minus(avgPriceError))`), and L135-142
  (`…mul(sharesValue).div(prices[x]).div(supply)`). Still live via the legacy v2
  auction UI (`src/views/index-dtf/auctions/legacy/hooks/useAuctionLimits.ts:161`).
- **What:** none of the divisors are guarded `> 0`. A zero buy-token price
  (`prices[y]`), a zero sell price (`prices[x]`), or a zero `supply` makes the
  `decimal.js-light` division throw / produce a non-finite Decimal that `bn()`
  then coerces to a garbage bigint. The 50x/100x headroom check (L112-123) and the
  caller's `try/catch` (`useAuctionLimits.ts:116/200`) contain the blast radius to
  "limits fail to compute" rather than a crash — hence P3 — but the math itself is
  undefended, and a *near*-zero (not exactly zero) price sails past the throw and
  produces a wildly skewed `sellLimit/buyLimit/startPrice` that the launcher could
  submit. **On-chain rebalance math — engineer review.**
- **Fix:** guard `prices[x] > 0`, `prices[y] > 0`, `supply > 0` at the top and
  return an explicit indeterminate result the caller renders as "unavailable".
- **Effort:** small.
- **Unit-test candidate:** pure function (deterministic, no I/O) — unit-testable
  as-is. Vector: a known 2-token auction with hand-computed
  `[sellLimit, buyLimit, startPrice, endPrice]` (assert the D27 scaling and the
  `initialPrices.start/end` clamping at L125-130), plus a `prices[y] = 0` case
  asserting it fails loud rather than returning a coerced bigint.

### Z20 — [P3 · PARTIALLY ADDRESSED] Factsheet performance math is pure and correctness-critical
> **Update:** `calculatePerformance` + `calculateMonthlyChartData` now have unit
> coverage (`factsheet/utils/tests/calculations.test.ts`), including the Z12
> zero-divisor gap as an `it.fails`. `generateNetPerformanceData` (YTD/prior-Dec
> base) is still untested — that vector remains open.
- **Where:** `src/views/index-dtf/factsheet/utils/calculations.ts` —
  `calculatePerformance:8-14`, `generateNetPerformanceData:74-204`,
  `calculateMonthlyChartData:225-287`.
- **What:** not a new bug (Z12 already flags the one unguarded divisor at L269);
  the point here is that these are the pure functions behind every factsheet
  number and they are entirely untested. `calculatePerformance` guards
  `pastPrice == null || === 0`; `generateNetPerformanceData` guards `prevClose > 0`
  and `ytdBase > 0` at L157/L191 — but `calculateMonthlyChartData:269` does **not**
  (Z12). A unit layer would both lock the guarded sites and catch the Z12 gap as a
  RED test, independent of any e2e/fork run.
- **Fix:** none beyond Z12; this is the test-coverage half of that finding.
- **Effort:** trivial (tests only).
- **Unit-test candidate:** all three are pure, unit-testable as-is (feed a
  `{timestamp, price}[]`). Vectors: `calculatePerformance(110, 100) === 10` and
  `calculatePerformance(x, 0) === null`; a two-month series → known `monthlyPL`,
  plus a series with a `0`-price month asserting the P&L point is `null` not
  `Infinity` (the Z12 regression); a cross-year `generateNetPerformanceData`
  series asserting YTD bases off the prior December close, not the year's first
  point.

---

_Fourth sweep (2026-07). Three fresh areas: (1) jotai atom correctness across
SPA navigation — DTF/chain-specific atoms that survive the container's
`resetStateAtom` and leak the prior DTF's value; (2) the Index DTF deploy wizard
— validation gaps + summary→factory-call mapping; (3) portfolio money/vote math.
Same severity legend. All verified against current code; re-verify line numbers
before touching. None duplicate A1–Z20 (the known `indexDTFVersionAtom` /
`chainIdAtom` leaks are excluded)._

### Z21 — [P2] Two DTF-specific atoms survive `resetStateAtom` → new DTF shows the previous DTF's transactions, 24h volume, and market cap
- **Where:** `resetStateAtom` in `src/views/index-dtf/index-dtf-container.tsx:405-423`
  clears 17 atoms but omits **`indexDTFTransactionsAtom`** (`src/state/dtf/atoms.ts:142`,
  written at `src/hooks/useIndexDTFTransactions.ts:70` via `setTransactions(result)`)
  and **`indexDTFMarketCapAtom`** (`src/state/dtf/atoms.ts:135`, written at
  `src/views/index-dtf/overview/components/charts/price-chart.tsx:115`).
- **What:** on DTF→DTF SPA navigation the `Updater` `useLayoutEffect`
  (`index-dtf-container.tsx:471`) calls `resetState()`, which nulls basket/price/fee
  state but leaves these two holding the **prior** DTF's data. The transactions
  refetch is gated `enabled: Boolean(dtf && chain && price)`
  (`useIndexDTFTransactions.ts:74`) where `price` derives from the just-cleared
  `indexDTFBasketPricesAtom`, so the query stays disabled until the new DTF's
  basket prices load — during that window the overview metrics
  (`index-metrics-overview.tsx:132/146`, `fees-stats.tsx:69`) and the derived
  `indexDTF24hVolumeAtom` (`src/state/dtf/atoms.ts:146`) render the **old** DTF's
  transaction count / 24h volume, and `fees-stats.tsx:56` +
  `index-metrics-overview.tsx:73` render the old DTF's market cap, until the new
  chart/query overwrites them. Confidently-wrong stat cards on the fresh page.
- **Fix:** add `set(indexDTFTransactionsAtom, [])` and
  `set(indexDTFMarketCapAtom, undefined)` to `resetStateAtom` (same list the other
  16 atoms already use).
- **Effort:** trivial. Same class as the known `indexDTFVersionAtom` leak.

### Z22 — [P2] Portfolio active-proposal outcome uses JS `Number` on 18-decimal wei vote weights (Z18 twin, new site)
- **Where:** `src/views/portfolio-page/atoms.ts:72-76` — `getPortfolioProposalVotingState`
  computes `forVotes = Number(p.forWeightedVotes)` (+ against/abstain/quorum), then
  decides the outcome at L113 (`againstVotes > forVotes || forVotes === 0 →
  DEFEATED`) and the bar percentages at L126-128.
- **What:** the same defect Z18 flags in the yield proposal-detail atom, at an
  independent site that feeds the Portfolio "Active proposals" section. (a)
  **Precision:** `p.forWeightedVotes` is an 18-decimal wei string;
  `Number("1000000000000000000000000")` exceeds `2^53`, so large/close votes lose
  precision and quorum/percentage bars (L81-87, L126-128) can be computed wrong.
  (b) **Tie semantics:** L113 treats `for === against` (both > 0) as **not**
  defeated → falls through to `SUCCEEDED`, but OZ/Bravo governors require
  `for > against` strictly, so a tie is DEFEATED. A tied or very-large-weight
  proposal can render the wrong state/badge in the portfolio.
- **Fix:** compare in `bigint` (`BigInt`/`parseEther`) and make the tie-break
  `forVotes <= againstVotes → DEFEATED`; ideally share the corrected Z18 outcome
  helper. **Governance path — engineer review.**
- **Effort:** small.

### Z23 — [P2] Deploy: a basket token with a missing/zero price silently deploys with a `0` deposit amount
- **Where:** `src/views/index-dtf/deploy/steps/confirm-deploy/manual/atoms.ts:57-61`
  — `basketRequiredAmountsAtom` sets `acc[address] = price > 0 ? (...) : 0`, and
  that map is consumed **directly as the on-chain deposit amount** at
  `src/views/index-dtf/deploy/steps/confirm-deploy/simple/atoms.ts:75-80`
  (`amounts: basket.map((token) => parseUnits(tokenAmounts[token.address].toFixed(...)))`)
  and gates approvals at `manual/atoms.ts:107-111`.
- **What:** if a basket token's price is missing/`0` (transient pricing-API miss,
  unpriced token), its required amount silently becomes `0` instead of erroring.
  Nothing in `buildDeployFormSchema` blocks a `0`-priced token, so the deploy
  proceeds and the DTF launches with that asset seeded at **zero balance** — a
  broken basket, shown with no "price unavailable" flag on the confirm summary.
  (Secondary: if a basket token is ever absent from `tokenAmounts`,
  `tokenAmounts[token.address].toFixed(...)` at `simple/atoms.ts:76` throws inside
  the payload atom and blanks the confirm step.) **Money/deploy path — engineer review.**
- **Fix:** treat a missing/`0` basket price as indeterminate — block deploy and
  surface "price unavailable" rather than substituting `0`; guard the `.toFixed`
  against an undefined amount.
- **Effort:** small.

### Z24 — [P3] Deploy: factory call injects hidden defaults the confirm summary never shows, and `auctionLength` accepts `0`
- **Where:** `src/views/index-dtf/deploy/steps/confirm-deploy/simple/atoms.ts:98-107`
  hardcodes `basketManagers = []`, `folioFlags.trustedFillerEnabled = true`, and
  `rebalanceControl.priceControl = PriceControl.PARTIAL` into the factory payload;
  `auctionLength` is validated `z.coerce.number().min(0).max(45)`
  (`src/views/index-dtf/deploy/form-fields.ts:231-234`) and mapped at
  `simple/atoms.ts:84` (`Math.floor((formData.auctionLength || 0) * 60)`).
- **What:** two smaller issues on the deploy boundary. (1) `trustedFillerEnabled`,
  `priceControl`, and an always-empty `basketManagers` are consequential folio
  parameters chosen for the user with **no representation in the deploy summary**,
  so a reviewer signing the tx can't see them — velocity defaults parked in the
  mapping layer. (2) `auctionLength.min(0)` permits a `0`-minute auction length
  (`"0"` seconds to the factory) while every sibling numeric has a real floor
  (e.g. `folioFee.min(0.15)`); a `0` auction length is very likely invalid
  on-chain and either reverts the deploy or yields an unusable auction config.
- **Fix:** surface (or make explicit) the injected folio flags on the confirm
  summary; give `auctionLength` a real minimum (mirror the on-chain floor).
- **Effort:** small. **Deploy/on-chain-config surface — engineer review.**

### Z25 — [P3] Portfolio live chart point sums `p.value` without a `|| 0` guard → a valueless position makes the endpoint `NaN`
- **Where:** `src/views/portfolio-page/hooks/use-historical-portfolio.ts:57-72` —
  `appendLivePoint`'s `sumValues = (positions) => positions.reduce((acc, p) => acc + p.value, 0)`,
  applied to `portfolio.indexDTFs/yieldDTFs/stakedRSR/voteLocks/rsrBalances`.
- **What:** the sibling `portfolioBreakdownAtom` defensively sums `(d.value || 0)`
  (`src/views/portfolio-page/atoms.ts:49-53`); this live-point path does not. A
  single position row with a missing/undefined `value` (partial API aggregate)
  turns the appended live chart point's `value` (and one of its stacked series)
  into `NaN`, which then renders as `$NaN` via
  `formatCurrency(point.totalHoldingsUSD)` at the chart's most-recent point and
  can break the line/area scale. Latent (depends on the API ever omitting a
  per-position `value`), but a one-token inconsistency with the breakdown atom.
- **Fix:** sum `(p.value || 0)` to match `portfolioBreakdownAtom`.
- **Effort:** trivial.

---

_Fifth sweep (2026-07). Three fresh areas: (1) auctions/rebalance on-chain math
— the `getRebalanceOpenAuction` → `dtf-rebalance-lib` calldata path; (2) the
zap / CoW issuance surfaces — price-impact gating + quote/account race; (3)
performance / request hygiene — refetch that never stops after settling. Same
severity legend. All verified against current code; re-verify line numbers
before touching. None duplicate A1–Z25._

### Z26 — [P1] `getRebalanceOpenAuction` feeds an unvalidated `0` token price straight into the on-chain `openAuction` calldata
- **Where:** `src/views/index-dtf/auctions/views/rebalance/utils/get-rebalance-open-auction.ts:55`
  (`currentPrices.push(prices[lowercasedAddress].currentPrice)`), `:58`
  (`snapshotPrices.push(initialPrices[lowercasedAddress])`), consumed by
  `getTargetBasket(...)` (`:69`) and `getOpenAuction(...)` (`:76`). The price
  source is `use-asset-prices-with-snapshot.ts:38` — `const price = token.price ?? 0`.
- **What:** the primary v4/v5 launch path builds the submitted `openAuction`
  weights/prices/limits from these arrays with **no `> 0` / finite guard**. A
  token the `current/prices` API returns *with a missing price* becomes
  `currentPrice: 0` (and `snapshotPrice: 0`) and flows silently into
  `getTargetBasket` (which normalizes by total value) and `getOpenAuction`,
  skewing every token's target weight — a confidently-wrong on-chain trade
  rather than a failure. (A token *entirely absent* from the price map instead
  throws at `prices[addr].currentPrice`, which the three callers'
  `try/catch` — `launch-auctions-button.tsx:121`,
  `rebalance-metrics-updater.tsx:125`, `use-ondo-limit-status.ts:69` — turn into
  a generic error/blocked launch; the `0` case has no such backstop.) This is
  exactly the "offline = wiring, not math" gap the suite-limits section calls
  out. **On-chain rebalance math — engineer review.**
- **Fix:** validate every `currentPrices[i]`/`snapshotPrices[i]` is finite and
  `> 0` before the lib call; return an explicit indeterminate result the
  launcher renders as "price unavailable — cannot launch," never a coerced
  weight.
- **Effort:** small.
- **Unit-test candidate:** the array-building + validation is PURE once the
  guard is extracted (deterministic given `tokens`/`prices`/`weights`);
  `getTargetBasket`/`getOpenAuction` are the lib's. Vector: a 2-token rebalance
  where token B's `currentPrice = 0` — assert the wrapper throws / returns
  indeterminate instead of producing a finite `newWeights`/`newLimits`; a
  control run with both prices `> 0` asserting the arrays are ordered to match
  `getRebalanceTokens`.

### Z27 — [P1] Zap high-price-impact acknowledgment never resets — one checkbox click disarms the gate for every later quote
- **Where:** `src/views/index-dtf/overview/components/zap-mint/atom.ts:47`
  (`zapPriceImpactWarningCheckboxAtom = atom(false)` — a plain module-level atom,
  **never set back to `false` anywhere**), read as the gate in
  `submit-zap.tsx:85,207` (`disabled = (highPriceImpact && !warningAccepted) || …`)
  and toggled only by user click in `zap-warning-checkbox.tsx:19,48`.
- **What:** the ≥5% price-impact confirmation the e2e suite covers is only
  correct for a *single* quote. Because the acceptance atom is never reset when
  the quote changes, once the user ticks it for one high-impact quote it stays
  ticked for the rest of the session — so a subsequent **materially worse**
  quote (impact jumps 6% → 25% on a larger amount, a different input token, or
  the buy↔sell tab — both tabs share this atom), or even a freshly reopened
  modal, renders with the gate already satisfied and submits with no
  re-consent. Meanwhile `zapHighPriceImpactAtom` *does* self-correct (the
  checkbox's `useEffect` recomputes it per quote), which makes the stale
  *acceptance* the whole bug: `highPriceImpact` is freshly `true` but
  `warningAccepted` is stale-`true`, so the gate opens. **Money/zap surface —
  engineer review.**
- **Fix:** reset the acceptance whenever the quote identity changes — clear it
  on endpoint/amount/token/tab change (e.g. `atomWithReset` + reset in the
  buy/sell `changeTab`/`setInputAmount` paths and when `truePriceImpact` drops
  below threshold), so each high-impact quote is acknowledged on its own.
- **Effort:** small.

### Z28 — [P3] Zap quote stays submittable for ~500ms after an account switch, sending calldata built for the previous signer
- **Where:** `src/hooks/useZapSwapQuery.ts:53-59` (the endpoint — which encodes
  `signer: account` — is `useDebounce(useMemo(...), 500)`), `:66`
  (`queryKey: ['zapDeploy', endpoint]`); `buy/index.tsx:72-77`
  (`showTxButton = data?.status === 'success' && data?.result && !insufficientBalance && !isLoading`
  — **no account check**); the submit sends `data.tx` verbatim
  (`submit-zap.tsx:155-165`).
- **What:** on an account switch the connected wallet (`useSendTransaction`)
  updates immediately, but `endpoint` is debounced 500ms, so for that window the
  React-Query key is unchanged and the **prior** account's quote — whose server
  built `tx.data`/recipient around the old `signer` — remains `success` and
  submittable. A fast click in that window signs, with the new wallet, a zap
  routed for the old account (output/refund to the previous address, or a
  revert). Narrow window + rare action ⇒ P3, but it's a real signer/quote
  mismatch on a money path. Same shape applies on a rapid token/chain switch.
- **Fix:** clear `data` (or gate `showTxButton`) when the connected account /
  chain / selected token no longer matches the quote's params — don't debounce
  the *invalidation*, only the *refetch*.
- **Effort:** small.

### Z29 — [P2] Rebalance detail polls the subgraph and the liquidity API every 30s forever — including on completed/historical rebalances
- **Where:** `src/views/index-dtf/auctions/views/rebalance/hooks/use-rebalance-auctions.ts:87-88`
  (`enabled: !!rebalance?.rebalance.id`, `refetchInterval: 1000 * 30`) and
  `hooks/use-rebalance-liquidity-check.ts:166-168`
  (`enabled: !!tokens.length && !!rebalanceParams && …`, `refetchInterval: 30_000`).
- **What:** neither refetch loop is gated on the rebalance being *active*. Any
  visitor parked on a **completed or historical** rebalance detail page keeps
  hitting the auctions subgraph and the `/rebalance/liquidity` API every 30s
  indefinitely (the liquidity call also re-runs the aggregator quotes). The
  sibling `use-rebalance-current-data.ts:96-103` gets this right — its 10s RPC
  poll is gated on `isAuctionOngoing` and stops when the auction ends — so these
  two are the outliers, not the norm. Dead network + backend load for a static
  page.
- **Fix:** gate `refetchInterval` on active/ongoing (return `false` once the
  rebalance is completed/expired, mirroring the governance `getRefetchInterval`
  pattern and `use-rebalance-current-data`'s `isAuctionOngoing` gate).
- **Effort:** small.

### Z30 — [P2] `use-rebalance-metrics` reads `apiResponse.auctions.length` unguarded on the render path (crash-class, new site)
- **Where:** `src/views/index-dtf/auctions/views/rebalance-list/hooks/use-rebalance-metrics.ts:126`
  — `auctionsRun: apiResponse.auctions.length`, computed in the render body
  (`metrics` at `:123`) whenever `apiResponse` is truthy.
- **What:** the response type declares `auctions: RebalanceApiAuction[]` as
  required, but the file's own comment (`:67`, "Analytics fields are optional —
  not present when no auctions") contradicts it: a rebalance nonce with no
  auctions run can come back without an `auctions` field, making
  `apiResponse.auctions.length` throw "Cannot read properties of undefined" on
  the render path and blanking the rebalance-list metrics row / active-rebalance
  item. Same A3 trust-the-shape class, on the auctions surface — and the other
  analytics fields here are already read with `?? 0`, so only this one is
  exposed.
- **Fix:** `apiResponse.auctions?.length ?? 0` (and treat the array as optional
  in the type to stop the lie).
- **Effort:** trivial. Bundle with the A3 sweep.

### Z31 — [P3] CowBot logs full order/auction payloads to the console every poll in production
- **Where:** `src/views/index-dtf/auctions/views/rebalance/components/cowbot/use-cowbot-query.ts:85`
  — `console.log('cowbot result', result)` inside the `queryFn`.
- **What:** while a CowBot auction is active this `queryFn` runs every
  `pollingInterval` (30s) and logs the entire `processFolioAuctions` result —
  submitted orders, token pairs, amounts — to the browser console for the whole
  session. Ships to prod, adds noise to a sensitive automated-order surface, and
  is exactly the "console.logs ship to production" failure mode. (Low severity;
  no data-loss, just hygiene.)
- **Fix:** drop the log or gate it behind `devModeAtom`.
- **Effort:** trivial.

### Z32 — [WITHDRAWN] `useTokenList` Arbitrum fan-out is supported Yield traffic, not deprecated Index debt
- **Where:** `src/hooks/useTokenList.tsx:126-129` — the `useMultichainQuery`
  variables include a `[ChainId.Arbitrum]: { tokenIds: LISTED_RTOKEN_ADDRESSES[ChainId.Arbitrum], fromTime }`
  block.
- **Correction (CODEX re-review):** this is **NOT** the D2/G3 deprecated-Arbitrum
  class. `useTokenList` is a **Yield-DTF (RToken)** surface — it queries
  `LISTED_RTOKEN_ADDRESSES`, and Arbitrum **remains in the Yield supported-chain
  list** (`supportedChainList` in `constants.ts`, which this same hook maps over
  at `:135`). Arbitrum is deprecated **only for Index DTFs** ("never add it"
  applies to the Index domain). Yield DTFs on Arbitrum are **redeem-only** (no new
  minting) but must still render so users can withdraw their funds — so this query
  is required. Dropping the Arbitrum entry would **remove supported Yield RToken
  data and break redemptions**, a regression.
- **Action:** none — leave as-is. The lesson is the scoping rule below.
- **Rule:** Index-vs-Yield is the deprecation boundary. Before pruning any
  `ChainId.Arbitrum` fan-out, confirm the surface's domain — Index paths prune,
  Yield/RToken paths keep it.

---

_Fifth (final) sweep (2026-07). Three fresh areas prior passes skipped:
(1) the SDK / data-source boundary in `src/hooks` + `src/state`; (2) keyboard
accessibility on interactive/transaction surfaces (custom "buttons", the wallet
control, amount inputs, TabMenu); (3) money-display correctness on the staking
overview. Same severity legend. All verified against current code; re-verify
line numbers before touching. None duplicate A1–Z32._

### Z33 — [P2] Shared `TabMenu` items are `role="button"` divs with no keyboard support (not operable, wrong ARIA role)
- **Where:** `src/components/tab-menu/index.tsx:37-46` — each `MenuItem` renders
  `<div role="button" … onClick={() => onClick(item.key)}>` with **no
  `tabIndex`, no `onKeyDown`/`onKeyUp`**, and the container (`:76-84`) is a plain
  `<div>`, not `role="tablist"`.
- **What:** `role="button"` claims button semantics to assistive tech, but the
  element is neither focusable (no `tabIndex={0}`) nor operable by keyboard
  (Enter/Space do nothing) — a screen-reader/keyboard user is told "button" and
  then can't reach or activate it. This is a **shared** control used across the
  app: explorer revenue/governance filters, yield staking container
  (`stake-container.tsx`), zap tabs (`ZapTabs.tsx`), yield auctions header, yield
  overview backing/price-chart, area charts, etc. (10+ import sites), so the
  defect multiplies. Semantically these are tab groups, so they should also carry
  `role="tab"`/`role="tablist"` + `aria-selected`, not `role="button"`.
- **Fix:** add `tabIndex={0}` and an `onKeyDown` (Enter/Space → `onClick`) to
  `MenuItem`; ideally switch to `role="tablist"`/`role="tab"` + `aria-selected`
  (or wrap the existing shadcn `ui/tabs.tsx`, which is already accessible). One
  shared-component fix covers every consumer.
- **Effort:** small. Shared-component change — additive, keeps current visuals.

### Z34 — [P2] The header wallet control is a bare `<div onClick>` — keyboard users can't open the account/connect modal
- **Where:** `src/components/account/index.tsx:117-120` — the connected-wallet
  control is `<div data-testid="header-wallet" className="… cursor-pointer …"
  onClick={openAccountModal}>` with **no `role`, no `tabIndex`, no key handler**.
- **What:** the primary wallet/account entry point in the global header is not a
  button and not keyboard-reachable — a keyboard-only or screen-reader user
  cannot open the account modal (address, chain switch, disconnect) at all. This
  is the most-used interactive control in the app chrome, on a
  transaction-adjacent surface, so the accessibility gap is high-visibility.
- **Fix:** render it as a `<button type="button">` (or add
  `role="button" tabIndex={0}` + an Enter/Space `onKeyDown`). Prefer the native
  button — it also fixes focus-ring and screen-reader naming for free.
- **Effort:** trivial.

### Z35 — [P3] Primary amount-entry field (`swap` `NumericalInput`) has no accessible label
- **Where:** `src/components/ui/swap.tsx:88-98` (`TokenInput` renders a bare
  `<NumericalInput placeholder="0" …>` with no `aria-label`/`id`+`<label>`),
  built on `src/components/ui/input.tsx:105-130` (`NumericalInput` forwards no
  default label). The same unlabeled input is the amount field on the zap/swap
  and issuance money surfaces (`TokenInputBox`, `swap.tsx:228+`).
- **What:** the field a user types a buy/sell/mint **amount** into is announced
  by a screen reader only as "edit text" with no name — `placeholder="0"` is not
  an accessible label. On a money-entry control that's a real a11y gap (and the
  sibling toggle at `swap.tsx:489` *does* set `aria-label`, so the pattern is
  known here — this input just missed it).
- **Fix:** pass an `aria-label` (e.g. `t\`Amount\`` / the token symbol) from
  `TokenInput`, or associate a visually-hidden `<label htmlFor>`; consider a
  default `aria-label` on `NumericalInput`.
- **Effort:** small.

### Z36 — [P3] Plain `<div onClick>` controls with no keyboard/role: docs-link and collateral-exposure row
- **Where:** `src/components/utils/docs-link.tsx:10-14`
  (`<div onClick={() => window.open(link, '_blank')}>` — no role/tabIndex/key
  handler, and it opens an external doc so it should be an `<a>` anyway) and
  `src/views/yield-dtf/overview/components/backing/collateral-exposure.tsx:76-79`
  (`<div onClick={() => setExpanded(!expanded)}>` — the expand/collapse row of
  the collateral breakdown, no `role`/`tabIndex`/key handler, no
  `aria-expanded`).
- **What:** two more interactive elements unreachable by keyboard — the docs
  launcher and the backing-table expander. (Distinct from `rtoken-addresses.tsx`
  and `token-addresses.tsx`, which wrap their `onClick` div in a radix
  `PopoverTrigger asChild` that injects button semantics + keyboard, so those are
  fine — this is the un-wrapped subset.) `docs-link` is also a navigation, so it
  belongs in an anchor for middle-click / open-in-new-tab too.
- **Fix:** make `DocsLink` an `<a href={link} target="_blank"
  rel="noopener noreferrer">`; give the collateral row `role="button"
  tabIndex={0}` + `onKeyDown` + `aria-expanded={expanded}` (or a `<button>`).
- **Effort:** trivial each.

### Z37 — [P2] `use-asset-prices-with-snapshot` trusts the price API shape inside its queryFn (`.reduce` on a non-array, unguarded `.timeseries`)
- **Where:** `src/hooks/use-asset-prices-with-snapshot.ts:32-44` — `currentPrices`
  is cast straight from `res.json()` to an array and immediately `.reduce(...)`
  (`:37`) with no `Array.isArray` check; and `:61-72` iterates the historical
  response reading `priceResult.timeseries[…].price` (`:63-67`) and
  `result[address.toLowerCase()].currentPrice` (`:72`) with no shape guard.
- **What:** this is the **price source that feeds `getRebalanceOpenAuction`**
  (via `use-asset-prices-with-snapshot` → Z26) plus other rebalance-preview
  paths. If `current/prices` returns a non-array (error object / status payload,
  same failure the sibling `usePrices.ts:24` explicitly checks for with
  `result?.statusCode`), `.reduce` throws inside the queryFn → the whole
  asset-price query hard-errors and every downstream launch/limit computation is
  blocked with a generic error rather than a clean empty/"unavailable" state.
  The historical branch (`:48-74`) is dead-flagged ("No longer used") but still
  compiled and equally unguarded, so any accidental re-enable inherits the crash.
  Same trust-the-shape class as A3/Z3/Z4, at the auction-price seam. **Feeds an
  on-chain rebalance path — engineer-review adjacent.**
- **Fix:** validate `Array.isArray(currentPrices)` (and reject a `statusCode`
  error body like `usePrices.ts` does) before `.reduce`; default
  `priceResult.timeseries ?? []`; delete the dead historical branch or guard it.
- **Effort:** small.

### Z38 — [P2] Staking rewards chart labels a USD revenue figure as "Total staked … RSR" (confidently-wrong money label)
- **Where:** `src/views/yield-dtf/staking/components/overview/stake-rewards-history.tsx`
  — the row `value` is the subgraph's `cumulativeRSRRevenueUSD` (`:20-21,45`),
  `currentValue` is that latest value (`:54`), and the chart title renders it as
  `Total staked: {formatCurrency(currentValue, …)} RSR` (`:70-79`).
- **What:** the yield-DTF staking overview chart takes a **USD** cumulative
  *revenue* metric and presents it under the label **"Total staked"** with an
  **"RSR"** unit suffix — wrong metric (revenue, not staked balance) and wrong
  unit (a USD value labeled RSR). A user reading the staking page sees a
  confidently-wrong "total staked" number. (Bonus fragility on the same line:
  `data.rtoken?.snapshots.map` at `:37` guards `rtoken` but not `snapshots`, so a
  `rtoken` present without a `snapshots` field throws in the `useMemo` — the
  A3/Z-class shape trust, minor here.)
- **Fix:** decide the intended metric — if it's cumulative RSR revenue, relabel
  the title (drop "Total staked" and the "RSR" suffix, keep the USD framing); if
  it's meant to be total staked RSR, query the staked-RSR series instead. Also
  default `snapshots ?? []`.
- **Effort:** small. **Money-display correctness — confirm intent with an engineer.**

---

### Appendix Z — summary

Total agent-added Appendix Z findings: **38** (Z1–Z38), of which **1 withdrawn on
re-review** (Z32 — supported Yield/Arbitrum traffic, not deprecated debt) → **37
actionable**. By severity: **P0 — 0**, **P1 — 10** (Z1, Z2, Z3, Z6, Z7, Z8, Z16,
Z18, Z26, Z27), **P2 — 16** (Z4, Z5, Z9, Z10, Z11, Z13, Z17, Z21, Z22, Z23, Z29,
Z30, Z33, Z34, Z37, Z38), **P3 — 11** (Z12, Z14, Z15, Z19, Z20, Z24, Z25, Z28,
Z31, Z35, Z36), **withdrawn — 1** (Z32). The P1 cluster is the crash-class / wrong-money boundary (unguarded
subgraph-API shapes + `Number`/`$1`/`0`-price money math); the P2/P3 tail is
velocity-hardcode debt, accessibility on interactive surfaces, and refetch/log
hygiene. These are additive to the lettered findings A1–G3 above.
