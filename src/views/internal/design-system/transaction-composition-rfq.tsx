import { useEffect, useState } from 'react'
import { ArrowUpDown, RefreshCw, X } from 'lucide-react'

import { Button, InlineAction } from '@/components/button'
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@/components/design-system-v1/segmented-control'
import {
  TransactionAmountObject,
  TransactionAmountPair,
  TransactionAmountRelation,
} from '@/components/design-system-v1/transaction-amount-object'
import { transactionTaskGeometry } from '@/components/design-system-v1/transaction-task-geometry'
import { OrganicBrandSurface } from '@/components/design-system-v1/organic-brand-surface'
import { IconButton } from '@/components/icon-button'
import { cn } from '@/lib/utils'
import { ChainId } from '@/utils/chains'

import { TransactionCompositionFrame } from './transaction-composition-frame'
import { TransactionAmountAsset } from './transaction-system-assets'
import {
  ZAPPER_ASSETS,
  ZapperAssetSelector,
  ZapperPackageState,
  ZapperQuoteDetails,
  ZapperQuoteLoading,
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
  | 'Updates'
  | 'Intro call'

export const RfqTransactionComposition = () => (
  <TransactionCompositionFrame<ZapperReviewState>
    id="rfq"
    defaultState="Review"
    model="Opaque asynchronous · current installed Zapper modal boundary"
    title="Instant Zapper"
    description="The installed Zapper keeps Buy/Sell, selection, quote economics, action, waiting, and outcome together. A quote may execute atomically or settle as an order, so lifecycle truth remains route-specific."
    presentation="modal-backdrop"
    stateGroups={[
      {
        label: 'Lifecycle state',
        states: [
          'Review',
          'Quote search',
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
          'High-impact acknowledgment',
          'Market-hours advisory',
          'Capacity advisory',
          'Trading unavailable',
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
  const [sellAmount, setSellAmount] = useState('990')
  const [selectedAsset, setSelectedAsset] = useState(ZAPPER_ASSETS[0]!)
  const [quoteLoading, setQuoteLoading] = useState(false)
  const [isWalletTracked, setIsWalletTracked] = useState(false)
  const [outcomeAttachmentDismissed, setOutcomeAttachmentDismissed] =
    useState(false)
  const [delayedOutcomeAttachment, setDelayedOutcomeAttachment] = useState<
    TransactionOutcomeAttachmentType | undefined
  >()
  const advisoryVariant =
    state === 'Market-hours advisory'
      ? 'closed-impact'
      : state === 'Capacity advisory'
        ? 'capacity'
        : state === 'Trading unavailable'
          ? 'closed-error'
          : undefined
  const isReviewAdvisory = Boolean(advisoryVariant)
  const controlsMounted =
    state === 'Review' ||
    state === 'Approval' ||
    state === 'Sign order' ||
    state === 'Quote failure' ||
    state === 'Quote search' ||
    state === 'High-impact acknowledgment' ||
    isReviewAdvisory
  const isQuoteSearching =
    state === 'Quote search' || (state === 'Review' && quoteLoading)
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
  const visibleOutcomeAttachment = outcomeAttachmentDismissed
    ? undefined
    : delayedOutcomeAttachment
  const packageState = getZapperPackageState(state)
  const isOutcome =
    packageState === 'RFQ outcome' || packageState === 'Atomic outcome'
  const isNativeRefund = packageState === 'Native refund'
  const amount = isNativeRefund
    ? '0.42'
    : mode === 'Buy'
      ? buyAmount
      : sellAmount
  const setAmount = mode === 'Buy' ? setBuyAmount : setSellAmount
  const normalizedAmount = amount.replaceAll(',', '')
  const quote =
    selectedAsset.symbol === 'USDC'
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
    isQuoteSearching
      ? undefined
      : quote
  const quoteDetailsVisible = Boolean(displayedQuote) || isQuoteSearching
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
    setOutcomeAttachmentDismissed(false)
  }, [state])

  useEffect(() => {
    if (!isOutcome || mode !== 'Buy') setIsWalletTracked(false)
  }, [isOutcome, mode])

  useEffect(() => {
    setDelayedOutcomeAttachment(undefined)
    if (!outcomeAttachment) return

    const timer = window.setTimeout(
      () => setDelayedOutcomeAttachment(outcomeAttachment),
      360
    )
    return () => window.clearTimeout(timer)
  }, [outcomeAttachment])

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
        transactionTaskGeometry.substantialWidth
      )}
    >
      <div
        data-testid="zapper-shell"
        className={cn(
          'relative z-10 w-full min-w-0 shrink-0 bg-card shadow-lg',
          transactionTaskGeometry.substantialWidth,
          isOutcome ? 'p-0 ring-2 ring-card' : 'p-2'
        )}
      >
        <div
          data-testid="zapper-review-stack"
          className={cn(
            'min-w-0',
            quoteDetailsVisible ? 'space-y-0' : 'space-y-2'
          )}
        >
          <div
            data-testid="zapper-amount-and-details"
            className="relative isolate grid grid-cols-1"
          >
            {isOutcome && (
              <OrganicBrandSurface
                data-testid="zapper-outcome-surface"
                className={cn(
                  'z-0 col-start-1 row-start-1 row-end-3 origin-bottom scale-y-100 rounded-lg bg-brand',
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
                {!isOutcome && (
                  <>
                    <ZapperSettings disabled={interactionLocked} />
                    <IconButton
                      label={
                        isQuoteSearching
                          ? 'Finding best quote'
                          : 'Refresh quote'
                      }
                      icon={
                        <RefreshCw
                          className={
                            isQuoteSearching ? 'motion-safe:animate-spin' : ''
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
                    'relative z-10 col-start-1 row-start-2 pb-2',
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
                    label="You use"
                    amount={amount}
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
                          selected={selectedAsset}
                          onSelect={(asset) => {
                            setSelectedAsset(asset)
                            setAmount(asset.symbol === 'USDC' ? '1,000' : '')
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
                      isNativeRefund
                        ? '$1,034.82'
                        : (quote?.inputValue ?? 'Quote refreshes after input')
                    }
                    balance={
                      <>
                        Balance{' '}
                        <span className="font-medium text-foreground tabular-nums">
                          {isNativeRefund
                            ? '0.42'
                            : mode === 'Buy'
                              ? selectedAsset.balance
                              : '1,245.80'}
                        </span>
                      </>
                    }
                    balanceAction={
                      controlsMounted ? (
                        <InlineAction
                          disabled={interactionLocked}
                          onClick={() =>
                            setAmount(
                              mode === 'Buy'
                                ? selectedAsset.balance
                                : '1,245.80'
                            )
                          }
                        >
                          Max
                        </InlineAction>
                      ) : undefined
                    }
                  />
                </div>
              </div>
              {controlsMounted ? (
                <IconButton
                  label="Swap input and output assets"
                  icon={<ArrowUpDown />}
                  size="compact"
                  disabled={interactionLocked}
                  onClick={() => {
                    setMode((current) => (current === 'Buy' ? 'Sell' : 'Buy'))
                    setSelectedAsset(ZAPPER_ASSETS[0]!)
                    setQuoteLoading(false)
                  }}
                  className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 ring-2 ring-card"
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
                  label={isOutcome ? 'Received' : 'Estimated output'}
                  amount={
                    isOutcome ? '986.42' : (displayedQuote?.outputAmount ?? '—')
                  }
                  className={
                    isOutcome
                      ? 'rounded-none bg-transparent px-6'
                      : quoteDetailsVisible && !isQuoteSearching
                        ? 'rounded-b-none border-b border-border'
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
                        selected={selectedAsset}
                        onSelect={(asset) => {
                          setSelectedAsset(asset)
                          setQuoteLoading(false)
                        }}
                      />
                    ) : (
                      <TransactionAmountAsset
                        chain={ChainId.Base}
                        symbol={mode === 'Buy' ? 'CMC20' : selectedAsset.symbol}
                      />
                    )
                  }
                  supporting={
                    isOutcome ? (
                      <span className="tabular-nums">$986.42</span>
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
                  readOnly
                />
                {isQuoteSearching && <ZapperQuoteLoading />}
              </div>
            </TransactionAmountPair>
            {quoteDetailsVisible && (
              <ZapperQuoteDetails
                key={isOutcome ? 'outcome-details' : 'quote-details'}
                className={cn('col-start-1 row-start-3', isOutcome && 'mx-2')}
                loading={isQuoteSearching}
                mode={mode}
                outcome={isOutcome}
                outcomeKind={
                  packageState === 'Atomic outcome' ? 'atomic' : 'rfq'
                }
                source={quoteSource}
              />
            )}
          </div>
          <div
            data-testid={isOutcome ? 'zapper-outcome-action-inset' : undefined}
            className={cn(isOutcome && 'mx-2 pb-2')}
          >
            <ZapperPackageState
              state={packageState}
              mode={mode}
              onDone={() => setOpen(false)}
              quoteReady={Boolean(displayedQuote) && !isQuoteSearching}
            />
          </div>
        </div>
      </div>
      {visibleOutcomeAttachment && (
        <TransactionOutcomeAttachment
          type={visibleOutcomeAttachment}
          onDismiss={() => setOutcomeAttachmentDismissed(true)}
        />
      )}
      {advisoryVariant && !outcomeAttachmentDismissed && (
        <TransactionReviewAdvisory
          variant={advisoryVariant}
          onDismiss={() => setOutcomeAttachmentDismissed(true)}
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
      return 'Review'
    default:
      return state
  }
}
