import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import {
  GlobalNavigation,
  GlobalNavigationMenu,
  ProductNavigation,
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

describe('navigation behavior', () => {
  it('labels mobile destination groups and distinguishes current and unavailable routes', () => {
    render(
      <GlobalNavigationMenu
        brand={<span>Reserve</span>}
        currentId="overview"
        groups={[{ id: 'main', label: 'Main', destinations }]}
        label="Global mobile navigation"
      />
    )

    expect(
      screen.getByRole('navigation', { name: 'Global mobile navigation' })
    ).toBeVisible()
    expect(screen.getByRole('region', { name: 'Main' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Overview' })).toHaveAttribute(
      'aria-current',
      'page'
    )
    expect(
      screen.queryByRole('link', { name: 'Auctions' })
    ).not.toBeInTheDocument()
    expect(
      screen.getByText('Auctions').closest('[aria-disabled]')
    ).toHaveAttribute('aria-disabled', 'true')
  })

  it('exposes the mobile product identity as a named switcher trigger', () => {
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
    fireEvent.click(trigger)
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('announces positive, negative, and missing performance values', () => {
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

  it('reports requested changes when overflow state is controlled', () => {
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
    fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false })
    expect(onOverflowOpenChange).toHaveBeenCalledWith(true)
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('opens and closes the overflow menu when state is not controlled', () => {
    render(
      <GlobalNavigation
        brand={<span>Reserve</span>}
        destinations={destinations.slice(0, 2)}
        label="Global navigation"
        overflowAriaLabel="Additional destinations"
        overflowLabel="More"
        overflowDestinations={[{ id: 'docs', href: '/docs', label: 'Docs' }]}
      />
    )

    const trigger = screen.getByRole('button', { name: 'More' })
    fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false })
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('menu')).toHaveAttribute(
      'aria-label',
      'Additional destinations'
    )
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('keeps overflow external destinations announced and secure', () => {
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
            external: true,
            externalAnnouncement: 'Opens documentation in a new window',
          },
        ]}
        overflowOpen
      />
    )

    const destination = screen.getByRole('menuitem', {
      name: /Documentation.*Opens documentation in a new window/,
    })
    expect(destination).toHaveAttribute('target', '_blank')
    expect(destination).toHaveAttribute(
      'rel',
      expect.stringContaining('noopener')
    )
  })

  it('reports available product destinations and ignores unavailable ones', () => {
    const onDestinationSelect = vi.fn()
    render(
      <ProductNavigation
        currentId="overview"
        destinations={destinations}
        identity={<span>CMC20</span>}
        label="CMC20 navigation"
        onDestinationSelect={onDestinationSelect}
        presentation="menu"
      />
    )

    expect(screen.getByRole('link', { name: 'Overview' })).toHaveAttribute(
      'aria-current',
      'page'
    )
    fireEvent.click(screen.getByRole('link', { name: 'Governance' }))
    fireEvent.click(screen.getByText('Auctions'))
    expect(onDestinationSelect).toHaveBeenCalledOnce()
    expect(onDestinationSelect).toHaveBeenCalledWith(destinations[1])
  })
})
