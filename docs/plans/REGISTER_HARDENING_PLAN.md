# Register Hardening × DTF SDK Integration — Execution Plan (v2)

_Execution contract for `REGISTER_HARDENING.md` (A1–G3 + Z1–Z38), **merged with
the DTF SDK register-integration plan** (`~/projects/dtf-sdk/docs/SDK_AUDIT_2026-07-09.md`)
per Luis's decisions 2026-07-14. v1 (register-only) is in git history; the
Dark/Light review adoptions from v1 carry over where slices survive._

## Goal

Close every actionable hardening finding, using **SDK migration as the fix
vehicle** wherever the finding sits on a surface the SDK owns or will own
(audit P1 + P2 + targeted yield/portfolio reads), and direct register fixes for
app-layer surfaces (UI, a11y, zap orchestration, deploy wizard, sanitizer).
End state: agents iterate fast on register without touching the fundamental
data/math layer — that layer lives in the SDK, tested there.

Every change lands with a regression test at the honest tier: SDK changes get
SDK unit tests (mapper fixtures / golden calldata bytes, per the audit's test
conventions); register behavior gets e2e (RED-verified) and register unit tests
for hooks/atoms that stay here. No fix ships test-naked; no test ships that
passes without its fix.

## Decisions (locked 2026-07-14)

- **Migration IS the fix.** No interim guards on code a migration slice will
  delete. Accepted trade-off: crash-class bugs on SDK-bound surfaces stay live
  until their flow migrates.
- **Scope: hardening + full P1 + full P2** (container route reads; auctions/
  settings/manual issuance). P3 yield + portfolio = **targeted adoption** only
  where a finding lives and the SDK already has (or trivially gains) the read.
- **SDK owns the math** (proposal outcome/state, timelock id, rebalance/auction
  input validation, fee helpers) — but only where it *makes sense*; register
  still owns interaction behavior, form state, tx submission, display states.
  Sanity-check each addition against the SDK's "product-shaped, no generic
  layer" rule before adding it.
- **Corroborate SDK correctness first (R0).** The audit claims 260+71 green
  tests; before register delegates math, verify the SDK's own proposal-outcome
  (bigint? tie ⇒ DEFEATED?), auction-builder, fee, and APY logic — the Z18-class
  bug could exist there too. Fix SDK-side with tests if found.
- **Versioning: `link:../dtf-sdk` during dev, publish + pin at the end**
  (react-zapper 2.4.0 flow: after publish, pin the real version + `pnpm install`
  before merging register).
- **Branches: one long-lived branch per repo**, slices as coherent commits, one
  big review each at the end. Never push/merge without Luis's say-so.
- **Engineer review: one consolidated end-of-effort assessment.** Expected
  changes are guards/adoptions that don't move main-flow math; each math-adjacent
  change must be e2e-validatable. If anything genuinely significant to on-chain
  math emerges, flag ALL of it in the final handoff, not per-slice.
- **Z13 withdrawn:** the 4 hardcoded brand-manager wallets are team wallets —
  leave as implemented, not critical.
- **B3: e2e gets its own environment** — a dedicated e2e build mode where
  `shouldBypassFormValidation` is OFF, so form bounds are e2e-coverable; dev
  keeps its bypass. Schema unit tests land regardless.
- **Z38 parked** pending product/engineer intent (revenue vs staked); tracked in
  the final handoff.

## Boundary, ownership, cadence (Luis, 2026-07-14)

- **The boundary rule of thumb: if a routine design change requires an SDK PR,
  the line is in the wrong place.** The SDK changes at protocol cadence — ~2-3
  versions a year once mature (current churn is early-stage, not the steady
  state); register changes constantly. Every migration decision in M1–M4 gets
  drawn against this: protocol data / math / calldata → SDK; anything that
  moves with design or product → register. When an item fails the test, it
  stays register-side and the slice's progress row says why.
- **Ownership:** Luis architects and owns the SDK and leads the team — SDK-side
  review is Luis, not an external gate. Team: Luis (lead) + Juampi and Jorge
  (fullstack) + Josh (design) + Devin (agent) + any claude/codex contributor.
  The layering exists precisely so mixed human/agent contributors can move
  fast in register without being able to break the fundamental layer.
- **e2e health is agent-owned and explicit in the workflow.** Most register
  work is agent-driven; the suite is the contract that makes that safe. Every
  stage touching covered surfaces owes: mocks/snapshots updated (fail-loud
  misses during migration are the stage's work, not noise), no new
  `test.fixme` without a tracked owner, re-capture kept cheap enough that
  nobody routes around it. A red or routed-around e2e is a blocker. Mirrored
  as a standing rule in `docs/wiki/project.md` § Safety Rules.

## Current state

- Register pinned to `@reserve-protocol/react-sdk` 0.2.0; SDK repo past 0.3.2
  (caret won't take it — deliberate bump needed at publish time).
- Fixed already: A1, A2 (guards; honest tests owed — S0/RG1). Captured
  `it.fails`: Z12, Z18 ×2, Z22 ×2. `test.fixme` repros: C1, E1 ×2, B2/M9
  (`fee-edge.spec.ts:10`); B1/M10 fixmes in settings flow specs. A1's old
  false-green fixme in `general/explorer/render.spec.ts` gets **deleted** (S0).
- e2e harness: `MockOverrides` exists (`e2e/helpers/overrides.ts`); gaps are
  chain-scoped subgraph match + per-token price omission (S0).
- **Migration churn risk:** SDK GraphQL documents / API request shapes may
  differ from register's current ones — the fail-loud e2e boundary will catch
  every difference. Each migration slice budgets mock/snapshot updates; that
  fail-loudness is a feature, not friction.
- Re-verify every finding's line numbers/status at slice start.

## Non-goals

- No SDK framework rewrite / generic hook layer (audit's own rule).
- No full P3 yield or portfolio migration beyond finding-targeted reads.
- No blanket Arbitrum pruning (Index-only, Z32 rule).
- No fork/anvil numerical verification (SDK unit fixtures + engineer assessment
  cover math; offline e2e proves wiring).
- No manufactured tests for hygiene items.
- reserve-api never imports the client SDK (audit P4 dependency rule).

## Test-tier policy

1. **SDK changes** (dtf-sdk repo): vitest unit tests per its conventions —
   frozen mapper fixtures for response shapes, golden calldata bytes for
   builders, injected time/block for state math. The SDK gate
   (`pnpm typecheck && pnpm test && pnpm build`) runs per slice.
2. **Register unit — mandatory** for hooks/atoms/pure functions that stay in
   register (extract seams where buried).
3. **Register e2e — mandatory** for user-observable behavior changes the harness
   can express. New specs from `e2e/templates/`; every new/un-fixmed regression
   **watched RED first** (revert fix → red → restore; record "RED-verified").
   False greens forbidden; where inexpressible, say so and let unit carry it.
4. Migration slices: after adoption, the flow's existing e2e specs must pass
   against the SDK data path (mock updates allowed, assertion weakening is not),
   plus the finding's new regression test.
5. `it.fails` flip to green in the fixing commit; fixmes un-fixme'd + RED-verified.

## Test seams

- **SDK (dtf-sdk repo):** vitest per package; frozen mapper fixtures for
  response shapes, golden calldata bytes for builders, injected time/block for
  state math. Gate: `pnpm typecheck && pnpm test && pnpm build`.
- **Register unit:** vitest under `src/**/tests/`; atoms via a jotai store;
  near-pure functions with injected time/block (Z18 pattern).
- **Register e2e:** offline Playwright (`e2e/`), `MockOverrides` fixture,
  fail-loud contract, templates in `e2e/templates/`; cookbook `e2e/CLAUDE.md`.
- **New in S0:** chain-scoped subgraph override, per-token price gap, e2e env
  with form validation ON.

## Acceptance evidence

Per slice, uniform:

- Register: `scope.mjs --base <fixed-point>` green post-edit; gate at closeout.
  SDK: repo gate green. Both recorded in the progress row with RED-verified
  notes per regression spec.
- UI changes: visual check (changed surface, default + new error state).
- Migration slices additionally: the audit's exit evidence where defined (e.g.
  P1: "no second folio-manager request; one query key per source; exposure/
  status/platform fee match production values").
- One `docs/wiki/progress.md` row; wiki ingest + lint; `REGISTER_HARDENING.md`
  entries annotated FIXED (+ ledger pointers for GH0/M1/M2/M9/M10/M11/H4).

**Whole-goal closeout:** publish SDK, bump + pin register, full gates both
repos, one big review per branch, consolidated engineer-review handoff (only
significant math changes, else a "guards only" note), the terminal greps —
zero hardening `test.fixme` in `e2e/tests`, zero hardening `it.fails` in `src`
— and the **final workflow plan** (below), plus the **docs sweep** (Luis,
2026-07-14): every doc this effort produced or touched ends up in `docs/plans/`
(or next to its domain), superseded docs deleted, repo root clean per the
CLAUDE.md docs-hygiene rule.

## Dogfood: this effort evaluates the workflow and the e2e suite

This is the largest workload the kit + e2e contract have carried — treat it as
the evaluation run `skills/self-improve.md` describes ("when the workload is
explicitly evaluating this workflow, collect a compact sample instead of
anecdotes"). Two obligations:

1. **Record failures at write time, per slice.** Tag kit-caused friction
   `kit-friction` in `docs/wiki/log.md` the moment it happens (the tag-late
   lesson is already in the log). Alongside each progress row, keep the
   compact sample: profile + changed-file count · verifier wall time ·
   reviewer findings confirmed/rejected/deferred by severity · reruns/flakes ·
   user corrections · context handoffs · escaped defects. Same discipline for
   e2e friction: capture/re-capture cost, mock-update pain during M1/M2 churn,
   any spec that had to route around a harness gap — those are suite findings,
   not just chores.
2. **Final deliverable: a workflow improvement + consolidation + performance
   plan**, built from that sample at whole-goal closeout — not from memory.
   Three sections: **improvement** (what misfired: misrouted profiles, skills
   skipped or too heavy, review-budget misses), **consolidation** (prune/merge
   skills and scripts that overlapped or went unread; one rule per lesson, no
   rule without a recorded misfire), **performance** (wall-time: verifier
   tiers, review latency, e2e speed tiers, context-handoff cost). Kit-caused
   fixes land in `~/projects/agent-workflow` and propagate via
   `install.mjs --update`; e2e-suite items feed `E2E_HARDENING_PLAN.md`.
   Default stance still applies: no process work without a recorded misfire.

---

## Finding → vehicle disposition

Every actionable finding, exactly one owner. (✔ = already fixed, test owed.)

| Vehicle | Findings |
|---|---|
| **R0** SDK corroboration | (enables M2/M3/M4 — may surface SDK-side fixes) |
| **S3** register: sanitizer | C1, C2, Z15, Z14 |
| **S0** register: e2e harness | A1✔ honest spec, per-token price gap (F1 test-side), B3 e2e env mode, RED protocol |
| **M1** P1 container/route migration | B1, D3, Z21, Z3, Z4 (week-ago-pnl via price history) |
| **M2** P2 auctions/settings/issuance migration | B2, D1, Z26, Z19, Z37, F2, Z30, Z7, Z9, Z29, G3 |
| **M3** governance math via SDK | Z18, Z22, Z17, E1 (register change-detector + un-fixme) |
| **M4** targeted yield + portfolio adoption | Z8, F3, Z1, Z4 (portfolio/transactions), Z25 |
| **RG1** register: residual crash-class | A2✔ unit, Z2, Z5, Z38 (snapshots guard), A3 residue sweep, G1 rule |
| **RG2** register: money display | Z11, Z6, Z10, Z12, Z20, F1 (app-side residue after SDK price adoption) |
| **RG3** register: write-path/deploy/zap | Z16, Z23, Z24, Z27, Z28, B3 schema unit tests |
| **S7** register: a11y/hygiene | Z33, Z34, Z35, Z36, Z31, E2, G2, Z38 (label — parked) |
| **S8** register: error boundaries + layout | A4, E3 |
| **Withdrawn / parked** | Z13 (team wallets, leave as-is), Z32 (withdrawn), Z38 label (product), D2 → in M2/RG1 as Index-only prunes with G3 |

## Slices

**Order:** R0 + S3 + S0 first (independent of each other), then M1 → M2 → M3 →
M4, with RG1–RG3/S7 interleaved as register-only work whenever an M slice is
blocked, S8 last (wraps guarded/migrated code). Blockers are per-row; every
slice can start its unit-tier immediately.

### R0 — SDK corroboration + link setup; repos: both; blocked by: none

- Wire `link:../dtf-sdk` packages into register; typecheck against 0.3.x to
  size the 0.2.0→0.3.x breakage (P0 dry run, no publish).
- **Corroborate the math register will delegate** (read the SDK source + tests,
  run its suite): proposal outcome/state — bigint comparisons? tie ⇒ DEFEATED
  (OZ/Bravo semantics)? · open-auction builders — input validation? · fee reads
  · yield APY. Any Z18-class defect found gets fixed SDK-side with unit vectors
  **in this slice**.
- Verify the audit's test-count/coverage claims are current (it's 5 days old).
- Output: a short corroboration note in the dtf-sdk branch (what was checked,
  what was fixed) — this is the foundation the "migration is the fix" bet
  stands on.

### S3 — Governance-surface security; repo: register; blocked by: none

Unchanged from v1: C1+C2 one shared allowlist sanitized-markdown component
(both renderers) — unit-vector the schema, **un-fixme
`governance-description-render.spec.ts` (RED-verify; real egress was observed)**;
Z15 `isSafeHttpUrl()` at the three operator-URL sites + unit vectors + one
overview assertion; Z14 default `rel="noopener noreferrer"` in `ui/link.tsx`.

### S0 — e2e harness extensions; repo: register; blocked by: none

Unchanged from v1 (extend `MockOverrides`, not new machinery), plus B3's env:

| item | change | tests |
|---|---|---|
| chain-scoped subgraph override | optional `chain` on `SubgraphOverride` (dispatchers hold it at the callsite) | extend `helpers/tests/overrides.test.ts` + honest A1 demo spec (RED-verify by reverting the A1 guard); **delete the old false-green A1 fixme in the same change** |
| per-token price gap | `knownPriceResponse` (api.ts:150) accepts omit/zero-token override | helper unit + first consumer spec RED-verified in RG2 |
| **B3 e2e environment** | e2e build mode where `shouldBypassFormValidation` is OFF (dedicated flag the e2e Vite build sets), so form bounds are assertable | one bounds spec proving out-of-range fee is rejected in e2e (RED-verify by forcing bypass on) |
| RED protocol | document unfix-and-watch-red in `e2e/CLAUDE.md` | n/a |

### M1 — P1 container/route-read migration; repos: both; blocked by: R0

Full audit P1 (delete `BrandFilesUpdater`; `platformFee` into the route model,
delete `PlatformFeeUpdater`; `useIndexDtfExposure`; `status` via shared
discovery (keep `KNOWN_DEPRECATED` fail-safe); `useIndexDtfPrice`/
`useIndexDtfPriceHistory`; remove redundant atom writes consumer-by-consumer).

Hardening riding on it:

| finding | resolution | tests |
|---|---|---|
| B1 fabricated fee fallback | fee comes from the SDK read; register renders **"unavailable" on error/undefined — never a fabricated number** (display state is register's) | SDK: fee mapper fixture · register: un-fixme B1/M10 settings fixme(s), RED-verify |
| D3 chainId race | route identity via SDK provider pattern; fix residual readers (ledger M1 `FeesInfo` → `indexDTF?.chainId`) | register e2e: existing spa-chain-identity spec stays green; wrong-chain RPC assertion if expressible |
| Z21 atom leaks | dissolved — atom mirroring deleted; while touching, grep for other leaked atoms | register e2e: SPA DTF→DTF nav — no stale tx-count/mcap stat cards — RED-verify against pre-migration build |
| Z3 discover `data.filter` | adopt SDK discovery read (validated mapper) for `useIndexDTFList`; if the SDK read doesn't cover this endpoint yet, `Array.isArray` guard stays register-side | SDK mapper fixture or register unit (`use-index-dtf-list.test.ts` non-array vector) + e2e error-object body via `overrides.api`, RED-verify |
| Z4 (week-ago-pnl) | via `useIndexDtfPriceHistory` (SDK owns the timeseries shape) | SDK fixture; register unit only if a local transform survives |

Exit evidence: audit P1's own (no second folio-manager request, one query key
per source, values match production) + the finding tests above + existing
overview/settings e2e green against the SDK path.

### M2 — P2 auctions/settings/manual-issuance migration; repos: both; blocked by: R0 (S0 for the price-gap specs)

Full audit P2 (SDK rebalance/auction hooks; `useIndexDtfBidQuote`;
bids-enabled/rebalance-control reads; supply/assets/holders;
**rebalance-health boundary into the SDK** — `/rebalance/liquidity` client,
trade-size derivation, Ondo capacity, max-safe-percent; reuse SDK
current-rebalance + open-auction builders; `useIndexDtfIssuanceState`; keep
debounce/retry-UI/warnings/atom-form state/zapper checks in register).

| finding | resolution | tests |
|---|---|---|
| Z26 0-price → calldata | input validation in the **SDK open-auction builder**: every price finite `> 0` or explicit indeterminate | SDK unit vectors (token B price 0 → indeterminate; control run → ordered arrays) · register e2e: launch blocked + "price unavailable" (needs S0), RED-verify |
| Z19 legacy open-auction | if the legacy v2 path migrates to SDK builders, guards land there; if it stays register (legacy UI), guard register-side | unit vectors either side (hand-computed 2-token case + zero-price fail-loud) |
| Z37 + F2 price-shape trust | dissolved — asset-prices boundary moves into the SDK client with validated shapes (reject `statusCode` bodies); delete the dead historical branch | SDK transport-failure/mapper tests · register: launch surface e2e above |
| Z30 rebalance metrics | dissolved into SDK rebalance/auction reads with honest optional types | SDK fixture (auctions-less body) · register e2e: rebalance list renders, RED-verify |
| B2 platformFee=100 → ∞ | one fee-share helper (SDK if it fits the fee read, else one register helper both copies import); divisor clamped | unit vectors (100/0/valid) · **un-fixme `fee-edge.spec.ts:10` (M9), RED-verify** |
| D1 isHybridDTFAtom | derive from `useIndexDtfRebalanceControl().weightControl`; delete the address allowlist (verify 1:1 semantics) | register atom unit (true/false/missing) + e2e: Manage-Weights step per fixture |
| Z7 preview ∞ weight | guard `dtfPrice > 0` wherever the preview math survives (SDK rebalance-health or register hook) | extend `use-rebalance-basket-preview.test.tsx` (0-price) or SDK vector · optional e2e (literal "Infinity" via `overrides.api`) |
| Z9 `supply ǀǀ 1n` | `supply === 0n` → indeterminate, never `1n` (manage-weights view math, register) | register unit on extracted folio computation |
| Z29 forever-polling | gate `refetchInterval` on active/ongoing (register interaction behavior — stays here by audit rule) | register unit on the gate fn |
| G3 + D2 | supported-Index-chains const centralized (adopt the SDK's chain export if it has one); prune Arbitrum from confirmed Index fan-outs per-site (Z32 rule: Yield keeps it) | suite green; egress log shows no Arbitrum calls from Index surfaces |

### M3 — Governance math via SDK; repos: both; blocked by: R0

| finding | resolution | tests |
|---|---|---|
| Z18 + Z22 | register's three outcome sites (`getProposalState`, `getProposalStatus`, portfolio voting state) replaced by the SDK's proposal-state mapping (corroborated/fixed in R0: bigint, tie ⇒ DEFEATED); add the Yield outcome to the SDK if missing (consumption-first, per audit P3 rule) | SDK: outcome vectors (tie; >2^53 wei ±1) · register: **flip the 4 `it.fails`** into tests asserting register renders the SDK-derived state |
| Z17 timelock id | SDK governance helper next to the proposal builders: `values` built from `targets.length`; register's `timelockIdAtom` + `proposalTxArgsAtom` consume it | SDK: multi-action id matches hand-computed `hashOperationBatch` (golden) · register: new atom test (nothing captured yet) |
| E1 phantom threshold | register-side: the change-detector compares like-for-like (form state is register's); check `propose-dao-settings/updater.tsx` (ledger M2) for the twin | register unit on extracted comparator · **un-fixme the 2 basket-settings specs, RED-verify** |

### M4 — Targeted yield + portfolio adoption; repos: both; blocked by: R0

Adopt only the reads the findings sit on (not P3):

| finding | resolution | tests |
|---|---|---|
| Z8 staking-vault APY | **register-side fix** (R0 verdict 2026-07-14: SDK yield APY is corroborated-safe but has NO reward-period StakingVaultRevenue equivalent — adding one for a sidebar fails the boundary test). Guard `assets > 0`, `rewardsEnd > rewardsStart` → "—" in register | register: extract APY math → unit vectors (0 assets, degenerate period) + render check |
| F3 frozen redeem gate | if SDK `getConfiguration`/frozen-status read exists or is trivially added (consumption-first), adopt; else register patch on the gate | unit on gate predicate (either side) · e2e frozen fixture → redeem disabled, RED-verify (if the rTokenState multicall model blocks it, unit carries — say so) |
| Z1 portfolio white-screen | adopt SDK portfolio reads (current/historical/transactions — already shipped) with validated mappers; `hasReserveActivity` + breakdown atom consume the mapped shape | SDK mapper fixtures (partial-body) · register e2e: portfolio renders on partial body via `overrides.api`, RED-verify |
| Z4 (portfolio timeseries + transactions) | same adoption dissolves `use-historical-portfolio` / `useIndexDTFTransactions` raw fetches | SDK fixtures; register unit only for surviving local transforms |
| Z25 live-point NaN | `(p.value ǀǀ 0)` wherever the live-point append survives adoption | extend `append-live-point.test.ts` |

### RG1 — Residual crash-class (register-only); blocked by: none (Z2 e2e needs S0)

A2✔ unit test of extracted transform · Z2 `(data[chain]?.rtokens ?? []).map`
(+ unit + per-chain e2e via S0) · Z5 internal gov fan-out (`?? []` +
per-chain try/catch, unit) · Z38 `snapshots ?? []` (fragility half) · **A3
residue sweep** (grep `.map(`/`for…of` on query results across `src/views`,
`src/state`, `src/hooks`; skip files M1/M2/M4 will delete — check the
disposition first; cap ~5 new sites, spill the rest) · G1 trust-boundary rule
into `skills/code-standards.md` + `docs/wiki/improvements.md`.

### RG2 — Money display (register-only); blocked by: none (Z6 e2e needs S0)

Z11 `DecimalDisplay` non-finite → "—" (enumerate consumers by grep + visual
check money surfaces; finite input byte-identical; unit: NaN/±Infinity/finite)
· Z6 async-mint `?? 1` input price → suppress USD, "unavailable" (unit on
extracted derivation; e2e omitted-price via S0, RED-verify) · Z10 zap Max
`price ǀǀ 1` → disable Max (unit; e2e disabled state) · Z12 factsheet ÷0 guard
(**flip `calculations.test.ts:46` it.fails**) · Z20 `generateNetPerformanceData`
vectors (tests only) · F1 app-side residue: after M1/M2 SDK price adoption,
sweep the remaining `$1` defaults (`/dtf/price` flat, `latestRoundData`,
`knownPriceResponse`) → fail or "unavailable" (unit per path; S0 fixture
enforces test-side).

### RG3 — Write-path/deploy/zap (register-only); blocked by: Z23 e2e needs S0

Z16 USDT zero-first in `useBatchApproval` + `transaction-modal` + `submit-zap`
(reuse `useIsUSDT`; unit on extracted sequence-builder; e2e write flow with
**seeded non-zero insufficient allowance** — if seeding can't express it, say
so and unit carries) · Z23 deploy blocks on missing/0 basket price + `.toFixed`
guard (deploy atoms unit vectors; e2e blocked-confirm via S0, RED-verify) ·
Z24 surface injected folio flags on confirm summary + real `auctionLength`
floor (**needs engineer value — unresolved**; `form-fields.test.ts` + payload
unit; e2e summary assertion) · Z27 impact-ack `atomWithReset`, cleared on
quote-identity change (atom unit; e2e re-consent write flow, RED-verify) ·
Z28 stale-signer gate (unit on predicate; account-switch not modeled offline)
· B3 schema-bounds unit tests (zod, run regardless of bypass; e2e bounds spec
lives in S0's env row).

### S7 — A11y + hygiene (register-only); blocked by: none

Unchanged from v1: Z33 TabMenu (wrap shadcn `ui/tabs` or tabIndex/keydown/
`role=tab` — additive), Z34 wallet control → native button, Z35 amount input
`aria-label`, Z36 docs-link `<a>` + collateral row button semantics — each with
a keyboard e2e assertion in an existing smoke · Z31 cowbot console.log (scoped
verify only) · E2 optimistic-badge consumer audit (PHOTON spec anchor) · G2
lint guard: no `Number(` on wei-string fields · Z38 label: **parked** — carry
in the final handoff.

### S8 — Island error boundaries + layout (A4 + E3); repo: register; blocked by: S0 + M1/M2 (wrap the migrated code, not the doomed code)

A4 island-level boundaries around independent data islands; e2e via S0
failure injection: island shows a local error, page + nav alive (the honest
A1-class composition payoff), RED-verify. E3 skeleton dimensioning at L1 where
missing; lifecycle L2 layout-shift assertions on the worst offenders.

---

## Backlog (out of scope)

- Full P3 yield migration + the five blocked yield core reads beyond F3's;
  full portfolio flow migration beyond M4's reads (`dtf-sdk` audit owns order).
- Connected-wallet capture, fork/anvil tests, runtime unfix-gate —
  `E2E_HARDENING_PLAN.md`.
- D3 full init-order redesign if M1 residual-reader fixes suffice.
- Ledger H2/H3 — pull in only if touched.

## Unresolved decisions

1. **Z24 `auctionLength` on-chain floor value** — engineer input, needed
   before RG3 closes that row.
2. **Z38 intended metric** — product/engineer; parked in S7 + final handoff.
3. SDK additions that fail the "does it make sense in the SDK" check fall back
   to register-side fixes — call it out in the slice's progress row when it
   happens.
