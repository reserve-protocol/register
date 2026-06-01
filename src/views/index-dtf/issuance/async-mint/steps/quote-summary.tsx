import TokenLogo from '@/components/token-logo'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { TransactionButtonContainer } from '@/components/ui/transaction-button'
import { notifyError } from '@/hooks/useNotification'
import { cn } from '@/lib/utils'
import { chainIdAtom, walletAtom } from '@/state/atoms'
import { wagmiConfig } from '@/state/chain'
import {
  indexDTFAtom,
  indexDTFBasketAtom,
  indexDTFPriceAtom,
} from '@/state/dtf/atoms'
import { formatCurrency, formatTokenAmount } from '@/utils'
import {
  AsyncZapExecutionStep,
  fetchTokenPrices,
} from '@reserve-protocol/async-zap-sdk'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { Info, Loader2, Pencil, RefreshCw } from 'lucide-react'
import { useEffect } from 'react'
import { Address, erc20Abi, formatUnits } from 'viem'
import { readContracts } from 'wagmi/actions'
import { useAsyncZap } from '../async-zap-context'
import LegRow from '../components/leg-row'
import { usePriceImpact } from '../hooks/use-price-impact'
import { useWizardBalances } from '../hooks/use-wizard-balances'
import { formatPriceImpact, HIGH_PRICE_IMPACT } from '../quote-utils'
import {
  dustStartBalancesAtom,
  inputTokenAtom,
  mintAmountAtom,
  redeemAmountAtom,
  slippageAtom,
  useExistingBalancesAtom,
  wizardStepAtom,
} from '../atoms'

// Submit-button label while the execution lifecycle is running (signing happens
// at the button level; the per-leg orders carry their own status pills).
const EXECUTION_BUTTON_LABELS: Partial<Record<AsyncZapExecutionStep, string>> = {
  idle: 'Preparing…',
  finalized: 'Preparing…',
  submitting_and_signing: 'Sign in your wallet…',
  waiting_submit_and_sign: 'Confirming…',
  waiting_orders: 'Filling orders…',
  finishing: 'Sign mint…',
  waiting_finish: 'Completing mint…',
}

const QuoteSummary = () => {
  const setStep = useSetAtom(wizardStepAtom)
  const indexDTF = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)
  const inputToken = useAtomValue(inputTokenAtom)
  const mintAmount = useAtomValue(mintAmountAtom)
  const redeemAmount = useAtomValue(redeemAmountAtom)
  const slippage = useAtomValue(slippageAtom)
  const account = useAtomValue(walletAtom)
  const basket = useAtomValue(indexDTFBasketAtom)
  const [useExistingBalances, setUseExistingBalances] = useAtom(
    useExistingBalancesAtom
  )
  const setDustStart = useSetAtom(dustStartBalancesAtom)
  const { balanceOf } = useWizardBalances()

  const { quote, quoteQuery, execution, operation, legStates } = useAsyncZap()
  const isMint = operation === 'mint'

  // Only CoW swap legs are shown; direct/balance-covered legs aren't swaps.
  const cowLegStates = legStates.filter(
    (ls) => ls.leg.kind === 'cowswap' && ls.leg.assetAmount > 0n
  )
  const legsResolving = cowLegStates.some(
    (ls) => ls.status === 'pending' || ls.status === 'idle'
  )
  // Legs not computed yet but the base quote is still being built.
  const initialLoading = legStates.length === 0 && quoteQuery.isFetching
  // Any quote work in flight: drives aggregate skeletons + the submit spinner.
  const quotesLoading = initialLoading || legsResolving

  const { byLeg: legImpacts, aggregate: aggregateImpact } = usePriceImpact({
    legs: cowLegStates.map((ls) => ls.leg),
    quoteToken: inputToken,
    chainId,
  })

  // What the user provides (pay side).
  const payAmountStr = isMint ? mintAmount : redeemAmount
  const parsedPay = Number(payAmountStr) || 0
  const inputBalanceAmount = Number(
    formatUnits(balanceOf(inputToken.address), inputToken.decimals)
  )
  const dtfBalanceAmount = indexDTF
    ? Number(formatUnits(balanceOf(indexDTF.id), 18))
    : 0
  const payBalance = isMint ? inputBalanceAmount : dtfBalanceAmount
  // Only meaningful before execution: once it starts, the balance drops as the
  // DTF burns/tokens move, which would otherwise flip this to a false error.
  const exceedsBalance = parsedPay > payBalance && execution.step === 'idle'
  // Redeem with "use my wallet balances" at 0 shares: convert held basket
  // tokens to the quote token (no DTF redeemed).
  const isConvertHeld = !isMint && useExistingBalances && parsedPay === 0
  const isValidAmount = parsedPay > 0 || isConvertHeld

  // Collaterals the user already holds (only those with balance > 0). On redeem
  // the input/output token (USDC/USDT) isn't a token we "use", so drop it.
  const heldCollaterals = (basket ?? [])
    .filter(
      (token) =>
        isMint ||
        token.address.toLowerCase() !== inputToken.address.toLowerCase()
    )
    .map((token) => ({ token, value: balanceOf(token.address) }))
    .filter(({ value }) => value > 0n)

  // Quote-derived amounts (folio shares = 18 dec; quoteToken in its decimals).
  const sharesAmount = quote ? Number(formatUnits(quote.shares, 18)) : 0

  // Wallet-sourced output token (e.g. USDC/USDT you already hold, when it's a
  // basket collateral) isn't "received" — only count the quote token coming
  // from the DTF redemption + swaps.
  const walletSourcedQuoteToken = (quote?.legs ?? [])
    .filter(
      (leg) =>
        leg.asset.address.toLowerCase() === inputToken.address.toLowerCase()
    )
    .reduce((sum, leg) => sum + leg.balanceUsed, 0n)
  const receivedQuoteTokenAmount = quote
    ? Number(
        formatUnits(
          quote.totalQuoteTokenAmount - walletSourcedQuoteToken,
          inputToken.decimals
        )
      )
    : 0

  // Receive side.
  const receiveAmount = isMint ? sharesAmount : receivedQuoteTokenAmount
  const receiveSymbol = isMint ? indexDTF?.token.symbol : inputToken.symbol
  const receiveAddress = isMint ? indexDTF?.id : inputToken.address

  // USD value of each side, shown under the amounts in the quote review. The
  // input token (USDC/USDT) is priced via the Reserve API; the DTF shares via
  // the folio price.
  const dtfPrice = useAtomValue(indexDTFPriceAtom)
  const queryClient = useQueryClient()
  const { data: inputPrices } = useQuery({
    queryKey: ['async-mint/input-price', chainId, inputToken.address],
    queryFn: () =>
      fetchTokenPrices(queryClient, [
        { chainId, tokenAddress: inputToken.address as Address },
      ]),
    staleTime: 30_000,
    enabled: !!inputToken.address,
  })
  const inputTokenPrice = inputPrices?.[0]?.price ?? 1
  const provideValueUsd = isMint
    ? parsedPay * inputTokenPrice
    : parsedPay * (dtfPrice ?? 0)
  const receiveValueUsd = isMint
    ? receiveAmount * (dtfPrice ?? 0)
    : receiveAmount * inputTokenPrice

  const hasFailedLegs = cowLegStates.some(
    (ls) => ls.status === 'error' || !!ls.leg.error
  )
  const quoteErrors = quote?.errors ?? []

  const isExecuting =
    execution.step !== 'idle' &&
    execution.step !== 'complete' &&
    execution.step !== 'error'
  const isError = execution.step === 'error'
  // Once submitted, the right-hand "quotes" panel reads as live orders.
  const executionStarted =
    isExecuting || isError || Object.keys(execution.ordersByLegId).length > 0

  // The whole lifecycle runs in place on this screen; only completion advances.
  useEffect(() => {
    if (execution.step === 'complete') {
      setStep('success')
    }
  }, [execution.step, setStep])

  const handleEdit = () => {
    execution.reset()
    setStep('configure')
  }

  // Resumable: re-running after an error / rejected signature continues from
  // where it stopped without re-doing already-submitted orders.
  const handleRetry = async () => {
    try {
      await execution.run()
    } catch (error) {
      notifyError(
        'Retry failed',
        error instanceof Error ? error.message : 'Unknown error'
      )
    }
  }

  // Failed/expired orders that can be re-submitted (new CoW orders + signature).
  const retryableLegIds = execution.getRetryableLegIds()
  const handleRetryFailed = async () => {
    // Surface failures: retryFailedOrders re-quotes then sends a new presign
    // batch; if any stage throws, a swallowed promise would leave the user with
    // no feedback.
    try {
      await execution.retryFailedOrders()
    } catch (error) {
      notifyError(
        'Retry failed',
        error instanceof Error ? error.message : 'Unknown error'
      )
    }
  }

  const handleSubmit = async () => {
    // Snapshot basket + quote-token balances so we can show leftover dust
    // after the operation (SDK uses sell orders → outputs leave residue).
    if (account && quote) {
      const tokenAddrs = [
        ...quote.folioAssets.map((fa) => fa.asset.address),
        inputToken.address as Address,
      ]
      try {
        const results = await readContracts(wagmiConfig, {
          contracts: tokenAddrs.map((address) => ({
            address,
            abi: erc20Abi,
            functionName: 'balanceOf' as const,
            args: [account as Address] as const,
            chainId,
          })),
        })
        const snapshot: Record<string, bigint> = {}
        tokenAddrs.forEach((addr, i) => {
          const r = results[i]
          snapshot[addr.toLowerCase()] =
            r.status === 'success' ? (r.result as bigint) : 0n
        })
        setDustStart(snapshot)
      } catch {
        setDustStart({})
      }
    }
    void execution.run()
  }

  return (
    <div className="bg-secondary rounded-3xl p-1 w-full">
      <div className="grid w-full gap-0.5 lg:grid-cols-[480px_minmax(0,1fr)] lg:grid-rows-[auto_1fr] lg:items-stretch">
        <div className="min-w-0 flex flex-col gap-0.5 lg:col-start-1 lg:row-start-2 lg:h-full">
          <div className="bg-card rounded-2xl p-2">
            <div className="px-4 py-3 flex items-center justify-between">
              <div>
                <h3 className="font-medium text-base">
                  {isMint ? 'Mint amount' : 'Redeem amount'}
                </h3>
                <p className="text-sm text-muted-foreground font-light">
                  {isMint
                    ? `Using ${inputToken.symbol} to mint the basket.`
                    : isConvertHeld
                      ? `Converting basket tokens held in your wallet to ${inputToken.symbol}.`
                      : `Redeeming ${indexDTF?.token.symbol} for ${inputToken.symbol}.`}
                </p>
              </div>
            </div>
            <div className="rounded-xl border border-border/70 bg-transparent px-4 py-3">
              <div className="text-sm text-muted-foreground mb-3">
                You provide
              </div>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  {isConvertHeld ? (
                    <>
                      <div className="flex h-8 min-w-0 items-center">
                        <span className="text-base font-light leading-8 text-primary">
                          Basket tokens in your wallet
                        </span>
                      </div>
                      <div className="mt-2 text-sm font-light text-muted-foreground">
                        Converted to {inputToken.symbol} — see breakdown
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex h-8 min-w-0 items-center">
                        <span
                          className={cn(
                            'min-w-0 truncate text-[32px] font-light leading-8 text-primary',
                            exceedsBalance && 'text-destructive'
                          )}
                        >
                          {payAmountStr || (isMint ? '0.00' : '0')}
                        </span>
                      </div>
                      <div className="mt-2 text-sm font-light text-muted-foreground">
                        {`≈ $${formatCurrency(provideValueUsd)}`}
                      </div>
                    </>
                  )}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  {!isConvertHeld && (
                    <div className="flex h-8 items-center gap-2">
                      <TokenLogo
                        address={isMint ? inputToken.address : indexDTF?.id}
                        symbol={
                          isMint ? inputToken.symbol : indexDTF?.token.symbol
                        }
                        chain={chainId}
                        size="xl"
                      />
                      <span className="text-[32px] font-light leading-8 text-muted-foreground">
                        {isMint ? inputToken.symbol : indexDTF?.token.symbol}
                      </span>
                    </div>
                  )}
                  <button
                    className="text-sm font-medium text-primary bg-primary/10 rounded-full px-2 py-0.5 flex items-center gap-1 disabled:opacity-50 disabled:pointer-events-none"
                    onClick={handleEdit}
                    disabled={isExecuting}
                  >
                    <Pencil size={12} />
                    Edit
                  </button>
                </div>
              </div>
            </div>

            {exceedsBalance && (
              <div className="mt-0.5 rounded-xl bg-destructive/10 text-destructive text-sm py-3 px-4">
                Exceeds available balance
              </div>
            )}

            {/* Mint only — for redeem the toggle lives on the configure screen
                so 0 shares + this toggle can clear out just the dust. */}
            {isMint && (
              <>
                <div className="mt-0.5 rounded-xl border border-border/70 bg-transparent px-4 py-3 flex items-center justify-between gap-4">
                  <div>
                    <div className="font-medium text-sm">
                      Use my wallet balances
                    </div>
                    <p className="text-sm text-muted-foreground font-light">
                      Use basket tokens you already hold to reduce swaps.
                    </p>
                  </div>
                  <Switch
                    checked={useExistingBalances}
                    onCheckedChange={setUseExistingBalances}
                    disabled={isExecuting}
                  />
                </div>

                {useExistingBalances && heldCollaterals.length > 0 && (
                  <div className="mt-0.5 rounded-xl border border-border/70 bg-transparent px-4 py-3">
                    <div className="text-sm text-muted-foreground mb-3">
                      Using your balances of
                    </div>
                    <div className="flex flex-col gap-3">
                      {heldCollaterals.map(({ token, value }) => (
                        <div
                          key={token.address}
                          className="flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <TokenLogo
                              address={token.address}
                              symbol={token.symbol}
                              chain={chainId}
                              size="lg"
                            />
                            <div className="min-w-0">
                              <div className="text-sm font-medium truncate">
                                {token.symbol}
                              </div>
                              <div className="text-xs text-muted-foreground font-light truncate">
                                {token.name}
                              </div>
                            </div>
                          </div>
                          <span className="text-sm font-medium shrink-0">
                            {formatTokenAmount(
                              Number(formatUnits(value, token.decimals))
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="bg-card rounded-2xl p-2 flex flex-col lg:flex-1">
            <div className="flex items-start justify-between gap-4 px-4 py-3">
              <div>
                <h3 className="font-medium text-base">Quote review</h3>
                <p className="text-sm text-muted-foreground font-light">
                  Inputs are locked while swap quotes are fetched.
                </p>
              </div>
              <button
                className="rounded-[12px] border border-border/70 bg-transparent h-8 w-8 flex items-center justify-center transition-colors hover:bg-primary hover:text-primary-foreground"
                onClick={() => quoteQuery.refetch()}
                disabled={quoteQuery.isFetching || isExecuting}
              >
                <RefreshCw
                  size={16}
                  className={quoteQuery.isFetching ? 'animate-spin' : ''}
                />
              </button>
            </div>

            {quoteErrors.length > 0 && (
              <div className="mb-3 rounded-xl border border-destructive/25 bg-destructive/10 text-destructive px-4 py-2 text-sm">
                {quoteErrors.map((e) => e.message).join(' ')}
              </div>
            )}

            <div className="rounded-xl border border-border/70 bg-transparent px-4 py-3">
              <div className="text-sm text-muted-foreground mb-3">
                You receive
              </div>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  {quotesLoading ? (
                    <Skeleton className="w-[120px] h-8" />
                  ) : (
                    <>
                      <span className="text-[32px] font-light text-primary leading-8">
                        {formatTokenAmount(receiveAmount)}
                      </span>
                      <div className="mt-2 text-sm font-light text-muted-foreground">
                        {`≈ $${formatCurrency(receiveValueUsd)}`}
                      </div>
                    </>
                  )}
                </div>
                <div className="flex shrink-0 flex-col items-end">
                  <div className="flex items-center gap-2">
                    <TokenLogo
                      address={receiveAddress}
                      symbol={receiveSymbol}
                      chain={chainId}
                      size="xl"
                    />
                    <span className="text-[32px] font-light text-muted-foreground leading-8">
                      {receiveSymbol}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 px-4 text-sm">
              <TooltipProvider delayDuration={200}>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    Price impact
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info
                          size={14}
                          className="cursor-help text-muted-foreground/70"
                        />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[280px]">
                        Aggregate difference between the swap prices and Reserve
                        API reference prices. Positive is better than reference.
                      </TooltipContent>
                    </Tooltip>
                  </span>
                  {quotesLoading ? (
                    <Skeleton className="h-4 w-20" />
                  ) : aggregateImpact !== undefined ? (
                    <span
                      className={cn(
                        'font-medium',
                        aggregateImpact < -HIGH_PRICE_IMPACT &&
                          'text-destructive'
                      )}
                    >
                      {formatPriceImpact(aggregateImpact)}
                    </span>
                  ) : (
                    <span className="font-medium text-muted-foreground">-</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Max slippage</span>
                  <span className="font-medium">
                    {(Number(slippage) / 100).toFixed(2)}%
                  </span>
                </div>
              </TooltipProvider>
            </div>

            <div className="mt-6 lg:mt-auto lg:pt-6">
              {isError && execution.error && (
                <div className="mb-2 rounded-xl border border-destructive/25 bg-destructive/10 text-destructive px-4 py-2 text-sm">
                  {execution.error.message}
                </div>
              )}
              {isError ? (
                <div className="flex flex-col gap-2">
                  <Button
                    size="lg"
                    className="w-full h-[49px] rounded-[12px]"
                    onClick={
                      retryableLegIds.length > 0
                        ? handleRetryFailed
                        : handleRetry
                    }
                  >
                    {retryableLegIds.length > 0
                      ? `Retry ${retryableLegIds.length} failed order${
                          retryableLegIds.length > 1 ? 's' : ''
                        }`
                      : 'Try again'}
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full h-[49px] rounded-[12px]"
                    onClick={handleEdit}
                  >
                    Start over
                  </Button>
                </div>
              ) : (
                <TransactionButtonContainer chain={chainId}>
                  <Button
                    size="lg"
                    className="w-full h-[49px] rounded-[12px]"
                    disabled={
                      isExecuting ||
                      quotesLoading ||
                      !isValidAmount ||
                      exceedsBalance ||
                      !quote?.success ||
                      quoteErrors.length > 0 ||
                      hasFailedLegs
                    }
                    onClick={handleSubmit}
                  >
                    {isExecuting ? (
                      <span className="flex items-center gap-2">
                        <Loader2 size={16} className="animate-spin" />
                        {EXECUTION_BUTTON_LABELS[execution.step] ?? 'Working…'}
                      </span>
                    ) : quotesLoading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 size={16} className="animate-spin" />
                        Fetching quotes...
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <span className="font-bold">
                          {isMint ? 'Prepare mint' : 'Prepare redeem'}
                        </span>
                        <span className="font-light opacity-80">- Step 1/2</span>
                      </span>
                    )}
                  </Button>
                </TransactionButtonContainer>
              )}
            </div>
          </div>
        </div>

        <div className="bg-background rounded-2xl p-2 lg:col-start-2 lg:row-start-2 lg:flex lg:h-full lg:flex-col animate-in fade-in duration-500">
          <div className="px-4 py-3 flex items-start justify-between gap-4">
            <div>
              <h3 className="font-medium text-base">
                {executionStarted ? 'Orders' : 'Collateral swaps'}
              </h3>
              <p className="text-sm text-muted-foreground font-light">
                {executionStarted
                  ? 'Swaps settle via CoW Protocol solvers.'
                  : cowLegStates.length === 0 && !quotesLoading
                    ? 'No swaps are needed for this operation.'
                    : isMint
                      ? 'The basket assets bought with your input.'
                      : 'The basket assets sold for your output.'}
              </p>
            </div>
          </div>

          <ScrollArea className="h-[min(620px,calc(100vh-290px))] min-h-[360px] lg:h-auto lg:min-h-0 lg:flex-1">
            <div className="flex min-h-full flex-col gap-1 px-2">
              {initialLoading ? (
                [0, 1, 2].map((item) => (
                  <Skeleton key={item} className="h-[76px] rounded-[18px]" />
                ))
              ) : cowLegStates.length > 0 ? (
                <>
                  <div className="grid grid-cols-[minmax(0,1fr)_156px] items-center gap-4 px-2 pt-4 pb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <span>Asset</span>
                    <span className="text-right">Swap</span>
                  </div>
                  {cowLegStates.map((ls) => (
                    <LegRow
                      key={ls.leg.id}
                      leg={ls.leg}
                      inputToken={inputToken}
                      chainId={chainId}
                      executionStep={execution.step}
                      order={execution.ordersByLegId[ls.leg.id]}
                      impact={legImpacts[ls.leg.id]}
                      loading={ls.status === 'pending' || ls.status === 'idle'}
                      quoteError={
                        ls.status === 'error'
                          ? ls.leg.error?.message ||
                            ls.error?.message ||
                            'Quote unavailable'
                          : undefined
                      }
                    />
                  ))}
                </>
              ) : (
                <div className="flex min-h-[320px] flex-1 items-center justify-center px-4 py-10 text-center">
                  <div className="max-w-[320px]">
                    <h4 className="font-medium text-base">No swaps needed</h4>
                    <p className="mt-1 text-sm text-muted-foreground font-light">
                      You can proceed directly.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}

export default QuoteSummary
