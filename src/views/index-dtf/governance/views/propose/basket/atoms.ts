import { getCurrentBasket } from '@/lib/index-rebalance/utils'
import { indexDTFBrandAtom } from '@/state/dtf/atoms'
import { Token } from '@/types'
import { atom } from 'jotai'
import { parseUnits } from 'viem'

export type Step = 'basket' | 'prices' | 'expiration' | 'confirmation'
export type TradeRangeOption = 'defer' | 'include'
export interface IndexAssetShares {
  token: Token
  currentShares: string
  currentUnits: string
}

// ############################################################
// Required DTF state for calculations
// ############################################################
export const priceMapAtom = atom<Record<string, number>>({})
export const dtfSupplyAtom = atom<bigint>(0n)

// ############################################################
// Proposal state
// ############################################################
export const isProposalConfirmedAtom = atom(false)
export const proposalDescriptionAtom = atom<string | undefined>(undefined)

// ############################################################
// Proposal basket setup
// ############################################################

// UI Accordion controls
export const stepAtom = atom<Step>('basket')
export const advancedControlsAtom = atom(false)

// Auction price setting (advanced controls)
export const tradeRangeOptionAtom = atom<TradeRangeOption>('defer')

// Permissionless launching (advanced controls)
export const permissionlessLaunchingAtom = atom<number | undefined>(undefined)
export const permissionlessLaunchingWindowAtom = atom('24')
export const customPermissionlessLaunchingWindowAtom = atom('')

// Auction launcher window (advanced controls) 4.0 only
export const auctionLauncherWindowAtom = atom('24')
export const customAuctionLauncherWindowAtom = atom('')

// Proposed basket
export const proposedIndexBasketAtom = atom<
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
  const proposedBasket = get(proposedIndexBasketAtom)
  const proposedShares = get(proposedSharesAtom)
  const priceMap = get(priceMapAtom)
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

// TODO: This comes from the DTF on 4.0 not from the brand manager
export const isUnitBasketAtom = atom((get) => {
  const brandData = get(indexDTFBrandAtom)

  return brandData?.dtf.basketType === 'unit-based'
})

// For 2.0 unit basket requires moving to shares for the proposal, no longer required for 4.00
export const derivedProposedSharesAtom = atom((get) => {
  try {
    const proposedUnits = get(proposedUnitsAtom)
    const proposedIndexBasket = get(proposedIndexBasketAtom)
    const priceMap = get(priceMapAtom)

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

// ############################################################
// Basket validation
// ############################################################
export const isUnitBasketValidAtom = atom((get) => {
  const derivedProposedShares = get(derivedProposedSharesAtom)
  const basket = get(proposedIndexBasketAtom)

  if (!derivedProposedShares || !basket) return false

  // Validate that the new percents are different than the old ones
  const isDifferent = Object.keys(derivedProposedShares).some(
    (token) =>
      derivedProposedShares[token] !==
      parseUnits(basket[token].currentShares, 16)
  )

  return isDifferent
})

export const isProposedBasketValidAtom = atom((get) => {
  const { isValid } = get(proposedIndexBasketStateAtom)
  const isUnitBasketValid = get(isUnitBasketValidAtom)
  const isUnitBasket = get(isUnitBasketAtom)

  return isUnitBasket ? isUnitBasketValid : isValid
})

export const stepStateAtom = atom<Record<Step, boolean>>((get) => ({
  basket: get(isProposedBasketValidAtom),
  prices: get(tradeRangeOptionAtom) !== undefined,
  expiration: get(permissionlessLaunchingAtom) !== undefined,
  confirmation: true,
}))

export const isBasketProposalValidAtom = atom((get) =>
  Object.values(get(stepStateAtom)).every((value) => value)
)
