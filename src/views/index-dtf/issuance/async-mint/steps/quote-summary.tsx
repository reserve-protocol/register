import TokenLogo from '@/components/token-logo'
import TokenLogoWithChain from '@/components/token-logo/TokenLogoWithChain'
import { Button } from '@/components/ui/button'
import { TransactionButtonContainer } from '@/components/ui/transaction-button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import useDebounce from '@/hooks/useDebounce'
import { cn } from '@/lib/utils'
import { balancesAtom, chainIdAtom } from '@/state/atoms'
import {
  indexDTFAtom,
  indexDTFBasketAtom,
  indexDTFPriceAtom,
} from '@/state/dtf/atoms'
import { formatCurrency, formatTokenAmount, safeParseEther } from '@/utils'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import {
  ChevronRight,
  Info,
  ListChecks,
  Pencil,
  RefreshCw,
  Settings,
} from 'lucide-react'
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
  useWalletCollateralAtom,
  walletBalancesAtom,
  wizardStepAtom,
} from '../atoms'
import { calculateMaxMintAmount } from '../utils'
import { useMintQuotes } from '../hooks/use-mint-quotes'
import { useSubmitOrders } from '../hooks/use-submit-orders'

const formatTokenBalance = (value: bigint, decimals: number) =>
  formatTokenAmount(Number(formatUnits(value, decimals)))

const getLockedSourceStatus = (explanation?: string, fromWallet?: bigint) => {
  if (!fromWallet || fromWallet === 0n) return ''
  if (explanation === 'Token at its maximum weight') return 'Capped at'
  if (explanation === 'Using your full balance') return 'Using full balance'
  return ''
}

const calculateMintSharesForUsd = (
  amount: number,
  dtfPrice?: number | null
) => {
  if (!dtfPrice || !amount || !isFinite(amount) || amount <= 0) return 0n
  return safeParseEther(
    ((amount / dtfPrice) * (1 - ASYNC_MINT_BUFFER)).toFixed(18)
  )
}

const QuoteSummary = () => {
  const setStep = useSetAtom(wizardStepAtom)
  const indexDTF = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)
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
  const { submit, isPending } = useSubmitOrders(recoveryChoice === 'top-up')
  const [sourcesSettled, setSourcesSettled] = useState(false)

  // WHY: In multi-token flow, all tokens may come from wallet (no swaps needed)
  const allocationLoaded = Object.keys(allocation).length > 0
  const noSwapsNeeded =
    allocationLoaded &&
    Object.values(allocation).every((a) => a.fromSwap === 0n)

  const walletBalances = useAtomValue(walletBalancesAtom)
  const tokenPrices = useAtomValue(tokenPricesAtom)
  const selectedCollaterals = useAtomValue(selectedCollateralsAtom)
  const customAmounts = useAtomValue(customCollateralAmountsAtom)
  const useWalletCollateral = useAtomValue(useWalletCollateralAtom)
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
  const walletCollateralUsd = useMemo(
    () =>
      Object.entries(allocation).reduce((sum, [address, alloc]) => {
        if (alloc.fromWallet === 0n) return sum
        const token = basket?.find(
          (item) => item.address.toLowerCase() === address.toLowerCase()
        )
        if (!token) return sum
        const price = tokenPrices[address.toLowerCase() as Address] ?? 0
        return (
          sum + Number(formatUnits(alloc.fromWallet, token.decimals)) * price
        )
      }, 0),
    [allocation, basket, tokenPrices]
  )
  const hasWalletCollateralUsed = walletCollateralUsd > 0
  const inputUsedUsd = Math.max(parsedAmount - walletCollateralUsd, 0)
  const inputSourceTokens = useMemo(() => {
    if (!useWalletCollateral || !basket) return [inputToken]

    const walletSources = basket.filter((token) => {
      const normalized = token.address.toLowerCase() as Address
      const alloc = allocation[token.address] ?? allocation[normalized]

      return (alloc?.fromWallet ?? 0n) > 0n
    })

    return inputUsedUsd > 0 || walletSources.length === 0
      ? [inputToken, ...walletSources]
      : walletSources
  }, [allocation, basket, inputToken, inputUsedUsd, useWalletCollateral])
  const lockedCollateralTokens = useMemo(() => {
    if (!basket) return []

    return basket.filter((token) => {
      const normalized = token.address.toLowerCase() as Address

      if (normalized === inputToken.address.toLowerCase()) return false

      const walletBalance = walletBalances[normalized] ?? 0n
      const alloc = allocation[token.address] ?? allocation[normalized]
      const balanceUsd =
        Number(formatUnits(walletBalance, token.decimals)) *
        (tokenPrices[normalized] ?? 0)

      return (
        balanceUsd >= 0.01 ||
        selectedCollaterals.has(normalized) ||
        selectedCollaterals.has(token.address) ||
        (alloc?.fromWallet ?? 0n) > 0n
      )
    })
  }, [
    allocation,
    basket,
    inputToken.address,
    selectedCollaterals,
    tokenPrices,
    walletBalances,
  ])
  const visibleInputSourceTokens = inputSourceTokens.slice(0, 3)
  const hiddenInputSourceTokenCount = Math.max(inputSourceTokens.length - 3, 0)
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
  const isTotalUsdInputMode = strategy !== 'single'
  const mintFee = indexDTF?.mintingFee
    ? (indexDTF.mintingFee * 100).toFixed(2)
    : '0'

  const renderLockedCollateralSourceRow = (
    token: NonNullable<typeof basket>[number]
  ) => {
    const normalized = token.address.toLowerCase() as Address
    const alloc = allocation[token.address] ?? allocation[normalized]
    const usedAmount = alloc?.fromWallet ?? 0n
    const usedUsd =
      Number(formatUnits(usedAmount, token.decimals)) *
      (tokenPrices[normalized] ?? 0)
    const walletBalance = walletBalances[normalized] ?? 0n
    const mintShares = calculateMintSharesForUsd(parsedAmount, dtfPrice)
    const tokenIndex = folioDetails?.assets.findIndex(
      (asset) => asset.toLowerCase() === normalized
    )
    const requiredAmount =
      tokenIndex !== undefined &&
      tokenIndex >= 0 &&
      folioDetails &&
      mintShares > 0n
        ? folioDetails.shares === mintShares
          ? (folioDetails.mintValues[tokenIndex] ?? 0n)
          : ((folioDetails.mintValues[tokenIndex] ?? 0n) * mintShares) /
            folioDetails.shares
        : 0n
    const maxUsableAmount =
      walletBalance < requiredAmount ? walletBalance : requiredAmount
    const maxUsableUsd =
      Number(formatUnits(maxUsableAmount, token.decimals)) *
      (tokenPrices[normalized] ?? 0)
    const checked = usedAmount > 0n
    const status = getLockedSourceStatus(alloc?.explanation, usedAmount)
    const usedAmountText = `${formatTokenBalance(usedAmount, token.decimals)} ${token.symbol}`
    const walletBalanceText = `${formatTokenBalance(walletBalance, token.decimals)} ${token.symbol}`
    const weightPct =
      parsedAmount > 0 ? Math.min((usedUsd / parsedAmount) * 100, 100) : 0
    const weightText = Number.isInteger(weightPct)
      ? weightPct.toFixed(0)
      : weightPct.toFixed(2)
    const statusTooltip =
      alloc?.explanation === 'Token at its maximum weight'
        ? `${token.symbol} is ${weightText}% of this ${indexDTF?.token.symbol}, so we can use up to $${formatCurrency(usedUsd)} (${usedAmountText}) of your ${walletBalanceText} for this mint.`
        : alloc?.explanation === 'Using your full balance'
          ? `You hold ${walletBalanceText}, which is within this token's basket weight, so we're using all of it.`
          : ''

    return (
      <div
        key={token.address}
        className={cn(
          '-mx-2 rounded-[18px] border px-4 py-3 transition-colors',
          checked
            ? 'border-primary/35 bg-primary/5'
            : 'border-border/70 bg-background'
        )}
      >
        <div className="flex items-center">
          <TokenLogoWithChain
            address={token.address}
            symbol={token.symbol}
            chain={chainId}
            size="xl"
          />
          <div className="ml-4 min-w-0 flex-1">
            <div className="font-medium text-base truncate">
              {token.name || token.symbol}
            </div>
            <div className="text-sm text-muted-foreground font-light truncate">
              {token.symbol} · Wallet{' '}
              {formatTokenBalance(walletBalance, token.decimals)}
            </div>
          </div>
          <div
            className="ml-4 text-right transition-[min-width] duration-300 ease-out"
            style={{ minWidth: sourcesSettled ? 192 : 156 }}
          >
            <div className="text-base font-medium">
              ${formatCurrency(checked ? usedUsd : maxUsableUsd)}
            </div>
            <div className="flex h-5 items-center justify-end gap-1.5 text-sm text-muted-foreground font-light">
              {checked ? (
                <>
                  {status && <span>{status}</span>}
                  {status !== 'Using full balance' && (
                    <span>{usedAmountText}</span>
                  )}
                  {statusTooltip && (
                    <TooltipProvider delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
                            aria-label={`${status} explanation`}
                          >
                            <Info size={13} />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[320px]">
                          {statusTooltip}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  <span
                    className="h-5 shrink-0 opacity-0 transition-[width] duration-300 ease-out"
                    style={{ width: sourcesSettled ? 0 : 20 }}
                    aria-hidden
                  />
                </>
              ) : (
                <span>
                  {parsedAmount > 0
                    ? `${formatTokenBalance(maxUsableAmount, token.decimals)} ${token.symbol}`
                    : 'Set mint amount'}
                </span>
              )}
            </div>
          </div>
          <div
            className="h-5 shrink-0 opacity-0 transition-[width,margin] duration-300 ease-out"
            style={{
              marginLeft: sourcesSettled ? 0 : 16,
              width: sourcesSettled ? 0 : 20,
            }}
            aria-hidden
          />
        </div>
      </div>
    )
  }

  useEffect(() => {
    const frame = requestAnimationFrame(() => setSourcesSettled(true))
    return () => cancelAnimationFrame(frame)
  }, [])

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

  return (
    <div className="bg-secondary rounded-3xl p-1 w-full lg:min-h-[calc(100vh-100px)]">
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
          {(recoveryChoice === 'top-up' ||
            recoveryChoice === 'mint-reduced' ||
            (!recoveryChoice && quotesStale && !priceMoved) ||
            (!recoveryChoice && priceMoved)) && (
            <div className="bg-card rounded-2xl p-2">
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
              {!recoveryChoice && quotesStale && !priceMoved && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-3 flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Quotes may be outdated
                  </span>
                  <Button size="sm" variant="outline" onClick={() => refetch()}>
                    Refresh quotes
                  </Button>
                </div>
              )}
              {!recoveryChoice && priceMoved && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-3 flex items-center justify-between">
                  <span className="text-sm font-medium">Prices have moved</span>
                  <Button size="sm" variant="outline" onClick={() => refetch()}>
                    Accept new quotes
                  </Button>
                </div>
              )}
            </div>
          )}

          <div className="bg-card rounded-2xl p-2">
            <div className="px-4 py-3 flex items-center justify-between">
              <div>
                <h3 className="font-medium text-base">Mint amount</h3>
                <p className="text-sm text-muted-foreground font-light">
                  {isTotalUsdInputMode
                    ? 'Enter total USD to mint. Max accounts for sources and basket weights.'
                    : `Using ${inputToken.symbol} directly for this mint.`}
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
                    {isTotalUsdInputMode && mintAmount && (
                      <span
                        className={cn(
                          'text-[32px] font-light leading-8 text-muted-foreground',
                          exceedsBalance && 'text-destructive'
                        )}
                      >
                        $
                      </span>
                    )}
                    <div
                      className={cn(
                        'flex h-8 min-w-0 items-center text-[32px] font-light leading-8 text-primary',
                        exceedsBalance && 'text-destructive'
                      )}
                    >
                      {mintAmount || '0.00'}
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
                  <div className="flex items-center gap-2">
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
            </div>

            {exceedsBalance && (
              <div className="mt-0.5 rounded-xl bg-destructive/10 text-destructive text-sm py-3 px-4">
                Exceeds available balance
              </div>
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
                  {quoteLoading ? (
                    <Skeleton className="w-[120px] h-8" />
                  ) : (
                    <span className="text-[32px] font-light text-primary leading-8">
                      {formatTokenAmount(dtfAmount)}
                    </span>
                  )}
                  {quoteLoading ? (
                    <Skeleton className="w-[80px] h-5 mt-2" />
                  ) : (
                    <div className="text-sm text-muted-foreground font-light mt-2 whitespace-nowrap">
                      ${formatCurrency(dtfValue)} (-{spreadPct.toFixed(2)}%)
                    </div>
                  )}
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

            {hasQuotes && !quoteLoading && missingQuoteCount > 0 && (
              <details className="group mt-5 rounded-xl bg-destructive/10 text-destructive text-sm">
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
                              {item.quote?.success === false && item.quote.error
                                ? item.quote.error
                                : 'No quote returned'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </details>
            )}

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

            <div className="mt-5 lg:mt-auto">
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
                      <span className="font-bold">Prepare mint</span>
                      <span className="font-light opacity-80">- Step 1/2</span>
                    </span>
                  )}
                </Button>
              </TransactionButtonContainer>
            </div>
          </div>
        </div>

        <div className="bg-background rounded-2xl p-2 lg:col-start-2 lg:row-start-2 lg:flex lg:h-full lg:flex-col">
          {useWalletCollateral ? (
            <>
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
                <div className="flex flex-col gap-1 px-2">
                  <div className="flex items-center px-2 pt-4 pb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <span className="min-w-0 flex-1">Sources</span>
                    <span
                      className="ml-4 text-right transition-[min-width] duration-300 ease-out"
                      style={{ minWidth: sourcesSettled ? 192 : 156 }}
                    >
                      Amount
                    </span>
                    <span
                      className="h-5 shrink-0 transition-[width,margin] duration-300 ease-out"
                      style={{
                        marginLeft: sourcesSettled ? 0 : 16,
                        width: sourcesSettled ? 0 : 20,
                      }}
                      aria-hidden
                    />
                  </div>

                  <div className="px-2 py-3">
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
                      <div className="min-w-[192px] shrink-0 text-right">
                        <div className="text-base font-medium">
                          ${formatCurrency(inputUsedUsd)}
                        </div>
                        <div className="flex h-5 items-center justify-end text-sm text-muted-foreground font-light">
                          {hasWalletCollateralUsed
                            ? 'Remainder + buffer'
                            : 'Full amount + buffer'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {lockedCollateralTokens.map(renderLockedCollateralSourceRow)}
                </div>
              </ScrollArea>
            </>
          ) : (
            <div className="flex min-h-[360px] flex-1 flex-col p-4">
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <div className="mb-4 flex size-12 items-center justify-center text-muted-foreground">
                  <ListChecks size={24} strokeWidth={1.5} />
                </div>
                <h3 className="font-medium text-base">Collateral orders</h3>
                <p className="mt-1 max-w-[320px] text-sm text-muted-foreground font-light">
                  Orders will appear here while the mint is ongoing.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default QuoteSummary
