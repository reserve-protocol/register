import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { AuctionsBrowseReview } from '../review'
import { historicalRebalances } from '../history-model'
import { HistoricalRebalancesTable } from '../history-table'

describe('historical rebalance review', () => {
  it('opens a history-only table without reserving a current or selected pane', () => {
    render(
      <MemoryRouter
        initialEntries={[
          '/internal/design-system/components/table#auctions-browse-review',
        ]}
      >
        <AuctionsBrowseReview />
      </MemoryRouter>
    )
    const table = screen.getByRole('table', { name: 'Historical Rebalances' })
    expect(within(table).getAllByRole('row')).toHaveLength(4)
    expect(screen.queryByTestId('rebalance-active-section')).toBeNull()
    expect(screen.queryByTestId('rebalance-selected-detail')).toBeNull()
    expect(screen.queryByTestId('rebalance-preview-phase')).toBeNull()
    expect(within(table).queryByText('August 2026 Rebalance')).toBeNull()
  })
  it('keeps unknown metrics independent from known lifecycle and zero values', () => {
    const missing = historicalRebalances('unavailable')
    expect(missing.map((row) => row.status)).toEqual([
      'Completed',
      'Completed',
      'Completed',
    ])
    expect(
      missing.every(
        (row) =>
          row.traded === null &&
          row.auctions === null &&
          row.priceImpact.value === null &&
          row.priceImpactUsd === null &&
          row.navChange.value === null
      )
    ).toBe(true)
    const expired = historicalRebalances('expired')[2]
    expect(expired).toMatchObject({
      status: 'Expired',
      traded: '$0',
      auctions: 0,
      accuracy: null,
      priceImpact: { value: '0%' },
      priceImpactUsd: '$0',
      navChange: { value: '0%' },
    })
    expect(historicalRebalances('pressure')[2]).toMatchObject({
      status: 'Expired',
      traded: null,
      auctions: null,
    })
  })
  it('preserves signed impact and newest-first snapshot identity', () => {
    const rows = historicalRebalances('default')
    expect(rows.map((row) => row.priceImpact.value)).toEqual([
      '−1.51%',
      '+0.12%',
      '0%',
    ])
    expect(rows.map((row) => row.identity.nonce)).toEqual([10, 9, 2])
    expect(rows.map((row) => row.priceImpactUsd)).toEqual([
      '$1,272',
      '$14',
      '$0',
    ])
    expect(rows.map((row) => row.navChange)).toEqual([
      { value: '−0.18%', tone: 'negative' },
      { value: '+0.04%', tone: 'positive' },
      { value: '0%' },
    ])
  })
  it('keeps titles static and navigation limited to proposer links', () => {
    render(<HistoricalRebalancesTable rows={historicalRebalances('default')} />)
    expect(screen.queryByTestId('history-record-link')).toBeNull()
    expect(screen.getAllByTestId('history-record-title')).toHaveLength(6)
    expect(screen.getAllByRole('link')).toHaveLength(6)
    for (const link of screen.getAllByRole('link')) {
      expect(link).toHaveAttribute(
        'href',
        'https://bscscan.com/address/0xb209eed4d80fb47e5c16577e44dad1073c5c5015'
      )
    }
    expect(screen.getAllByTestId('history-navChange')[0]).toHaveTextContent(
      '−0.18%'
    )
    expect(
      screen.getAllByTestId('history-priceImpactUsd')[0]
    ).toHaveTextContent('$1,272')
  })
  it.each([
    [new Date(2026, 6, 1, 17, 48), 'Jul 1, 5:48pm'],
    [new Date(2025, 10, 13, 4, 39), 'Nov 13, 2025, 4:39am'],
    [new Date(2026, 6, 1, 0, 5), 'Jul 1, 12:05am'],
    [new Date(2026, 6, 1, 12, 5), 'Jul 1, 12:05pm'],
  ])('compacts %s without losing time or attribution', (date, label) => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 8, 13))
    try {
      const row = historicalRebalances('default')[0]
      render(
        <HistoricalRebalancesTable
          rows={[
            {
              ...row,
              identity: {
                ...row.identity,
                creationTime: date.getTime() / 1000,
              },
            },
          ]}
        />
      )
      const metadata = screen.getAllByTestId('rebalance-metadata')
      expect(metadata).toHaveLength(2)
      for (const item of metadata) {
        expect(item).toHaveTextContent(`Proposed ${label}`)
        expect(within(item).getByText('by')).toBeInTheDocument()
        expect(within(item).getByRole('link')).toHaveTextContent('0xb209…5015')
        expect(item.querySelector('time')).toHaveTextContent(label)
        expect(item.querySelector('time')).toHaveAttribute(
          'datetime',
          date.toISOString()
        )
      }
    } finally {
      vi.useRealTimers()
    }
  })
  it('offers the existing accuracy and NAV explanations', async () => {
    render(<HistoricalRebalancesTable rows={historicalRebalances('default')} />)
    fireEvent.click(
      screen.getAllByRole('button', { name: 'Rebalance accuracy' })[0]
    )
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'A measure of how closely the new basket rebalanced compared to the proposed basket'
    )
  })
  it('keeps provenance during metrics loading but removes it during list loading', () => {
    const rows = historicalRebalances('metrics-loading')
    const view = render(<HistoricalRebalancesTable rows={rows} />)
    expect(screen.getAllByTestId('rebalance-proposer-link')).toHaveLength(6)
    expect(screen.queryByTestId('history-accuracy')).toBeNull()
    expect(screen.queryByTestId('history-navChange')).toBeNull()
    expect(screen.queryByTestId('history-priceImpactUsd')).toBeNull()
    view.rerender(<HistoricalRebalancesTable rows={rows} loading />)
    expect(screen.queryAllByRole('link')).toHaveLength(0)
    expect(screen.getByTestId('historical-rebalances-table')).toHaveAttribute(
      'aria-busy',
      'true'
    )
  })
})
