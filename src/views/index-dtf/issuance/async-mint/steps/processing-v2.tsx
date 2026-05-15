import TokenLogo from '@/components/token-logo'
import TokenLogoWithChain from '@/components/token-logo/TokenLogoWithChain'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { balancesAtom, chainIdAtom } from '@/state/atoms'
import {
  indexDTFAtom,
  indexDTFBasketAtom,
  indexDTFPriceAtom,
} from '@/state/dtf/atoms'
import { formatCurrency, formatTokenAmount, getTimerFormat } from '@/utils'
import { OrderStatus } from '@cowprotocol/cow-sdk'
import { useAtomValue, useSetAtom } from 'jotai'
import { Check, Loader, RefreshCw, Settings } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Address, formatUnits } from 'viem'
import {
  ASYNC_MINT_BUFFER,
  allOrdersFulfilledAtom,
  collateralAllocationAtom,
  currentOrdersAtom,
  failedOrdersAtom,
  folioDetailsAtom,
  inputTokenAtom,
  mintAmountAtom,
  mintStrategyAtom,
  orderIdsAtom,
  ordersCreatedAtAtom,
  pendingOrdersAtom,
  slippageAtom,
  tokenPricesAtom,
  walletBalancesAtom,
  wizardStepAtom,
} from '../atoms'
import MintExecute from '../components/mint-execute'
import OrderRow from '../components/order-row'
import { useMintQuotes } from '../hooks/use-mint-quotes'
import { useOrderStatus } from '../hooks/use-order-status'
import { checkMintFeasibility } from '../hooks/use-recovery'
import { useSubmitOrders } from '../hooks/use-submit-orders'

const formatTokenBalance = (value: bigint, decimals: number) =>
  formatTokenAmount(Number(formatUnits(value, decimals)))

const ORDER_VALIDITY_FALLBACK_SECONDS = 10 * 60
const WAITING_NOTICE_SECONDS = 2 * 60

const OrderStatusWatcher = ({ orderId }: { orderId: string }) => {
  useOrderStatus({ orderId })
  return null
}

const ProcessingV2 = () => {
  const setStep = useSetAtom(wizardStepAtom)
  const indexDTF = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)
  const dtfPrice = useAtomValue(indexDTFPriceAtom)
  const inputToken = useAtomValue(inputTokenAtom)
  const mintAmount = useAtomValue(mintAmountAtom)
  const strategy = useAtomValue(mintStrategyAtom)
  const orderIds = useAtomValue(orderIdsAtom)
  const ordersCreatedAt = useAtomValue(ordersCreatedAtAtom)
  const allFulfilled = useAtomValue(allOrdersFulfilledAtom)
  const failedOrders = useAtomValue(failedOrdersAtom)
  const pendingOrders = useAtomValue(pendingOrdersAtom)
  const currentOrders = useAtomValue(currentOrdersAtom)
  const basket = useAtomValue(indexDTFBasketAtom)
  const walletBalances = useAtomValue(walletBalancesAtom)
  const tokenPrices = useAtomValue(tokenPricesAtom)
  const allocation = useAtomValue(collateralAllocationAtom)
  const folioDetails = useAtomValue(folioDetailsAtom)
  const balances = useAtomValue(balancesAtom)
  const slippage = useAtomValue(slippageAtom)

  const [now, setNow] = useState(() => Date.now())
  const [showOrderDetails, setShowOrderDetails] = useState(false)

  const { refetch, isFetching } = useMintQuotes()
  const { submit: retrySubmit, isPending: isRetrying } = useSubmitOrders(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const createdAtMs = ordersCreatedAt
    ? new Date(ordersCreatedAt).getTime()
    : now
  const fallbackDeadlineMs =
    createdAtMs + ORDER_VALIDITY_FALLBACK_SECONDS * 1000
  const pendingDeadlines = pendingOrders
    .map((order) => Number(order.validTo) * 1000)
    .filter((deadline) => Number.isFinite(deadline) && deadline > now)
  const acquisitionDeadlineMs = pendingDeadlines.length
    ? Math.min(...pendingDeadlines)
    : fallbackDeadlineMs
  const acquisitionTotalSeconds = Math.max(
    1,
    Math.ceil((acquisitionDeadlineMs - createdAtMs) / 1000)
  )
  const acquisitionRemainingSeconds = Math.max(
    0,
    Math.ceil((acquisitionDeadlineMs - now) / 1000)
  )
  const acquisitionElapsedSeconds = Math.max(
    0,
    acquisitionTotalSeconds - acquisitionRemainingSeconds
  )
  const acquisitionProgress = Math.min(
    100,
    (acquisitionElapsedSeconds / acquisitionTotalSeconds) * 100
  )
  const showWaitingNotice =
    acquisitionElapsedSeconds >= WAITING_NOTICE_SECONDS &&
    acquisitionRemainingSeconds > 0
  const orderTotal = orderIds.length
  const completedOrderCount = currentOrders.filter(
    (order) => order.status === OrderStatus.FULFILLED
  ).length
  const activeOrderCount = Math.max(orderTotal - completedOrderCount, 0)
  const needsOrderAttention =
    failedOrders.length > 0 ||
    (orderTotal > 0 && acquisitionRemainingSeconds === 0 && !allFulfilled)

  useEffect(() => {
    if (needsOrderAttention) {
      setShowOrderDetails(true)
    }
  }, [needsOrderAttention])

  const allResolved = failedOrders.length > 0 && pendingOrders.length === 0
  const canStillMintTarget = useMemo(() => {
    if (!allResolved || !folioDetails) return true
    return checkMintFeasibility(
      walletBalances,
      folioDetails.mintValues,
      folioDetails.assets
    )
  }, [allResolved, walletBalances, folioDetails])

  const isSimpleRetry = allResolved && canStillMintTarget
  const isSeriousFailure = allResolved && !canStillMintTarget

  const parsedAmount = Number(mintAmount)
  const dtfAmount = dtfPrice
    ? (parsedAmount / dtfPrice) * (1 - ASYNC_MINT_BUFFER)
    : 0
  const dtfValue = dtfPrice ? dtfAmount * dtfPrice : 0
  const spreadPct =
    parsedAmount > 0 ? ((parsedAmount - dtfValue) / parsedAmount) * 100 : 0
  const walletCollateralUsd = Object.entries(allocation).reduce(
    (sum, [address, alloc]) => {
      if (alloc.fromWallet === 0n) return sum
      const token = basket?.find(
        (item) => item.address.toLowerCase() === address.toLowerCase()
      )
      if (!token) return sum
      const price = tokenPrices[address.toLowerCase() as Address] ?? 0
      return sum + Number(formatUnits(alloc.fromWallet, token.decimals)) * price
    },
    0
  )
  const hasWalletCollateralUsed = walletCollateralUsd > 0
  const inputUsedUsd = Math.max(parsedAmount - walletCollateralUsd, 0)
  const slippagePct = Number(slippage) / 10000
  const bufferReturn = inputUsedUsd * (ASYNC_MINT_BUFFER + slippagePct)
  const mintFee = indexDTF?.mintingFee
    ? (indexDTF.mintingFee * 100).toFixed(2)
    : '0'
  const inputBalanceValue = balances[inputToken.address]?.value ?? 0n
  const isTotalUsdInputMode = strategy !== 'single'
  const inputSourceTokens = useMemo(() => {
    if (!isTotalUsdInputMode || !basket) return [inputToken]

    const walletSources = basket.filter((token) => {
      const normalized = token.address.toLowerCase() as Address
      const alloc = allocation[token.address] ?? allocation[normalized]

      return (alloc?.fromWallet ?? 0n) > 0n
    })

    return inputUsedUsd > 0 || walletSources.length === 0
      ? [inputToken, ...walletSources]
      : walletSources
  }, [allocation, basket, inputToken, inputUsedUsd, isTotalUsdInputMode])
  const visibleInputSourceTokens = inputSourceTokens.slice(0, 3)
  const hiddenInputSourceTokenCount = Math.max(inputSourceTokens.length - 3, 0)

  const getWalletSourceContext = (
    token: NonNullable<typeof basket>[number],
    usedAmount: bigint,
    usedUsd: number,
    explanation?: string
  ) => {
    const normalized = token.address.toLowerCase() as Address
    const walletBalance = walletBalances[normalized] ?? 0n
    const walletBalanceText = formatTokenBalance(walletBalance, token.decimals)
    const usedAmountText = formatTokenBalance(usedAmount, token.decimals)
    const weightPct =
      parsedAmount > 0 ? Math.min((usedUsd / parsedAmount) * 100, 100) : 0
    const weightText = Number.isInteger(weightPct)
      ? weightPct.toFixed(0)
      : weightPct.toFixed(2)

    if (explanation === 'Token at its maximum weight') {
      return {
        title: 'Token at its maximum weight',
        description: `${token.symbol} is ${weightText}% of this ${indexDTF?.token.symbol}, so we can use up to $${formatCurrency(usedUsd)} (${usedAmountText} ${token.symbol}) of your ${walletBalanceText} ${token.symbol} for this mint.`,
      }
    }

    if (explanation === 'Using your full balance') {
      return {
        title: 'Using your full balance',
        description: `You hold ${walletBalanceText} ${token.symbol}, which is within this token's basket weight, so we're using all of it.`,
      }
    }

    if (explanation === 'Using custom amount') {
      return {
        title: 'Using custom amount',
        description: `Using your selected ${usedAmountText} ${token.symbol} for this mint.`,
      }
    }

    return {
      title: 'Using wallet collateral',
      description: `${usedAmountText} ${token.symbol} is being used from your wallet for this mint.`,
    }
  }

  const orderSummaryText =
    orderTotal === 1
      ? activeOrderCount === 0
        ? '1 order complete'
        : '1 active order'
      : `${completedOrderCount} of ${orderTotal} orders complete`
  const orderDetailsLabel = showOrderDetails
    ? 'Hide order details'
    : needsOrderAttention
      ? 'Review order details'
      : orderTotal === 1
        ? 'View order details'
        : 'View collateral orders'
  const showOrderDetailToggle = !isTotalUsdInputMode && orderTotal > 0
  const showInputSourcesPanel = isTotalUsdInputMode && orderTotal === 0
  const showOrderDetailsPanel =
    (isTotalUsdInputMode && orderTotal > 0) || showOrderDetails
  const showMintProcessPanel = !showInputSourcesPanel && !showOrderDetailsPanel

  const statusContent = (() => {
    if (orderIds.length === 0) {
      return (
        <>
          <div className="rounded-2xl bg-muted/60 p-3 text-sm text-muted-foreground font-light">
            No collateral swaps are needed. Your wallet already has the required
            basket tokens.
          </div>
          <MintExecute />
        </>
      )
    }

    if (allFulfilled) {
      return (
        <>
          <div className="rounded-xl border border-primary/25 bg-primary/10 px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3 text-primary">
                <div className="shrink-0 rounded-full border border-primary p-1.5">
                  <Check size={16} strokeWidth={1.5} />
                </div>
                <div className="min-w-0">
                  <div className="font-medium">Collateral acquired</div>
                  <div className="text-sm font-light text-muted-foreground">
                    {orderSummaryText}
                  </div>
                </div>
              </div>
              {showOrderDetailToggle && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 rounded-full"
                  onClick={() => setShowOrderDetails((value) => !value)}
                >
                  {orderDetailsLabel}
                </Button>
              )}
            </div>
          </div>
          <MintExecute />
        </>
      )
    }

    if (isSeriousFailure) {
      return (
        <>
          <div className="rounded-2xl bg-orange-500/10 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-medium text-orange-500">
                  Your order needs attention
                </div>
                <div className="text-sm text-muted-foreground">
                  {failedOrders.length} of {orderTotal} orders need review.
                </div>
              </div>
              {showOrderDetailToggle && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 rounded-full"
                  onClick={() => setShowOrderDetails((value) => !value)}
                >
                  {orderDetailsLabel}
                </Button>
              )}
            </div>
          </div>
          <Button
            size="lg"
            className="w-full h-[49px] rounded-[12px]"
            onClick={() => setStep('recovery-options')}
          >
            Review options
          </Button>
        </>
      )
    }

    if (isSimpleRetry) {
      return (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-900/20">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium">Prices have moved</div>
              <div className="text-sm font-light text-muted-foreground">
                {failedOrders.length} of {orderTotal} orders did not fill.
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {showOrderDetailToggle && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => setShowOrderDetails((value) => !value)}
                >
                  {orderDetailsLabel}
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                className="rounded-full"
                onClick={() => retrySubmit()}
                disabled={isRetrying}
              >
                {isRetrying ? 'Signing...' : 'Accept new quotes'}
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="overflow-hidden rounded-xl bg-muted/60">
        <div className="bg-primary/20 h-[2px] w-full">
          <div
            className="bg-primary h-full transition-all duration-1000"
            style={{
              width: `${acquisitionProgress}%`,
            }}
          />
        </div>
        <div className="px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3 text-primary">
              <div className="shrink-0 rounded-full border border-primary p-1.5">
                <Loader
                  size={16}
                  strokeWidth={1.5}
                  className="animate-spin-slow"
                />
              </div>
              <div className="min-w-0">
                <div className="font-medium">Acquiring collateral</div>
                <div className="text-sm font-light text-muted-foreground">
                  {orderSummaryText}
                </div>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              {showOrderDetailToggle && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => setShowOrderDetails((value) => !value)}
                >
                  {orderDetailsLabel}
                </Button>
              )}
              <div className="text-right">
                <div className="text-muted-foreground text-xs font-light">
                  Resolves by
                </div>
                <div className="text-muted-foreground text-sm font-medium">
                  {getTimerFormat(acquisitionRemainingSeconds)}
                </div>
              </div>
            </div>
          </div>
          {(showWaitingNotice || acquisitionRemainingSeconds === 0) && (
            <div className="mt-3 border-t border-border/60 pt-3 text-sm font-light text-muted-foreground">
              {acquisitionRemainingSeconds === 0
                ? 'Checking final order status...'
                : 'If an order does not fill before expiry, you can refresh quotes and try again.'}
            </div>
          )}
        </div>
      </div>
    )
  })()

  return (
    <div className="bg-secondary rounded-3xl p-1 w-full lg:min-h-[calc(100vh-100px)]">
      {orderIds.map((id) => (
        <OrderStatusWatcher key={id} orderId={id} />
      ))}

      <div className="grid w-full gap-0.5 lg:min-h-[calc(100vh-108px)] lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.95fr)] lg:grid-rows-[auto_1fr] lg:items-stretch">
        <div className="px-5 pt-5 pb-3 flex items-start justify-between gap-4 lg:col-start-1 lg:row-start-1">
          <Tabs value="mint">
            <TabsList className="h-9 px-0.5">
              <TabsTrigger
                value="mint"
                className="flex items-center gap-1.5 px-3 data-[state=active]:text-primary"
              >
                Mint
              </TabsTrigger>
              <TabsTrigger
                value="redeem"
                disabled
                className="flex items-center gap-1.5 px-3 data-[state=active]:text-primary"
              >
                Redeem
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="min-w-0 flex flex-col gap-0.5 lg:col-start-1 lg:row-start-2 lg:h-full">
          <div className="bg-card rounded-2xl p-2">
            <div className="px-4 py-3 flex items-center justify-between">
              <div>
                <h3 className="font-medium text-base">Mint amount</h3>
                <p className="text-sm text-muted-foreground font-light">
                  {isTotalUsdInputMode
                    ? 'Inputs are locked while collateral acquisition is in progress.'
                    : `${inputToken.symbol} amount is locked while collateral acquisition is in progress.`}
                </p>
              </div>
            </div>
            <div className="rounded-xl border border-border/70 bg-transparent px-4 py-3">
              <div className="text-sm text-muted-foreground mb-3">
                You provide
              </div>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex h-8 min-w-0 items-start">
                    {isTotalUsdInputMode && (
                      <span className="text-[32px] font-light leading-8 text-muted-foreground">
                        $
                      </span>
                    )}
                    <div className="flex h-8 min-w-0 items-center text-[32px] font-light leading-8 text-primary">
                      {formatCurrency(parsedAmount)}
                    </div>
                  </div>
                  <div className="mt-2 text-sm font-light text-muted-foreground">
                    {hasWalletCollateralUsed
                      ? `$${formatCurrency(inputUsedUsd)} ${inputToken.symbol} + $${formatCurrency(walletCollateralUsd)} Collateral`
                      : `$${formatCurrency(parsedAmount)} ${inputToken.symbol}`}
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2">
                  {isTotalUsdInputMode ? (
                    <div className="flex h-9 max-w-[260px] items-center justify-end overflow-hidden pl-4">
                      {visibleInputSourceTokens.map((token, index) => (
                        <span
                          key={token.address}
                          className={cn(
                            'flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-card bg-background',
                            index > 0 && '-ml-4'
                          )}
                        >
                          <TokenLogo
                            address={token.address}
                            symbol={token.symbol}
                            chain={chainId}
                            size="xl"
                          />
                        </span>
                      ))}
                      {hiddenInputSourceTokenCount > 0 && (
                        <span className="flex size-9 -ml-4 shrink-0 items-center justify-center rounded-full border-2 border-card bg-background text-xs font-medium">
                          +{hiddenInputSourceTokenCount}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="flex h-8 items-center gap-2">
                      <TokenLogo
                        address={inputToken.address}
                        symbol={inputToken.symbol}
                        chain={chainId}
                        size="xl"
                      />
                      <span className="text-[32px] font-light leading-8 text-muted-foreground">
                        {inputToken.symbol}
                      </span>
                    </div>
                  )}
                  <span className="text-sm font-light whitespace-nowrap text-muted-foreground">
                    Locked
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-2 flex flex-col lg:flex-1">
            <div className="flex items-start justify-between gap-4 px-4 py-3">
              <div>
                <h3 className="font-medium text-base">Mint progress</h3>
                <p className="text-sm text-muted-foreground font-light">
                  Collateral orders and final mint execution happen here.
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button className="rounded-[12px] border border-border/70 bg-transparent h-8 w-8 flex items-center justify-center transition-colors hover:bg-primary hover:text-primary-foreground">
                  <Settings size={16} />
                </button>
                <button
                  className="rounded-[12px] border border-border/70 bg-transparent h-8 w-8 flex items-center justify-center transition-colors hover:bg-primary hover:text-primary-foreground"
                  onClick={() => refetch()}
                  disabled={isFetching}
                >
                  <RefreshCw
                    size={16}
                    className={isFetching ? 'animate-spin' : ''}
                  />
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-border/70 bg-transparent px-4 py-3">
              <div className="text-sm text-muted-foreground mb-3">
                Quoted receive
              </div>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <span className="text-[32px] font-light text-primary leading-8">
                    {formatTokenAmount(dtfAmount)}
                  </span>
                  <div className="text-sm text-muted-foreground font-light mt-2 whitespace-nowrap">
                    ${formatCurrency(dtfValue)} (-{spreadPct.toFixed(2)}%)
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end">
                  <div className="flex items-center gap-2">
                    <TokenLogo
                      address={indexDTF?.id}
                      symbol={indexDTF?.token.symbol}
                      chain={chainId}
                      size="xl"
                    />
                    <span className="text-[32px] font-light text-muted-foreground leading-8">
                      {indexDTF?.token.symbol}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 px-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Price impact</span>
                <span
                  className={cn(
                    'font-medium',
                    spreadPct > 2 ? 'text-destructive' : 'text-foreground'
                  )}
                >
                  -{spreadPct.toFixed(2)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Max slippage</span>
                <span className="font-medium">
                  {(Number(slippage) / 100).toFixed(2)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Minting fee</span>
                <span className="font-medium">{mintFee}%</span>
              </div>
            </div>

            <div className="mt-5 lg:mt-auto flex flex-col gap-3">
              {statusContent}
            </div>
          </div>
        </div>

        <div className="bg-background rounded-2xl p-2 lg:col-start-2 lg:row-start-2 lg:flex lg:h-full lg:flex-col">
          {showMintProcessPanel ? (
            <div className="flex min-h-[360px] flex-1 flex-col">
              <div className="px-4 py-3">
                <h3 className="font-medium text-base">Mint process</h3>
                <p className="text-sm text-muted-foreground font-light">
                  A simple view of what happens after the quote is accepted.
                </p>
              </div>

              <div className="flex flex-1 items-center px-4 py-8">
                <div className="w-full max-w-[380px]">
                  <div className="relative flex flex-col gap-6">
                    <div className="absolute bottom-9 left-[17px] top-9 w-px bg-border" />
                    {[
                      {
                        title: 'Confirm inputs',
                        description:
                          'Your amount, receive estimate, slippage, and fee are locked for review.',
                      },
                      {
                        title: 'Acquire basket collateral',
                        description:
                          'Required basket tokens are prepared before the mint executes.',
                      },
                      {
                        title: `Mint ${indexDTF?.token.symbol ?? 'DTF'}`,
                        description:
                          'Once collateral is ready, the final mint transaction creates your token.',
                      },
                    ].map((step, index) => (
                      <div
                        key={step.title}
                        className="relative flex items-start gap-4"
                      >
                        <div className="relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-background text-sm font-medium text-muted-foreground">
                          {index + 1}
                        </div>
                        <div className="min-w-0 pt-0.5">
                          <div className="font-medium text-base">
                            {step.title}
                          </div>
                          <div className="mt-0.5 text-sm font-light text-muted-foreground">
                            {step.description}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {orderIds.length > 0 && (
                    <div className="mt-8 rounded-xl border border-border/70 px-4 py-3">
                      <div className="text-sm font-medium">
                        Order details are hidden
                      </div>
                      <div className="text-sm font-light text-muted-foreground">
                        Use the progress tracker to inspect collateral orders.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : showInputSourcesPanel ? (
            <>
              <div className="px-4 py-3">
                <h3 className="font-medium text-base">Input sources</h3>
                <p className="text-sm text-muted-foreground font-light">
                  Collateral is used first. {inputToken.symbol} covers the
                  remainder.
                </p>
              </div>

              <ScrollArea className="h-[min(620px,calc(100vh-290px))] min-h-[360px] lg:h-auto lg:min-h-0 lg:flex-1">
                <div className="flex min-h-full flex-col gap-0.5 pr-2">
                  <div className="px-4 py-3">
                    <div className="flex items-center gap-4">
                      <TokenLogoWithChain
                        address={inputToken.address}
                        symbol={inputToken.symbol}
                        chain={chainId}
                        size="xl"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-base">
                            {inputToken.symbol}
                          </span>
                          <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                            Always included
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground font-light">
                          Wallet{' '}
                          {formatTokenBalance(
                            inputBalanceValue,
                            inputToken.decimals
                          )}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-base font-medium">
                          ${formatCurrency(inputUsedUsd)}
                        </div>
                        <div className="text-sm text-muted-foreground font-light">
                          {hasWalletCollateralUsed
                            ? 'Remainder + buffer'
                            : 'Full amount + buffer'}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 max-w-[46ch] text-sm">
                      <div className="font-normal text-foreground">
                        {hasWalletCollateralUsed
                          ? 'Covering the remainder'
                          : `${inputToken.symbol} covers the mint`}
                      </div>
                      <div className="text-muted-foreground font-light">
                        Up to {formatCurrency(inputUsedUsd)} {inputToken.symbol}{' '}
                        will be used to{' '}
                        {hasWalletCollateralUsed
                          ? 'complete'
                          : 'cover the full'}{' '}
                        mint. Up to ${formatCurrency(bufferReturn)}{' '}
                        {inputToken.symbol} may be returned.
                      </div>
                    </div>
                  </div>

                  {basket
                    ?.filter((token) => {
                      const normalized = token.address.toLowerCase() as Address
                      const alloc =
                        allocation[token.address] ?? allocation[normalized]
                      return alloc && alloc.fromWallet > 0n
                    })
                    .map((token) => {
                      const normalized = token.address.toLowerCase() as Address
                      const alloc =
                        allocation[token.address] ?? allocation[normalized]
                      const usedAmount = alloc?.fromWallet ?? 0n
                      const usedUsd =
                        Number(formatUnits(usedAmount, token.decimals)) *
                        (tokenPrices[normalized] ?? 0)

                      const sourceContext = getWalletSourceContext(
                        token,
                        usedAmount,
                        usedUsd,
                        alloc?.explanation
                      )

                      return (
                        <div key={token.address} className="px-4 py-3">
                          <div className="flex items-center gap-4">
                            <TokenLogoWithChain
                              address={token.address}
                              symbol={token.symbol}
                              chain={chainId}
                              size="xl"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-base truncate">
                                {token.name || token.symbol}
                              </div>
                              <div className="text-sm text-muted-foreground font-light truncate">
                                {token.symbol} used for mint
                              </div>
                            </div>
                            <div className="text-right min-w-[156px]">
                              <div className="text-base font-medium">
                                ${formatCurrency(usedUsd)}
                              </div>
                              <div className="text-sm text-muted-foreground font-light">
                                {formatTokenBalance(usedAmount, token.decimals)}{' '}
                                {token.symbol}
                              </div>
                            </div>
                          </div>
                          <div className="mt-2 max-w-[46ch] text-sm">
                            <div className="font-normal text-foreground">
                              {sourceContext.title}
                            </div>
                            <div className="text-muted-foreground font-light">
                              {sourceContext.description}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </ScrollArea>
            </>
          ) : (
            <ScrollArea className="h-[min(620px,calc(100vh-290px))] min-h-[360px] lg:h-auto lg:min-h-0 lg:flex-1">
              <div className="flex min-h-full flex-col gap-0.5 pr-2">
                <div className="px-4 py-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-medium text-base">
                        Collateral orders
                      </h3>
                      <p className="text-sm text-muted-foreground font-light">
                        {isTotalUsdInputMode
                          ? `${inputToken.symbol} is being converted into the remaining basket collateral.`
                          : orderSummaryText}
                      </p>
                    </div>
                    {showOrderDetailToggle && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="shrink-0 rounded-full"
                        onClick={() => setShowOrderDetails(false)}
                      >
                        Hide details
                      </Button>
                    )}
                  </div>
                </div>

                {orderIds.length > 0 && (
                  <div className="px-4 py-3">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="text-sm font-light text-muted-foreground">
                        {orderSummaryText}
                      </div>
                      <div className="text-sm font-light text-muted-foreground">
                        {activeOrderCount > 0
                          ? `${activeOrderCount} active`
                          : 'Ready to mint'}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      {orderIds.map((id) => (
                        <OrderRow key={id} orderId={id} disableFetch />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProcessingV2
