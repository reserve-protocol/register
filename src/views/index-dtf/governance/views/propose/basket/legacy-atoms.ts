import dtfIndexAbi from '@/abis/dtf-index-abi'
import dtfIndexAbiV2 from '@/abis/dtf-index-abi-v2'
import { getAuctions } from '@/lib/index-rebalance/get-auctions'
import {
  indexDTFAtom,
  indexDTFVersionAtom,
  iTokenAddressAtom,
} from '@/state/dtf/atoms'
import { atom, Getter } from 'jotai'
import { Address, encodeFunctionData, formatUnits, Hex, parseUnits } from 'viem'
import {
  customPermissionlessLaunchingWindowAtom,
  derivedProposedSharesAtom,
  dtfSupplyAtom,
  isProposalConfirmedAtom,
  isProposedBasketValidAtom,
  isUnitBasketAtom,
  permissionlessLaunchingAtom,
  permissionlessLaunchingWindowAtom,
  priceMapAtom,
  proposedIndexBasketAtom,
  proposedSharesAtom,
  tradeRangeOptionAtom,
} from './atoms'

// ############################################################
// LEGACYYYYY for 1.0/2.0 basket proposals
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
