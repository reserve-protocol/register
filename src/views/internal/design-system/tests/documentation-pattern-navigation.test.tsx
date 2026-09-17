import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'

import NavigationPatternDocumentation from '../documentation-pattern-navigation'

afterEach(() => {
  cleanup()
  document.documentElement.classList.remove('dark')
})

const renderNavigation = (
  entry = '/internal/design-system/patterns#navigation'
) =>
  render(
    <MemoryRouter initialEntries={[entry]}>
      <NavigationPatternDocumentation />
    </MemoryRouter>
  )

describe('navigation pattern documentation', () => {
  it('orders the complete Global and Product systems before secondary anatomy', () => {
    renderNavigation()

    const global = document.getElementById('navigation-global')!
    const product = document.getElementById('navigation-product')!
    const anatomy = document.getElementById('navigation-anatomy')!

    expect(global.compareDocumentPosition(product)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    )
    expect(product.compareDocumentPosition(anatomy)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    )
    expect(screen.getByRole('link', { name: 'Global system' })).toHaveAttribute(
      'href',
      '#navigation-global'
    )
    expect(
      screen.getByRole('link', { name: 'Product system' })
    ).toHaveAttribute('href', '#navigation-product')
  })

  it('reuses the real accepted owners and destination inventory in neutral hosts', () => {
    renderNavigation()

    expect(screen.getByTestId('navigation-global-desktop')).toContainElement(
      screen.getByTestId('global-navigation')
    )
    expect(screen.getByTestId('navigation-product-desktop')).toContainElement(
      screen.getAllByTestId('product-navigation')[0]
    )
    expect(screen.getAllByText('Discover DTFs').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Governance').length).toBeGreaterThan(0)
    expect(screen.getByTestId('neutral-product-host')).toBeVisible()

    expect(screen.queryByText('Performance')).toBeNull()
    expect(screen.queryByText('Index details')).toBeNull()
    expect(screen.queryByText(/Trade CMC20/i)).toBeNull()
  })

  it('makes important Global and Product states explicitly reachable', () => {
    renderNavigation(
      '/internal/design-system/patterns?navigation-global-constrained.state=destinations&navigation-product-desktop.state=switcher#navigation-product'
    )

    expect(screen.getByTestId('global-navigation-menu')).toBeVisible()
    const product = screen.getByTestId('navigation-product-desktop')
    expect(
      within(product).getByRole('navigation', { name: 'Switch DTF' })
    ).toBeVisible()
    expect(within(product).getAllByText('PHOTON').length).toBeGreaterThan(1)
    expect(within(product).queryByText('Overview')).toBeNull()
  })

  it('falls back unknown semantic query values without hiding the result', () => {
    renderNavigation(
      '/internal/design-system/patterns?navigation-product-desktop.state=unknown#navigation-product'
    )

    expect(screen.getByRole('status')).toHaveTextContent(
      'Unavailable state value “unknown”; showing “collapsed”.'
    )
    expect(
      screen
        .getByTestId('navigation-product-desktop')
        .querySelector('[data-expanded]')
    ).toBeNull()
  })

  it('keeps specimen theme interaction local to the constrained Global example', async () => {
    const user = userEvent.setup()
    document.documentElement.classList.add('dark')
    renderNavigation(
      '/internal/design-system/patterns?navigation-global-constrained.state=utilities#navigation-global'
    )

    const specimen = screen.getByTestId('navigation-global-constrained')
    await user.click(
      within(specimen).getByRole('radio', { name: 'Use light theme' })
    )

    expect(document.documentElement).toHaveClass('dark')
    expect(
      within(specimen).getByRole('radio', { name: 'Use light theme' })
    ).toHaveAttribute('data-state', 'on')
  })
})
