# Validating an Index DTF rebalance proposal

A monthly rebalance is a single `startRebalance` calldata that decides how a
DTF trades its whole basket. Reviewing it by eye means reading 18 D27-encoded
weight triples, so use the checker:

```bash
pnpm validate-rebalance <proposal-url> [--mcap-source=coingecko]

# example — CMC20 on BSC
pnpm validate-rebalance \
  https://app.reserve.org/bsc/index-dtf/cmc20/governance/proposal/6159...309 \
  --mcap-source=coingecko
```

Exit code is non-zero if any check FAILs. Set `RPC_URL` to use a private RPC
(the public defaults are rate-limited and the script reads ~40 slots).

## Review in two passes

1. **Preventing disasters** — could this proposal move a large part of the fund
   into the wrong place? These are model-level failures: our price API is wrong,
   a token has the wrong decimals, an address is a look-alike token. They FAIL
   the run.
2. **Optimizing outcomes** — will the trades execute well? Liquidity, price
   impact, auction sizing. Important, but a bad answer here costs basis points,
   not the basket. Mostly WARNs.

Do pass 1 first, always. The checker orders its output the same way.

## The disaster checks

The internal-consistency checks below all trust _our_ view of the world, so
these three deliberately do not:

- **Pool price inside the encoded band.** For each token, compare
  `sqrt(price.low * price.high)` against the price in the deepest DEX pool
  (DEXScreener — intentionally a different provider than the proposal's prices).
  The pool price must be _well_ within `[price.low, price.high]`; normal market
  movement is fine, but consuming more than half the band means the proposal is
  stale, and landing outside it means the auction can only fill against us. A
  gap of ≥0.5 orders of magnitude is not a price move at all — it is wrong
  decimals or the wrong token, and it FAILs.
- **Basket shares recomputed at pool prices.** A price error the reviewer shares
  with the proposer cancels out of every internal check. Revaluing the proposed
  weights at pool prices instead surfaces it as _this token's share of the fund
  is wrong_, which is the thing that actually hurts: percent-of-basket being
  traded is the sanity check that a pile of value is not about to be shifted
  somewhere it should not go.
- **Token identity.** Every address must be the contract CoinGecko lists for
  that symbol on that chain. Addresses the DTF already holds have survived a
  previous rebalance and vote, so an unlisted _held_ token (many Binance-Peg
  wrappers are unlisted) is noise while an unlisted _new_ token is not — the
  identity risk is concentrated in newly added constituents. Pool depth is
  reported alongside, since a real asset with no pools is its own red flag.
- **Weights vs the last executed rebalance.** Decoded from the previous
  `startRebalance` calldata (the subgraph stores weight arrays in calldata order
  but exposes `tokens` id-sorted, so the two cannot be zipped). Constituents do
  not legitimately move by an order of magnitude month over month.

## The idea

Everything the proposer typed into the propose flow can be recovered from the
calldata itself:

| Encoded field                                 | What it recovers                                                                      |
| --------------------------------------------- | ------------------------------------------------------------------------------------- |
| `price.low` / `price.high` (D27{nanoUSD/tok}) | the per-token USD price (geometric mean) and the price-error preset (`1 - low/price`) |
| `weight.spot` (D27{tok/share})                | whole tokens per whole share → target USD value → target basket %                     |
| `weight.low` vs `weight.high`                 | TRACKING (pinned) vs NATIVE (widened)                                                 |
| `limits.high`                                 | `1 / (1 - Σ targetᵢ · priceErrorᵢ)`                                                   |

So the script recovers those inputs, feeds them back into
`@reserve-protocol/dtf-rebalance-lib` `getStartRebalance`, and compares. A match
proves the calldata is unmodified library output — a hand-tweaked weight or a
mismatched `limits` cannot survive it. This is the single highest-value check;
everything else is context.

## What each check means

- **decoded startRebalance / no extra actions.** A routine rebalance is exactly
  one calldata to the Folio with zero value. Anything bundled alongside it (a
  fee change, an `setRebalanceControl`) is a different review.
- **governance routing.** The proposal must go to the _trading_ governor, and
  that governor's timelock must be in the Folio's `auctionApprovers` — i.e. it
  actually holds `REBALANCE_MANAGER`. Wrong governor = the proposal can pass and
  still revert on execution.
- **basket membership.** Any token currently held but absent from the calldata
  can never be traded out (FAIL). Adds and zero-weight exits are legitimate but
  always deserve a human look: an add is a new constituent, a zero weight is a
  full exit.
- **weights / limits reproduce.** See above. Small last-digit differences are
  expected (the target basket is recovered through floating point); the script
  allows 5bps.
- **TRACKING vs NATIVE.** TRACKING DTFs (`weightControl == false`, e.g. CMC20)
  must have `low == spot == high` on every token: the basket is pinned and only
  `limits` absorbs price error. NATIVE DTFs widen weights instead. A pinned
  NATIVE basket, or a widened TRACKING one, means the wrong path was used.
- **embedded prices vs Reserve API.** Prices are frozen at proposal time; a
  drift beyond 2% means the proposal is stale relative to the market and the
  auction will open away from fair value.
- **price errors.** The propose UI presets are 25% (low volatility) / 50%
  (medium) / 75% (high) / 90% (degen). Wider error = wider auction band = more
  room for a bad fill, so it should track the token's actual volatility and
  liquidity, not be maxed out by default.
- **launcher window vs TTL.** `auctionLauncherWindow` is how long only the
  auction launcher may open auctions; after it, and until `ttl`, anyone can.
  The window must fit inside the TTL. A TTL equal to the window means there is
  no permissionless fallback if the launcher is asleep.
- **trade liquidity** (optimizing outcomes). Each net trade is priced through
  `POST api.reserve.org/rebalance/liquidity` (Zapper-routed, same endpoint the
  propose flow uses). This is where real problems show up: a small constituent
  can need a trade several percent of its pool. Thin legs above $1k fail the
  run — the fix is normally to load the trading bot / market maker before the
  auction opens, not to change the weights.
- **weights vs market caps** (`--mcap-source=coingecko`). For a market-cap
  mandate like CMC20 the proposed weights should equal live float-market-cap
  weights over the constituent set. Expect sub-0.5pp deviations; CoinGecko and
  CoinMarketCap disagree slightly on circulating supply (DOGE and HYPE are the
  usual offenders).

## Why the deltas are always near zero

A market-cap-weighted basket of the assets themselves self-rebalances: when a
token's price moves, both its market cap and the DTF's holding of it move by the
same factor. So a monthly rebalance only has to correct for (a) constituent
adds/removes and (b) circulating-supply drift. Near-zero deltas on every
existing token are the expected, healthy result — not evidence that the
proposer forgot to refresh anything. A large delta on an unchanged constituent
is the thing that deserves suspicion.

## What the script cannot decide

- **Constituent eligibility.** Whether an asset belongs in the index is a
  mandate question. CMC20 excludes stablecoins, pegged/wrapped assets, and
  "assets with limited investability", which is why names ranked inside the top
  20 by market cap (XMR, exchange tokens, RWAs) can be legitimately absent.
  The script prints the on-chain mandate; a human confirms the roster.
- **Canonical bridged representation.** That `BTCB`/`WBNB`/Binance-Peg address
  is the right wrapper for the asset on that chain.
- **`maxAuctionSize` sizing.** Whether a flat cap per token is appropriate, or
  a thin token should be capped tighter.
- **Timing.** Whether the vote/timelock schedule lands the auction in a liquid
  session.
