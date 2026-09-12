import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { EarnTable } from '../table-family/earn-table'
import { EarnPair, EarnRate } from '../table-family/earn-cells'
import { EarnReview } from '../table-family/earn-review'
import { EARN_ROWS, previewEarn } from '../table-family/earn-fixtures'

describe('Earn table-family candidate', () => {
  it.each(['index', 'yield'] as const)(
    'keeps opportunity facts stable and omits only confirmed empty mobile %s positions',
    (family) => {
      const props = {
        family,
        state: 'default' as const,
        rows: previewEarn(family, 'default'),
        onOpen: vi.fn(),
        onHelp: vi.fn(),
      }
      const { rerender } = render(<EarnTable {...props} wallet />)
      const emptyId = family === 'index' ? 'cmc' : 'bsdeth'
      expect(
        within(screen.getByTestId(`earn-record-${emptyId}`)).queryByText(
          family === 'index' ? 'Your lock' : 'Your stake'
        )
      ).toBeNull()
      rerender(<EarnTable {...props} wallet={false} />)
      const record = () => screen.getByTestId(`earn-record-${props.rows[0].id}`)
      const facts = () =>
        record().querySelector('[data-slot="earn-opportunity-facts"]')
      expect(facts()).toHaveTextContent(/Governs.*TVL/)
      const before = facts()!.textContent
      rerender(<EarnTable {...props} wallet />)
      expect(facts()!.textContent).toBe(before)
      expect(
        record().querySelector('[data-slot="earn-wallet-position"]')
      ).toHaveTextContent(family === 'index' ? 'Your lock' : 'Your stake')
      const values = record().querySelector('[data-slot="earn-wallet-values"]')
      expect(values).toHaveTextContent(
        family === 'index' ? '$174.42·125,000.00 RSR' : '$146.25·62,500.00 RSR'
      )
      expect(
        screen
          .getByTestId(`earn-record-${emptyId}`)
          .querySelector('[data-slot="earn-wallet-position"]')
      ).toBeNull()
      expect(screen.getByText('$0.00')).toHaveClass(
        'text-supporting-foreground'
      )
    }
  )

  it('retains small, unknown and loading mobile holdings rather than inferring absence from USD', () => {
    const row = EARN_ROWS[0]
    const props = {
      family: 'index' as const,
      wallet: true,
      onOpen: vi.fn(),
      onHelp: vi.fn(),
    }
    const { rerender } = render(
      <EarnTable
        {...props}
        state="default"
        rows={[
          {
            ...row,
            hasHolding: true,
            holding: { text: '$0.00', order: 0n },
            holdingAmount: '0.001 RSR',
          },
        ]}
      />
    )
    const position = () =>
      screen
        .getByTestId(`earn-record-${row.id}`)
        .querySelector('[data-slot="earn-wallet-position"]')
    expect(position()).toHaveTextContent('0.001 RSR')
    rerender(
      <EarnTable
        {...props}
        state="default"
        rows={[
          { ...row, hasHolding: null, holding: null, holdingAmount: null },
        ]}
      />
    )
    expect(position()).toHaveTextContent('Your lock')
    expect(within(position() as HTMLElement).getAllByText('—')).toHaveLength(2)
    rerender(
      <EarnTable
        {...props}
        state="wallet-loading"
        rows={[
          {
            ...row,
            hasHolding: false,
            holding: { text: '$0.00', order: 0n },
            holdingAmount: '0.00 RSR',
          },
        ]}
      />
    )
    expect(position()).toHaveAttribute('aria-busy', 'true')
    expect(
      position()!.querySelector('[data-testid="v1-skeleton"]')
    ).not.toBeNull()
  })

  it.each(['index', 'yield'] as const)(
    'mutes only known zero wallet values in %s rows',
    (family) => {
      render(
        <EarnTable
          family={family}
          wallet
          state="default"
          rows={previewEarn(family, 'default')}
          onOpen={vi.fn()}
          onHelp={vi.fn()}
        />
      )
      for (const value of screen.getAllByText('$0.00'))
        expect(value).toHaveClass('text-supporting-foreground')
      for (const value of screen.getAllByText(
        family === 'index' ? '$174.42' : '$146.25'
      ))
        expect(value).not.toHaveClass('text-supporting-foreground')
    }
  )

  it('does not mute a zero TVL by default', () => {
    render(
      <EarnPair primary={{ text: '$0.00', order: 0n }} supporting="0.00 RSR" />
    )
    expect(screen.getByText('$0.00')).not.toHaveClass(
      'text-supporting-foreground'
    )
  })

  it.each(['index', 'yield'] as const)(
    'provides one funded %s row in the sparse-wallet preview',
    (family) => {
      const rows = previewEarn(family, 'sparse')
      expect(rows.filter((row) => row.hasHolding)).toHaveLength(1)
      for (const row of rows.slice(1)) {
        expect(row.hasHolding).toBe(false)
        expect(row.holding?.order).toBe(0n)
      }
    }
  )

  it('uses the value rather than its rounded text to identify zero', () => {
    render(
      <EarnPair
        muteZero
        primary={{ text: '$0.00', order: 1n }}
        supporting="0.01 RSR"
      />
    )
    expect(screen.getByText('$0.00')).not.toHaveClass(
      'text-supporting-foreground'
    )
  })

  it.each([
    ['index', false],
    ['index', true],
    ['yield', false],
    ['yield', true],
  ] as const)(
    'groups identity before metrics for %s, wallet %s',
    (family, wallet) => {
      render(
        <EarnTable
          family={family}
          wallet={wallet}
          state="default"
          rows={previewEarn(family, 'default')}
          onOpen={vi.fn()}
          onHelp={vi.fn()}
        />
      )
      const headers = within(screen.getByRole('table'))
        .getAllByRole('columnheader')
        .map((header) => header.textContent)
        .filter(Boolean)
      expect(headers).toEqual([
        'Gov. Token',
        'Governs',
        'TVL',
        ...(wallet ? [family === 'index' ? 'Your lock' : 'Your stake'] : []),
        'Avg. 30d%',
      ])
    }
  )

  it('keeps the chosen sort through empty and loading recovery', () => {
    const props = {
      family: 'index' as const,
      wallet: false,
      onOpen: vi.fn(),
      onHelp: vi.fn(),
    }
    const { rerender } = render(
      <EarnTable
        {...props}
        rows={previewEarn('index', 'default')}
        state="default"
      />
    )
    const first = () => within(screen.getByRole('table')).getAllByRole('row')[1]
    fireEvent.click(screen.getByTestId('sort-tvl'))
    expect(first()).toHaveTextContent('vlSQUILL-OPEN')
    rerender(<EarnTable {...props} rows={[]} state="empty" />)
    expect(screen.getByRole('status')).toHaveTextContent('No opportunities')
    rerender(
      <EarnTable
        {...props}
        rows={previewEarn('index', 'loading')}
        state="loading"
      />
    )
    expect(screen.getByTestId('sort-tvl')).toHaveAttribute(
      'aria-description',
      'ascending'
    )
    rerender(
      <EarnTable
        {...props}
        rows={previewEarn('index', 'default')}
        state="default"
      />
    )
    expect(first()).toHaveTextContent('vlSQUILL-OPEN')
  })

  it('distinguishes unavailable wallet amount, unavailable USD and known zero', () => {
    const rows = previewEarn('index', 'missing')
    expect(rows[0].holding?.order).toBe(0n)
    expect(rows[1].holdingAmount).toBeNull()
    expect(rows[2].holding).toBeNull()
    expect(rows[2].holdingAmount).toBe('18,517.50 RSR')
    const { rerender } = render(
      <EarnPair primary={rows[0].holding} supporting={rows[0].holdingAmount} />
    )
    expect(screen.getByText('$0.00')).toBeInTheDocument()
    expect(screen.getByText('0.00 RSR')).toBeInTheDocument()
    rerender(
      <EarnPair primary={rows[2].holding} supporting={rows[2].holdingAmount} />
    )
    expect(screen.getByText('—')).toBeInTheDocument()
    expect(screen.getByText('18,517.50 RSR')).toBeInTheDocument()
    rerender(
      <EarnPair primary={rows[1].holding} supporting={rows[1].holdingAmount} />
    )
    expect(screen.getAllByText('—')).toHaveLength(2)
  })

  it('keeps rate kind explicit and does not synthesize a value when unavailable', () => {
    const { rerender } = render(<EarnRate row={EARN_ROWS[0]} />)
    expect(screen.getByText('25.88%')).toBeInTheDocument()
    expect(screen.getByText('APY')).toBeInTheDocument()
    rerender(<EarnRate row={{ ...EARN_ROWS[1], rate: null }} />)
    expect(screen.getByText('APR')).toBeInTheDocument()
    expect(screen.getByText('—')).toBeInTheDocument()
    expect(screen.queryByText('0.00%')).not.toBeInTheDocument()
  })

  it('loads only the optional wallet column and retains the source labels', () => {
    const props = { wallet: true, onOpen: vi.fn(), onHelp: vi.fn() }
    const { rerender } = render(
      <EarnTable
        {...props}
        family="index"
        state="wallet-loading"
        rows={previewEarn('index', 'default')}
      />
    )
    const table = screen.getByRole('table')
    expect(table).toHaveTextContent('Your lock')
    expect(table).toHaveTextContent('$156,879')
    expect(table).not.toHaveTextContent('18,517.50 RSR')
    rerender(
      <EarnTable
        {...props}
        family="yield"
        state="default"
        rows={previewEarn('yield', 'default')}
      />
    )
    expect(screen.getByRole('table')).toHaveTextContent('Your stake')
  })

  it('exposes a clearly non-executing row boundary', () => {
    render(<EarnReview />)
    fireEvent.click(screen.getAllByTestId('earn-open-lcap')[0])
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveTextContent('Non-executing lab preview')
    expect(within(dialog).queryByRole('textbox')).not.toBeInTheDocument()
    expect(within(dialog).getAllByRole('button')).toHaveLength(1)
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Close preview' })
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
