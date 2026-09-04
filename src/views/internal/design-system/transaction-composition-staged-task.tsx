import { Trans, useLingui } from '@lingui/react/macro'
import { ArrowDown } from 'lucide-react'

import { Button, InlineAction } from '@/components/button'
import {
  InlineMessage,
  InlineMessageDescription,
  InlineMessageTitle,
} from '@/components/design-system-v1/inline-message'
import { Switch } from '@/components/design-system-v1/switch'
import { TransactionAmountObject } from '@/components/design-system-v1/transaction-amount-object'
import { v1Typography } from '@/components/design-system-v1/typography'
import { TokenLogoStack } from '@/components/entity-identity'
import { Skeleton } from '@/components/design-system-v1/loading'
import { v1SemanticRecipes as roles } from '@/components/ui/v1-semantic-recipes'
import { cn } from '@/lib/utils'

import { AutomatedMintActions } from './transaction-composition-staged-actions'
import {
  type AutomatedIssuanceChain,
  type AutomatedIssuanceOperation,
  type AutomatedMintInputFixture,
  type AutomatedMintReviewState,
  AUTOMATED_MINT_ACTUAL_PRICE_IMPACT,
  AUTOMATED_MINT_MAX_SLIPPAGE,
  AUTOMATED_MINT_QUOTED_PRICE_IMPACT,
  EXISTING_COLLATERAL,
  EXISTING_COLLATERAL_INPUT_EQUIVALENT,
  formatFixtureAmount,
  formatUsdFixture,
  INPUT_AMOUNT,
  MINTED_AMOUNT,
  normalizeInputForFixtures,
  ordersForState,
  outcomeFundingFor,
  OUTPUT_USD_VALUE,
  REDEEM_INPUT_AMOUNT,
  redeemOutcomeFor,
  scaleFixtureAmount,
  scaleFixtureValue,
} from './transaction-composition-staged-fixtures'
import {
  TransactionAmountAsset,
  TransactionAssetLogo,
} from './transaction-system-assets'
import { TransactionMetricValue } from './transaction-metric-value'

type AutomatedMintTaskProps = {
  chain: AutomatedIssuanceChain
  input: AutomatedMintInputFixture
  onUseExistingCollateralChange: (checked: boolean) => void
  operation: AutomatedIssuanceOperation
  setState: (state: AutomatedMintReviewState) => void
  state: AutomatedMintReviewState
  useExistingCollateral: boolean
}

const PROCESS_STATES: readonly AutomatedMintReviewState[] = [
  'Authorizing orders',
  'Orders filling',
  'Recoverable failure',
  'Collateral ready',
  'Final mint signing',
  'Cancelled order',
  'Transaction failed',
]

const EDITABLE_QUOTE_STATES: readonly AutomatedMintReviewState[] = [
  'Quote searching',
  'Quote paused',
  'Quote unavailable',
  'Input only ready',
  'Existing collateral ready',
  'Existing collateral only',
  'Price unavailable',
  'Per-order quote failure',
  'Split order quotes',
  'No swaps needed',
  'Wallet unavailable',
]

export const AutomatedMintTask = ({
  chain,
  input,
  onUseExistingCollateralChange,
  operation,
  setState,
  state,
  useExistingCollateral,
}: AutomatedMintTaskProps) => {
  const quoteReady =
    state === 'Input only ready' ||
    state === 'Existing collateral ready' ||
    state === 'Existing collateral only' ||
    state === 'Price unavailable' ||
    state === 'Per-order quote failure' ||
    state === 'Split order quotes' ||
    state === 'No swaps needed' ||
    state === 'Wallet unavailable'
  const isMint = operation === 'mint'
  const canEditAmount = EDITABLE_QUOTE_STATES.includes(state)
  const isMintStage =
    state === 'Collateral ready' ||
    state === 'Final mint signing' ||
    state === 'No swaps needed'
  const taskInputAmount =
    input.amount ?? (isMint ? INPUT_AMOUNT : REDEEM_INPUT_AMOUNT)
  const availableCollateralValue = formatUsdFixture(
    EXISTING_COLLATERAL_INPUT_EQUIVALENT.value * 10n ** 12n
  )
  const appliedFunding = isMint
    ? outcomeFundingFor(taskInputAmount, true, chain)
    : undefined
  const appliedCollateralValue = appliedFunding
    ? formatUsdFixture(
        appliedFunding.collateral.value *
          10n ** BigInt(18 - appliedFunding.collateral.decimals)
      )
    : availableCollateralValue
  const existingCollateralValue = useExistingCollateral
    ? appliedCollateralValue
    : availableCollateralValue

  return (
    <section
      data-testid="automated-mint-task"
      aria-label={isMint ? 'Automated mint task' : 'Automated redeem task'}
      className="flex h-full min-w-0 flex-col bg-card"
    >
      <div
        data-testid="automated-mint-task-card"
        className="relative z-10 flex min-h-0 flex-1 flex-col bg-card"
      >
        <div
          data-testid="automated-mint-amount-sequence"
          className="flex min-h-0 flex-1 flex-col"
        >
          <div
            data-testid="automated-mint-funding-stage"
            className="bg-card p-2"
          >
            <AutomatedMintInputAmount
              chain={chain}
              canEdit={canEditAmount}
              input={input}
              operation={operation}
              onEdit={() => setState('Initial configuration')}
              priceUnavailable={state === 'Price unavailable'}
              useExistingCollateral={useExistingCollateral}
            />
            {quoteReady && (
              <>
                <div
                  aria-hidden="true"
                  data-testid="automated-mint-existing-collateral-divider"
                  className="mx-4 mt-2 h-px bg-border"
                />
                <label
                  data-testid="automated-mint-existing-collateral"
                  className="mx-4 grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 pb-4 pt-6"
                >
                  <span className={cn('min-w-0', v1Typography.label)}>
                    <Trans>Use existing collateral</Trans>
                  </span>
                  <span
                    className={cn(
                      'whitespace-nowrap text-right tabular-nums',
                      v1Typography.supporting,
                      roles.text.supporting
                    )}
                  >
                    {useExistingCollateral ? (
                      <Trans>{existingCollateralValue} applied</Trans>
                    ) : (
                      <Trans>{existingCollateralValue} available</Trans>
                    )}
                  </span>
                  <Switch
                    aria-label="Existing collateral"
                    checked={useExistingCollateral}
                    onCheckedChange={(checked) => {
                      onUseExistingCollateralChange(checked)
                      setState(
                        checked
                          ? 'Existing collateral ready'
                          : input.amount?.value === 0n
                            ? 'Initial configuration'
                            : 'Input only ready'
                      )
                    }}
                  />
                </label>
              </>
            )}
          </div>
          <AutomatedMintAmountBoundary />
          <section
            aria-current={!isMintStage ? 'step' : undefined}
            className="bg-card p-2"
            data-stage-state={isMintStage ? 'complete' : 'current'}
            data-testid="automated-mint-collateral-step"
          >
            <AutomatedMintCollateralStage
              chain={chain}
              input={input}
              operation={operation}
              state={state}
              useExistingCollateral={useExistingCollateral}
            />
            {!isMintStage && (
              <div
                data-testid="automated-mint-collateral-action-region"
                className="space-y-2 pt-2"
              >
                <AutomatedMintNotice
                  exceedsBalance={input.exceedsBalance}
                  state={state}
                />
                <AutomatedMintActions
                  canStart={
                    Boolean(input.amount?.value) || useExistingCollateral
                  }
                  exceedsBalance={input.exceedsBalance}
                  operation={operation}
                  state={state}
                  setState={setState}
                />
              </div>
            )}
            <AutomatedMintCollateralFacts state={state} />
          </section>
          <AutomatedMintAmountBoundary />
          <section
            aria-current={isMintStage ? 'step' : undefined}
            className="bg-card p-2"
            data-stage-state={isMintStage ? 'current' : 'upcoming'}
            data-testid="automated-mint-mint-step"
          >
            <AutomatedMintOutputAmount
              chain={chain}
              input={input}
              operation={operation}
              state={state}
              useExistingCollateral={useExistingCollateral}
            />
            {isMint && (
              <div
                data-testid="automated-mint-mint-action-region"
                className="pt-2"
              >
                {isMintStage ? (
                  <AutomatedMintActions
                    exceedsBalance={input.exceedsBalance}
                    operation={operation}
                    state={state}
                    setState={setState}
                  />
                ) : (
                  <Button className="w-full" tone="secondary" disabled>
                    <Trans>Waiting for collateral</Trans>
                  </Button>
                )}
              </div>
            )}
          </section>
          <div
            aria-hidden="true"
            className="min-h-0 flex-1"
            data-testid="automated-mint-flexible-space"
          />
        </div>
      </div>
    </section>
  )
}

const AutomatedMintCollateralStage = ({
  chain,
  input,
  operation,
  state,
  useExistingCollateral,
}: {
  chain: AutomatedIssuanceChain
  input: AutomatedMintInputFixture
  operation: AutomatedIssuanceOperation
  state: AutomatedMintReviewState
  useExistingCollateral: boolean
}) => {
  const { t } = useLingui()
  const orders = ordersForState(
    state,
    useExistingCollateral,
    input.amount ?? (operation === 'mint' ? INPUT_AMOUNT : REDEEM_INPUT_AMOUNT),
    operation,
    chain
  )
  const filledCount = orders.filter((order) => order.status === 'Filled').length
  const quotePending = state === 'Quote searching'
  const quotePaused = state === 'Quote paused'
  const quoteUnavailable = state === 'Quote unavailable'
  const execution = PROCESS_STATES.includes(state)
  const showsFillProgress =
    execution && state !== 'Authorizing orders' && orders.length > 0
  const supporting =
    state === 'No swaps needed' ? (
      <Trans>No swaps needed</Trans>
    ) : quotePending ? (
      <Trans>Fetching quotes...</Trans>
    ) : quotePaused ? (
      <Trans>Quote search paused</Trans>
    ) : quoteUnavailable ? (
      <Trans>Quote unavailable</Trans>
    ) : state === 'Authorizing orders' ? (
      <Trans>{orders.length} orders prepared</Trans>
    ) : state === 'Orders filling' ? (
      <Trans>1 order open · expires in 1m 42s</Trans>
    ) : state === 'Recoverable failure' ? (
      <Trans>1 order needs retry</Trans>
    ) : state === 'Cancelled order' ? (
      <Trans>1 order cancelled</Trans>
    ) : execution ? (
      <Trans>Orders filled</Trans>
    ) : (
      <Trans>{orders.length} swaps prepared</Trans>
    )

  return (
    <TransactionAmountObject
      data-testid="automated-mint-collateral-stage"
      label={
        state === 'No swaps needed'
          ? t`Collateral ready`
          : operation === 'mint'
            ? execution
              ? t`Acquire collateral`
              : t`Automatic collateral acquisition`
            : t`Sell collateral`
      }
      amount={
        state === 'No swaps needed'
          ? '—'
          : showsFillProgress
            ? `${filledCount}/${orders.length}`
            : orders.length.toString()
      }
      readOnly
      presentation="output"
      asset={
        <span
          aria-hidden="true"
          data-testid="automated-mint-collateral-assets"
          className="flex -space-x-2"
        >
          {orders.map((order, index) => (
            <TransactionAssetLogo
              key={`${order.asset}-${index}`}
              chain={chain}
              className="ring-2 ring-card"
              size="lg"
              symbol={
                operation === 'mint' ? order.bought.symbol : order.sold.symbol
              }
            />
          ))}
        </span>
      }
      supporting={
        <span className="inline-flex min-w-0 items-baseline gap-1.5">
          <span className="shrink-0">
            {operation === 'mint' ? (
              <Trans>Step 1 of 2</Trans>
            ) : (
              <Trans>Step 1 of 1</Trans>
            )}
          </span>
          <span aria-hidden="true">·</span>
          <span className="min-w-0 whitespace-normal">
            {supporting}
          </span>
        </span>
      }
    />
  )
}

const AutomatedMintAmountBoundary = () => (
  <div
    aria-hidden="true"
    data-testid="automated-mint-amount-boundary"
    className="relative z-10 h-0.5 bg-secondary"
  >
    <span
      data-testid="automated-mint-amount-boundary-indicator"
      className="absolute left-1/2 top-1/2 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-secondary"
    >
      <span
        data-testid="automated-mint-amount-boundary-indicator-core"
        className="flex size-8 items-center justify-center rounded-full bg-card text-muted-foreground"
      >
        <ArrowDown className="size-4" strokeWidth={1.5} />
      </span>
    </span>
  </div>
)

const AutomatedMintCollateralFacts = ({
  state,
}: {
  state: AutomatedMintReviewState
}) => {
  if (state === 'No swaps needed') return null

  const isQuotePending = state === 'Quote searching'
  const isQuoteUnavailable =
    state === 'Quote paused' || state === 'Quote unavailable'
  const hasFilledOrders =
    state === 'Collateral ready' || state === 'Final mint signing'

  return (
    <>
      {hasFilledOrders && (
        <div
          aria-hidden="true"
          data-testid="automated-mint-collateral-facts-divider"
          className="mx-4 mt-2 h-px bg-border"
        />
      )}
      <dl
        data-testid="automated-mint-collateral-facts"
        className={cn(
          'mx-4 grid grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)] items-center gap-4',
          hasFilledOrders ? 'pb-4 pt-6' : 'py-4'
        )}
      >
        <div className="flex min-w-0 flex-col items-start gap-0.5">
          <dt className={cn(v1Typography.supporting, roles.text.supporting)}>
            {hasFilledOrders ? (
              <Trans>Quoted swap impact</Trans>
            ) : (
              <Trans>Estimated swap impact</Trans>
            )}
          </dt>
          <dd className={cn(v1Typography.label, 'shrink-0 tabular-nums')}>
            {isQuotePending ? (
              <Skeleton className="h-4 w-12" />
            ) : isQuoteUnavailable ? (
              '—'
            ) : (
              <TransactionMetricValue
                tone={hasFilledOrders ? 'superseded' : 'neutral'}
              >
                {AUTOMATED_MINT_QUOTED_PRICE_IMPACT}
              </TransactionMetricValue>
            )}
          </dd>
        </div>
        <div aria-hidden="true" className="self-stretch bg-border" />
        <div className="flex min-w-0 flex-col items-end gap-0.5 text-right">
          <dt className={cn(v1Typography.supporting, roles.text.supporting)}>
            {hasFilledOrders ? (
              <Trans>Actual swap impact</Trans>
            ) : (
              <Trans>Max slippage</Trans>
            )}
          </dt>
          <dd className={cn(v1Typography.label, 'shrink-0 tabular-nums')}>
            <TransactionMetricValue tone="neutral">
              {hasFilledOrders
                ? AUTOMATED_MINT_ACTUAL_PRICE_IMPACT
                : AUTOMATED_MINT_MAX_SLIPPAGE}
            </TransactionMetricValue>
          </dd>
        </div>
      </dl>
    </>
  )
}

const AutomatedMintInputAmount = ({
  chain,
  canEdit,
  input,
  onEdit,
  operation,
  priceUnavailable,
  useExistingCollateral,
}: {
  chain: AutomatedIssuanceChain
  canEdit: boolean
  input: AutomatedMintInputFixture
  onEdit: () => void
  operation: AutomatedIssuanceOperation
  priceUnavailable: boolean
  useExistingCollateral: boolean
}) => {
  const isMint = operation === 'mint'
  const inputAmount =
    input.amount ?? (isMint ? INPUT_AMOUNT : REDEEM_INPUT_AMOUNT)
  const collateral = isMint
    ? outcomeFundingFor(inputAmount, useExistingCollateral, chain).collateral
    : { ...EXISTING_COLLATERAL_INPUT_EQUIVALENT, value: 0n }
  const walletFunding = {
    ...inputAmount,
    value:
      inputAmount.value > collateral.value
        ? inputAmount.value - collateral.value
        : 0n,
  }
  const collateralOnlyRedeem =
    !isMint && useExistingCollateral && inputAmount.value === 0n
  const fundingDetail = useExistingCollateral ? (
    isMint ? (
      <Trans>
        {formatFixtureAmount(walletFunding, 2)} +{' '}
        {formatUsdFixture(
          collateral.value * 10n ** BigInt(18 - collateral.decimals)
        )}{' '}
        existing collateral
      </Trans>
    ) : (
      <Trans>
        {input.usdDisplay} ·{' '}
        {formatUsdFixture(
          EXISTING_COLLATERAL_INPUT_EQUIVALENT.value * 10n ** 12n
        )}{' '}
        existing collateral
      </Trans>
    )
  ) : priceUnavailable ? (
    <Trans>Price unavailable</Trans>
  ) : (
    input.usdDisplay
  )

  return (
    <TransactionAmountObject
      data-testid="automated-mint-input-amount"
      label={
        collateralOnlyRedeem
          ? 'Existing collateral'
          : isMint
            ? useExistingCollateral
              ? 'Total funding'
              : 'You provide'
            : 'You redeem'
      }
      amount={
        collateralOnlyRedeem
          ? formatUsdFixture(
              EXISTING_COLLATERAL_INPUT_EQUIVALENT.value * 10n ** 12n
            )
          : isMint && useExistingCollateral
            ? input.usdDisplay
            : input.display
      }
      readOnly
      presentation="input"
      asset={
        (isMint && useExistingCollateral) || collateralOnlyRedeem ? (
          <span
            data-testid="automated-mint-existing-collateral-assets"
            className="inline-flex items-center"
          >
            <TokenLogoStack
              size={24}
              tokens={EXISTING_COLLATERAL.map(({ amount }) => ({
                chain,
                name: amount.symbol,
                symbol: amount.symbol,
              }))}
            />
          </span>
        ) : (
          <TransactionAmountAsset
            chain={chain}
            symbol={isMint ? inputAmount.symbol : 'CMC20'}
          />
        )
      }
      supporting={
        <span className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="min-w-0 whitespace-normal">
            {collateralOnlyRedeem ? (
              <Trans>
                Using basket assets only; no CMC20 will be redeemed.
              </Trans>
            ) : (
              fundingDetail
            )}
          </span>
          {canEdit && (
            <InlineAction onClick={onEdit}>
              <Trans>Edit amount</Trans>
            </InlineAction>
          )}
        </span>
      }
    />
  )
}

const AutomatedMintOutputAmount = ({
  chain,
  input,
  operation,
  state,
  useExistingCollateral,
}: {
  chain: AutomatedIssuanceChain
  input: AutomatedMintInputFixture
  operation: AutomatedIssuanceOperation
  state: AutomatedMintReviewState
  useExistingCollateral: boolean
}) => {
  const { t } = useLingui()
  const isMint = operation === 'mint'
  const outputPending =
    state === 'Quote searching' ||
    state === 'Quote paused' ||
    state === 'Quote unavailable' ||
    state === 'Per-order quote failure'
  const outputFinal =
    state === 'Collateral ready' || state === 'Final mint signing'
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
  const outputValue = isMint
    ? formatUsdFixture(scaleFixtureValue(OUTPUT_USD_VALUE, normalizedInput))
    : formatUsdFixture(
        redeemOutcome.received.value *
          10n ** BigInt(18 - redeemOutcome.received.decimals)
      )
  const supporting = outputPending ? (
    <Trans>Fetching quotes...</Trans>
  ) : state === 'Collateral ready' ? (
    <Trans>≈{outputValue} · Ready to mint</Trans>
  ) : state === 'Final mint signing' ? (
    <Trans>≈{outputValue} · Completing mint...</Trans>
  ) : !isMint && state === 'Authorizing orders' ? (
    <Trans>Estimated output · Confirm redeem in your wallet</Trans>
  ) : !isMint && state === 'Orders filling' ? (
    <Trans>Estimated output · Collateral sales in progress</Trans>
  ) : !isMint && state === 'Recoverable failure' ? (
    <Trans>Estimated output · One order needs retry</Trans>
  ) : (
    <Trans>Estimated output · ≈{outputValue} · Upcoming</Trans>
  )

  const outputAmount = isMint ? mintedAmount : redeemOutcome.received
  const outputSymbol = isMint ? 'CMC20' : redeemOutcome.received.symbol

  return (
    <TransactionAmountObject
      data-testid="automated-mint-output-amount"
      label={
        isMint
          ? t`Mint CMC20`
          : outputSymbol === 'USDT'
            ? t`Receive USDT`
            : t`Receive USDC`
      }
      amount={
        outputPending
          ? '—'
          : `${outputFinal && isMint ? '' : '≈'}${formatFixtureAmount(
              outputAmount,
              2
            ).replace(` ${outputSymbol}`, '')}`
      }
      readOnly
      presentation="output"
      asset={<TransactionAmountAsset chain={chain} symbol={outputSymbol} />}
      supporting={
        <span className="inline-flex min-w-0 items-baseline gap-1.5">
          {isMint && (
            <>
              <span className="shrink-0">
                <Trans>Step 2 of 2</Trans>
              </span>
              <span aria-hidden="true">·</span>
            </>
          )}
          <span className="min-w-0 whitespace-normal sm:truncate">
            {supporting}
          </span>
        </span>
      }
    />
  )
}

const AutomatedMintNotice = ({
  exceedsBalance,
  state,
}: {
  exceedsBalance?: boolean
  state: AutomatedMintReviewState
}) => {
  if (
    exceedsBalance &&
    (state === 'Input only ready' ||
      state === 'Existing collateral ready' ||
      state === 'Existing collateral only')
  ) {
    return (
      <InlineMessage tone="danger">
        <InlineMessageTitle>
          <Trans>Exceeds available balance</Trans>
        </InlineMessageTitle>
      </InlineMessage>
    )
  }
  if (state === 'Quote paused') {
    return (
      <InlineMessage tone="warning" presentation="summary">
        <InlineMessageTitle>
          <Trans>Quote paused · Amount saved</Trans>
        </InlineMessageTitle>
      </InlineMessage>
    )
  }
  if (state === 'Quote unavailable') {
    return (
      <InlineMessage tone="danger">
        <InlineMessageTitle>
          <Trans>The swap quote is unavailable</Trans>
        </InlineMessageTitle>
        <InlineMessageDescription className="mt-1">
          <Trans>The amount may be too small to cover fees.</Trans>
        </InlineMessageDescription>
      </InlineMessage>
    )
  }
  if (state === 'Per-order quote failure') {
    return (
      <InlineMessage tone="danger" presentation="summary">
        <InlineMessageTitle>
          <Trans>Some quotes couldn't be fetched.</Trans>
        </InlineMessageTitle>
      </InlineMessage>
    )
  }
  if (state === 'Recoverable failure') {
    return (
      <InlineMessage tone="danger" presentation="summary">
        <InlineMessageTitle>
          <Trans>1 order needs retrying</Trans>
        </InlineMessageTitle>
      </InlineMessage>
    )
  }
  if (state === 'Transaction failed') {
    return (
      <InlineMessage tone="danger" presentation="summary">
        <InlineMessageTitle>
          <Trans>An error occurred. Please try again.</Trans>
        </InlineMessageTitle>
      </InlineMessage>
    )
  }
  return null
}
