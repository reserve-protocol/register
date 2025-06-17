import dtfIndexAbi from '@/abis/dtf-index-abi'
import dtfIndexAbiV2 from '@/abis/dtf-index-abi-v2'
import dtfIndexAbiV4 from '@/abis/dtf-index-abi-v4'
import { getStartRebalance } from '@reserve-protocol/dtf-rebalance-lib'
import { getAuctions } from '@/lib/index-rebalance/get-auctions'
import { getCurrentBasket } from '@/lib/index-rebalance/utils'
import {
  indexDTFAtom,
  indexDTFBrandAtom,
  indexDTFPriceAtom,
  indexDTFRebalanceControlAtom,
  indexDTFVersionAtom,
  isSingletonRebalanceAtom,
  iTokenAddressAtom,
} from '@/state/dtf/atoms'
import { Token } from '@/types'
import { atom, Getter } from 'jotai'
import { Address, encodeFunctionData, Hex, parseUnits } from 'viem'

export type Step =
  | 'basket'
  | 'prices'
  | 'expiration'
  | 'confirmation'
  | 'advance'
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
export const dtfDistributionAtom = atom<Record<string, bigint> | undefined>(
  undefined
)

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

// Price volatility
export const priceVolatilityAtom = atom('Medium')

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
  const isSingleton = get(isSingletonRebalanceAtom)
  const dtfRebalanceControl = get(indexDTFRebalanceControlAtom)

  if (isSingleton) {
    return !dtfRebalanceControl?.weightControl
  }

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

// If it returns 0, it means the rebalance is not valid
export const rebalanceTTLAtom = atom<{
  ttl: number
  permissionlessWindow: number
  auctionLauncherWindow: number
}>((get) => {
  const permissionlessLaunching = get(permissionlessLaunchingAtom)
  const permissionlessLaunchingWindow = get(permissionlessLaunchingWindowAtom)
  const customPermissionlessLaunchingWindow = get(
    customPermissionlessLaunchingWindowAtom
  )
  const auctionLauncherSelectWindow = get(auctionLauncherWindowAtom)
  const customAuctionLauncherWindow = get(customAuctionLauncherWindowAtom)

  // Convert hours to seconds
  const getWindowInSeconds = (
    customValue: string,
    defaultValue: string | number
  ) => {
    const hours = customValue ? Number(customValue) : Number(defaultValue)
    return isNaN(hours) ? 0 : hours * 60 * 60
  }

  const permissionlessWindow = getWindowInSeconds(
    customPermissionlessLaunchingWindow,
    permissionlessLaunchingWindow
  )

  const auctionLauncherWindow = getWindowInSeconds(
    customAuctionLauncherWindow,
    auctionLauncherSelectWindow
  )

  if (!permissionlessLaunching) {
    return {
      ttl: auctionLauncherWindow,
      permissionlessWindow: 0,
      auctionLauncherWindow,
    }
  }

  // If either window is invalid, return 0
  if (permissionlessWindow === 0 || auctionLauncherWindow === 0)
    return {
      ttl: 0,
      permissionlessWindow: 0,
      auctionLauncherWindow: 0,
    }

  // Return the sum of both windows
  return {
    ttl: permissionlessWindow + auctionLauncherWindow,
    permissionlessWindow,
    auctionLauncherWindow,
  }
})

// ############################################################
// Basket validation
// ############################################################
const isTTLValidAtom = atom((get) => {
  const isDefined = get(permissionlessLaunchingAtom) !== undefined
  const isSingleton = get(isSingletonRebalanceAtom)
  const ttl = get(rebalanceTTLAtom).ttl

  if (isSingleton) {
    return ttl > 0
  }

  return isDefined
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

export const stepStateAtom = atom<Record<Step, boolean>>((get) => ({
  basket: get(isProposedBasketValidAtom),
  prices: get(tradeRangeOptionAtom) !== undefined,
  expiration: get(isTTLValidAtom),
  confirmation: true,
  advance: get(isTTLValidAtom),
}))

export const isBasketProposalValidAtom = atom((get) =>
  Object.values(get(stepStateAtom)).every((value) => value)
)

// ############################################################
// #
// # @deprecated - only required for 1.0/2.0 basket proposals
// #
// ############################################################
export const dtfTradeDelay = atom<bigint>(0n)

// Get proposed trades from algo if the target basket is valid
export const proposedIndexTradesAtom = atom((get) => {
  return getProposedTrades(get, true)
})

// Volatility of proposed trades, array index is the trade index
export const tradeVolatilityAtom = atom<number[]>([])

// TTL For auction launch
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

const VOLATILITY_VALUES = [0.15, 0.4, 0.8]

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

  let index = 0

  for (const asset of Object.keys(proposedBasket)) {
    tokens.push(asset)
    decimals.push(BigInt(proposedBasket[asset].token.decimals))
    currentBasket.push(parseUnits(proposedBasket[asset].currentShares, 16))

    if (isUnitBasket && derivedProposedShares) {
      targetBasket.push(derivedProposedShares[asset])
    } else {
      targetBasket.push(parseUnits(proposedShares[asset], 16))
    }

    prices.push(priceMap[asset] ?? 0)

    error.push(
      deferred
        ? VOLATILITY_VALUES[2]
        : VOLATILITY_VALUES[volatility[index] || 1] || 0.15
    )

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
    dtfPrice,
    3n * 10n ** 14n,
    deferred
  )
}

export const isDeferAvailableAtom = atom((get) => {
  const dtf = get(indexDTFAtom)
  const version = get(indexDTFVersionAtom)

  // 4.0+ always has defer available
  if (!dtf || version === '4.0.0') return true

  return dtf.auctionDelay > 10
})

export const legacyBasketProposalCalldatasAtom = atom<Hex[] | undefined>(
  (get) => {
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
  }
)

// ############################################################

const PRICE_VOLATILITY_OPTIONS: Record<string, number> = {
  Low: VOLATILITY_VALUES[0],
  Medium: VOLATILITY_VALUES[1],
  High: VOLATILITY_VALUES[2],
}

export const basketProposalCalldatasAtom = atom<Hex[] | undefined>((get) => {
  const isSingleton = get(isSingletonRebalanceAtom)

  // 1.0/2.0 basket proposals
  if (!isSingleton) {
    return get(legacyBasketProposalCalldatasAtom)
  }

  const isConfirmed = get(isProposalConfirmedAtom)
  const proposedBasket = get(proposedIndexBasketAtom)
  const isUnitBasket = get(isUnitBasketAtom)
  const derivedProposedShares = get(derivedProposedSharesAtom)
  const rebalanceControl = get(indexDTFRebalanceControlAtom)
  const dtfPrice = get(indexDTFPriceAtom)
  const dtfDistribution = get(dtfDistributionAtom)
  const ttl = get(rebalanceTTLAtom)
  const supply = get(dtfSupplyAtom)
  const proposedShares = get(proposedSharesAtom)
  const priceMap = get(priceMapAtom)
  const isDeferToAuctionLauncher = get(tradeRangeOptionAtom) === 'defer'
  const priceVolatility =
    PRICE_VOLATILITY_OPTIONS[
      isDeferToAuctionLauncher ? 'High' : get(priceVolatilityAtom)
    ] ?? PRICE_VOLATILITY_OPTIONS.Medium

  if (
    !isConfirmed ||
    !proposedBasket ||
    !rebalanceControl ||
    !dtfPrice ||
    !dtfDistribution ||
    (isUnitBasket && !derivedProposedShares)
  )
    return undefined

  const tokens: Address[] = []
  const decimals: bigint[] = []
  const currentBasket: bigint[] = []
  const targetBasket: bigint[] = []
  const _prices: number[] = []
  const error: number[] = []
  const folio: bigint[] = []

  let index = 0

  for (const asset of Object.keys(proposedBasket)) {
    tokens.push(asset as Address)
    decimals.push(BigInt(proposedBasket[asset].token.decimals))
    currentBasket.push(parseUnits(proposedBasket[asset].currentShares, 16))
    folio.push(dtfDistribution[asset])

    if (isUnitBasket && derivedProposedShares) {
      targetBasket.push(derivedProposedShares[asset])
    } else {
      targetBasket.push(parseUnits(proposedShares[asset], 16))
    }

    _prices.push(priceMap[asset] ?? 0)
    error.push(priceVolatility)

    index++
  }

  try {
    const { weights, prices, limits } = getStartRebalance(
      supply,
      tokens,
      folio,
      decimals,
      targetBasket,
      _prices,
      error,
      rebalanceControl?.weightControl
    )

    return [
      encodeFunctionData({
        abi: dtfIndexAbiV4,
        functionName: 'startRebalance',
        args: [
          tokens,
          weights,
          prices,
          limits,
          BigInt(ttl.auctionLauncherWindow),
          BigInt(ttl.ttl),
        ],
      }),
    ]
  } catch (e) {
    console.error('Error getting rebalance', e)
    return undefined
  }
})
