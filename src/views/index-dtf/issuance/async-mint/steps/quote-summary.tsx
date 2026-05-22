import TokenLogo from '@/components/token-logo'
import TokenLogoWithChain from '@/components/token-logo/TokenLogoWithChain'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { TransactionButtonContainer } from '@/components/ui/transaction-button'
import { cn } from '@/lib/utils'
import { balancesAtom, chainIdAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { formatCurrency, formatTokenAmount } from '@/utils'
import { AsyncZapLeg } from '@reserve-protocol/async-zap-sdk'
import { useAtomValue, useSetAtom } from 'jotai'
import { Info, Pencil, RefreshCw } from 'lucide-react'
import { formatUnits } from 'viem'
import { useAsyncZapMint } from '../async-zap-context'
import {
  inputTokenAtom,
  mintAmountAtom,
  slippageAtom,
  wizardStepAtom,
} from '../atoms'

const formatTokenBalance = (value: bigint, decimals: number) =>
  formatTokenAmount(Number(formatUnits(value, decimals)))

const QuoteSummary = () => {
  const setStep = useSetAtom(wizardStepAtom)
  const indexDTF = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)
  const inputToken = useAtomValue(inputTokenAtom)
  const mintAmount = useAtomValue(mintAmountAtom)
  const slippage = useAtomValue(slippageAtom)
  const balances = useAtomValue(balancesAtom)

  const { currentQuote, baseQuoteQuery, execution } = useAsyncZapMint()

  const quoteLoading = baseQuoteQuery.isFetching && !currentQuote
  const parsedAmount = Number(mintAmount) || 0

  const inputBalance = balances[inputToken.address]
  const availableBalance = inputBalance
    ? Number(formatUnits(inputBalance.value ?? 0n, inputToken.decimals))
    : 0
  const exceedsBalance = parsedAmount > availableBalance
  const isValidAmount = parsedAmount >= 1

  const mintFee = indexDTF?.mintingFee
    ? (indexDTF.mintingFee * 100).toFixed(2)
    : '0'

  // Output shares (folio is 18 decimals).
  const dtfAmount = currentQuote
    ? Number(formatUnits(currentQuote.shares, 18))
    : 0
  // USDC actually spent on swaps.
  const spentUsd = currentQuote
    ? Number(
        formatUnits(currentQuote.totalQuoteTokenAmount, inputToken.decimals)
      )
    : 0
  const utilizationPct =
    currentQuote && parsedAmount > 0 ? (spentUsd / parsedAmount) * 100 : 0

  const swapLegs = (currentQuote?.legs ?? []).filter(
    (leg) => leg.kind === 'cowswap'
  )
  const hasFailedLegs = (currentQuote?.legs ?? []).some((leg) => !!leg.error)
  const quoteErrors = currentQuote?.errors ?? []
  const quoteWarnings = currentQuote?.warnings ?? []

  const isExecuting =
    execution.step !== 'idle' &&
    execution.step !== 'complete' &&
    execution.step !== 'error'

  const handleEdit = () => {
    execution.reset()
    setStep('configure')
  }

  const handleSubmit = () => {
    setStep('processing')
    void execution.execute()
  }

  const renderLeg = (leg: AsyncZapLeg) => {
    const failed = !!leg.error
    return (
      <div
        key={leg.id}
        className={cn(
          '-mx-2 rounded-[18px] border px-4 py-3 transition-colors',
          !failed && 'border-primary/35 bg-primary/5',
          failed && 'border-destructive/25 bg-destructive/5'
        )}
      >
        <div className="flex items-center gap-4">
          <TokenLogoWithChain
            address={leg.asset.address}
            symbol={leg.asset.symbol}
            chain={chainId}
            size="xl"
          />
          <div className="min-w-0 flex-1">
            <div className="font-medium text-base truncate">
              {leg.asset.name}
            </div>
            <div
              className={cn(
                'text-sm text-muted-foreground font-light truncate',
                failed && 'text-destructive/70'
              )}
            >
              {failed
                ? leg.error?.message || 'Quote unavailable'
                : `Buying ${leg.asset.symbol} with ${inputToken.symbol}`}
            </div>
          </div>
          <div className="min-w-[156px] text-right">
            <div className="text-base font-medium">
              -
              {formatCurrency(
                Number(formatUnits(leg.quoteTokenAmount, inputToken.decimals))
              )}{' '}
              {inputToken.symbol}
            </div>
            <div className="text-sm text-muted-foreground font-light">
              +{formatTokenBalance(leg.assetAmount, leg.asset.decimals)}{' '}
              {leg.asset.symbol}
            </div>
          </div>
          <div className="h-6 w-6 shrink-0" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-secondary rounded-3xl p-1 w-full lg:min-h-[calc(100vh-100px)]">
      <div className="grid w-full gap-0.5 lg:min-h-[calc(100vh-108px)] lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.95fr)] lg:grid-rows-[auto_1fr] lg:items-stretch">
        <div className="min-w-0 flex flex-col gap-0.5 lg:col-start-1 lg:row-start-2 lg:h-full">
          {quoteWarnings.length > 0 && (
            <div className="bg-card rounded-2xl p-2">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-3 text-sm">
                {quoteWarnings.join(' ')}
              </div>
            </div>
          )}

          <div className="bg-card rounded-2xl p-2">
            <div className="px-4 py-3 flex items-center justify-between">
              <div>
                <h3 className="font-medium text-base">Mint amount</h3>
                <p className="text-sm text-muted-foreground font-light">
                  Using {inputToken.symbol} to mint the basket.
                </p>
              </div>
            </div>
            <div className="rounded-xl border border-border/70 bg-transparent px-4 py-3">
              <div className="text-sm text-muted-foreground mb-3">
                You provide
              </div>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex h-8 min-w-0 items-center">
                    <span
                      className={cn(
                        'text-[32px] font-light leading-8 text-primary',
                        exceedsBalance && 'text-destructive'
                      )}
                    >
                      ${mintAmount || '0.00'}
                    </span>
                  </div>
                  <div className="mt-2 text-sm font-light text-muted-foreground">
                    ${formatCurrency(parsedAmount)} {inputToken.symbol}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
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
                onClick={() => baseQuoteQuery.refetch()}
                disabled={baseQuoteQuery.isFetching}
              >
                <RefreshCw
                  size={16}
                  className={baseQuoteQuery.isFetching ? 'animate-spin' : ''}
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
                      ${formatCurrency(spentUsd)} {inputToken.symbol}
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

            <div className="mt-5 flex flex-col gap-3 px-4 text-sm">
              <TooltipProvider delayDuration={200}>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    Budget used
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info
                          size={14}
                          className="cursor-help text-muted-foreground/70"
                        />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[280px]">
                        {inputToken.symbol} actually spent on swaps as a share
                        of your total input. Unused budget stays in your
                        wallet.
                      </TooltipContent>
                    </Tooltip>
                  </span>
                  {quoteLoading ? (
                    <Skeleton className="h-4 w-32" />
                  ) : currentQuote ? (
                    <span className="font-medium">
                      {formatCurrency(spentUsd)} {inputToken.symbol} (
                      {utilizationPct.toFixed(2)}%)
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
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Minting fee</span>
                  <span className="font-medium">{mintFee}%</span>
                </div>
              </TooltipProvider>
            </div>

            <div className="mt-5 lg:mt-auto">
              <TransactionButtonContainer chain={chainId}>
                <Button
                  size="lg"
                  className="w-full h-[49px] rounded-[12px]"
                  disabled={
                    isExecuting ||
                    quoteLoading ||
                    !isValidAmount ||
                    exceedsBalance ||
                    !currentQuote?.success ||
                    quoteErrors.length > 0 ||
                    hasFailedLegs
                  }
                  onClick={handleSubmit}
                >
                  {isExecuting ? (
                    'Signing...'
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
          <div className="px-4 py-3 flex items-start justify-between gap-4">
            <div>
              <h3 className="font-medium text-base">Collateral quotes</h3>
              <p className="text-sm text-muted-foreground font-light">
                {swapLegs.length === 0 && !quoteLoading
                  ? 'No collateral swaps are needed for this mint.'
                  : 'This total is split across the required basket assets below.'}
              </p>
            </div>
          </div>

          <ScrollArea className="h-[min(620px,calc(100vh-290px))] min-h-[360px] lg:h-auto lg:min-h-0 lg:flex-1">
            <div className="flex min-h-full flex-col gap-1 px-2">
              {quoteLoading ? (
                [0, 1, 2].map((item) => (
                  <Skeleton key={item} className="h-[76px] rounded-[18px]" />
                ))
              ) : swapLegs.length > 0 ? (
                <>
                  <div className="-mx-2 mb-2 rounded-[18px] border border-primary/25 bg-primary/5 px-4 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="text-sm text-muted-foreground font-light">
                          {inputToken.symbol} swapped into assets
                        </div>
                        <div className="mt-1 text-2xl font-light text-primary">
                          {formatCurrency(spentUsd)} {inputToken.symbol}
                        </div>
                      </div>
                      <div className="max-w-[180px] text-right text-sm text-muted-foreground font-light">
                        Split across the collateral purchases below
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-[minmax(0,1fr)_156px_24px] items-center gap-4 px-2 pt-4 pb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <span>Asset</span>
                    <span className="col-span-2 text-right">Split</span>
                  </div>

                  {swapLegs.map(renderLeg)}
                </>
              ) : (
                <div className="flex min-h-[320px] flex-1 items-center justify-center px-4 py-10 text-center">
                  <div className="max-w-[320px]">
                    <h4 className="font-medium text-base">
                      No swaps needed for this mint
                    </h4>
                    <p className="mt-1 text-sm text-muted-foreground font-light">
                      You can proceed directly to mint.
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
