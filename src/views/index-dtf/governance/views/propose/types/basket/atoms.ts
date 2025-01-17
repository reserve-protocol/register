import { Token } from '@/types'
import { atom } from 'jotai'
import { ProposedTrade } from './utils/get-rebalance-trades'

export type Step = 'basket' | 'prices' | 'expiration' | 'confirmation'

export const stepAtom = atom<Step>('basket')

// Loaded from basket and modified when asset is added/removed
export interface IndexAssetShares {
  token: Token
  currentShares: string
}

// Editable shares
export const proposedSharesAtom = atom<Record<string, string>>({})

export const proposedIndexBasketAtom = atom<
  Record<string, IndexAssetShares> | undefined
>(undefined)

// Map token address to price
export const priceMapAtom = atom<Record<string, number>>({})

export const proposedIndexBasketStateAtom = atom<{
  changed: boolean
  remainingAllocation: string
  isValid: boolean
}>((get) => {
  const proposedBasket = get(proposedIndexBasketAtom)
  const proposedShares = get(proposedSharesAtom)
  const priceMap = get(priceMapAtom)
  const defaultState = {
    changed: false,
    remainingAllocation: '0',
    isValid: false,
  }

  // Return default state if no basket
  if (!proposedBasket) return defaultState

  // Calculate total allocation and check for changes
  const initialState = {
    changed: false,
    currentAllocation: 0n,
  }

  // Move to true if any asset don't have a price
  let invalidAsset = false

  const { changed, currentAllocation } = Object.values(proposedBasket).reduce(
    (acc, token) => {
      if (!priceMap[token.token.address]) {
        invalidAsset = true
        return acc
      }
      return {
        changed:
          acc.changed ||
          token.currentShares !== proposedShares[token.token.address],
        currentAllocation:
          acc.currentAllocation + BigInt(proposedShares[token.token.address]),
      }
    },
    initialState
  )

  // Return early if no changes
  if (!changed) return defaultState

  // Calculate remaining allocation and validity
  return {
    changed,
    remainingAllocation: (100n - currentAllocation).toString(),
    isValid: currentAllocation === 100n,
  }
})

export const isProposalValidAtom = atom((get) => {
  const { isValid } = get(proposedIndexBasketStateAtom)
  return isValid
})

// Get proposed trades from algo if the target basket is valid
export const proposedInxexTradesAtom = atom<ProposedTrade[]>((get) => {
  const proposedBasket = get(proposedIndexBasketAtom)
  const isValid = get(isProposalValidAtom)

  if (!isValid) return []

  return []

  // return getRebalanceTrades(
  //   Object.keys(proposedBasket),
  //   Object.values(proposedBasket).map((t) => BigInt(t.proposedShares)),
  //   targetBasket,
  //   prices,
  //   error,
  //   tolerance
  // )
})

// Volatility of proposed trades, array index is the trade index
export const tradeVolatilityAtom = atom<number[]>([])
