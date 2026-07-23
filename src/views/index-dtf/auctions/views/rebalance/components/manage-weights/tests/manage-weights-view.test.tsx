import { render } from '@testing-library/react'
import { createStore, Provider } from 'jotai'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { indexDTFRebalanceControlAtom } from '@/state/dtf/atoms'
import { showManageWeightsViewAtom } from '../../../atoms'

// Content is wagmi-heavy — a sentinel proves whether the view rendered it or bailed.
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

describe('ManageWeightsView 0-supply guard', () => {
  it('renders nothing when supply is 0n (indeterminate, no fabricated basket)', () => {
    const { queryByTestId } = renderView(0n)
    expect(queryByTestId('mwc')).toBeNull()
  })

  // Positive rendering path is browser-covered by the auctions launch flow;
  // seeding the derived token-map atom here would rebuild that fixture.
  it('a rebalance token missing from the token map bails, never crashes', () => {
    // Indexer lag: the on-chain rebalance lists a token the metadata map
    // doesn't know — it must be filtered, not dereferenced.
    mockParams.mockReturnValue({
      supply: 1n,
      currentAssets: {},
      prices: {},
      rebalance: {
        tokens: ['0x000000000000000000000000000000000000dEaD'],
        weights: [{ low: 1n, spot: 2n, high: 3n }],
      },
      folioVersion: 4,
    })
    const store = createStore()
    store.set(showManageWeightsViewAtom, true)
    store.set(indexDTFRebalanceControlAtom, {
      weightControl: true,
      priceControl: 0,
    })
    const wrapper = ({ children }: { children: ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    )
    const { queryByTestId } = render(<ManageWeightsView />, { wrapper })
    expect(queryByTestId('mwc')).toBeNull()
  })
})
