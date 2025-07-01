import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Zapper } from '../components/zapper'
import type { ZapperConfig } from '../types'

// Mock config
const mockConfig: ZapperConfig = {
  wagmiConfig: {} as any,
  chainId: 1,
  dtf: {
    address: '0x123' as `0x${string}`,
    symbol: 'TEST',
    name: 'Test DTF',
    decimals: 18,
  },
}

describe('Zapper Component', () => {
  it('renders in modal mode', () => {
    render(
      <Zapper config={mockConfig} mode="modal">
        <button>Open Zapper</button>
      </Zapper>
    )

    expect(screen.getByText('Open Zapper')).toBeInTheDocument()
  })

  it('renders in inline mode', () => {
    render(<Zapper config={mockConfig} mode="inline" />)

    // Should render the inline content directly
    expect(screen.getByText('Zap')).toBeInTheDocument()
  })

  it('accepts custom className', () => {
    const { container } = render(
      <Zapper config={mockConfig} mode="inline" className="custom-zapper" />
    )

    expect(container.querySelector('.custom-zapper')).toBeInTheDocument()
  })
})
