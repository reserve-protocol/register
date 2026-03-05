import { createStore } from 'jotai'
import { describe, it, expect } from 'vitest'
import {
  allOrdersFulfilledAtom,
  failedOrdersAtom,
  folioDetailsAtom,
  leftoverCollateralAtom,
  mintAmountAtom,
  mintQuotesAtom,
  mintStrategyAtom,
  mintTxHashAtom,
  orderIdsAtom,
  ordersAtom,
  ordersCreatedAtAtom,
  ordersSubmittedAtom,
  pendingOrdersAtom,
  priceMovedAtom,
  recoveryChoiceAtom,
  resetWizardAtom,
  selectedCollateralsAtom,
  tokenPricesAtom,
  walletBalancesAtom,
  wizardStepAtom,
} from '../atoms'
import { OrderStatus } from '@cowprotocol/cow-sdk'
import { Address } from 'viem'

const makeOrder = (
  orderId: string,
  status: OrderStatus
) =>
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
    store.set(
      selectedCollateralsAtom,
      new Set<Address>(['0x123' as Address])
    )
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
    store.set(ordersAtom, [
      makeOrder('1', OrderStatus.FULFILLED),
      makeOrder('2', OrderStatus.FULFILLED),
    ])
    expect(store.get(allOrdersFulfilledAtom)).toBe(true)
  })

  it('allOrdersFulfilledAtom returns false when any pending', () => {
    const store = createStore()
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
    store.set(ordersAtom, [
      makeOrder('1', OrderStatus.FULFILLED),
      makeOrder('2', OrderStatus.CANCELLED),
    ])
    expect(store.get(priceMovedAtom)).toBe(true)
  })

  it('priceMovedAtom false when still pending', () => {
    const store = createStore()
    store.set(ordersAtom, [
      makeOrder('1', OrderStatus.CANCELLED),
      makeOrder('2', OrderStatus.OPEN),
    ])
    expect(store.get(priceMovedAtom)).toBe(false)
  })

  it('priceMovedAtom false when no failures', () => {
    const store = createStore()
    store.set(ordersAtom, [
      makeOrder('1', OrderStatus.FULFILLED),
      makeOrder('2', OrderStatus.FULFILLED),
    ])
    expect(store.get(priceMovedAtom)).toBe(false)
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
    store.set(ordersAtom, [makeOrder('1', OrderStatus.FULFILLED)])
    expect(store.get(allOrdersFulfilledAtom)).toBe(true)
  })

  it('failedOrdersAtom returns empty when all fulfilled', () => {
    const store = createStore()
    store.set(ordersAtom, [
      makeOrder('1', OrderStatus.FULFILLED),
      makeOrder('2', OrderStatus.FULFILLED),
    ])
    expect(store.get(failedOrdersAtom)).toHaveLength(0)
  })

  it('pendingOrdersAtom returns empty when all resolved', () => {
    const store = createStore()
    store.set(ordersAtom, [
      makeOrder('1', OrderStatus.FULFILLED),
      makeOrder('2', OrderStatus.CANCELLED),
    ])
    expect(store.get(pendingOrdersAtom)).toHaveLength(0)
  })
})
