import { readFileSync } from 'node:fs'
import { cleanup, render, screen } from '@testing-library/react'
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
})

afterEach(cleanup)

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
