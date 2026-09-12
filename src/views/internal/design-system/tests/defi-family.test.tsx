import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EarnReview } from '../table-family/earn-review'
import { DefiTable } from '../table-family/defi-table'
import { previewDefi } from '../table-family/defi-fixtures'

describe('DeFi Yield opportunity family', () => {
  it('groups narrow metadata and keeps APY help outside individual records', () => {
    const { container } = render(<DefiTable state="default" />)
    const record = container.querySelector('[data-slot="defi-record"]')!
    expect(
      record.querySelector('[data-slot="entity-identity-supporting"]')
    ).toHaveTextContent(/Base\s*·\s*Beefy/)
    expect(
      record.querySelector('[data-slot="defi-platform-logo"]')
    ).not.toBeNull()
    expect(
      within(record as HTMLElement).queryByRole('button', { name: 'APY' })
    ).toBeNull()
    expect(
      container.querySelector(
        '[data-slot="defi-toolbar"] [data-table-focus="help-apy"]'
      )
    ).not.toBeNull()
    expect(
      record.querySelector(
        '[data-slot="defi-fact"] [data-slot="defi-yield-breakdown"]'
      )
    ).toBeNull()
    expect(
      record.querySelector('[data-slot="defi-yield-breakdown"]')
    ).toHaveTextContent(/Base 3.5%\s*·\s*Rewards 9.0%/)
  })
  it('places a named icon-only pool link beside the mobile identity', () => {
    const { container } = render(<DefiTable state="default" />)
    const record = container.querySelector('[data-slot="defi-record"]')!
    const link = within(record as HTMLElement).getByRole('link', {
      name: 'Open pool on Beefy (opens in a new tab)',
    })
    expect(link).toHaveAttribute(
      'href',
      'https://app.beefy.finance/vault/aero-cow-usdc-eusd-vault'
    )
    expect(link.textContent).toBe('')
    expect(link.closest('[data-slot="defi-record-header"]')).not.toBeNull()
    expect(within(record as HTMLElement).queryByText('View pool')).toBeNull()
    expect(
      container.querySelector('td [data-table-focus^="pool-"]')
    ).toHaveTextContent('View pool')
  })
  it.each([
    { symbol: 'RSR-WETH', tokens: ['RSR', 'WETH'] },
    { symbol: 'ETH+ETH-f', tokens: ['ETH+', 'WETH'] },
    { symbol: 'ETH+-WETH', tokens: ['ETH+', 'WETH'] },
  ])(
    'renders $symbol with its underlying token identities',
    ({ symbol, tokens }) => {
      render(<DefiTable state="default" />)
      const row = within(screen.getByRole('table'))
        .getAllByRole('row')
        .find((row) => row.textContent?.includes(symbol))
      expect(row).toBeDefined()
      expect(
        within(within(row!).getAllByRole('cell')[0])
          .getAllByRole('img')
          .map((image) => image.getAttribute('alt'))
      ).toEqual(tokens)
    }
  )
  it('includes the three-token Curve pool with distinct matching artwork', () => {
    render(<DefiTable state="default" />)
    const row = within(screen.getByRole('table'))
      .getAllByRole('row')
      .find((row) => row.textContent?.includes('ETH+-eUSD-RSR'))
    expect(row).toBeDefined()
    const cell = within(row!).getAllByRole('cell')[0]
    expect(
      within(cell)
        .getAllByRole('img')
        .map((image) => image.getAttribute('alt'))
    ).toEqual(['ETH+', 'eUSD', 'RSR'])
    expect(
      within(row!).getAllByRole('link', { name: /View pool/ })[0]
    ).toHaveAttribute(
      'href',
      'https://curve.finance/#/ethereum/pools/factory-tricrypto-21/deposit'
    )
  })
  it('emphasizes only the selected supporting APY without moving its content', () => {
    const { container } = render(<DefiTable state="default" />)
    const choose = (id: string) => {
      fireEvent.keyDown(screen.getByTestId('table-sort-menu'), {
        key: 'ArrowDown',
      })
      fireEvent.click(screen.getByTestId(id))
    }
    const rates = (field: string) => [
      ...container.querySelectorAll(`[data-apy-field="${field}"]`),
    ]
    expect(screen.getByTestId('table-sort-menu')).toHaveTextContent('Total APY')
    choose('table-sort-field-apyBase')
    expect(rates('apyBase').length).toBeGreaterThan(0)
    rates('apyBase').forEach((rate) =>
      expect(rate).toHaveClass('text-foreground')
    )
    rates('apyReward').forEach((rate) =>
      expect(rate).not.toHaveClass('text-foreground')
    )
    choose('table-sort-direction-asc')
    rates('apyBase').forEach((rate) =>
      expect(rate).toHaveClass('text-foreground')
    )
    choose('table-sort-field-apyReward')
    rates('apyReward').forEach((rate) =>
      expect(rate).toHaveClass('text-foreground')
    )
    rates('apyBase').forEach((rate) =>
      expect(rate).not.toHaveClass('text-foreground')
    )
    choose('table-sort-field-tvlUsd')
    rates('apyReward').forEach((rate) =>
      expect(rate).not.toHaveClass('text-foreground')
    )
  })
  it('groups platform and yield without hiding the breakdown or its sort fields', () => {
    render(<DefiTable state="default" />)
    expect(screen.getByRole('button', { name: 'Platform' })).toBeInTheDocument()
    const first = within(screen.getByRole('table')).getAllByRole('row')[1]
    const cells = within(first).getAllByRole('cell')
    expect(within(cells[0]).queryByRole('link')).not.toBeInTheDocument()
    expect(
      within(first).getAllByRole('link', { name: /View pool/ })[0]
    ).toHaveAttribute(
      'href',
      'https://app.beefy.finance/vault/aero-cow-usdc-eusd-vault'
    )
    expect(cells[1]).toHaveTextContent('Beefy')
    expect(cells[0]).toHaveTextContent('Base')
    expect(cells[1]).not.toHaveTextContent('Base')
    expect(
      cells[1].querySelector('[data-testid="canonical-chain-badge"]')
    ).toBeNull()
    const yieldCell = cells.find((cell) =>
      within(cell).queryByRole('link', { name: /View analytics on DefiLlama/ })
    )!
    expect(yieldCell).toHaveTextContent('12.5%')
    expect(yieldCell).toHaveTextContent('Base 3.5%')
    expect(yieldCell).toHaveTextContent('Rewards 9.0%')
    expect(within(yieldCell).getByRole('link')).toHaveTextContent('12.5%')
    fireEvent.keyDown(screen.getByTestId('table-sort-menu'), {
      key: 'ArrowDown',
    })
    for (const field of ['projectName', 'chain', 'apyBase', 'apyReward'])
      expect(
        screen.getByTestId(`table-sort-field-${field}`)
      ).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('table-sort-field-apyReward'))
    expect(
      within(screen.getByRole('table')).getAllByRole('row')[1]
    ).toHaveTextContent('Beefy')
    fireEvent.keyDown(screen.getByTestId('table-sort-menu'), {
      key: 'ArrowDown',
    })
    fireEvent.click(screen.getByTestId('table-sort-direction-asc'))
    expect(
      within(screen.getByRole('table')).getAllByRole('row')[1]
    ).toHaveTextContent('Yearn')
  })
  it('offers the third production Earn family', () => {
    render(<EarnReview />)
    fireEvent.keyDown(
      screen.getByRole('combobox', { name: 'Earn opportunity family' }),
      { key: 'ArrowDown' }
    )
    expect(
      screen.getByRole('option', { name: 'Yield DTF Staking' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('option', { name: 'DeFi Yield' })
    ).toBeInTheDocument()
  })

  it('keeps wallet preference but excludes wallet loading from DeFi', () => {
    render(<EarnReview />)
    const choose = (label: string, option: string) => {
      fireEvent.keyDown(screen.getByRole('combobox', { name: label }), {
        key: 'ArrowDown',
      })
      fireEvent.click(screen.getByRole('option', { name: option }))
    }
    fireEvent.click(screen.getByRole('switch', { name: 'Wallet position' }))
    choose('Earn preview state', 'Loading wallet position')
    choose('Earn opportunity family', 'DeFi Yield')
    expect(
      screen.queryByRole('switch', { name: 'Wallet position' })
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('combobox', { name: 'Earn preview state' })
    ).toHaveTextContent('Default')
    fireEvent.keyDown(
      screen.getByRole('combobox', { name: 'Earn preview state' }),
      { key: 'ArrowDown' }
    )
    expect(
      screen.queryByRole('option', { name: 'Loading wallet position' })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('option', { name: 'Sparse wallet positions' })
    ).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('option', { name: 'Default' }))
    choose('Earn opportunity family', 'Yield DTF Staking')
    expect(
      screen.getByRole('switch', { name: 'Wallet position' })
    ).toBeChecked()
  })

  it('starts with the highest APY and keeps numeric sort through recovery', () => {
    const { rerender } = render(<DefiTable state="default" />)
    const first = () => within(screen.getByRole('table')).getAllByRole('row')[1]
    expect(first()).toHaveTextContent('Beefy')
    fireEvent.click(screen.getByTestId('sort-tvlUsd'))
    expect(first()).toHaveTextContent('Uniswap')
    expect(screen.getByTestId('sort-tvlUsd')).toHaveAttribute(
      'aria-description',
      'descending'
    )
    rerender(<DefiTable state="empty" />)
    expect(screen.getByRole('status')).toHaveTextContent(
      'No yield opportunities found'
    )
    rerender(<DefiTable state="loading" />)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    rerender(<DefiTable state="default" />)
    expect(first()).toHaveTextContent('Uniswap')
    fireEvent.click(screen.getByTestId('sort-tvlUsd'))
    expect(first()).toHaveTextContent('Beefy')
    fireEvent.click(screen.getByTestId('sort-projectName'))
    expect(screen.getByTestId('sort-projectName')).toHaveAttribute(
      'aria-description',
      'ascending'
    )
  })

  it('preserves the narrow menu direction independently of its selected field', () => {
    render(<DefiTable state="default" />)
    const choose = (id: string) => {
      fireEvent.keyDown(screen.getByTestId('table-sort-menu'), {
        key: 'ArrowDown',
      })
      fireEvent.click(screen.getByTestId(id))
    }
    choose('table-sort-field-projectName')
    expect(screen.getByTestId('sort-projectName')).toHaveAttribute(
      'aria-description',
      'descending'
    )
    expect(
      within(screen.getByRole('table')).getAllByRole('row')[1]
    ).toHaveTextContent('Yearn')
    choose('table-sort-direction-asc')
    choose('table-sort-field-tvlUsd')
    expect(screen.getByTestId('sort-tvlUsd')).toHaveAttribute(
      'aria-description',
      'ascending'
    )
    expect(
      within(screen.getByRole('table')).getAllByRole('row')[1]
    ).toHaveTextContent('Beefy')
  })

  it('retains separate pool and analytics destinations, not a row drawer', () => {
    render(<DefiTable state="default" />)
    const first = within(screen.getByRole('table')).getAllByRole('row')[1]
    const links = within(first).getAllByRole('link')
    expect(
      within(first).getAllByRole('link', { name: /View pool/ })[0]
    ).toHaveAttribute(
      'href',
      'https://app.beefy.finance/vault/aero-cow-usdc-eusd-vault'
    )
    expect(
      within(first).getAllByRole('link', {
        name: /View analytics on DefiLlama/,
      })[0]
    ).toHaveAttribute(
      'href',
      'https://defillama.com/yields/pool/5b3335ea-44e3-4ddf-ba30-51006e075561'
    )
    for (const link of links) {
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    }
    fireEvent.click(first)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('distinguishes known zero from unavailable and sorts unavailable last', () => {
    render(<DefiTable state="missing" />)
    const rows = within(screen.getByRole('table')).getAllByRole('row').slice(1)
    expect(rows.at(-1)).toHaveTextContent('Yearn')
    expect(rows.at(-1)).toHaveTextContent('—')
    expect(rows.at(-1)).not.toHaveTextContent('0.0%')
    const zeroPool = rows.find((row) =>
      row.querySelector(
        '[data-table-focus="pool-75ca1ed2-dcd0-419d-99e8-8aa13aa08364"]'
      )
    )!
    expect(zeroPool).toHaveTextContent('0.0%')
    expect(zeroPool).toHaveTextContent('$0')
    expect(previewDefi('missing')[1].apyReward).toBeNull()
    fireEvent.click(screen.getByTestId('sort-apy'))
    expect(
      within(screen.getByRole('table')).getAllByRole('row').at(-1)
    ).toHaveTextContent('Yearn')
  })
})
