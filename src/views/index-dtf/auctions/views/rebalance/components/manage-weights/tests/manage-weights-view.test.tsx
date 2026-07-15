import { render } from '@testing-library/react'
import { createStore, Provider } from 'jotai'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { indexDTFRebalanceControlAtom } from '@/state/dtf/atoms'
import { showManageWeightsViewAtom } from '../../../atoms'

// Content is heavy (BasketSetup + wagmi) — a sentinel proves whether the view
// rendered it or bailed. useRebalanceParams is wagmi-driven — stub per test.
vi.mock('../manage-weights-content', () => ({
  default: () => <div data-testid="mwc" />,
}))

const mockParams = vi.fn()
vi.mock('../../../hooks/use-rebalance-params', () => ({
  default: () => mockParams(),
}))

import ManageWeightsView from '../manage-weights-view'

const paramsWithSupply = (supply: bigint) => ({
  supply,
  currentAssets: {},
  prices: {},
  rebalance: { tokens: [], weights: [] },
  folioVersion: 4,
})

const renderView = (supply: bigint) => {
  mockParams.mockReturnValue(paramsWithSupply(supply))
  const store = createStore()
  store.set(showManageWeightsViewAtom, true)
  store.set(indexDTFRebalanceControlAtom, {
    weightControl: true,
    priceControl: 0,
  })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  )
  return render(<ManageWeightsView />, { wrapper })
}

describe('ManageWeightsView 0-supply guard (Z9)', () => {
  // With the guard reverted (supply || 1n), the memo proceeds on 0n and the
  // view renders content instead of bailing — so this fails on regression.
  it('renders nothing when supply is 0n (indeterminate, no fabricated basket)', () => {
    const { queryByTestId } = renderView(0n)
    expect(queryByTestId('mwc')).toBeNull()
  })
})
