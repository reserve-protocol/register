import { chainIdAtom } from '@/state/atoms'
import { indexDTFBasketAtom, indexDTFPriceAtom } from '@/state/dtf/atoms'
import { Token } from '@/types'
import { ChainId } from '@/utils/chains'
import { EnrichedOrder, OrderStatus } from '@cowprotocol/cow-sdk'
import { atom } from 'jotai'
import { Address } from 'viem'
import { safeParseEther } from '@/utils'
import { calculateCollateralAllocation } from './utils'
import {
  CollateralAllocation,
  MintStrategy,
  QuoteResult,
  RecoveryChoice,
  WizardStep,
} from './types'

// ─── Constants ───────────────────────────────────────────────────────
export const ASYNC_MINT_BUFFER = 0.02
export const ASYNC_MINT_MAX_ITERATIONS = 3
export const ASYNC_MINT_CONVERGENCE_UTILIZATION = 0.98
export const ASYNC_MINT_MARGINAL_THRESHOLD = 0.005

// Input token per chain: USDC for Mainnet/Base, USDT for BSC
export const MINT_INPUT_TOKENS: Record<number, Token> = {
  [ChainId.Mainnet]: {
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as Address,
    symbol: 'USDC',
    name: 'USDC',
    decimals: 6,
  },
  [ChainId.Base]: {
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as Address,
    symbol: 'USDC',
    name: 'USDC',
    decimals: 6,
  },
  [ChainId.BSC]: {
    address: '0x55d398326f99059fF775485246999027B3197955' as Address,
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 18,
  },
}

// ─── Core wizard state ───────────────────────────────────────────────
export const wizardStepAtom = atom<WizardStep>('gnosis-check')
export const mintStrategyAtom = atom<MintStrategy>('single')
export const selectedCollateralsAtom = atom<Set<Address>>(new Set<Address>())
export const customCollateralAmountsAtom = atom<Record<Address, string>>({})
export const collateralSelectionInitializedAtom = atom<boolean>(false)
export const useWalletCollateralAtom = atom<boolean>(false)
export const mintAmountAtom = atom<string>('')
export const slippageAtom = atom<string>('100') // basis points

// ─── Input token ─────────────────────────────────────────────────────
export const inputTokenAtom = atom<Token>((get) => {
  const chainId = get(chainIdAtom)
  return MINT_INPUT_TOKENS[chainId] ?? MINT_INPUT_TOKENS[ChainId.Base]
})

// ─── Quote & order tracking ──────────────────────────────────────────
export const mintQuotesAtom = atom<Record<Address, QuoteResult>>({})
export const quotesTimestampAtom = atom<number | undefined>(undefined)
// WHY: 5 min threshold — quotes valid for 10 min, this gives buffer
export const quotesStaleAtom = atom<boolean>((get) => {
  const ts = get(quotesTimestampAtom)
  if (!ts) return false
  return Date.now() - ts > 5 * 60 * 1000
})
export const orderIdsAtom = atom<string[]>([])
export const ordersAtom = atom<(EnrichedOrder & { orderId: string })[]>([])
export const ordersCreatedAtAtom = atom<string | undefined>(undefined)
export const mintTxHashAtom = atom<string | undefined>(undefined)
// WHY: Stores actual shares passed to mint() — more accurate than re-deriving from price
export const actualMintedSharesAtom = atom<bigint>(0n)

// ─── Async data atoms (populated by useAllocationData hook) ──────────
// NOTE: Only valid when useAllocationData() is mounted
export const walletBalancesAtom = atom<Record<Address, bigint>>({})
export const tokenPricesAtom = atom<Record<Address, number>>({})
export const folioDetailsAtom = atom<{
  shares: bigint
  assets: Address[]
  mintValues: bigint[]
} | null>(null)

// ─── Dollar → DTF shares conversion ─────────────────────────────────
export const mintSharesAtom = atom<bigint>((get) => {
  const dollarAmount = Number(get(mintAmountAtom))
  const dtfPrice = get(indexDTFPriceAtom) || 0
  if (
    !dtfPrice ||
    !dollarAmount ||
    !isFinite(dollarAmount) ||
    dollarAmount <= 0
  )
    return 0n
  const shares = (dollarAmount / dtfPrice) * (1 - ASYNC_MINT_BUFFER)
  return safeParseEther(shares.toFixed(18))
})

// ─── Iteration override ─────────────────────────────────────────────
// The quote-iteration orchestrator writes here to drive `activeMintSharesAtom`
// during recursive re-quoting. 0n means "no override" — fall back to seed.
export const effectiveMintSharesAtom = atom<bigint>(0n)

// What the allocation and quote pipeline actually consume. Falls back to the
// oracle-based seed when no iteration has overridden it.
export const activeMintSharesAtom = atom<bigint>((get) => {
  const override = get(effectiveMintSharesAtom)
  return override > 0n ? override : get(mintSharesAtom)
})

// ─── Collateral allocation (derived — calls the tested pure function) ─
export const collateralAllocationAtom = atom<
  Record<Address, CollateralAllocation>
>((get) => {
  const folioDetails = get(folioDetailsAtom)
  const mintShares = get(activeMintSharesAtom)
  if (!folioDetails || mintShares === 0n) return {}

  const basket = get(indexDTFBasketAtom)
  const decimalsMap: Record<Address, number> = {}
  if (basket) {
    for (const token of basket) {
      decimalsMap[token.address.toLowerCase() as Address] = token.decimals
    }
  }

  const mintValues =
    folioDetails.shares === mintShares
      ? folioDetails.mintValues
      : folioDetails.mintValues.map(
          (value) => (value * mintShares) / folioDetails.shares
        )
  const customCollateralAmounts: Record<Address, bigint> = {}
  const customInputs = get(customCollateralAmountsAtom)
  for (const [address, value] of Object.entries(customInputs)) {
    const normalized = address.toLowerCase() as Address
    if (!value) continue
    customCollateralAmounts[normalized] = safeParseEther(
      value,
      decimalsMap[normalized] ?? 18
    )
  }

  return calculateCollateralAllocation({
    mintShares,
    assets: folioDetails.assets,
    mintValues,
    balances: get(walletBalancesAtom),
    prices: get(tokenPricesAtom),
    decimals: decimalsMap,
    selectedCollaterals: get(selectedCollateralsAtom),
    customCollateralAmounts,
    strategy: get(mintStrategyAtom),
    inputToken: get(inputTokenAtom),
  })
})

// ─── Recovery atoms ──────────────────────────────────────────────────
export const recoveryChoiceAtom = atom<RecoveryChoice>(null)
export const leftoverCollateralAtom = atom<Record<Address, bigint>>({})
export const reverseOrderIdsAtom = atom<string[]>([])

// WHY: Only reverse what we acquired through orders, not pre-existing wallet balances
export const acquiredBalancesAtom = atom<Record<Address, bigint>>((get) => {
  const orders = get(ordersAtom)
  const balances: Record<Address, bigint> = {}
  for (const order of orders) {
    const amount = BigInt(order.executedBuyAmount || '0')
    if (amount > 0n) {
      const token = order.buyToken.toLowerCase() as Address
      balances[token] = (balances[token] || 0n) + amount
    }
  }
  return balances
})

// ─── Derived order atoms ─────────────────────────────────────────────
export const ordersSubmittedAtom = atom<boolean>((get) => {
  return Boolean(get(ordersCreatedAtAtom))
})

export const currentOrdersAtom = atom((get) => {
  const orderIds = new Set(get(orderIdsAtom))
  const orders = get(ordersAtom)
  if (orderIds.size === 0) return []
  return orders.filter((order) => orderIds.has(order.orderId))
})

export const allOrdersFulfilledAtom = atom<boolean>((get) => {
  const orders = get(currentOrdersAtom)
  return (
    orders.length > 0 &&
    orders.every((order) => order.status === OrderStatus.FULFILLED)
  )
})

export const failedOrdersAtom = atom((get) => {
  const orders = get(currentOrdersAtom)
  return orders.filter((order) =>
    [OrderStatus.CANCELLED, OrderStatus.EXPIRED].includes(order.status)
  )
})

export const pendingOrdersAtom = atom((get) => {
  const orders = get(currentOrdersAtom)
  return orders.filter((order) =>
    [OrderStatus.OPEN, OrderStatus.PRESIGNATURE_PENDING].includes(order.status)
  )
})

export const priceMovedAtom = atom<boolean>((get) => {
  const failed = get(failedOrdersAtom)
  const pending = get(pendingOrdersAtom)
  return failed.length > 0 && pending.length === 0
})

// ─── Iteration state ─────────────────────────────────────────────────
export type IterationStatus =
  | 'idle'
  | 'iterating'
  | 'converged'
  | 'capped'
  | 'over_buffer'
  | 'infeasible'
  | 'failed'

export type IterationRound = {
  round: number
  shares: bigint
  costBaseUnits: bigint
  costUsd: number
  utilization: number
  feasible: boolean
  allSucceeded: boolean
  impacts: Record<Address, number>
}

export type FeasibleSnapshot = {
  shares: bigint
  costBaseUnits: bigint
  costUsd: number
  utilization: number
  quotes: Record<Address, QuoteResult>
}

export type IterationState = {
  status: IterationStatus
  round: number
  maxRounds: number
  history: IterationRound[]
  bestFeasible: FeasibleSnapshot | null
  perTokenImpacts: Record<Address, number>
  error?: string
}

export const INITIAL_ITERATION_STATE: IterationState = {
  status: 'idle',
  round: 0,
  maxRounds: ASYNC_MINT_MAX_ITERATIONS,
  history: [],
  bestFeasible: null,
  perTokenImpacts: {},
}

export const iterationStateAtom = atom<IterationState>(INITIAL_ITERATION_STATE)

export const resetIterationAtom = atom(null, (_, set) => {
  set(effectiveMintSharesAtom, 0n)
  set(iterationStateAtom, INITIAL_ITERATION_STATE)
})

// ─── Reset action atom ───────────────────────────────────────────────
// NOTE: collateralAllocationAtom is derived — resets automatically when dependencies reset
export const resetWizardAtom = atom(null, (_, set) => {
  set(wizardStepAtom, 'gnosis-check')
  set(mintStrategyAtom, 'single')
  set(selectedCollateralsAtom, new Set())
  set(customCollateralAmountsAtom, {})
  set(collateralSelectionInitializedAtom, false)
  set(useWalletCollateralAtom, false)
  set(mintAmountAtom, '')
  set(mintQuotesAtom, {})
  set(quotesTimestampAtom, undefined)
  set(orderIdsAtom, [])
  set(ordersAtom, [])
  set(ordersCreatedAtAtom, undefined)
  set(mintTxHashAtom, undefined)
  set(actualMintedSharesAtom, 0n)
  set(recoveryChoiceAtom, null)
  set(leftoverCollateralAtom, {})
  set(reverseOrderIdsAtom, [])
  set(walletBalancesAtom, {})
  set(tokenPricesAtom, {})
  set(folioDetailsAtom, null)
  set(effectiveMintSharesAtom, 0n)
  set(iterationStateAtom, INITIAL_ITERATION_STATE)
})
