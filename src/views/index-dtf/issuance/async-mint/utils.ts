import { Address, formatEther, formatUnits } from 'viem'
import { safeParseEther } from '@/utils'
import { CollateralAllocation, MintStrategy, QuoteResult } from './types'

// ─── Max mint amount (accounts for wallet collateral) ────────────────
export function calculateMaxMintAmount({
  inputTokenBalance,
  walletBalances,
  tokenPrices,
  tokenDecimals,
  selectedCollaterals,
  customCollateralAmounts,
  strategy,
  inputTokenAddress,
  assets,
  mintValues,
  referenceAmount,
}: {
  inputTokenBalance: number
  walletBalances: Record<Address, bigint>
  tokenPrices: Record<Address, number>
  tokenDecimals: Record<Address, number>
  selectedCollaterals: Set<Address>
  customCollateralAmounts?: Record<Address, bigint>
  strategy: MintStrategy
  inputTokenAddress: Address
  assets?: Address[]
  mintValues?: bigint[]
  referenceAmount?: number
}): number {
  // Normalize set to lowercase for consistent matching
  const normalizedSelected = new Set<Address>(
    [...selectedCollaterals].map((a) => a.toLowerCase() as Address)
  )

  if (
    assets?.length &&
    mintValues?.length &&
    referenceAmount &&
    referenceAmount > 0
  ) {
    const tokenRequirements = assets
      .map((asset, index) => {
        const normalizedAddr = asset.toLowerCase() as Address
        const price = tokenPrices[normalizedAddr] ?? 0
        const decimals = tokenDecimals[normalizedAddr] ?? 18

        if (!price || normalizedAddr === inputTokenAddress.toLowerCase()) {
          return undefined
        }

        const requiredUsdAtReference =
          Number(formatUnits(mintValues[index] ?? 0n, decimals)) * price
        const walletBalance = walletBalances[normalizedAddr] ?? 0n
        const customAmount = customCollateralAmounts?.[normalizedAddr]
        const usableBalance =
          customAmount !== undefined
            ? customAmount < walletBalance
              ? customAmount
              : walletBalance
            : walletBalance

        return {
          address: normalizedAddr,
          requiredUsdPerDollar: requiredUsdAtReference / referenceAmount,
          walletUsd: Number(formatUnits(usableBalance, decimals)) * price,
          selected: normalizedSelected.has(normalizedAddr),
        }
      })
      .filter(
        (
          item
        ): item is {
          address: Address
          requiredUsdPerDollar: number
          walletUsd: number
          selected: boolean
        } => !!item && item.requiredUsdPerDollar > 0
      )

    const swapUsdForAmount = (amount: number) =>
      tokenRequirements.reduce((sum, item) => {
        const requiredUsd = item.requiredUsdPerDollar * amount
        const walletUsd = item.selected
          ? Math.min(item.walletUsd, requiredUsd)
          : 0
        return sum + Math.max(requiredUsd - walletUsd, 0)
      }, 0)

    let low = 0
    let high = inputTokenBalance

    for (const item of tokenRequirements) {
      if (item.selected) high += item.walletUsd
    }

    for (let i = 0; i < 48; i++) {
      const mid = (low + high) / 2
      if (swapUsdForAmount(mid) <= inputTokenBalance) {
        low = mid
      } else {
        high = mid
      }
    }

    return low
  }

  if (strategy === 'single') return inputTokenBalance

  let collateralValue = 0
  for (const [addr, balance] of Object.entries(walletBalances)) {
    const normalizedAddr = addr.toLowerCase() as Address
    if (normalizedAddr === inputTokenAddress.toLowerCase()) continue
    if (!normalizedSelected.has(normalizedAddr)) continue

    const price = tokenPrices[normalizedAddr] ?? 0
    const decimals = tokenDecimals[normalizedAddr] ?? 18
    collateralValue += Number(formatUnits(balance, decimals)) * price
  }

  return inputTokenBalance + collateralValue
}

// ─── Pure collateral allocation calculation ──────────────────────────
export function calculateCollateralAllocation({
  mintShares,
  assets,
  mintValues,
  balances,
  prices,
  decimals,
  selectedCollaterals,
  customCollateralAmounts,
  strategy,
  inputToken,
}: {
  mintShares: bigint
  assets: Address[]
  mintValues: bigint[]
  balances: Record<Address, bigint>
  prices: Record<Address, number>
  decimals: Record<Address, number>
  selectedCollaterals: Set<Address>
  customCollateralAmounts?: Record<Address, bigint>
  strategy: MintStrategy
  inputToken: { address: Address; decimals: number; symbol: string }
}): Record<Address, CollateralAllocation> {
  if (mintShares === 0n || assets.length === 0) return {}

  const result: Record<Address, CollateralAllocation> = {}

  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i]
    const normalizedAsset = asset.toLowerCase() as Address
    const required = mintValues[i]
    const walletBalance = balances[normalizedAsset] ?? 0n
    const customAmount = customCollateralAmounts?.[normalizedAsset]
    const hasCustomAmount = customAmount !== undefined
    const usableWalletBalance = hasCustomAmount
      ? customAmount < walletBalance
        ? customAmount
        : walletBalance
      : walletBalance
    const isInputToken = normalizedAsset === inputToken.address.toLowerCase()
    const isSelected =
      selectedCollaterals.has(asset) || selectedCollaterals.has(normalizedAsset)
    const useWallet = strategy === 'partial' && isSelected && !isInputToken

    let fromWallet = 0n
    let fromSwap = required
    let explanation = 'Covering the remainder'

    if (useWallet && usableWalletBalance > 0n) {
      if (usableWalletBalance >= required) {
        fromWallet = required
        fromSwap = 0n
        explanation = 'Using your full balance'
      } else {
        fromWallet = usableWalletBalance
        fromSwap = required - usableWalletBalance
        explanation = hasCustomAmount
          ? 'Using custom amount'
          : 'Using your full balance'
      }

      // WHY: If wallet has more than required, it means the token is capped at its DTF weight
      if (usableWalletBalance > required) {
        explanation = 'Token at its maximum weight'
      }
    }

    // Skip input token — it's the one we're spending, not acquiring
    if (isInputToken) {
      continue
    }

    // Estimate USD value for fromSwap portion
    const price = prices[normalizedAsset] ?? 0
    const dec = decimals[normalizedAsset] ?? 18
    const swapUsdValue =
      fromSwap > 0n && price > 0
        ? Number(formatUnits(fromSwap, dec)) * price
        : 0

    result[normalizedAsset] = {
      fromWallet,
      fromSwap,
      usdValue: swapUsdValue,
      explanation,
    }
  }

  return result
}

type SuccessfulQuote = Extract<QuoteResult, { success: true }>

export const getQuoteResultForAddress = (
  quotes: Record<Address, QuoteResult>,
  address: Address
) => {
  const normalized = address.toLowerCase() as Address
  return (
    quotes[address] ??
    quotes[normalized] ??
    Object.entries(quotes).find(
      ([quoteAddress]) => quoteAddress.toLowerCase() === normalized
    )?.[1]
  )
}

// ─── Quote iteration helpers ─────────────────────────────────────────
// Used by useQuoteIteration to measure realized CoWSwap price impact against
// Reserve API reference prices and shrink the shares target until the total
// quoted cost fits inside the user's USDC budget.

export type ImpactMeasurement = {
  totalCostUsd: number
  totalReferenceUsd: number
  totalImpactWeightedUsd: number
  unreferencedCostUsd: number
  impacts: Record<Address, number>
  tokensWithoutReference: Address[]
}

export function measureImpactPerToken({
  quotes,
  allocation,
  referencePrices,
  inputTokenDecimals,
  tokenDecimals,
}: {
  quotes: Record<Address, QuoteResult>
  allocation: Record<Address, CollateralAllocation>
  referencePrices: Record<Address, number>
  inputTokenDecimals: number
  tokenDecimals: Record<Address, number>
}): ImpactMeasurement {
  let totalCostUsd = 0
  let totalReferenceUsd = 0
  let totalImpactWeightedUsd = 0
  let unreferencedCostUsd = 0
  const impacts: Record<Address, number> = {}
  const tokensWithoutReference: Address[] = []

  for (const [rawAddress, alloc] of Object.entries(allocation)) {
    if (alloc.fromSwap <= 0n) continue
    const address = rawAddress.toLowerCase() as Address

    const quote = getQuoteResultForAddress(quotes, address)
    if (!quote || !quote.success) continue

    const sellAmount = BigInt(quote.data.quote.sellAmount)
    const sellUsd = Number(formatUnits(sellAmount, inputTokenDecimals))
    totalCostUsd += sellUsd

    const price = referencePrices[address] ?? 0
    const dec = tokenDecimals[address] ?? 18

    if (price <= 0 || !isFinite(price)) {
      unreferencedCostUsd += sellUsd
      tokensWithoutReference.push(address)
      continue
    }

    const requiredUnits = Number(formatUnits(alloc.fromSwap, dec))
    const referenceUsd = requiredUnits * price
    if (referenceUsd <= 0 || !isFinite(referenceUsd)) {
      unreferencedCostUsd += sellUsd
      tokensWithoutReference.push(address)
      continue
    }

    const impact = (sellUsd - referenceUsd) / referenceUsd
    impacts[address] = impact
    totalReferenceUsd += referenceUsd
    totalImpactWeightedUsd += referenceUsd * impact
  }

  return {
    totalCostUsd,
    totalReferenceUsd,
    totalImpactWeightedUsd,
    unreferencedCostUsd,
    impacts,
    tokensWithoutReference,
  }
}

// Solves the quadratic cost model
//   cost(r) = r · (totalReferenceUsd + unreferencedCostUsd) + r² · totalImpactWeightedUsd
// for r = S_new / S_prev such that cost(r) = targetBudgetUsd. Returns the new
// shares as bigint. Returns 0n if inputs are degenerate (caller decides what to do).
//
// The model assumes per-token impact scales linearly with size for referenced
// tokens, and that unreferenced tokens scale linearly with no impact change.
// Both are approximations — the greedy clamp downstream guarantees feasibility.
export function predictShrinkageTarget({
  prevShares,
  totalReferenceUsd,
  totalImpactWeightedUsd,
  unreferencedCostUsd,
  targetBudgetUsd,
}: {
  prevShares: bigint
  totalReferenceUsd: number
  totalImpactWeightedUsd: number
  unreferencedCostUsd: number
  targetBudgetUsd: number
}): bigint {
  if (prevShares <= 0n) return 0n
  if (!isFinite(targetBudgetUsd) || targetBudgetUsd <= 0) return 0n

  const b = totalReferenceUsd + unreferencedCostUsd
  if (!isFinite(b) || b <= 0) return 0n

  const a = totalImpactWeightedUsd
  if (!isFinite(a)) return 0n

  let r: number
  // Linear fallback when impact contribution is negligible (or non-positive).
  // The greedy clamp will still cap the result, so a slight over-prediction is fine.
  if (Math.abs(a) < 1e-9) {
    r = targetBudgetUsd / b
  } else {
    const discriminant = b * b + 4 * a * targetBudgetUsd
    if (!isFinite(discriminant) || discriminant < 0) return 0n
    const root = (-b + Math.sqrt(discriminant)) / (2 * a)
    if (!isFinite(root) || root <= 0) return 0n
    r = root
  }

  const prevSharesFloat = Number(formatEther(prevShares))
  if (!isFinite(prevSharesFloat) || prevSharesFloat <= 0) return 0n
  const nextSharesFloat = r * prevSharesFloat
  if (!isFinite(nextSharesFloat) || nextSharesFloat <= 0) return 0n

  return safeParseEther(nextSharesFloat.toFixed(18))
}

// CoWSwap cost is convex in size, so the greedy linear scale
//   greedy = prevShares · (targetBudget / prevCost)
// is always feasible. We clamp the quadratic prediction by it to guard against
// model error pushing us back over budget.
export function applyGreedyClamp({
  predicted,
  prevShares,
  prevCostUsd,
  targetBudgetUsd,
}: {
  predicted: bigint
  prevShares: bigint
  prevCostUsd: number
  targetBudgetUsd: number
}): bigint {
  if (prevShares <= 0n) return 0n
  if (!isFinite(prevCostUsd) || prevCostUsd <= 0) return 0n
  if (!isFinite(targetBudgetUsd) || targetBudgetUsd <= 0) return 0n

  const prevSharesFloat = Number(formatEther(prevShares))
  if (!isFinite(prevSharesFloat) || prevSharesFloat <= 0) return 0n

  const greedyFloat = (prevSharesFloat * targetBudgetUsd) / prevCostUsd
  if (!isFinite(greedyFloat) || greedyFloat <= 0) return 0n

  const greedy = safeParseEther(greedyFloat.toFixed(18))
  return predicted > 0n && predicted < greedy ? predicted : greedy
}

export type ConvergenceResult = {
  feasible: boolean
  converged: boolean
  utilization: number
  marginalDelta: number
}

export function detectConvergence({
  costUsd,
  adjustedBudgetUsd,
  prevShares,
  newShares,
  minUtilization,
  marginalThreshold,
}: {
  costUsd: number
  adjustedBudgetUsd: number
  prevShares: bigint
  newShares: bigint
  minUtilization: number
  marginalThreshold: number
}): ConvergenceResult {
  const feasible =
    adjustedBudgetUsd > 0 ? costUsd <= adjustedBudgetUsd : false
  const utilization =
    adjustedBudgetUsd > 0 && isFinite(costUsd) ? costUsd / adjustedBudgetUsd : 0

  let marginalDelta = 0
  if (newShares > 0n) {
    const prev = Number(formatEther(prevShares))
    const next = Number(formatEther(newShares))
    if (isFinite(prev) && isFinite(next) && next > 0) {
      marginalDelta = Math.abs(next - prev) / next
    }
  }

  const converged =
    feasible &&
    (utilization >= minUtilization || marginalDelta < marginalThreshold)

  return { feasible, converged, utilization, marginalDelta }
}

export type QuotedCostSummary = {
  totalBaseUnits: bigint
  allSucceeded: boolean
  failedAddresses: Address[]
  requiredAddresses: Address[]
}

export function sumQuotedCostBaseUnits({
  quotes,
  allocation,
}: {
  quotes: Record<Address, QuoteResult>
  allocation: Record<Address, CollateralAllocation>
}): QuotedCostSummary {
  let totalBaseUnits = 0n
  const failedAddresses: Address[] = []
  const requiredAddresses: Address[] = []

  for (const [rawAddress, alloc] of Object.entries(allocation)) {
    if (alloc.fromSwap <= 0n) continue
    const address = rawAddress.toLowerCase() as Address
    requiredAddresses.push(address)

    const quote = getQuoteResultForAddress(quotes, address)
    if (quote?.success) {
      totalBaseUnits += BigInt(quote.data.quote.sellAmount)
    } else {
      failedAddresses.push(address)
    }
  }

  return {
    totalBaseUnits,
    allSucceeded: failedAddresses.length === 0 && requiredAddresses.length > 0,
    failedAddresses,
    requiredAddresses,
  }
}

export function getRequiredQuoteStatus({
  allocation,
  quotes,
}: {
  allocation: Record<Address, CollateralAllocation>
  quotes: Record<Address, QuoteResult>
}) {
  const requiredAddresses = Object.entries(allocation)
    .filter(([_, item]) => item.fromSwap > 0n)
    .map(([address]) => address.toLowerCase() as Address)

  const successfulQuotes: { address: Address; quote: SuccessfulQuote }[] = []
  const missingAddresses: Address[] = []

  for (const address of requiredAddresses) {
    const quote = getQuoteResultForAddress(quotes, address)

    if (quote?.success) {
      successfulQuotes.push({ address, quote })
    } else {
      missingAddresses.push(address)
    }
  }

  return {
    requiredAddresses,
    successfulQuotes,
    missingAddresses,
    requiredCount: requiredAddresses.length,
    successfulCount: successfulQuotes.length,
    allReady: missingAddresses.length === 0,
  }
}
