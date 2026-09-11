import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { HoldingsReview } from '../table-family/holdings-review'
import {
  HoldingIdentity,
  Capitalization,
  HoldingPerformance,
} from '../table-family/holdings-cells'
import { HOLDINGS, previewHoldings } from '../table-family/holdings-fixtures'

describe('Holdings table-family candidate', () => {
  it('sorts the complete basket and resets sorting when changing tabs', () => {
    render(<HoldingsReview />)
    const table = screen.getByRole('table', { name: 'Exposure holdings' })
    const rows = () => within(table).getAllByRole('row').slice(1)
    expect(rows()).toHaveLength(18)
    expect(rows()[0]).toHaveTextContent('Bitcoin')
    fireEvent.click(within(table).getByRole('button', { name: 'Weight' }))
    expect(rows()[0]).not.toHaveTextContent('Bitcoin')
    fireEvent.mouseDown(
      within(table).getByRole('tab', { name: 'Collateral' }),
      {
        button: 0,
        ctrlKey: false,
      }
    )
    expect(
      screen.getByRole('table', { name: 'Collateral holdings' })
    ).toHaveTextContent('BTCB Token')
    fireEvent.mouseDown(
      within(screen.getByRole('table')).getByRole('tab', { name: 'Exposure' }),
      {
        button: 0,
        ctrlKey: false,
      }
    )
    expect(
      within(
        screen.getByRole('table', { name: 'Exposure holdings' })
      ).getAllByRole('row')[1]
    ).toHaveTextContent('Bitcoin')
  })
  it('does not conflate zero and unavailable and applies fractions once', () => {
    const rows = previewHoldings(HOLDINGS.cmc20, 'missing')
    expect(rows[0].change).toBe(0)
    expect(rows[1].change).toBeNull()
    render(
      <>
        <Capitalization value={0} />
        <Capitalization value={null} />
        <HoldingPerformance row={{ ...rows[0], change: 0.0421 }} />
      </>
    )
    expect(screen.getByText('$0.00')).toBeInTheDocument()
    expect(screen.getByText('—')).toBeInTheDocument()
    expect(screen.getByText('+4.21%')).toBeInTheDocument()
  })
  it('keeps underlying exposure informational and held tokens linked with a functioning bridge trigger', () => {
    const onBridge = vi.fn()
    const row = HOLDINGS.cmc20[0]
    const { rerender } = render(
      <HoldingIdentity
        row={{ ...row, sources: 2 }}
        tab="exposure"
        onBridge={onBridge}
      />
    )
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.getByText('$BTC (2 sources)')).toBeInTheDocument()
    expect(screen.queryByText('·')).not.toBeInTheDocument()
    rerender(<HoldingIdentity row={row} tab="collateral" onBridge={onBridge} />)
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      `https://bscscan.com/token/${row.address}`
    )
    const button = screen.getByRole('button', { name: 'Bridged' })
    expect(screen.getByText('·')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByText('·').parentElement).toContainElement(button)
    fireEvent.click(button)
    expect(onBridge).toHaveBeenCalledWith(row, button)
    rerender(
      <HoldingIdentity
        row={{ ...row, bridgeId: null }}
        tab="collateral"
        onBridge={onBridge}
      />
    )
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(screen.queryByText('·')).not.toBeInTheDocument()
  })
  it('uses the stock name and exchange rather than treating an exchange as one asset', () => {
    render(
      <HoldingIdentity
        row={HOLDINGS.photon[0]}
        tab="exposure"
        onBridge={vi.fn()}
      />
    )
    expect(screen.getByText('AXT')).toBeInTheDocument()
    expect(screen.getByText('NASDAQ: $AXTI')).toBeInTheDocument()
    expect(HOLDINGS.photon[0].exposureCap).not.toBe(
      HOLDINGS.photon[0].marketCap
    )
  })
  it('keeps the selected tab while changing loading conditions and hides stale performance/help', () => {
    render(<HoldingsReview />)
    fireEvent.mouseDown(
      within(screen.getByRole('table')).getByRole('tab', {
        name: 'Collateral',
      }),
      {
        button: 0,
        ctrlKey: false,
      }
    )
    fireEvent.keyDown(
      screen.getByRole('combobox', { name: 'Holdings preview state' }),
      { key: 'ArrowDown' }
    )
    fireEvent.click(screen.getByRole('option', { name: 'Loading performance' }))
    expect(
      within(screen.getByRole('table')).getByRole('tab', { name: 'Collateral' })
    ).toHaveAttribute('aria-selected', 'true')
    const table = screen.getByRole('table', { name: 'Collateral holdings' })
    expect(table).toHaveTextContent('BTCB Token')
    expect(table).toHaveTextContent('70.43%')
    expect(table).not.toHaveTextContent('+22.43%')
  })
})
