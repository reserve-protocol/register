import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ChainLogoStack, TokenLogoStack } from '@/components/entity-identity'
import { ChainId } from '@/utils/chains'

describe('canonical stacked identity geometry', () => {
  it('keeps chain artwork at the requested size while the separator wraps it', () => {
    render(
      <ChainLogoStack chains={[ChainId.Mainnet, ChainId.Base]} size={16} />
    )

    const stack = screen.getByTestId('canonical-chain-logo-stack')
    const frames = stack.querySelectorAll('[data-slot="logo-stack-frame"]')
    const artwork = stack.querySelector('[data-slot="logo-stack-artwork"]')

    expect(stack).toHaveStyle({ marginInlineStart: '-2px' })
    expect(frames).toHaveLength(2)
    expect(frames[0]).toHaveClass('border-2')
    expect(frames[0]).toHaveStyle({ borderRadius: '5.6px' })
    expect(frames[1]).toHaveStyle({ marginInlineStart: '-12px' })
    expect(artwork).toHaveStyle({ width: '16px', height: '16px' })
  })

  it('uses the same outside-separator and optical-axis model for token stacks', () => {
    render(
      <TokenLogoStack
        size={24}
        tokens={[
          { symbol: 'USDC', address: 'usdc', chain: ChainId.Base },
          { symbol: 'WETH', address: 'weth', chain: ChainId.Base },
        ]}
      />
    )

    const stack = screen.getByTestId('canonical-token-logo-stack')
    const frames = stack.querySelectorAll('[data-slot="logo-stack-frame"]')
    const artwork = stack.querySelector('[data-slot="logo-stack-artwork"]')

    expect(stack).toHaveStyle({ marginInlineStart: '-2px' })
    expect(frames).toHaveLength(2)
    expect(frames[0]).toHaveClass('border-2')
    expect(frames[0]).toHaveStyle({ borderRadius: '9999px' })
    expect(artwork).toHaveStyle({ width: '24px', height: '24px' })
  })
})
