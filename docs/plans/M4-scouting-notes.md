# M4 (yield + portfolio) — scouting notes (2026-07-15, read-only)

> **Correction (CXR-089):** an earlier draft of this file claimed the SDK has no
> wallet-aggregation read and reframed M4 as register-only. That was WRONG — a
> scouting error (register's direct fetch was checked; the SDK side was not).
> The SDK **does** own the aggregation. M4 is SDK adoption, per the plan. Corrected below.

## The real state
Register bypasses the SDK and fetches reserve-api directly, unvalidated:
- `hooks/use-portfolio.ts` → `GET {RESERVE_API}v1/portfolio/:address` → `response.json()`, no validation.
- `hooks/use-historical-portfolio.ts` → `GET v1/historical/portfolio/:address?period=` → `response.json()` cast, no validation.
- `src/hooks/useIndexDTFTransactions.ts` → (used by index-dtf-container; confirm scope).
- No zod in `src/views/portfolio-page/`.

But the SDK ALREADY wraps those same endpoints (`packages/sdk/src/client/api/portfolio.ts`):
- `getAccountPortfolio` → `/v1/portfolio/:address` → `mapPortfolio()`
- `getAccountPortfolioHistory` → `/v1/historical/portfolio/:address` → returns raw `unknown`
- `getAccountPortfolioTransactions` → `/v1/portfolio/:address/transactions` → `response.map(...)`
- namespace `sdk.portfolio.{get,getHistory,getTransactions}`; React SDK `useAccountPortfolio`/`useAccountPortfolioHistory`/`useAccountPortfolioTransactions` (in register `docs/wiki/sdk.md`).

So this is the same **"migration IS the fix"** pattern as M1/M2/M3: register runs a
raw parallel fetch; the SDK read exists but its owner-boundary mapper is incomplete.

## The real SDK gap (owner-boundary hardening — do NOT duplicate in register)
1. **Type coverage.** `AccountPortfolio` = `{ totalHoldingsUSD, indexDTFs, voteLocks }`
   — MISSING `yieldDTFs`, `stakedRSR`, `rsrBalances` that register's `PortfolioResponse`
   has (reserve-api returns all 6). Migrating as-is would drop yield/staked/RSR positions.
2. **No validation (Z1 white-screen).** `mapPortfolio` does `indexDTFs.map`/`voteLocks.map`
   with no guard — a partial body throws inside the SDK. Needs partial-body-tolerant
   mapping (missing array → `[]`, drop malformed rows, keep good ones).
3. **History unmapped (Z4).** `getAccountPortfolioHistory` returns `unknown` — no type, no map.
4. **Transactions** map a trusted array directly — validate array-ness.

## M4 plan (corrected) — chk-4
| finding | resolution | tests |
|---|---|---|
| **Z1** white-screen | SDK: extend `AccountPortfolio` to the full 6-field shape + validated partial-body `mapPortfolio` (missing array → [], drop bad rows). Register: migrate `use-portfolio` → `useAccountPortfolio`; `portfolioDataAtom` consumes the mapped shape; delete the raw fetch | SDK mapper fixtures (partial/malformed body) · register e2e: portfolio renders on partial body via `overrides.api`, RED-verify |
| **Z4** history + transactions | SDK: type + validated mapper for history (not `unknown`) and transactions. Register: migrate `use-historical-portfolio` + `useIndexDTFTransactions` to the SDK hooks; delete raw fetches | SDK fixtures; register unit only for surviving local transforms |
| **Z25** live-point NaN | **ALREADY DONE** (earlier wave): `appendLivePoint` (use-historical-portfolio.ts:62-65) sums positions with `(p.value \|\| 0)`, tagged `(Z25)`, covered by `tests/append-live-point.test.ts`. Residual: the top-level `totalHoldingsUSD`/historical-point `value` are unguarded — but that's the Z1 partial-body validation, not Z25. No Z25 work owed | (existing test) |
| **Z8** staking-vault APY | **RE-SCOPE (2026-07-15 scout):** no register-side staking-vault APY COMPUTATION found — the `apy` field is served by reserve-api on stakedRSR/voteLock rows and register only DISPLAYS it. So the `assets>0`/`rewardsEnd>rewardsStart` guard belongs at the API/SDK compute boundary, NOT register. Either (a) the plan's "sidebar APY math" lives somewhere I haven't located (needs a deeper grep of the vote-lock staking flow), or (b) Z8 is an API-side guard → gated. Confirm with Luis before implementing | TBD once the compute site is confirmed |
| **F3** frozen redeem gate | yield-dtf redeem surface (not portfolio). Adopt SDK frozen-status read if it exists/trivial, else register-patch the gate predicate | unit on gate predicate · e2e frozen fixture → redeem disabled, RED |

## Ownership / sequencing
- Z1/Z4 = **SDK PR** (type + mappers + fixtures, reviewed by Luis) **then** register migration + e2e. The SDK half rides the same `sdk/hardening`→main channel.
- Z25/Z8 = small register-only guards; F3 = separate yield redeem surface (check SDK frozen read first).
- chk-4 (yield/portfolio), separate from chk-2 (rebalance) / chk-3 (governance).

## Open for Luis
1. Confirm SDK-adoption path (extend `AccountPortfolio` + mappers, migrate register) — this is an SDK type change; per the boundary rule it's protocol-adjacent but here it's completing an already-shipped read's owner hardening.
2. Z4 scope: `useIndexDTFTransactions` (index-dtf-container) — migrate with Z4 or its own slice?
3. F3: SDK frozen-status read vs register-patch the gate.
