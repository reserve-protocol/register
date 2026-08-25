import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import NavigationSystemsStateSheet from '../navigation-systems-state-sheet'

describe('navigation review composition', () => {
  it('keeps global and DTF mobile entry points in separate specimens', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    })

    render(<NavigationSystemsStateSheet />)

    const globalMobile = screen.getByTestId('mobile-global-navigation-specimen')
    const desktop = screen.getByTestId('coordinated-navigation-desktop')
    const productMobile = screen.getByTestId(
      'mobile-product-navigation-specimen'
    )
    const mobileSwitcherTrigger = within(productMobile).getByRole('button', {
      name: 'Switch DTF, current CMC20',
    })
    const mobileSwitcherLogo = within(mobileSwitcherTrigger).getByTestId(
      'mobile-product-switcher-token-logo'
    )
    for (const utilityTrigger of within(globalMobile).getAllByRole('button', {
      name: 'Search, theme, and language',
    })) {
      expect(utilityTrigger).toHaveAttribute('data-size', 'compact')
    }
    for (const connectButton of within(globalMobile).getAllByRole('button', {
      name: 'Connect',
    })) {
      expect(connectButton).toHaveAttribute('data-size', 'compact')
    }
    expect(
      within(globalMobile).getByRole('button', {
        name: 'Open global navigation',
      })
    ).toHaveAttribute('aria-expanded', 'false')
    const connectedHeader = within(globalMobile).getByTestId(
      'mobile-header-connected-state'
    )
    const connectedAccount = within(connectedHeader).getByRole('button', {
      name: 'Connected wallet 0x71F9…2A6C',
    })
    expect(connectedAccount).toHaveAttribute('data-size', 'compact')
    expect(connectedAccount).toHaveTextContent('0x71…2A6C')
    expect(connectedAccount).toHaveClass('gap-1', '[&>svg]:size-3.5')
    expect(connectedAccount.querySelector('svg')).toBeInTheDocument()
    const connectedDesktopControls = screen
      .getAllByTestId('global-application-controls')
      .find((control) => control.dataset.accountState === 'connected')
    expect(connectedDesktopControls).toBeDefined()
    const connectedDesktopAccount = within(
      connectedDesktopControls as HTMLElement
    ).getByRole('button', {
      name: 'Connected wallet 0x71F9…2A6C',
    })
    expect(connectedDesktopAccount).toHaveTextContent('0x71F9…2A6C')
    expect(connectedDesktopAccount).toHaveClass('gap-1', '[&>svg]:size-3.5')
    expect(
      within(globalMobile).getByTestId('mobile-header-transparent-state')
    ).toHaveAttribute('data-surface', 'transparent')
    const narrowHeader = within(globalMobile).getByTestId(
      'mobile-header-narrow-state'
    )
    expect(narrowHeader).toHaveClass('max-w-[360px]')
    expect(
      within(narrowHeader).getByRole('button', {
        name: 'Connected wallet 0x71F9…2A6C',
      })
    ).toHaveTextContent('0x71…2A6C')
    const compactBrandHeader = within(globalMobile).getByTestId(
      'mobile-header-compact-brand-state'
    )
    expect(compactBrandHeader).toHaveClass('max-w-[320px]')
    expect(
      within(compactBrandHeader).getByRole('button', {
        name: 'Connected wallet 0x71F9…2A6C',
      })
    ).toHaveTextContent('0x71…2A6C')
    expect(
      within(compactBrandHeader).getByTestId('mobile-brand-wordmark')
    ).toHaveAttribute('data-mobile-header-brand', 'wordmark')
    expect(
      within(compactBrandHeader).getByTestId('mobile-brand-mark')
    ).toHaveAttribute('data-mobile-header-brand', 'mark')
    expect(mobileSwitcherLogo).toHaveAttribute('width', '32')
    expect(mobileSwitcherLogo).toHaveAttribute('height', '32')
    expect(
      within(mobileSwitcherTrigger).queryByTestId('canonical-chain-badged-logo')
    ).not.toBeInTheDocument()

    const globalNavigationTrigger = within(globalMobile).getByRole('button', {
      name: 'Open global navigation',
    })
    fireEvent.click(globalNavigationTrigger)
    expect(
      within(globalMobile).getByRole('button', {
        name: 'Close global navigation',
      })
    ).toHaveFocus()
    expect(
      within(globalMobile).getByRole('navigation', {
        name: 'Global mobile navigation',
      })
    ).toBeVisible()
    const expectedPrimaryDestinations = [
      'Discover DTFs',
      'Participate & Earn',
      'Portfolio',
      'Create DTF',
    ]
    const expectedOverflowDestinations = [
      'DTF Explorer',
      'Bridge',
      'Create Yield DTF',
      'Feedback & Requests',
      'Blog',
      'Docs',
      'Forum',
      'Telegram',
    ]
    for (const label of [
      ...expectedPrimaryDestinations,
      ...expectedOverflowDestinations,
    ]) {
      expect(
        within(globalMobile).getByRole('link', { name: new RegExp(label) })
      ).toBeVisible()
    }

    fireEvent.click(
      within(globalMobile).getByRole('button', {
        name: 'Close global navigation',
      })
    )
    const restoredGlobalNavigationTrigger = within(globalMobile).getByRole(
      'button',
      { name: 'Open global navigation' }
    )
    await waitFor(() => expect(restoredGlobalNavigationTrigger).toHaveFocus())

    fireEvent.pointerDown(
      within(desktop).getByRole('button', { name: 'More' }),
      { button: 0, ctrlKey: false }
    )
    const desktopOverflow = screen.getByTestId('global-navigation-overflow')
    for (const label of expectedOverflowDestinations) {
      expect(
        within(desktopOverflow).getByRole('menuitem', {
          name: new RegExp(label),
        })
      ).toBeVisible()
    }
    expect(within(desktopOverflow).getAllByRole('menuitem')).toHaveLength(8)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(
      within(productMobile).queryByRole('navigation', {
        name: 'Global mobile navigation',
      })
    ).not.toBeInTheDocument()

    fireEvent.click(mobileSwitcherTrigger)
    const switcherDrawer = screen.getByRole('dialog', {
      name: 'Switch DTF',
    })
    expect(switcherDrawer).toHaveAttribute(
      'data-testid',
      'canonical-drawer-content'
    )
    expect(switcherDrawer).toHaveClass(
      'absolute',
      'inset-x-0',
      'bottom-0',
      'p-2'
    )
    expect(switcherDrawer).not.toHaveClass('fixed')
    expect(screen.getByTestId('canonical-drawer-overlay')).toHaveClass(
      'absolute'
    )
    expect(
      switcherDrawer.querySelector(
        '[data-slot="mobile-navigation-drawer-header"]'
      )
    ).toHaveClass('px-4', 'pb-2', 'pt-4')
    expect(
      within(switcherDrawer).getByText('Switch DTF', {
        selector: '[data-slot="mobile-navigation-drawer-title"]',
      })
    ).toHaveClass('text-base', 'font-medium', 'leading-6')
    expect(
      within(switcherDrawer).getByRole('button', {
        name: 'Close Switch DTF',
      })
    ).toHaveAttribute('data-tone', 'secondary')
    expect(
      within(switcherDrawer).getByRole('navigation', { name: 'Switch DTF' })
    ).toBeVisible()
    expect(
      within(productMobile).queryByRole('link', { name: 'CMC20' })
    ).not.toBeInTheDocument()

    fireEvent.keyDown(switcherDrawer, { key: 'Escape' })
    expect(
      screen.queryByRole('dialog', { name: 'Switch DTF' })
    ).not.toBeInTheDocument()
    await waitFor(() => expect(mobileSwitcherTrigger).toHaveFocus())

    const mobilePageTrigger = within(productMobile).getByRole('button', {
      name: 'Open CMC20 page navigation',
    })
    expect(
      mobilePageTrigger.querySelector(
        '[data-slot="product-navigation-indicator"]'
      )
    ).not.toBeInTheDocument()
    fireEvent.click(mobilePageTrigger)
    expect(
      within(productMobile).queryByRole('navigation', { name: 'Switch DTF' })
    ).not.toBeInTheDocument()
    const pagesDrawer = screen.getByRole('dialog', {
      name: 'CMC20 pages',
    })
    expect(pagesDrawer).toHaveClass('inset-x-0', 'bottom-0')
    expect(
      within(pagesDrawer).getByRole('navigation', {
        name: 'CMC20 page navigation',
      })
    ).toBeVisible()
    expect(
      pagesDrawer.querySelector(
        '[data-navigation-id="governance"] [data-slot="product-navigation-indicator"]'
      )
    ).toBeInTheDocument()
    expect(
      pagesDrawer.querySelector('[data-slot="product-navigation-menu-items"]')
    ).toHaveClass('pt-4')
    expect(
      within(pagesDrawer).getByRole('link', { name: 'Overview' })
    ).toHaveAttribute('aria-current', 'page')
    expect(
      within(pagesDrawer).getByRole('link', { name: /^Auctions/ })
    ).not.toHaveAttribute('aria-disabled')
    const contractGroup = within(pagesDrawer).getByTestId(
      'product-token-contracts'
    )
    const supplementary = contractGroup.closest(
      '[data-slot="product-navigation-supplementary"]'
    )
    expect(supplementary).toHaveClass('mt-4')
    expect(supplementary).not.toHaveClass('mt-2', 'pb-2')
    expect(supplementary?.closest('nav')).toBeNull()
    expect(
      within(contractGroup).getByText('CMC20 token addresses')
    ).toBeVisible()
    const contractAddresses = within(contractGroup).getAllByTestId(
      'product-token-contract'
    )
    expect(contractAddresses).toHaveLength(2)
    for (const contractAddress of contractAddresses) {
      expect(contractAddress).toHaveClass(
        'rounded-full',
        'px-4',
        'py-3',
        'ring-border'
      )
      expect(contractAddress).not.toHaveClass('rounded-lg', 'bg-secondary')
    }
    expect(contractAddresses[0]).toHaveTextContent('BNB Chain · Native')
    expect(contractAddresses[1]).toHaveTextContent('Base · Bridged')
    for (const contractAddress of contractAddresses) {
      const chainMark = within(contractAddress).getByTestId(
        'product-token-contract-chain'
      )
      expect(chainMark).toHaveAttribute('width', '16')
      expect(chainMark).toHaveAttribute('height', '16')
      expect(chainMark.parentElement).toHaveClass('size-6')
    }
    expect(within(contractGroup).getByText('0x2f8A...6867')).toBeVisible()
    expect(within(contractGroup).getByText('0xa0A8...fad3')).toBeVisible()
    expect(
      within(contractGroup).getByText(
        '0x2f8A339B5889FfaC4c5A956787cdA593b3c36867'
      )
    ).toHaveClass('sr-only')

    await act(async () => {
      fireEvent.click(
        within(contractAddresses[0]).getByRole('button', {
          name: 'Copy to clipboard',
        })
      )
    })
    expect(writeText).toHaveBeenCalledWith(
      '0x2f8A339B5889FfaC4c5A956787cdA593b3c36867'
    )

    await act(async () => {
      fireEvent.click(
        within(contractAddresses[1]).getByRole('button', {
          name: 'Copy to clipboard',
        })
      )
    })
    expect(writeText).toHaveBeenCalledWith(
      '0xa0A8481fc246Cd12f75227aBB96220fF5360fad3'
    )

    fireEvent.pointerDown(screen.getByTestId('canonical-drawer-overlay'), {
      button: 0,
      ctrlKey: false,
    })
    await waitFor(() =>
      expect(
        screen.queryByRole('dialog', { name: 'CMC20 pages' })
      ).not.toBeInTheDocument()
    )
    await waitFor(() =>
      expect(
        within(productMobile).getByRole('button', {
          name: 'Open CMC20 page navigation',
        })
      ).toHaveFocus()
    )
  })

  it('switches DTF context and returns to page navigation', () => {
    render(<NavigationSystemsStateSheet />)

    const desktop = screen.getByTestId('coordinated-navigation-desktop')
    const collapsedTrigger = within(desktop).getByRole('button', {
      name: 'Switch DTF, current CMC20',
    })
    expect(collapsedTrigger).toHaveClass('ring-1', 'ring-border')
    expect(
      within(collapsedTrigger).getByTestId('collapsed-product-identity-logo')
    ).toBeVisible()
    expect(
      within(collapsedTrigger).queryByTestId('canonical-chain-badged-logo')
    ).not.toBeInTheDocument()
    expect(
      collapsedTrigger.querySelector('[data-slot="product-switcher-cue"]')
    ).not.toBeInTheDocument()
    fireEvent.click(collapsedTrigger)

    const switcher = within(desktop).getByRole('navigation', {
      name: 'Switch DTF',
    })
    expect(switcher).toBeVisible()
    expect(
      switcher.querySelector('[data-slot="product-navigation-rail-items"]')
    ).toHaveClass('overflow-y-auto', 'pb-8')
    expect(
      switcher.querySelector('[data-slot="product-navigation-overflow-fade"]')
    ).toBeInTheDocument()
    expect(within(switcher).getAllByRole('link')).toHaveLength(15)
    expect(
      within(desktop).queryByRole('link', { name: 'CMC20' })
    ).not.toBeInTheDocument()
    const railShell = within(desktop).getByTestId(
      'product-navigation-rail-shell'
    )
    fireEvent.mouseLeave(railShell)
    expect(
      within(desktop).getByRole('navigation', {
        name: 'CMC20 on BNB Chain navigation',
      })
    ).toBeVisible()
    expect(
      within(desktop).getByRole('link', { name: 'Overview' })
    ).toHaveAttribute('aria-current', 'page')
    fireEvent.mouseEnter(railShell)
    fireEvent.click(
      within(desktop).getByRole('button', {
        name: 'Switch DTF, current CMC20',
      })
    )
    fireEvent.click(
      within(desktop).getByRole('link', {
        name: /^LCAP/,
      })
    )

    expect(
      within(desktop).getByRole('navigation', {
        name: 'LCAP on Base navigation',
      })
    ).toBeVisible()
    expect(
      within(desktop).getByRole('button', { name: 'Trade LCAP' })
    ).toBeVisible()

    fireEvent.click(
      within(desktop).getByRole('button', {
        name: 'Switch DTF, current LCAP',
      })
    )
    expect(
      within(desktop).queryByRole('link', { name: 'LCAP' })
    ).not.toBeInTheDocument()
    expect(
      within(desktop).getByRole('link', {
        name: /^CMC20/,
      })
    ).toBeVisible()
  })
})
