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
export const ASYNC_MINT_BUFFER = 0.01

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
  assets: Address[]
  mintValues: bigint[]
} | null>(null)

// ─── Dollar → DTF shares conversion ─────────────────────────────────
export const mintSharesAtom = atom<bigint>((get) => {
  const dollarAmount = Number(get(mintAmountAtom))
  const dtfPrice = get(indexDTFPriceAtom) || 0
  if (!dtfPrice || !dollarAmount || !isFinite(dollarAmount) || dollarAmount <= 0) return 0n
  const shares = dollarAmount / dtfPrice
  return safeParseEther(shares.toFixed(18))
})

// ─── Collateral allocation (derived — calls the tested pure function) ─
export const collateralAllocationAtom = atom<Record<Address, CollateralAllocation>>(
  (get) => {
    const folioDetails = get(folioDetailsAtom)
    const mintShares = get(mintSharesAtom)
    if (!folioDetails || mintShares === 0n) return {}

    const basket = get(indexDTFBasketAtom)
    const decimalsMap: Record<Address, number> = {}
    if (basket) {
      for (const token of basket) {
        decimalsMap[token.address.toLowerCase() as Address] = token.decimals
      }
    }

    return calculateCollateralAllocation({
      mintShares,
      assets: folioDetails.assets,
      mintValues: folioDetails.mintValues,
      balances: get(walletBalancesAtom),
      prices: get(tokenPricesAtom),
      decimals: decimalsMap,
      selectedCollaterals: get(selectedCollateralsAtom),
      strategy: get(mintStrategyAtom),
      inputToken: get(inputTokenAtom),
    })
  }
)

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

export const allOrdersFulfilledAtom = atom<boolean>((get) => {
  const orders = get(ordersAtom)
  return (
    orders.length > 0 &&
    orders.every((order) => order.status === OrderStatus.FULFILLED)
  )
})

export const failedOrdersAtom = atom((get) => {
  const orders = get(ordersAtom)
  return orders.filter((order) =>
    [OrderStatus.CANCELLED, OrderStatus.EXPIRED].includes(order.status)
  )
})

export const pendingOrdersAtom = atom((get) => {
  const orders = get(ordersAtom)
  return orders.filter((order) =>
    [OrderStatus.OPEN, OrderStatus.PRESIGNATURE_PENDING].includes(
      order.status
    )
  )
})

export const priceMovedAtom = atom<boolean>((get) => {
  const failed = get(failedOrdersAtom)
  const pending = get(pendingOrdersAtom)
  return failed.length > 0 && pending.length === 0
})

// ─── Reset action atom ───────────────────────────────────────────────
// NOTE: collateralAllocationAtom is derived — resets automatically when dependencies reset
export const resetWizardAtom = atom(null, (_, set) => {
  set(wizardStepAtom, 'gnosis-check')
  set(mintStrategyAtom, 'single')
  set(selectedCollateralsAtom, new Set())
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
})
