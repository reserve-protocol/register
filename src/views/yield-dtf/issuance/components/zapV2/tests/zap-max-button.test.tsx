import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

// Component seam for Z10: the real ZapInputMaxButton must be DISABLED when the
// input token can't be priced (canCalculateMax=false), so the user can't trigger
// a fabricated Max. Mock the context to drive both states.
const mockUseZap = vi.fn()
vi.mock('../context/ZapContext', () => ({ useZap: () => mockUseZap() }))

// eslint-disable-next-line import/first
import ZapInputMaxButton from '../input/ZapInputMaxButton'

const baseCtx = {
  operation: 'mint' as const,
  tokenIn: { symbol: 'WETH', balance: '1' },
  onClickMax: () => {},
}

describe('ZapInputMaxButton (Z10)', () => {
  it('disables Max when the calculation is unavailable (canCalculateMax=false)', () => {
    mockUseZap.mockReturnValue({ ...baseCtx, canCalculateMax: false })
    const { getByTestId } = render(<ZapInputMaxButton />)
    expect(getByTestId('zap-max-button').hasAttribute('disabled')).toBe(true)
  })

  it('enables Max when the calculation is available', () => {
    mockUseZap.mockReturnValue({ ...baseCtx, canCalculateMax: true })
    const { getByTestId } = render(<ZapInputMaxButton />)
    expect(getByTestId('zap-max-button').hasAttribute('disabled')).toBe(false)
  })
})
