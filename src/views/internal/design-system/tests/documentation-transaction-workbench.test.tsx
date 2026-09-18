import { readFileSync } from 'node:fs'
import { useState } from 'react'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import {
  DocumentationTransactionWorkbench,
  TRANSACTION_DOCUMENTATION_SECTION_IDS,
  TRANSACTION_DOCUMENTATION_SECTIONS,
} from '../documentation-transaction-workbench'

vi.mock('../transaction-composition-rfq', () => ({
  ZapperInlineReference: ({ state }: { state: string }) => (
    <div data-testid="zapper-owner">{state}</div>
  ),
}))

vi.mock('../transaction-composition-staged-entry', () => ({
  isAutomatedMintEntryState: (state: string) =>
    ['Introduction', 'Wallet required', 'Incompatible wallet'].includes(state),
  AutomatedMintEntry: ({ state }: { state: string }) => (
    <div data-testid="automated-entry-owner">{state}</div>
  ),
}))

vi.mock('../transaction-composition-staged-configure', () => ({
  AutomatedMintConfigure: ({
    chain,
    input,
    onInputChange,
    onOperationChange,
    operation,
    setState,
    state,
  }: {
    chain: number
    input: { display: string }
    onInputChange: (input: {
      amount?: { decimals: number; symbol: string; value: bigint }
      display: string
      usdDisplay: string
    }) => void
    onOperationChange: (operation: string) => void
    operation: string
    setState: (state: string) => void
    state: string
  }) => (
    <div
      data-chain={chain}
      data-operation={operation}
      data-testid="automated-configure-owner"
    >
      {state}
      <input
        aria-label="Automated amount"
        value={input.display}
        onChange={(event) =>
          onInputChange({
            amount: event.target.value
              ? { decimals: 0, symbol: 'TEST', value: 250n }
              : undefined,
            display: event.target.value,
            usdDisplay: `$${event.target.value}`,
          })
        }
      />
      <button type="button" onClick={() => setState('Quote searching')}>
        Get quote
      </button>
      <button type="button" onClick={() => onOperationChange('redeem')}>
        Switch automated operation
      </button>
      <button type="button" onClick={() => setState('BSC configuration')}>
        Open BSC configuration
      </button>
      <button
        type="button"
        onClick={() => setState('Existing collateral only')}
      >
        Open collateral-only redeem
      </button>
    </div>
  ),
}))

vi.mock('../transaction-composition-staged-workspace', () => ({
  AutomatedMintWorkspace: ({
    chain,
    hasCollateralSwaps,
    input,
    onRestart,
    operation,
    setState,
    state,
    useExistingCollateral,
  }: {
    chain: number
    hasCollateralSwaps: boolean
    input: { display: string }
    onRestart: () => void
    operation: string
    setState: (state: string) => void
    state: string
    useExistingCollateral: boolean
  }) => (
    <div
      data-chain={chain}
      data-existing-collateral={useExistingCollateral}
      data-has-collateral-swaps={hasCollateralSwaps}
      data-operation={operation}
      data-testid="automated-workspace-owner"
    >
      {state} · {input.display}
      <button type="button" onClick={() => setState('Input only ready')}>
        Open input-only ready
      </button>
      <button type="button" onClick={() => setState('No swaps needed')}>
        Open no-swaps state
      </button>
      <button type="button" onClick={onRestart}>
        Restart automated flow
      </button>
    </div>
  ),
}))

vi.mock('../transaction-composition-stake', () => ({
  StakeProductContext: ({ state }: { state: string }) => (
    <div data-testid="stake-owner">{state}</div>
  ),
}))

vi.mock('../transaction-composition-vote-lock', () => ({
  VoteLockProductContext: ({ state }: { state: string }) => (
    <div data-testid="vote-lock-owner">{state}</div>
  ),
}))

vi.mock('../transaction-composition-manual-anchor', () => ({
  ManualIssuanceAnchor: ({
    amount,
    remember,
    showPreviewNote,
    state,
    unlimited,
  }: {
    amount: string
    remember: (amount: string, unlimited: boolean) => void
    showPreviewNote?: boolean
    state: string
    unlimited: boolean
  }) => {
    const [current, setCurrent] = useState({ amount, unlimited })
    return (
      <div data-testid="manual-owner">
        {state}
        <input
          aria-label="Manual amount"
          value={current.amount}
          onChange={(event) => {
            const next = { ...current, amount: event.target.value }
            setCurrent(next)
            remember(next.amount, next.unlimited)
          }}
        />
        {showPreviewNote === false ? null : (
          <p data-testid="manual-preview-note">Preview note</p>
        )}
      </div>
    )
  },
}))

const LocationProbe = () => {
  const location = useLocation()
  return (
    <output data-testid="location-probe">
      {location.pathname}
      {location.search}
      {location.hash}
    </output>
  )
}

const renderWorkbench = (
  entry = '/internal/design-system/workbench#transactions-zapper'
) =>
  render(
    <MemoryRouter initialEntries={[entry]}>
      <DocumentationTransactionWorkbench />
      <LocationProbe />
    </MemoryRouter>
  )

describe('DocumentationTransactionWorkbench', () => {
  it('shows five ordered families without repeating the parent Pattern status', () => {
    renderWorkbench()

    expect(screen.queryByText(/Patterns · Paused/)).not.toBeInTheDocument()
    expect(
      screen.getByRole('region', { name: 'Transaction systems' })
    ).toBeVisible()
    expect(screen.queryByText(/Workbench/)).not.toBeInTheDocument()
    const sections = screen.getAllByTestId('transaction-documentation-family')
    expect(sections.map(({ id }) => id)).toEqual(
      TRANSACTION_DOCUMENTATION_SECTION_IDS
    )
    expect(TRANSACTION_DOCUMENTATION_SECTIONS).toHaveLength(5)
    expect(screen.getAllByTestId('transaction-current-specimen')).toHaveLength(
      5
    )
    expect(screen.queryByTestId('transaction-system-review')).toBeNull()
    expect(
      screen.getByRole('group', { name: 'Automated issuance operation' })
    ).toHaveTextContent('MintRedeem')
  })

  it('resolves a direct namespaced Stake state through its exact owner', () => {
    renderWorkbench(
      '/internal/design-system/workbench?transactions-stake.operation=unstake&transactions-stake.step=unstake&transactions-stake.state=unstake-confirming#transactions-stake'
    )

    expect(screen.getByTestId('stake-owner')).toHaveTextContent(
      'Unstake confirming'
    )
    expect(
      screen.getByRole('group', { name: 'Stake operation' })
    ).toHaveTextContent('Unstake')
    expect(
      screen.getByRole('combobox', { name: 'Stake step' })
    ).toHaveTextContent('Unstake')
  })

  it('opens every family on its declared default and resets back to it', () => {
    renderWorkbench(
      '/internal/design-system/workbench?transactions-zapper.operation=buy-sell&transactions-zapper.step=lifecycle&transactions-zapper.state=pre-quote#transactions-zapper'
    )

    expect(screen.getByTestId('automated-configure-owner')).toHaveTextContent(
      'Initial configuration'
    )
    expect(screen.getByTestId('stake-owner')).toHaveTextContent('Stake amount')
    expect(screen.getByTestId('vote-lock-owner')).toHaveTextContent(
      'Lock amount'
    )
    expect(screen.getByTestId('manual-owner')).toHaveTextContent(
      'Mint requirements'
    )

    const zapper = document.getElementById('transactions-zapper')!
    expect(within(zapper).getByTestId('zapper-owner')).toHaveTextContent(
      'Pre-quote'
    )
    fireEvent.click(
      within(zapper).getByRole('button', { name: 'Reset family' })
    )
    expect(within(zapper).getByTestId('zapper-owner')).toHaveTextContent(
      'Review'
    )
  })

  it('resets Automated Redeem even when its state label matches the Mint default', () => {
    renderWorkbench(
      '/internal/design-system/workbench?transactions-automated.operation=redeem&transactions-automated.step=configure&transactions-automated.state=initial-configuration#transactions-automated'
    )

    const automated = document.getElementById('transactions-automated')!
    const reset = within(automated).getByRole('button', {
      name: 'Reset family',
    })
    expect(reset).toBeEnabled()
    fireEvent.click(reset)
    expect(
      within(automated).getByRole('group', {
        name: 'Automated issuance operation',
      })
    ).toHaveTextContent('Mint')
    expect(screen.getByTestId('location-probe')).not.toHaveTextContent(
      'transactions-automated.operation'
    )
  })

  it('enables Reset for changed local values on otherwise-default families', () => {
    renderWorkbench()

    const automated = document.getElementById('transactions-automated')!
    const automatedReset = within(automated).getByRole('button', {
      name: 'Reset family',
    })
    expect(automatedReset).toBeDisabled()
    fireEvent.change(
      within(automated).getByRole('textbox', { name: 'Automated amount' }),
      { target: { value: '250' } }
    )
    expect(automatedReset).toBeEnabled()
    fireEvent.click(automatedReset)
    expect(
      within(automated).getByRole('textbox', { name: 'Automated amount' })
    ).toHaveValue('')
    expect(automatedReset).toBeDisabled()

    const manual = document.getElementById('transactions-manual')!
    const manualReset = within(manual).getByRole('button', {
      name: 'Reset family',
    })
    expect(manualReset).toBeDisabled()
    fireEvent.change(
      within(manual).getByRole('textbox', { name: 'Manual amount' }),
      { target: { value: '250' } }
    )
    expect(manualReset).toBeEnabled()
    fireEvent.click(manualReset)
    expect(
      within(manual).getByRole('textbox', { name: 'Manual amount' })
    ).toHaveValue('100')
    expect(manualReset).toBeDisabled()
  })

  it('preserves ordinary Automated and Manual amounts across state navigation', () => {
    renderWorkbench()

    fireEvent.change(
      screen.getByRole('textbox', { name: 'Automated amount' }),
      {
        target: { value: '250' },
      }
    )
    const automatedNavigation = screen.getByRole('navigation', {
      name: 'Automated issuance state sequence',
    })
    fireEvent.click(
      within(automatedNavigation).getByRole('button', { name: 'Next' })
    )
    expect(
      screen.getByRole('textbox', { name: 'Automated amount' })
    ).toHaveValue('250')
    fireEvent.click(
      within(automatedNavigation).getByRole('button', { name: 'Previous' })
    )
    expect(
      screen.getByRole('textbox', { name: 'Automated amount' })
    ).toHaveValue('250')
    fireEvent.click(screen.getByRole('button', { name: 'Get quote' }))
    expect(screen.getByTestId('automated-workspace-owner')).toHaveTextContent(
      'Quote searching · 250'
    )

    fireEvent.change(screen.getByRole('textbox', { name: 'Manual amount' }), {
      target: { value: '250' },
    })
    const manualNavigation = screen.getByRole('navigation', {
      name: 'Manual issuance state sequence',
    })
    fireEvent.click(
      within(manualNavigation).getByRole('button', { name: 'Next' })
    )
    fireEvent.click(
      within(manualNavigation).getByRole('button', { name: 'Previous' })
    )
    expect(screen.getByRole('textbox', { name: 'Manual amount' })).toHaveValue(
      '250'
    )
  })

  it('applies the accepted Automated operation and chain transition fixtures', () => {
    renderWorkbench()

    fireEvent.change(
      screen.getByRole('textbox', { name: 'Automated amount' }),
      {
        target: { value: '250' },
      }
    )
    fireEvent.click(
      screen.getByRole('button', { name: 'Switch automated operation' })
    )
    const redeemConfiguration = screen.getByTestId('automated-configure-owner')
    expect(redeemConfiguration).toHaveTextContent('Initial configuration')
    expect(redeemConfiguration).toHaveAttribute('data-operation', 'redeem')
    expect(
      screen.getByRole('textbox', { name: 'Automated amount' })
    ).toHaveValue('')

    fireEvent.click(
      screen.getByRole('button', { name: 'Open BSC configuration' })
    )
    const bscConfiguration = screen.getByTestId('automated-configure-owner')
    expect(bscConfiguration).toHaveTextContent('BSC configuration')
    expect(bscConfiguration).toHaveAttribute('data-operation', 'mint')
    expect(bscConfiguration).toHaveAttribute('data-chain', '56')
    fireEvent.change(
      screen.getByRole('textbox', { name: 'Automated amount' }),
      {
        target: { value: '250' },
      }
    )
    fireEvent.click(screen.getByRole('button', { name: 'Get quote' }))
    const quote = screen.getByTestId('automated-workspace-owner')
    expect(quote).toHaveTextContent('Quote searching · 250')
    expect(quote).toHaveAttribute('data-chain', '56')
    fireEvent.click(
      screen.getByRole('button', { name: 'Restart automated flow' })
    )
    const restarted = screen.getByTestId('automated-configure-owner')
    expect(restarted).toHaveTextContent('Initial configuration')
    expect(restarted).toHaveAttribute('data-chain', '56')
    expect(
      screen.getByRole('textbox', { name: 'Automated amount' })
    ).toHaveValue('')
  })

  it('applies the accepted Automated collateral and swap transition fixtures', () => {
    renderWorkbench()

    fireEvent.click(
      screen.getByRole('button', { name: 'Open collateral-only redeem' })
    )
    const collateralOnly = screen.getByTestId('automated-workspace-owner')
    expect(collateralOnly).toHaveTextContent('Existing collateral only · 0')
    expect(collateralOnly).toHaveAttribute('data-operation', 'redeem')
    expect(collateralOnly).toHaveAttribute('data-existing-collateral', 'true')
    expect(collateralOnly).toHaveAttribute('data-has-collateral-swaps', 'true')

    fireEvent.click(
      screen.getByRole('button', { name: 'Open input-only ready' })
    )
    const inputOnly = screen.getByTestId('automated-workspace-owner')
    expect(inputOnly).toHaveTextContent('Input only ready · 100')
    expect(inputOnly).toHaveAttribute('data-existing-collateral', 'false')

    fireEvent.click(screen.getByRole('button', { name: 'Open no-swaps state' }))
    expect(screen.getByTestId('automated-workspace-owner')).toHaveAttribute(
      'data-has-collateral-swaps',
      'false'
    )
  })

  it('keeps the Manual preview note outside the Workbench specimen', () => {
    renderWorkbench()

    expect(screen.queryByTestId('manual-preview-note')).not.toBeInTheDocument()
  })

  it('uses human phase labels without exposing the audit index in primary controls', () => {
    renderWorkbench()

    const zapper = document.getElementById('transactions-zapper')!
    fireEvent.click(
      within(zapper).getByRole('combobox', { name: 'Zapper step' })
    )

    expect(
      screen.getByRole('option', { name: 'Transaction progress' })
    ).toBeVisible()
    expect(
      screen.getByRole('option', { name: 'Quote and availability' })
    ).toBeVisible()
    expect(screen.getByRole('option', { name: 'Result details' })).toBeVisible()
    expect(screen.queryByText('Lifecycle')).not.toBeInTheDocument()
    expect(screen.queryByText('Review variant')).not.toBeInTheDocument()
    expect(screen.queryByText('Outcome attachment')).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Audit all states' })).toBeNull()
  })

  it('presents human state labels without exposing fixture enum names in navigation', () => {
    renderWorkbench()

    const automated = document.getElementById('transactions-automated')!
    expect(
      within(automated).getByRole('combobox', {
        name: 'Automated issuance state',
      })
    ).toHaveTextContent('Enter amount')
    expect(
      within(automated).getByRole('navigation', {
        name: 'Automated issuance state sequence',
      })
    ).toHaveTextContent('Enter amount')
    expect(
      within(automated).getByRole('navigation', {
        name: 'Automated issuance state sequence',
      })
    ).not.toHaveTextContent('Initial configuration')

    const stake = document.getElementById('transactions-stake')!
    expect(
      within(stake).getByRole('combobox', { name: 'Stake state' })
    ).toHaveTextContent('Enter stake amount')
  })

  it('declares deliberate transaction host geometry for modal and workspace families', () => {
    renderWorkbench()

    const stake = document.getElementById('transactions-stake')!
    const stakeBoundary = within(stake).getByTestId(
      'transaction-current-specimen'
    ).parentElement!
    expect(stakeBoundary).toHaveAttribute('data-specimen-mode', 'intrinsic')
    expect(stake.querySelector('[data-specimen-backdrop]')).toHaveAttribute(
      'data-specimen-backdrop',
      'beige'
    )
    expect(stakeBoundary).toHaveAttribute('data-specimen-padding', 'contained')
    expect(stakeBoundary).toHaveClass('max-sm:p-4')
    expect(stakeBoundary).not.toHaveClass('max-sm:p-0')
    expect(stakeBoundary).toHaveAttribute('data-specimen-align', 'center')
    expect(stakeBoundary).toHaveAttribute(
      'data-specimen-stable-height',
      'standard'
    )
    expect(
      within(stake).getByTestId('transaction-current-specimen')
    ).toHaveAttribute('data-transaction-launcher-treatment', 'neutral-action')

    const voteLock = document.getElementById('transactions-vote-lock')!
    expect(
      within(voteLock).getByTestId('transaction-current-specimen')
    ).toHaveAttribute('data-transaction-launcher-treatment', 'neutral-action')

    const automated = document.getElementById('transactions-automated')!
    expect(
      automated.querySelector('[data-specimen-backdrop]')
    ).toHaveAttribute('data-specimen-backdrop', 'beige')

    const manual = document.getElementById('transactions-manual')!
    const manualBoundary = within(manual).getByTestId(
      'transaction-current-specimen'
    ).parentElement!
    expect(manualBoundary).toHaveAttribute('data-specimen-mode', 'full-canvas')
    expect(manualBoundary).toHaveAttribute('data-specimen-padding', 'none')
  })

  it('keeps the ordered controls together after a stable state readout', () => {
    renderWorkbench()

    const navigation = screen.getByRole('navigation', {
      name: 'Stake state sequence',
    })
    const controls = within(navigation).getByTestId(
      'transaction-sequence-controls'
    )

    expect(
      within(controls).getByRole('button', { name: 'Previous' })
    ).toBeVisible()
    expect(within(controls).getByRole('button', { name: 'Next' })).toBeVisible()
    expect(controls.children).toHaveLength(2)
  })

  it('widens Automated execution states to the full canvas', () => {
    renderWorkbench(
      '/internal/design-system/workbench?transactions-automated.operation=mint&transactions-automated.step=quote&transactions-automated.state=quote-searching#transactions-automated'
    )

    const automated = document.getElementById('transactions-automated')!
    const boundary = within(automated).getByTestId(
      'transaction-current-specimen'
    ).parentElement!
    expect(boundary).toHaveAttribute('data-specimen-mode', 'full-canvas')
    expect(boundary).toHaveAttribute('data-specimen-padding', 'none')
    expect(
      automated.querySelector('[data-specimen-backdrop]')
    ).toHaveAttribute('data-specimen-backdrop', 'neutral')
  })

  it('reports unknown semantic values and falls back to the family default', () => {
    renderWorkbench(
      '/internal/design-system/workbench?transactions-vote-lock.operation=unknown&transactions-vote-lock.state=imaginary#transactions-vote-lock'
    )

    expect(screen.getByTestId('vote-lock-owner')).toHaveTextContent(
      'Lock amount'
    )
    expect(
      screen
        .getAllByRole('status')
        .map(({ textContent }) => textContent)
        .join(' ')
    ).toContain('Unavailable operation value “unknown”; showing “lock”.')
    expect(
      screen
        .getAllByRole('status')
        .map(({ textContent }) => textContent)
        .join(' ')
    ).toContain('Unavailable state value “imaginary”; showing “lock-amount”.')
  })

  it('moves through the exact family order and preserves the current hash', () => {
    renderWorkbench(
      '/internal/design-system/workbench?transactions-stake.operation=stake&transactions-stake.step=stake&transactions-stake.state=stake-amount#current-review'
    )
    const navigation = screen.getByRole('navigation', {
      name: 'Stake state sequence',
    })
    expect(
      within(navigation).getByRole('button', { name: 'Previous' })
    ).toBeDisabled()

    fireEvent.click(within(navigation).getByRole('button', { name: 'Next' }))

    expect(screen.getByTestId('stake-owner')).toHaveTextContent('Approval')
    expect(screen.getByTestId('location-probe')).toHaveTextContent(
      'transactions-stake.state=approval'
    )
    expect(screen.getByTestId('location-probe')).toHaveTextContent(
      '#transactions-stake'
    )
  })

  it('disables Next at the final family boundary', () => {
    renderWorkbench(
      '/internal/design-system/workbench?transactions-zapper.operation=buy-sell&transactions-zapper.step=outcome-attachment&transactions-zapper.state=intro-call#transactions-zapper'
    )
    const navigation = screen.getByRole('navigation', {
      name: 'Zapper state sequence',
    })
    expect(
      within(navigation).getByRole('button', { name: 'Next' })
    ).toBeDisabled()
  })

  it('keeps the all-state audit index opt-in and lists every Manual state', () => {
    const { unmount } = renderWorkbench()
    expect(screen.queryByTestId('transaction-audit-index')).toBeNull()

    unmount()
    render(
      <MemoryRouter
        initialEntries={[
          '/internal/design-system/workbench?transactions-manual.view=all#transactions-manual',
        ]}
      >
        <DocumentationTransactionWorkbench />
      </MemoryRouter>
    )

    const audit = screen.getByTestId('transaction-audit-index')
    const stateLinks = within(audit).getAllByRole('link')
    expect(stateLinks).toHaveLength(29)
    stateLinks.forEach((link) =>
      expect(link.getAttribute('href')).toMatch(/#transactions-manual$/)
    )
    expect(within(audit).getByText(/Review mint requirements/)).toBeVisible()
    expect(within(audit).getByText(/Redemption complete/)).toBeVisible()
    expect(screen.getAllByTestId('transaction-current-specimen')).toHaveLength(
      5
    )
  })

  it('reuses exact checkpoint owners without importing product mutation seams', () => {
    const source = readFileSync(
      'src/views/internal/design-system/documentation-transaction-workbench.tsx',
      'utf8'
    )

    expect(source).toContain('ZapperInlineReference')
    expect(source).toContain('AutomatedMintEntry')
    expect(source).toContain('AutomatedMintConfigure')
    expect(source).toContain('AutomatedMintWorkspace')
    expect(source).toContain('StakeProductContext')
    expect(source).toContain('VoteLockProductContext')
    expect(source).toContain('ManualIssuanceAnchor')
    expect(source).toContain('DocumentationSpecimenCanvas')
    expect(source).not.toMatch(
      /useAccount|useWallet|useWriteContract|useReadContract/
    )
    expect(source).not.toMatch(/src\/views\/index-dtf/)
    expect(source).not.toContain('TransactionTruthSpectrum')
  })
})
