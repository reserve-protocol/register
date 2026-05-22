import { Address, formatUnits } from 'viem'
import { safeParseEther } from '@/utils'
import { CollateralAllocation, MintStrategy } from './types'

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
