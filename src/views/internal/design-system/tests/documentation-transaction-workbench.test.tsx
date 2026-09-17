import { readFileSync } from 'node:fs'
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
  AutomatedMintConfigure: ({ state }: { state: string }) => (
    <div data-testid="automated-configure-owner">{state}</div>
  ),
}))

vi.mock('../transaction-composition-staged-workspace', () => ({
  AutomatedMintWorkspace: ({ state }: { state: string }) => (
    <div data-testid="automated-workspace-owner">{state}</div>
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
  ManualIssuanceAnchor: ({ state }: { state: string }) => (
    <div data-testid="manual-owner">{state}</div>
  ),
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
  it('labels the five ordered families as paused exploratory Workbench material', () => {
    renderWorkbench()

    expect(screen.getByText('Workbench · Exploring · Paused')).toBeVisible()
    const sections = screen.getAllByTestId('transaction-documentation-family')
    expect(sections.map(({ id }) => id)).toEqual(
      TRANSACTION_DOCUMENTATION_SECTION_IDS
    )
    expect(TRANSACTION_DOCUMENTATION_SECTIONS).toHaveLength(5)
    expect(screen.getAllByTestId('transaction-current-specimen')).toHaveLength(
      5
    )
    expect(screen.queryByTestId('transaction-system-review')).toBeNull()
    expect(screen.queryByRole('radio')).toBeNull()
  })

  it('resolves a direct namespaced Stake state through its exact owner', () => {
    renderWorkbench(
      '/internal/design-system/workbench?transactions-stake.operation=unstake&transactions-stake.step=unstake&transactions-stake.state=unstake-confirming#transactions-stake'
    )

    expect(screen.getByTestId('stake-owner')).toHaveTextContent(
      'Unstake confirming'
    )
    expect(
      screen.getByRole('combobox', { name: 'Stake operation' })
    ).toHaveTextContent('Unstake')
    expect(
      screen.getByRole('combobox', { name: 'Stake step' })
    ).toHaveTextContent('Unstake')
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
      name: 'Stake ordered flow',
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
      name: 'Zapper ordered flow',
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
    expect(within(audit).getByText(/Mint requirements/)).toBeVisible()
    expect(within(audit).getByText(/Redeem outcome/)).toBeVisible()
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
