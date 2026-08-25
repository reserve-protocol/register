import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import {
  GlobalNavigation,
  GlobalNavigationMenu,
  ProductNavigation,
  ProductNavigationIdentity,
  ProductNavigationIdentityTrigger,
  ProductNavigationItem,
  ProductNavigationMobileIdentityTrigger,
  type NavigationDestination,
} from '../navigation'
import { PerformanceValue } from '../performance-value'

const destinations: NavigationDestination[] = [
  {
    id: 'overview',
    href: '/overview',
    label: 'Overview',
    icon: <svg aria-hidden="true" />,
  },
  { id: 'governance', href: '/governance', label: 'Governance' },
  { id: 'auctions', href: '/auctions', label: 'Auctions', unavailable: true },
]

describe('navigation candidates', () => {
  it('keeps the mobile global header fixed while destination groups scroll', () => {
    render(
      <GlobalNavigationMenu
        brand={<span>Reserve</span>}
        groups={[{ id: 'main', label: 'Main', destinations }]}
        label="Global mobile navigation"
        trailing={<button type="button">Close</button>}
      />
    )

    const menu = screen.getByTestId('global-navigation-menu')
    expect(menu).toHaveClass('h-full', 'flex', 'flex-col')
    expect(menu.querySelector('header')).toHaveClass('h-14', 'shrink-0')
    expect(
      screen.getByRole('navigation', { name: 'Global mobile navigation' })
    ).toHaveClass('min-h-0', 'flex-1', 'overflow-y-auto')
    expect(screen.getByRole('link', { name: 'Overview' })).toHaveClass(
      'gap-3',
      'rounded-full',
      'px-4',
      'py-3',
      'ring-1',
      'ring-inset',
      'ring-border'
    )
  })

  it('exposes the detached mobile DTF mark as a switcher trigger', () => {
    const onClick = vi.fn()
    render(
      <ProductNavigationMobileIdentityTrigger
        label="Switch DTF, current CMC20"
        mark={<span>CMC20 mark</span>}
        onClick={onClick}
        open
      />
    )

    const trigger = screen.getByRole('button', {
      name: 'Switch DTF, current CMC20',
    })
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(trigger).toHaveClass('h-12', 'w-auto', 'rounded-full')
    expect(trigger).toHaveClass(
      'gap-0.5',
      'p-2',
      'motion-safe:active:scale-[0.98]'
    )
    expect(trigger).not.toHaveClass('gap-1', 'gap-2', 'hover:bg-foreground/5')
    expect(trigger).not.toHaveClass('size-12')
    expect(trigger.firstElementChild).toHaveClass('size-8')
    const cue = trigger.querySelector('[data-slot="product-switcher-cue"]')
    expect(cue).toBeVisible()
    expect(cue).toHaveClass(
      'size-8',
      'rounded-full',
      'group-hover:bg-foreground/5',
      'bg-foreground/5'
    )
    expect(cue).not.toHaveClass('ring-1', 'ring-border')
    expect(cue?.querySelector('svg')).toHaveClass('size-4')
    fireEvent.click(trigger)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('uses outlined 48px drawer rows with matching icon slots without changing popup rows', () => {
    const { rerender } = render(
      <ProductNavigation
        currentId="overview"
        destinations={destinations}
        identity={<span>CMC20</span>}
        label="CMC20 drawer navigation"
        presentation="drawer"
        supplementary={<span>Token address</span>}
      />
    )

    expect(screen.getByText('CMC20').parentElement).not.toHaveClass('border-b')
    expect(screen.getByText('Token address').parentElement).not.toHaveClass(
      'border-t'
    )
    const drawerRow = screen.getByRole('link', { name: 'Overview' })
    expect(drawerRow).toHaveClass(
      'min-h-12',
      'gap-3',
      'px-4',
      'py-3',
      'ring-1',
      'ring-inset',
      'ring-primary/30'
    )
    expect(screen.getByRole('link', { name: 'Governance' })).toHaveClass(
      'ring-border'
    )
    expect(
      drawerRow.querySelector('[data-slot="product-navigation-trailing-slot"]')
    ).toHaveClass('size-6')
    expect(
      screen
        .getByRole('navigation', { name: 'CMC20 drawer navigation' })
        .querySelector('[data-slot="product-navigation-menu-items"]')
    ).toHaveClass('space-y-1', 'pt-4')
    expect(
      screen
        .getByText('Token address')
        .closest('[data-slot="product-navigation-supplementary"]')
        ?.closest('nav')
    ).toBeNull()

    rerender(
      <ProductNavigation
        destinations={destinations}
        identity={<span>CMC20</span>}
        label="CMC20 popup navigation"
        presentation="menu"
      />
    )

    expect(
      screen
        .getByRole('link', { name: 'Overview' })
        .querySelector('[data-slot="product-navigation-trailing-slot"]')
    ).toHaveClass('size-4')
  })

  it('exposes the product identity as a truthful switcher trigger in both rail states', () => {
    const onClick = vi.fn()
    const { rerender } = render(
      <ProductNavigationIdentityTrigger
        label="Switch DTF"
        mark={<span>CMC20 mark</span>}
        name="CMC20"
        onClick={onClick}
      />
    )

    const collapsedTrigger = screen.getByRole('button', {
      name: 'Switch DTF',
    })
    expect(collapsedTrigger).toHaveAttribute('aria-expanded', 'false')
    expect(collapsedTrigger).toHaveClass('ring-1', 'ring-inset', 'ring-border')
    expect(
      collapsedTrigger.querySelector('[data-slot="product-switcher-cue"]')
    ).not.toBeInTheDocument()
    fireEvent.click(collapsedTrigger)
    expect(onClick).toHaveBeenCalledTimes(1)

    rerender(
      <ProductNavigationIdentityTrigger
        expanded
        label="Switch DTF"
        mark={<span>CMC20 mark</span>}
        name="CMC20"
        onClick={onClick}
        open
      />
    )

    const expandedTrigger = screen.getByRole('button', { name: 'Switch DTF' })
    expect(expandedTrigger).toHaveAttribute('aria-expanded', 'true')
    expect(expandedTrigger).toHaveClass('h-10', 'gap-1.5', 'rounded-full')
    expect(expandedTrigger).toHaveClass('ring-1', 'ring-inset', 'ring-border')
    expect(
      expandedTrigger.querySelector(
        '[data-slot="product-switcher-chevron-slot"]'
      )
    ).toHaveClass('ml-auto', 'size-6')
    expect(
      expandedTrigger.querySelector('[data-slot="product-switcher-chevron"]')
    ).toHaveClass('size-4', 'rotate-180')
  })

  it('aligns the product identity mark to the same 40px rail axis as route icons', () => {
    render(
      <>
        <ProductNavigationIdentity
          mark={<span>Rail mark</span>}
          name="CMC20 rail"
          supporting="BNB Chain"
        />
        <ProductNavigationIdentity
          mark={<span>Menu mark</span>}
          name="CMC20 menu"
          presentation="menu"
          supporting="BNB Chain"
        />
      </>
    )

    const [railMark, menuMark] = screen.getAllByTestId(
      'product-navigation-identity-mark'
    )
    expect(railMark).toHaveClass('size-10', 'items-center', 'justify-center')
    expect(menuMark).toHaveClass('size-6', 'items-center', 'justify-center')
    expect(screen.getByText('CMC20 rail')).toHaveClass('sr-only')
    expect(screen.getByText('CMC20 menu')).not.toHaveClass('sr-only')
    expect(screen.getByTestId('canonical-entity-identity')).toHaveClass('gap-2')
  })

  it('keeps current and unavailable destinations semantically distinct', () => {
    render(
      <ProductNavigation
        currentId="overview"
        destinations={destinations}
        identity={<span>CMC20</span>}
        label="CMC20 navigation"
      />
    )

    const currentRoute = screen.getByRole('link', { name: 'Overview' })
    expect(currentRoute).toHaveAttribute('aria-current', 'page')
    expect(currentRoute).toHaveClass('gap-1.5')
    expect(screen.getByText('Overview').parentElement).toHaveClass(
      'relative',
      'z-10'
    )
    expect(
      screen.getByRole('navigation', { name: 'CMC20 navigation' })
    ).toHaveClass('h-full', 'flex', 'flex-col')
    expect(
      screen
        .getByRole('navigation', { name: 'CMC20 navigation' })
        .querySelector('[data-slot="product-navigation-rail-items"]')
    ).toHaveClass('min-h-0', 'flex-1', 'overflow-y-auto', 'pt-4')
    expect(
      screen
        .getByRole('navigation', { name: 'CMC20 navigation' })
        .querySelector('[data-slot="product-navigation-divider"]')
    ).toHaveClass('mt-4')
    expect(screen.queryByRole('link', { name: 'Auctions' })).toBeNull()
    expect(
      screen.getByText('Auctions').closest('[aria-disabled]')
    ).toHaveAttribute('aria-disabled', 'true')
    expect(
      currentRoute.querySelector(
        '[data-slot="product-navigation-icon-surface"]'
      )
    ).toHaveClass('inset-0')
  })

  it('uses a two-pixel inner circle inset only when the product rail expands', () => {
    render(
      <ProductNavigationItem
        currentId="overview"
        destination={destinations[0]}
        expanded
      />
    )

    const route = screen.getByRole('link', { name: 'Overview' })
    expect(
      route.querySelector('[data-slot="product-navigation-row-surface"]')
    ).toHaveClass('bg-accent/40')
    expect(
      route.querySelector('[data-slot="product-navigation-icon-surface"]')
    ).toHaveClass('inset-0.5')
    expect(
      route.querySelector('[data-slot="product-navigation-icon-surface"]')
        ?.firstElementChild
    ).toHaveClass('bg-accent/60')
  })

  it('adapts public-state indicators between collapsed and expanded product navigation', () => {
    const destination = {
      ...destinations[0],
      indicator: {
        label: 'Voting is active',
        tone: 'active',
      },
    } as NavigationDestination
    const { rerender } = render(
      <ProductNavigationItem destination={destination} />
    )

    const collapsedRoute = screen.getByRole('link', {
      name: /Overview.*Voting is active/,
    })
    expect(
      collapsedRoute.querySelector('[data-slot="product-navigation-indicator"]')
    ).toHaveAttribute('data-tone', 'active')
    expect(
      collapsedRoute.querySelector('[data-slot="product-navigation-indicator"]')
    ).toHaveAttribute('data-size', 'compact')
    expect(
      collapsedRoute.querySelector('[data-slot="product-navigation-indicator"]')
    ).toHaveClass('absolute')

    rerender(<ProductNavigationItem destination={destination} expanded />)

    const expandedIndicator = screen
      .getByRole('link', { name: /Overview.*Voting is active/ })
      .querySelector('[data-slot="product-navigation-indicator"]')
    expect(expandedIndicator).toHaveAttribute('data-tone', 'active')
    expect(expandedIndicator).toHaveAttribute('data-size', 'default')
    expect(expandedIndicator).not.toHaveClass('absolute')
    expect(expandedIndicator?.firstElementChild).toHaveClass('size-1.5')
  })

  it('keeps one wider expanded rail width for routes and trailing metadata', () => {
    const { rerender } = render(
      <ProductNavigation
        destinations={destinations}
        expanded
        identity={<span>CMC20</span>}
        label="CMC20 navigation"
      />
    )

    expect(screen.getByTestId('product-navigation')).toHaveClass('w-64')

    rerender(
      <ProductNavigation
        destinations={[
          {
            ...destinations[0],
            meta: <span>+12.64%</span>,
          },
        ]}
        expanded
        identity={<span>CMC20</span>}
        label="Switch DTF"
        showDestinationChevron={false}
      />
    )

    expect(screen.getByTestId('product-navigation')).toHaveClass('w-64')
  })

  it('renders product metadata in the trailing column without requiring a chevron', () => {
    const destination = {
      ...destinations[1],
      meta: <span>+4.20%</span>,
    } as NavigationDestination

    render(
      <ProductNavigation
        destinations={[destination]}
        identity={<span>CMC20</span>}
        label="Switch DTF"
        presentation="drawer"
        showDestinationChevron={false}
      />
    )

    const row = screen.getByRole('link', { name: /Governance.*4.20%/ })
    expect(
      row.querySelector('[data-slot="product-navigation-meta"]')
    ).toHaveTextContent('+4.20%')
    expect(
      row.querySelector('[data-slot="product-navigation-trailing-slot"]')
    ).not.toBeInTheDocument()
  })

  it('formats compact performance with financial direction and no-data semantics', () => {
    const { rerender } = render(
      <PerformanceValue periodLabel="30-day" value={4.2} />
    )

    expect(
      screen.getByLabelText('30-day performance: positive 4.20 percent')
    ).toHaveTextContent('+4.20%')

    rerender(<PerformanceValue periodLabel="30-day" value={-1.37} />)
    expect(
      screen.getByLabelText('30-day performance: negative 1.37 percent')
    ).toHaveTextContent('−1.37%')

    rerender(<PerformanceValue periodLabel="30-day" value={null} />)
    expect(
      screen.getByLabelText('30-day performance: no data')
    ).toHaveTextContent('—')
  })

  it('exposes the global overflow trigger and reports its open state', () => {
    const onOverflowOpenChange = vi.fn()
    render(
      <GlobalNavigation
        brand={<span>Reserve</span>}
        destinations={destinations.slice(0, 2)}
        label="Global navigation"
        overflowAriaLabel="Additional destinations"
        onOverflowOpenChange={onOverflowOpenChange}
        overflowLabel="More"
        overflowDestinations={[{ id: 'docs', href: '/docs', label: 'Docs' }]}
        overflowOpen={false}
      />
    )

    const trigger = screen.getByRole('button', { name: 'More' })
    expect(screen.getByRole('navigation')).toHaveClass('gap-0.5')
    expect(screen.getByRole('link', { name: 'Overview' })).toHaveClass(
      'shrink-0',
      'whitespace-nowrap'
    )
    expect(trigger).toHaveClass('shrink-0', 'whitespace-nowrap')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false })
    expect(onOverflowOpenChange).toHaveBeenCalledWith(true)
  })

  it('inherits the accepted external-link announcement contract', () => {
    render(
      <GlobalNavigation
        brand={<span>Reserve</span>}
        destinations={[]}
        label="Global navigation"
        overflowAriaLabel="Additional destinations"
        overflowLabel="More"
        overflowDestinations={[
          {
            id: 'docs',
            href: '/docs',
            label: 'Documentation',
            icon: <svg aria-hidden="true" />,
            external: true,
            externalAnnouncement: 'Opens documentation in a new window',
          },
        ]}
        overflowOpen
      />
    )

    const externalDestination = screen.getByRole('menuitem', {
      name: /Documentation.*Opens documentation in a new window/,
    })
    expect(externalDestination).toHaveAttribute(
      'rel',
      expect.stringContaining('noopener')
    )
    expect(externalDestination).toHaveClass(
      'gap-3',
      'p-3',
      'text-sm',
      'font-medium',
      'leading-4',
      'rounded-full',
      'ring-1',
      'ring-inset',
      'ring-border'
    )
    expect(screen.getByTestId('global-navigation-overflow')).toHaveClass(
      'overflow-y-auto',
      'overscroll-contain'
    )
  })

  it('uses one route model in the constrained product menu', () => {
    render(
      <ProductNavigation
        currentId="governance"
        destinations={destinations}
        identity={<span>CMC20</span>}
        label="CMC20 navigation"
        overflowFade
        presentation="menu"
      />
    )

    const currentRoute = screen.getByRole('link', { name: 'Governance' })
    const menu = screen.getByRole('navigation', { name: 'CMC20 navigation' })

    expect(currentRoute).toHaveAttribute('aria-current', 'page')
    expect(currentRoute).toHaveClass(
      'min-h-11',
      'gap-2',
      'rounded-full',
      'p-3',
      'text-sm',
      'font-medium',
      'leading-5'
    )
    expect(
      screen.getByRole('link', { name: 'Overview' }).querySelector('svg')
        ?.parentElement
    ).toHaveClass('size-6')
    expect(menu).toHaveAttribute('data-presentation', 'menu')
    expect(screen.getByTestId('product-navigation-shell')).toHaveClass('pb-0')
    expect(
      menu.querySelector('[data-slot="product-navigation-menu-items"]')
    ).toHaveClass(
      'max-h-72',
      'pb-8',
      'pt-2',
      'space-y-0.5',
      'overflow-y-auto',
      'overscroll-contain'
    )
    expect(
      screen
        .getByTestId('product-navigation-shell')
        .querySelector('[data-slot="product-navigation-overflow-fade"]')
    ).toHaveClass('bottom-0', 'h-8', 'to-popover')
  })

  it('reports the selected destination so a host can leave switcher mode', () => {
    const onDestinationSelect = vi.fn()
    render(
      <ProductNavigation
        currentId="overview"
        destinations={destinations}
        identity={<span>CMC20</span>}
        label="CMC20 navigation"
        onDestinationSelect={onDestinationSelect}
      />
    )

    fireEvent.click(screen.getByRole('link', { name: 'Governance' }))
    expect(onDestinationSelect).toHaveBeenCalledWith(destinations[1])
  })
})
