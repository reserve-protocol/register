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

const renderNavigation = (touchTargets = false) =>
  render(
    <MemoryRouter initialEntries={['/internal/design-system/components']}>
      <DocumentationNavigation touchTargets={touchTargets} />
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

  it('shows one expanded hierarchy for every destination', () => {
    renderNavigation()

    expect(screen.getByRole('link', { name: 'Foundations' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Patterns' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Workbench' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Internal records' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Color' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Button' })).toBeVisible()
    expect(
      screen.getByRole('link', { name: 'Navigation systems' })
    ).toBeVisible()
    expect(screen.getByRole('link', { name: 'Current review' })).toBeVisible()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('marks the active component and its visible ancestors', () => {
    activeSectionId = 'global-navigation'
    activeSectionPath = ['navigation', 'global-navigation']
    renderNavigation()

    expect(screen.getByRole('link', { name: 'Components' })).toHaveAttribute(
      'data-active',
      'true'
    )
    expect(screen.getByRole('link', { name: 'Navigation' })).toHaveAttribute(
      'data-active',
      'true'
    )
    expect(
      screen.getByRole('link', { name: 'Global navigation' })
    ).toHaveAttribute('aria-current', 'location')
  })

  it('uses a compact text hierarchy without filled subsection rows', () => {
    renderNavigation()

    const current = screen.getByRole('link', { name: 'Button' })
    const sibling = screen.getByRole('link', { name: 'Icon button' })
    const group = screen.getByRole('link', { name: 'Components' })

    expect(current).toHaveClass('text-primary', 'py-0.5')
    expect(current).not.toHaveClass('bg-muted/60', 'rounded-sm', 'min-h-9')
    expect(sibling).not.toHaveClass('hover:bg-muted')
    expect(group).not.toHaveClass('bg-muted/60', 'hover:bg-muted')
  })

  it('keeps compact desktop rows while restoring full touch targets in the mobile drawer', () => {
    const desktop = renderNavigation()
    expect(screen.getByRole('link', { name: 'Button' })).not.toHaveClass(
      'min-h-11'
    )
    desktop.unmount()

    renderNavigation(true)
    expect(screen.getByRole('link', { name: 'Button' })).toHaveClass('min-h-11')
    expect(screen.getByRole('link', { name: 'Components' })).toHaveClass(
      'min-h-11'
    )
  })

  it('reveals a scroll-tracked active link without fighting sidebar interaction', () => {
    const { rerender } = renderNavigation()
    expect(scrollIntoView).toHaveBeenLastCalledWith({ block: 'nearest' })
    const callCount = scrollIntoView.mock.calls.length
    const navigation = screen.getByTestId('documentation-navigation-scroll')

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
