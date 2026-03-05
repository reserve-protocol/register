import TokenLogo from '@/components/token-logo'
import { Button } from '@/components/ui/button'
import { TransactionButtonContainer } from '@/components/ui/transaction-button'
import { NumericalInput } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import useDebounce from '@/hooks/useDebounce'
import { balancesAtom, chainIdAtom } from '@/state/atoms'
import { indexDTFAtom, indexDTFBasketAtom, indexDTFPriceAtom } from '@/state/dtf/atoms'
import { formatCurrency, formatTokenAmount } from '@/utils'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import {
  ArrowDown,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Settings,
} from 'lucide-react'
import { useEffect, useMemo, useRef } from 'react'
import { Address, formatUnits } from 'viem'
import {
  ASYNC_MINT_BUFFER,
  collateralAllocationAtom,
  inputTokenAtom,
  mintAmountAtom,
  mintQuotesAtom,
  mintStrategyAtom,
  priceMovedAtom,
  quotesStaleAtom,
  recoveryChoiceAtom,
  selectedCollateralsAtom,
  tokenPricesAtom,
  walletBalancesAtom,
  wizardStepAtom,
} from '../atoms'
import { calculateMaxMintAmount } from '../utils'
import { useMintQuotes } from '../hooks/use-mint-quotes'
import { useSubmitOrders } from '../hooks/use-submit-orders'

const QuoteSummary = () => {
  const setStep = useSetAtom(wizardStepAtom)
  const indexDTF = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)
  const dtfPrice = useAtomValue(indexDTFPriceAtom)
  const inputToken = useAtomValue(inputTokenAtom)
  const [mintAmount, setMintAmount] = useAtom(mintAmountAtom)
  const quotes = useAtomValue(mintQuotesAtom)
  const priceMoved = useAtomValue(priceMovedAtom)
  const quotesStale = useAtomValue(quotesStaleAtom)
  const recoveryChoice = useAtomValue(recoveryChoiceAtom)
  const strategy = useAtomValue(mintStrategyAtom)
  const balances = useAtomValue(balancesAtom)

  const allocation = useAtomValue(collateralAllocationAtom)
  const { refetch, isFetching } = useMintQuotes()
  const { submit, isPending } = useSubmitOrders()

  // WHY: In multi-token flow, all tokens may come from wallet (no swaps needed)
  const allocationLoaded = Object.keys(allocation).length > 0
  const noSwapsNeeded = allocationLoaded &&
    Object.values(allocation).every((a) => a.fromSwap === 0n)

  const walletBalances = useAtomValue(walletBalancesAtom)
  const tokenPrices = useAtomValue(tokenPricesAtom)
  const selectedCollaterals = useAtomValue(selectedCollateralsAtom)
  const basket = useAtomValue(indexDTFBasketAtom)

  // Balance
  const inputBalance = balances[inputToken.address]
  const availableBalance = inputBalance
    ? Number(formatUnits(inputBalance.value ?? 0n, inputToken.decimals))
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

  const maxMintAmount = useMemo(
    () =>
      calculateMaxMintAmount({
        inputTokenBalance: availableBalance,
        walletBalances,
        tokenPrices,
        tokenDecimals: decimalsMap,
        selectedCollaterals,
        strategy,
        inputTokenAddress: inputToken.address as Address,
      }),
    [
      availableBalance,
      walletBalances,
      tokenPrices,
      decimalsMap,
      selectedCollaterals,
      strategy,
      inputToken,
    ]
  )

  // Default to max on mount
  useEffect(() => {
    if (!mintAmount && maxMintAmount > 0) {
      setMintAmount(maxMintAmount.toString())
    }
  }, [maxMintAmount]) // eslint-disable-line react-hooks/exhaustive-deps

  const debouncedAmount = useDebounce(mintAmount, 500)

  const parsedAmount = Number(mintAmount) || 0
  const dtfAmount = dtfPrice
    ? (parsedAmount / dtfPrice) * (1 - ASYNC_MINT_BUFFER)
    : 0
  const dtfValue = dtfPrice ? dtfAmount * dtfPrice : 0
  const spreadPct =
    parsedAmount > 0 ? ((parsedAmount - dtfValue) / parsedAmount) * 100 : 0
  const hasQuotes = Object.keys(quotes).length > 0
  const successfulQuotes = Object.values(quotes).filter((q) => q.success)
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

  const handleMax = () => {
    setMintAmount(maxMintAmount.toString())
  }

  const backStep =
    strategy === 'single' ? 'collateral-decision' : 'review'

  return (
    <div className="bg-secondary rounded-3xl p-1 w-[468px] max-w-full mx-auto">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-background h-8 w-8"
          onClick={() => setStep(backStep)}
        >
          <ArrowLeft size={16} />
        </Button>
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

      {/* Recovery banners */}
      {recoveryChoice === 'top-up' && (
        <div className="mx-2 mb-1 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-3 text-sm">
          Approving additional {inputToken.symbol} to mint your full amount
        </div>
      )}
      {recoveryChoice === 'mint-reduced' && (
        <div className="mx-2 mb-1 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-3 text-sm">
          Minting with your original inputs — reduced output
        </div>
      )}

      {/* Stale quotes banner */}
      {quotesStale && !priceMoved && (
        <div className="mx-2 mb-1 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-3 flex items-center justify-between">
          <span className="text-sm font-medium">Quotes may be outdated</span>
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            Refresh quotes
          </Button>
        </div>
      )}

      {/* Price moved banner */}
      {priceMoved && (
        <div className="mx-2 mb-1 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-3 flex items-center justify-between">
          <span className="text-sm font-medium">Prices have moved</span>
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            Accept new quotes
          </Button>
        </div>
      )}

      {/* You use — editable input */}
      <div className="bg-background rounded-[20px]  p-2">
        <div className="px-4 pt-4 pb-2">
          <div
            className={`text-sm font-light mb-2 ${exceedsBalance ? 'text-destructive' : 'text-primary'}`}
          >
            You use:
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1 min-w-0">
              {mintAmount && (
                <span
                  className={`text-[26px] font-light leading-[24px] ${exceedsBalance ? 'text-destructive' : 'text-primary'}`}
                >
                  $
                </span>
              )}
              <NumericalInput
                variant="transparent"
                value={mintAmount}
                onChange={setMintAmount}
                placeholder="$0.00"
                className={`text-[26px] font-light leading-[24px] w-full placeholder:text-muted-foreground/50 ${exceedsBalance ? 'text-destructive' : 'text-primary'}`}
              />
            </div>
            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              <TokenLogo symbol={inputToken.symbol} size="lg" />
              <div className="bg-muted rounded-full p-1">
                <ChevronDown size={16} className="text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between px-4 pb-4">
          <span className="text-sm font-light text-muted-foreground">
            Avbl. ${formatCurrency(maxMintAmount)}
          </span>
          <div className="flex items-center gap-2">
            {exceedsBalance && (
              <span className="text-sm font-light text-destructive">
                Exceeds balance
              </span>
            )}
            <button
              className="text-sm font-medium text-primary bg-primary/10 rounded-full px-2 py-0.5"
              onClick={handleMax}
            >
              Max
            </button>
          </div>
        </div>
      </div>

      {/* Arrow separator */}
      <div className="flex justify-center -my-[17px] relative z-10">
        <div className="bg-background border-4 border-secondary rounded-full flex items-center justify-center size-10">
          <ArrowDown size={16} className="text-muted-foreground" />
        </div>
      </div>

      {/* You receive — button + fee inside this card */}
      <div className="bg-background rounded-[20px] p-2">
        <div className="p-4">
          <div className="text-sm text-muted-foreground mb-2">You receive:</div>
          <div className="flex items-center justify-between">
            {quoteLoading ? (
              <Skeleton className="w-[120px] h-[28px]" />
            ) : (
              <div className="text-[26px] font-light text-primary leading-[24px]">
                {formatTokenAmount(dtfAmount)}
              </div>
            )}
            <div className="flex items-center gap-1.5">
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
          <div className="flex items-center justify-between mt-2">
            {quoteLoading ? (
              <Skeleton className="w-[80px] h-[20px]" />
            ) : (
              <div className="flex items-center gap-1">
                <TokenLogo
                  address={indexDTF?.id}
                  symbol={indexDTF?.token.symbol}
                  chain={chainId}
                  size="sm"
                />
                <span className="text-sm font-light">
                  ${formatCurrency(dtfValue)}
                </span>
                <div className="bg-muted rounded-full flex items-center justify-center size-5">
                  <ChevronRight size={12} className="text-muted-foreground" />
                </div>
              </div>
            )}
            <span className="text-sm text-muted-foreground font-light">
              (-{spreadPct.toFixed(2)}%)
            </span>
          </div>
        </div>

        {/* Submit button */}
        <TransactionButtonContainer chain={chainId}>
          <Button
            size="lg"
            className="w-full h-[49px] rounded-[12px]"
            disabled={
              isPending ||
              quoteLoading ||
              !isValidAmount ||
              exceedsBalance ||
              (!noSwapsNeeded && successfulQuotes.length === 0) ||
              quotesStale
            }
            onClick={() => noSwapsNeeded ? setStep('processing') : submit()}
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

        {/* Rate + fee info */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 text-sm">
          <span className="font-light">
            ≈{dtfPrice ? formatTokenAmount(1 / dtfPrice) : '...'}{' '}
            {indexDTF?.token.symbol} = $1
          </span>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-light">Fee</span>
            <span className="font-light">{mintFee}%</span>
            <div className="bg-muted rounded-full flex items-center justify-center size-6">
              <ChevronDown size={12} className="text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuoteSummary
