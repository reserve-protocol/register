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
- **Confirmed:** reproduced deterministically in
  `e2e/tests/general/explorer/render.spec.ts` (`test.fixme`) by overriding the
  `Transactions` op with `{}`.
- **Fix:** `(data[chain]?.entries ?? []).map(...)`. One line.
- **Effort:** trivial. **Do this first** — un-fixmes the repro and unblocks a
  committed transactions-render spec.

### A2 — `[P1]` Same unguarded pattern in the explorer governance tab
- **Where:** `src/views/explorer/components/governance/use-proposals-data.ts`
  — `for (const dtf of governanceRes.dtfs)` (~L216) and
  `for (const entry of result.proposals)` (~L298).
- **What:** identical trust of the subgraph shape. `governanceRes.dtfs` /
  `result.proposals` undefined → "undefined is not iterable" crash on the same
  route.
- **Fix:** `?? []` on both before iterating.
- **Effort:** trivial. Bundle with A1.

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

### D2 — `[P1]` Deprecated Arbitrum is still queried
- **Where:** `src/views/explorer/components/governance/use-proposals-data.ts:137`
  (`useBlockChains` includes `ChainId.Arbitrum`); likely other multichain
  fan-outs too.
- **What:** Arbitrum is deprecated for Index DTFs ("never add it"), yet the
  explorer still fires block-number / subgraph reads at it. Dead work at best; a
  **contributing cause of GH0** at worst (an unanswered/partial Arbitrum
  response feeds the unguarded `.map`).
- **Fix:** drop Arbitrum from the query fan-outs. Grep `ChainId.Arbitrum` across
  `src/` and prune the Index-DTF paths.
- **Effort:** small; overlaps with the A-sweep.

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
4. D2 (drop deprecated Arbitrum from fan-outs) — removes a GH0 contributor.
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
