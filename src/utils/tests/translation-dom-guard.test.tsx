import { render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { installTranslationDomGuard } from '../translation-dom-guard'

const textNodes = (root: HTMLElement) => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  const nodes: Text[] = []
  while (walker.nextNode()) nodes.push(walker.currentNode as Text)
  return nodes
}

// Every text node moves into a <font>
const translate = (root: HTMLElement) => {
  for (const node of textNodes(root)) {
    const font = document.createElement('font')
    node.parentNode!.replaceChild(font, node)
    font.appendChild(node)
  }
}

// Every text node is swapped for a <font> holding a translated copy
const translateDetached = (root: HTMLElement) => {
  for (const node of textNodes(root)) {
    const font = document.createElement('font')
    font.textContent = node.data
    node.parentNode!.replaceChild(font, node)
  }
}

const Signed = ({ value }: { value: number }) => (
  <span>
    {value > 0 ? '' : '+'}
    {Math.abs(value)}%
  </span>
)

const Loading = ({ loading }: { loading: boolean }) => (
  <button>
    {loading && <i data-testid="spinner" />}
    Submit
  </button>
)

describe('translation DOM guard', () => {
  let uninstall: () => void

  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    uninstall?.()
    vi.restoreAllMocks()
  })

  it('reproduces the crash without the guard', () => {
    const { container, rerender } = render(<Signed value={-1} />)
    translate(container)
    expect(() => rerender(<Signed value={1} />)).toThrow()
  })

  it('removes a text node the translator moved', () => {
    uninstall = installTranslationDomGuard()
    const { container, rerender } = render(<Signed value={-1} />)
    translate(container)
    expect(() => rerender(<Signed value={1} />)).not.toThrow()
    expect(container.textContent).toBe('1%')
  })

  it('inserts before the wrapper of a moved text node', () => {
    uninstall = installTranslationDomGuard()
    const { container, rerender, queryByTestId } = render(
      <Loading loading={false} />
    )
    translate(container)
    expect(() => rerender(<Loading loading />)).not.toThrow()
    expect(queryByTestId('spinner')).toBeTruthy()
    expect(container.textContent).toBe('Submit')
  })

  it('skips nodes the translator detached', () => {
    uninstall = installTranslationDomGuard()
    const { container, rerender } = render(<Signed value={-1} />)
    translateDetached(container)
    expect(() => rerender(<Signed value={1} />)).not.toThrow()

    const loading = render(<Loading loading={false} />)
    translateDetached(loading.container)
    expect(() => loading.rerender(<Loading loading />)).not.toThrow()
  })

  it('leaves regular DOM operations untouched', () => {
    uninstall = installTranslationDomGuard()
    const { container, rerender, getByTestId } = render(
      <Loading loading={false} />
    )
    rerender(<Loading loading />)
    expect(getByTestId('spinner')).toBeTruthy()
    rerender(<Loading loading={false} />)
    expect(container.textContent).toBe('Submit')
    expect(console.warn).not.toHaveBeenCalled()
  })
})
