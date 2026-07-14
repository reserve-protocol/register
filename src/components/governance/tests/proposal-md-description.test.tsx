import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ProposalMdDescription from '../proposal-md-description'

// Renders through the REAL pipeline (MDEditor.Markdown + rehype-raw +
// rehype-sanitize), not the schema in isolation — plugin ordering is part of
// the security contract.
const renderMd = (description: string) =>
  render(<ProposalMdDescription description={description} />).container

describe('ProposalMdDescription sanitizer', () => {
  it('strips a raw iframe (no element, no src to load)', () => {
    const container = renderMd(
      'before\n\n<iframe src="https://evil.example/frame"></iframe>\n\nafter'
    )
    expect(container.querySelector('iframe')).toBeNull()
    expect(container.innerHTML).not.toContain('evil.example')
  })

  it('strips script elements entirely', () => {
    const container = renderMd(
      'text\n\n<script>window.__pwned = true</script>'
    )
    expect(container.querySelector('script')).toBeNull()
    expect(container.innerHTML).not.toContain('__pwned')
    expect(
      (window as unknown as Record<string, unknown>).__pwned
    ).toBeUndefined()
  })

  it('drops event-handler attributes like onerror', () => {
    const container = renderMd('<img src="x" onerror="window.__pwned=true">')
    expect(container.querySelector('img[onerror]')).toBeNull()
    expect(container.innerHTML).not.toContain('__pwned')
  })

  it('removes javascript: hrefs', () => {
    const container = renderMd('[hostile](javascript:alert(1))')
    const link = container.querySelector('a')
    const href = link?.getAttribute('href') ?? ''
    expect(href).not.toContain('javascript')
    expect(href).not.toContain('alert')
  })

  it('removes data: URLs in href and src', () => {
    const container = renderMd(
      '[data-link](data:text/html,<script>1</script>)\n\n<img src="data:text/html,x">'
    )
    expect(container.querySelector('a')?.getAttribute('href') ?? '').not.toContain(
      'data:'
    )
    expect(container.querySelector('img')?.getAttribute('src') ?? '').not.toContain(
      'data:'
    )
  })

  it('strips object, embed, and form elements', () => {
    const container = renderMd(
      [
        '<object data="https://evil.example/o"></object>',
        '',
        '<embed src="https://evil.example/e">',
        '',
        '<form action="https://evil.example/f"><input name="pw"></form>',
      ].join('\n')
    )
    expect(container.querySelector('object')).toBeNull()
    expect(container.querySelector('embed')).toBeNull()
    expect(container.querySelector('form')).toBeNull()
    expect(container.innerHTML).not.toContain('evil.example')
  })

  it('renders a realistic benign proposal unchanged', () => {
    const container = renderMd(
      [
        '# Increase basket weight for WETH',
        '',
        'This proposal **rebalances** the basket. See the [forum thread](https://forum.reserve.org/t/123).',
        '',
        '## Changes',
        '',
        '- Raise WETH to 40%',
        '- Lower USDC to 10%',
        '',
        '> Quorum: 4% of vlRSR',
        '',
        '```json',
        '{ "weight": "0.4" }',
        '```',
        '',
        '| Token | Weight |',
        '| ----- | ------ |',
        '| WETH  | 40%    |',
        '',
        '![chart](https://example.com/chart.png)',
      ].join('\n')
    )

    expect(container.querySelector('h1')?.textContent).toContain(
      'Increase basket weight for WETH'
    )
    expect(container.querySelector('strong')?.textContent).toBe('rebalances')
    expect(container.querySelector('a[href="https://forum.reserve.org/t/123"]')
    ).not.toBeNull()
    expect(container.querySelectorAll('li')).toHaveLength(2)
    expect(container.querySelector('blockquote')?.textContent).toContain(
      'Quorum'
    )
    expect(container.querySelector('pre code')?.textContent).toContain(
      '"weight"'
    )
    expect(container.querySelector('table td')?.textContent).toContain('WETH')
    expect(
      container.querySelector('img[src="https://example.com/chart.png"]')
    ).not.toBeNull()
  })
})
