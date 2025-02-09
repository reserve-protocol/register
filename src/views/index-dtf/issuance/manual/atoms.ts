import { indexDTFAtom, indexDTFPriceAtom } from '@/state/dtf/atoms'
import { safeParseEther } from '@/utils'
import { atom } from 'jotai'
import { _atomWithDebounce } from 'utils/atoms/atomWithDebounce'
import { parseEther } from 'viem'

export const modeAtom = atom<'buy' | 'sell'>('buy')
export const amountAtom = _atomWithDebounce('')
export const assetDistributionAtom = atom<Record<string, bigint>>({})
export const balanceMapAtom = atom<Record<string, bigint>>({})

export const maxRedeemAmountAtom = atom((get) => {
  const indexDTF = get(indexDTFAtom)
  const balanceMap = get(balanceMapAtom)

  return balanceMap[indexDTF?.id ?? ''] ?? 0n
})

export const allowanceMapAtom = atom<Record<string, bigint>>({})

export const assetAmountsMapAtom = atom((get) => {
  const amount = get(amountAtom.currentValueAtom)
  const assetDistribution = get(assetDistributionAtom)

  if (!amount || isNaN(Number(amount))) {
    return {}
  }

  const amountValue = safeParseEther(amount)
  const assetAmounts: Record<string, bigint> = {}

  // Calculate required amount for each asset based on distribution
  for (const asset in assetDistribution) {
    const requiredAmount = assetDistribution[asset]
    assetAmounts[asset] = (requiredAmount * amountValue) / parseEther('1')
  }

  return assetAmounts
})

export const maxMintAmountAtom = atom((get) => {
  const indexDTF = get(indexDTFAtom)
  const assetDistribution = get(assetDistributionAtom)
  const balanceMap = get(balanceMapAtom)

  if (
    !indexDTF ||
    !Object.keys(assetDistribution).length ||
    !Object.keys(balanceMap).length
  ) {
    return 0n
  }

  // Initialize max amount as undefined
  let maxAmount: bigint | undefined

  // Iterate through each asset in the distribution
  for (const asset in assetDistribution) {
    // Skip if asset doesn't exist in balance map
    if (!balanceMap[asset]) {
      return 0n
    }

    // Calculate possible mint amount for this asset
    const requiredAmount = assetDistribution[asset]
    const currentBalance = balanceMap[asset]
    const possibleAmount = currentBalance / requiredAmount

    // Update max amount if this is the limiting factor
    if (maxAmount === undefined || possibleAmount < maxAmount) {
      maxAmount = possibleAmount
    }
  }

  // Return 0 if no assets were processed
  return maxAmount ?? 0n
})

export const maxAmountAtom = atom((get) => {
  const mode = get(modeAtom)
  const maxMintAmount = get(maxMintAmountAtom)
  const maxRedeemAmount = get(maxRedeemAmountAtom)

  return mode === 'buy' ? maxMintAmount : maxRedeemAmount
})

export const usdAmountAtom = atom((get) => {
  const amount = get(amountAtom.currentValueAtom)
  const price = get(indexDTFPriceAtom)

  if (isNaN(Number(amount)) || !price) {
    return 0
  }

  return price * Number(amount)
})
