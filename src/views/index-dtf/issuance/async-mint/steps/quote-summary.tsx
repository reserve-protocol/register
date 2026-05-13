import TokenLogo from '@/components/token-logo'
import TokenLogoWithChain from '@/components/token-logo/TokenLogoWithChain'
import { Button } from '@/components/ui/button'
import { TransactionButtonContainer } from '@/components/ui/transaction-button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import useDebounce from '@/hooks/useDebounce'
import { cn } from '@/lib/utils'
import { balancesAtom, chainIdAtom, walletAtom } from '@/state/atoms'
import {
  indexDTFAtom,
  indexDTFBasketAtom,
  indexDTFPriceAtom,
} from '@/state/dtf/atoms'
import { formatCurrency, formatTokenAmount, safeParseEther } from '@/utils'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { ChevronRight, Pencil, RefreshCw, Settings } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Address, formatUnits } from 'viem'
import {
  ASYNC_MINT_BUFFER,
  collateralAllocationAtom,
  customCollateralAmountsAtom,
  folioDetailsAtom,
  inputTokenAtom,
  mintAmountAtom,
  mintQuotesAtom,
  mintStrategyAtom,
  priceMovedAtom,
  quotesTimestampAtom,
  quotesStaleAtom,
  recoveryChoiceAtom,
  selectedCollateralsAtom,
  slippageAtom,
  tokenPricesAtom,
  walletBalancesAtom,
  wizardStepAtom,
} from '../atoms'
import { calculateMaxMintAmount } from '../utils'
import { useMintQuotes } from '../hooks/use-mint-quotes'
import { useSubmitOrders } from '../hooks/use-submit-orders'
import { getCowswapQuote } from '../../async-swaps/hooks/useQuote'
import { useGlobalProtocolKit } from '../../async-swaps/providers/GlobalProtocolKitProvider'

const formatTokenBalance = (value: bigint, decimals: number) =>
  formatTokenAmount(Number(formatUnits(value, decimals)))

const QUOTE_PROBE_USD_TARGETS = [2, 5, 10, 20, 50, 100, 250]

type QuoteProbeTest = {
  usd: number
  buyAmount: bigint
  success: boolean
  error?: string
}

type QuoteProbeResult = {
  status: 'running' | 'done' | 'error'
  tests: QuoteProbeTest[]
  firstSuccessUsd?: number
  error?: string
}

const QuoteSummary = () => {
  const setStep = useSetAtom(wizardStepAtom)
  const indexDTF = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)
  const wallet = useAtomValue(walletAtom)
  const dtfPrice = useAtomValue(indexDTFPriceAtom)
  const inputToken = useAtomValue(inputTokenAtom)
  const mintAmount = useAtomValue(mintAmountAtom)
  const [quotes, setQuotes] = useAtom(mintQuotesAtom)
  const setQuotesTimestamp = useSetAtom(quotesTimestampAtom)
  const priceMoved = useAtomValue(priceMovedAtom)
  const quotesStale = useAtomValue(quotesStaleAtom)
  const recoveryChoice = useAtomValue(recoveryChoiceAtom)
  const strategy = useAtomValue(mintStrategyAtom)
  const slippage = useAtomValue(slippageAtom)
  const balances = useAtomValue(balancesAtom)

  const allocation = useAtomValue(collateralAllocationAtom)
  const { refetch, cancel, isFetching } = useMintQuotes()
  const { submit, isPending } = useSubmitOrders()
  const { orderBookApi } = useGlobalProtocolKit()
  const [isProbingQuotes, setIsProbingQuotes] = useState(false)
  const [quoteProbeResults, setQuoteProbeResults] = useState<
    Record<Address, QuoteProbeResult>
  >({})

  // WHY: In multi-token flow, all tokens may come from wallet (no swaps needed)
  const allocationLoaded = Object.keys(allocation).length > 0
  const noSwapsNeeded =
    allocationLoaded &&
    Object.values(allocation).every((a) => a.fromSwap === 0n)

  const walletBalances = useAtomValue(walletBalancesAtom)
  const tokenPrices = useAtomValue(tokenPricesAtom)
  const selectedCollaterals = useAtomValue(selectedCollateralsAtom)
  const customAmounts = useAtomValue(customCollateralAmountsAtom)
  const basket = useAtomValue(indexDTFBasketAtom)
  const folioDetails = useAtomValue(folioDetailsAtom)

  // Balance
  const inputBalance = balances[inputToken.address]
  const inputBalanceValue = inputBalance?.value ?? 0n
  const availableBalance = inputBalance
    ? Number(formatUnits(inputBalanceValue, inputToken.decimals))
    : 0

  const decimalsMap = useMemo(() => {
    const map: Record<Address, number> = {}
    if (basket) {
      for (const token of basket) {
        map[token.address.toLowerCase() as Address] = token.decimals
      }
    }
    return map
  }, [basket])
  const customCollateralAmounts = useMemo(() => {
    const result: Record<Address, bigint> = {}
    for (const [address, value] of Object.entries(customAmounts)) {
      const normalized = address.toLowerCase() as Address
      if (!value) continue
      result[normalized] = safeParseEther(value, decimalsMap[normalized] ?? 18)
    }
    return result
  }, [customAmounts, decimalsMap])

  const parsedAmount = Number(mintAmount) || 0
  const folioReferenceAmount =
    folioDetails && dtfPrice
      ? Number(formatUnits(folioDetails.shares, 18)) * dtfPrice
      : parsedAmount
  const maxMintAmount = useMemo(
    () =>
      calculateMaxMintAmount({
        inputTokenBalance: availableBalance,
        walletBalances,
        tokenPrices,
        tokenDecimals: decimalsMap,
        selectedCollaterals,
        customCollateralAmounts,
        strategy,
        inputTokenAddress: inputToken.address as Address,
        assets: folioDetails?.assets,
        mintValues: folioDetails?.mintValues,
        referenceAmount: folioReferenceAmount,
      }),
    [
      availableBalance,
      walletBalances,
      tokenPrices,
      decimalsMap,
      selectedCollaterals,
      customCollateralAmounts,
      strategy,
      inputToken,
      folioDetails,
      folioReferenceAmount,
    ]
  )

  const debouncedAmount = useDebounce(mintAmount, 500)

  const dtfAmount = dtfPrice
    ? (parsedAmount / dtfPrice) * (1 - ASYNC_MINT_BUFFER)
    : 0
  const dtfValue = dtfPrice ? dtfAmount * dtfPrice : 0
  const spreadPct =
    parsedAmount > 0 ? ((parsedAmount - dtfValue) / parsedAmount) * 100 : 0
  const totalSwapUsd = useMemo(
    () =>
      Object.values(allocation).reduce((sum, item) => sum + item.usdValue, 0),
    [allocation]
  )
  const collateralUsd = Math.max(parsedAmount - totalSwapUsd, 0)
  const hasQuotes = Object.keys(quotes).length > 0
  const successfulQuotes = Object.values(quotes).filter((q) => q.success)
  const requiredSwapCount = Object.values(allocation).filter(
    (item) => item.fromSwap > 0n
  ).length
  const allRequiredQuotesReady =
    noSwapsNeeded ||
    (requiredSwapCount > 0 && successfulQuotes.length === requiredSwapCount)
  const basketByAddress = useMemo(() => {
    const map: Record<Address, NonNullable<typeof basket>[number]> = {}
    for (const token of basket ?? []) {
      map[token.address.toLowerCase() as Address] = token
    }
    return map
  }, [basket])
  const missingQuoteDetails = useMemo(
    () =>
      Object.entries(allocation)
        .filter(([_, item]) => item.fromSwap > 0n)
        .map(([address, item]) => {
          const normalized = address.toLowerCase() as Address
          const quote = quotes[address as Address] ?? quotes[normalized]
          const token = basketByAddress[normalized]
          const decimals = token?.decimals ?? 18
          const price = tokenPrices[normalized] ?? 0
          const currentUsd =
            Number(formatUnits(item.fromSwap, decimals)) * price

          return {
            address: normalized,
            symbol: token?.symbol ?? `${normalized.slice(0, 6)}...`,
            decimals,
            amount: item.fromSwap,
            currentUsd,
            quote,
          }
        })
        .filter((item) => !item.quote?.success),
    [allocation, basketByAddress, quotes, tokenPrices]
  )
  const missingQuoteCount = missingQuoteDetails.length
  const quoteLoading = noSwapsNeeded
    ? false
    : isFetching || debouncedAmount !== mintAmount
  const exceedsBalance = parsedAmount > maxMintAmount
  const isValidAmount = parsedAmount >= 1
  const mintFee = indexDTF?.mintingFee
    ? (indexDTF.mintingFee * 100).toFixed(2)
    : '0'

  // Debounced refetch when amount changes
  const prevDebouncedRef = useRef(debouncedAmount)
  useEffect(() => {
    if (
      debouncedAmount !== prevDebouncedRef.current &&
      Number(debouncedAmount) >= 1
    ) {
      prevDebouncedRef.current = debouncedAmount
      refetch()
    }
  }, [debouncedAmount, refetch])

  // WHY: Auto-fetch when allocation is ready (not just on mount) — allocation
  // may still be loading if folioDetails hasn't propagated yet
  const hasFetchedRef = useRef(false)
  useEffect(() => {
    if (hasFetchedRef.current || hasQuotes || noSwapsNeeded) return
    if (parsedAmount >= 1 && allocationLoaded) {
      hasFetchedRef.current = true
      refetch()
    }
  }, [allocationLoaded, parsedAmount, hasQuotes, noSwapsNeeded, refetch])

  const handleEdit = () => {
    cancel()
    setQuotes({})
    setQuotesTimestamp(undefined)
    setStep('configure')
  }

  const handleProbeQuoteMinimums = async () => {
    if (!orderBookApi || !wallet) {
      setQuoteProbeResults(
        Object.fromEntries(
          missingQuoteDetails.map((item) => [
            item.address,
            {
              status: 'error',
              tests: [],
              error: 'Missing wallet or CowSwap order book API',
            } satisfies QuoteProbeResult,
          ])
        ) as Record<Address, QuoteProbeResult>
      )
      return
    }

    setIsProbingQuotes(true)
    setQuoteProbeResults(
      Object.fromEntries(
        missingQuoteDetails.map((item) => [
          item.address,
          { status: 'running', tests: [] } satisfies QuoteProbeResult,
        ])
      ) as Record<Address, QuoteProbeResult>
    )

    try {
      for (const item of missingQuoteDetails) {
        if (item.currentUsd <= 0) {
          setQuoteProbeResults((prev) => ({
            ...prev,
            [item.address]: {
              status: 'error',
              tests: [],
              error: 'Missing token price; cannot estimate USD probe sizes',
            },
          }))
          continue
        }

        const targetUsdValues = [
          item.currentUsd,
          item.currentUsd * 2,
          item.currentUsd * 5,
          item.currentUsd * 10,
          ...QUOTE_PROBE_USD_TARGETS,
        ]
          .filter((value) => value >= item.currentUsd * 0.99)
          .sort((a, b) => a - b)

        const seenAmounts = new Set<string>()
        const tests: QuoteProbeTest[] = []
        let firstSuccessUsd: number | undefined

        for (const targetUsd of targetUsdValues) {
          const scale = Math.max(
            1,
            Math.ceil((targetUsd / item.currentUsd) * 1_000_000)
          )
          const buyAmount = (item.amount * BigInt(scale)) / 1_000_000n
          const normalizedBuyAmount = buyAmount > 0n ? buyAmount : 1n
          const amountKey = normalizedBuyAmount.toString()

          if (seenAmounts.has(amountKey)) continue
          seenAmounts.add(amountKey)

          try {
            const quote = await getCowswapQuote({
              sellToken: inputToken.address,
              buyToken: item.address,
              amount: normalizedBuyAmount,
              address: wallet as Address,
              operation: 'mint',
              orderBookApi,
            })
            const success = Boolean(quote)

            tests.push({
              usd: targetUsd,
              buyAmount: normalizedBuyAmount,
              success,
              error: success ? undefined : 'Quote returned null',
            })

            setQuoteProbeResults((prev) => ({
              ...prev,
              [item.address]: {
                status: 'running',
                tests: [...tests],
                firstSuccessUsd,
              },
            }))

            if (success) {
              firstSuccessUsd = targetUsd
              break
            }
          } catch (error) {
            tests.push({
              usd: targetUsd,
              buyAmount: normalizedBuyAmount,
              success: false,
              error: String(error),
            })
          }
        }

        setQuoteProbeResults((prev) => ({
          ...prev,
          [item.address]: {
            status: 'done',
            tests,
            firstSuccessUsd,
          },
        }))
      }
    } finally {
      setIsProbingQuotes(false)
    }
  }

  return (
    <div className="bg-secondary rounded-3xl p-1 w-full lg:min-h-[calc(100vh-100px)]">
      <div className="grid w-full gap-0.5 lg:min-h-[calc(100vh-108px)] lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.95fr)] lg:grid-rows-[auto_1fr] lg:items-stretch">
        <div className="px-5 pt-5 pb-3 flex items-start justify-between gap-4 lg:col-start-1 lg:row-start-1">
          <Tabs value="mint">
            <TabsList className="h-9">
              <TabsTrigger
                value="mint"
                className="flex items-center gap-1.5 pl-2 pr-3 data-[state=active]:text-primary"
              >
                Mint
              </TabsTrigger>
              <TabsTrigger
                value="redeem"
                disabled
                className="flex items-center gap-1.5 pl-2 pr-3 data-[state=active]:text-primary"
              >
                Redeem
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="min-w-0 flex flex-col gap-0.5 lg:col-start-1 lg:row-start-2 lg:h-full">
          {(recoveryChoice === 'top-up' ||
            recoveryChoice === 'mint-reduced' ||
            (quotesStale && !priceMoved) ||
            priceMoved) && (
            <div className="bg-card rounded-t-2xl p-2 lg:rounded-r-none lg:rounded-tl-2xl">
              {recoveryChoice === 'top-up' && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-3 text-sm">
                  Approving additional {inputToken.symbol} to mint your full
                  amount
                </div>
              )}
              {recoveryChoice === 'mint-reduced' && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-3 text-sm">
                  Minting with your original inputs - reduced output
                </div>
              )}
              {quotesStale && !priceMoved && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-3 flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Quotes may be outdated
                  </span>
                  <Button size="sm" variant="outline" onClick={() => refetch()}>
                    Refresh quotes
                  </Button>
                </div>
              )}
              {priceMoved && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-3 flex items-center justify-between">
                  <span className="text-sm font-medium">Prices have moved</span>
                  <Button size="sm" variant="outline" onClick={() => refetch()}>
                    Accept new quotes
                  </Button>
                </div>
              )}
            </div>
          )}

          <div className="bg-card rounded-t-2xl p-2 lg:rounded-r-none lg:rounded-tl-2xl">
            <div className="px-4 py-3 flex items-center justify-between">
              <div>
                <h3 className="font-medium text-base">Mint amount</h3>
                <p className="text-sm text-muted-foreground font-light">
                  Enter the total USD value you want to mint. Max accounts for
                  your available sources and basket weights.
                </p>
              </div>
            </div>
            <div className="rounded-xl bg-muted px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center flex-1 min-w-0">
                  {mintAmount && (
                    <span
                      className={cn(
                        'text-[32px] font-light leading-8',
                        exceedsBalance ? 'text-destructive' : 'text-primary'
                      )}
                    >
                      $
                    </span>
                  )}
                  <div
                    className={cn(
                      'text-[32px] font-light leading-8 w-full',
                      exceedsBalance && 'text-destructive'
                    )}
                  >
                    {mintAmount || '0.00'}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-light whitespace-nowrap text-muted-foreground">
                    Up to ${formatCurrency(maxMintAmount)}
                  </span>
                  <button
                    className="text-sm font-medium text-primary bg-primary/10 rounded-full px-2 py-0.5 flex items-center gap-1"
                    onClick={handleEdit}
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
          </div>

          <div className="bg-card rounded-b-2xl p-5 flex flex-col gap-5 lg:flex-1 lg:rounded-t-none lg:rounded-r-none lg:rounded-bl-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-medium text-base">Quote review</h3>
                <p className="text-sm text-muted-foreground font-light">
                  Inputs are locked while swap quotes are fetched.
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button className="bg-background rounded-[12px] h-8 w-8 flex items-center justify-center transition-colors hover:bg-primary hover:text-primary-foreground">
                  <Settings size={16} />
                </button>
                <button
                  className="bg-background rounded-[12px] h-8 w-8 flex items-center justify-center transition-colors hover:bg-primary hover:text-primary-foreground"
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

            <div>
              <div className="text-sm text-muted-foreground mb-2">
                Quoted receive
              </div>
              <div className="flex items-center justify-between gap-3">
                <div>
                  {quoteLoading ? (
                    <Skeleton className="w-[120px] h-8" />
                  ) : (
                    <div className="text-[32px] font-light text-primary leading-8">
                      {formatTokenAmount(dtfAmount)}
                    </div>
                  )}
                  {quoteLoading ? (
                    <Skeleton className="w-[80px] h-5 mt-1" />
                  ) : (
                    <div className="text-sm text-muted-foreground font-light mt-1">
                      ${formatCurrency(dtfValue)}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <TokenLogo
                    address={indexDTF?.id}
                    symbol={indexDTF?.token.symbol}
                    chain={chainId}
                    size="lg"
                  />
                  <span className="text-[26px] font-light">
                    {indexDTF?.token.symbol}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="text-sm font-medium">Quoted source breakdown</div>
              <div className="flex min-h-[34px] flex-wrap content-start gap-1.5">
                {totalSwapUsd > 0 && (
                  <span className="text-sm bg-muted rounded-full px-2 py-1">
                    {inputToken.symbol} ${formatCurrency(totalSwapUsd)}
                  </span>
                )}
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

                    return (
                      <span
                        key={token.address}
                        className="text-sm bg-muted rounded-full px-2 py-1"
                      >
                        {token.symbol} ${formatCurrency(usedUsd)}
                      </span>
                    )
                  })}
              </div>
              {hasQuotes && !quoteLoading && missingQuoteCount > 0 && (
                <details className="group rounded-xl bg-destructive/10 text-destructive text-sm">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
                    <span>
                      {missingQuoteCount} required collateral quote
                      {missingQuoteCount === 1 ? '' : 's'} unavailable. Try a
                      larger amount or refresh quotes.
                    </span>
                    <ChevronRight
                      size={16}
                      className="shrink-0 transition-transform group-open:rotate-90"
                    />
                  </summary>
                  <div className="border-t border-destructive/15 px-4 py-3">
                    <div className="flex flex-col gap-2">
                      {missingQuoteDetails.map((item) => (
                        <div
                          key={item.address}
                          className="rounded-lg bg-background/70 px-3 py-2"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="font-medium">{item.symbol}</div>
                              <div className="truncate text-xs text-destructive/70">
                                {item.address}
                              </div>
                            </div>
                            <div className="shrink-0 text-right">
                              <div className="font-medium">
                                {formatTokenBalance(item.amount, item.decimals)}
                              </div>
                              <div className="max-w-[220px] truncate text-xs text-destructive/70">
                                {item.quote?.success === false &&
                                item.quote.error
                                  ? item.quote.error
                                  : 'No quote returned'}
                              </div>
                            </div>
                          </div>

                          {quoteProbeResults[item.address] && (
                            <div className="mt-2 border-t border-destructive/10 pt-2 text-xs">
                              {quoteProbeResults[item.address].status ===
                                'error' && (
                                <div className="text-destructive/70">
                                  {quoteProbeResults[item.address].error}
                                </div>
                              )}
                              {quoteProbeResults[item.address].status !==
                                'error' && (
                                <>
                                  <div className="font-medium">
                                    {quoteProbeResults[item.address]
                                      .firstSuccessUsd
                                      ? `First quote around $${formatCurrency(
                                          quoteProbeResults[item.address]
                                            .firstSuccessUsd ?? 0
                                        )}`
                                      : quoteProbeResults[item.address]
                                            .status === 'running'
                                        ? 'Probing quote sizes...'
                                        : 'No quote found in tested sizes'}
                                  </div>
                                  <div className="mt-1 flex flex-wrap gap-1.5">
                                    {quoteProbeResults[item.address].tests.map(
                                      (test) => (
                                        <span
                                          key={`${item.address}-${test.buyAmount}`}
                                          className={cn(
                                            'rounded-full px-2 py-0.5',
                                            test.success
                                              ? 'bg-primary/10 text-primary'
                                              : 'bg-destructive/10 text-destructive/70'
                                          )}
                                        >
                                          ${formatCurrency(test.usd)}{' '}
                                          {test.success ? 'ok' : 'failed'}
                                        </span>
                                      )
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 rounded-lg border border-dashed border-destructive/25 bg-background/50 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-wide">
                            Temporary dev quote probe
                          </div>
                          <div className="mt-1 text-xs text-destructive/70">
                            Quote-only diagnostic. Tests larger synthetic buy
                            sizes for the missing tokens and does not submit or
                            sign orders.
                          </div>
                        </div>
                        <Button
                          type="button"
                          size="xs"
                          variant="outline"
                          className="shrink-0 border-destructive/25 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          disabled={isProbingQuotes}
                          onClick={handleProbeQuoteMinimums}
                        >
                          {isProbingQuotes ? 'Probing...' : 'Probe sizes'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </details>
              )}
            </div>

            <div className="flex flex-col gap-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Collateral used</span>
                <span className="font-medium">
                  ${formatCurrency(collateralUsd)}
                </span>
              </div>
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
                <span className="text-muted-foreground">Fee</span>
                <span className="font-medium">{mintFee}%</span>
              </div>
            </div>

            <div className="lg:mt-auto">
              <TransactionButtonContainer chain={chainId}>
                <Button
                  size="lg"
                  className="w-full h-[49px] rounded-[12px]"
                  disabled={
                    isPending ||
                    quoteLoading ||
                    !isValidAmount ||
                    exceedsBalance ||
                    !allRequiredQuotesReady ||
                    quotesStale
                  }
                  onClick={() =>
                    noSwapsNeeded ? setStep('processing') : submit()
                  }
                >
                  {isPending ? (
                    'Signing...'
                  ) : noSwapsNeeded ? (
                    <span className="font-bold">Approve & Mint</span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <span className="font-bold">Start Mint</span>
                      <span className="font-light opacity-80">- Step 1/2</span>
                    </span>
                  )}
                </Button>
              </TransactionButtonContainer>
            </div>
          </div>
        </div>

        <div className="bg-background rounded-b-2xl p-2 lg:col-start-2 lg:row-start-2 lg:flex lg:h-full lg:flex-col lg:rounded-l-none lg:rounded-r-2xl">
          <div className="px-4 py-3 flex items-center justify-between">
            <div>
              <h3 className="font-medium text-base">Input sources</h3>
              <p className="text-sm text-muted-foreground font-light">
                Collateral is used first. {inputToken.symbol} covers the
                remainder.
              </p>
            </div>
          </div>

          <ScrollArea className="h-[min(560px,calc(100vh-340px))] min-h-[300px] lg:h-auto lg:min-h-0 lg:flex-1">
            <div className="flex flex-col gap-0.5 pr-2">
              <div className="px-4 py-3 flex items-center gap-4">
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
                    {formatTokenBalance(inputBalanceValue, inputToken.decimals)}
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-base font-medium">
                    ${formatCurrency(totalSwapUsd)}
                  </div>
                  <div className="text-sm text-muted-foreground font-light">
                    Remainder + buffer
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
                    </div>
                  )
                })}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}

export default QuoteSummary
