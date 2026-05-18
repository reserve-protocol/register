import { createStore } from 'jotai'
import { describe, it, expect } from 'vitest'
import {
  INITIAL_ITERATION_STATE,
  activeMintSharesAtom,
  allOrdersFulfilledAtom,
  collateralAllocationAtom,
  currentOrdersAtom,
  effectiveMintSharesAtom,
  failedOrdersAtom,
  folioDetailsAtom,
  iterationStateAtom,
  leftoverCollateralAtom,
  mintAmountAtom,
  mintQuotesAtom,
  mintSharesAtom,
  mintStrategyAtom,
  mintTxHashAtom,
  orderIdsAtom,
  ordersAtom,
  ordersCreatedAtAtom,
  ordersSubmittedAtom,
  pendingOrdersAtom,
  priceMovedAtom,
  recoveryChoiceAtom,
  resetIterationAtom,
  resetWizardAtom,
  selectedCollateralsAtom,
  tokenPricesAtom,
  walletBalancesAtom,
  wizardStepAtom,
} from '../atoms'
import { OrderStatus } from '@cowprotocol/cow-sdk'
import { Address } from 'viem'

const makeOrder = (orderId: string, status: OrderStatus) =>
  ({
    orderId,
    status,
    sellToken: '0x1',
    buyToken: '0x2',
    sellAmount: '1000',
    buyAmount: '500',
  }) as any

describe('Wizard Atoms', () => {
  it('wizardStepAtom initial state is gnosis-check', () => {
    const store = createStore()
    expect(store.get(wizardStepAtom)).toBe('gnosis-check')
  })

  it('resetWizardAtom clears all state', () => {
    const store = createStore()

    // Set various state
    store.set(wizardStepAtom, 'processing')
    store.set(mintStrategyAtom, 'partial')
    store.set(selectedCollateralsAtom, new Set<Address>(['0x123' as Address]))
    store.set(mintAmountAtom, '1000')
    store.set(orderIdsAtom, ['order-1'])
    store.set(ordersCreatedAtAtom, '2024-01-01')
    store.set(mintTxHashAtom, '0xabc')
    store.set(recoveryChoiceAtom, 'top-up')

    // Reset
    store.set(resetWizardAtom)

    // Verify all cleared
    expect(store.get(wizardStepAtom)).toBe('gnosis-check')
    expect(store.get(mintStrategyAtom)).toBe('single')
    expect(store.get(selectedCollateralsAtom).size).toBe(0)
    expect(store.get(mintAmountAtom)).toBe('')
    expect(store.get(mintQuotesAtom)).toEqual({})
    expect(store.get(orderIdsAtom)).toEqual([])
    expect(store.get(ordersAtom)).toEqual([])
    expect(store.get(ordersCreatedAtAtom)).toBeUndefined()
    expect(store.get(mintTxHashAtom)).toBeUndefined()
    expect(store.get(recoveryChoiceAtom)).toBeNull()
  })

  it('allOrdersFulfilledAtom returns true when all fulfilled', () => {
    const store = createStore()
    store.set(orderIdsAtom, ['1', '2'])
    store.set(ordersAtom, [
      makeOrder('1', OrderStatus.FULFILLED),
      makeOrder('2', OrderStatus.FULFILLED),
    ])
    expect(store.get(allOrdersFulfilledAtom)).toBe(true)
  })

  it('allOrdersFulfilledAtom returns false when any pending', () => {
    const store = createStore()
    store.set(orderIdsAtom, ['1', '2'])
    store.set(ordersAtom, [
      makeOrder('1', OrderStatus.FULFILLED),
      makeOrder('2', OrderStatus.OPEN),
    ])
    expect(store.get(allOrdersFulfilledAtom)).toBe(false)
  })

  it('allOrdersFulfilledAtom returns false with empty orders', () => {
    const store = createStore()
    expect(store.get(allOrdersFulfilledAtom)).toBe(false)
  })

  it('failedOrdersAtom filters cancelled/expired', () => {
    const store = createStore()
    store.set(orderIdsAtom, ['1', '2', '3', '4'])
    store.set(ordersAtom, [
      makeOrder('1', OrderStatus.FULFILLED),
      makeOrder('2', OrderStatus.CANCELLED),
      makeOrder('3', OrderStatus.EXPIRED),
      makeOrder('4', OrderStatus.OPEN),
    ])
    const failed = store.get(failedOrdersAtom)
    expect(failed).toHaveLength(2)
    expect(failed.map((o) => o.orderId)).toEqual(['2', '3'])
  })

  it('pendingOrdersAtom filters open/presignature_pending', () => {
    const store = createStore()
    store.set(orderIdsAtom, ['1', '2', '3', '4'])
    store.set(ordersAtom, [
      makeOrder('1', OrderStatus.FULFILLED),
      makeOrder('2', OrderStatus.OPEN),
      makeOrder('3', OrderStatus.PRESIGNATURE_PENDING),
      makeOrder('4', OrderStatus.CANCELLED),
    ])
    const pending = store.get(pendingOrdersAtom)
    expect(pending).toHaveLength(2)
    expect(pending.map((o) => o.orderId)).toEqual(['2', '3'])
  })

  it('priceMovedAtom true when failed > 0 and pending === 0', () => {
    const store = createStore()
    store.set(orderIdsAtom, ['1', '2'])
    store.set(ordersAtom, [
      makeOrder('1', OrderStatus.FULFILLED),
      makeOrder('2', OrderStatus.CANCELLED),
    ])
    expect(store.get(priceMovedAtom)).toBe(true)
  })

  it('priceMovedAtom false when still pending', () => {
    const store = createStore()
    store.set(orderIdsAtom, ['1', '2'])
    store.set(ordersAtom, [
      makeOrder('1', OrderStatus.CANCELLED),
      makeOrder('2', OrderStatus.OPEN),
    ])
    expect(store.get(priceMovedAtom)).toBe(false)
  })

  it('priceMovedAtom false when no failures', () => {
    const store = createStore()
    store.set(orderIdsAtom, ['1', '2'])
    store.set(ordersAtom, [
      makeOrder('1', OrderStatus.FULFILLED),
      makeOrder('2', OrderStatus.FULFILLED),
    ])
    expect(store.get(priceMovedAtom)).toBe(false)
  })

  it('current order status ignores failed orders from previous attempts', () => {
    const store = createStore()
    store.set(orderIdsAtom, ['retry-1'])
    store.set(ordersAtom, [
      makeOrder('expired-1', OrderStatus.EXPIRED),
      makeOrder('retry-1', OrderStatus.FULFILLED),
    ])

    expect(store.get(currentOrdersAtom).map((o) => o.orderId)).toEqual([
      'retry-1',
    ])
    expect(store.get(failedOrdersAtom)).toHaveLength(0)
    expect(store.get(allOrdersFulfilledAtom)).toBe(true)
  })

  it('ordersSubmittedAtom true when ordersCreatedAt set', () => {
    const store = createStore()
    expect(store.get(ordersSubmittedAtom)).toBe(false)
    store.set(ordersCreatedAtAtom, '2024-01-01')
    expect(store.get(ordersSubmittedAtom)).toBe(true)
  })

  it('resetWizardAtom clears async data atoms', () => {
    const store = createStore()
    const addr = '0x123' as Address

    store.set(walletBalancesAtom, { [addr]: 1000n })
    store.set(tokenPricesAtom, { [addr]: 2000 })
    store.set(folioDetailsAtom, {
      shares: 1000n,
      assets: [addr],
      mintValues: [1000n],
    })
    store.set(leftoverCollateralAtom, { [addr]: 500n })

    store.set(resetWizardAtom)

    expect(store.get(walletBalancesAtom)).toEqual({})
    expect(store.get(tokenPricesAtom)).toEqual({})
    expect(store.get(folioDetailsAtom)).toBeNull()
    expect(store.get(leftoverCollateralAtom)).toEqual({})
  })

  it('priceMovedAtom false with empty orders', () => {
    const store = createStore()
    expect(store.get(priceMovedAtom)).toBe(false)
  })

  it('allOrdersFulfilledAtom handles single order', () => {
    const store = createStore()
    store.set(orderIdsAtom, ['1'])
    store.set(ordersAtom, [makeOrder('1', OrderStatus.FULFILLED)])
    expect(store.get(allOrdersFulfilledAtom)).toBe(true)
  })

  it('failedOrdersAtom returns empty when all fulfilled', () => {
    const store = createStore()
    store.set(orderIdsAtom, ['1', '2'])
    store.set(ordersAtom, [
      makeOrder('1', OrderStatus.FULFILLED),
      makeOrder('2', OrderStatus.FULFILLED),
    ])
    expect(store.get(failedOrdersAtom)).toHaveLength(0)
  })

  it('pendingOrdersAtom returns empty when all resolved', () => {
    const store = createStore()
    store.set(orderIdsAtom, ['1', '2'])
    store.set(ordersAtom, [
      makeOrder('1', OrderStatus.FULFILLED),
      makeOrder('2', OrderStatus.CANCELLED),
    ])
    expect(store.get(pendingOrdersAtom)).toHaveLength(0)
  })
})

describe('Iteration override atoms', () => {
  it('effectiveMintSharesAtom defaults to 0n', () => {
    const store = createStore()
    expect(store.get(effectiveMintSharesAtom)).toBe(0n)
  })

  it('activeMintSharesAtom falls back to seed (mintSharesAtom) when override is 0n', () => {
    const store = createStore()
    // No mintAmount, no price → mintSharesAtom returns 0n → activeMintSharesAtom returns 0n
    expect(store.get(mintSharesAtom)).toBe(0n)
    expect(store.get(activeMintSharesAtom)).toBe(0n)
  })

  it('activeMintSharesAtom returns override when set, regardless of seed', () => {
    const store = createStore()
    const override = 5_000000000000000000n // 5e18
    store.set(effectiveMintSharesAtom, override)
    // Seed is 0n (no mintAmount), but override is set
    expect(store.get(mintSharesAtom)).toBe(0n)
    expect(store.get(activeMintSharesAtom)).toBe(override)
  })

  it('collateralAllocationAtom derives fromSwap based on activeMintSharesAtom override', () => {
    const store = createStore()
    const TOKEN = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' as Address
    store.set(folioDetailsAtom, {
      shares: 10_000000000000000000n, // 10
      assets: [TOKEN],
      mintValues: [2_000000000000000000n], // 2 tokens for 10 shares = 0.2 per share
    })

    // Override to 5 shares → required = mintValues * 5/10 = 1 token
    store.set(effectiveMintSharesAtom, 5_000000000000000000n)
    const small = store.get(collateralAllocationAtom)
    expect(small[TOKEN]?.fromSwap).toBe(1_000000000000000000n)

    // Override to 1 share → required = 0.2 token
    store.set(effectiveMintSharesAtom, 1_000000000000000000n)
    const tiny = store.get(collateralAllocationAtom)
    expect(tiny[TOKEN]?.fromSwap).toBe(200000000000000000n)
  })

  it('resetIterationAtom clears override and iteration state without touching mintAmount', () => {
    const store = createStore()
    store.set(mintAmountAtom, '500')
    store.set(effectiveMintSharesAtom, 123n)
    store.set(iterationStateAtom, {
      ...INITIAL_ITERATION_STATE,
      status: 'iterating',
      round: 2,
    })

    store.set(resetIterationAtom)

    expect(store.get(effectiveMintSharesAtom)).toBe(0n)
    expect(store.get(iterationStateAtom)).toEqual(INITIAL_ITERATION_STATE)
    expect(store.get(mintAmountAtom)).toBe('500') // preserved
  })

  it('resetWizardAtom also clears iteration override and state', () => {
    const store = createStore()
    store.set(effectiveMintSharesAtom, 999n)
    store.set(iterationStateAtom, {
      ...INITIAL_ITERATION_STATE,
      status: 'converged',
      round: 3,
    })

    store.set(resetWizardAtom)

    expect(store.get(effectiveMintSharesAtom)).toBe(0n)
    expect(store.get(iterationStateAtom)).toEqual(INITIAL_ITERATION_STATE)
  })
})
