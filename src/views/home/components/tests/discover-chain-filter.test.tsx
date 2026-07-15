import { act, render, waitFor } from '@testing-library/react'
import { createStore, Provider } from 'jotai'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'

import { ChainId } from '@/utils/chains'
import { INDEX_DTF_CHAINS, supportedChainList } from '@/utils/constants'
import { chainFilterAtom, dtfTypeFilterAtom } from '../../atoms'
import { ChainFilter } from '../discover-filters'

const setup = () => {
  const store = createStore()
  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  )
  render(<ChainFilter />, { wrapper })
  return store
}

describe('Discover ChainFilter domain reset (CXR-067-I1)', () => {
  it('applies the Yield chain set (Arbitrum, no BSC) when switching to the Yield tab', async () => {
    const store = setup()

    act(() => store.set(dtfTypeFilterAtom, 'yield'))

    await waitFor(() =>
      expect(store.get(chainFilterAtom)).toEqual([...supportedChainList])
    )
    expect(store.get(chainFilterAtom)).toContain(ChainId.Arbitrum)
    expect(store.get(chainFilterAtom)).not.toContain(ChainId.BSC)
  })

  it('applies the Index chain set (no deprecated Arbitrum) when switching back to Index', async () => {
    const store = setup()

    act(() => store.set(dtfTypeFilterAtom, 'yield'))
    await waitFor(() =>
      expect(store.get(chainFilterAtom)).toContain(ChainId.Arbitrum)
    )

    act(() => store.set(dtfTypeFilterAtom, 'index'))

    await waitFor(() =>
      expect(store.get(chainFilterAtom)).toEqual([...INDEX_DTF_CHAINS])
    )
    // Deprecated Arbitrum must never leak into Index filtering.
    expect(store.get(chainFilterAtom)).not.toContain(ChainId.Arbitrum)
  })
})
