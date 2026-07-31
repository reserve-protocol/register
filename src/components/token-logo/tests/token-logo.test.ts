import { createElement } from 'react'
import { render, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import TokenLogo from '..'
import { getVoteLockTokenLogo } from '../vote-lock-token-logo'

vi.mock('jotai', () => ({
  useAtomValue: () => ({}),
  useAtom: () => [{ '0xabc-56': '/wrong-cached-logo.svg' }, vi.fn()],
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
