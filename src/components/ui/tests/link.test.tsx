import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Link } from '../link'

describe('Link', () => {
  it('defaults to target="_blank" with rel="noopener noreferrer"', () => {
    const { container } = render(<Link href="https://example.com">out</Link>)
    const anchor = container.querySelector('a')
    expect(anchor?.getAttribute('target')).toBe('_blank')
    expect(anchor?.getAttribute('rel')).toBe('noopener noreferrer')
  })

  it('lets callers override rel', () => {
    const { container } = render(
      <Link href="https://example.com" rel="nofollow">
        out
      </Link>
    )
    expect(container.querySelector('a')?.getAttribute('rel')).toBe('nofollow')
  })

  it('omits rel when target is not _blank', () => {
    const { container } = render(
      <Link href="/local" target="_self">
        in
      </Link>
    )
    const anchor = container.querySelector('a')
    expect(anchor?.getAttribute('target')).toBe('_self')
    expect(anchor?.getAttribute('rel')).toBeNull()
  })
})
