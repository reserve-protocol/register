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
import { useAtomValue, useSetAtom } from 'jotai'
import { Check, Loader, RefreshCw, Settings } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Address, formatUnits } from 'viem'
import {
  ASYNC_MINT_BUFFER,
  allOrdersFulfilledAtom,
  collateralAllocationAtom,
  failedOrdersAtom,
  folioDetailsAtom,
  inputTokenAtom,
  mintAmountAtom,
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
  const orderIds = useAtomValue(orderIdsAtom)
  const ordersCreatedAt = useAtomValue(ordersCreatedAtAtom)
  const allFulfilled = useAtomValue(allOrdersFulfilledAtom)
  const failedOrders = useAtomValue(failedOrdersAtom)
  const pendingOrders = useAtomValue(pendingOrdersAtom)
  const basket = useAtomValue(indexDTFBasketAtom)
  const walletBalances = useAtomValue(walletBalancesAtom)
  const tokenPrices = useAtomValue(tokenPricesAtom)
  const allocation = useAtomValue(collateralAllocationAtom)
  const folioDetails = useAtomValue(folioDetailsAtom)
  const balances = useAtomValue(balancesAtom)
  const slippage = useAtomValue(slippageAtom)

  const [elapsedTime, setElapsedTime] = useState(0)

  const { refetch, isFetching } = useMintQuotes()
  const { submit: retrySubmit, isPending: isRetrying } = useSubmitOrders(true)

  useEffect(() => {
    if (!ordersCreatedAt) return
    const interval = setInterval(() => {
      const elapsed = (Date.now() - new Date(ordersCreatedAt).getTime()) / 1000
      setElapsedTime(elapsed)
    }, 1000)
    return () => clearInterval(interval)
  }, [ordersCreatedAt])

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
  const totalSwapUsd = Object.values(allocation).reduce(
    (sum, item) => sum + item.usdValue,
    0
  )
  const collateralUsd = Math.max(parsedAmount - totalSwapUsd, 0)
  const mintFee = indexDTF?.mintingFee
    ? (indexDTF.mintingFee * 100).toFixed(2)
    : '0'
  const inputBalanceValue = balances[inputToken.address]?.value ?? 0n

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
          <div className="flex items-center justify-between rounded-2xl bg-primary/10 px-4 py-3 text-primary">
            <div className="flex items-center gap-3">
              <div className="border border-primary rounded-full p-1.5">
                <Check size={16} strokeWidth={1.5} />
              </div>
              <span className="font-medium">Collateral acquired</span>
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
            <div className="text-sm font-medium text-orange-500">
              Your order needs attention
            </div>
            <div className="text-sm text-muted-foreground">
              Review the order results and choose how to proceed.
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
        <div className="rounded-2xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3 flex items-center justify-between gap-3">
          <span className="text-sm font-medium">Prices have moved</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => retrySubmit()}
            disabled={isRetrying}
          >
            {isRetrying ? 'Signing...' : 'Accept new quotes'}
          </Button>
        </div>
      )
    }

    return (
      <div className="overflow-hidden rounded-2xl bg-muted/60">
        <div className="bg-primary/20 h-[2px] w-full">
          <div
            className="bg-primary h-full transition-all duration-1000"
            style={{
              width: `${Math.min(90, (elapsedTime / 120) * 90)}%`,
            }}
          />
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3 text-primary">
            <div className="border border-primary rounded-full p-1.5">
              <Loader
                size={16}
                strokeWidth={1.5}
                className="animate-spin-slow"
              />
            </div>
            <span className="font-medium">Acquiring collateral</span>
          </div>
          <span className="text-muted-foreground text-sm font-medium">
            {getTimerFormat(elapsedTime)}
          </span>
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
          <div className="bg-card rounded-t-2xl p-2 lg:rounded-r-none lg:rounded-tl-2xl">
            <div className="px-4 py-3 flex items-center justify-between">
              <div>
                <h3 className="font-medium text-base">Mint amount</h3>
                <p className="text-sm text-muted-foreground font-light">
                  Inputs are locked while collateral acquisition is in progress.
                </p>
              </div>
            </div>
            <div className="rounded-xl bg-muted px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center flex-1 min-w-0">
                  <span className="text-[32px] font-light leading-8 text-primary">
                    $
                  </span>
                  <div className="text-[32px] font-light leading-8 w-full text-primary">
                    {formatCurrency(parsedAmount)}
                  </div>
                </div>
                <span className="rounded bg-background px-3 py-2 text-base font-medium">
                  USD
                </span>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-b-2xl p-5 flex flex-col gap-5 lg:flex-1 lg:rounded-t-none lg:rounded-r-none lg:rounded-bl-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-medium text-base">Mint progress</h3>
                <p className="text-sm text-muted-foreground font-light">
                  Collateral orders and final mint execution happen here.
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
                  <div className="text-[32px] font-light text-primary leading-8">
                    {formatTokenAmount(dtfAmount)}
                  </div>
                  <div className="text-sm text-muted-foreground font-light mt-1">
                    ${formatCurrency(dtfValue)}
                  </div>
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

            <div className="lg:mt-auto flex flex-col gap-3">
              {statusContent}
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

          <ScrollArea className="h-[min(620px,calc(100vh-290px))] min-h-[360px] lg:h-auto lg:min-h-0 lg:flex-1">
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

              {orderIds.length > 0 && (
                <div className="mt-4 px-4">
                  <div className="mb-2">
                    <h3 className="font-medium text-base">Collateral orders</h3>
                    <p className="text-sm text-muted-foreground font-light">
                      Swaps needed to complete the basket before minting.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-card px-3">
                    {orderIds.map((id) => (
                      <OrderRow key={id} orderId={id} disableFetch />
                    ))}
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

export default ProcessingV2
