import { createElement } from 'react'
import { render, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import TokenLogo from '..'
import {
  getVoteLockTokenLogo,
  getVoteLockUnderlyingSymbol,
} from '../vote-lock-token-logo'

const routeCache: Record<string, string> = {
  '0xabc-56': '/wrong-cached-logo.svg',
  '0xdef-1': '/svgs/cached-logo.svg',
}

vi.mock('jotai', () => ({
  useAtomValue: () => ({}),
  useSetAtom: () => vi.fn(),
  useStore: () => ({ get: () => routeCache }),
}))

vi.mock('@/state/atoms', () => ({
  indexDTFIconsAtom: Symbol('indexDTFIconsAtom'),
}))

vi.mock('../atoms', () => ({
  routeCacheAtom: Symbol('routeCacheAtom'),
}))

describe('getVoteLockTokenLogo', () => {
  it.each(['vlRSR', 'vlRSR-LCAP', 'VLRSR-CMCindex'])(
    'uses the shared vote-lock RSR logo for %s',
    (symbol) => {
      expect(getVoteLockTokenLogo(symbol)).toBe('/svgs/vlrsr.svg')
    }
  )

  it('keeps non-RSR vote-lock symbols on their normal resolution path', () => {
    expect(getVoteLockTokenLogo('vlETH')).toBe('')
  })

  it('takes priority over cached and explicit token logos', async () => {
    const { getByAltText } = render(
      createElement(TokenLogo, {
        symbol: 'vlRSR-LCAP',
        address: '0xabc',
        chain: 56,
        src: '/wrong-explicit-logo.svg',
        alt: 'vlRSR-LCAP',
      })
    )

    await waitFor(() => {
      expect(getByAltText('vlRSR-LCAP').getAttribute('src')).toBe(
        '/svgs/vlrsr.svg'
      )
    })
  })
})

describe('getVoteLockUnderlyingSymbol', () => {
  it.each([
    ['vlSQUILL', 'SQUILL'],
    ['vlSQUILL-OPEN', 'SQUILL'],
    ['vlALTT-ABX', 'ALTT'],
  ])('maps %s to its underlying %s', (symbol, underlying) => {
    expect(getVoteLockUnderlyingSymbol(symbol)).toBe(underlying)
  })

  it.each(['vlRSR', 'vlRSR-LCAP', 'VLX', 'USDC', undefined])(
    'leaves %s alone',
    (symbol) => {
      expect(getVoteLockUnderlyingSymbol(symbol)).toBe('')
    }
  )
})

describe('TokenLogo for a vote-lock vault without its own logo', () => {
  it('shows the underlying logo from the underlying address', async () => {
    const { getByAltText } = render(
      createElement(TokenLogo, {
        symbol: 'vlSQUILL',
        address: '0xabc',
        underlyingAddress: '0xDEF',
        chain: 1,
        alt: 'vlSQUILL',
      })
    )

    await waitFor(() => {
      expect(getByAltText('vlSQUILL').getAttribute('src')).toBe(
        '/svgs/cached-logo.svg'
      )
    })
  })
})

describe('TokenLogo route cache', () => {
  it('uses the cached logo for a known address and chain', async () => {
    const { getByAltText } = render(
      createElement(TokenLogo, {
        symbol: 'UNKNOWN',
        address: '0xDEF',
        chain: 1,
        alt: 'cached',
      })
    )

    await waitFor(() => {
      expect(getByAltText('cached').getAttribute('src')).toBe(
        '/svgs/cached-logo.svg'
      )
    })
  })
})
