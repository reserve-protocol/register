# Index DTF v6 — regression test catalog

This catalog expands RB-01–RB-14, UP-01 and NEW-01 in the [integration contract](index-dtf-v6-integration.md). The [handoff](index-dtf-v6-handoff.md) owns implementation sequencing, file locations and runner operations. **All cases below are requirements to implement, not passing test results.**

There are **146 concrete cases**: 103 rebalance, 17 upgrade, 16 native-deployment/new-asset and 10 infrastructure cases. Parameterization across versions, chains and fixtures produces more executions; the manifest must enumerate those explicitly.

## 1. Case identity, applicability and evidence

Use IDs such as `RB-05.03` for a concrete case within a contract family. A parameterized execution key is `(caseId, chainId, fixtureId, versionStage, variant)`. The required-case manifest must list every applicable execution before it starts; aggregate counts cannot conceal missing fixture identities.

Lanes:

- **SRC:** actual pinned source proxy/assets/governance. Every primary/supplemental source completes baseline and candidate lifecycle, plus its supported upgrade path and post-upgrade lifecycle.
- **CTL:** synthetic controls on Ethereum/Base/BSC for deterministic mechanics absent from source baskets. Keep original-version control, both upgrade topologies and native-v6 controls.
- **ISO:** isolated semantic/negative/property test. Snapshots/reverts are permitted only without an indexer observing that chain.
- **UI:** real Register with candidate public hooks, local wallet sends and real RPC receipts. Offline rendering tests supplement this lane.
- **IDX:** append-only local Graph indexing, checked at explicit transition blocks.

Minimum assignment: run each full source lifecycle on its native chain; every source gets Register read/preview coverage before and after required upgrade. Run at least one full source browser execution per chain, plus upgrade/native browser flows per chain. Run semantic controls on each chain where chain configuration affects behavior; pure integer/ABI combinatorics can share isolated unit/property vectors with per-chain execution controls. Record the assignment and reason rather than multiplying every case by every source blindly.

Version applicability is part of each case assignment. V4 has no per-token `maxAuctionSize` or per-auction traded-cap accounting; assert actual quantities and target bounds, not fabricated cap fields. Per-auction cap cases apply to v5/v6. Nonce/deadline start arguments, per-auction duration, allowlist and self-fee cases use v6 controls unless the inventory proves the feature exists in another version. An absent legacy feature is an evidenced applicability decision; it never excuses skipping that source's complete lifecycle.

V4 sources execute through Register's local v4 path by decision (SDK admits `5.0.0`/`6.0.0` only). Candidate-SDK cases (RB-01.02, RB-01.03, RB-01.04) apply to v5/v6 sources; a v4 source instead gets a Register-baseline-vs-Register-candidate differential proving the local v4 branch survived the migration untouched, plus a negative case proving an unknown version blocks the write.

### Common positive-case proof

Capture input context and candidate producer; sender/role, target, value and full ordered calldata; successful receipt and exact relevant events; before/after raw token/share balances, nonce, auction state and capacities; independent expected values; and Graph parity where indexed. UI cases additionally prove visible preview, action, receipt state and refreshed chain state. A hash or successful simulation alone is insufficient.

### Common negative-case proof

Start from a valid fixture and alter one property. Ensure no earlier guard masks the intended failure. Assert exact version-specific custom error/arguments; when submitting a reverting local transaction, assert status and absence of partial storage/token/role transitions. Sender gas, sender transaction nonce, block timestamp and time-dependent fee views may change; compare those deliberately rather than asserting every view byte is identical. Rejected wallet requests have no chain receipt.

V6 error names below come from the audited Folio/RebalancingLib source. Reconfirm against the pinned release ABI. V4/v5 tests use their actual ABI/errors; for example, older v5 uses `Folo__NotInRebalance` where v6 uses `Folio__NotInRebalance`.

## 2. Full lifecycle recipe — every source DTF

Execute this recipe with each case's explicitly selected original or upgraded version. Use current Register preparation for the baseline and actual candidate SDK/Register preparation for candidate runs.

1. **Establish source state.** Verify proxy/version/governance, asset identities, code hashes and fork block. Record any already-running proposal/rebalance/auction/filler. Set up valid local actors through real authority/funding; do not erase history to make nonce zero.
2. **Resolve active-state prerequisites.** Wait, close or end through permitted roles as appropriate; document each transition. Advance real governance clocks on the local fork without replacing governors or using timelock impersonation for the primary governance path.
3. **Choose a reproducible target.** Define a valid source-appropriate basket adjustment with at least one nonzero sell and buy, realistic finite trade targets, explicit fraction/price mode and independent final-target/dust bounds. Use finite per-token auction caps on v5/v6; v4 has no such fields. Include multi-round behavior in designated cases. Persist exact input prices and observation times.
4. **Prepare and preview.** Capture the actual production calculation path's output. Decode all arguments independently and compare against intended basket/limits/units. Resolve historical initial snapshot separately from live inputs.
5. **Authorize/start.** For governed sources, submit the real standard or permitted optimistic proposal and complete its true lifecycle. For actual direct-admin sources, send from the existing authorized role; do not describe that as governance coverage.
6. **Launch.** Use actual launcher or permitted community path. Assert nonce, ordered token membership/weights/prices/limits, duration and emitted auction identity.
7. **Trade.** Fund/approve a valid counterparty. Perform a partial fill, assert raw deltas/quote and version-applicable caps, then complete that round. Use additional rounds as dictated by the declared target; do not declare completion after open.
8. **Finish.** Close/end separately when required. Assert final per-token holdings and target-error/dust bounds, actual traded amounts, version-applicable remaining caps and expected completed/expired state. A deliberately partial/expired scenario is its own test, not a substitute for the successful full-lifecycle case.
9. **Use the DTF afterward.** Mint and redeem using its actual basket and effective supply. Check governance and new-rebalance readiness without stale cached values.
10. **Check history.** Wait for matching indexed blocks; assert ordered events/entities and historical version reads. Preserve direct-admin rebalances without requiring an associated proposal.

All ten market-cap-selected sources plus OPEN and DGI execute this recipe. The cohort contains 7–25 basket assets; two-token WETH/USDC controls cannot replace those cases.

## 3. Independent arithmetic and invariants

### 3.1 Integer bid oracle

Use test-owned integer `floorMulDiv`/`ceilMulDiv`, separate from the SDK and rebalance library. Establish approved weights/limits, actual balances and effective supply from pinned contract state; establish version-applicable traded usage through the independent ledger below. Source formula: protocol `contracts/utils/RebalancingLib.sol`, `getBid`, at the fixture's pinned version. The following branch applies to **v5/v6**:

Capacity provenance needs an explicit adapter: `auctions(id)` returns nonce/start/end, not the nested `Auction.traded` mapping. Reconstruct usage from an independent ledger of executed bids and normal trusted-fill settlements, using actual balance/transfer/event deltas and verified historical starting usage. Normal trusted fills need no `AuctionBid`; emergency recoveries are not ordinary traded usage. A newly opened auction's observed receipt provides a legitimate zero-usage starting point. Tests may cross-check version-pinned storage slots, but production hooks must use supported reads/indexed provenance or report unavailable. Never use the candidate quote as the expected cap usage or assume zero because a field is absent.

```text
buyTarget = floor(floor(limit.low × buyWeight.low / 10^18) × supply / 10^27)
buyDeficit = max(buyTarget − buyBalance, 0)
buyCapacity = max(buyMaxAuctionSize − auctionBoughtOrSold[buyToken], 0)
buyAvailable = min(buyDeficit, buyCapacity, 10^36)

sellTarget = ceil(ceil(limit.high × sellWeight.high / 10^18) × supply / 10^27)
sellSurplus = max(sellBalance − sellTarget, 0)
sellCapacity = max(sellMaxAuctionSize − auctionBoughtOrSold[sellToken], 0)
sellAvailable = min(sellSurplus, floor(buyAvailable × 10^27 / price), sellCapacity)

sellAmount = min(sellAvailable, requestedMaxSellAmount)
buyPayment = ceil(sellAmount × price / 10^27)
```

For **v4**, preserve the same target and payment rounding, but omit both per-auction capacity clamps:

```text
buyAvailable = min(buyDeficit, 10^36)
sellAvailable = min(sellSurplus, floor(buyAvailable × 10^27 / price))
sellAmount = min(sellAvailable, requestedMaxSellAmount)
buyPayment = ceil(sellAmount × price / 10^27)
```

For all versions, enforce requested minimum sell quantity and max buy payment. `auctionBoughtOrSold` describes v5/v6 per-auction traded accounting, not a proposed public SDK field. Both directions consume the relevant token's cap on those versions. Include the `10^36` raw-token buy cap in all applicable version boundary tests.

**Hand-calculated v5/v6 vector:** supply `10^18`; all limits `10^18`; sell weight `3×10^9`; buy weight `11×10^9`; raw balances sell=10/buy=2; raw caps sell=5/buy=8; price=`1.5×10^27`. Targets are 3/11; sell surplus=7 and buy availability=8; sale lot=5; payment=8. A partial sale of 2 pays 3, leaving balances 8/5 and capacities 3/5; the remaining sale of 3 pays 5. Total sold=5, total bought=8. Selling 5 with max payment 7 reverts `Folio__SlippageExceeded()`.

**V4 counterpart:** with the same supply, weights, balances and price, but no per-auction caps, buy availability is 9 and sale availability is 6. A requested maximum of 6 sells 6 and pays 9. This distinct result detects accidental use of the v5/v6 cap adapter for v4.

These are **raw token quanta**, not whole tokens. For exact same-price assertions use an isolated snapshot, atomic batch or controlled same-block transaction order; do not assume a Dutch price stays constant across mined blocks.

### 3.2 Price and target oracles

At auction start, price is `ceil(sell.high × 10^27 / buy.low)`. At auction end, test the contract's endpoint using an independent oracle. For sell range `[1×10^27, 1.5×10^27]` and buy `[1×10^27, 1.25×10^27]`, the start price is `1.5×10^27` and end price is `0.8×10^27`. Interior exponential-decay cases require independently computed high-precision expectations and justified rounding tolerance, not the production math library as oracle.

For each source lifecycle, save the target in exact share/unit terms, fixed valuation prices and per-asset raw dust allowance. Check sum/association of allocations, actual sell/buy delta signs, no unauthorized asset loss, cap bounds and final allocation error. Define tolerances before executing; do not enlarge them after observing failure. Fee-aware supply expectations must include pending fees/handout; stored ERC20 supply alone is not an oracle.

## 4. Rebalance cases

### RB-01 — baseline, extraction and production wiring

| Case     | Setup / action                                                                 | Required assertion                                                                                       |
| -------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| RB-01.01 | SRC full lifecycle from frozen original-version state                          | Complete independent proof from section 2                                                                |
| RB-01.02 | Same inputs through old Register preparation and candidate SDK                 | Complete decoded arguments and metrics agree, or a reviewed semantic correction explains each difference |
| RB-01.03 | Execute candidate bytes on a fresh clone of the same fork input                | Actual effects agree with independent oracle, not just old code                                          |
| RB-01.04 | Mutate Register wiring to bypass SDK preparation in a temporary test candidate | Integration test fails at its real production seam; undo mutation and verify green                       |
| RB-01.05 | Resolve a different math-library/package instance or context hash              | Harness rejects comparison of nonidentical inputs/dependencies rather than presenting false parity       |

### RB-02 — product and portfolio modes

| Case     | Setup / action                                                                                         | Required assertion                                                                                                         |
| -------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| RB-02.01 | Native, tracking and curated-hybrid source/control with deliberately different current/snapshot prices | Correct explicit target-price mode; hybrid membership is not inferred from weight control                                  |
| RB-02.02 | Fixed weights vs mutable weights vs deferred weights                                                   | Correct allowed ranges and required constraints; unsupported combination fails before send                                 |
| RB-02.03 | Fractions 0, a genuine partial fraction, 100 and computed maximum-safe fraction                        | Expected no-action/partial/full semantics, exact bounds, no fabricated progress; 0 is not counted as a completed rebalance |
| RB-02.04 | EJECT/PROGRESS/FINAL and a boundary that changes selected round                                        | Correct arrays/limits and selected price mode; progress label is not the contract-state oracle                             |
| RB-02.05 | Auto-cap changes after user edits fraction                                                             | Preserve user-edited intent; show invalidation/reconfirmation if new limits make it unsafe                                 |

### RB-03 — token identity, arrays and precision

| Case     | Setup / action                                                                   | Required assertion                                                                                              |
| -------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| RB-03.01 | 6/8/18 decimals, uneven weights, raw amounts above `2^53`, dust                  | Integer oracles hold; no Number conversion of onchain money                                                     |
| RB-03.02 | Mixed-case addresses and duplicates after normalization                          | Unique identity; duplicate start `Folio__DuplicateAsset()`; normalization preserves order                       |
| RB-03.03 | Permute tokens and every associated array coherently, then permute only tokens   | Coherent permutation remains economically equivalent; inconsistent association is detected                      |
| RB-03.04 | Start with 0/1 token; false `inRebalance`; zero/Folio address                    | `Folio__EmptyRebalance()`, `Folio__NotInRebalance()`, `Folio__InvalidAsset()` respectively                      |
| RB-03.05 | Omit previous basket asset C in a valid new start A/B                            | C remains basket member, zero rebalance fields/false membership; cannot be auctioned as active asset            |
| RB-03.06 | Add incoming C, initially zero holdings                                          | C enters basket at start; metadata/pricing/allowlist/mint asset handling follows actual state before first fill |
| RB-03.07 | Largest selected source basket and finite caps                                   | No truncation, alignment error or unbounded per-row requests; every required asset appears in evidence          |
| RB-03.08 | TTL/limit/weight/price validation table below, at and one unit beyond each bound | Accepted equality where allowed; exact corresponding custom error outside bounds                                |

Start-input bounds from audited v6 constants/library:

| Parameter            | Accepted condition                                                     | Rejection                 |
| -------------------- | ---------------------------------------------------------------------- | ------------------------- |
| TTL                  | Nonzero, at least launcher window, at most 2,419,200 seconds           | `Folio__InvalidTTL()`     |
| Limits               | `0 < low <= spot <= high <= 10^27`                                     | `Folio__InvalidLimits()`  |
| Fixed weights        | `low = spot = high <= 10^54`                                           | `Folio__InvalidWeights()` |
| Mutable weights      | `low <= spot <= high <= 10^54`; v6 permits zero spot with nonzero high | `Folio__InvalidWeights()` |
| Initial token prices | `0 < low < high <= 10^45` and `high <= 100 × low`                      | `Folio__InvalidPrices()`  |

Use unsigned values and independent range construction. Initial start prices must be unequal even when the later auction is atomic; constant ranges belong to atomic auction opening. Reconfirm version-specific differences for v4/v5 rather than applying this v6 table to every legacy source.

### RB-04 — unavailable and stale inputs

| Case     | Setup / action                                                         | Required assertion                                                                                        |
| -------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| RB-04.01 | Missing, zero, negative, NaN/infinite price; missing decimals          | Typed unavailable/invalid result, disabled dependent write, no $1/zero-cost fallback                      |
| RB-04.02 | Zero supply or absent held-asset balance                               | Calculation blocks or follows explicitly supported empty-state path; no silent balance=0 default          |
| RB-04.03 | Requested historical block unavailable or API snapshot from wrong time | History error/retry and blocked dependent build; no fallback to latest/current price labeled historical   |
| RB-04.04 | Change supply/nonce/roles between two simulated RPC responses          | One resolved block snapshot or invalidated context; mixed-block candidate rejected                        |
| RB-04.05 | DTF/chain/account switch while previous request finishes               | Old result cannot re-enable a write or populate current context                                           |
| RB-04.06 | Global control/bids setting changes after start                        | Use captured rebalance control/bids setting for that rebalance; next start captures changed global config |

### RB-05 — proposal bytes, nonce, deadline and governance

| Case     | Setup / action                                                                        | Required assertion                                                                                      |
| -------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| RB-05.01 | Valid version-specific start proposal                                                 | V4/v5/v6 tuple/selector/targets/values fully decoded; real correct governor receives immutable bytes    |
| RB-05.02 | V6 nonce N: submit N+1, then isolate N and N+2                                        | Valid next nonce succeeds; wrong values `Folio__InvalidRebalanceNonce()`                                |
| RB-05.03 | Two proposals prepared for N+1; execute A then B                                      | A succeeds; B reverts for stale nonce; no calldata repair; B not marked executed                        |
| RB-05.04 | Fix deadline D; mine execution at D−1, D, D+1                                         | First two succeed, last `Folio__DeadlineExpired()`; control next transaction block timestamp            |
| RB-05.05 | Real governance timing pushes candidate past deadline                                 | Exact expiry failure; UI explains new proposal required, retaining old proposal history                 |
| RB-05.06 | Standard path with late-quorum extension                                              | Re-read actual snapshot/deadline/ETA; vote/queue/execute only at true boundaries                        |
| RB-05.07 | Optimistic path with allowed proposer/selector, then unauthorized/disallowed variants | Correct veto window; positive execution without standard queue; exact governance errors in section 5    |
| RB-05.08 | Veto/cancel/defeat/zero snapshot staking supply                                       | Correct terminal state; no start event or enabled execute; standard and optimistic powers stay distinct |

### RB-06 — authority, replacement and opening windows

| Case     | Setup / action                                                                              | Required assertion                                                                                                      |
| -------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| RB-06.01 | Unauthorized start / launcher / admin setter                                                | `AccessControlUnauthorizedAccount(actualCaller, requiredRole)`                                                          |
| RB-06.02 | Unauthorized close/end                                                                      | `Folio__Unauthorized()`                                                                                                 |
| RB-06.03 | Wrong route chain/account or role revoked after preview                                     | UI blocks/refetches or actual contract rejects; never sends on stale identity                                           |
| RB-06.04 | Community before restrictedUntil; then past window but before start+120                     | Restriction error first; otherwise `Folio__NotRebalancing()` for initial buffer                                         |
| RB-06.05 | No previous auction; at max(restrictedUntil,start+120), TTL remaining                       | Unrestricted open succeeds with expected spot weights/limits, original prices and max duration                          |
| RB-06.06 | Previous unrestricted auction; community at end+120 and end+121 with other guards satisfied | First collision fails, next succeeds; a prior launcher open would extend restrictedUntil to end+121 and mask this guard |
| RB-06.07 | Privileged launcher replaces a running auction                                              | Previous end becomes openTimestamp−1; ordered AuctionClosed/AuctionOpened; old quote invalidated                        |
| RB-06.08 | Open at TTL−1 vs TTL; wrong auction-opening rebalance nonce                                 | First valid open succeeds; latter/wrong nonce `Folio__NotRebalancing()`                                                 |
| RB-06.09 | Deprecated source/control attempts start/open/bid, plus supported redeem/read               | `Folio__FolioDeprecated()` for guarded trading paths; preserve supported exit/read behavior                             |

### RB-07 — auction arrays, prices, durations and biddable state

| Case     | Setup / action                                                           | Required assertion                                                                                       |
| -------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| RB-07.01 | Empty/mismatched token/weight/price arrays, including NONE empty prices  | `Folio__InvalidArrayLengths()` with preceding guards valid                                               |
| RB-07.02 | Duplicate/inactive token, widened weights/limits                         | Appropriate DuplicateAsset/InvalidAsset/InvalidWeights/InvalidLimits error                               |
| RB-07.03 | NONE with changed price or nonmax length                                 | InvalidPrices/InvalidAuctionLength; unchanged initial prices and exact max length succeed                |
| RB-07.04 | PARTIAL narrowing versus wider/constant ranges                           | Allowed narrowing succeeds; invalid range rejects according to token order and validation path           |
| RB-07.05 | ATOMIC all constant versus mixed constant/nonconstant                    | All constant succeeds; mixed `Folio__MixedAtomicSwaps()`; preserve initial strictly unequal start ranges |
| RB-07.06 | Controlled-mode lengths 119,120,max,max+1; max setter 119/604801         | Correct accepted bounds and InvalidAuctionLength failures                                                |
| RB-07.07 | Dutch length L                                                           | start=open+30; end=start+L; launcher extension=max(previous,open+L+30+120+1)                             |
| RB-07.08 | Atomic open-and-fill in ordered same block from actual role/counterparty | start=end=openTimestamp; valid fill; selected L still affects launcher extension                         |
| RB-07.09 | start−1/start/end/end+1 with nonzero lot                                 | Public getBid and SDK/public hook agree on inclusive biddability; distinguish warmup from ended state    |
| RB-07.10 | Latest auction time-valid but previous nonce after new start             | Bid rejects AuctionNotOngoing; SDK cannot report it current/biddable solely from time                    |

### RB-08 — real bid execution, rounding and capacities

| Case     | Setup / action                                                                 | Required assertion                                                                                                                |
| -------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| RB-08.01 | Section 3 version-specific hand-calculated lot/payment vectors                 | Exact v4 and v5/v6 quotes; v5/v6 partial/final cap deltas; max payment below each computed amount rejects                         |
| RB-08.02 | V5/v6 finite buy cap, finite sell cap, exact cap and cap+1 attempts            | Both bought/sold quantities count; exhausted nonzero requested bid `Folio__InsufficientSellAvailable()`                           |
| RB-08.03 | Lower max buy than ceil payment                                                | `Folio__SlippageExceeded()`, transfers revert                                                                                     |
| RB-08.04 | Direct approval and callback payment paths                                     | Correct allowance/spender/raw amount; callback underpayment `Folio__InsufficientBid()`                                            |
| RB-08.05 | Invalid/identical pair, nonauction token, outdated nonce, out-of-time          | `Folio__AuctionNotOngoing()` with other guards valid                                                                              |
| RB-08.06 | Current rebalance bids disabled; zero payment                                  | `Folio__PermissionlessBidsDisabled()` / `Folio__InsufficientBuyAvailable()` on appropriate paths                                  |
| RB-08.07 | Zero-first approval token, insufficient allowance/balance, unlimited allowance | Ordered approvals and token-specific behavior; no false-success receipt                                                           |
| RB-08.08 | Two auction rounds and final sell-asset exhaustion                             | Auction IDs advance, current nonce preserved; v5/v6 per-auction caps reset; basket removal/issuance lists reflect actual protocol |
| RB-08.09 | Token-buy raw cap near `10^36` and large-value products                        | Integer cap/rounding holds without overflow or lossy JS conversion                                                                |

### RB-09 — trusted fills and external-order boundary

| Case     | Setup / action                                                                  | Required assertion                                                                                                             |
| -------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| RB-09.01 | Local approved trusted fill; ordinary bids disabled                             | Supported fill executes, balances/caps correct, no requirement for AuctionBid                                                  |
| RB-09.02 | Registry disabled/unset                                                         | `Folio__TrustedFillerRegistryNotEnabled()`                                                                                     |
| RB-09.03 | Partial fill and normal close, then exhausted sell asset                        | Correct actual bought/sold accounting and basket state                                                                         |
| RB-09.04 | Emergency close from wrong role or wrong/zero active filler                     | Access-control error / `Folio__InvalidTrustedFill()`; correct admin recovery tested separately                                 |
| RB-09.05 | Successful emergency recovery                                                   | Balances recovered per protocol; recovered amounts are not incorrectly added to normal traded-cap accounting                   |
| RB-09.06 | Active async fill while another state-changing operation/preflight is attempted | Respect stateChangeActive/sync constraints; no unreliable mid-fill read labeled stable                                         |
| RB-09.07 | Native/unlisted DTF opens auction in browser                                    | Cowbot cannot send orders to public services in deterministic fork lane; approved local adapter records actual controlled flow |
| RB-09.08 | Listing data loading/error and same address on two chains                       | Unknown listing is distinct from known unlisted; identity includes chain; no automatic uncontrolled order submission           |

### RB-10 — completion, end/close and restart

| Case     | Setup / action                                                | Required assertion                                                                                         |
| -------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| RB-10.01 | Full source target reached within predeclared bounds          | Nonzero real execution and exact end-state proof; UI completion alone is insufficient                      |
| RB-10.02 | End active rebalance with running auction                     | No further opening, but auction can still accept valid bids through its interval                           |
| RB-10.03 | Close auction before start/during activity/after expiry       | Correct close state/event; end<start is allowed for pre-start close                                        |
| RB-10.04 | Repeat close vs repeat end                                    | Repeated expired close emits no new close; repeated end is allowed and may update availableUntil/emits end |
| RB-10.05 | Auction opened before TTL continues after TTL                 | Bids remain possible while auction interval/current nonce permit                                           |
| RB-10.06 | Start new rebalance while prior auction still timestamp-valid | New nonce invalidates old bids; do not require old endTime rewrite/AuctionClosed from start alone          |
| RB-10.07 | No progress/expired/partial outcome                           | Report that outcome accurately; it cannot fulfill successful full-lifecycle case                           |

### RB-11 — allowlist semantics

| Case     | Setup / action                                           | Required assertion                                                                                    |
| -------- | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| RB-11.01 | Disabled allowlist, otherwise-valid token set            | Start succeeds                                                                                        |
| RB-11.02 | Enabled, one missing token, including zero-target exit   | `Folio__TokenNotAllowlisted()`; basket membership grants no exemption                                 |
| RB-11.03 | Token removed between proposal preparation and execution | Exact allowlist failure; immutable old proposal preserved                                             |
| RB-11.04 | Token removed after valid start                          | Current launcher/unrestricted/bid/trusted-fill paths remain valid; future start including token fails |
| RB-11.05 | Duplicate add / remove absent token                      | No spurious duplicate mutation events; set and indexed state remain consistent                        |
| RB-11.06 | Incoming basket asset C                                  | Allowlist before start required; eventual purchase is not the permission boundary                     |

### RB-12 — fees, effective supply and input unit contracts

| Case     | Setup / action                                                                  | Required assertion                                                                                             |
| -------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| RB-12.01 | Mint/redeem between auction rounds                                              | Fresh effective supply/balances drive next sizing; original snapshot remains explicit                          |
| RB-12.02 | Daily TVL-fee boundary before build/send                                        | Fee-aware weight/supply refresh; no stale sizing                                                               |
| RB-12.03 | Nonzero self-fee accrual/handout across its configured timing                   | Pending/handed-out quantities reconcile; no stored-supply shortcut                                             |
| RB-12.04 | Mutable + immutable recipients, then mutable edit                               | Full immutable table preserved, exact portions and unchanged fields retained                                   |
| RB-12.05 | Human share percent, D18 share fraction, human token units and raw token amount | Distinct encodings: `50` percent vs `0.5×10^18`, `"1"` USDC vs `10^6` raw; wrong unit cannot slip into builder |
| RB-12.06 | Settings duration in product minutes vs raw protocol seconds                    | Explicit conversion once; product presets and protocol bounds tested independently                             |

### RB-13 — indexing and historical continuity

| Case     | Setup / action                                                       | Required assertion                                                                                         |
| -------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| RB-13.01 | Fresh deploy with initialization logs preceding deploy event         | Supply/balances/roles/settings counted exactly once; version hydrated correctly                            |
| RB-13.02 | Source DTF deployed before fork point                                | Proper discovery/replay/initial state; static source without state proof does not pass                     |
| RB-13.03 | Upgrade same proxy, inspect before/at/after transition               | Historical ABI/version correct, one DTF identity, new settings populated, no duplicate balances            |
| RB-13.04 | Direct-admin or temporarily unindexed proposal association           | Rebalance remains visible; no mandatory execution-block-only join                                          |
| RB-13.05 | More rows than one history page, same-block events, delayed bids     | Complete stable pagination/order using authoritative identifiers; no silent truncation/collision           |
| RB-13.06 | RPC/indexer intentionally disagree due lag                           | Live action gates use RPC; indexed display marks pending/unavailable; exact-block parity waits then passes |
| RB-13.07 | Trusted fill without bid event; close/replacement ordering           | Correct event/link/balance representation without invented AuctionBid                                      |
| RB-13.08 | Restart/redeploy correct indexer; then wrong fork/old store identity | Correct catch-up deterministic; mismatched identity fails loudly                                           |

### RB-14 — Register and public-hook behavior

| Case     | Setup / action                                                       | Required assertion                                                                       |
| -------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| RB-14.01 | Real public hooks in Register generate preview and local transaction | End-to-end producer/receipt/state evidence; no direct-client escape or synthetic receipt |
| RB-14.02 | Undefined identity, unknown version, disconnected wallet             | Reads/load states supported; writes unavailable with accurate reason                     |
| RB-14.03 | Wrong chain/account, hidden/background tab, route changes mid-flight | Existing wallet focus policy preserved; no stale action or callback update               |
| RB-14.04 | User rejection, mined revert, replacement/cancellation, double click | Correct cleanup/recovery and one intended transaction; no success on failure             |
| RB-14.05 | Same-address upgrade or role change                                  | Version/config/context refreshed before next write; no five-minute stale-version window  |
| RB-14.06 | Reload pending/success with indexer lag                              | Correct receipt/chain recovery and history pending state, not endless launch state       |
| RB-14.07 | Desktop/mobile/default/error/loading and large basket                | Preserved usable controls/copy/focus; visual evidence from actual changed surfaces       |
| RB-14.08 | Cache invalidation over operation-first keys and historical variants | Correct live families refreshed; immutable block-pinned historical values retained       |

Existing UI has launcher/community controls, bid history and Cowbot. Direct bid/close/end execution belongs to SDK runner coverage unless an actual product control already exists or is separately requested. This catalog does not request a new trading UI.

## 5. Governance timing and upgrade cases

### Clock contract

Read actual `CLOCK_MODE()`/`clock()`, proposal snapshot/deadline and ETA. Current synthetic fixture delay/period values (60/300 seconds; timelock 2 seconds) are convenience values, not source-DTF defaults. Late quorum may extend standard deadline after a vote; reread it.

Standard upgrades always propose → vote → queue → wait ETA → execute. Optimistic basket proposals are Pending through snapshot, Active through deadline, Succeeded after deadline; they do **not** queue. On the audited governor, queueing an optimistic proposal fails `OptimisticGovernor__OptimisticProposalCannotBeQueued(proposalId)`. Unauthorized optimistic proposer fails `OptimisticGovernor__NotOptimisticProposer(address)`; disallowed target/selector fails `OptimisticGovernor__InvalidCall(address,bytes)`. Snapshot staking supply, delegation and veto denominator must be real; undelegated shares still affect total past supply.

### UP-01 concrete cases

| Case     | Setup / action                                                                                      | Required assertion                                                                                                                        |
| -------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| UP-01.01 | Optimistic-capable v5 DTF, standard four-call upgrade                                               | Register v6 selector → unregister v5 → transfer ProxyAdmin → cast; all values zero; standard proposal kind; full lifecycle                |
| UP-01.02 | Legacy standard v5 DTF, two-call upgrade                                                            | Transfer ProxyAdmin → cast with zero registry; full lifecycle                                                                             |
| UP-01.03 | Actual selected v4.0.0/v4.0.1 source                                                                | Reviewed separate v4→v5 artifact/hop, temporary v5-spell role removed, intermediate invariants, then v5→v6; no direct hop                 |
| UP-01.04 | Wrong version/repeat v6 upgrade                                                                     | Spell error code 1; no successful upgrade state                                                                                           |
| UP-01.05 | Additional admin, including mistakenly granting v6 spell admin                                      | Code 3; temporary v5-hop role pattern must not leak into v6 hop                                                                           |
| UP-01.06 | Auction length 60/119, then separately authorized correction to ≥120                                | Code 11 before correction; upgrade succeeds after other preconditions met                                                                 |
| UP-01.07 | Live rebalance, ended rebalance but live auction, exact auction end                                 | Codes 13/14; at end+1 eligible if other conditions hold                                                                                   |
| UP-01.08 | Wrong/missing selector state; reorder/omit rotation in whole proposal                               | Exact code 9/10 when isolated; entire failed transaction restores selectors/ownership                                                     |
| UP-01.09 | Wrong governor/timelock/proposer/registry relationships                                             | Codes 6/7/8 in separate cases; unresolved topology never uses zero fallback                                                               |
| UP-01.10 | Registered target deprecated or absent                                                              | `VersionDeprecated()` / `InvalidVersion()`; no false completion                                                                           |
| UP-01.11 | Active async fill, or another rebalance starts after preflight                                      | Code 12 or later relevant eligibility code; refreshed preflight and faithful cleanup path                                                 |
| UP-01.12 | Successful upgrade with pending fees/real holder balances                                           | Full preservation checklist below; same-time fee-aware expected supply                                                                    |
| UP-01.13 | Failed vote/cancelled proposal/failed execute, then recovery                                        | No partial upgrade; proposal and user intent stay inspectable; new proposal when necessary                                                |
| UP-01.14 | Old-version proposal and rebalance history after upgrade                                            | Correct decode/read at original block; unsupported old bytes not silently rewritten                                                       |
| UP-01.15 | First v6 rebalance and mint/redeem after every required source upgrade                              | Complete source lifecycle and public-hook refresh at same proxy                                                                           |
| UP-01.16 | Partial rollout: app/subgraph/package versions differ                                               | Capability gate prevents unsupported write; old queries remain usable where promised                                                      |
| UP-01.17 | Inactive but unclosed trusted filler, stateChangeActive false/false, all other upgrade guards valid | Upgrade succeeds; poke settles fill, clears pointer, preserves aggregate economic holdings and applies expected accounting/basket changes |

### Spell error map

Audited error type: `UpgradeSpell__Error(uint256 code)` in protocol `script/sandbox/UpgradeSpell_6_0_0.sol`.

| Code | Condition being enforced                                                                      |
| ---: | --------------------------------------------------------------------------------------------- |
|    1 | Source is exactly v5.0.0                                                                      |
|    2 | Caller has Folio admin role                                                                   |
|    3 | Exactly one Folio admin                                                                       |
|    4 | Sole admin equals caller                                                                      |
|    5 | Spell owns ProxyAdmin at cast                                                                 |
|    6 | Governor timelock equals caller; also rejects discovered optimistic topology passed as legacy |
|    7 | Governor is timelock proposer                                                                 |
|    8 | Supplied selector registry matches governor                                                   |
|    9 | V6 start selector allowed                                                                     |
|   10 | V5 start selector disallowed                                                                  |
|   11 | Old auction length at least 120 seconds                                                       |
|   12 | No active synchronous/asynchronous state change                                               |
|   13 | Rebalance expired/ended                                                                       |
|   14 | Last auction strictly expired                                                                 |
|   15 | Resulting version is v6.0.0                                                                   |
|   16 | Restored ProxyAdmin owner is caller                                                           |

Some defensive branches are not independently reachable with honest dependencies after earlier checks pass (notably 4, and postconditions 15/16). Use narrow fault fixtures if testing these branches; do not distort a real-source fork solely to maximize branch counts. Required real-source tests exercise reachable preconditions and all positive postconditions.

### Upgrade preservation checklist

Record before/after chain/block/hash, proxy and implementation/admin slots, ProxyAdmin owner/registry, complete role sets, governor/vault/selector relationships, name/symbol/decimals/mandate, actual collateral holdings at Folio and filler, sample holder balances/allowances, effective supply and pending fees, fee recipients/rates, old length/new max length, bids/filler/control configuration, nonce and auction history.

For strict unchanged raw holdings/basket, first settle any filler through the permitted path, verify `activeTrustedFill == 0`, then take the baseline snapshot. This is test normalization, not an extra spell requirement. In UP-01.17 retain the inactive filler deliberately: `stateChangeActive == (false,false)` can coexist with a nonzero pointer. Account for upgrade-time `poke()` settlement, transferred funds, traded accounting, cleared pointer and possible exhausted sell-token removal; compare aggregate economic holdings rather than demanding identical raw Folio balances or basket membership.

Expected in both variants: same proxy/metadata/roles/topology; reviewed v6 implementation; ProxyAdmin restored and no residual spell privileges; correct selector rotation; old length readable as max; fee-aware supply reconciles through poke; `lastFolioFeePoke` initialized. Default newly introduced storage: self fee and pending self shares zero, immutable recipient list empty, allowlist disabled/empty unless separately configured. Verify later configured nonzero values in other cases. Then index the same proxy and execute actual v6 operations.

## 6. Native deployment and new asset cases

Every exposed manual/simple-zap × governed/ungoverned mode must have explicit chain support and producer dependency proof. These cases also cover the separate governance-token/vault prerequisite; a precreated synthetic vault does not prove Register's Create DAO flow.

| Case      | Setup / action                                                            | Required assertion                                                                                                                              |
| --------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| NEW-01.01 | Manual governed deploy                                                    | Actual v6 struct, existing compatible staking vault, unified governor/timelock, selector/proposer/guardian settings, exact seeded shares/assets |
| NEW-01.02 | Manual direct-admin deploy                                                | Owner/manager/launcher roles correct, authorized first rebalance and unauthorized rejection                                                     |
| NEW-01.03 | Simple/zap governed deploy                                                | Versioned backend payload/router/deployer, swap/seed/refund accounting, resulting v6 and governed state                                         |
| NEW-01.04 | Simple/zap direct-admin deploy                                            | Same backend version proof plus explicit owner/roles; no accidental legacy or governed route                                                    |
| NEW-01.05 | Create DAO/new staking token before governed deploy                       | Correct prerequisite call and receipt extraction; vault actually supports required optimistic voting; then deploy/use Folio                     |
| NEW-01.06 | Incompatible existing vote-lock token or unsupported deployer             | Accurate preflight failure; no approval to wrong spender or partial success claim                                                               |
| NEW-01.07 | Mixed decimals, insufficient balance/allowance, zero-first approvals      | Exact planned inputs, approval order/spender and no zero-cost asset fabrication                                                                 |
| NEW-01.08 | Mutable/immutable recipients + meaningful nonzero self fee                | Correct v6 additional-details fields and exact fee/portion behavior after mint/distribution                                                     |
| NEW-01.09 | Chain/account/input/mode changes after quote/approval                     | Stale quote/deploy bytes invalidated; new approval/confirmation reflects exact identity                                                         |
| NEW-01.10 | Missing/foreign/duplicate deployment events; deterministic nonce reuse    | Parse only expected emitter/transaction and correct result; fail malformed receipt; reproducible nonce collision behavior                       |
| NEW-01.11 | Newly created address absent from discovery and API history               | Receipt/RPC-backed load, then indexer catch-up; no fabricated pricing or dependency on listing                                                  |
| NEW-01.12 | First mint/redeem/proposal/auction/fill/close/reload                      | Complete native-v6 user lifecycle, including standard and configured optimistic paths                                                           |
| NEW-01.13 | New basket asset C: unknown metadata/price then valid listing/allowlist   | First blocks appropriately, then start includes C, actual acquisition and later zero-target exit succeed                                        |
| NEW-01.14 | Approval rejection, deploy rejection, mined revert, cancelled/replaced tx | Consistent recovery; no wrong-address navigation or duplicated deployment                                                                       |
| NEW-01.15 | Backend returns successful legacy v5 deployment for v6 request            | Explicit failure/capability disable; HTTP success or syntactic calldata is not support                                                          |
| NEW-01.16 | Valid zero-default deployment vs nonzero-feature deployment               | Both covered; testing zero defaults alone cannot certify self-fee/immutable functionality                                                       |

Simple/zap currently uses Register's `useZapDeployQuery` and `/api/zapper/{chainId}/deploy` or `/deploy-ungoverned`; it is not automatically a `react-zapper` component change. The handoff owns exact files/ownership.

## 7. Infrastructure, mutation and cross-feature gates

### Infrastructure cases

| Case   | Injected condition                                                                | Required result                                                                                            |
| ------ | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| INF-01 | Nonloopback/non-Anvil endpoint or wrong chain/fork hash                           | Refuse transactions/impersonation before any send                                                          |
| INF-02 | Missing archive data, RPC secret, fixture or empty selected tests                 | Failed/blocked required job; never green skipped suite                                                     |
| INF-03 | Unknown schema, pre-fork source passed as fresh fixture, malformed bigint/address | Explicit validation error, no silent coercion                                                              |
| INF-04 | Two mutation owners on same fork/staging directory                                | Serialize or refuse; separate chain jobs cannot overwrite staging/manifests                                |
| INF-05 | Reset Anvil behind Graph head or reuse wrong store                                | Refuse invalid continuation; coordinated reset/archive required                                            |
| INF-06 | Reused bootstrap has code but wrong protocol/fork/spell                           | Provenance check rejects reuse                                                                             |
| INF-07 | Existing source nonce/auction ID nonzero or intentionally expired deadline        | Valid schema-v2 profile accepts history; fixed smoke assumptions cannot mark it completed or invalid       |
| INF-08 | Unexpected public RPC/API/order-submission request during deterministic run       | Fail with destination/caller evidence; no external send                                                    |
| INF-09 | Omitted/repeated result or changed cohort between shards                          | Required-case accounting detects loss/duplication/mismatch                                                 |
| INF-10 | Restart mid-operation after broadcast before manifest commit                      | Recover by actual receipt/block identity and postconditions; no duplicate send based on missing local flag |

### Mutation probes

Temporarily alter one selector, nonce, token order, decimal scale, ceil→floor payment, price source, duration unit, buy cap, max payment, query chain key, version gate or SDK production import. Bind each probe to the exact case expected to fail. Restore the candidate and rerun its normal test. A mutation that only breaks the fixture setup is not evidence that the intended assertion works.

### Cross-feature regression matrix

| Surface              | Unchanged versions                                | Upgraded proxy                                        | Native v6                                            |
| -------------------- | ------------------------------------------------- | ----------------------------------------------------- | ---------------------------------------------------- |
| Overview/basket/fees | Existing display/precision and unavailable states | Fresh version/config/supply; old history accessible   | Loads before listing/indexer history                 |
| Mint/redeem          | Actual asset order/rounding/approvals             | Post-poke supply and new asset lists                  | First and subsequent issuance; nonzero fees          |
| Vote-lock/governance | Standard/optimistic powers separated              | Same topology/history and proper receipt invalidation | Compatible existing/new vault and unified governance |
| Settings/roles       | Existing limits and permissions                   | V6 max length/allowlist/fees with preserved roles     | Nonzero self/immutable config and authorized changes |
| Auction/history      | Existing full lifecycle and archived versions     | First v6 lifecycle and old proposal decoding          | First auction, local bot boundary and unlisted state |
| Wallet/navigation    | Focus-owned chain switching/reject/recover        | Same-address identity refresh                         | New-address navigation and pending tx recovery       |

All rows need applicable tests before final certification. Keep existing offline suites for broad UI coverage and real-fork cases for execution truth. Report differences in what each proves.

## 8. Test author acceptance checklist

- Test uses actual source behavior/public seam and names the independent oracle.
- Setup satisfies every preceding guard; a negative result proves the intended condition.
- Units, rounding, timestamps, chain/address/version and token order are explicit.
- Expected values do not come from the same production calculation being tested.
- Positive case performs nonzero execution and asserts meaningful state; partial/expired scenarios do not stand in for success.
- Required source/chain/version applicability is declared and results reconcile with the manifest.
- Failure retains exact reproducible command, seed, candidate/input digests, receipts and traces.
- Indexed cases append; isolated cases do not revert beneath an observer.
- UI case uses real local transaction/receipt and blocks external side effects; no imaginary product controls added.
- Fresh green result follows mutation restoration and final candidate changes; review/gate status is explicit.
