import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { ChainId } from '@/utils/chains'
import { INDEX_DTF_CHAINS, supportedChainList } from '@/utils/constants'
import ChainFilter from '..'

const renderFilter = (supportedChains: readonly number[], value: string[]) => {
  const onChange = vi.fn()
  const utils = render(
    <ChainFilter
      value={value}
      onChange={onChange}
      supportedChains={supportedChains}
    />
  )
  return { onChange, ...utils }
}

describe('generic ChainFilter caller-owned chain set', () => {
  it('offers the Index set (Binance, no Arbitrum) and its All value excludes Arbitrum', () => {
    const { onChange, getByText, queryByText } = renderFilter(INDEX_DTF_CHAINS, [
      String(ChainId.Mainnet),
    ])

    expect(queryByText('Binance')).not.toBeNull()
    expect(queryByText('Arbitrum')).toBeNull()

    fireEvent.click(getByText('All chains'))
    expect(onChange).toHaveBeenCalledWith(INDEX_DTF_CHAINS.map(String))
    expect(onChange.mock.calls[0][0]).not.toContain(String(ChainId.Arbitrum))
  })

  it('offers the Yield set (Arbitrum, no BSC) and its All value keeps Arbitrum', () => {
    const { onChange, getByText, queryByText } = renderFilter(
      supportedChainList,
      [String(ChainId.Mainnet)]
    )

    expect(queryByText('Arbitrum')).not.toBeNull()
    expect(queryByText('Binance')).toBeNull()

    fireEvent.click(getByText('All chains'))
    expect(onChange).toHaveBeenCalledWith(supportedChainList.map(String))
    expect(onChange.mock.calls[0][0]).toContain(String(ChainId.Arbitrum))
  })
})
