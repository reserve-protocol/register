import { cleanup, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeAll, describe, expect, it } from 'vitest'

import { PatternsOverviewPage } from '../documentation-pages'

beforeAll(() => {
  Object.defineProperty(document, 'fonts', {
    configurable: true,
    value: { ready: Promise.resolve() },
  })
})

afterEach(cleanup)

const renderOverview = () =>
  render(
    <MemoryRouter initialEntries={['/internal/design-system/patterns']}>
      <PatternsOverviewPage />
    </MemoryRouter>
  )

describe('patterns documentation overview', () => {
  it('renders all five patterns as one continuous anchored reference', () => {
    renderOverview()

    const sections = screen.getAllByTestId('pattern-reference-section')
    expect(sections.map((section) => section.id)).toEqual([
      'charts',
      'tables',
      'forms',
      'navigation',
      'transactions',
    ])

    for (const id of [
      'charts',
      'tables',
      'forms',
      'navigation',
      'transactions',
    ]) {
      expect(
        screen
          .getAllByRole('link', { name: new RegExp(id, 'i') })
          .some((link) => link.getAttribute('href') === `#${id}`)
      ).toBe(true)
    }
  })

  it('shows the accepted family results directly instead of teaser captures', () => {
    renderOverview()

    expect(screen.getByTestId('preset-or-custom-field')).toBeVisible()
    expect(screen.getAllByTestId('pattern-rich-reference')).toHaveLength(3)
    expect(screen.getAllByTestId('pattern-specimen-canvas')).toHaveLength(1)
    expect(screen.queryByTestId('pattern-captured-result')).toBeNull()

    expect(screen.getByTestId('documentation-pattern-charts')).toBeVisible()
    expect(screen.getByTestId('documentation-pattern-tables')).toBeVisible()
    expect(screen.getByTestId('navigation-pattern-documentation')).toBeVisible()
    expect(screen.getByTestId('chart-overview-documentation')).toBeVisible()
    expect(screen.getAllByTestId('current-rebalances-table')).toHaveLength(1)
    expect(screen.getByTestId('navigation-global-desktop')).toBeVisible()

    expect(screen.queryByTestId('chart-next-families-review')).toBeNull()
    expect(screen.queryByTestId('table-family-review')).toBeNull()
    expect(screen.queryByTestId('navigation-systems-state-sheet')).toBeNull()
    expect(screen.queryByTestId('transaction-system-review')).toBeNull()
  })

  it('keeps Transactions honest and links each pattern to depth', () => {
    renderOverview()

    const transactions = within(document.getElementById('transactions')!)
    expect(transactions.getByText('Exploring')).toBeVisible()
    expect(transactions.getByText('Paused')).toBeVisible()
    expect(transactions.getByTestId('pattern-no-specimen')).toBeVisible()
    expect(transactions.queryByTestId('pattern-specimen-canvas')).toBeNull()

    for (const id of [
      'charts',
      'tables',
      'forms',
      'navigation',
      'transactions',
    ]) {
      const pattern = within(document.getElementById(id)!)
      expect(
        pattern.getByRole('link', { name: 'Open Workbench summary' })
      ).toBeVisible()
      expect(
        pattern.getByRole('link', { name: 'Open Internal records' })
      ).toHaveAttribute('href', `/internal/design-system/records#pattern-${id}`)
    }
  })
})
