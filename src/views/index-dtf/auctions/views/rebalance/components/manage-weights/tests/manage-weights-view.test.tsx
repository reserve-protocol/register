import { render } from '@testing-library/react'
import { createStore, Provider } from 'jotai'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { indexDTFRebalanceControlAtom } from '@/state/dtf/atoms'

// The real token map derives from the proposals/rebalances chain — swap it for
// a primitive atom so tests can seed subgraph metadata directly.
vi.mock('../../../atoms', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>()
  const { atom } = await import('jotai')
  return { ...actual, rebalanceTokenMapAtom: atom({}) }
})

import { rebalanceTokenMapAtom, showManageWeightsViewAtom } from '../../../atoms'

// Content is wagmi-heavy — a sentinel proves whether the view rendered it or bailed.
vi.mock('../manage-weights-content', () => ({
  default: () => <div data-testid="mwc" />,
}))

const mockParams = vi.fn()
vi.mock('../../../hooks/use-rebalance-params', () => ({
  default: () => mockParams(),
}))

import ManageWeightsView from '../manage-weights-view'

const TOKEN_A = '0x00000000000000000000000000000000000000aa'
const TOKEN_UNMAPPED = '0x000000000000000000000000000000000000dead'

const tokenAMeta = {
  address: TOKEN_A,
  symbol: 'AAA',
  name: 'Token A',
  decimals: 18,
}

const weight = { low: 1n, spot: 10n ** 27n, high: 2n * 10n ** 27n }

const paramsFor = (tokens: string[], supply = 10n ** 18n) => ({
  supply,
  currentAssets: { [TOKEN_A]: 10n ** 18n },
  prices: { [TOKEN_A]: { currentPrice: 1 } },
  rebalance: { tokens, weights: tokens.map(() => weight) },
  folioVersion: 4,
})

// The token map (subgraph) and the rebalance token list (on-chain) are seeded
// independently so the tests can model indexer lag between them.
const renderView = (
  params: ReturnType<typeof paramsFor>,
  mappedTokens = [tokenAMeta]
) => {
  mockParams.mockReturnValue(params)
  const store = createStore()
  store.set(showManageWeightsViewAtom, true)
  store.set(indexDTFRebalanceControlAtom, {
    weightControl: true,
    priceControl: 0,
  })
  store.set(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rebalanceTokenMapAtom as any,
    Object.fromEntries(mappedTokens.map((t) => [t.address, t]))
  )
  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  )
  return render(<ManageWeightsView />, { wrapper })
}

describe('ManageWeightsView fail-closed guards', () => {
  it('renders the content when every rebalance token has metadata', () => {
    const { queryByTestId } = renderView(paramsFor([TOKEN_A]))
    expect(queryByTestId('mwc')).not.toBeNull()
    expect(queryByTestId('manage-weights-unavailable')).toBeNull()
  })

  it('a mixed known/missing token list shows the unavailable state, never the basket', () => {
    const { queryByTestId } = renderView(paramsFor([TOKEN_A, TOKEN_UNMAPPED]))
    expect(queryByTestId('mwc')).toBeNull()
    expect(queryByTestId('manage-weights-unavailable')).not.toBeNull()
  })

  it('supply 0n shows the unavailable state (indeterminate per-share units)', () => {
    const { queryByTestId } = renderView(paramsFor([TOKEN_A], 0n))
    expect(queryByTestId('mwc')).toBeNull()
    expect(queryByTestId('manage-weights-unavailable')).not.toBeNull()
  })
})
