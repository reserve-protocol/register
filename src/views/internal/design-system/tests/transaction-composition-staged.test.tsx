import { fireEvent, render, screen, within } from '@testing-library/react'
import type { ImgHTMLAttributes } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { StagedTransactionComposition } from '../transaction-composition-staged'
import {
  appliedExistingCollateralFor,
  INPUT_AMOUNT,
  inputFixtureFromDisplay,
  ordersForState,
  outcomeFundingFor,
  REDEEM_INPUT_AMOUNT,
  REDEEM_INPUT_BALANCE,
  redeemOutcomeFor,
} from '../transaction-composition-staged-fixtures'

vi.mock('@/components/token-logo', () => ({
  default: ({
    symbol: _symbol,
    size = 'md',
    address: _address,
    chain: _chain,
    src,
    width,
    height,
    ...props
  }: ImgHTMLAttributes<HTMLImageElement> & {
    symbol?: string
    size?: 'sm' | 'md' | 'lg' | 'xl'
    address?: string
    chain?: number
  }) => {
    const pixels = { sm: 16, md: 20, lg: 24, xl: 32 }[size]

    return (
      <img
        {...props}
        src={src ?? '/svgs/defaultLogo.svg'}
        width={width ?? pixels}
        height={height ?? pixels}
      />
    )
  },
}))

const renderComposition = () => {
  render(<StagedTransactionComposition />)

  return screen.getByTestId('transaction-composition-staged')
}

const selectState = (composition: HTMLElement, state: string) => {
  fireEvent.click(within(composition).getByRole('radio', { name: state }))
}

const inspectOrders = (composition: HTMLElement) => {
  const trigger = within(composition).queryByRole('button', {
    name: 'View orders',
  })

  if (trigger) fireEvent.click(trigger)
}

describe('automated mint design-system lab', () => {
  it('moves stage emphasis from collateral work to Mint and back for recovery', () => {
    const composition = renderComposition()
    for (const [state, current] of [
      ['Input only ready', 'collateral'],
      ['Authorizing orders', 'collateral'],
      ['Orders filling', 'collateral'],
      ['Collateral ready', 'mint'],
      ['Final mint signing', 'mint'],
      ['Recoverable failure', 'collateral'],
      ['Transaction failed', 'collateral'],
      ['No swaps needed', 'mint'],
    ]) {
      selectState(composition, state)
      const task = within(composition).getByTestId('automated-mint-task')
      expect(task.querySelectorAll('[aria-current="step"]')).toHaveLength(1)
      expect(
        within(task).getByTestId(`automated-mint-${current}-step`)
      ).toHaveAttribute('aria-current', 'step')
      const amount = within(task).getByTestId(
        current === 'collateral'
          ? 'automated-mint-collateral-stage'
          : 'automated-mint-output-amount'
      )
      expect(amount).toHaveAttribute('data-stage-emphasis', 'current')
      const complete = within(task).queryByTestId(
        'automated-mint-collateral-complete'
      )
      if (state === 'Collateral ready' || state === 'Final mint signing') {
        expect(complete).toBeVisible()
      } else {
        expect(complete).not.toBeInTheDocument()
      }
      if (state === 'Transaction failed') {
        expect(amount).toHaveTextContent('Transaction failed')
        expect(amount).not.toHaveTextContent('Orders filled')
      }
    }
  })

  it.each([
    [
      'Mint complete',
      'New mint',
      'Mint',
      'You provide amount',
      'Initial configuration',
      'USDC',
    ],
    [
      'Redeem complete',
      'New redeem',
      'Redeem',
      'You redeem amount',
      'Initial configuration',
      'CMC20',
    ],
    [
      'Mint complete',
      'New mint',
      'Mint',
      'You provide amount',
      'BSC configuration',
      'USDT',
    ],
    [
      'Redeem complete',
      'New redeem',
      'Redeem',
      'You redeem amount',
      'BSC configuration',
      'CMC20',
    ],
  ])(
    'restarts %s with %s from %s/%s/%s/%s without completed state',
    (state, action, operation, inputName, configuration, asset) => {
      const composition = renderComposition()
      selectState(composition, configuration)
      fireEvent.change(within(composition).getByRole('textbox'), {
        target: { value: '73.25' },
      })
      selectState(composition, state)
      const explorer = within(composition).getByTestId(
        'automated-mint-view-transaction'
      )
      expect(explorer.getAttribute('href')).toContain(
        configuration === 'BSC configuration' ? 'bscscan.com' : 'basescan.org'
      )
      const restart = within(composition).getByRole('button', { name: action })
      expect(restart).toHaveAttribute('data-tone', 'secondary')
      expect(restart).toHaveAttribute('data-size', 'compact')
      fireEvent.click(restart)
      expect(
        within(composition).queryByTestId('automated-mint-outcome')
      ).toBeNull()
      expect(within(composition).queryByTestId('staged-order-row')).toBeNull()
      expect(
        within(composition).getByRole('radio', { name: operation, exact: true })
      ).toBeChecked()
      expect(
        within(composition).getByRole('textbox', { name: inputName })
      ).toHaveValue('')
      expect(
        within(composition).getByTestId('automated-issuance-configure-amount')
      ).toHaveTextContent(asset)
      expect(
        within(composition).getByTestId('automated-mint-get-quote')
      ).toBeDisabled()
    }
  )
  it('exposes the production configuration gates and chain identity', () => {
    const composition = renderComposition()

    expect(
      within(composition).getByText('Mint directly with basket assets')
    ).toBeVisible()

    selectState(composition, 'Trading paused')
    expect(within(composition).getAllByText('Trading paused')).toHaveLength(2)
    expect(
      within(composition).getByText(
        'WBTC is outside trading hours, so minting and redeeming is unavailable right now.'
      )
    ).toBeVisible()
    expect(
      within(composition).getByRole('button', { name: 'Get quote' })
    ).toBeDisabled()

    selectState(composition, 'BSC configuration')
    expect(within(composition).getByText('Enter USDT amount')).toBeVisible()
    expect(within(composition).getByText('14,802.63 USDT')).toBeVisible()
    fireEvent.change(
      within(composition).getByRole('textbox', { name: 'You provide amount' }),
      { target: { value: '10,000.000000000001' } }
    )
    expect(
      within(composition).getByRole('button', { name: 'Get quote' })
    ).toBeEnabled()
  })

  it('exposes production quote branches without inventing new mechanics', () => {
    const composition = renderComposition()

    selectState(composition, 'Price unavailable')
    expect(within(composition).getAllByText('Price unavailable')).toHaveLength(
      2
    )

    selectState(composition, 'Per-order quote failure')
    inspectOrders(composition)
    expect(within(composition).getAllByTestId('staged-order-row')).toHaveLength(
      5
    )
    expect(within(composition).getAllByText('Quote unavailable')).toHaveLength(
      2
    )
    expect(within(composition).getAllByText('Sell quote')).toHaveLength(4)

    selectState(composition, 'Split order quotes')
    expect(within(composition).getAllByTestId('staged-order-row')).toHaveLength(
      6
    )
    expect(
      within(composition)
        .getAllByTestId('staged-order-row')
        .filter((row) => row.dataset.orderAsset === 'WBTC')
    ).toHaveLength(2)

    selectState(composition, 'No swaps needed')
    expect(within(composition).queryByTestId('staged-order-row')).toBeNull()
    expect(
      within(
        within(composition).getByTestId('automated-mint-collateral-stage')
      ).getByText('Collateral ready')
    ).toBeVisible()
    expect(
      within(
        within(composition).getByTestId('automated-mint-collateral-stage')
      ).getByText('No swaps needed')
    ).toBeVisible()
    expect(
      within(composition).queryByTestId('automated-mint-orders')
    ).toBeNull()
    expect(
      within(composition).getByRole('button', { name: 'Mint CMC20' })
    ).toBeVisible()
    selectState(composition, 'Mint complete')
    expect(
      within(composition).queryByText('Collateral swap price impact')
    ).toBeNull()

    selectState(composition, 'Redeem complete')
    expect(
      within(composition).getByText('Collateral swap price impact')
    ).toBeVisible()
  })

  it('exposes production order expiry and non-order recovery states', () => {
    const composition = renderComposition()

    selectState(composition, 'Orders filling')
    inspectOrders(composition)
    const collateralStage = within(composition).getByTestId(
      'automated-mint-collateral-stage'
    )
    expect(within(collateralStage).getByText('4/5')).toBeVisible()
    expect(
      within(collateralStage).getByText('1 order open · expires in 1m 42s')
    ).toBeVisible()
    expect(
      within(composition).getAllByText('1 order open · expires in 1m 42s')
    ).toHaveLength(1)
    expect(
      within(
        within(composition).getByTestId('automated-mint-task')
      ).queryByTestId('canonical-inline-message')
    ).toBeNull()

    selectState(composition, 'Cancelled order')
    expect(within(composition).getByText('Cancelled')).toBeVisible()
    expect(
      within(composition).getByRole('button', { name: 'Retry 1 failed order' })
    ).toBeVisible()

    selectState(composition, 'Wallet unavailable')
    expect(
      within(composition).getByRole('button', { name: 'Reconnect wallet' })
    ).toBeDisabled()

    selectState(composition, 'Transaction failed')
    expect(
      within(composition).getByText('An error occurred. Please try again.')
    ).toBeVisible()
    expect(
      within(composition).getByRole('button', { name: 'Try again' })
    ).toBeVisible()
    expect(
      within(composition).getByRole('button', { name: 'Start over' })
    ).toBeVisible()
  })

  it('preserves the production entry guidance and wallet capability branches', () => {
    const composition = renderComposition()

    expect(
      within(composition).getByText('Most users should use Swap')
    ).toBeVisible()
    expect(
      within(composition).getByText('Automated Mint / Redeem')
    ).toBeVisible()
    expect(
      within(composition).getByRole('link', { name: 'Use Swap' })
    ).toHaveAttribute('data-tone', 'secondary')
    const swapGuidance = within(composition).getByTestId(
      'automated-mint-swap-guidance'
    )
    const recommendation = within(swapGuidance).getByTestId(
      'canonical-inline-message'
    )
    expect(recommendation).toHaveAttribute('data-presentation', 'summary')
    expect(recommendation).toHaveAttribute(
      'data-icon-presentation',
      'contained'
    )
    expect(recommendation).toHaveClass('bg-card', 'ring-border')
    expect(recommendation).toHaveClass('p-2')
    expect(recommendation).not.toHaveClass('pr-2')
    expect(
      within(recommendation).getByText('Most users should use Swap')
    ).toBeVisible()
    expect(
      within(recommendation).queryByText('Before using automated minting')
    ).not.toBeInTheDocument()
    expect(
      within(swapGuidance).getByText('Before using automated minting')
    ).toBeVisible()
    expect(within(composition).getByText('You fund')).toBeVisible()
    expect(within(composition).getByText('You mint')).toBeVisible()
    const introductionContent = within(composition).getByTestId(
      'automated-mint-introduction-content'
    )
    expect(introductionContent).toHaveClass('p-2')
    expect(
      within(composition).getByTestId('automated-mint-introduction')
    ).toHaveClass('sm:min-h-[32rem]')
    const introductionBody = within(introductionContent).getByTestId(
      'automated-mint-introduction-body'
    )
    expect(introductionBody).toHaveClass('px-4', 'pt-4')
    expect(introductionBody).not.toHaveClass('mt-auto')
    expect(
      within(introductionContent).getByTestId('canonical-action-group')
    ).toHaveClass('mt-auto', 'px-0')
    expect(
      within(introductionContent).getByRole('link', {
        name: 'Mint directly with basket assets',
      })
    ).toHaveAttribute('data-tone', 'secondary')

    fireEvent.click(
      within(composition).getByRole('button', { name: 'Continue' })
    )
    expect(
      within(composition).getByText('Smart Account Required')
    ).toBeVisible()
    expect(
      within(composition).getByRole('button', { name: 'Connect Wallet' })
    ).toBeVisible()
    expect(
      within(composition).getByRole('link', { name: 'Open MetaMask website' })
    ).toBeVisible()
    expect(
      within(composition).getByRole('button', {
        name: 'Back to automated minting introduction',
      })
    ).toBeVisible()
    const walletRequirement = within(composition).getByTestId(
      'automated-mint-wallet-requirement-content'
    )
    expect(
      within(composition).getByTestId('automated-mint-wallet-requirement')
    ).toHaveClass('sm:min-h-[32rem]')
    expect(walletRequirement.querySelector('header')).toHaveClass(
      'px-4',
      'pt-4'
    )
    expect(
      within(walletRequirement).getByTestId(
        'automated-mint-wallet-requirement-body'
      )
    ).toHaveClass('mt-auto')
    expect(
      within(walletRequirement).getByTestId('canonical-action-group')
    ).toHaveClass('px-0')
    expect(
      within(walletRequirement).getByTestId('canonical-action-group')
    ).not.toHaveClass('p-2')

    fireEvent.click(
      within(composition).getByRole('button', { name: 'Connect Wallet' })
    )
    expect(within(composition).getByText('Enter USDC amount')).toBeVisible()

    selectState(composition, 'Incompatible wallet')
    expect(
      within(
        within(composition).getByTestId('automated-mint-wallet-requirement')
      ).getByText('Incompatible wallet')
    ).toBeVisible()
    fireEvent.click(
      within(composition).getByRole('button', { name: 'Switch wallet' })
    )
    expect(within(composition).getByText('Enter USDC amount')).toBeVisible()
  })

  it('fills the mobile page canvas while preserving the natural desktop task width', () => {
    const composition = renderComposition()
    const shell = within(composition).getByTestId('automated-mint-narrow-stage')

    expect(shell).toHaveClass(
      'flex',
      'min-h-[calc(100dvh-3.5rem)]',
      'sm:min-h-0',
      'sm:max-w-[476px]',
      'transition-[max-width]'
    )
    expect(shell).not.toHaveClass('min-h-[30rem]')

    for (const state of [
      'Wallet required',
      'Incompatible wallet',
      'Initial configuration',
    ]) {
      selectState(composition, state)
      expect(
        within(composition).getByTestId('automated-mint-narrow-stage')
      ).toBe(shell)
      expect(shell).toHaveClass(
        'min-h-[calc(100dvh-3.5rem)]',
        'sm:min-h-0',
        'sm:max-w-[476px]'
      )
      expect(shell).not.toHaveClass('min-h-[30rem]')
    }
  })

  it('caps the expanded workspace at the production automated-mint width', () => {
    const composition = renderComposition()
    const shell = within(composition).getByTestId('automated-mint-narrow-stage')

    selectState(composition, 'Input only ready')
    expect(shell).toHaveClass('max-w-[1200px]')
    expect(shell).not.toHaveClass(
      'min-h-[30rem]',
      'max-w-[476px]',
      'max-w-full'
    )
  })

  it('starts narrow and widens only after quote creation', () => {
    const composition = renderComposition()
    selectState(composition, 'Initial configuration')

    expect(within(composition).getByText('Enter USDC amount')).toBeVisible()
    expect(
      within(composition).getByRole('textbox', { name: 'You provide amount' })
    ).toHaveValue('')
    expect(
      within(composition).getByRole('textbox', { name: 'You provide amount' })
    ).toHaveAttribute('placeholder', '0')
    expect(
      within(composition).getByRole('button', { name: 'Enter amount' })
    ).toBeDisabled()
    expect(within(composition).queryByText('Collateral swaps')).toBeNull()
    expect(
      screen.getByTestId('transaction-composition-staged-stage')
    ).toHaveClass('p-0', 'sm:p-6')
    expect(
      within(composition).getByTestId('automated-mint-configure-surface')
    ).toHaveClass('min-w-0')
    expect(
      within(composition).getByTestId('automated-mint-configure-surface')
    ).not.toHaveClass('p-2', 'border', 'shadow-lg')
    expect(
      within(composition).getByRole('radio', { name: 'Mint' })
    ).toBeChecked()
    expect(
      within(composition).getByRole('radio', { name: 'Redeem' })
    ).toBeEnabled()
    const configureFrame = within(composition).getByTestId(
      'automated-mint-configure-frame'
    )
    expect(configureFrame).toHaveClass(
      'overflow-hidden',
      'ring-2',
      'ring-card',
      'ring-offset-0',
      'bg-surface-recessed-content'
    )
    const configureActive = within(configureFrame).getByTestId(
      'automated-mint-configure-active'
    )
    expect(configureActive).toHaveClass('bg-card', 'flex-1', 'shadow-sm')
    expect(
      within(configureActive).getByTestId('automated-mint-operation-switch')
    ).toBeVisible()
    expect(
      within(configureActive).getByLabelText('Automated issuance operation')
    ).toHaveAttribute('data-size', 'compact')
    expect(
      within(configureActive).getByLabelText('Automated issuance operation')
    ).toHaveAttribute('data-width', 'intrinsic')
    expect(
      within(configureActive).getByRole('link', {
        name: 'Switch to manual minting',
      })
    ).toHaveAttribute(
      'href',
      '/base/index-dtf/0xa0a8481fc246cd12f75227abb96220ff5360fad3/issuance/manual'
    )
    expect(within(configureActive).queryByText('Manual')).toBeNull()
    expect(
      within(configureActive).getByText(
        'Already hold the required basket tokens?'
      )
    ).toBeVisible()
    expect(
      within(configureFrame).getByTestId('automated-mint-configure-upcoming')
    ).toHaveClass('bg-surface-recessed-content')
    expect(
      within(configureFrame).getByTestId('automated-mint-configure-upcoming')
    ).not.toHaveClass('flex-1')
    expect(within(configureFrame).queryByText('1', { exact: true })).toBeNull()
    const configureSteps = within(composition).getAllByTestId(
      'automated-configure-step-content'
    )
    expect(configureSteps[0]).toHaveClass('px-4')
    expect(configureSteps[1].parentElement).toHaveClass('p-6')
    expect(configureSteps[2].parentElement).toHaveClass('p-6')

    fireEvent.change(
      within(composition).getByRole('textbox', { name: 'You provide amount' }),
      { target: { value: '10,000' } }
    )
    fireEvent.click(
      within(composition).getByRole('button', { name: 'Get quote' })
    )
    expect(
      within(composition).getByRole('button', { name: 'View orders' })
    ).toBeVisible()
    expect(
      within(composition).getByLabelText('Automated mint task')
    ).toBeVisible()
    expect(
      screen.getByTestId('transaction-composition-staged-stage')
    ).toHaveClass('p-0')
    expect(
      screen.getByTestId('transaction-composition-staged-stage')
    ).not.toHaveClass('p-4', 'sm:p-6')
    expect(
      within(composition).queryByLabelText('Automated mint progress')
    ).toBeNull()
    fireEvent.click(
      within(composition).getByRole('button', { name: 'View orders' })
    )
    expect(
      within(composition).getByLabelText('Fetching swap quotes')
    ).toBeVisible()
  })

  it('keeps the zero-value estimate visible for every empty configuration', () => {
    const composition = renderComposition()

    selectState(composition, 'Initial configuration')
    expect(
      within(composition).getByText(
        'Basket assets are acquired automatically before CMC20 is minted.'
      )
    ).toBeVisible()
    expect(
      within(
        within(composition).getByTestId('automated-issuance-configure-amount')
      ).getByText('$0.00')
    ).toBeVisible()

    fireEvent.click(
      within(composition).getByRole('radio', { name: 'Redeem', exact: true })
    )
    expect(
      within(composition).getByText(
        'CMC20 is redeemed and its basket assets are automatically sold for USDC.'
      )
    ).toBeVisible()
    expect(
      within(
        within(composition).getByTestId('automated-issuance-configure-amount')
      ).getByText('$0.00')
    ).toBeVisible()

    selectState(composition, 'BSC configuration')
    expect(
      within(composition).getByText(
        'Basket assets are acquired automatically before CMC20 is minted.'
      )
    ).toBeVisible()
    expect(
      within(
        within(composition).getByTestId('automated-issuance-configure-amount')
      ).getByText('$0.00')
    ).toBeVisible()

    fireEvent.click(
      within(composition).getByRole('radio', { name: 'Redeem', exact: true })
    )
    expect(
      within(composition).getByText(
        'CMC20 is redeemed and its basket assets are automatically sold for USDT.'
      )
    ).toBeVisible()
  })

  it('keeps the amount while pausing and resuming quote search', () => {
    const composition = renderComposition()

    selectState(composition, 'Quote searching')
    fireEvent.click(
      within(composition).getByRole('button', {
        name: 'Pause quote search',
      })
    )
    expect(
      within(
        within(composition).getByTestId('automated-mint-collateral-stage')
      ).getByText('Quote search paused')
    ).toBeVisible()
    const pausedMessage = within(
      within(composition).getByTestId('automated-mint-collateral-action-region')
    ).getByTestId('canonical-inline-message')
    expect(pausedMessage).toHaveAttribute('data-presentation', 'summary')
    expect(pausedMessage).toHaveTextContent('Quote paused · Amount saved')
    expect(within(composition).getByText('10,000')).toBeVisible()

    fireEvent.click(
      within(composition).getByRole('button', { name: 'Resume quote search' })
    )
    inspectOrders(composition)
    expect(
      within(composition).getByLabelText('Fetching swap quotes')
    ).toBeVisible()
  })

  it('distinguishes retrying a failed quote fetch from resuming a pause', () => {
    const composition = renderComposition()

    selectState(composition, 'Quote unavailable')
    expect(
      within(composition).getByRole('button', { name: 'Fetch quotes again' })
    ).toBeVisible()
    expect(
      within(composition).queryByRole('button', { name: 'Resume quote search' })
    ).toBeNull()

    fireEvent.click(
      within(composition).getByRole('button', { name: 'Fetch quotes again' })
    )
    expect(
      within(composition).getByRole('button', { name: 'Pause quote search' })
    ).toBeVisible()
  })

  it('preserves the selected input through a quote-search pause and edit', () => {
    const composition = renderComposition()

    selectState(composition, 'Initial configuration')
    fireEvent.click(within(composition).getByRole('button', { name: 'Max' }))
    fireEvent.click(
      within(composition).getByRole('button', { name: 'Get quote' })
    )
    expect(within(composition).getByText('14,802.63')).toBeVisible()

    fireEvent.click(
      within(composition).getByRole('button', {
        name: 'Pause quote search',
      })
    )
    fireEvent.click(
      within(composition).getByRole('button', { name: 'Edit amount' })
    )
    expect(
      within(composition).getByRole('textbox', { name: 'You provide amount' })
    ).toHaveValue('14,802.63')

    fireEvent.click(
      within(composition).getByRole('button', { name: 'Get quote' })
    )
    selectState(composition, 'Input only ready')
    expect(within(composition).getByText('≈147.75')).toBeVisible()
  })

  it('accepts an ordinary valid amount and derives the workspace from it', () => {
    const composition = renderComposition()

    selectState(composition, 'Initial configuration')
    const amountInput = within(composition).getByRole('textbox', {
      name: 'You provide amount',
    })
    fireEvent.change(amountInput, { target: { value: '5,000.25' } })

    expect(
      within(composition).getByRole('button', { name: 'Get quote' })
    ).toBeEnabled()
    expect(within(composition).getByText('$5,000.25')).toBeVisible()

    fireEvent.click(
      within(composition).getByRole('button', { name: 'Get quote' })
    )
    selectState(composition, 'Input only ready')
    inspectOrders(composition)

    expect(within(composition).getByText('5,000.25')).toBeVisible()
    expect(within(composition).getByText('≈49.91')).toBeVisible()
    expect(within(composition).getByText('1,756.4878 USDC')).toBeVisible()
  })

  it('allows over-balance quote discovery but blocks execution', () => {
    const composition = renderComposition()
    selectState(composition, 'Initial configuration')
    const amountInput = within(composition).getByRole('textbox', {
      name: 'You provide amount',
    })

    fireEvent.change(amountInput, { target: { value: '15,000' } })

    expect(within(composition).getByText('$15,000.00')).toBeVisible()
    expect(
      within(composition).getByTestId('automated-mint-balance-error')
    ).toHaveTextContent('Exceeds available balance')
    expect(
      within(composition).getByRole('button', { name: 'Get quote' })
    ).toBeEnabled()

    fireEvent.click(
      within(composition).getByRole('button', { name: 'Get quote' })
    )
    selectState(composition, 'Input only ready')

    expect(
      within(composition).getByText('Exceeds available balance')
    ).toBeVisible()
    expect(
      within(composition).getByRole('button', {
        name: 'Start acquisition',
      })
    ).toBeDisabled()
  })

  it('keeps input-only quotes distinct from the existing-collateral branch', () => {
    const composition = renderComposition()

    selectState(composition, 'Input only ready')
    inspectOrders(composition)
    expect(within(composition).getAllByTestId('staged-order-row')).toHaveLength(
      5
    )
    expect(within(composition).getAllByText('Sell quote')).toHaveLength(5)
    expect(within(composition).getAllByText('Buy quote')).toHaveLength(5)
    expect(within(composition).queryByText('Quote ready')).toBeNull()
    expect(within(composition).queryByText('CoW Protocol order')).toBeNull()
    expect(
      within(composition).getByText(
        'Your input will be split across these basket assets.'
      )
    ).toBeVisible()
    expect(
      within(composition).getByTestId('automated-mint-orders')
    ).toHaveClass('bg-surface-recessed-content', 'overflow-hidden')
    expect(
      within(composition).getByTestId('automated-mint-orders-column')
    ).toHaveClass('bg-surface-recessed-content')
    expect(
      within(composition).getByTestId('automated-mint-orders-scroll')
    ).toHaveClass('px-2')
    expect(
      within(composition).getByTestId('automated-mint-orders-scroll')
    ).not.toHaveClass('py-2')
    expect(
      within(composition).getByTestId('automated-mint-workspace')
    ).toHaveClass('bg-secondary')
    expect(
      within(composition).getByTestId('automated-mint-workspace-sections')
    ).toHaveClass('gap-0.5', 'lg:grid-cols-2')
    expect(
      within(composition).getByTestId('staged-orders-list')
    ).not.toHaveClass('space-y-0.5')
    expect(within(composition).getByTestId('staged-orders-header')).toHaveClass(
      'p-4'
    )
    for (const order of within(composition).getAllByTestId(
      'staged-order-row'
    )) {
      expect(order).toHaveClass('bg-transparent', 'px-4', 'py-2')
    }
    expect(
      within(composition).queryByTestId('automated-mint-applied-collateral')
    ).toBeNull()
    expect(within(composition).queryByText('View on CoW Swap')).toBeNull()

    selectState(composition, 'Existing collateral ready')
    expect(
      within(composition).queryByTestId('automated-mint-applied-collateral')
    ).toBeNull()
    const collateralAssets = within(
      within(composition).getByTestId('automated-mint-input-amount')
    ).getByTestId('automated-mint-existing-collateral-assets')
    expect(
      within(collateralAssets).getByTestId('canonical-token-logo-stack')
    ).toBeVisible()
    expect(collateralAssets.querySelectorAll('img')).toHaveLength(2)
    expect(collateralAssets.querySelector('img[alt="WBTC"]')).not.toBeNull()
    expect(collateralAssets.querySelector('img[alt="WETH"]')).not.toBeNull()
    expect(
      within(composition).queryByText('Basket tokens in your wallet')
    ).toBeNull()
    expect(within(composition).getByText('2,605.6 USDC')).toBeVisible()
    expect(within(composition).getByText('2,111.2 USDC')).toBeVisible()
  })

  it('places collateral acquisition between funding and estimated output', () => {
    const composition = renderComposition()

    selectState(composition, 'Input only ready')

    const sequence = within(composition).getByTestId(
      'automated-mint-amount-sequence'
    )
    const fundingStage = within(sequence).getByTestId(
      'automated-mint-funding-stage'
    )
    const collateralStep = within(sequence).getByTestId(
      'automated-mint-collateral-step'
    )
    const mintStep = within(sequence).getByTestId('automated-mint-mint-step')
    const flexibleSpace = within(sequence).getByTestId(
      'automated-mint-flexible-space'
    )
    expect(
      fundingStage.compareDocumentPosition(collateralStep) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
    expect(
      collateralStep.compareDocumentPosition(mintStep) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
    expect(
      mintStep.compareDocumentPosition(flexibleSpace) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
    expect(mintStep.previousElementSibling).toHaveAttribute(
      'data-testid',
      'automated-mint-amount-boundary'
    )
    expect(flexibleSpace).toHaveClass('flex-1')
    expect(
      within(composition).getByTestId('automated-mint-task-card')
    ).not.toHaveClass('p-2')
    expect(fundingStage).toHaveClass('p-2')
    expect(collateralStep).toHaveClass('p-2')
    expect(mintStep).toHaveClass('p-2')
    expect(
      within(
        within(sequence).getByTestId('automated-mint-funding-stage')
      ).getByTestId('automated-mint-input-amount')
    ).toBeVisible()
    expect(
      within(sequence).getByTestId('automated-mint-existing-collateral-divider')
    ).toHaveClass('mx-4', 'mt-2', 'h-px', 'bg-border')
    expect(
      within(sequence).getByTestId('automated-mint-existing-collateral')
    ).toHaveClass('pb-4', 'pt-6')
    for (const boundary of within(sequence).getAllByTestId(
      'automated-mint-amount-boundary'
    )) {
      expect(boundary).toHaveClass('h-0.5', 'bg-secondary')
      expect(
        within(boundary).getByTestId('automated-mint-amount-boundary-indicator')
      ).toHaveClass('size-9', 'bg-secondary')
      expect(
        within(boundary).getByTestId(
          'automated-mint-amount-boundary-indicator-core'
        )
      ).toHaveClass('size-8', 'bg-card')
    }

    const collateral = within(composition).getByTestId(
      'automated-mint-collateral-stage'
    )
    expect(
      within(collateral).getByText('Automatic collateral acquisition')
    ).toBeVisible()
    expect(within(collateral).getByText('Step 1 of 2')).toBeVisible()
    expect(within(collateral).getByText('5')).toBeVisible()
    expect(within(collateral).getByText('5 swaps prepared')).toBeVisible()
    expect(
      within(collateral).getByTestId('automated-mint-collateral-assets')
        .children
    ).toHaveLength(5)
    const amountLogo = within(
      within(composition).getByTestId('automated-mint-input-amount')
    )
      .getByTestId('canonical-chain-badged-logo')
      .querySelector('img')
    const collateralLogos = within(collateral)
      .getByTestId('automated-mint-collateral-assets')
      .querySelectorAll('img')
    for (const logo of collateralLogos) {
      expect(logo).toHaveAttribute('width', amountLogo?.getAttribute('width'))
      expect(logo).toHaveAttribute('height', amountLogo?.getAttribute('height'))
    }
  })

  it('preserves existing collateral through execution and scoped retry', () => {
    const composition = renderComposition()

    selectState(composition, 'Existing collateral ready')
    inspectOrders(composition)
    fireEvent.click(
      within(composition).getByRole('button', {
        name: 'Start acquisition',
      })
    )
    expect(
      within(composition).getByTestId(
        'automated-mint-existing-collateral-assets'
      )
    ).toBeVisible()
    expect(within(composition).getByText('2,605.6 USDC')).toBeVisible()

    selectState(composition, 'Recoverable failure')
    const failureMessage = within(
      within(composition).getByTestId('automated-mint-collateral-action-region')
    ).getByTestId('canonical-inline-message')
    expect(failureMessage).toHaveAttribute('data-presentation', 'summary')
    expect(failureMessage).toHaveTextContent('1 order needs retrying')
    expect(
      within(failureMessage).queryByText('Resolve failed orders')
    ).toBeNull()
    fireEvent.click(
      within(composition).getByRole('button', { name: 'Retry 1 failed order' })
    )
    expect(
      within(composition).getByTestId(
        'automated-mint-existing-collateral-assets'
      )
    ).toBeVisible()
    expect(within(composition).getByText('2,605.6 USDC')).toBeVisible()
    expect(within(composition).getAllByText('Filled')).toHaveLength(4)
  })

  it('preserves the input-only funding branch when lifecycle changes', () => {
    const composition = renderComposition()

    selectState(composition, 'Input only ready')
    inspectOrders(composition)
    selectState(composition, 'Recoverable failure')

    expect(
      within(composition).queryByTestId(
        'automated-mint-existing-collateral-assets'
      )
    ).toBeNull()
    expect(within(composition).getByText('3,512.8 USDC')).toBeVisible()
  })

  it('reconciles Max funding with fixed existing collateral at completion', () => {
    const composition = renderComposition()

    selectState(composition, 'Initial configuration')
    fireEvent.click(within(composition).getByRole('button', { name: 'Max' }))
    selectState(composition, 'Existing collateral ready')
    inspectOrders(composition)
    expect(within(composition).getByText('4,292.6678 USDC')).toBeVisible()
    fireEvent.click(
      within(composition).getByRole('button', {
        name: 'Start acquisition',
      })
    )

    selectState(composition, 'Mint complete')
    expect(
      within(
        within(composition).getByTestId('automated-mint-outcome-facts')
      ).getAllByTestId('transaction-outcome-detail-row')
    ).toHaveLength(5)
    expect(within(composition).getByText('12,514.781975 USDC')).toBeVisible()
    expect(within(composition).getByText('4.648025 USDC')).toBeVisible()
    expect(within(composition).getByText('$2,283.20')).toBeVisible()
  })

  it('caps applied Mint collateral to the assets required by a smaller input', () => {
    const smallerInput = inputFixtureFromDisplay('1,000', 'mint').amount
    expect(smallerInput).toBeDefined()
    if (!smallerInput) return

    const funding = outcomeFundingFor(smallerInput, true)
    const orders = ordersForState(
      'Input only ready',
      true,
      smallerInput,
      'mint'
    )
    const orderSpend = orders.reduce(
      (total, order) => total + order.sold.value,
      0n
    )

    expect(appliedExistingCollateralFor(smallerInput)).toBe(700_000_000n)
    expect(funding.collateral.value).toBe(700_000_000n)
    expect(orders).toHaveLength(3)
    expect(orders.every((order) => order.sold.value > 0n)).toBe(true)
    expect(orderSpend).toBe(funding.spent.value)
    expect(
      funding.collateral.value + funding.spent.value + funding.unused.value
    ).toBe(smallerInput.value)
  })

  it('preserves filled work while retrying only the expired order', () => {
    const composition = renderComposition()

    selectState(composition, 'Existing collateral ready')
    inspectOrders(composition)
    selectState(composition, 'Recoverable failure')
    expect(
      within(composition).getByTestId('automated-mint-task-card')
    ).not.toHaveClass('p-2')
    expect(
      within(composition).queryByTestId('automated-mint-process-region')
    ).toBeNull()
    expect(
      within(
        within(composition).getByTestId('automated-mint-collateral-stage')
      ).getByText('4/5')
    ).toBeVisible()
    expect(
      within(
        within(composition).getByTestId('automated-mint-collateral-stage')
      ).getByText('1 order needs retry')
    ).toBeVisible()
    expect(
      within(composition).queryByTestId('staged-orders-summary')
    ).toBeNull()
    expect(within(composition).getAllByText('Filled')).toHaveLength(4)
    expect(within(composition).getByText('Expired')).toBeVisible()
    expect(within(composition).getAllByText('Sell quote')).toHaveLength(5)
    expect(within(composition).getAllByText('Buy quote')).toHaveLength(5)
    expect(
      within(composition).getByRole('button', { name: 'Retry 1 failed order' })
    ).toBeVisible()
    expect(within(composition).getAllByText('View order')).toHaveLength(5)
    const orderMetadata = within(composition).getAllByTestId(
      'staged-order-metadata'
    )
    expect(orderMetadata).toHaveLength(5)
    for (const metadata of orderMetadata) {
      expect(metadata).not.toHaveClass('border-t')
      expect(metadata.firstElementChild).toHaveTextContent(/Filled|Expired/)
      expect(
        within(metadata).getByTestId('staged-order-inspection')
      ).toHaveClass('ml-auto')
    }
    expect(within(orderMetadata[0]).getByText('Filled')).toBeVisible()
    expect(
      within(orderMetadata[0]).getByRole('link', { name: /View order/ })
    ).toHaveAttribute('data-size', 'micro')
    expect(
      within(orderMetadata[0]).getByRole('link', { name: /View order/ })
    ).toHaveAttribute('data-tone', 'secondary')
    expect(within(orderMetadata[1]).getByText('Expired')).toBeVisible()
    expect(
      within(orderMetadata[1]).getByRole('link', { name: /View order/ })
    ).toHaveAttribute('data-size', 'micro')
    expect(
      within(composition).getByTestId(
        'automated-mint-existing-collateral-assets'
      )
    ).toBeVisible()
  })

  it('keeps collateral readiness separate from final mint completion', () => {
    const composition = renderComposition()

    selectState(composition, 'Collateral ready')
    expect(
      within(composition).getByRole('button', {
        name: 'Mint CMC20',
      })
    ).toBeVisible()
    expect(
      within(composition).getByTestId('automated-mint-output-amount')
    ).toHaveTextContent('Ready to mint')
    const collateralStage = within(composition).getByTestId(
      'automated-mint-collateral-stage'
    )
    expect(within(collateralStage).getByText('5/5')).toBeVisible()
    expect(within(collateralStage).getByText('Orders filled')).toBeVisible()
    expect(within(composition).queryByText('Mint completed')).toBeNull()

    selectState(composition, 'Final mint signing')
    expect(
      within(composition).getByRole('button', { name: 'Completing mint…' })
    ).toBeDisabled()
    expect(within(composition).queryByText('Mint completed')).toBeNull()
  })

  it('links the final transaction once and keeps completed orders inspectable', () => {
    const composition = renderComposition()

    selectState(composition, 'Mint complete')
    inspectOrders(composition)
    expect(within(composition).queryByText('Mint completed')).toBeNull()
    expect(
      within(composition).queryByText('Your DTF has been minted.')
    ).toBeNull()
    const outcomeFacts = within(composition).getByTestId(
      'automated-mint-outcome-facts'
    )
    expect(outcomeFacts).toHaveClass('grid', 'gap-2')
    expect(outcomeFacts).not.toHaveClass('border-b', 'sm:grid-cols-2')
    expect(
      within(outcomeFacts).getAllByTestId('transaction-outcome-detail-row')
    ).toHaveLength(4)
    expect(
      within(composition).queryByTestId('automated-mint-final-transaction')
    ).toBeNull()
    expect(
      within(composition).getByTestId('automated-mint-outcome-footer')
    ).toContainElement(
      within(composition).getByRole('link', { name: /View transaction/ })
    )
    const wallet = within(composition).getByRole('button', {
      name: 'Track token in your wallet',
    })
    expect(wallet).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(wallet)
    expect(wallet).toHaveAttribute('aria-pressed', 'true')
    expect(
      within(composition).getByTestId('automated-mint-view-dtf')
    ).toHaveClass('min-h-11')
    expect(outcomeFacts.nextElementSibling).toHaveTextContent('Leftover dust')
    expect(
      within(composition).getByRole('link', { name: /View transaction/ })
    ).toHaveAttribute(
      'href',
      'https://basescan.org/tx/0x4b9956225163659ad723853515456526280c1e9cc5b842c3df1b9c7443bb01ae'
    )
    expect(within(composition).getByText('99.82')).toBeVisible()
    expect(
      within(composition).getByTestId('transaction-amount-unit')
    ).toHaveTextContent('CMC20')
    expect(within(composition).getByText('Completed orders')).toBeVisible()
    expect(within(composition).getAllByText('View order')).toHaveLength(5)

    const orderLinks = within(composition).getAllByRole('link', {
      name: /View order/,
    })
    expect(orderLinks).toHaveLength(5)
    for (const link of orderLinks) {
      expect(link.getAttribute('href')).toMatch(
        /^https:\/\/explorer\.cow\.fi\/orders\/0x[0-9a-f]{112}$/
      )
    }
  })

  it('shows mixed funding as a total with a separate source breakdown', () => {
    const composition = renderComposition()

    selectState(composition, 'Existing collateral ready')

    const task = within(composition).getByTestId('automated-mint-task')
    expect(within(task).getByText('Total funding')).toBeVisible()
    expect(within(task).getByText('$10,000.00')).toBeVisible()
    expect(
      within(task).getByText('7,716.8 USDC + $2,283.20 existing collateral')
    ).toBeVisible()
    expect(within(task).queryByText('10,000 USDC')).toBeNull()
  })

  it('keeps narrow-screen orders subordinate to the transaction task', () => {
    const composition = renderComposition()

    selectState(composition, 'Existing collateral ready')

    const task = within(composition).getByLabelText('Automated mint task')
    expect(within(task).getByText('Total funding')).toBeVisible()
    expect(within(task).getByText('Mint CMC20')).toBeVisible()
    expect(within(task).getByText('Step 2 of 2')).toBeVisible()
    expect(
      within(composition).queryAllByTestId('staged-order-row')
    ).toHaveLength(0)

    fireEvent.click(
      within(composition).getByRole('button', {
        name: 'View orders',
      })
    )
    expect(within(composition).getAllByTestId('staged-order-row')).toHaveLength(
      5
    )
  })

  it('reconciles every collateral order with the funding budget', () => {
    for (const useExistingCollateral of [false, true]) {
      const orders = ordersForState(
        useExistingCollateral
          ? 'Existing collateral ready'
          : 'Input only ready',
        useExistingCollateral,
        INPUT_AMOUNT
      )
      const sold = orders.reduce((total, order) => total + order.sold.value, 0n)

      expect(orders).toHaveLength(5)
      expect(sold).toBe(
        outcomeFundingFor(INPUT_AMOUNT, useExistingCollateral).spent.value
      )
    }
  })

  it('keeps the high-level lifecycle in the left stage sections', () => {
    const composition = renderComposition()

    selectState(composition, 'Input only ready')
    expect(
      within(composition).getByText('Automatic collateral acquisition')
    ).toBeVisible()
    expect(within(composition).getByText('Mint CMC20')).toBeVisible()
    expect(
      within(composition).queryByTestId('transaction-progress-stepper')
    ).toBeNull()
    expect(
      within(composition).getByTestId('automated-mint-collateral-action-region')
    ).toHaveClass('pt-2')
    expect(
      within(
        within(composition).getByTestId(
          'automated-mint-collateral-action-region'
        )
      ).getByRole('button', {
        name: 'Start acquisition',
      })
    ).toBeVisible()
    const pendingMintAction = within(
      within(composition).getByTestId('automated-mint-mint-action-region')
    ).getByRole('button', { name: 'Waiting for collateral' })
    expect(pendingMintAction).toBeDisabled()
    expect(pendingMintAction).toHaveAttribute('data-tone', 'secondary')
    const quoteFacts = within(composition).getByTestId(
      'automated-mint-collateral-facts'
    )
    expect(quoteFacts).toHaveClass('py-4')
    expect(
      within(composition).queryByTestId(
        'automated-mint-collateral-facts-divider'
      )
    ).toBeNull()
    expect(within(quoteFacts).getByText('Estimated swap impact')).toBeVisible()
    expect(within(quoteFacts).getByText('-0.18%')).toHaveAttribute(
      'data-transaction-metric-tone',
      'neutral'
    )
    expect(within(quoteFacts).getByText('Max slippage')).toBeVisible()
    expect(within(quoteFacts).getByText('0.50%')).toBeVisible()

    selectState(composition, 'Collateral ready')

    expect(
      within(
        within(composition).getByTestId('automated-mint-mint-action-region')
      ).getByRole('button', { name: 'Mint CMC20' })
    ).toBeVisible()
    expect(
      within(composition).queryByRole('button', {
        name: 'Waiting for collateral',
      })
    ).toBeNull()
    expect(
      within(composition).queryByTestId(
        'automated-mint-collateral-action-region'
      )
    ).toBeNull()
    const filledFacts = within(composition).getByTestId(
      'automated-mint-collateral-facts'
    )
    expect(filledFacts).toHaveClass('mx-4')
    expect(filledFacts).not.toHaveClass('px-4')
    expect(
      within(composition).getByTestId('automated-mint-collateral-facts-divider')
    ).toHaveClass('mx-4', 'mt-2', 'h-px', 'bg-border')
    expect(filledFacts).toHaveClass('pb-4', 'pt-6')
    expect(within(filledFacts).getByText('Quoted swap impact')).toBeVisible()
    expect(within(filledFacts).getByText('-0.18%')).toHaveAttribute(
      'data-transaction-metric-tone',
      'superseded'
    )
    expect(within(filledFacts).getByText('-0.18%')).toHaveClass('line-through')
    expect(within(filledFacts).getByText('Actual swap impact')).toBeVisible()
    expect(within(filledFacts).getByText('-0.16%')).toHaveAttribute(
      'data-transaction-metric-tone',
      'neutral'
    )
  })

  it('presents collateral-order authorization as one wallet action', () => {
    const composition = renderComposition()

    selectState(composition, 'Authorizing orders')
    inspectOrders(composition)
    expect(
      within(composition).getByRole('button', {
        name: /Confirm collateral trades in wallet/,
      })
    ).toHaveAttribute('data-tone', 'primary')
    expect(
      within(composition).getByRole('button', {
        name: /Confirm collateral trades in wallet/,
      })
    ).toHaveAttribute('aria-busy', 'true')

    expect(
      within(composition).getByRole('button', {
        name: /Confirm collateral trades in wallet/,
      })
    ).toBeDisabled()
    expect(within(composition).getAllByText('Prepared')).toHaveLength(5)
    expect(within(composition).queryByText('Signing')).toBeNull()
    expect(within(composition).queryByText('Submitting')).toBeNull()
    expect(
      within(
        within(composition).getByTestId('automated-mint-collateral-stage')
      ).getByText('5 orders prepared')
    ).toBeVisible()
    expect(
      within(composition).queryByTestId('staged-orders-summary')
    ).toBeNull()
  })

  it('shows the available and applied value of existing collateral', () => {
    const composition = renderComposition()

    selectState(composition, 'Input only ready')
    expect(within(composition).getByText('$2,283.20 available')).toBeVisible()

    fireEvent.click(
      within(composition).getByRole('switch', { name: 'Existing collateral' })
    )
    expect(
      within(composition).getByText(/\$2,283\.20 existing collateral/)
    ).toBeVisible()
  })

  it('moves enabled wallet collateral identity into the funding amount', () => {
    const composition = renderComposition()

    selectState(composition, 'Input only ready')
    expect(
      within(
        within(composition).getByTestId('automated-mint-input-amount')
      ).getByTestId('transaction-amount-asset-identity')
    ).toHaveTextContent('USDC')

    selectState(composition, 'Existing collateral ready')
    inspectOrders(composition)

    const collateralAssets = within(composition).getByTestId(
      'automated-mint-existing-collateral-assets'
    )
    expect(collateralAssets.querySelectorAll('img')).toHaveLength(2)
    expect(
      within(composition).queryByTestId('automated-mint-applied-collateral')
    ).toBeNull()
    expect(
      within(composition).queryByText('Basket tokens in your wallet')
    ).toBeNull()
    expect(within(composition).getByText('Collateral swaps')).toBeVisible()

    fireEvent.click(
      within(composition).getByRole('button', {
        name: 'Start acquisition',
      })
    )
    expect(
      within(composition).getByTestId(
        'automated-mint-existing-collateral-assets'
      )
    ).toBeVisible()
  })

  it('keeps View DTF primary and restart separate in the header', () => {
    const composition = renderComposition()

    selectState(composition, 'Mint complete')

    const restart = within(composition).getByRole('button', {
      name: 'New mint',
    })
    expect(restart.closest('header')).not.toBeNull()
    expect(restart).toHaveAttribute('data-tone', 'secondary')
    expect(
      within(composition).getByRole('link', { name: 'View DTF' })
    ).toHaveAttribute(
      'href',
      '/base/index-dtf/0xa0a8481fc246cd12f75227abb96220ff5360fad3/overview'
    )
    expect(
      within(composition).getAllByTestId('automated-mint-view-dtf')
    ).toHaveLength(1)
  })

  it('switches the shared configuration from mint funding to redeem shares', () => {
    const composition = renderComposition()

    selectState(composition, 'Initial configuration')
    fireEvent.click(within(composition).getByRole('radio', { name: 'Redeem' }))

    expect(within(composition).getByText('Redeem amount')).toBeVisible()
    expect(
      within(composition).getByText(
        'CMC20 is redeemed and its basket assets are automatically sold for USDC.'
      )
    ).toBeVisible()
    expect(
      within(composition).getByRole('textbox', { name: 'You redeem amount' })
    ).toHaveValue('')
    expect(
      within(composition).getByText('Automatically sell collateral')
    ).toBeVisible()
    expect(
      within(composition).queryByText('Automatically acquire assets')
    ).toBeNull()
    expect(within(composition).queryByText('Mint CMC20')).toBeNull()
    expect(
      within(composition).getByTestId('automated-mint-configure-active')
    ).toBeVisible()
    expect(
      within(composition).getByRole('link', {
        name: 'Switch to manual redeeming',
      })
    ).toBeVisible()
  })

  it('keeps redeem Max and over-balance behavior aligned with mint configuration', () => {
    const composition = renderComposition()

    selectState(composition, 'Initial configuration')
    fireEvent.click(within(composition).getByRole('radio', { name: 'Redeem' }))
    fireEvent.click(within(composition).getByRole('button', { name: 'Max' }))

    expect(
      within(composition).getByRole('textbox', { name: 'You redeem amount' })
    ).toHaveValue('164.325')
    expect(within(composition).getByText('$16,432.50')).toBeVisible()

    fireEvent.change(
      within(composition).getByRole('textbox', { name: 'You redeem amount' }),
      { target: { value: '200' } }
    )
    expect(
      within(composition).getByText('Exceeds available balance')
    ).toBeVisible()
    fireEvent.click(
      within(composition).getByRole('button', { name: 'Get quote' })
    )
    selectState(composition, 'Input only ready')
    inspectOrders(composition)
    expect(
      within(composition).getByText(
        'These basket assets will be sold for your output.'
      )
    ).toBeVisible()
    expect(
      within(composition).getByRole('button', { name: 'Prepare redeem' })
    ).toBeDisabled()

    const enteredAmount = inputFixtureFromDisplay('200', 'redeem').amount
    expect(enteredAmount).toBeDefined()
    if (!enteredAmount) return

    expect(redeemOutcomeFor(enteredAmount, false).redeemed.value).toBe(
      REDEEM_INPUT_BALANCE.value
    )
    expect(redeemOutcomeFor(enteredAmount, false).received.value).toBe(
      redeemOutcomeFor(REDEEM_INPUT_BALANCE, false).received.value
    )
  })

  it('reuses the mint workspace while reversing redeem order direction and action policy', () => {
    const composition = renderComposition()

    selectState(composition, 'Initial configuration')
    fireEvent.click(within(composition).getByRole('radio', { name: 'Redeem' }))
    fireEvent.change(
      within(composition).getByRole('textbox', { name: 'You redeem amount' }),
      { target: { value: '100' } }
    )
    fireEvent.click(
      within(composition).getByRole('button', { name: 'Get quote' })
    )
    selectState(composition, 'Input only ready')

    expect(
      within(composition).getByLabelText('Automated redeem task')
    ).toBeVisible()
    expect(
      within(composition).getByTestId('automated-mint-input-amount')
    ).toHaveTextContent('CMC20')
    expect(within(composition).getByText('Sell collateral')).toBeVisible()
    expect(
      within(composition).getByTestId('automated-mint-output-amount')
    ).toHaveTextContent('USDC')
    expect(
      within(composition).getByRole('button', { name: 'Prepare redeem' })
    ).toBeVisible()
    expect(
      within(composition).queryByRole('button', {
        name: 'Waiting for collateral',
      })
    ).toBeNull()

    inspectOrders(composition)
    const firstOrder = within(composition).getAllByTestId('staged-order-row')[0]
    expect(
      within(firstOrder).getByTestId('staged-order-sell')
    ).toHaveTextContent('WBTC')
    expect(
      within(firstOrder).getByTestId('staged-order-buy')
    ).toHaveTextContent('USDC')
  })

  it('completes redeem without exposing the mint-only final action', () => {
    const composition = renderComposition()

    selectState(composition, 'Redeem complete')
    inspectOrders(composition)

    expect(
      within(
        within(composition).getByTestId('automated-mint-outcome-surface')
          .parentElement as HTMLElement
      ).getByText('Received')
    ).toBeVisible()
    expect(
      within(composition).getByTestId('transaction-amount-unit')
    ).toHaveTextContent('USDC')
    expect(within(composition).getByText('Redeemed')).toBeVisible()
    expect(
      within(composition).queryByTestId('automated-mint-final-transaction')
    ).toBeNull()
    expect(
      within(composition).getByTestId('automated-mint-view-transaction')
    ).toHaveAttribute(
      'href',
      'https://basescan.org/tx/0x7195cb5535dd308cf1c32decb8f787974ff52d9c8a13f70d2e80dad366a4ef2d'
    )
    expect(
      within(composition).queryByRole('button', { name: 'Mint CMC20' })
    ).toBeNull()
    expect(within(composition).getAllByText('View order')).toHaveLength(5)
  })

  it('preserves redeem and existing collateral across execution recovery', () => {
    const composition = renderComposition()

    selectState(composition, 'Initial configuration')
    fireEvent.click(within(composition).getByRole('radio', { name: 'Redeem' }))
    fireEvent.change(
      within(composition).getByRole('textbox', { name: 'You redeem amount' }),
      { target: { value: '100' } }
    )
    fireEvent.click(
      within(composition).getByRole('button', { name: 'Get quote' })
    )
    selectState(composition, 'Existing collateral ready')
    inspectOrders(composition)

    expect(
      within(composition).getByText(/\$2,283\.20 existing collateral/)
    ).toBeVisible()
    expect(
      within(composition).getByTestId('automated-mint-input-amount')
    ).toHaveTextContent('100CMC20')
    expect(
      within(composition).queryByTestId(
        'automated-mint-existing-collateral-assets'
      )
    ).toBeNull()
    expect(within(composition).getByText(/4,416\.4 USDC/)).toBeVisible()

    selectState(composition, 'Recoverable failure')
    expect(
      within(composition).getByLabelText('Automated redeem task')
    ).toBeVisible()
    expect(within(composition).getAllByText('Filled')).toHaveLength(4)
    fireEvent.click(
      within(composition).getByRole('button', { name: 'Retry 1 failed order' })
    )
    expect(
      within(composition).getByText(/\$2,283\.20 existing collateral/)
    ).toBeVisible()
    expect(
      within(composition).getByTestId('automated-mint-input-amount')
    ).toHaveTextContent('CMC20')
  })

  it('supports redeeming held collateral without requiring DTF shares', () => {
    const composition = renderComposition()

    selectState(composition, 'Existing collateral only')
    inspectOrders(composition)

    expect(
      within(composition).getByLabelText('Automated redeem task')
    ).toBeVisible()
    expect(
      within(composition).getByTestId('automated-mint-input-amount')
    ).toHaveTextContent('Existing collateral$2,283.20')
    expect(
      within(composition).getByText(
        'Using basket assets only; no CMC20 will be redeemed.'
      )
    ).toBeVisible()
    expect(within(composition).getAllByTestId('staged-order-row')).toHaveLength(
      2
    )
    expect(
      within(composition).getByRole('button', { name: 'Prepare redeem' })
    ).toBeEnabled()

    fireEvent.click(
      within(composition).getByRole('button', { name: 'Prepare redeem' })
    )
    expect(
      within(composition).getByTestId('automated-mint-input-amount')
    ).toHaveTextContent('Existing collateral$2,283.20')
    expect(within(composition).getAllByTestId('staged-order-row')).toHaveLength(
      2
    )

    selectState(composition, 'Recoverable failure')
    expect(
      within(composition).getByTestId('automated-mint-input-amount')
    ).toHaveTextContent('Existing collateral$2,283.20')
    expect(within(composition).getAllByTestId('staged-order-row')).toHaveLength(
      2
    )

    selectState(composition, 'Redeem complete')
    expect(within(composition).queryByText('Redeemed')).toBeNull()
    expect(within(composition).queryByText('0 CMC20')).toBeNull()
    expect(within(composition).getByText('Source')).toBeVisible()
    expect(within(composition).getByText('Existing collateral')).toBeVisible()
    expect(
      within(composition).getByText('Collateral swap price impact')
    ).toBeVisible()
    expect(within(composition).getByText('-0.16%')).toBeVisible()
    expect(within(composition).getAllByTestId('staged-order-row')).toHaveLength(
      2
    )
  })

  it('returns collateral-only redeem to an unfunded configuration when its collateral is removed', () => {
    const composition = renderComposition()

    selectState(composition, 'Existing collateral only')
    fireEvent.click(
      within(composition).getByRole('button', { name: 'Edit amount' })
    )

    expect(
      within(composition).getByTestId('automated-issuance-configure-amount')
    ).not.toHaveTextContent('Enter an amount to fetch quotes')
    expect(
      within(composition).getByRole('button', { name: 'Enter amount' })
    ).toBeDisabled()

    selectState(composition, 'Existing collateral only')
    fireEvent.click(
      within(composition).getByRole('switch', { name: 'Existing collateral' })
    )

    expect(
      within(composition).getByTestId('automated-issuance-configure-amount')
    ).not.toHaveTextContent('Enter an amount to fetch quotes')
    expect(
      within(composition).getByRole('button', { name: 'Enter amount' })
    ).toBeDisabled()
  })

  it('keeps direct ready-state review deterministic after collateral-only redeem', () => {
    const composition = renderComposition()

    selectState(composition, 'Existing collateral only')
    selectState(composition, 'Input only ready')

    expect(
      within(composition).getByTestId('automated-mint-input-amount')
    ).toHaveTextContent('100')
    expect(
      within(composition).getByRole('button', { name: 'Prepare redeem' })
    ).toBeEnabled()
    expect(
      within(composition).getByRole('switch', { name: 'Existing collateral' })
    ).not.toBeChecked()
  })

  it('uses operation-specific validation language in the shared amount parser', () => {
    expect(inputFixtureFromDisplay('invalid', 'mint').usdDisplay).toBe(
      'Enter a valid USDC amount'
    )
    expect(inputFixtureFromDisplay('invalid', 'redeem').usdDisplay).toBe(
      'Enter a valid CMC20 amount'
    )
  })

  it('reconciles redeem order proceeds with the received outcome', () => {
    for (const useExistingCollateral of [false, true]) {
      const orders = ordersForState(
        'Redeem complete',
        useExistingCollateral,
        REDEEM_INPUT_AMOUNT,
        'redeem'
      )
      const bought = orders.reduce(
        (total, order) => total + order.bought.value,
        0n
      )

      expect(orders).toHaveLength(5)
      expect(bought).toBe(
        redeemOutcomeFor(REDEEM_INPUT_AMOUNT, useExistingCollateral).received
          .value
      )
    }
  })
})
