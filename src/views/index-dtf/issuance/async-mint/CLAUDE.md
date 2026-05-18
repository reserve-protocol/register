# Async Mint Wizard

## What This Is

Multi-step wizard for minting Index DTF tokens. Users provide USDC/USDT (the "input token") and optionally wallet collateral to mint DTF shares. Swaps happen via CoWSwap when the user doesn't hold the exact basket tokens.

## Architecture

```
index.tsx          → Entry point. DataSync + WizardRouter
atoms.ts           → All Jotai state (wizard step, amounts, orders, balances)
utils.ts           → Pure functions: calculateMaxMintAmount, calculateCollateralAllocation
types.ts           → WizardStep, MintStrategy, CollateralAllocation, QuoteResult, RecoveryChoice
steps/             → One component per wizard step
hooks/             → Data fetching + side effects
tests/             → Unit tests for pure functions
```

## Wizard Flow

```
gnosis-check → operation-select → collateral-decision → [token-selection] → amount-input → [review] → quote-summary → processing → [recovery-options] → success
```

- `[token-selection]` and `[review]` only appear for `partial` (multi-token) strategy
- `[recovery-options]` only appears when orders fail/expire during processing

## Two Strategies

- **single**: User pays entirely in input token (USDC/USDT). All basket tokens acquired via CoWSwap.
- **partial**: User contributes wallet collateral for selected basket tokens + input token for the rest. Reduces swap costs.

## Key Data Flow

### DataSync (index.tsx)
- Mounts `useAllocationData()` unconditionally (no guards)
- Populates `walletBalancesAtom`, `tokenPricesAtom`, `folioDetailsAtom`
- These atoms are empty until the hook fetches — components must handle empty state gracefully

### Amount Calculation
- `mintAmountAtom` → dollar string the user enters
- `mintSharesAtom` → derived: oracle-based **seed** estimate. `(dollars / dtfPrice) · (1 − ASYNC_MINT_BUFFER)`. Used as the initial guess for iteration.
- `effectiveMintSharesAtom` → primitive bigint, written by the iteration orchestrator. 0n means "no override".
- `activeMintSharesAtom` → derived: returns `effectiveMintSharesAtom` if > 0n, otherwise the seed `mintSharesAtom`. This is what `collateralAllocationAtom` consumes.
- `collateralAllocationAtom` → derived: calls `calculateCollateralAllocation()` to split each basket token into fromWallet vs fromSwap. Reads from `activeMintSharesAtom` so it tracks iteration progress.

### Max Mint Amount
- `calculateMaxMintAmount()` in utils.ts computes the upper bound a user can mint
- For `single`: just the input token balance
- For `partial`: input token balance + USD value of selected wallet collateral
- This is an **approximation** — doesn't account for DTF weight caps. Actual validation happens downstream at mint time.
- Used in `amount-input.tsx` and `quote-summary.tsx` for the "Max" button, available balance display, and `exceedsBalance` check

### Recovery Options (recovery-options.tsx)
- Appears when CoWSwap orders fail/expire after submission
- Three choices: top-up (add more input token), mint-reduced (use what was acquired), cancel (reverse swaps)
- **Top-up is disabled** when user's input token balance < required top-up amount. Shows "Requires $X but you only have $Y" message.

## Address Normalization

All address maps (`walletBalancesAtom`, `tokenPricesAtom`) store **lowercase** keys. The `selectedCollateralsAtom` Set may contain checksummed addresses. Always normalize to lowercase before lookups. See `calculateMaxMintAmount` for the pattern (creates a normalized Set).

## Input Token

Defined per chain in `MINT_INPUT_TOKENS` (atoms.ts):
- Mainnet/Base: USDC (6 decimals)
- BSC: USDT (18 decimals)

The code implicitly assumes input token price ≈ $1 (stablecoin). `inputTokenBalance` is treated as a dollar amount without price multiplication.

## Pure Functions (utils.ts)

Tested in `tests/collateral-allocation.test.ts` and `tests/quote-iteration.test.ts`.

### calculateMaxMintAmount
Upper-bound estimate of total mintable USD. Sums input token balance + selected collateral USD value.

### calculateCollateralAllocation
Per-token breakdown: how much from wallet vs how much needs swapping. Caps wallet usage at DTF weight (the `required` amount from `folioDetails.mintValues`).

### Quote-iteration helpers (`measureImpactPerToken`, `predictShrinkageTarget`, `applyGreedyClamp`, `detectConvergence`, `sumQuotedCostBaseUnits`)
Used by the orchestrator (`use-quote-iteration.ts`) to converge on a shares target that fits inside the user's budget after CoWSwap price impact. See "Quote Iteration" below.

## Quote Iteration

Naive single-shot quoting fails at large notional because CoWSwap price impact is ignored. The iteration loop measures realized per-token impact against Reserve API reference prices and adjusts the shares target until the total `sellAmount` fits inside `mintAmount · (1 − ASYNC_MINT_BUFFER)`.

### Algorithm

1. Seed: `S₀ = mintShares` (oracle-based estimate).
2. Quote each basket token at the current `S`. Sum sellAmounts → `cost`.
3. Per-token impact: `impactᵢ = (sellUsdᵢ − Sᵢ · wᵢ · referencePriceᵢ) / (Sᵢ · wᵢ · referencePriceᵢ)`.
4. Stop if `cost ≤ target AND utilization ≥ 98%`. Or if the marginal share change is < 0.5%.
5. Otherwise predict the next `S` via a quadratic model `cost(r) = r · K_lin + r² · K_quad / S_prev` (closed form), clamp by greedy `S · target/cost` (always feasible thanks to convexity), and re-quote.
6. Cap at 3 rounds. After cap: use best feasible round (`status = 'capped'` if utilization < 98%, otherwise `converged`). If no feasible round ever existed: `infeasible`.

### State (`iterationStateAtom`)

```
{ status, round, maxRounds, history, bestFeasible, perTokenImpacts, error? }
```

Statuses: `idle | iterating | converged | capped | infeasible | failed`.

### Where it lives

| File | Responsibility |
|---|---|
| `hooks/use-quote-iteration.ts` | Orchestrator. State machine, abort handling, commits final quotes. |
| `hooks/use-mint-quotes.ts` | Single-round primitive used by processing flows. Auto-commits via useEffect for backwards compat. |
| `utils.ts` | Pure functions for impact measurement + shrinkage prediction. |
| `steps/quote-summary.tsx` | Triggers `runIteration()`, shows progress banner, displays realized impact + utilization in real mode, falls back to oracle estimate (`~` prefix) in estimated mode. |
| `steps/configure-mint.tsx` | Shows the seed estimate with `~` prefix to set expectation that final shares may shrink after quotes. |

### Reset behavior

- `mintAmountAtom` change → orchestrator's `useEffect` calls `resetIteration()` and aborts the in-flight iteration.
- `resetWizardAtom` clears `effectiveMintSharesAtom` and `iterationStateAtom` along with everything else.

## Hooks

| Hook | Purpose |
|------|---------|
| `use-collateral-allocation.ts` | Fetches folio details, wallet balances, token prices → syncs to atoms |
| `use-mint-quotes.ts` | Gets CoWSwap quotes for the swap portions |
| `use-submit-orders.ts` | Signs and submits CoWSwap orders |
| `use-order-status.ts` | Polls order status until fulfilled/failed |
| `use-reverse-orders.ts` | Swaps acquired collateral back to input token (cancel flow) |
| `use-recovery.ts` | Pure functions: calculateTopUp, calculateReducedMint, calculateReversalEstimate |

## Global Dependencies

- `balancesAtom` from `@/state/atoms` — global ERC20 balances (used for input token balance)
- `indexDTFBasketAtom` from `@/state/dtf/atoms` — basket token list with decimals
- `indexDTFPriceAtom` from `@/state/dtf/atoms` — current DTF price in USD
- `GlobalProtocolKitProvider` — wraps the wizard for Safe/Gnosis atomic batch support

## Known Limitations

- `calculateMaxMintAmount` is an upper-bound estimate (no weight cap deduction). Edge cases caught at review/mint step.
- `walletBalancesAtom`/`tokenPricesAtom` load async after mount. On first render of `amount-input`, max defaults to input-token-only until data arrives.
- The `useEffect` that auto-fills max on mount uses `maxMintAmount` as dep with eslint-disable. It fires once when data loads, but won't re-trigger if user already typed something.
- Settings button in `quote-summary.tsx` is a UI stub (no onClick handler yet).

## Tests

```bash
npx vitest run src/views/index-dtf/issuance/async-mint
```

Test files:
- `tests/collateral-allocation.test.ts` — 21 tests: calculateCollateralAllocation (15) + calculateMaxMintAmount (6)
- `tests/atoms.test.ts` — atom derivation tests
- `tests/recovery.test.ts` — recovery pure function tests
