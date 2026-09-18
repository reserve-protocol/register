import { readFileSync } from 'node:fs'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

import {
  DocumentationPatternTables,
  TABLE_DOCUMENTATION_SECTION_IDS,
} from '../documentation-pattern-tables'

beforeAll(() => {
  global.ResizeObserver ??= class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  HTMLElement.prototype.scrollIntoView ??= vi.fn()
  HTMLElement.prototype.hasPointerCapture ??= vi.fn(() => false)
  HTMLElement.prototype.setPointerCapture ??= vi.fn()
  HTMLElement.prototype.releasePointerCapture ??= vi.fn()
})

afterEach(() => {
  cleanup()
  vi.unstubAllEnvs()
})

const renderTables = (
  entry = '/internal/design-system/patterns?tables-current.state=ready#tables'
) =>
  render(
    <MemoryRouter initialEntries={[entry]}>
      <DocumentationPatternTables />
    </MemoryRouter>
  )

describe('Tables documentation module', () => {
  it('orders the accepted table jobs as a continuous result-first reference', () => {
    renderTables()

    expect(
      screen
        .getAllByTestId('table-documentation-section')
        .map((section) => section.id)
    ).toEqual(TABLE_DOCUMENTATION_SECTION_IDS)
    expect(TABLE_DOCUMENTATION_SECTION_IDS).toEqual([
      'tables-current-rebalances',
      'tables-historical-rebalances',
      'tables-portfolio',
      'tables-holdings',
      'tables-discover',
      'tables-earn',
      'tables-governance',
    ])
    expect(screen.getAllByTestId('current-rebalances-table')).toHaveLength(1)
    expect(screen.getAllByTestId('historical-rebalances-table')).toHaveLength(1)
  })

  it('uses the accepted ready current table by default and keeps history independent', () => {
    renderTables()

    const current = screen.getByTestId('current-rebalances-table')
    const history = screen.getByTestId('historical-rebalances-table')
    expect(
      screen.getByTestId('table-current-rebalances-canvas')
    ).toHaveAttribute('data-resolved-state', 'ready')
    expect(current).toHaveTextContent('Only launcher can start')
    expect(current).not.toContainElement(history)
    expect(history).toHaveTextContent('Completed')
    expect(history).not.toHaveTextContent('Ready to start')
  })

  it('opens table specimens at the full capped documentation width', () => {
    renderTables()

    const viewportControls = screen.getAllByRole('group', {
      name: 'Table viewport',
    })
    expect(viewportControls).toHaveLength(6)
    for (const control of viewportControls) {
      expect(
        within(control).getByRole('radio', { name: 'Full width' })
      ).toHaveAttribute('data-state', 'on')
    }
    expect(screen.getByTestId('table-current-rebalances-canvas')).toHaveClass(
      'w-full'
    )
    expect(
      screen.getByTestId('table-current-rebalances-canvas')
    ).not.toHaveClass('w-[64rem]', 'max-w-none')
  })

  it('bounds viewport choices inside a local horizontal scroller', () => {
    renderTables()

    const scrollers = screen.getAllByTestId('table-viewport-control-scroll')
    expect(scrollers).toHaveLength(6)

    for (const scroller of scrollers) {
      expect(scroller).toHaveClass(
        'w-full',
        'max-w-full',
        'overflow-x-auto',
        'overscroll-x-contain'
      )
      expect(
        within(scroller).getByRole('radio', { name: 'Full width' })
      ).toBeVisible()
      expect(
        within(scroller).getByRole('radio', {
          name: 'Phone width · 390px',
        })
      ).toBeVisible()
    }
  })

  it('keeps the named 390px phone host at its real width inside the scroller', async () => {
    const user = userEvent.setup()
    renderTables()

    const currentSection = document.getElementById('tables-current-rebalances')!
    await user.click(
      within(currentSection).getByRole('radio', {
        name: 'Phone width · 390px',
      })
    )

    expect(screen.getByTestId('table-current-rebalances-canvas')).toHaveClass(
      'w-[390px]',
      'min-w-[390px]',
      'max-w-none'
    )
  })

  it('stacks current and historical governance groups at every width', () => {
    renderTables()

    expect(screen.getByTestId('governance-record-groups')).not.toHaveClass(
      'xl:grid-cols-2'
    )
  })

  it('keeps scenario labels outside every table in the All state', () => {
    renderTables(
      '/internal/design-system/patterns?tables-current.state=all#tables-current-rebalances'
    )

    const examples = screen.getAllByTestId('current-table-example')
    expect(examples).toHaveLength(18)
    expect(
      examples.map((example) =>
        within(example).getByRole('heading', { level: 4 }).textContent?.trim()
      )
    ).toContain('Disconnected visitor')
    expect(
      examples.map((example) =>
        within(example).getByRole('heading', { level: 4 }).textContent?.trim()
      )
    ).toContain('Hybrid · weights required')
  })

  it('reuses the current-table owner loading and empty treatments', () => {
    const loading = renderTables(
      '/internal/design-system/patterns?tables-current.state=loading#tables-current-rebalances'
    )
    const currentLoading = screen.getByTestId('table-current-rebalances-canvas')
    expect(within(currentLoading).getByRole('status')).toHaveTextContent(
      'Loading'
    )
    expect(within(currentLoading).getByTestId('v1-skeleton')).toHaveClass(
      'h-20',
      'w-full'
    )
    loading.unmount()

    renderTables(
      '/internal/design-system/patterns?tables-current.state=empty#tables-current-rebalances'
    )
    expect(screen.getByText('No rebalances found')).toBeVisible()
    expect(screen.queryByText('No current rebalances found.')).toBeNull()
  })

  it('keeps current-table row links inside standalone documentation', () => {
    vi.stubEnv('VITE_DESIGN_SYSTEM_STANDALONE', 'true')
    renderTables()

    for (const link of screen.getAllByRole('link', { name: 'Details' })) {
      expect(link).toHaveAttribute(
        'href',
        '/internal/design-system/patterns?tables-current.state=ready#tables-current-rebalances'
      )
    }
  })

  it('uses the holdings owner tabs as the only family control', () => {
    renderTables()

    const holdings = document.getElementById('tables-holdings')!
    expect(
      within(holdings).queryByRole('combobox', { name: 'Holdings family' })
    ).toBeNull()
    expect(
      within(holdings).getAllByRole('tablist', { name: 'Holdings type' })
    ).not.toHaveLength(0)
  })

  it('accepts namespaced state and the retained current-table query alias', () => {
    const first = renderTables(
      '/internal/design-system/patterns?tables-current.state=live&tables-history.state=expired#tables-current-rebalances'
    )
    expect(screen.getByTestId('current-rebalances-table')).toHaveTextContent(
      'Ongoing'
    )
    expect(screen.getByTestId('historical-rebalances-table')).toHaveTextContent(
      'Expired'
    )
    first.unmount()

    renderTables(
      '/internal/design-system/patterns?current=permissionless#tables-current-rebalances'
    )
    expect(screen.getByTestId('current-rebalances-table')).toHaveTextContent(
      'Anyone can start'
    )
    expect(
      screen.getByTestId('table-current-rebalances-canvas')
    ).toHaveAttribute('data-resolved-state', 'permissionless')
  })

  it('retires the legacy current-table alias when Reset restores the default', async () => {
    const user = userEvent.setup()
    renderTables(
      '/internal/design-system/patterns?current=permissionless#tables-current-rebalances'
    )

    await user.click(
      screen.getByRole('button', { name: 'Reset current table' })
    )

    expect(
      screen.getByTestId('table-current-rebalances-canvas')
    ).toHaveAttribute('data-resolved-state', 'ready')
    expect(screen.getByTestId('current-rebalances-table')).toHaveTextContent(
      'Only launcher can start'
    )
  })

  it('retires the legacy current-table alias when Ready is selected directly', async () => {
    const user = userEvent.setup()
    renderTables(
      '/internal/design-system/patterns?current=permissionless#tables-current-rebalances'
    )

    await user.click(
      screen.getByRole('combobox', { name: 'Current rebalance state' })
    )
    await user.click(
      screen.getByRole('option', { name: 'First auction · restricted' })
    )

    expect(
      screen.getByTestId('table-current-rebalances-canvas')
    ).toHaveAttribute('data-resolved-state', 'ready')
  })

  it('reuses accepted owners and excludes the deferred auction workspace', () => {
    const source = readFileSync(
      'src/views/internal/design-system/documentation-pattern-tables.tsx',
      'utf8'
    )

    for (const owner of [
      'CurrentRebalancesTable',
      'HistoricalRebalancesTable',
      'Positions',
      'Withdrawals',
      'HoldingsTable',
      'DiscoverTable',
      'EarnTable',
      'DefiTable',
      'OwnedTable',
      'GovernanceProposalRecord',
      'DocumentationSpecimenCanvas',
    ]) {
      expect(source).toContain(owner)
    }

    expect(source).not.toContain('CurrentRebalanceReview')
    expect(source).not.toContain('AuctionsBrowseReview')
    expect(source).not.toContain("from './auctions-current/")
    expect(source).not.toContain('auctions-browse-review')
    expect(source).not.toContain('Current rebalance workspace')
  })
})
