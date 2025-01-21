import dtfIndexAbi from '@/abis/dtf-index-abi'
import { getTrades } from '@/lib/index-rebalance/get-trades'
import { Token } from '@/types'
import { atom, Getter } from 'jotai'
import { Address, encodeFunctionData, Hex, parseEther, parseUnits } from 'viem'

const mockPrices = {
  '0xab36452dbac151be02b16ca17d8919826072f64a': 0.016, // RSR
  '0x940181a94a35a4569e4529a3cdfb74e38fd98631': 1.35, // AERO
  '0x0b3e328455c4059eeb9e3f84b5543f74e24e7e1b': 3.35, // virtual
  '0x532f27101965dd16442e59d40670faf5ebb142e4': 0.1326, // BRETT
  '0xa99f6e6785da0f5d6fb42495fe424bce029eeb3e': 4.37, // PENDLE
}

// 100k
const mockTVL = parseEther('100000')

// ~10k usd token value
// 40% RSR
// 20% Virtuals
// 10% BRETT
// 15% AERO
// 15% PENDLE
const mockProposedBasket: Record<string, IndexAssetShares> = {
  '0xab36452dbac151be02b16ca17d8919826072f64a': {
    token: {
      address: '0xab36452dbac151be02b16ca17d8919826072f64a',
      symbol: 'RSR',
      name: 'Reserve Rights',
      decimals: 18,
    },
    balance: parseEther('2500000'), // $40k worth at $0.016 per token
    currentShares: '40',
  },
  '0x0b3e328455c4059eeb9e3f84b5543f74e24e7e1b': {
    token: {
      address: '0x0b3e328455c4059eeb9e3f84b5543f74e24e7e1b',
      symbol: 'VIRTUAL',
      name: 'Virtual Token',
      decimals: 18,
    },
    balance: parseEther('5970.149253731343'), // $20k worth at $3.35 per token
    currentShares: '20',
  },
  '0x532f27101965dd16442e59d40670faf5ebb142e4': {
    token: {
      address: '0x532f27101965dd16442e59d40670faf5ebb142e4',
      symbol: 'BRETT',
      name: 'Brett Token',
      decimals: 18,
    },
    balance: parseEther('75414.781297134238'), // $10k worth at $0.1326 per token
    currentShares: '10',
  },
  '0x940181a94a35a4569e4529a3cdfb74e38fd98631': {
    token: {
      address: '0x940181a94a35a4569e4529a3cdfb74e38fd98631',
      symbol: 'AERO',
      name: 'Aerodrome',
      decimals: 18,
    },
    balance: parseEther('11111.111111111111'), // $15k worth at $1.35 per token
    currentShares: '15',
  },
  '0xa99f6e6785da0f5d6fb42495fe424bce029eeb3e': {
    token: {
      address: '0xa99f6e6785da0f5d6fb42495fe424bce029eeb3e',
      symbol: 'PENDLE',
      name: 'Pendle',
      decimals: 18,
    },
    balance: parseEther('3432.494279176201'), // $15k worth at $4.37 per token
    currentShares: '15',
  },
}

const mockProposedShares = {
  '0xab36452dbac151be02b16ca17d8919826072f64a': '40',
  '0x0b3e328455c4059eeb9e3f84b5543f74e24e7e1b': '20',
  '0x532f27101965dd16442e59d40670faf5ebb142e4': '10',
  '0x940181a94a35a4569e4529a3cdfb74e38fd98631': '15',
  '0xa99f6e6785da0f5d6fb42495fe424bce029eeb3e': '15',
}

export type Step = 'basket' | 'prices' | 'expiration' | 'confirmation'
export const isProposalConfirmedAtom = atom(false)

export const stepAtom = atom<Step>('basket')

// Loaded from basket and modified when asset is added/removed
export interface IndexAssetShares {
  token: Token
  balance: bigint
  currentShares: string
}

// Editable shares
// TODO: Mocked
export const proposedSharesAtom =
  atom<Record<string, string>>(mockProposedShares)

// TODO: Mocked
export const proposedIndexBasketAtom = atom<
  Record<string, IndexAssetShares> | undefined
>(mockProposedBasket)

// Map token address to price
// TODO: mocked
export const priceMapAtom = atom<Record<string, number>>(mockPrices)

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

function getProposedTrades(get: Getter, deferred = false) {
  const proposedBasket = get(proposedIndexBasketAtom)
  const proposedShares = get(proposedSharesAtom)
  const priceMap = get(priceMapAtom)
  const isValid = get(isProposedBasketValidAtom)
  const volatility = get(tradeVolatilityAtom)

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

  return getTrades(mockTVL, tokens, decimals, bals, targetBasket, prices, error)
}
