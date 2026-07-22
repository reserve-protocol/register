import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import DecimalDisplay from '../index'

// Composed-consumer render (Z11): the real <DecimalDisplay> component — not just
// the formatter — must render "—" for non-finite input, and a `$`-prefixed
// caller (the common auction/money pattern) must show "$—", never "$0".
describe('DecimalDisplay render', () => {
  it('renders non-finite values as an em dash, not 0', () => {
    const { container } = render(<DecimalDisplay value={NaN} />)
    expect(container.textContent).toBe('—')

    const inf = render(<DecimalDisplay value={Infinity} />)
    expect(inf.container.textContent).toBe('—')
  })

  it('a $-prefixed caller renders "$—", not "$0"', () => {
    const { container } = render(
      <span>
        ${<DecimalDisplay value={NaN} />}
      </span>
    )
    expect(container.textContent).toBe('$—')
    expect(container.textContent).not.toContain('$0')
  })

  it('still renders finite money normally', () => {
    const { container } = render(<DecimalDisplay value={1234.5} />)
    expect(container.textContent).toBe('1,234.5')
  })
})
