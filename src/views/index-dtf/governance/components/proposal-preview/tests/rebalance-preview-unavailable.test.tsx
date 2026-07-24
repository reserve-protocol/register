import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import RebalancePreview from '../rebalance-preview'

const mocks = vi.hoisted(() => ({ preview: vi.fn() }))

vi.mock('@/hooks/use-rebalance-basket-preview', () => ({
  default: mocks.preview,
}))

describe('RebalancePreview snapshot-unavailable state', () => {
  it('renders explicit unavailable copy instead of an indefinite skeleton', () => {
    mocks.preview.mockReturnValue({
      preview: undefined,
      snapshotUnavailable: true,
    })

    render(<RebalancePreview calldatas={['0x00']} />)

    expect(
      screen.getByTestId('rebalance-preview-unavailable')
    ).toBeInTheDocument()
  })

  it('still shows the skeleton while genuinely loading', () => {
    mocks.preview.mockReturnValue({
      preview: undefined,
      snapshotUnavailable: false,
    })

    const { container } = render(<RebalancePreview calldatas={['0x00']} />)

    expect(
      screen.queryByTestId('rebalance-preview-unavailable')
    ).not.toBeInTheDocument()
    expect(container.firstChild).not.toBeNull()
  })
})
