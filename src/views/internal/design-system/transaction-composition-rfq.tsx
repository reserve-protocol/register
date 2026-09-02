import { useEffect, useState } from 'react'
import { RefreshCw, X } from 'lucide-react'

import { Button, InlineAction } from '@/components/button'
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@/components/design-system-v1/segmented-control'
import { HelpTooltip } from '@/components/design-system-v1/help-tooltip'
import {
  TransactionAmountObject,
  TransactionAmountDirectionControl,
  TransactionAmountPair,
  TransactionAmountRelation,
} from '@/components/design-system-v1/transaction-amount-object'
import {
  transactionAttachedRegionGeometry,
  transactionOutcomeGeometry,
  transactionTaskGeometry,
} from '@/components/design-system-v1/transaction-task-geometry'
import { OrganicBrandSurface } from '@/components/design-system-v1/organic-brand-surface'
import { IconButton } from '@/components/icon-button'
import { cn } from '@/lib/utils'
import { ChainId } from '@/utils/chains'

import { TransactionCompositionFrame } from './transaction-composition-frame'
import { TransactionCommittedMode } from './transaction-committed-mode'
import { TransactionAmountAsset } from './transaction-system-assets'
import {
  ZAPPER_ASSETS,
  ZapperAssetSelector,
  ZapperPackageState,
  ZapperQuoteDetails,
  ZapperQuoteLoading,
  ZapperSelectableQuoteMeta,
  ZapperSettings,
  type ZapperPackageStateKind,
} from './transaction-composition-rfq-support'
import { TransactionOutcomeStatus } from './transaction-outcome-status'
import { transactionOutcomeMotion } from './transaction-outcome-motion'
import {
  TransactionOutcomeAttachment,
  type TransactionOutcomeAttachmentType,
} from './transaction-outcome-attachment'
import { TransactionReviewAdvisory } from './transaction-review-advisory'
import { TransactionWalletAction } from './transaction-wallet-action'

export type ZapperReviewState =
  | 'Review'
  | 'Quote search'
  | 'Approval'
  | 'Sign order'
  | 'RFQ execution'
  | 'Atomic confirmation'
  | 'RFQ outcome'
  | 'Atomic outcome'
  | 'Quote failure'
  | 'RFQ recovery'
  | 'Native refund'
  | 'High-impact acknowledgment'
  | 'Market-hours advisory'
  | 'Capacity advisory'
  | 'Trading unavailable'
  | 'CoW redirect · retired'
  | 'Updates'
  | 'Intro call'
  | 'Pre-quote'
  | 'Route selection'

const ZAPPER_REVIEW_TASK_WIDTH = 'max-w-[448px]'

export const RfqTransactionComposition = () => (
  <TransactionCompositionFrame<ZapperReviewState>
    id="rfq"
    defaultState="Review"
    model="Opaque asynchronous · current installed Zapper modal boundary"
    title="Instant Zapper"
    description="The Zapper keeps operation direction, selection, quote economics, action, waiting, and outcome together. Fixed-route and selectable-route quotes share one reviewed composition while exposing only the controls each route policy supports. A quote may execute atomically or settle as an order, so lifecycle truth remains route-specific."
    presentation="modal-backdrop"
    stateGroups={[
      {
        label: 'Lifecycle state',
        states: [
          'Pre-quote',
          'Quote search',
          'Review',
          'Approval',
          'Sign order',
          'RFQ execution',
          'Atomic confirmation',
          'RFQ outcome',
          'Atomic outcome',
          'Quote failure',
          'RFQ recovery',
          'Native refund',
        ],
      },
      {
        label: 'Review variant',
        states: [
          'Route selection',
          'High-impact acknowledgment',
          'Market-hours advisory',
          'Capacity advisory',
          'Trading unavailable',
          'CoW redirect · retired',
        ],
      },
      {
        label: 'Outcome attachment',
        states: ['Updates', 'Intro call'],
      },
    ]}
    parts={[
      { label: 'Register host surface', status: 'Current baseline' },
      { label: 'Package interaction and internals', status: 'Upstream-owned' },
      { label: 'RFQ lifecycle truth', status: 'Retained current' },
    ]}
  >
    {(state) => <ZapperInlineReference state={state} />}
  </TransactionCompositionFrame>
)

export const ZapperInlineReference = ({
  state,
}: {
  state: ZapperReviewState
}) => {
  const [open, setOpen] = useState(true)
  const [mode, setMode] = useState<'Buy' | 'Sell'>('Buy')
  const [buyAmount, setBuyAmount] = useState('1,000')
  const [capacityAmount, setCapacityAmount] = useState('250,000')
  const [currentPreQuoteAmount, setCurrentPreQuoteAmount] = useState('')
  const [sellAmount, setSellAmount] = useState('990')
  const [selectedAsset, setSelectedAsset] = useState(ZAPPER_ASSETS[0]!)
  const [nativeRefundAmount, setNativeRefundAmount] = useState('0.42')
  const [nativeRefundAsset, setNativeRefundAsset] = useState(
    ZAPPER_ASSETS.find((asset) => asset.symbol === 'ETH')!
  )
  const [quoteLoading, setQuoteLoading] = useState(false)
  const [isWalletTracked, setIsWalletTracked] = useState(false)
  const [advisoryDismissed, setAdvisoryDismissed] = useState(false)
  const advisoryVariant =
    state === 'Market-hours advisory'
      ? 'closed-impact'
      : state === 'Capacity advisory'
        ? 'capacity'
        : state === 'Trading unavailable'
          ? 'closed-error'
          : state === 'CoW redirect · retired'
            ? 'cow-redirect'
            : undefined
  const reviewActionDisposition =
    state === 'Capacity advisory' || state === 'Trading unavailable'
      ? 'blocking'
      : state === 'Market-hours advisory'
        ? 'cautionary'
        : undefined
  const isReviewAdvisory = Boolean(advisoryVariant)
  const isPreQuote = state === 'Pre-quote'
  const isSelectableRouteQuote = state === 'Route selection'
  const usesSelectableQuoteControls = isPreQuote || isSelectableRouteQuote
  const controlsMounted =
    state === 'Review' ||
    state === 'Approval' ||
    state === 'Sign order' ||
    state === 'Quote failure' ||
    state === 'RFQ recovery' ||
    state === 'Native refund' ||
    state === 'Quote search' ||
    state === 'High-impact acknowledgment' ||
    usesSelectableQuoteControls ||
    isReviewAdvisory
  const isQuoteSearching =
    state === 'Quote search' || (state === 'Review' && quoteLoading)
  const quoteOutputLoading = isQuoteSearching
  const interactionLocked =
    isQuoteSearching ||
    state === 'Approval' ||
    state === 'Sign order' ||
    state === 'RFQ execution' ||
    state === 'Atomic confirmation'
  const outcomeAttachment: TransactionOutcomeAttachmentType | undefined =
    state === 'Updates'
      ? 'updates'
      : state === 'Intro call'
        ? 'intro-call'
        : undefined
  const visibleOutcomeAttachment = outcomeAttachment
  const packageState = getZapperPackageState(state)
  const isOutcome =
    packageState === 'RFQ outcome' || packageState === 'Atomic outcome'
  const isNativeRefund = packageState === 'Native refund'
  const usesCapacityFixture = state === 'Capacity advisory' && mode === 'Buy'
  const activeSelectedAsset = isNativeRefund ? nativeRefundAsset : selectedAsset
  const amount = isPreQuote
    ? currentPreQuoteAmount
    : usesCapacityFixture
      ? capacityAmount
      : mode === 'Buy'
        ? isNativeRefund
          ? nativeRefundAmount
          : buyAmount
        : sellAmount
  const setAmount = isPreQuote
    ? setCurrentPreQuoteAmount
    : usesCapacityFixture
      ? setCapacityAmount
      : mode === 'Buy'
        ? isNativeRefund
          ? setNativeRefundAmount
          : setBuyAmount
        : setSellAmount
  const availableBalance = usesCapacityFixture
    ? '280,000.00'
    : mode === 'Buy'
      ? activeSelectedAsset.balance
      : '1,245.80'
  const normalizedAmount = amount.replaceAll(',', '')
  const quote =
    activeSelectedAsset.symbol === 'USDC'
      ? mode === 'Buy'
        ? {
            '1000': {
              inputValue: '$1,000.00',
              outputAmount: '≈990.00',
              outputDelta: '-1.00%',
              outputValue: '≈$990.00',
            },
            '4280.16': {
              inputValue: '$4,280.16',
              outputAmount: '≈4,237.36',
              outputDelta: '-1.00%',
              outputValue: '≈$4,237.36',
            },
            '250000': {
              inputValue: '$250,000.00',
              outputAmount: '≈247,500.00',
              outputDelta: '-1.00%',
              outputValue: '≈$247,500.00',
            },
          }[normalizedAmount]
        : {
            '990': {
              inputValue: '$990.00',
              outputAmount: '≈986.42',
              outputDelta: '-0.36%',
              outputValue: '≈$986.42',
            },
            '1245.80': {
              inputValue: '$1,245.80',
              outputAmount: '≈1,240.82',
              outputDelta: '-0.40%',
              outputValue: '≈$1,240.82',
            },
          }[normalizedAmount]
      : undefined
  const displayedQuote =
    state === 'RFQ recovery' ||
    state === 'Quote failure' ||
    state === 'Native refund' ||
    isPreQuote ||
    quoteOutputLoading
      ? undefined
      : quote
  const quoteDetailsVisible =
    Boolean(displayedQuote) || quoteOutputLoading || isPreQuote
  const quoteSource =
    packageState === 'Atomic confirmation' || packageState === 'Atomic outcome'
      ? 'Enso'
      : 'CoW Swap'

  useEffect(() => {
    if (!quoteLoading) return

    const timer = window.setTimeout(() => setQuoteLoading(false), 12000)
    return () => window.clearTimeout(timer)
  }, [quoteLoading])

  useEffect(() => {
    setAdvisoryDismissed(false)
  }, [state])

  useEffect(() => {
    if (!isOutcome || mode !== 'Buy') setIsWalletTracked(false)
  }, [isOutcome, mode])

  if (!open) {
    return (
      <div className="flex justify-center py-8">
        <Button onClick={() => setOpen(true)}>Open Zapper</Button>
      </div>
    )
  }

  return (
    <div
      data-testid="zapper-outcome-composition"
      className={cn(
        'relative mx-auto w-full min-w-0',
        ZAPPER_REVIEW_TASK_WIDTH,
        visibleOutcomeAttachment &&
          cn(
            transactionAttachedRegionGeometry.frame,
            transactionOutcomeGeometry.minimumSurfaceHeight,
            'bg-card shadow-lg'
          ),
        advisoryVariant &&
          !advisoryDismissed &&
          cn(transactionAttachedRegionGeometry.frame, 'bg-card shadow-lg')
      )}
    >
      <div
        data-testid="zapper-shell"
        className={cn(
          'relative z-10 w-full min-w-0 shrink-0 bg-card shadow-lg',
          ZAPPER_REVIEW_TASK_WIDTH,
          isOutcome
            ? cn(
                !visibleOutcomeAttachment &&
                  transactionOutcomeGeometry.minimumSurfaceHeight,
                'grid p-0',
                visibleOutcomeAttachment
                  ? 'ring-0 shadow-sm'
                  : 'ring-2 ring-card'
              )
            : 'p-2',
          advisoryVariant && !advisoryDismissed && 'shadow-sm'
        )}
      >
        <div
          data-testid="zapper-review-stack"
          className={cn(
            'min-w-0',
            isOutcome && 'flex flex-col',
            quoteDetailsVisible ? 'space-y-0' : 'space-y-2'
          )}
        >
          <div
            data-testid="zapper-amount-and-details"
            className={cn(
              'relative isolate grid grid-cols-1',
              isOutcome && 'flex-1 grid-rows-[auto_minmax(0,1fr)_auto]'
            )}
          >
            {isOutcome && (
              <OrganicBrandSurface
                data-testid="zapper-outcome-surface"
                tone={visibleOutcomeAttachment ? 'deep' : 'default'}
                className={cn(
                  'z-0 col-start-1 row-start-1 row-end-3 scale-y-100 rounded-lg',
                  transactionOutcomeMotion.surface
                )}
              />
            )}
            <header
              className={cn(
                'relative z-10 col-start-1 row-start-1 flex items-center justify-between gap-4 pb-4',
                isOutcome
                  ? cn(
                      'px-4 pt-4 text-brand-foreground',
                      transactionOutcomeMotion.content
                    )
                  : transactionTaskGeometry.compactHeaderInset
              )}
            >
              {isOutcome ? (
                <TransactionOutcomeStatus testId="zapper-outcome-status" />
              ) : interactionLocked ? (
                <TransactionCommittedMode assetSymbol="CMC20" label={mode} />
              ) : (
                <SegmentedControl
                  aria-label="Zapper operation"
                  presentation="contained"
                  size="compact"
                  width="intrinsic"
                  value={mode}
                  onValueChange={(value) => {
                    setMode(value as 'Buy' | 'Sell')
                    setSelectedAsset(ZAPPER_ASSETS[0]!)
                    setQuoteLoading(false)
                  }}
                >
                  <SegmentedControlItem
                    value="Buy"
                    disabled={interactionLocked}
                  >
                    Buy
                  </SegmentedControlItem>
                  <SegmentedControlItem
                    value="Sell"
                    disabled={interactionLocked}
                  >
                    Sell
                  </SegmentedControlItem>
                </SegmentedControl>
              )}
              <div className="flex items-center gap-1">
                {!isOutcome && !interactionLocked && (
                  <>
                    <ZapperSettings disabled={interactionLocked} />
                    <IconButton
                      label={
                        quoteOutputLoading
                          ? 'Finding best quote'
                          : 'Refresh quote'
                      }
                      icon={
                        <RefreshCw
                          className={
                            quoteOutputLoading ? 'motion-safe:animate-spin' : ''
                          }
                        />
                      }
                      size="compact"
                      disabled={interactionLocked}
                      onClick={() => setQuoteLoading(true)}
                    />
                  </>
                )}
                <IconButton
                  label="Close Zapper"
                  icon={<X />}
                  size="compact"
                  onClick={() => setOpen(false)}
                />
              </div>
            </header>
            <TransactionAmountPair
              className={cn(
                isOutcome &&
                  cn(
                    'relative z-10 col-start-1 row-start-2 flex flex-col justify-end pb-2',
                    transactionOutcomeMotion.content
                  ),
                (state === 'RFQ execution' ||
                  state === 'Atomic confirmation') &&
                  transactionTaskGeometry.submittedContentBoundary
              )}
              data-task-boundary={
                state === 'RFQ execution' || state === 'Atomic confirmation'
                  ? 'leading'
                  : undefined
              }
            >
              <div
                aria-hidden={isOutcome}
                data-testid="zapper-input-transition"
                className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-180 motion-reduce:transition-none ${
                  isOutcome
                    ? 'grid-rows-[0fr] opacity-0'
                    : 'grid-rows-[1fr] opacity-100'
                }`}
              >
                <div className="min-h-0 overflow-hidden">
                  <TransactionAmountObject
                    label={
                      usesSelectableQuoteControls ? 'Order size' : 'You use'
                    }
                    amount={amount}
                    amountPlaceholder={isPreQuote ? '0' : undefined}
                    tone={isOutcome ? 'inverse' : 'default'}
                    {...(controlsMounted
                      ? {
                          disabled: interactionLocked,
                          onAmountChange: setAmount,
                        }
                      : { readOnly: true as const })}
                    presentation="input"
                    asset={
                      mode === 'Buy' && controlsMounted ? (
                        <ZapperAssetSelector
                          disabled={isQuoteSearching}
                          selected={activeSelectedAsset}
                          onSelect={(asset) => {
                            if (isNativeRefund) {
                              setNativeRefundAsset(asset)
                            } else {
                              setSelectedAsset(asset)
                            }
                            setAmount(
                              usesCapacityFixture && asset.symbol === 'USDC'
                                ? '250,000'
                                : asset.symbol === 'USDC'
                                  ? '1,000'
                                  : asset.symbol === 'ETH'
                                    ? '0.42'
                                    : ''
                            )
                          }}
                        />
                      ) : isNativeRefund ? (
                        <TransactionAmountAsset
                          chain={ChainId.Base}
                          symbol="ETH"
                        />
                      ) : mode === 'Buy' ? (
                        <TransactionAmountAsset
                          chain={ChainId.Base}
                          symbol={selectedAsset.symbol}
                        />
                      ) : (
                        <TransactionAmountAsset
                          chain={ChainId.Base}
                          symbol="CMC20"
                        />
                      )
                    }
                    supporting={
                      isNativeRefund &&
                      mode === 'Buy' &&
                      activeSelectedAsset.symbol === 'ETH'
                        ? '$1,034.82'
                        : isPreQuote
                          ? '$0.00'
                          : (quote?.inputValue ?? 'Quote refreshes after input')
                    }
                    balance={
                      <>
                        Balance{' '}
                        <span className="font-medium text-foreground tabular-nums">
                          {availableBalance}
                        </span>
                      </>
                    }
                    balanceAction={
                      controlsMounted ? (
                        <InlineAction
                          disabled={interactionLocked}
                          onClick={() => setAmount(availableBalance)}
                        >
                          Max
                        </InlineAction>
                      ) : undefined
                    }
                  />
                </div>
              </div>
              {controlsMounted ? (
                <TransactionAmountDirectionControl
                  label="Swap input and output assets"
                  disabled={interactionLocked}
                  onClick={() => {
                    setMode((current) => (current === 'Buy' ? 'Sell' : 'Buy'))
                    setSelectedAsset(ZAPPER_ASSETS[0]!)
                    setQuoteLoading(false)
                  }}
                />
              ) : (
                <TransactionAmountRelation
                  className={`transition-opacity duration-180 motion-reduce:transition-none ${
                    isOutcome ? 'opacity-0' : 'opacity-100'
                  }`}
                />
              )}
              <div
                data-testid="zapper-output-transition"
                className="relative transition-transform duration-180 motion-reduce:transition-none"
              >
                <TransactionAmountObject
                  label={
                    isOutcome
                      ? 'Received'
                      : usesSelectableQuoteControls
                        ? 'Projected proceeds'
                        : 'Estimated output'
                  }
                  amount={
                    isOutcome
                      ? '986.42'
                      : isPreQuote
                        ? '0'
                        : (displayedQuote?.outputAmount ?? '—')
                  }
                  className={
                    isOutcome
                      ? 'bg-transparent px-6'
                      : quoteDetailsVisible
                        ? cn(
                            'border-b',
                            quoteOutputLoading
                              ? 'border-transparent'
                              : 'border-border'
                          )
                        : undefined
                  }
                  presentation="output"
                  tone={isOutcome ? 'inverse' : 'default'}
                  unit={
                    isOutcome
                      ? mode === 'Buy'
                        ? 'CMC20'
                        : selectedAsset.symbol
                      : undefined
                  }
                  trailingAction={
                    isOutcome && mode === 'Buy' ? (
                      <TransactionWalletAction
                        isTracked={isWalletTracked}
                        onTrack={() => setIsWalletTracked(true)}
                      />
                    ) : undefined
                  }
                  asset={
                    isOutcome ? undefined : mode === 'Sell' &&
                      controlsMounted ? (
                      <ZapperAssetSelector
                        disabled={isQuoteSearching}
                        label="Select output asset"
                        selected={activeSelectedAsset}
                        onSelect={(asset) => {
                          if (isNativeRefund) {
                            setNativeRefundAsset(asset)
                          } else {
                            setSelectedAsset(asset)
                          }
                          setQuoteLoading(false)
                        }}
                      />
                    ) : (
                      <TransactionAmountAsset
                        chain={ChainId.Base}
                        symbol={
                          mode === 'Buy' ? 'CMC20' : activeSelectedAsset.symbol
                        }
                      />
                    )
                  }
                  supporting={
                    isOutcome ? (
                      <span className="tabular-nums">$986.42</span>
                    ) : isPreQuote ? (
                      '$0.00'
                    ) : displayedQuote ? (
                      <span className="flex flex-wrap items-baseline gap-1 tabular-nums">
                        <span>{displayedQuote.outputValue}</span>
                        <span data-testid="zapper-output-value-delta">
                          ({displayedQuote.outputDelta})
                        </span>
                      </span>
                    ) : state === 'RFQ recovery' ? (
                      'Get a fresh quote to update'
                    ) : state === 'Native refund' ? (
                      'Quote expired'
                    ) : (
                      'Updates after the package returns a quote'
                    )
                  }
                  supportingRowClassName={
                    quoteDetailsVisible && !isOutcome
                      ? 'min-h-11 sm:min-h-5'
                      : undefined
                  }
                  balance={
                    !isOutcome && displayedQuote ? (
                      <span className="flex items-center gap-1 whitespace-nowrap">
                        <span>Quote includes fees</span>
                        <HelpTooltip
                          accessibleLabel="About included quote fees"
                          content="The displayed quote already includes all applicable fees."
                        />
                      </span>
                    ) : undefined
                  }
                  readOnly
                />
                {quoteOutputLoading && <ZapperQuoteLoading />}
              </div>
            </TransactionAmountPair>
            {usesSelectableQuoteControls ? (
              <div className="col-start-1 row-start-3">
                <ZapperSelectableQuoteMeta
                  mode={mode}
                  quoteReady={isSelectableRouteQuote}
                  source={quoteSource}
                />
              </div>
            ) : quoteDetailsVisible ? (
              <ZapperQuoteDetails
                key={isOutcome ? 'outcome-details' : 'quote-details'}
                className={cn('col-start-1 row-start-3', isOutcome && 'mx-2')}
                loading={quoteOutputLoading}
                mode={mode}
                outcome={isOutcome}
                outcomeKind={
                  packageState === 'Atomic outcome' ? 'atomic' : 'rfq'
                }
                source={quoteSource}
              />
            ) : null}
          </div>
          <div
            data-testid={isOutcome ? 'zapper-outcome-action-inset' : undefined}
            className={cn(isOutcome && 'mx-2 pb-2')}
          >
            <ZapperPackageState
              state={packageState}
              mode={mode}
              onDone={() => setOpen(false)}
              quoteReady={Boolean(displayedQuote) && !quoteOutputLoading}
              reviewActionDisposition={reviewActionDisposition}
              showDone={!visibleOutcomeAttachment}
              currentPhase={
                isPreQuote
                  ? 'pre-quote'
                  : isSelectableRouteQuote
                    ? 'quote-received'
                    : undefined
              }
            />
          </div>
        </div>
      </div>
      {visibleOutcomeAttachment && (
        <TransactionOutcomeAttachment type={visibleOutcomeAttachment} />
      )}
      {advisoryVariant && !advisoryDismissed && (
        <TransactionReviewAdvisory
          variant={advisoryVariant}
          onDismiss={() => setAdvisoryDismissed(true)}
        />
      )}
    </div>
  )
}

const getZapperPackageState = (
  state: ZapperReviewState
): ZapperPackageStateKind => {
  switch (state) {
    case 'Updates':
    case 'Intro call':
      return 'RFQ outcome'
    case 'Market-hours advisory':
    case 'Capacity advisory':
    case 'Trading unavailable':
    case 'CoW redirect · retired':
    case 'Pre-quote':
    case 'Route selection':
      return 'Review'
    default:
      return state
  }
}
