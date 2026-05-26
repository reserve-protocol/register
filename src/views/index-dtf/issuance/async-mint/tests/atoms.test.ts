import { createStore } from 'jotai'
import { describe, expect, it } from 'vitest'
import {
  mintAmountAtom,
  operationAtom,
  redeemAmountAtom,
  resetWizardAtom,
  useExistingBalancesAtom,
  wizardStepAtom,
} from '../atoms'

describe('Wizard atoms', () => {
  it('initial state defaults', () => {
    const store = createStore()
    expect(store.get(wizardStepAtom)).toBe('gnosis-check')
    expect(store.get(operationAtom)).toBe('mint')
    expect(store.get(useExistingBalancesAtom)).toBe(false)
  })

  it('resetWizardAtom clears state', () => {
    const store = createStore()

    store.set(wizardStepAtom, 'quote-summary')
    store.set(operationAtom, 'redeem')
    store.set(useExistingBalancesAtom, true)
    store.set(mintAmountAtom, '1000')
    store.set(redeemAmountAtom, '5')

    store.set(resetWizardAtom)

    expect(store.get(wizardStepAtom)).toBe('gnosis-check')
    expect(store.get(operationAtom)).toBe('mint')
    expect(store.get(useExistingBalancesAtom)).toBe(false)
    expect(store.get(mintAmountAtom)).toBe('')
    expect(store.get(redeemAmountAtom)).toBe('')
  })
})
