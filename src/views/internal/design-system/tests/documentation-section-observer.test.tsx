import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  DocumentationSectionProvider,
  getDocumentationSections,
} from '../documentation-section-observer'

const PATHNAME = '/internal/design-system/components'

const LocationProbe = () => {
  const location = useLocation()
  return <output data-testid="location-probe">{location.hash}</output>
}

const renderSections = (anchorId: string) => {
  const sections = getDocumentationSections(PATHNAME)
  const scrollerRect = { top: 0 } as DOMRect
  let scrollTop = 0

  window.history.replaceState(null, '', `${PATHNAME}#${anchorId}`)

  const result = render(
    <BrowserRouter>
      <DocumentationSectionProvider>
        <div id="app-container">
          {sections.map(({ id }) => (
            <section id={id} key={id} />
          ))}
          <a href="#select">Select</a>
          <LocationProbe />
        </div>
      </DocumentationSectionProvider>
    </BrowserRouter>
  )
  const scroller = document.getElementById('app-container')!
  const target = document.getElementById(anchorId)!

  Object.defineProperties(scroller, {
    clientHeight: { configurable: true, value: 900 },
    scrollHeight: { configurable: true, value: 3000 },
    scrollTop: {
      configurable: true,
      get: () => scrollTop,
      set: (value: number) => {
        scrollTop = value
      },
    },
  })
  scroller.getBoundingClientRect = () => scrollerRect
  target.getBoundingClientRect = () => ({ top: 2116 - scrollTop }) as DOMRect
  scroller.scrollTo = vi.fn(
    (optionsOrX?: ScrollToOptions | number, y?: number) => {
      scrollTop =
        typeof optionsOrX === 'number'
          ? (y ?? scrollTop)
          : (optionsOrX?.top ?? scrollTop)
    }
  )

  return {
    ...result,
    scroller,
    setScrollTop: (value: number) => {
      scrollTop = value
    },
    sections,
  }
}

describe('DocumentationSectionProvider', () => {
  const animationFrames: FrameRequestCallback[] = []

  beforeEach(() => {
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      animationFrames.push(callback)
      return animationFrames.length
    })
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => undefined)
  })

  afterEach(() => {
    animationFrames.length = 0
    vi.restoreAllMocks()
    window.history.replaceState(null, '', '/')
  })

  const flushAnimationFrames = () => {
    act(() => {
      while (animationFrames.length) animationFrames.shift()?.(0)
    })
  }

  it('keeps a requested anchor through late layout until the user scrolls', () => {
    const { scroller, sections, setScrollTop } = renderSections('tabs')
    flushAnimationFrames()

    expect(screen.getByTestId('location-probe')).toHaveTextContent('#tabs')

    setScrollTop(2101)
    act(() => scroller.dispatchEvent(new Event('scroll')))
    flushAnimationFrames()

    expect(screen.getByTestId('location-probe')).toHaveTextContent('#tabs')

    act(() => scroller.dispatchEvent(new WheelEvent('wheel')))
    act(() => scroller.dispatchEvent(new Event('scroll')))
    flushAnimationFrames()

    expect(screen.getByTestId('location-probe')).toHaveTextContent(
      `#${sections.at(-1)?.id}`
    )
  })

  it('keeps anchor navigation in browser history', async () => {
    renderSections('tabs')
    flushAnimationFrames()

    fireEvent.click(screen.getByRole('link', { name: 'Select' }))
    flushAnimationFrames()
    expect(screen.getByTestId('location-probe')).toHaveTextContent('#select')

    act(() => window.history.back())

    await waitFor(() =>
      expect(screen.getByTestId('location-probe')).toHaveTextContent('#tabs')
    )
    flushAnimationFrames()
  })
})
