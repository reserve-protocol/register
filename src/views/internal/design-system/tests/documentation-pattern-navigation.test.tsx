import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

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
  it('orders the complete systems without a duplicate inline navigation', () => {
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
    expect(screen.queryByRole('link', { name: 'Global system' })).toBeNull()
    expect(screen.queryByRole('link', { name: 'Product system' })).toBeNull()
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
    expect(within(product).getByText('PHOTON')).toBeVisible()
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

  it('keeps the constrained utility surface inside a tall enough specimen host', () => {
    renderNavigation(
      '/internal/design-system/patterns?navigation-global-constrained.state=utilities#navigation-global'
    )

    const specimen = screen.getByTestId('navigation-global-constrained')
    expect(within(specimen).getByTestId('global-constrained-host')).toHaveClass(
      'min-h-[22rem]'
    )
    expect(
      within(specimen).getByLabelText('Application utilities')
    ).toBeVisible()
  })

  it('expands the desktop Product rail as an overlay on hover and focus', async () => {
    const user = userEvent.setup()
    renderNavigation()

    const specimen = screen.getByTestId('navigation-product-desktop')
    const host = within(specimen).getByTestId('neutral-product-host')
    const railShell = within(specimen).getByTestId(
      'product-navigation-rail-shell'
    )
    const navigation = within(specimen).getAllByTestId('product-navigation')[0]

    expect(host).toHaveClass('grid-cols-[72px_minmax(0,1fr)]')
    expect(railShell).toHaveClass('absolute')
    expect(navigation).not.toHaveAttribute('data-expanded')

    await user.hover(railShell)
    expect(navigation).toHaveAttribute('data-expanded', 'true')

    await user.unhover(railShell)
    expect(navigation).not.toHaveAttribute('data-expanded')

    fireEvent.focus(
      within(specimen).getByRole('button', { name: /Switch DTF/ })
    )
    expect(navigation).toHaveAttribute('data-expanded', 'true')
  })

  it('uses the accepted full-canvas desktop Product host geometry', () => {
    renderNavigation()

    const specimen = screen.getByTestId('navigation-product-desktop')
    const host = within(specimen).getByTestId('neutral-product-host')
    const boundary = host.closest('[data-specimen-boundary]')

    expect(boundary).toHaveAttribute('data-specimen-mode', 'full-canvas')
    expect(boundary).toHaveAttribute('data-specimen-padding', 'none')
    expect(host).toHaveClass(
      'h-[480px]',
      'w-full',
      'grid-cols-[72px_minmax(0,1fr)]',
      'gap-0.5',
      'bg-secondary'
    )
    expect(
      within(host).getByLabelText('Neutral two-column product structure')
    ).toHaveClass('gap-px', 'bg-secondary')
    expect(within(host).getByTestId('product-primary-region')).toHaveClass(
      'h-full',
      'bg-card'
    )
    expect(within(host).getByTestId('product-supporting-region')).toHaveClass(
      'h-full',
      'bg-card'
    )
  })

  it('selects a desktop DTF once and returns to expanded page navigation', async () => {
    const user = userEvent.setup()
    renderNavigation(
      '/internal/design-system/patterns?navigation-product-desktop.state=switcher#navigation-product'
    )

    const specimen = screen.getByTestId('navigation-product-desktop')
    fireEvent.mouseLeave(
      within(specimen).getByTestId('product-navigation-rail-shell')
    )
    expect(
      within(specimen).getByRole('radio', { name: 'Switcher' })
    ).toHaveAttribute('data-state', 'on')
    await user.click(within(specimen).getByRole('link', { name: /^PHOTON/ }))

    expect(
      within(specimen).getByLabelText('Product identity')
    ).toHaveTextContent('PHOTON')
    expect(
      within(specimen).getByRole('radio', { name: 'Expanded' })
    ).toHaveAttribute('data-state', 'on')
    expect(
      within(specimen).getByRole('navigation', { name: 'PHOTON navigation' })
    ).toBeVisible()
  })

  it('uses the accepted contained drawer for constrained Product navigation', async () => {
    const user = userEvent.setup()
    renderNavigation(
      '/internal/design-system/patterns?navigation-product-constrained.state=switcher#navigation-product'
    )

    const dialog = screen.getByRole('dialog', { name: 'Switch DTF' })
    expect(dialog).toHaveAttribute(
      'data-slot',
      'mobile-navigation-bottom-drawer'
    )
    expect(within(dialog).getAllByRole('link')).toHaveLength(15)
    expect(within(dialog).getByTestId('product-navigation-shell')).toHaveClass(
      'flex-1'
    )

    await user.keyboard('{Escape}')
    await waitFor(() =>
      expect(
        screen.queryByRole('dialog', { name: 'Switch DTF' })
      ).not.toBeInTheDocument()
    )
  })

  it('restores the constrained switcher trigger after Escape dismissal', async () => {
    const user = userEvent.setup()
    renderNavigation()

    const specimen = screen.getByTestId('navigation-product-constrained')
    const trigger = within(specimen).getByRole('button', {
      name: 'Switch DTF, current CMC20',
    })
    await user.click(trigger)

    const dialog = screen.getByRole('dialog', { name: 'Switch DTF' })
    fireEvent.keyDown(dialog, { key: 'Escape' })

    await waitFor(() => expect(dialog).not.toBeInTheDocument())
    expect(trigger).toBeInTheDocument()
    await waitFor(() => expect(trigger).toHaveFocus())
  })

  it('restores the constrained pages trigger after close and outside dismissal', async () => {
    const user = userEvent.setup()
    renderNavigation()

    const specimen = screen.getByTestId('navigation-product-constrained')
    const trigger = within(specimen).getByRole('button', {
      name: 'Open CMC20 page navigation',
    })
    await user.click(trigger)

    let dialog = screen.getByRole('dialog', { name: 'CMC20 pages' })
    await user.click(
      within(dialog).getByRole('button', { name: 'Close CMC20 pages' })
    )
    await waitFor(() => expect(dialog).not.toBeInTheDocument())
    expect(trigger).toBeInTheDocument()
    await waitFor(() => expect(trigger).toHaveFocus())

    await user.click(trigger)
    dialog = screen.getByRole('dialog', { name: 'CMC20 pages' })
    fireEvent.pointerDown(screen.getByTestId('canonical-drawer-overlay'), {
      button: 0,
      ctrlKey: false,
    })
    await waitFor(() => expect(dialog).not.toBeInTheDocument())
    expect(trigger).toBeInTheDocument()
    await waitFor(() => expect(trigger).toHaveFocus())
  })

  it('restores the production-evidenced mobile action composition', async () => {
    const user = userEvent.setup()
    renderNavigation()

    const specimen = screen.getByTestId('navigation-product-constrained')
    const host = within(specimen).getByTestId('mobile-product-host')
    expect(host).toHaveClass(
      'h-[560px]',
      'w-[390px]',
      'min-w-[390px]',
      'max-w-none',
      'bg-card'
    )
    expect(
      within(specimen).getByRole('button', {
        name: 'Open CMC20 page navigation',
      })
    ).toBeVisible()
    expect(
      within(specimen).getByRole('link', { name: 'View portfolio' })
    ).toBeVisible()
    expect(
      within(specimen).getByRole('button', { name: 'Buy / Sell' })
    ).toBeVisible()
    expect(
      within(specimen).getByRole('button', { name: 'Ask Reserve AI' })
    ).toBeVisible()

    await user.click(within(specimen).getByRole('radio', { name: 'Visitor' }))
    expect(
      within(specimen).queryByRole('link', { name: 'View portfolio' })
    ).toBeNull()
    expect(
      within(specimen).getByRole('button', { name: 'Buy / Sell' })
    ).toBeVisible()

    await user.click(
      within(specimen).getByRole('radio', { name: 'Eligibility' })
    )
    expect(
      within(specimen).getByRole('button', { name: 'Verify eligibility' })
    ).toBeVisible()
    expect(
      within(specimen).queryByRole('link', { name: 'View portfolio' })
    ).toBeNull()
  })

  it('reserves enough documentation host height for Global overflow', () => {
    renderNavigation(
      '/internal/design-system/patterns?navigation-global-desktop.state=overflow#navigation-global'
    )

    const specimen = screen.getByTestId('navigation-global-desktop')
    expect(specimen.querySelector('[data-specimen-boundary]')).toHaveAttribute(
      'data-specimen-stable-height',
      'standard'
    )
    expect(screen.getByTestId('global-navigation-overflow')).toBeVisible()
  })

  it('selects a constrained DTF once and closes the switcher drawer', async () => {
    const user = userEvent.setup()
    renderNavigation(
      '/internal/design-system/patterns?navigation-product-constrained.state=switcher#navigation-product'
    )

    const specimen = screen.getByTestId('navigation-product-constrained')
    const dialog = screen.getByRole('dialog', { name: 'Switch DTF' })
    await user.click(within(dialog).getByRole('link', { name: /^PHOTON/ }))

    await waitFor(() =>
      expect(
        screen.queryByRole('dialog', { name: 'Switch DTF' })
      ).not.toBeInTheDocument()
    )
    expect(
      within(specimen).getByLabelText('Product identity')
    ).toHaveTextContent('PHOTON')
    expect(
      within(specimen).getByRole('button', {
        name: 'Switch DTF, current PHOTON',
      })
    ).toBeVisible()
  })

  it('scrolls the accepted desktop Global host to reveal identity actions', async () => {
    const user = userEvent.setup()
    renderNavigation()

    const specimen = screen.getByTestId('navigation-global-desktop')
    const scrollHost = within(specimen).getByTestId(
      'global-desktop-scroll-host'
    )
    const scrollTo = vi.fn()
    Object.defineProperty(scrollHost, 'scrollWidth', {
      configurable: true,
      value: 1200,
    })
    scrollHost.scrollTo = scrollTo

    await user.click(within(specimen).getByRole('radio', { name: 'Account' }))

    expect(scrollTo).toHaveBeenCalledWith({
      behavior: 'smooth',
      left: 1200,
    })
    expect(specimen).toHaveTextContent(/scroll horizontally/i)
  })

  it('declares provider-safe placeholder marks in both Product specimens', () => {
    renderNavigation()

    expect(
      screen.getAllByText(/initials are provider-safe placeholder marks/i)
    ).toHaveLength(2)
  })
})
