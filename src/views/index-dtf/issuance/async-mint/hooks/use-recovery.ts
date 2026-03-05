import { Address, formatUnits } from 'viem'

// ─── Pure functions for testability ───────────────────────────────────

/**
 * Check if acquired collateral is sufficient to mint the target amount.
 * Used to distinguish Level 1 (simple retry) from Level 2 (decision needed).
 */
export function checkMintFeasibility(
  acquiredBalances: Record<Address, bigint>,
  targetMintValues: bigint[],
  assets: Address[]
): boolean {
  if (assets.length === 0 || targetMintValues.length === 0) return false

  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i]
    const required = targetMintValues[i]
    const acquired = acquiredBalances[asset.toLowerCase() as Address] ?? 0n

    // If any token is short, can't mint target amount
    if (acquired < required) {
      return false
    }
  }
  return true
}

/**
 * Calculate how much extra USDC is needed to mint the full original amount.
 */
export function calculateTopUp(
  totalNeeded: number,
  totalAcquired: number
): { topUpAmount: number; description: string } {
  const shortfall = Math.max(0, totalNeeded - totalAcquired)
  return {
    topUpAmount: shortfall,
    description: `Approve an additional $${shortfall.toFixed(2)} USDC`,
  }
}

/**
 * Calculate the max DTF mintable from only the acquired collateral.
 * Uses the same logic as mint-button.tsx: min((balance * folioAmount) / mintValue) across all tokens.
 */
export function calculateReducedMint({
  acquiredBalances,
  assets,
  mintValues,
  folioAmount,
  dtfPrice,
  slippageBps,
}: {
  acquiredBalances: Record<Address, bigint>
  assets: Address[]
  mintValues: bigint[]
  folioAmount: bigint
  dtfPrice: number
  slippageBps: number
}): {
  reducedShares: bigint
  unusedCollateral: Record<Address, bigint>
  swapLossEstimate: number
} {
  if (assets.length === 0 || folioAmount === 0n) {
    return { reducedShares: 0n, unusedCollateral: {}, swapLossEstimate: 0 }
  }

  // For each token, calculate how many folio tokens we can mint based on acquired balance
  const mintableAmounts: bigint[] = []
  for (let i = 0; i < assets.length; i++) {
    const balance =
      acquiredBalances[assets[i].toLowerCase() as Address] ?? 0n
    const mintValue = mintValues[i]
    if (mintValue === 0n) {
      mintableAmounts.push(0n)
      continue
    }
    mintableAmounts.push((balance * folioAmount) / mintValue)
  }

  // Take the minimum (bottleneck token) — only tokens with mintValue > 0n participate
  const participatingAmounts = mintableAmounts.filter((_, i) => mintValues[i] > 0n)
  const reducedShares = participatingAmounts.length > 0
    ? participatingAmounts.reduce((min, amount) => (amount < min ? amount : min))
    : 0n

  // Calculate unused collateral per token
  const unusedCollateral: Record<Address, bigint> = {}
  for (let i = 0; i < assets.length; i++) {
    const balance =
      acquiredBalances[assets[i].toLowerCase() as Address] ?? 0n
    const usedForMint =
      mintValues[i] > 0n ? (reducedShares * mintValues[i]) / folioAmount : 0n
    const unused = balance - usedForMint
    if (unused > 0n) {
      unusedCollateral[assets[i]] = unused
    }
  }

  // Estimate swap loss for selling unused collateral back
  const slippageMultiplier = 1 - slippageBps / 10000
  const swapLossEstimate = (1 - slippageMultiplier) * 100

  return { reducedShares, unusedCollateral, swapLossEstimate }
}

/**
 * Estimate return from selling acquired collateral back to USDC.
 */
export function calculateReversalEstimate(
  acquiredCollateral: Record<Address, bigint>,
  prices: Record<Address, number>,
  decimals: Record<Address, number>,
  slippageBps: number
): { estimatedReturn: number; loss: number } {
  const slippageMultiplier = 1 - slippageBps / 10000
  let totalBeforeSlippage = 0

  for (const [address, amount] of Object.entries(acquiredCollateral)) {
    const price = prices[address.toLowerCase() as Address] ?? 0
    const dec = decimals[address.toLowerCase() as Address] ?? 18
    totalBeforeSlippage += Number(formatUnits(amount, dec)) * price
  }

  const estimatedReturn = totalBeforeSlippage * slippageMultiplier

  return {
    estimatedReturn,
    loss: totalBeforeSlippage - estimatedReturn,
  }
}
