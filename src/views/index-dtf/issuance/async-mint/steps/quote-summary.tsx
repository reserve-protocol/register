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
import { balancesAtom, chainIdAtom, walletAtom } from '@/state/atoms'
import { wagmiConfig } from '@/state/chain'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { formatCurrency, formatTokenAmount } from '@/utils'
import { AsyncZapLeg } from '@reserve-protocol/async-zap-sdk'
import { useAtomValue, useSetAtom } from 'jotai'
import { Info, Pencil, RefreshCw } from 'lucide-react'
import { Address, erc20Abi, formatUnits } from 'viem'
import { readContracts } from 'wagmi/actions'
import { useAsyncZap } from '../async-zap-context'
import {
  dustStartBalancesAtom,
  inputTokenAtom,
  mintAmountAtom,
  redeemAmountAtom,
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
  const redeemAmount = useAtomValue(redeemAmountAtom)
  const slippage = useAtomValue(slippageAtom)
  const balances = useAtomValue(balancesAtom)
  const account = useAtomValue(walletAtom)
  const setDustStart = useSetAtom(dustStartBalancesAtom)

  const { quote, quoteQuery, execution, operation } = useAsyncZap()
  const isMint = operation === 'mint'

  const quoteLoading = quoteQuery.isFetching && !quote

  // What the user provides (pay side).
  const payAmountStr = isMint ? mintAmount : redeemAmount
  const parsedPay = Number(payAmountStr) || 0
  const inputBalance = balances[inputToken.address]
  const inputBalanceAmount = inputBalance
    ? Number(formatUnits(inputBalance.value ?? 0n, inputToken.decimals))
    : 0
  const dtfBalance = indexDTF ? balances[indexDTF.id] : undefined
  const dtfBalanceAmount = dtfBalance
    ? Number(formatUnits(dtfBalance.value ?? 0n, 18))
    : 0
  const payBalance = isMint ? inputBalanceAmount : dtfBalanceAmount
  const exceedsBalance = parsedPay > payBalance
  const isValidAmount = parsedPay > 0

  const mintFee = indexDTF?.mintingFee
    ? (indexDTF.mintingFee * 100).toFixed(2)
    : '0'

  // Quote-derived amounts (folio shares = 18 dec; quoteToken in its decimals).
  const sharesAmount = quote ? Number(formatUnits(quote.shares, 18)) : 0
  const quoteTokenAmount = quote
    ? Number(formatUnits(quote.totalQuoteTokenAmount, inputToken.decimals))
    : 0

  // Receive side.
  const receiveAmount = isMint ? sharesAmount : quoteTokenAmount
  const receiveSymbol = isMint ? indexDTF?.token.symbol : inputToken.symbol
  const receiveAddress = isMint ? indexDTF?.id : inputToken.address

  // Budget used only meaningful for mint (USDC spent vs provided).
  const utilizationPct =
    isMint && parsedPay > 0 ? (quoteTokenAmount / parsedPay) * 100 : 0

  const swapLegs = (quote?.legs ?? []).filter((leg) => leg.kind === 'cowswap')
  const hasFailedLegs = (quote?.legs ?? []).some((leg) => !!leg.error)
  const quoteErrors = quote?.errors ?? []

  const isExecuting =
    execution.step !== 'idle' &&
    execution.step !== 'complete' &&
    execution.step !== 'error'

  const handleEdit = () => {
    execution.reset()
    setStep('configure')
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
    setStep('processing')
    void execution.run()
  }

  const renderLeg = (leg: AsyncZapLeg) => {
    const failed = !!leg.error
    const sell = leg.side === 'sell'
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
                : sell
                  ? `Selling ${leg.asset.symbol} for ${inputToken.symbol}`
                  : `Buying ${leg.asset.symbol} with ${inputToken.symbol}`}
            </div>
          </div>
          <div className="min-w-[156px] text-right">
            <div className="text-base font-medium">
              {sell ? '+' : '-'}
              {formatCurrency(
                Number(formatUnits(leg.quoteTokenAmount, inputToken.decimals))
              )}{' '}
              {inputToken.symbol}
            </div>
            <div className="text-sm text-muted-foreground font-light">
              {sell ? '-' : '+'}
              {formatTokenBalance(leg.assetAmount, leg.asset.decimals)}{' '}
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
          <div className="bg-card rounded-2xl p-2">
            <div className="px-4 py-3 flex items-center justify-between">
              <div>
                <h3 className="font-medium text-base">
                  {isMint ? 'Mint amount' : 'Redeem amount'}
                </h3>
                <p className="text-sm text-muted-foreground font-light">
                  {isMint
                    ? `Using ${inputToken.symbol} to mint the basket.`
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
                  <div className="flex h-8 min-w-0 items-center">
                    <span
                      className={cn(
                        'text-[32px] font-light leading-8 text-primary',
                        exceedsBalance && 'text-destructive'
                      )}
                    >
                      {isMint ? `$${payAmountStr || '0.00'}` : payAmountStr || '0'}
                    </span>
                  </div>
                  <div className="mt-2 text-sm font-light text-muted-foreground">
                    {isMint
                      ? `$${formatCurrency(parsedPay)} ${inputToken.symbol}`
                      : `${formatTokenAmount(parsedPay)} ${indexDTF?.token.symbol}`}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
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
                onClick={() => quoteQuery.refetch()}
                disabled={quoteQuery.isFetching}
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
                  {quoteLoading ? (
                    <Skeleton className="w-[120px] h-8" />
                  ) : (
                    <span className="text-[32px] font-light text-primary leading-8">
                      {isMint
                        ? formatTokenAmount(receiveAmount)
                        : `$${formatCurrency(receiveAmount)}`}
                    </span>
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
                {isMint && (
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
                          of your input. Unused budget stays in your wallet.
                        </TooltipContent>
                      </Tooltip>
                    </span>
                    {quoteLoading ? (
                      <Skeleton className="h-4 w-32" />
                    ) : quote ? (
                      <span className="font-medium">
                        {formatCurrency(quoteTokenAmount)} {inputToken.symbol} (
                        {utilizationPct.toFixed(2)}%)
                      </span>
                    ) : (
                      <span className="font-medium text-muted-foreground">
                        -
                      </span>
                    )}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Max slippage</span>
                  <span className="font-medium">
                    {(Number(slippage) / 100).toFixed(2)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    {isMint ? 'Minting fee' : 'Redemption fee'}
                  </span>
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
                    !quote?.success ||
                    quoteErrors.length > 0 ||
                    hasFailedLegs
                  }
                  onClick={handleSubmit}
                >
                  {isExecuting ? (
                    'Signing...'
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
            </div>
          </div>
        </div>

        <div className="bg-background rounded-2xl p-2 lg:col-start-2 lg:row-start-2 lg:flex lg:h-full lg:flex-col">
          <div className="px-4 py-3 flex items-start justify-between gap-4">
            <div>
              <h3 className="font-medium text-base">Collateral swaps</h3>
              <p className="text-sm text-muted-foreground font-light">
                {swapLegs.length === 0 && !quoteLoading
                  ? 'No swaps are needed for this operation.'
                  : isMint
                    ? 'The basket assets bought with your input.'
                    : 'The basket assets sold for your output.'}
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
                  <div className="grid grid-cols-[minmax(0,1fr)_156px_24px] items-center gap-4 px-2 pt-4 pb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <span>Asset</span>
                    <span className="col-span-2 text-right">Swap</span>
                  </div>
                  {swapLegs.map(renderLeg)}
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
