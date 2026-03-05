import { Address, formatUnits } from 'viem'
import { CollateralAllocation, MintStrategy } from './types'

// ─── Pure collateral allocation calculation ──────────────────────────
export function calculateCollateralAllocation({
  mintShares,
  assets,
  mintValues,
  balances,
  prices,
  decimals,
  selectedCollaterals,
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
  strategy: MintStrategy
  inputToken: { address: Address; decimals: number; symbol: string }
}): Record<Address, CollateralAllocation> {
  if (mintShares === 0n || assets.length === 0) return {}

  const result: Record<Address, CollateralAllocation> = {}

  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i]
    const required = mintValues[i]
    const walletBalance = balances[asset.toLowerCase() as Address] ?? 0n
    const isInputToken =
      asset.toLowerCase() === inputToken.address.toLowerCase()
    const isSelected =
      selectedCollaterals.has(asset) ||
      selectedCollaterals.has(asset.toLowerCase() as Address)
    const useWallet = strategy === 'partial' && isSelected && !isInputToken

    let fromWallet = 0n
    let fromSwap = required
    let explanation = 'Covering the remainder'

    if (useWallet && walletBalance > 0n) {
      if (walletBalance >= required) {
        fromWallet = required
        fromSwap = 0n
        explanation = 'Using your full balance'
      } else {
        fromWallet = walletBalance
        fromSwap = required - walletBalance
        explanation = 'Using your full balance'
      }

      // WHY: If wallet has more than required, it means the token is capped at its DTF weight
      if (walletBalance > required) {
        explanation = 'Token at its maximum weight'
      }
    }

    // Skip input token — it's the one we're spending, not acquiring
    if (isInputToken) {
      continue
    }

    // Estimate USD value for fromSwap portion
    const price = prices[asset.toLowerCase() as Address] ?? 0
    const dec = decimals[asset.toLowerCase() as Address] ?? 18
    const swapUsdValue =
      fromSwap > 0n && price > 0
        ? Number(formatUnits(fromSwap, dec)) * price
        : 0

    result[asset] = {
      fromWallet,
      fromSwap,
      usdValue: swapUsdValue,
      explanation,
    }
  }

  return result
}
