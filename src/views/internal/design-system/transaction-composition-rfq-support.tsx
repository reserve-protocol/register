import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { Trans } from '@lingui/react/macro'
import { ArrowUpRight, ChevronDown, Settings } from 'lucide-react'

import { Button } from '@/components/button'
import { Checkbox } from '@/components/checkbox'
import { ActionGroup } from '@/components/design-system-v1/action-group'
import { HelpTooltip } from '@/components/design-system-v1/help-tooltip'
import {
  InlineMessage,
  InlineMessageDescription,
  InlineMessageTitle,
} from '@/components/design-system-v1/inline-message'
import { Skeleton, Spinner } from '@/components/design-system-v1/loading'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/design-system-v1/popover'
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@/components/design-system-v1/segmented-control'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/design-system-v1/select'
import {
  TransactionAssetPickerList,
  TransactionAssetPickerOption,
  TransactionAssetPickerTrigger,
} from '@/components/design-system-v1/transaction-asset-picker'
import { v1Typography } from '@/components/design-system-v1/typography'
import { v1SemanticRecipes as roles } from '@/components/ui/v1-semantic-recipes'
import { IconButton } from '@/components/icon-button'
import { LifecycleStatusPill } from '@/components/lifecycle-status'
import { cn } from '@/lib/utils'
import { ChainId } from '@/utils/chains'

import {
  TransactionAmountAsset,
  TransactionAssetIdentity,
} from './transaction-system-assets'
import {
  TransactionMetricValue,
  type TransactionMetricTone,
} from './transaction-metric-value'
import { TransactionSummaryMessage } from './transaction-summary-message'

interface ZapperAssetBase {
  symbol: 'USDC' | 'ETH' | 'WETH' | 'WBTC'
  balance: string
}

export type ZapperAsset = ZapperAssetBase &
  (
    | { kind: 'native' }
    | {
        kind: 'token'
        address: string
      }
  )

export const ZAPPER_ASSETS: ZapperAsset[] = [
  {
    symbol: 'USDC',
    balance: '4,280.16',
    kind: 'token',
    address: '0x8335…2913',
  },
  {
    symbol: 'ETH',
    balance: '0.18',
    kind: 'native',
  },
  {
    symbol: 'WETH',
    balance: '1.804',
    kind: 'token',
    address: '0x4200…0006',
  },
  {
    symbol: 'WBTC',
    balance: '0.0041',
    kind: 'token',
    address: '0x0555…A7B8',
  },
]

const ZAPPER_ATOMIC_TRANSACTION = {
  href: 'https://basescan.org/tx/0x7fc2e37d2b9fb28674640223e7655f1d8ca8c3044b52e85523a62fb85e5b92ad',
} as const

const ZAPPER_RFQ_ORDER = {
  href: 'https://explorer.cow.fi/orders/0x7fc2e37d2b9fb28674640223e7655f1d8ca8c3044b52e85523a62fb85e5b92ad71a4c2f8e9d5b67319028ae45c6d7f301b4e8c2f66cf1580',
} as const

export const ZapperAssetSelector = ({
  disabled = false,
  label = 'Select input asset',
  onSelect,
  selected,
}: {
  disabled?: boolean
  label?: string
  onSelect: (asset: ZapperAsset) => void
  selected: ZapperAsset
}) => {
  const [open, setOpen] = useState(false)

  return (
    <Popover
      open={disabled ? false : open}
      onOpenChange={(nextOpen) => !disabled && setOpen(nextOpen)}
    >
      <PopoverTrigger asChild>
        <TransactionAssetPickerTrigger
          aria-label={label}
          disabled={disabled}
          identity={
            <TransactionAmountAsset
              chain={ChainId.Base}
              symbol={selected.symbol}
            />
          }
        />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-2 sm:w-80">
        <TransactionAssetPickerList aria-label="Zapper input assets">
          {ZAPPER_ASSETS.map((asset) => (
            <TransactionAssetPickerOption
              key={asset.symbol}
              aria-label={`${asset.symbol} on Base, ${
                asset.kind === 'native'
                  ? 'native asset'
                  : `token address ${asset.address}`
              }, balance ${asset.balance} ${asset.symbol}`}
              identity={
                <TransactionAssetIdentity
                  chain={ChainId.Base}
                  symbol={asset.symbol}
                  supporting={
                    asset.kind === 'native' ? 'Native on Base' : asset.address
                  }
                  textRhythm="compact-row"
                />
              }
              balance={`${asset.balance} ${asset.symbol}`}
              selected={asset.symbol === selected.symbol}
              onClick={() => {
                onSelect(asset)
                setOpen(false)
              }}
            />
          ))}
        </TransactionAssetPickerList>
      </PopoverContent>
    </Popover>
  )
}

export const ZapperSettings = ({
  disabled = false,
}: {
  disabled?: boolean
}) => {
  const [open, setOpen] = useState(false)
  const [quoteSource, setQuoteSource] = useState('best')
  const [slippage, setSlippage] = useState('1')
  const [deepLiquidity, setDeepLiquidity] = useState(false)
  const [forceMint, setForceMint] = useState(false)
  const deepLiquidityId = useId()
  const forceMintId = useId()
  const initialSettingRef = useRef<HTMLButtonElement>(null)

  return (
    <Popover
      open={disabled ? false : open}
      onOpenChange={(nextOpen) => !disabled && setOpen(nextOpen)}
    >
      <PopoverTrigger asChild>
        <IconButton
          label="Open Zapper settings"
          icon={<Settings />}
          size="compact"
          disabled={disabled}
        />
      </PopoverTrigger>
      <PopoverContent
        align="end"
        aria-label="Zapper settings"
        className="w-72 p-4"
        onOpenAutoFocus={(event) => {
          event.preventDefault()
          initialSettingRef.current?.focus()
        }}
        role="dialog"
      >
        <div className="grid gap-4">
          <h4 className={v1Typography.itemTitle}>Zapper settings</h4>
          <div className="grid gap-2">
            <div className="flex items-center gap-1">
              <span className={v1Typography.label}>Quote Source</span>
              <HelpTooltip
                accessibleLabel="About quote sources"
                content="Select which quote provider to use. 'Best' automatically compares all enabled providers and picks the highest output. Picking a specific provider forces a single source."
              />
            </div>
            <SegmentedControl
              aria-label="Quote Source"
              onValueChange={setQuoteSource}
              presentation="contained"
              size="compact"
              value={quoteSource}
              width="full"
            >
              <SegmentedControlItem ref={initialSettingRef} value="best">
                Best Quote
              </SegmentedControlItem>
              <SegmentedControlItem value="enso">Enso</SegmentedControlItem>
              <SegmentedControlItem value="cowswap">
                CoW Swap
              </SegmentedControlItem>
            </SegmentedControl>
          </div>
          <div className="grid gap-2">
            <div className="flex items-center gap-1">
              <span className={v1Typography.label}>Max. mint slippage</span>
              <HelpTooltip
                accessibleLabel="About maximum mint slippage"
                content="The maximum amount of slippage you are willing to accept when minting. Higher slippage settings will make the transaction more likely to succeed, but may result in fewer tokens minted."
              />
            </div>
            <SegmentedControl
              aria-label="Max. mint slippage"
              onValueChange={setSlippage}
              presentation="contained"
              size="compact"
              value={slippage}
              width="full"
            >
              <SegmentedControlItem value="0.5">0.5%</SegmentedControlItem>
              <SegmentedControlItem value="1">1%</SegmentedControlItem>
              <SegmentedControlItem value="3">3%</SegmentedControlItem>
            </SegmentedControl>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-1">
              <label className={v1Typography.label} htmlFor={deepLiquidityId}>
                Deep liquidity search
              </label>
              <HelpTooltip
                accessibleLabel="About deep liquidity search"
                content="Can improve price impact but it will take more time to get quotes."
              />
            </div>
            <Checkbox
              aria-label="Deep liquidity search"
              checked={deepLiquidity}
              id={deepLiquidityId}
              onCheckedChange={setDeepLiquidity}
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-1">
              <label className={v1Typography.label} htmlFor={forceMintId}>
                Force DTF mint?
              </label>
              <HelpTooltip
                accessibleLabel="About forcing a DTF mint"
                content="This is useful if you want to mint the DTF without trading."
              />
            </div>
            <Checkbox
              aria-label="Force DTF mint"
              checked={forceMint}
              id={forceMintId}
              onCheckedChange={setForceMint}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export const ZapperQuoteDetails = ({
  className,
  selectableRoutes = false,
  defaultOpen = false,
  loading = false,
  mode,
  outcome = false,
  outcomeKind = 'rfq',
  source = 'CoW Swap',
}: {
  className?: string
  selectableRoutes?: boolean
  defaultOpen?: boolean
  loading?: boolean
  mode: 'Buy' | 'Sell'
  outcome?: boolean
  outcomeKind?: 'atomic' | 'rfq'
  source?: string
}) => {
  const [open, setOpen] = useState(defaultOpen)

  useEffect(() => {
    setOpen(defaultOpen)
  }, [defaultOpen])

  if (outcome) {
    return (
      <section
        data-testid="zapper-quote-details"
        className={cn('relative z-10 bg-card', className)}
      >
        <ZapperQuoteFacts
          loading={loading}
          mode={mode}
          outcome
          outcomeKind={outcomeKind}
          source={source}
        />
      </section>
    )
  }

  return (
    <section
      data-testid="zapper-quote-details"
      className={cn('relative z-10 bg-card', className)}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-label={open ? 'Hide quote details' : 'Show quote details'}
        className={cn(
          'flex w-full items-center justify-between gap-3 px-4 py-4 text-left transition-colors duration-120',
          roles.interaction.subtleHover,
          roles.focus.onContentInset
        )}
        onClick={() => setOpen((current) => !current)}
      >
        {loading ? (
          <span className="flex h-5 items-center">
            <Skeleton className="h-3 w-28" />
          </span>
        ) : (
          <span
            className={cn(
              v1Typography.supporting,
              roles.text.supporting,
              'whitespace-nowrap'
            )}
          >
            {mode === 'Buy' ? '1 USDC = 0.99 CMC20' : '1 CMC20 = 0.996 USDC'}
          </span>
        )}
        <span className="flex h-5 items-center gap-2">
          {loading ? (
            <Skeleton
              data-slot="zapper-quote-source-loading"
              className="h-3 w-20"
            />
          ) : (
            <span className={cn(v1Typography.label, 'whitespace-nowrap')}>
              {source}
            </span>
          )}
          <ChevronDown
            aria-hidden="true"
            className={cn(
              'size-4 transition-transform duration-180',
              open && 'rotate-180'
            )}
          />
        </span>
      </button>
      <div
        aria-hidden={!open}
        className={cn(
          'grid transition-[grid-template-rows] duration-180 motion-reduce:transition-none',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        )}
      >
        <div className="min-h-0 overflow-hidden">
          {selectableRoutes && <ZapperRouteOptions />}
          <ZapperQuoteFacts
            selectableRoutes={selectableRoutes}
            loading={loading}
            mode={mode}
          />
        </div>
      </div>
    </section>
  )
}

const ZAPPER_SLIPPAGE_OPTIONS = ['0.1%', '0.5%', '1%', '5%'] as const

export const ZapperSelectableQuoteMeta = ({
  mode,
  quoteReady,
  source,
}: {
  mode: 'Buy' | 'Sell'
  quoteReady: boolean
  source: string
}) => {
  const [open, setOpen] = useState(false)
  const [selectedSource, setSelectedSource] = useState(source)
  const [slippageTolerance, setSlippageTolerance] = useState('0.5%')

  useEffect(() => {
    if (!quoteReady) setOpen(false)
  }, [quoteReady])

  useEffect(() => {
    setSelectedSource(source)
  }, [source])

  return (
    <section
      data-testid="zapper-selectable-quote-meta"
      className="zapper-selectable-quote-meta relative z-10 bg-card py-3"
    >
      <div
        data-testid="zapper-selectable-quote-meta-row"
        className="zapper-selectable-quote-meta-row flex flex-col px-4"
      >
        <div
          data-testid="zapper-slippage-meta"
          className="flex h-11 min-w-0 w-full flex-1 items-center justify-between gap-3"
        >
          <span className="flex min-w-0 items-center gap-1">
            <span
              className={cn(
                v1Typography.supporting,
                roles.text.supporting,
                'whitespace-nowrap'
              )}
            >
              Slippage tolerance
            </span>
            <HelpTooltip
              accessibleLabel="About slippage tolerance"
              content="Permissible price deviation (%) between quoted and execution price"
            />
          </span>
          <Select
            value={slippageTolerance}
            onValueChange={setSlippageTolerance}
          >
            <SelectTrigger
              aria-label="Change slippage tolerance"
              className="w-[84px] shrink-0"
              size="compact"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {ZAPPER_SLIPPAGE_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div
          aria-hidden={!quoteReady}
          data-visible={quoteReady}
          data-testid="zapper-selectable-route-meta"
          className={cn(
            'zapper-selectable-route-meta w-full shrink-0 overflow-hidden transition-[max-height,max-width,opacity] duration-180 motion-reduce:transition-none',
            quoteReady
              ? 'max-h-11 opacity-100'
              : 'pointer-events-none max-h-0 opacity-0'
          )}
        >
          <div className="zapper-selectable-route-meta-content flex h-11 min-w-0 w-full items-center justify-between gap-2 overflow-hidden">
            <span className="flex min-w-0 items-center gap-2">
              <span
                className={cn(
                  v1Typography.supporting,
                  roles.text.supporting,
                  'whitespace-nowrap'
                )}
              >
                Via
              </span>
              <span
                className={cn(v1Typography.label, 'truncate whitespace-nowrap')}
              >
                {selectedSource}
              </span>
            </span>
            <IconButton
              aria-expanded={open}
              disabled={!quoteReady}
              icon={
                <ChevronDown
                  aria-hidden="true"
                  className={cn(
                    'transition-transform duration-180',
                    open && 'rotate-180'
                  )}
                />
              }
              label={open ? 'Hide quote details' : 'Show quote details'}
              size="micro"
              tabIndex={quoteReady ? 0 : -1}
              tone="secondary"
              onClick={() => setOpen((current) => !current)}
            />
          </div>
        </div>
      </div>
      <div
        aria-hidden={!open}
        className={cn(
          'grid transition-[grid-template-rows] duration-180 motion-reduce:transition-none',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <ZapperRouteOptions
            selectedSource={selectedSource}
            onSelect={setSelectedSource}
          />
          <ZapperQuoteFacts selectableRoutes loading={false} mode={mode} />
        </div>
      </div>
    </section>
  )
}

const CURRENT_ZAPPER_ROUTES = [
  {
    source: 'CoW Swap',
    amount: '990.00',
    value: '$990.00',
    best: true,
  },
  {
    source: 'Zap',
    amount: '988.40',
    value: '$988.40',
    best: false,
  },
  {
    source: 'Velora',
    amount: '986.70',
    value: '$986.70',
    best: false,
  },
] as const

const ZAPPER_OUTCOME_FINAL_VS_INPUT = {
  Buy: { value: '-1.36%', tone: 'realized-adverse' },
  Sell: { value: '-0.36%', tone: 'neutral' },
} as const satisfies Record<
  'Buy' | 'Sell',
  { value: string; tone: TransactionMetricTone }
>

const ZapperRouteOptions = ({
  onSelect,
  selectedSource: controlledSelectedSource,
}: {
  onSelect?: (source: string) => void
  selectedSource?: string
} = {}) => {
  const [internalSelectedSource, setInternalSelectedSource] =
    useState('CoW Swap')
  const selectedSource = controlledSelectedSource ?? internalSelectedSource

  const selectSource = (source: string) => {
    if (onSelect) {
      onSelect(source)
      return
    }

    setInternalSelectedSource(source)
  }

  return (
    <div
      aria-label="Quote routes"
      data-testid="zapper-route-options"
      role="group"
      className="grid grid-cols-1 gap-1 px-0 pb-3 pt-2"
    >
      {CURRENT_ZAPPER_ROUTES.map((route) => {
        const selected = route.source === selectedSource

        return (
          <button
            key={route.source}
            type="button"
            aria-label={`Use ${route.source} route`}
            aria-pressed={selected}
            className={cn(
              'flex min-h-11 min-w-0 items-center justify-between gap-3 rounded-full border px-4 py-2 text-left transition-colors duration-120',
              selected
                ? 'border-primary/30 bg-accent/60'
                : cn('border-border bg-card', roles.interaction.subtleHover),
              roles.focus.onContentInset
            )}
            onClick={() => selectSource(route.source)}
          >
            <span className="flex min-w-0 items-center gap-2">
              <span
                className={cn(
                  v1Typography.label,
                  'min-w-0 truncate',
                  selected && 'text-primary'
                )}
              >
                {route.source}
              </span>
              {route.best && (
                <LifecycleStatusPill role="success">Best</LifecycleStatusPill>
              )}
            </span>
            <span
              data-testid="zapper-route-value"
              className="flex shrink-0 flex-row items-center justify-end gap-1 whitespace-nowrap text-xs leading-4 tabular-nums"
            >
              <span className="font-medium text-foreground">
                {route.amount}
              </span>
              <span aria-hidden="true" className={roles.text.supporting}>
                ·
              </span>
              <span className={roles.text.supporting}>{route.value}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}

const ZapperQuoteFacts = ({
  selectableRoutes = false,
  loading,
  mode,
  outcome = false,
  outcomeKind = 'rfq',
  source = 'CoW Swap',
}: {
  selectableRoutes?: boolean
  loading: boolean
  mode: 'Buy' | 'Sell'
  outcome?: boolean
  outcomeKind?: 'atomic' | 'rfq'
  source?: string
}) => {
  const finalVsInput = ZAPPER_OUTCOME_FINAL_VS_INPUT[mode]

  return (
    <dl
      data-testid={
        outcome
          ? 'zapper-outcome-facts'
          : loading
            ? 'zapper-quote-details-loading'
            : undefined
      }
      className={cn(
        'grid gap-2 px-4 text-sm leading-5',
        selectableRoutes ? 'pb-2' : 'pb-4',
        outcome && 'pt-4'
      )}
    >
      {outcome ? (
        <>
          <QuoteFact
            label={outcomeKind === 'atomic' ? 'Executed via' : 'Filled via'}
            value={source}
          />
          <QuoteFact
            label="Used"
            value={mode === 'Buy' ? '1,000 USDC' : '990 CMC20'}
          />
          <QuoteFact label="Value received" value="$986.42" />
          <QuoteFact
            label="Final vs input"
            value={finalVsInput.value}
            valueTone={finalVsInput.tone}
          />
        </>
      ) : selectableRoutes ? (
        <>
          <QuoteFact
            label="Current price"
            value="1 USDC = 0.99 CMC20"
            help={{
              accessibleLabel: 'About current price',
              content: 'The current exchange rate between the tokens.',
            }}
          />
          <QuoteFact
            label="Projected slippage"
            value="1.00% ($10.00)"
            valueTone="neutral"
            help={{
              accessibleLabel: 'About projected slippage',
              content:
                'Projected difference (%) between the value you pay and the value you receive, at current prices.',
            }}
          />
          <QuoteFact
            label="Max slippage"
            value="2.00% ($20.00)"
            valueTone="neutral"
            help={{
              accessibleLabel: 'About maximum slippage',
              content:
                'Worst case: the value difference (%) if the trade executes at the minimum amount out allowed by your slippage tolerance.',
            }}
          />
          <QuoteFact
            label="Min Amount Out"
            value="980.10 CMC20"
            help={{
              accessibleLabel: 'About minimum amount out',
              content: 'The minimum amount of tokens you will receive.',
            }}
          />
        </>
      ) : (
        <>
          <QuoteFact
            label="Minimum output"
            value={
              loading ? (
                <Skeleton className="h-3 w-24" />
              ) : mode === 'Buy' ? (
                '980.10 CMC20'
              ) : (
                '976.56 USDC'
              )
            }
          />
          <QuoteFact
            label="Price impact"
            value={loading ? <Skeleton className="h-3 w-12" /> : '0.24%'}
            valueTone="neutral"
          />
          <QuoteFact
            label="Network estimate"
            value={loading ? <Skeleton className="h-3 w-14" /> : '$0.18'}
          />
          <QuoteFact
            label="Quote valid for"
            value={loading ? <Skeleton className="h-3 w-20" /> : '42 seconds'}
          />
        </>
      )}
    </dl>
  )
}

const ZAPPER_QUOTE_STAGES = [
  'Searching DEX liquidity',
  'Assembling different routes',
  'Evaluating slippage',
  'Reducing potential dust',
] as const

const ZAPPER_QUOTE_ANIMATION_SOURCE =
  'https://storage.reserve.org/loading5.webp'

export const ZapperQuoteLoading = () => {
  const [seconds, setSeconds] = useState(1)
  const [stage, setStage] = useState(0)

  useEffect(() => {
    const secondsTimer = window.setInterval(
      () => setSeconds((current) => current + 1),
      1000
    )
    const stageTimer = window.setInterval(
      () => setStage((current) => (current + 1) % ZAPPER_QUOTE_STAGES.length),
      3000
    )

    return () => {
      window.clearInterval(secondsTimer)
      window.clearInterval(stageTimer)
    }
  }, [])

  return (
    <div
      aria-label="Finding best quote"
      className="absolute inset-0 z-10 flex items-center justify-center overflow-hidden rounded-lg bg-card"
      role="status"
    >
      <div aria-hidden="true" className="absolute inset-0">
        <img
          data-testid="zapper-quote-animation"
          src={ZAPPER_QUOTE_ANIMATION_SOURCE}
          alt=""
          className="size-full object-cover dark:invert motion-reduce:hidden"
        />
      </div>
      <div
        data-testid="zapper-quote-status-pill"
        className="relative flex items-center gap-1 rounded-full border border-primary bg-card/95 px-3 py-2 text-sm leading-5 text-primary shadow-sm"
      >
        <Spinner data-testid="zapper-quote-spinner" size={16} />
        <span>{ZAPPER_QUOTE_STAGES[stage]}</span>
        <span
          data-testid="zapper-quote-counter"
          className="min-w-4 text-right tabular-nums text-muted-foreground"
        >
          {seconds}s
        </span>
      </div>
    </div>
  )
}

const QuoteFact = ({
  help,
  label,
  value,
  valueTone,
}: {
  help?: { accessibleLabel: string; content: ReactNode }
  label: string
  value: ReactNode
  valueTone?: TransactionMetricTone
}) => (
  <div
    data-testid="zapper-quote-fact"
    className="flex h-5 items-center justify-between gap-4"
  >
    <dt className={cn('flex items-center gap-1', roles.text.supporting)}>
      <span>{label}</span>
      {help && (
        <HelpTooltip
          accessibleLabel={help.accessibleLabel}
          content={help.content}
        />
      )}
    </dt>
    <dd className="flex h-5 items-center justify-end text-right font-medium tabular-nums text-foreground">
      {valueTone ? (
        <TransactionMetricValue tone={valueTone}>
          {value}
        </TransactionMetricValue>
      ) : (
        value
      )}
    </dd>
  </div>
)

export type ZapperPackageStateKind =
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

export const ZapperPackageState = ({
  currentPhase,
  mode,
  onDone,
  quoteReady,
  reviewActionDisposition,
  showDone = true,
  state,
}: {
  currentPhase?: 'pre-quote' | 'sourcing' | 'quote-received'
  mode: 'Buy' | 'Sell'
  onDone?: () => void
  quoteReady: boolean
  reviewActionDisposition?: 'blocking' | 'cautionary'
  showDone?: boolean
  state: ZapperPackageStateKind
}) => {
  const [highImpactAcknowledged, setHighImpactAcknowledged] = useState(false)
  const highImpactAcknowledgmentId = useId()

  useEffect(() => {
    if (state !== 'High-impact acknowledgment') {
      setHighImpactAcknowledged(false)
    }
  }, [state])

  if (state === 'Review' || state === 'Quote search') {
    if (currentPhase) {
      return (
        <Button className="w-full" disabled={currentPhase !== 'quote-received'}>
          {currentPhase === 'sourcing' ? 'Loading...' : `Market ${mode}`}
        </Button>
      )
    }

    const actionLabel =
      reviewActionDisposition === 'cautionary'
        ? mode === 'Buy'
          ? 'Buy anyway'
          : 'Sell anyway'
        : quoteReady
          ? mode === 'Buy'
            ? 'Buy CMC20'
            : 'Sell CMC20'
          : 'Updating quote…'

    return (
      <Button
        className="w-full"
        disabled={!quoteReady || reviewActionDisposition === 'blocking'}
        tone={
          reviewActionDisposition === 'cautionary' ? 'secondary' : 'primary'
        }
      >
        {actionLabel}
      </Button>
    )
  }

  if (state === 'High-impact acknowledgment') {
    return (
      <div className="space-y-3">
        <InlineMessage
          density="compact"
          icon={false}
          presentation="summary"
          tone="warning"
        >
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Checkbox
              checked={highImpactAcknowledged}
              className="relative after:absolute after:-inset-2 after:content-['']"
              id={highImpactAcknowledgmentId}
              onCheckedChange={setHighImpactAcknowledged}
            />
            <label
              className={cn(v1Typography.label, 'min-w-0 text-foreground')}
              htmlFor={highImpactAcknowledgmentId}
            >
              I understand the 5.8% price impact
            </label>
          </div>
          <HelpTooltip
            accessibleLabel="About high price impact"
            className="focus-visible:ring-offset-[var(--inline-message-surface)]"
            content="The price impact for this trade is very high. You will get significantly less value than expected."
          />
        </InlineMessage>
        <Button className="w-full" disabled={!highImpactAcknowledged}>
          {mode === 'Buy' ? 'Buy anyway' : 'Sell anyway'}
        </Button>
      </div>
    )
  }

  if (state === 'Quote failure') {
    return (
      <div className="space-y-3">
        <TransactionSummaryMessage
          title="Zaps are experiencing issues"
          detailLabel="About Zapper availability"
          detail="Sorry, we’re having a hard time finding a route that makes sense for you. Please try again in a bit."
          tone="warning"
        />
        <Button className="w-full">Refresh</Button>
      </div>
    )
  }

  if (state === 'RFQ recovery') {
    return (
      <div className="space-y-3">
        <TransactionSummaryMessage
          title="Order expired without a fill"
          detailLabel="About the expired order"
          detail={`No ${mode === 'Buy' ? 'purchase' : 'sale'} completed. Your amount and selected asset are preserved for a fresh quote.`}
          tone="warning"
        />
        <Button className="w-full">Get fresh quote</Button>
      </div>
    )
  }

  if (state === 'Native refund') {
    return (
      <div className="space-y-3">
        <InlineMessage tone="warning">
          <InlineMessageTitle>Quote expired</InlineMessageTitle>
          <InlineMessageDescription className="mt-1">
            The order expired without filling — CoW Protocol will{' '}
            <strong className="font-medium text-foreground">
              automatically refund your ETH within a few minutes.
            </strong>
          </InlineMessageDescription>
        </InlineMessage>
        <Button className="w-full">Get fresh quote</Button>
      </div>
    )
  }

  if (state === 'Atomic outcome') {
    return (
      <ActionGroup className="w-full">
        <Button
          asChild
          className="flex-1"
          tone="secondary"
          trailingIcon={<ArrowUpRight />}
        >
          <a
            href={ZAPPER_ATOMIC_TRANSACTION.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            View transaction
            <span className="sr-only"> on BaseScan (opens in a new tab)</span>
          </a>
        </Button>
        {showDone ? (
          <Button className="flex-1" onClick={onDone}>
            Done
          </Button>
        ) : null}
      </ActionGroup>
    )
  }

  if (state === 'RFQ outcome') {
    return (
      <ActionGroup className="w-full">
        <Button
          asChild
          className="flex-1"
          tone="secondary"
          trailingIcon={<ArrowUpRight />}
        >
          <a
            href={ZAPPER_RFQ_ORDER.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            View order
            <span className="sr-only">
              {' '}
              on CoW Explorer (opens in a new tab)
            </span>
          </a>
        </Button>
        {showDone ? (
          <Button className="flex-1" onClick={onDone}>
            Done
          </Button>
        ) : null}
      </ActionGroup>
    )
  }

  if (state === 'Approval') {
    return <Button className="w-full">Approve use of USDC</Button>
  }

  if (state === 'Sign order') {
    return (
      <Button className="w-full" loading>
        <Trans>Pending, sign in wallet</Trans>
      </Button>
    )
  }

  if (state === 'Atomic confirmation') {
    return (
      <Button className="w-full" loading>
        Confirming transaction
      </Button>
    )
  }

  return (
    <Button className="w-full" loading>
      Waiting for order to fill…
    </Button>
  )
}
