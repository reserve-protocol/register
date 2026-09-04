import { Trans } from '@lingui/react/macro'
import { useState } from 'react'

import { Button } from '@/components/button'
import { ActionGroup } from '@/components/design-system-v1/action-group'
import { OrganicBrandSurface } from '@/components/design-system-v1/organic-brand-surface'
import { candidateSemanticRoles as semanticRoles } from '@/components/design-system-v1/semantic-roles'
import { TransactionAmountObject } from '@/components/design-system-v1/transaction-amount-object'
import { v1Typography } from '@/components/design-system-v1/typography'
import { v1SemanticRecipes as roles } from '@/components/ui/v1-semantic-recipes'
import { useIsDesktop } from '@/hooks/use-media-query'
import { cn } from '@/lib/utils'
import { getFolioRoute } from '@/utils'
import { CMC20_ADDRESS } from '@/utils/addresses'
import { ROUTES } from '@/utils/constants'

import type {
  AutomatedIssuanceChain,
  AutomatedIssuanceOperation,
  AutomatedMintInputFixture,
  AutomatedMintReviewState,
} from './transaction-composition-staged-fixtures'
import {
  AUTOMATED_MINT_ACTUAL_PRICE_IMPACT,
  DUST_USD_VALUE,
  formatFixtureAmount,
  formatUsdFixture,
  INPUT_AMOUNT,
  MINTED_AMOUNT,
  normalizeInputForFixtures,
  outcomeFundingFor,
  OUTPUT_USD_VALUE,
  REDEEM_DUST_USD_VALUE,
  REDEEM_INPUT_AMOUNT,
  redeemOutcomeFor,
  scaleFixtureAmount,
  scaleFixtureValue,
} from './transaction-composition-staged-fixtures'
import { AutomatedMintOrdersPanel } from './transaction-composition-staged-orders'
import { AutomatedMintIdentity } from './transaction-composition-staged-support'
import { AutomatedMintTask } from './transaction-composition-staged-task'
import { TransactionOutcomeDetailRow } from './transaction-outcome-detail-row'
import { TransactionOutcomeStatus } from './transaction-outcome-status'
import { transactionOutcomeMotion } from './transaction-outcome-motion'

export const AutomatedMintWorkspace = ({
  chain,
  hasCollateralSwaps,
  input,
  onUseExistingCollateralChange,
  operation,
  setState,
  state,
  useExistingCollateral,
}: {
  chain: AutomatedIssuanceChain
  hasCollateralSwaps: boolean
  input: AutomatedMintInputFixture
  onUseExistingCollateralChange: (checked: boolean) => void
  operation: AutomatedIssuanceOperation
  setState: (state: AutomatedMintReviewState) => void
  state: AutomatedMintReviewState
  useExistingCollateral: boolean
}) => {
  const isDesktop = useIsDesktop()
  const [ordersExpanded, setOrdersExpanded] = useState(false)
  const showOrders =
    state !== 'No swaps needed' && (isDesktop || ordersExpanded)

  return (
    <div
      data-testid="automated-mint-workspace"
      className="w-full bg-secondary lg:h-[43rem]"
    >
      <div
        data-testid="automated-mint-workspace-sections"
        className="grid h-full gap-0.5 max-lg:mx-auto max-lg:max-w-[640px] lg:grid-cols-2"
      >
        {state === 'Mint complete' || state === 'Redeem complete' ? (
          <AutomatedMintOutcome
            chain={chain}
            hasCollateralSwaps={hasCollateralSwaps}
            input={input}
            operation={operation}
            useExistingCollateral={useExistingCollateral}
          />
        ) : (
          <AutomatedMintTask
            chain={chain}
            input={input}
            onUseExistingCollateralChange={onUseExistingCollateralChange}
            operation={operation}
            state={state}
            setState={setState}
            useExistingCollateral={useExistingCollateral}
          />
        )}
        <div
          data-testid="automated-mint-orders-column"
          className={cn(
            'min-w-0 lg:flex lg:h-full lg:min-h-0 lg:flex-col lg:overflow-hidden',
            semanticRoles.surface.recessedContent
          )}
        >
          {state !== 'No swaps needed' && (
            <div className="p-2 lg:hidden">
              <Button
                data-testid="automated-issuance-orders-toggle"
                className="w-full"
                size="compact"
                tone="secondary"
                onClick={() => setOrdersExpanded((expanded) => !expanded)}
              >
                {ordersExpanded ? (
                  <Trans>Hide orders</Trans>
                ) : (
                  <Trans>View orders</Trans>
                )}
              </Button>
            </div>
          )}
          {showOrders && (
            <AutomatedMintOrdersPanel
              chain={chain}
              inputAmount={input.amount ?? INPUT_AMOUNT}
              operation={operation}
              state={state}
              useExistingCollateral={useExistingCollateral}
            />
          )}
        </div>
      </div>
    </div>
  )
}

const AutomatedMintOutcome = ({
  chain,
  hasCollateralSwaps,
  input,
  operation,
  useExistingCollateral,
}: {
  chain: AutomatedIssuanceChain
  hasCollateralSwaps: boolean
  input: AutomatedMintInputFixture
  operation: AutomatedIssuanceOperation
  useExistingCollateral: boolean
}) => {
  const isMint = operation === 'mint'
  const inputAmount =
    input.amount ?? (isMint ? INPUT_AMOUNT : REDEEM_INPUT_AMOUNT)
  const normalizedInput = normalizeInputForFixtures(
    inputAmount,
    operation,
    chain
  )
  const mintedAmount = scaleFixtureAmount(MINTED_AMOUNT, normalizedInput)
  const redeemOutcome = redeemOutcomeFor(
    inputAmount,
    useExistingCollateral,
    chain
  )
  const mintFunding = isMint
    ? outcomeFundingFor(inputAmount, useExistingCollateral, chain)
    : undefined
  const isCollateralOnlyRedeem = !isMint && redeemOutcome.redeemed.value === 0n

  return (
    <section
      data-testid="automated-mint-outcome"
      className="flex h-full min-w-0 flex-col bg-card"
    >
      <div className="relative isolate overflow-hidden text-brand-foreground">
        <OrganicBrandSurface
          data-testid="automated-mint-outcome-surface"
          className={cn('absolute inset-0', transactionOutcomeMotion.surface)}
        />
        <header
          className={cn(
            'relative z-10 flex items-center px-4 pb-4 pt-4',
            transactionOutcomeMotion.content
          )}
        >
          <TransactionOutcomeStatus />
        </header>
        <TransactionAmountObject
          label="Received"
          amount={formatFixtureAmount(
            isMint ? mintedAmount : redeemOutcome.received,
            2
          ).replace(isMint ? ' CMC20' : ' USDC', '')}
          readOnly
          presentation="output"
          tone="inverse"
          className={cn(
            'relative z-10 bg-transparent px-6 pb-6',
            transactionOutcomeMotion.content
          )}
          unit={isMint ? 'CMC20' : 'USDC'}
          supporting={
            isMint
              ? formatUsdFixture(
                  scaleFixtureValue(OUTPUT_USD_VALUE, normalizedInput)
                )
              : formatUsdFixture(
                  redeemOutcome.received.value *
                    10n ** BigInt(18 - redeemOutcome.received.decimals)
                )
          }
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col p-4 sm:p-6">
        <div className="space-y-5">
          <dl data-testid="automated-mint-outcome-facts" className="grid gap-2">
            {isMint ? (
              <>
                <TransactionOutcomeDetailRow
                  label={<Trans>Input amount</Trans>}
                  value={formatFixtureAmount(inputAmount, 6)}
                />
                <TransactionOutcomeDetailRow
                  label={<Trans>Spent</Trans>}
                  value={formatFixtureAmount(mintFunding!.spent, 6)}
                />
              </>
            ) : (
              <>
                {isCollateralOnlyRedeem ? (
                  <TransactionOutcomeDetailRow
                    label={<Trans>Source</Trans>}
                    value={<Trans>Existing collateral</Trans>}
                  />
                ) : (
                  <TransactionOutcomeDetailRow
                    label={<Trans>Redeemed</Trans>}
                    value={formatFixtureAmount(redeemOutcome.redeemed, 6)}
                  />
                )}
                <TransactionOutcomeDetailRow
                  label={<Trans>Received</Trans>}
                  value={formatFixtureAmount(redeemOutcome.received, 6)}
                />
              </>
            )}
            {hasCollateralSwaps && (
              <TransactionOutcomeDetailRow
                label={<Trans>Collateral swap price impact</Trans>}
                value={AUTOMATED_MINT_ACTUAL_PRICE_IMPACT}
              />
            )}
            {isMint && useExistingCollateral && (
              <TransactionOutcomeDetailRow
                label={<Trans>Existing collateral</Trans>}
                value={formatUsdFixture(
                  mintFunding!.collateral.value * 10n ** 12n
                )}
              />
            )}
            {isMint && (
              <TransactionOutcomeDetailRow
                label={<Trans>Unused (returned)</Trans>}
                value={formatFixtureAmount(mintFunding!.unused, 6)}
              />
            )}
            <AutomatedMintIdentity chain={chain} operation={operation} />
          </dl>
          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <p className={v1Typography.label}>
                <Trans>Leftover dust</Trans>
              </p>
              <p className={cn(v1Typography.label, 'tabular-nums')}>
                {formatUsdFixture(
                  isMint
                    ? scaleFixtureValue(DUST_USD_VALUE, normalizedInput)
                    : REDEEM_DUST_USD_VALUE
                )}{' '}
                · 3 assets
              </p>
            </div>
            <p className={cn(v1Typography.supporting, roles.text.supporting)}>
              <Trans>Swaps leave a small residue in your wallet.</Trans>
            </p>
            <p
              className={cn(
                'mt-2 tabular-nums',
                v1Typography.supporting,
                roles.text.supporting
              )}
            >
              0.00000012 WBTC · 0.00008 WETH · 0.01 USDC
            </p>
          </div>
        </div>
        <ActionGroup className="mt-auto w-full justify-end pt-5">
          <Button data-testid="automated-mint-view-dtf" size="compact" asChild>
            <a
              href={getFolioRoute(CMC20_ADDRESS[chain], chain, ROUTES.OVERVIEW)}
            >
              <Trans>View DTF</Trans>
            </a>
          </Button>
        </ActionGroup>
      </div>
    </section>
  )
}
