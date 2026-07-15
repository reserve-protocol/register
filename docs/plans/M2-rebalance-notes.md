# M2 (rebalances/auctions) — engineer-review notes (chk-2)

> **Engineer review required (Luis).** This is the on-chain rebalance/auction
> surface. **M2a (rebalance-list + Z30) is DONE** — see the § M2a UPDATE below;
> its one open gate is **cross-chain confirmation of the `/dtf/rebalance`
> contract** (single-element array + `auctions` always present), determined
> empirically on base/lcap nonces 1-5. Later sub-slices (M2b auction-launch math
> Z26/Z19, M2c settings) carry heavier on-chain review.

# M2 launch brief — auctions/settings/issuance migration (ready when RG frees the tree)

## Scouting findings (2026-07-14, read-only)

- **SDK read surface is complete** (linked 0.4.1): useIndexDtf{Rebalance,
  CurrentRebalance, RebalanceAuctions, ActiveAuction, LatestAuction,
  CompletedRebalance(s), BidQuote, BidsEnabled, RebalanceControl,
  RebalanceLiquidity}. Register adopts these, deletes raw `/rebalance` fetches.
- **On-chain math is ALREADY fail-loud at the SDK** (R0 verified): dtf-rebalance-lib
  getTargetBasket/getOpenAuction throw on price<=0; decimal.js-light throws on
  NaN/Infinity/÷0. So Z26/Z19's on-chain math doesn't silently skew — a 0 price
  throws. The register work is UX: validate BEFORE the lib call and surface
  "price unavailable — cannot launch" instead of a generic try/catch error.
- **SDK completed-rebalance mapper throws on missing auctions** (INVALID_RESPONSE).
  Z30 decision needed: is an auctions-less completed rebalance a VALID "no
  auctions run" state (→ map to `[]`, register shows "0 auctions") or malformed
  (→ throw)? The finding says "Analytics fields optional — not present when no
  auctions" ⇒ absent = valid empty ⇒ SDK should map to `[]`, not throw. **This
  is an API-contract/product call → confirm with Luis before changing the SDK.**

## Register raw-fetch/atom sites to migrate (~15 files under auctions/)
updater.tsx, atoms.ts, rebalance-list/{metrics-row, historical-rebalance-item,
active-rebalance-item, use-rebalance-metrics}, rebalance/{index, updater,
rebalance-price-impact, rebalance-action, rebalance-auctions,
manage-weights-view, transforms, rebalance-liquidity-checker}.

## Findings riding M2 (plan disposition)
- Z30 → SDK completed-rebalance mapper (auctions-less policy above) + adopt hook
  + rebalance-list browser regression.
- Z26 → get-rebalance-open-auction.ts: validate prices finite/>0 before the lib
  call, "cannot launch" state (SDK builder already throws; this is the UX guard).
- Z19 → src/lib/index-rebalance/open-auction.ts (legacy v2): guard prices>0/
  supply>0 at the top; unit vectors (hand-computed 2-token + zero-price fail).
- Z37 + F2 → use-asset-prices-with-snapshot.ts: Array.isArray + reject statusCode
  body (mirror usePrices); this FEEDS the rebalance price path — adopt SDK read
  where it exists, else guard. Engineer-review adjacent.
- Z7 → use-rebalance-basket-preview: guard dtfPrice>0 (unit vector exists).
- Z9 → manage-weights-view: supply===0n → indeterminate, never ||1n.
- Z29 → gate the two forever-polling refetchIntervals on active/ongoing.
- B2 → platformFee=100 guard (both fee copies) — but SDK revenue math already
  multiplies by remaining pool (R0: B2 pattern absent in SDK); register-side
  copies still need the guard if not SDK-sourced.
- D1 → isHybridDTFAtom from useIndexDtfRebalanceControl().weightControl, delete
  allowlist.
- G3 + D2 → centralize supported-Index-chains const; prune Arbitrum from
  confirmed Index fan-outs per-site (Z32 rule).

## Weight: HIGH engineer-review (on-chain rebalance/auction math + calldata).
Split into sub-slices (M2a rebalance-list+Z30, M2b auction-math guards Z26/Z19/
Z37, M2c settings D1/B2/Z29/G3) — each its own commit + browser regression.
Do NOT run concurrently with another main-tree agent. SDK changes need the
Node24 rebuild + Playwright coordination (port 3005 check).

## Unresolved for Luis
1. Z30 auctions-less: valid-empty (map []) vs malformed (throw)?
2. Z24 auctionLength on-chain floor (still open from the plan).
3. The whole M2 auction-math surface is engineer-review — Luis reviews before merge.

## M2a UPDATE (2026-07-14): the REAL Z30 bug
- Real-API verification (base/lcap nonces 1-5): `/dtf/rebalance?nonce=` returns
  an ARRAY of length 1, not a single object. The SDK's getIndexDtfRebalanceDetail
  read it as a single object → mapApiCompletedRebalanceDetail got the array →
  `.auctions` undefined → OLD mapper threw on EVERY real response. The SDK
  completed-rebalance read was 100% broken end-to-end; register never noticed
  (used its own raw fetch; M2a is the first SDK-read consumer). THE array-unwrap
  is the true Z30 owner fix.
- `auctions` is ALWAYS PRESENT (`[]` when none, nonce 5). So omission = malformed
  → mapper stays FAIL-LOUD on true absence (the defensive omission→[] was
  reverted). Contract determined empirically (base/lcap 1-5) — Luis confirms it
  holds across chains/endpoints.
- SDK: array-unwrap in getIndexDtfRebalanceDetail (keep DtfClientApi SINGULAR,
  normalize [0] inside the api method — CXR-046-I1), RECORD_NOT_FOUND on empty,
  analytics-type completion (shared with the rebalance DETAIL card).
- Register: adopt useIndexDtfCompletedRebalance (nonce 0 via !== undefined),
  extract + unit-test the metrics transform (CXR-046-I2), preserve byte-identical
  zero display + flag "unavailable for absent analytics?" for Luis. Z30 ≠ F2
  (mapper is NOT schema-validated; F2/Z37 later sub-slice).

## M2 ledgered UX debt (pre-existing, surfaced during M2a)
- Rebalance-list `metrics=null` → PERMANENT SKELETON on a settled query
  error/empty result: `MetricsRow` selects Skeleton on `!metrics`, not
  `isLoading`. Pre-existing (old raw hook also returned null for `[]`), NOT an
  M2a regression — but real UX debt (error/empty → forever-skeleton). Fix in a
  later M2 sub-slice (distinguish loading from settled-empty/error).
- CXR-046-I1 (keep DtfClientApi singular) + CXR-046-I2 (register transform unit)
  owed before M2a closes.
