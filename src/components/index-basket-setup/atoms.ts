import { getCurrentBasket } from '@/lib/index-rebalance/utils'
import { Token } from '@/types'
import { atom } from 'jotai'
import { parseUnits } from 'viem'

export interface IndexAssetShares {
  token: Token
  currentShares: string
  currentUnits: string
}

export const basketPriceMapAtom = atom<Record<string, number>>({})

export const indexBasketAtom = atom<
  Record<string, IndexAssetShares> | undefined
>(undefined)

// Basket form controls
export const proposedSharesAtom = atom<Record<string, string>>({})
export const proposedUnitsAtom = atom<Record<string, string>>({})

// Computed state for proposed basket
export const proposedIndexBasketStateAtom = atom<{
  changed: boolean
  remainingAllocation: number
  isValid: boolean
}>((get) => {
  const proposedBasket = get(indexBasketAtom)
  const proposedShares = get(proposedSharesAtom)
  const priceMap = get(basketPriceMapAtom)
  const defaultState = {
    changed: false,
    remainingAllocation: 0,
    isValid: false,
  }

  // Return default state if no basket
  if (!proposedBasket) return defaultState

  // Calculate total allocation and check for changes
  const initialState = {
    changed: false,
    currentAllocation: 0,
  }

  // Move to true if any asset don't have a price
  let invalidAsset = false

  const { changed, currentAllocation } = Object.values(proposedBasket).reduce(
    (acc, token) => {
      if (!priceMap[token.token.address.toLowerCase()]) {
        invalidAsset = true
      }
      return {
        changed:
          acc.changed ||
          token.currentShares !== proposedShares[token.token.address],
        currentAllocation:
          acc.currentAllocation + Number(proposedShares[token.token.address]),
      }
    },
    initialState
  )

  // Return early if no changes
  if (!changed) return defaultState

  // Calculate remaining allocation and validity
  return {
    changed,
    remainingAllocation: 100 - currentAllocation,
    isValid: Math.abs(currentAllocation - 100) <= 0.001 && !invalidAsset,
  }
})

export const derivedProposedSharesAtom = atom((get) => {
  try {
    const proposedUnits = get(proposedUnitsAtom)
    const proposedIndexBasket = get(indexBasketAtom)
    const priceMap = get(basketPriceMapAtom)

    if (!proposedIndexBasket || !priceMap) return undefined

    // Check if any of the proposed units are different than the current units on the basket
    const isDifferent = Object.keys(proposedUnits).some(
      (token) =>
        proposedUnits[token] !== proposedIndexBasket[token].currentUnits
    )

    if (!isDifferent) return undefined

    const keys = Object.keys(proposedUnits)
    const bals: bigint[] = []
    const decimals: bigint[] = []
    const prices: number[] = []

    for (const asset of keys) {
      const d = proposedIndexBasket[asset].token.decimals || 18
      bals.push(parseUnits(proposedUnits[asset], d))
      decimals.push(BigInt(d))
      prices.push(priceMap[asset] || 0)
    }

    const targetBasket = getCurrentBasket(bals, decimals, prices)

    return keys.reduce(
      (acc, token, index) => {
        acc[token] = targetBasket[index]
        return acc
      },
      {} as Record<string, bigint>
    )
  } catch (e) {
    return undefined
  }
})
