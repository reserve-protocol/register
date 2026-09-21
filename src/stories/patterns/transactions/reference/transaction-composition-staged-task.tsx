import { Check } from 'lucide-react'

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
import { v1SemanticRoles as roles } from '@/components/design-system-v1/semantic-roles'
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
import { TransactionStageBoundary } from './transaction-stage-boundary'
import { transactionStageAmountClasses } from './transaction-stage-emphasis'

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
  const currentStage =
    canEditAmount && input.exceedsBalance
      ? 'funding'
      : isMintStage && isMint
        ? 'mint'
        : 'collateral'
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
            aria-current={currentStage === 'funding' ? 'step' : undefined}
            className="bg-card p-2"
          >
            <AutomatedMintInputAmount
              chain={chain}
              canEdit={canEditAmount}
              isCurrent={currentStage === 'funding'}
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
                    <>Use existing collateral</>
                  </span>
                  <span
                    className={cn(
                      'whitespace-nowrap text-right tabular-nums',
                      v1Typography.supporting,
                      roles.text.supporting
                    )}
                  >
                    {useExistingCollateral ? (
                      <>{existingCollateralValue} applied</>
                    ) : (
                      <>{existingCollateralValue} available</>
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
          <TransactionStageBoundary testId="automated-mint-amount-boundary" />
          <section
            aria-current={currentStage === 'collateral' ? 'step' : undefined}
            className="bg-card p-2"
            data-stage-state={isMintStage ? 'complete' : 'current'}
            data-testid="automated-mint-collateral-step"
          >
            <AutomatedMintCollateralStage
              chain={chain}
              input={input}
              emphasis={
                currentStage === 'collateral'
                  ? 'current'
                  : isMintStage
                    ? 'neutral'
                    : 'upcoming'
              }
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
          <TransactionStageBoundary testId="automated-mint-amount-boundary" />
          <section
            aria-current={currentStage === 'mint' ? 'step' : undefined}
            className="bg-card p-2"
            data-stage-state={isMintStage ? 'current' : 'upcoming'}
            data-testid="automated-mint-mint-step"
          >
            <AutomatedMintOutputAmount
              chain={chain}
              input={input}
              isCurrent={currentStage === 'mint'}
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
                    <>Waiting for collateral</>
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
  emphasis,
  input,
  operation,
  state,
  useExistingCollateral,
}: {
  chain: AutomatedIssuanceChain
  emphasis: keyof typeof transactionStageAmountClasses
  input: AutomatedMintInputFixture
  operation: AutomatedIssuanceOperation
  state: AutomatedMintReviewState
  useExistingCollateral: boolean
}) => {
  const orders = ordersForState(
    state,
    useExistingCollateral,
    input.amount ?? (operation === 'mint' ? INPUT_AMOUNT : REDEEM_INPUT_AMOUNT),
    operation,
    chain
  )
  const filledCount = orders.filter((order) => order.status === 'Filled').length
  const allOrdersFilled = orders.length > 0 && filledCount === orders.length
  const quotePending = state === 'Quote searching'
  const quotePaused = state === 'Quote paused'
  const quoteUnavailable = state === 'Quote unavailable'
  const execution = PROCESS_STATES.includes(state)
  const showsFillProgress =
    execution && state !== 'Authorizing orders' && orders.length > 0
  const supporting =
    state === 'No swaps needed' ? (
      <>No swaps needed</>
    ) : quotePending ? (
      <>Fetching quotes...</>
    ) : quotePaused ? (
      <>Quote search paused</>
    ) : quoteUnavailable ? (
      <>Quote unavailable</>
    ) : state === 'Authorizing orders' ? (
      <>{orders.length} orders prepared</>
    ) : state === 'Orders filling' ? (
      <>1 order open · expires in 1m 42s</>
    ) : state === 'Recoverable failure' ? (
      <>1 order needs retry</>
    ) : state === 'Cancelled order' ? (
      <>1 order cancelled</>
    ) : state === 'Transaction failed' ? (
      <>Transaction failed</>
    ) : execution ? (
      <>Orders filled</>
    ) : (
      <>{orders.length} swaps prepared</>
    )

  return (
    <TransactionAmountObject
      data-testid="automated-mint-collateral-stage"
      label={
        state === 'No swaps needed'
          ? `Collateral ready`
          : operation === 'mint'
            ? execution
              ? `Acquire collateral`
              : `Automatic collateral acquisition`
            : `Sell collateral`
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
      data-stage-emphasis={emphasis}
      className={transactionStageAmountClasses[emphasis]}
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
            {operation === 'mint' ? <>Step 1 of 2</> : <>Step 1 of 1</>}
          </span>
          <span aria-hidden="true">·</span>
          <span
            data-testid={
              allOrdersFilled ? 'automated-mint-collateral-complete' : undefined
            }
            className={cn(
              'min-w-0 whitespace-normal',
              allOrdersFilled &&
                'inline-flex items-center gap-2 text-foreground'
            )}
          >
            {allOrdersFilled && (
              <Check
                aria-hidden="true"
                className="size-4 shrink-0 text-feedback-success-foreground"
              />
            )}
            {supporting}
          </span>
        </span>
      }
    />
  )
}

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
          'mx-4 grid grid-cols-2 items-center gap-4',
          hasFilledOrders ? 'pb-4 pt-6' : 'py-4'
        )}
      >
        <div className="flex min-w-0 flex-col items-start gap-0.5">
          <dt className={cn(v1Typography.supporting, roles.text.supporting)}>
            {hasFilledOrders ? (
              <>Quoted swap impact</>
            ) : (
              <>Estimated swap impact</>
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
        <div className="flex min-w-0 flex-col items-end gap-0.5 text-right">
          <dt className={cn(v1Typography.supporting, roles.text.supporting)}>
            {hasFilledOrders ? <>Actual swap impact</> : <>Max slippage</>}
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
  isCurrent,
  input,
  onEdit,
  operation,
  priceUnavailable,
  useExistingCollateral,
}: {
  chain: AutomatedIssuanceChain
  canEdit: boolean
  isCurrent: boolean
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
      <>
        {formatFixtureAmount(walletFunding, 2)} +{' '}
        {formatUsdFixture(
          collateral.value * 10n ** BigInt(18 - collateral.decimals)
        )}{' '}
        existing collateral
      </>
    ) : (
      <>
        {input.usdDisplay} ·{' '}
        {formatUsdFixture(
          EXISTING_COLLATERAL_INPUT_EQUIVALENT.value * 10n ** 12n
        )}{' '}
        existing collateral
      </>
    )
  ) : priceUnavailable ? (
    <>Price unavailable</>
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
      className={
        transactionStageAmountClasses[isCurrent ? 'current' : 'neutral']
      }
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
              <>Using basket assets only; no CMC20 will be redeemed.</>
            ) : (
              fundingDetail
            )}
          </span>
          {canEdit && (
            <InlineAction onClick={onEdit}>
              <>Edit amount</>
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
  isCurrent,
  operation,
  state,
  useExistingCollateral,
}: {
  chain: AutomatedIssuanceChain
  input: AutomatedMintInputFixture
  isCurrent: boolean
  operation: AutomatedIssuanceOperation
  state: AutomatedMintReviewState
  useExistingCollateral: boolean
}) => {
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
    <>Fetching quotes...</>
  ) : state === 'Collateral ready' ? (
    <>≈{outputValue} · Ready to mint</>
  ) : state === 'Final mint signing' ? (
    <>≈{outputValue} · Completing mint...</>
  ) : !isMint && state === 'Authorizing orders' ? (
    <>Estimated output · Confirm redeem in your wallet</>
  ) : !isMint && state === 'Orders filling' ? (
    <>Estimated output · Collateral sales in progress</>
  ) : !isMint && state === 'Recoverable failure' ? (
    <>Estimated output · One order needs retry</>
  ) : (
    <>Estimated output · ≈{outputValue} · Upcoming</>
  )

  const outputAmount = isMint ? mintedAmount : redeemOutcome.received
  const outputSymbol = isMint ? 'CMC20' : redeemOutcome.received.symbol

  return (
    <TransactionAmountObject
      data-testid="automated-mint-output-amount"
      label={
        isMint
          ? `Mint CMC20`
          : outputSymbol === 'USDT'
            ? `Receive USDT`
            : `Receive USDC`
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
      data-stage-emphasis={isCurrent ? 'current' : 'upcoming'}
      className={
        transactionStageAmountClasses[isCurrent ? 'current' : 'upcoming']
      }
      asset={<TransactionAmountAsset chain={chain} symbol={outputSymbol} />}
      supporting={
        <span className="inline-flex min-w-0 items-baseline gap-1.5">
          {isMint && (
            <>
              <span className="shrink-0">
                <>Step 2 of 2</>
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
          <>Exceeds available balance</>
        </InlineMessageTitle>
      </InlineMessage>
    )
  }
  if (state === 'Quote paused') {
    return (
      <InlineMessage tone="warning" presentation="summary">
        <InlineMessageTitle>
          <>Quote paused · Amount saved</>
        </InlineMessageTitle>
      </InlineMessage>
    )
  }
  if (state === 'Quote unavailable') {
    return (
      <InlineMessage tone="danger">
        <InlineMessageTitle>
          <>The swap quote is unavailable</>
        </InlineMessageTitle>
        <InlineMessageDescription className="mt-1">
          <>The amount may be too small to cover fees.</>
        </InlineMessageDescription>
      </InlineMessage>
    )
  }
  if (state === 'Per-order quote failure') {
    return (
      <InlineMessage tone="danger" presentation="summary">
        <InlineMessageTitle>
          <>Some quotes couldn't be fetched.</>
        </InlineMessageTitle>
      </InlineMessage>
    )
  }
  if (state === 'Recoverable failure') {
    return (
      <InlineMessage tone="danger" presentation="summary">
        <InlineMessageTitle>
          <>1 order needs retrying</>
        </InlineMessageTitle>
      </InlineMessage>
    )
  }
  if (state === 'Transaction failed') {
    return (
      <InlineMessage tone="danger" presentation="summary">
        <InlineMessageTitle>
          <>An error occurred. Please try again.</>
        </InlineMessageTitle>
      </InlineMessage>
    )
  }
  return null
}
