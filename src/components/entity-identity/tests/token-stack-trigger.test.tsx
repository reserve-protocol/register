import { fireEvent, render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { TokenStackTrigger } from '../token-stack-trigger'

describe('TokenStackTrigger', () => {
  it('forwards the named button, ref and events without inventing a chevron', () => {
    const onClick = vi.fn()
    const ref = createRef<HTMLButtonElement>()
    render(
      <TokenStackTrigger
        ref={ref}
        aria-label="Basket"
        tokens={[{ symbol: 'ETH' }]}
        remainingCount={14}
        onClick={onClick}
      />
    )
    const button = screen.getByRole('button', { name: 'Basket' })
    expect(ref.current).toBe(button)
    expect(button).toHaveTextContent('+14')
    expect(button.querySelector('svg')).toBeNull()
    fireEvent.click(button)
    expect(onClick).toHaveBeenCalledOnce()
  })
  it('blocks activation while disabled', () => {
    const onClick = vi.fn()
    render(
      <TokenStackTrigger
        aria-label="Basket"
        tokens={[{ symbol: 'ETH' }]}
        disabled
        onClick={onClick}
      />
    )
    const button = screen.getByRole('button', { name: 'Basket' })
    expect(button).toBeDisabled()
    expect(button).not.toHaveTextContent('+0')
    fireEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })
})
