import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { browseRecords } from '../model'
import { RebalanceListRecord } from '../record'

describe('auction browse provenance', () => {
  it('keeps the status with the title and the round with operational context', () => {
    const view = render(
      <RebalanceListRecord
        record={browseRecords('default', 'ongoing', false, 2)[0]}
      />
    )
    const header = within(screen.getByTestId('rebalance-record-header'))
    expect(header.getByTestId('lifecycle-status-pill')).toHaveTextContent(
      /^Ongoing$/
    )
    expect(header.queryByText('Auction 3')).toBeNull()
    const context = within(screen.getByTestId('rebalance-operational-context'))
    expect(context.getByTestId('rebalance-auction-number')).toHaveTextContent(
      'Auction 3'
    )
    expect(context.getByText('Ends in')).toBeInTheDocument()
    view.unmount()
    render(
      <RebalanceListRecord record={browseRecords('default', 'restricted')[1]} />
    )
    expect(screen.queryByTestId('rebalance-auction-number')).toBeNull()
    expect(
      within(screen.getByTestId('rebalance-record-header')).getByTestId(
        'lifecycle-status-pill'
      )
    ).toHaveTextContent('Completed')
  })
  it('states the restriction without hover while keeping the record ready', () => {
    render(
      <RebalanceListRecord record={browseRecords('default', 'restricted')[0]} />
    )
    expect(screen.getByTestId('rebalance-access')).toHaveTextContent(
      'Only the auction launcher can start auctions'
    )
    expect(screen.getByTestId('lifecycle-status-pill')).toHaveAttribute(
      'data-status-role',
      'actionable'
    )
    expect(screen.queryAllByTestId('rebalance-timing-icon')).toHaveLength(0)
    expect(screen.queryByTestId('rebalance-evidence-rail')).toBeNull()
  })

  it('keeps timing available in each operational summary without implying wallet gating', () => {
    for (const [phase, label, value] of [
      ['restricted', 'Permissionless in', '18h'],
      ['ongoing', 'Ends in', '5 min'],
      ['permissionless', 'Expires in', '23h 59 min'],
    ] as const) {
      const view = render(
        <RebalanceListRecord
          record={browseRecords('default', phase, false, 2)[0]}
        />
      )
      const record = within(screen.getByTestId('rebalance-list-record'))
      expect(record.getByText(label)).toBeInTheDocument()
      expect(record.getByText(value)).toBeInTheDocument()
      const context = within(
        screen.getByTestId('rebalance-operational-context')
      )
      if (phase === 'ongoing')
        expect(context.getByText(label)).toBeInTheDocument()
      else expect(context.getByTestId('rebalance-access')).toBeInTheDocument()
      const details = within(
        screen.getByTestId('rebalance-operational-summary')
      )
      expect(
        details.getByTestId('rebalance-auction-history')
      ).toHaveTextContent('Auctions run2')
      if (phase === 'ongoing') expect(details.queryByText(label)).toBeNull()
      view.unmount()
    }
  })

  it('uses a wrapping warning instead of simultaneously claiming readiness', () => {
    render(
      <RebalanceListRecord
        record={browseRecords('price-unavailable', 'restricted', true, 2)[0]}
      />
    )
    expect(screen.getByTestId('rebalance-prerequisite')).toHaveTextContent(
      'Price unavailable — cannot launch'
    )
    expect(screen.queryByTestId('lifecycle-status-pill')).toBeNull()
    expect(screen.getByTestId('rebalance-prerequisite')).toHaveAttribute(
      'data-tone',
      'warning'
    )
    expect(screen.queryByText(/Ready to start/)).toBeNull()
    expect(screen.getByTestId('rebalance-auction-history')).toHaveTextContent(
      'Auctions run2'
    )
  })

  it('preserves visible time-of-day and separates record/proposer links', () => {
    const record = browseRecords('default', 'restricted')[0]
    render(<RebalanceListRecord record={record} />)
    const time = screen.getByTestId('rebalance-metadata').querySelector('time')!
    expect(time.textContent).toMatch(/\d{2}:\d{2} (am|pm)/)
    expect(time).toHaveAttribute('datetime', '2026-08-03T18:50:29.000Z')
    expect(screen.getAllByRole('link')).toHaveLength(2)
    expect(screen.getByTestId('rebalance-record-link')).toHaveAccessibleName(
      record.identity.title
    )
  })

  it('does not expose fixture identity or navigation while the list loads', () => {
    render(
      <RebalanceListRecord
        record={browseRecords('default', 'restricted')[0]}
        loading
      />
    )
    expect(screen.queryAllByRole('link')).toHaveLength(0)
    expect(screen.queryAllByRole('heading')).toHaveLength(0)
    expect(screen.getByTestId('rebalance-list-record')).toHaveAttribute(
      'aria-busy',
      'true'
    )
  })
})
