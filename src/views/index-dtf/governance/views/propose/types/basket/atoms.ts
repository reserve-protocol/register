import dtfIndexAbi from '@/abis/dtf-index-abi'
import { getTrades } from '@/lib/index-rebalance/get-trades'
import { Token } from '@/types'
import { atom, Getter } from 'jotai'
import { Address, encodeFunctionData, Hex, parseUnits } from 'viem'

export type Step = 'basket' | 'prices' | 'expiration' | 'confirmation'
export const isProposalConfirmedAtom = atom(false)

export const stepAtom = atom<Step>('basket')

// Loaded from basket and modified when asset is added/removed
export interface IndexAssetShares {
  token: Token
  balance: bigint
  currentShares: string
}

export const dtfSupplyAtom = atom<bigint>(0n)

// Editable shares
export const proposedSharesAtom = atom<Record<string, string>>({})

export const proposedIndexBasketAtom = atom<
  Record<string, IndexAssetShares> | undefined
>(undefined)

// Map token address to price
export const priceMapAtom = atom<Record<string, number>>({})

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
      if (!priceMap[token.token.address]) {
        invalidAsset = true
        return acc
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
    isValid: Math.abs(currentAllocation - 100) <= 0.001,
  }
})

export const isProposedBasketValidAtom = atom((get) => {
  const { isValid } = get(proposedIndexBasketStateAtom)
  return isValid
})

// Get proposed trades from algo if the target basket is valid
export const proposedInxexTradesAtom = atom((get) => {
  return getProposedTrades(get, false)
})

// Volatility of proposed trades, array index is the trade index
export const tradeVolatilityAtom = atom<number[]>([])

type TradeRangeOption = 'defer' | 'include'

export const tradeRangeOptionAtom = atom<TradeRangeOption | undefined>(
  undefined
)

export const permissionlessLaunchingAtom = atom<number | undefined>(undefined)

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

export const basketProposalCalldatasAtom = atom<Hex[] | undefined>((get) => {
  const deferredTrades = get(proposedInxexTradesAtom)
  const tradeRangeOption = get(tradeRangeOptionAtom)
  const isConfirmed = get(isProposalConfirmedAtom)

  if (!deferredTrades?.length || !isConfirmed || !tradeRangeOption)
    return undefined

  const trades =
    tradeRangeOption === 'defer' ? deferredTrades : getProposedTrades(get, true)

  return trades.map((trade, i) => {
    return encodeFunctionData({
      abi: dtfIndexAbi,
      functionName: 'approveTrade',
      args: [
        BigInt(i), // TODO: will be removed
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
        0n, // TODO: TTL
      ],
    })
  })
})

const VOLATILITY_VALUES = [0.1, 0.2, 0.5]

// TODO: This re-run when volatility changes which is not optimal
// TODO: Decouple into an external function so its called only when needed!
function getProposedTrades(get: Getter, deferred = false) {
  const proposedBasket = get(proposedIndexBasketAtom)
  const proposedShares = get(proposedSharesAtom)
  const priceMap = get(priceMapAtom)
  const isValid = get(isProposedBasketValidAtom)
  const volatility = get(tradeVolatilityAtom)
  const supply = get(dtfSupplyAtom)

  if (!isValid || !proposedBasket) return []

  const tokens: string[] = []
  const decimals: bigint[] = []
  const bals: bigint[] = []
  const targetBasket: bigint[] = []
  const prices: number[] = []
  const error: number[] = []

  let index = 0

  for (const asset of Object.keys(proposedBasket)) {
    tokens.push(asset)
    bals.push(proposedBasket[asset].balance)
    decimals.push(BigInt(proposedBasket[asset].token.decimals))
    targetBasket.push(parseUnits(proposedShares[asset], 16))
    prices.push(priceMap[asset])
    // TODO: assume trades always have the same order...
    error.push(deferred ? 1 : VOLATILITY_VALUES[volatility[index]] || 0.1)
    index++
  }

  console.log(
    '--------------------------------------------------------------------------------'
  )
  console.log('tokens', tokens)
  console.log('decimals', decimals)
  console.log('bals', bals)
  console.log('targetBasket', targetBasket)
  console.log('prices', prices)
  console.log('error', error)
  console.log(
    '--------------------------------------------------------------------------------'
  )
  return getTrades(supply, tokens, decimals, bals, targetBasket, prices, error)
}
