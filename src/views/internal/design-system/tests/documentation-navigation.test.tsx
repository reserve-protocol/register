import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import DocumentationNavigation from '../documentation-navigation'

let activeSectionId = 'button'
let activeSectionPath: readonly string[] = ['actions', 'button']

vi.mock('../documentation-section-observer', () => ({
  useDocumentationSection: () => ({
    activeSectionId,
    activeSectionPath,
    navigateToSection: vi.fn(),
    sections: [],
  }),
}))

const renderNavigation = () =>
  render(
    <MemoryRouter initialEntries={['/internal/design-system/components']}>
      <DocumentationNavigation />
    </MemoryRouter>
  )

describe('DocumentationNavigation', () => {
  const scrollIntoView = vi.fn()

  beforeEach(() => {
    activeSectionId = 'button'
    activeSectionPath = ['actions', 'button']
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoView,
    })
  })

  afterEach(() => {
    scrollIntoView.mockClear()
    vi.restoreAllMocks()
  })

  it('keeps the main destinations visible and only shows the current sub-navigation', () => {
    renderNavigation()
    const componentNavigationToggle = screen.getByRole('button', {
      name: 'Navigation',
    })

    expect(screen.getByRole('link', { name: 'Foundations' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Patterns' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Workbench' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Internal records' })).toBeVisible()
    expect(componentNavigationToggle).toBeVisible()
    expect(
      screen.queryByRole('button', { name: 'Navigation systems' })
    ).not.toBeInTheDocument()
  })

  it('expands the active path only inside its current route', () => {
    activeSectionId = 'global-navigation'
    activeSectionPath = ['navigation', 'global-navigation']
    renderNavigation()

    expect(screen.getByRole('button', { name: 'Navigation' })).toHaveAttribute(
      'aria-expanded',
      'true'
    )
    expect(
      screen.queryByRole('button', { name: 'Navigation systems' })
    ).not.toBeInTheDocument()
  })

  it('reveals a scroll-tracked active link without fighting sidebar interaction', () => {
    const { rerender } = renderNavigation()
    expect(scrollIntoView).toHaveBeenLastCalledWith({ block: 'nearest' })
    const callCount = scrollIntoView.mock.calls.length
    const navigation = screen.getByTestId('documentation-current-subnavigation')

    fireEvent.pointerEnter(navigation)
    activeSectionId = 'icon-button'
    activeSectionPath = ['actions', 'icon-button']
    rerender(
      <MemoryRouter initialEntries={['/internal/design-system/components']}>
        <DocumentationNavigation />
      </MemoryRouter>
    )

    expect(scrollIntoView).toHaveBeenCalledTimes(callCount)

    fireEvent.pointerLeave(navigation)

    expect(scrollIntoView).toHaveBeenCalledTimes(callCount + 1)
  })
})
