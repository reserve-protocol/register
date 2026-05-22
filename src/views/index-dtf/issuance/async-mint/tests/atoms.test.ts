import { createStore } from 'jotai'
import { describe, expect, it } from 'vitest'
import { Address } from 'viem'
import {
  collateralAllocationAtom,
  customCollateralAmountsAtom,
  folioDetailsAtom,
  mintAmountAtom,
  mintStrategyAtom,
  resetWizardAtom,
  selectedCollateralsAtom,
  wizardStepAtom,
} from '../atoms'

describe('Wizard atoms', () => {
  it('wizardStepAtom initial state is gnosis-check', () => {
    const store = createStore()
    expect(store.get(wizardStepAtom)).toBe('gnosis-check')
  })

  it('resetWizardAtom clears UI state', () => {
    const store = createStore()

    store.set(wizardStepAtom, 'quote-summary')
    store.set(mintStrategyAtom, 'partial')
    store.set(selectedCollateralsAtom, new Set<Address>(['0x123' as Address]))
    store.set(mintAmountAtom, '1000')
    store.set(customCollateralAmountsAtom, { ['0x1' as Address]: '5' })

    store.set(resetWizardAtom)

    expect(store.get(wizardStepAtom)).toBe('gnosis-check')
    expect(store.get(mintStrategyAtom)).toBe('single')
    expect(store.get(selectedCollateralsAtom).size).toBe(0)
    expect(store.get(mintAmountAtom)).toBe('')
    expect(store.get(customCollateralAmountsAtom)).toEqual({})
    expect(store.get(folioDetailsAtom)).toBeNull()
  })
})

describe('collateralAllocationAtom', () => {
  it('returns empty when no folio details', () => {
    const store = createStore()
    store.set(mintAmountAtom, '100')
    expect(store.get(collateralAllocationAtom)).toEqual({})
  })

  it('returns empty when mint amount is zero', () => {
    const store = createStore()
    store.set(folioDetailsAtom, {
      shares: 10n ** 18n,
      assets: ['0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' as Address],
      mintValues: [10n ** 18n],
    })
    expect(store.get(collateralAllocationAtom)).toEqual({})
  })
})
