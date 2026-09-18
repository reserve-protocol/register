import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { DataComponentSpecimen } from '../documentation-component-specimens-data'
import { DisclosureComponentSpecimen } from '../documentation-component-specimens-disclosure'
import { FeedbackComponentSpecimen } from '../documentation-component-specimens-feedback'
import { NavigationComponentSpecimen } from '../documentation-component-specimens-navigation'
import { OverlayComponentSpecimen } from '../documentation-component-specimens-overlays'

afterEach(cleanup)

describe('documentation navigation and support specimens', () => {
  it('shows the accepted Link treatments and Pagination boundary states', () => {
    const { rerender } = render(<NavigationComponentSpecimen itemId="link" />)

    expect(screen.getByText('External resource')).toBeVisible()
    expect(screen.getByText('Button-shaped navigation')).toBeVisible()
    expect(
      document.querySelector('[data-link-treatment="inline"]')
    ).not.toBeNull()
    expect(
      document.querySelector('[data-link-treatment="standalone"]')
    ).not.toBeNull()
    expect(
      document.querySelector('[data-link-treatment="return"]')
    ).not.toBeNull()
    expect(
      screen.getByRole('link', { name: /Reserve documentation.*new tab/i })
    ).toHaveAttribute('target', '_blank')

    rerender(<NavigationComponentSpecimen itemId="pagination" />)

    expect(screen.getByText('Middle page · optional page size')).toBeVisible()
    expect(screen.getByText('First page')).toBeVisible()
    expect(screen.getByText('Last page')).toBeVisible()
    expect(
      screen.getAllByRole('navigation', { name: 'Pagination' })
    ).toHaveLength(3)

    const previous = screen.getAllByRole('button', { name: 'Previous page' })
    const next = screen.getAllByRole('button', { name: 'Next page' })

    expect(previous[0]).toBeEnabled()
    expect(previous[1]).toBeDisabled()
    expect(next[0]).toBeEnabled()
    expect(next[2]).toBeDisabled()
    expect(
      screen.getByRole('combobox', { name: 'Rows per page' })
    ).toBeVisible()
  })

  it('shows the complete accepted Menu anatomy and explanatory Tooltip jobs', async () => {
    const { rerender } = render(
      <OverlayComponentSpecimen itemId="dropdown-menu" />
    )

    expect(await screen.findByRole('menu')).toBeVisible()
    expect(screen.getByRole('menuitem', { name: 'Copy address' })).toBeVisible()
    expect(
      screen.getByRole('menuitem', { name: 'View on explorer' })
    ).toHaveAttribute('target', '_blank')
    expect(
      screen.getByRole('menuitem', { name: 'Unavailable action' })
    ).toHaveAttribute('data-disabled')
    expect(
      screen.getByRole('menuitem', { name: 'Remove resource' })
    ).toHaveAttribute('data-tone', 'destructive')

    rerender(<OverlayComponentSpecimen itemId="tooltip" />)

    expect(screen.getByText('Short explanation')).toBeVisible()
    expect(screen.getByText('Visible explanation')).toBeVisible()
    expect(screen.getAllByRole('tooltip')).toHaveLength(1)
    expect(screen.getByRole('tooltip')).toHaveTextContent(
      'The minimum share of eligible voting power that must participate before a proposal can pass.'
    )
    fireEvent.click(
      screen.getByRole('button', { name: 'About annualized TVL fee' })
    )
    expect(await screen.findAllByRole('tooltip')).toHaveLength(2)
    expect(
      screen.getAllByRole('tooltip').map((node) => node.textContent)
    ).toContain('The yearly fee charged against total value locked.')
  })

  it('preserves the two Exploring Eligibility states without the rejected generic dialog', () => {
    render(<OverlayComponentSpecimen itemId="dialog" />)

    expect(screen.getAllByTestId('canonical-dialog-surface')).toHaveLength(2)
    expect(screen.getByText('Exploring')).toBeVisible()
    expect(
      screen.getByText(/does not establish a generic Dialog shell or anatomy/i)
    ).toBeVisible()
    expect(screen.getByText('Collapsed jurisdictions')).toBeVisible()
    expect(screen.getByText('Expanded jurisdictions')).toBeVisible()
    expect(screen.queryByText('Proposal Simulation')).toBeNull()
  })

  it('shows host-shaped loading geometry and the accepted empty-state hierarchy', () => {
    const { rerender } = render(<FeedbackComponentSpecimen itemId="skeleton" />)

    expect(screen.getByText('Metric')).toBeVisible()
    expect(screen.getByText('Identity row')).toBeVisible()
    expect(screen.getByText('Repeated records')).toBeVisible()
    expect(screen.getAllByTestId('v1-skeleton').length).toBeGreaterThanOrEqual(
      8
    )

    rerender(<FeedbackComponentSpecimen itemId="empty-state" />)

    expect(screen.getByText('Quiet absence')).toBeVisible()
    expect(screen.getByText('Actionable absence')).toBeVisible()
    expect(screen.getByText('First-use action')).toBeVisible()
    expect(screen.getAllByTestId('canonical-empty-state')).toHaveLength(3)
    expect(screen.getByRole('button', { name: 'Add token' })).toBeVisible()
  })

  it('shows both Copyable Value treatments and the two accepted inline tones', () => {
    render(<DataComponentSpecimen itemId="copy-value" />)

    const copyableValues = document.querySelectorAll(
      '[data-copyable-value-treatment]'
    )

    expect(copyableValues).toHaveLength(3)
    expect(
      document.querySelector('[data-copyable-value-treatment="default"]')
    ).not.toBeNull()
    expect(
      document.querySelector(
        '[data-copyable-value-treatment="inline"][data-copyable-value-tone="primary"]'
      )
    ).not.toBeNull()
    expect(
      document.querySelector(
        '[data-copyable-value-treatment="inline"][data-copyable-value-tone="neutral"]'
      )
    ).not.toBeNull()
  })

  it('shows both accepted Metric roles and long-value pressure without inventing a tone API', () => {
    render(<DataComponentSpecimen itemId="metric" />)

    expect(screen.getByText('Inline · long-value pressure')).toBeVisible()
    expect(screen.getByText('Headline · centered')).toBeVisible()
    expect(screen.getAllByTestId('canonical-metric')).toHaveLength(2)
    expect(document.querySelectorAll('[data-role="inline"]')).toHaveLength(1)
    expect(document.querySelectorAll('[data-role="headline"]')).toHaveLength(1)
    expect(screen.getByText('$1,284,592,903.47')).toBeVisible()
  })

  it('uses a standalone-safe accepted asset for the direct Entity Identity example', () => {
    render(<DataComponentSpecimen itemId="entity-identity" />)

    expect(screen.getByAltText('CMC20')).toHaveAttribute(
      'src',
      '/imgs/cmc20.png'
    )
  })

  it('shows coordinated Accordion modes and independent Collapsible states at readable width', () => {
    const { rerender } = render(
      <DisclosureComponentSpecimen itemId="accordion" />
    )

    expect(
      screen.getByText('Multiple · ordinary informational set')
    ).toBeVisible()
    expect(screen.getByText('Single · unusually long detail')).toBeVisible()
    expect(
      screen.getByRole('button', { name: 'What is staking?' })
    ).toHaveAttribute('aria-expanded', 'true')
    expect(
      screen.getByRole('button', {
        name: 'Archived supporting notes unavailable',
      })
    ).toBeDisabled()

    rerender(<DisclosureComponentSpecimen itemId="collapsible" />)

    expect(screen.getByText('Independent · resting')).toBeVisible()
    expect(screen.getByText('Independent · expanded')).toBeVisible()
    expect(screen.getByText('Independent · unavailable')).toBeVisible()
    expect(
      screen.getByRole('button', { name: 'Transaction details' })
    ).toHaveAttribute('aria-expanded', 'true')
    expect(
      screen.getByRole('button', { name: 'Unavailable details' })
    ).toBeDisabled()
  })
})
