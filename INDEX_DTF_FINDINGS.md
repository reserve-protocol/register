# Index-DTF Findings Ledger

Adversarial hunt across the Index-DTF surface, driven by the same method that
found the container chain-init bug: strict mocks + boundary-request recording +
snapshot-derived assertions expose the app's real behavior, and every deviation
(wrong-chain request, redundant fetch, race, stale state, silent catch, unbounded
loop, missing guard) is a finding — not a test to make green.

Goal: bug-free + optimized register, proven by a strong e2e suite.

Severity: **P0** invalidates a gate / real user-facing defect · **P1** real bug
or regression risk under plausible conditions · **P2** perf / bad practice /
edge case worth fixing. Type: bug · race · perf · practice · edge · a11y.

Status: `found` → `test-written` (characterization/fixme in the suite) →
`triaged` (confirmed with Luis) → `fixed`.

Fix plan is built from this ledger AFTER the hunt; nothing here is fixed
unilaterally on shared/release-sensitive surfaces without triage.

---

## Verified clean (probed adversarially, proven sound — the "bug-free" evidence)

- **Manual mint math** — `maxMintAmount`'s `+1n` ceil guard is ALWAYS sufficient (floored client-required is strictly < balance for every asset); MAX is always a valid submittable mint; `minSharesOut`/`minAmountsOut` match the fee/slippage formulas to the wei; empty/zero/over-balance inputs keep submit disabled with empty txLog; a second mint under an existing allowance emits 0 approvals + 2 mints (no re-approve/race). Locked by `issuance-manual-boundaries.spec.ts`.
- **Governance vote support enum** — For=1 / Against=0 / Abstain=2, decoded from real `castVote` calldata; UI↔calldata agree. Locked by `governance-support-variants.spec.ts`.
- **Governance permissions** — zero-power / already-voted / window-closed all block the vote CTA with empty txLog; cancel is CANCELLER-gated (decodes `cancel(operationId)` to the TIMELOCK). Locked by `governance-permissions.spec.ts`.
- **Governance request identity** — no redundant/duplicate governance subgraph queries; proposal-detail queries hit only the correct chain on direct nav.
- **Overview chart edge states** — empty timeseries and single-point history degrade gracefully (chart doesn't crash, hero + basket stay mounted). Holdings mcap shows em-dash `—` when marketCap is absent on BOTH tabs (no-fallback invariant holds). Locked by `overview-edge.spec.ts`.
- **Cross-chain hero cleanup** — `resetState` clears the hero symbol/price so each DTF shows its own identity on nav (the stale-identity flash is only in the transient wrong-chain REQUESTS, not the settled render). Governance atoms self-heal via their `dtf?.id` dependency. Locked by `spa-state-cleanup.spec.ts` (passing half).
- **Settings fee display + roles** — fee %s scale correctly (raw 1e18 → %), recipient shares derive from modeled platform fee, role roster matches snapshot, `distributeFees` is correctly permissionless (no privileged-control leak). Locked by `settings.spec.ts`.

## P0

| # | Area | Type | Finding | Evidence | Status |
|---|---|---|---|---|---|
| 1 | container | race/bug | Route chain (`chainIdAtom`) set in a layout effect that runs AFTER SDK-consumer children mount → a fresh Base/BSC route's first subgraph query hits the stale mainnet client (wrong-chain request; stale-data flash on cross-chain SPA nav). **Mechanism refined:** the container passes the CORRECT route `chainId` as a PROP to `PlatformFee/Exposure/YieldIndex/Deprecation` updaters, but `IndexDTFDataUpdater`/`GovernanceUpdater`/`BrandFilesUpdater` take no prop and their SDK hooks (`useCurrentIndexDtf`, etc.) read the LAGGING `chainIdAtom`. The inconsistency is the root; cleanest fix = pass route `chainId` as a prop to ALL updaters (or set chainIdAtom synchronously before mount). **Blast radius: 125 index-dtf files read `chainIdAtom` directly** — fixing the init-order fixes the stale-read transient for ALL of them, so this is the single highest-leverage fix. | `index-dtf-container.tsx:184-192` (IndexDTFDataUpdater→useCurrentIndexDtf reads chainIdAtom), 467-481 (setChain in layout effect), 486-495 (mounts). | test-written (`flows/spa-chain-identity.spec.ts` fixme) |

| 15 | container/settings | bug (DoS) | **Zero fee denominator blanks the ENTIRE DTF page.** `setFee(Number((feeNumerator * 100n) / feeDenominator))` has no zero guard → a `getFeeDetails` with `feeDenominator=0` throws `RangeError: Division by zero` in the `PlatformFeeUpdater` effect. Because that updater lives in the container, EVERY DTF tab breaks, not just settings. A misconfigured/malicious DAO fee registry DoSes the whole DTF page. Fix: guard `feeDenominator === 0n` → fallback path. **This is arguably P0** (whole-page DoS from untrusted registry data). | `index-dtf-container.tsx:354`; `settings.spec.ts` fixme | test-written |

## P1

| # | Area | Type | Finding | Evidence | Status |
|---|---|---|---|---|---|
| 18 | overview | bug (chain-race) | **5th manifestation of the chain-init root cause (#1) — REST boundary.** The `/current/dtf` market-price query fires `chainId=1&address=<base/bsc addr>` before the route chain settles (observed `8453→1→8453`). In prod, reserve-api keys on chainId+address → chain 1 has no such DTF → first price fetch returns empty/404 → transient price glitch/error. Distinct from #1 (subgraph). The e2e current/dtf mock resolves by address so it hid. | `index-dtf-container.tsx:467` + SDK market-price fetch; `spa-state-cleanup.spec.ts` fixme | test-written |
| 17 | settings | bug (chain-race) | **4th manifestation of the chain-init root cause (#1).** `FeesInfo` reads `tokenJar()` on `chainIdAtom` instead of `indexDTF.chainId` (its siblings correctly use `indexDTF?.chainId`). During the mount race a base DTF's `tokenJar()` fires against stale mainnet → returns zero → a staking-vault-routed governance fee misclassifies as "Other recipient" instead of Governance Share. Masked on lcap (recipient matches via `stToken.id`); any tokenJar-routed DTF is exposed. Fix: use `indexDTF?.chainId`. | `index-settings-fees.tsx:99,105` | found |
| 2 | governance | bug (security) | Proposal-description markdown renders raw `<iframe>` and loads its src (attacker-controlled on-chain description → live external frame). `<MDEditor.Markdown>` uses rehype-raw with no rehype-sanitize. Same renderer in yield governance. | `proposal-md-description.tsx`; `governance-description-render.spec.ts` fixme | test-written |
| 3 | governance | bug | Every basket-settings proposal silently appends a phantom `setProposalThreshold` calldata the user never touched + the empty-change guard never trips — the threshold change-detector compares a percentage field against a `/1e18` baseline. | `propose-basket-settings/updater.tsx` ~L48 vs ~L128; `governance-propose-basket-settings.spec.ts` (2 fixme) | test-written |
| 4 | overview | bug | `use-asset-prices-with-snapshot.ts:72` throws if the current/historical price endpoints diverge on a token (missing address) — crashes the rebalance preview on API drift; safe only because the two endpoints stay consistent. | `use-asset-prices-with-snapshot.ts:72` | found |
| 7 | container | bug/race | `resetStateAtom` (cross-chain/token nav cleanup) resets ~17 index atoms but OMITS `indexDTFVersionAtom` (default `'4.0.0'`) — so on SPA nav to a different-version DTF the PREVIOUS version persists until `IndexDTFVersionUpdater` re-fetches. Version gates write-ABI selection, so a user acting in that stale window could get a tx built against the wrong ABI. Also omits chart-selection atoms (F6: `dataTypeAtom`/`chartTypeAtom`/`apyHistoryAtom` → stale APY stats across nav) and governance atoms self-heal (verified clean). **Confirmed independently by agent D.** | `index-dtf-container.tsx:401-419` vs `atoms.ts:167`; `spa-state-cleanup.spec.ts` fixme | test-written |

| 8 | container | race/bug | `useChainWatch` calls `switchChain({chainId})` whenever `chainIdAtom !== walletChain`. Because `chainIdAtom` lags the route (finding #1), a CONNECTED user navigating to a Base/BSC DTF momentarily has `chainId=mainnet(stale) !== walletChain=base` → fires a spurious **"switch to Ethereum Mainnet" wallet prompt**, then re-switches to base. Confusing at best; at worst auto-switches the wallet mid-session. Same root cause as #1 — fixing the init-order eliminates this too. | `index-dtf-container.tsx:172-182` | found |

## P2

| # | Area | Type | Finding | Evidence | Status |
|---|---|---|---|---|---|
| 5 | governance | practice | `shouldBypassFormValidation()` disables ALL zod form bounds on localhost/dev — out-of-bounds fees submit locally and e2e can't cover validation. Narrow the bypass + add schema unit tests. | `src/utils/form-validation.ts` | found |
| 6 | governance | race | Possible propose double-fire on rapid double-click (two identical `propose()` txs) — likely frozen-clock artifact; needs a 30s manual check on a real build. | governance propose flow | found |
| 9 | issuance | edge/bug | Redeem ships `minAmountsOut = 0` for low-rate / low-decimal assets (cbBTC 8-dec) at realistic small amounts — `floor(required*95/100)` collapses to 0, so that leg has ZERO slippage/MEV protection while the tx still succeeds. Repro: redeem 0.0001 shares. | `manual/components/index-manual-issuance.tsx:174` | test-written (`issuance-manual-boundaries.spec.ts` t6) |
| 10 | issuance | edge/bug | `parseEther(indexDTF.mintingFee.toString())` is an unguarded crash path in the mint onClick: a fee small enough to render in scientific notation (`<1e-6`) or `>18` fractional digits throws synchronously → mint SILENTLY no-ops (no tx, no error). Also `mintFee > 1e18` (>100%) → negative uint → viem rejects. Dormant on lcap (0.3%); untrusted SDK data. | `index-manual-issuance.tsx:153` | found |
| 11 | issuance | practice | `balanceMap` keyed raw-case while `allowanceMap`/`assetDistribution` are lowercased; `maxMintAmountAtom` works only because the container lowercases basket addresses app-wide. If the SDK ever returns checksummed addresses, maxMint reads 0 and mint is silently blocked. | `manual/updater.tsx:68` | found |
| 12 | issuance | practice | `isValidAtom` requires `allowanceMap` length even in `sell`/redeem mode (redeem needs no allowance) — if the allowance multicall lags/fails, Redeem stays disabled with no surfaced error. | `index-manual-issuance.tsx:57-64` | found |
| 13 | issuance | practice/perf | Dead `_atomWithDebounce` import; `amountAtom` is plain so `assetAmountsMap`/`tokensNeedingApproval` recompute un-debounced on every keystroke. Harmless small-basket; drop or debounce. | `manual/atoms.ts:5` | found |
| 19 | overview | practice | Dead code: `use-dtf-price.ts` (`useIndexDTFCurrentPrice`) has ZERO importers repo-wide; it reads `chainIdAtom` + builds a chainId-first `current/dtf` URL — if ever wired up it would reproduce #18 from app code. Delete it. | `overview/hooks/use-dtf-price.ts` | found |
| 20 | overview | edge (bug) | Chart stuck in PERMANENT skeleton when market price is 0: `use-dtf-price-history.ts:150` gates `enabled` on `currentPrice` truthiness, so a young DTF / api-price-0 → history query never fires → `isLoading` stays true forever, no empty-state, no error. | `use-dtf-price-history.ts:150` | found |
| 21 | overview | practice | Chart selection atoms (`dataTypeAtom`/`chartTypeAtom`/`apyHistoryAtom`) not reset on nav → BTC/candlestick selection + stale `avgApy` stats carry across DTFs (`hasEstimatedHistoricalPriceAtom` IS address-guarded — good pattern; `apyHistoryAtom` is not). | `price-chart-atoms.ts` | found |
| 14 | governance | practice (latent) | `proposal-vote-button.tsx:41` gates re-vote on `!!vote`. Safe TODAY because the SDK's `getAccountProposalVote` returns the subgraph `choice` as a STRING ('FOR'/'AGAINST'/'ABSTAIN'). But if the subgraph ever returned a numeric choice, an AGAINST voter's `choice=0` → `!!0=false` → re-enables voting (double-vote UI). Add a defensive non-null check independent of truthiness. | `proposal-vote-button.tsx:41` | found |
| 16 | settings | bug (misleading) | Platform-fee fallback SILENTLY masks a failed `getFeeDetails`/registry read: on any error the code sets `FALLBACK_PLATFORM_FEES[chainId]` (50 on Base, 33 on BSC) and "Fixed Platform Share" shows it as if real, no error indicator. That fabricated fee feeds `PERCENT_ADJUST`, so EVERY recipient share below it is scaled by a guess. Confirmed: shares change wholesale between fallback 50 and modeled 20. | `index-dtf-container.tsx:355-356`, `index-settings-fees.tsx:62,74` | test-written (`settings.spec.ts` documents fallback) |
