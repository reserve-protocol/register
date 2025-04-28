import dtfIndexAbi from '@/abis/dtf-index-abi'
import dtfIndexAbiV2 from '@/abis/dtf-index-abi-v2'
import { getAuctions } from '@/lib/index-rebalance/get-auctions'
import { getCurrentBasket } from '@/lib/index-rebalance/utils'
import {
  indexDTFAtom,
  indexDTFBrandAtom,
  indexDTFVersionAtom,
  iTokenAddressAtom,
} from '@/state/dtf/atoms'
import { Token } from '@/types'
import { atom, Getter } from 'jotai'
import { Address, encodeFunctionData, formatUnits, Hex, parseUnits } from 'viem'

export type Step = 'basket' | 'prices' | 'expiration' | 'confirmation'
export type TradeRangeOption = 'defer' | 'include'
export const isProposalConfirmedAtom = atom(false)

export const stepAtom = atom<Step>('basket')

export const tradeRangeOptionAtom = atom<TradeRangeOption | undefined>(
  undefined
)

export const permissionlessLaunchingAtom = atom<number | undefined>(undefined)

// Loaded from basket and modified when asset is added/removed
export interface IndexAssetShares {
  token: Token
  currentShares: string
  currentUnits: string
}

export const proposedIndexBasketAtom = atom<
  Record<string, IndexAssetShares> | undefined
>(undefined)

// Map token address to price
export const priceMapAtom = atom<Record<string, number>>({})

export const dtfSupplyAtom = atom<bigint>(0n)
export const dtfTradeDelay = atom<bigint>(0n)
export const permissionlessLaunchingWindowAtom = atom('24')
export const customPermissionlessLaunchingWindowAtom = atom('')

// Editable shares
export const proposedSharesAtom = atom<Record<string, string>>({})
export const proposedUnitsAtom = atom<Record<string, string>>({})

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

export const isUnitBasketAtom = atom((get) => {
  const brandData = get(indexDTFBrandAtom)

  return brandData?.dtf.basketType === 'unit-based'
})

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

// Get proposed trades from algo if the target basket is valid
export const proposedIndexTradesAtom = atom((get) => {
  return getProposedTrades(get, true)
})

// Volatility of proposed trades, array index is the trade index
export const tradeVolatilityAtom = atom<number[]>([])

export const stepStateAtom = atom<Record<Step, boolean>>((get) => ({
  basket: get(isProposedBasketValidAtom),
  prices: get(tradeRangeOptionAtom) !== undefined,
  expiration: get(permissionlessLaunchingAtom) !== undefined,
  confirmation: true,
}))

export const isBasketProposalValidAtom = atom((get) =>
  Object.values(get(stepStateAtom)).every((value) => value)
)

export const proposalDescriptionAtom = atom<string | undefined>(undefined)

export const ttlATom = atom((get) => {
  const tradeDelay = get(dtfTradeDelay)
  const permissionlessLaunching = get(permissionlessLaunchingAtom)
  const permissionlessLaunchingWindow = get(permissionlessLaunchingWindowAtom)
  const customPermissionlessLaunchingWindow = get(
    customPermissionlessLaunchingWindowAtom
  )

  // Is different than undefined and 0
  if (!permissionlessLaunching) {
    return tradeDelay > 0n ? tradeDelay - 1n : tradeDelay
  }

  const window =
    Number(
      customPermissionlessLaunchingWindow
        ? customPermissionlessLaunchingWindow
        : permissionlessLaunchingWindow
    ) *
    60 *
    60

  return isNaN(window) ? tradeDelay : tradeDelay + BigInt(Math.round(window))
})

export const basketProposalCalldatasAtom = atom<Hex[] | undefined>((get) => {
  const deferredTrades = get(proposedIndexTradesAtom)
  const tradeRangeOption = get(tradeRangeOptionAtom)
  const isConfirmed = get(isProposalConfirmedAtom)
  const version = get(indexDTFVersionAtom)
  const ttl = get(ttlATom)

  if (!deferredTrades?.length || !isConfirmed || !tradeRangeOption)
    return undefined

  const trades =
    tradeRangeOption === 'defer' ? deferredTrades : getProposedTrades(get)

  return trades.map((trade, i) => {
    const args = [
      trade.sell as Address,
      trade.buy as Address,
      {
        spot: trade.sellLimit.spot,
        low: trade.sellLimit.low,
        high: trade.sellLimit.high,
      },
      {
        spot: trade.buyLimit.spot,
        low: trade.buyLimit.low,
        high: trade.buyLimit.high,
      },
      {
        start: trade.prices.start,
        end: trade.prices.end,
      },
      ttl,
    ]

    if (version !== '1.0.0') {
      args.push(10n)
    }

    return encodeFunctionData({
      abi: version === '1.0.0' ? dtfIndexAbi : dtfIndexAbiV2,
      functionName: 'approveAuction',
      args: args as any,
    })
  })
})

const VOLATILITY_VALUES = [0.1, 0.2, 0.5]

// TODO: This re-run when volatility changes which is not optimal
// TODO: Decouple into an external function so its called only when needed!
function getProposedTrades(get: Getter, deferred = false) {
  const proposedBasket = get(proposedIndexBasketAtom)
  const proposedShares = get(proposedSharesAtom)
  const derivedProposedShares = get(derivedProposedSharesAtom)
  const priceMap = get(priceMapAtom)
  const isValid = get(isProposedBasketValidAtom)
  const isUnitBasket = get(isUnitBasketAtom)
  const volatility = get(tradeVolatilityAtom)
  const supply = get(dtfSupplyAtom)
  const dtfAddress = get(iTokenAddressAtom)
  const dtfPrice = priceMap[dtfAddress?.toLowerCase() || '']

  if (
    !isValid ||
    !proposedBasket ||
    !dtfAddress ||
    !dtfPrice ||
    (isUnitBasket && !derivedProposedShares)
  )
    return []

  const tokens: string[] = []
  const decimals: bigint[] = []
  const currentBasket: bigint[] = []
  const targetBasket: bigint[] = []
  const prices: number[] = []
  const error: number[] = []

  const decimalsStr: string[] = []
  const currentBasketStr: string[] = []
  const targetBasketStr: string[] = []

  let index = 0

  for (const asset of Object.keys(proposedBasket)) {
    tokens.push(asset)
    decimals.push(BigInt(proposedBasket[asset].token.decimals))
    decimalsStr.push(proposedBasket[asset].token.decimals.toString())
    currentBasket.push(parseUnits(proposedBasket[asset].currentShares, 16))
    currentBasketStr.push(proposedBasket[asset].currentShares)

    if (isUnitBasket && derivedProposedShares) {
      targetBasket.push(derivedProposedShares[asset])
      targetBasketStr.push(formatUnits(derivedProposedShares[asset], 16))
    } else {
      targetBasket.push(parseUnits(proposedShares[asset], 16))
      targetBasketStr.push(proposedShares[asset])
    }

    prices.push(priceMap[asset] ?? 0)

    // TODO: assume trades always have the same order...
    error.push(deferred ? 1 : VOLATILITY_VALUES[volatility[index] || 0] || 0.1)

    index++
  }

  return getAuctions(
    supply,
    tokens,
    decimals,
    currentBasket,
    targetBasket,
    prices,
    error,
    dtfPrice
  )
}

export const isDeferAvailableAtom = atom((get) => {
  const dtf = get(indexDTFAtom)

  if (!dtf) return true

  return dtf.auctionDelay > 10
})

export const advancedControlsAtom = atom(false)
