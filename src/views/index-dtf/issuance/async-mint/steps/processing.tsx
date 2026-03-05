import StackTokenLogo from '@/components/token-logo/StackTokenLogo'
import TokenLogo from '@/components/token-logo'
import { Button } from '@/components/ui/button'
import { chainIdAtom } from '@/state/atoms'
import {
  indexDTFAtom,
  indexDTFBasketAtom,
  indexDTFPriceAtom,
} from '@/state/dtf/atoms'
import { formatCurrency, formatTokenAmount, getTimerFormat } from '@/utils'
import { useAtomValue, useSetAtom } from 'jotai'
import {
  Check,
  ChevronDown,
  ChevronUp,
  Loader,
  Pencil,
  RefreshCw,
  Settings,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { formatUnits } from 'viem'
import {
  allOrdersFulfilledAtom,
  failedOrdersAtom,
  folioDetailsAtom,
  inputTokenAtom,
  mintAmountAtom,
  mintQuotesAtom,
  orderIdsAtom,
  ordersCreatedAtAtom,
  pendingOrdersAtom,
  slippageAtom,
  walletBalancesAtom,
  wizardStepAtom,
} from '../atoms'
import MintExecute from '../components/mint-execute'
import OrderRow from '../components/order-row'
import { checkMintFeasibility } from '../hooks/use-recovery'
import { useMintQuotes } from '../hooks/use-mint-quotes'
import { useSubmitOrders } from '../hooks/use-submit-orders'

const Processing = () => {
  const setStep = useSetAtom(wizardStepAtom)
  const indexDTF = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)
  const dtfPrice = useAtomValue(indexDTFPriceAtom)
  const inputToken = useAtomValue(inputTokenAtom)
  const mintAmount = useAtomValue(mintAmountAtom)
  const quotes = useAtomValue(mintQuotesAtom)
  const slippage = useAtomValue(slippageAtom)
  const orderIds = useAtomValue(orderIdsAtom)
  const ordersCreatedAt = useAtomValue(ordersCreatedAtAtom)
  const allFulfilled = useAtomValue(allOrdersFulfilledAtom)
  const failedOrders = useAtomValue(failedOrdersAtom)
  const pendingOrders = useAtomValue(pendingOrdersAtom)
  const basket = useAtomValue(indexDTFBasketAtom)
  const walletBalances = useAtomValue(walletBalancesAtom)
  const folioDetails = useAtomValue(folioDetailsAtom)

  const [elapsedTime, setElapsedTime] = useState(0)
  const [showOrders, setShowOrders] = useState(false)

  const { refetch, isFetching } = useMintQuotes()
  const { submit: retrySubmit, isPending: isRetrying } = useSubmitOrders(true)

  // Timer
  useEffect(() => {
    if (!ordersCreatedAt) return
    const interval = setInterval(() => {
      const elapsed =
        (Date.now() - new Date(ordersCreatedAt).getTime()) / 1000
      setElapsedTime(elapsed)
    }, 1000)
    return () => clearInterval(interval)
  }, [ordersCreatedAt])

  // Failure severity
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

  // Quote summary card data
  const parsedAmount = Number(mintAmount)
  const dtfAmount = dtfPrice ? parsedAmount / dtfPrice : 0
  const slippagePct = Number(slippage) / 100
  const successfulQuotes = Object.values(quotes).filter((q) => q.success)
  const totalSellAmount = successfulQuotes.reduce((sum, q) => {
    if (!q.success) return sum
    return (
      sum +
      Number(formatUnits(BigInt(q.data.quote.sellAmount), inputToken.decimals))
    )
  }, 0)
  const fee =
    totalSellAmount > 0
      ? ((totalSellAmount - parsedAmount) / parsedAmount) * 100
      : 0

  const tokenToggle = (
    <button
      className="flex items-center gap-1"
      onClick={() => setShowOrders(!showOrders)}
    >
      <StackTokenLogo
        tokens={(basket || []).slice(0, 5).map((t) => ({
          ...t,
          chain: indexDTF?.chainId,
        }))}
        size={16}
        overlap={4}
        reverseStack
        outsource
      />
      {showOrders ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
    </button>
  )

  const orderList = showOrders && (
    <div className="bg-background rounded-[20px] mx-1 px-3">
      {orderIds.map((id) => (
        <OrderRow key={id} orderId={id} disableFetch={allFulfilled} />
      ))}
    </div>
  )

  return (
    <div className="bg-secondary rounded-3xl p-1 w-full max-w-[468px] mx-auto">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-1">
          <button className="p-2 rounded-full hover:bg-background/50 transition-colors">
            <Settings size={16} className="text-muted-foreground" />
          </button>
          <button
            className="p-2 rounded-full hover:bg-background/50 transition-colors"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw
              size={16}
              className={`text-muted-foreground ${isFetching ? 'animate-spin' : ''}`}
            />
          </button>
          <button
            className="flex items-center gap-1 px-2 py-1 rounded-full hover:bg-background/50 transition-colors text-sm"
            onClick={() => setStep('amount-input')}
          >
            <Pencil size={14} />
            <span>Edit</span>
          </button>
        </div>
        {(isSeriousFailure || isSimpleRetry) && (
          <button
            className="p-2 rounded-full hover:bg-background/50 transition-colors"
            onClick={() => setStep('quote-summary')}
          >
            <X size={16} className="text-muted-foreground" />
          </button>
        )}
      </div>

      {/* You use */}
      <div className="bg-background rounded-[20px] mx-1 p-4">
        <div className="text-sm text-primary font-light mb-1">You use</div>
        <div className="flex items-center justify-between">
          <div className="text-3xl font-semibold text-primary">
            ${formatCurrency(parsedAmount)}
          </div>
          <div className="flex items-center gap-1">
            <TokenLogo symbol={inputToken.symbol} size="lg" />
            <ChevronDown size={14} className="text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Arrow separator */}
      <div className="flex justify-center -my-1.5 relative z-10">
        <div className="bg-secondary rounded-full p-1">
          <ChevronDown size={16} className="text-muted-foreground" />
        </div>
      </div>

      {/* You receive */}
      <div className="bg-background rounded-[20px] mx-1 p-4">
        <div className="text-sm text-muted-foreground mb-1">You receive:</div>
        <div className="flex items-center justify-between">
          <div className="text-3xl font-semibold text-primary">
            {formatTokenAmount(dtfAmount)}
          </div>
          <div className="flex items-center gap-2">
            <TokenLogo
              address={indexDTF?.id}
              symbol={indexDTF?.token.symbol}
              chain={chainId}
              size="lg"
            />
            <span className="text-xl font-semibold">
              {indexDTF?.token.symbol}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
          <TokenLogo
            address={indexDTF?.id}
            symbol={indexDTF?.token.symbol}
            chain={chainId}
            size="sm"
          />
          <span>${formatCurrency(parsedAmount * (1 - slippagePct / 100))}</span>
          <span className="ml-auto">(-{slippagePct}%)</span>
        </div>
      </div>

      {/* Status area — varies by state */}
      <div className="px-1 py-2">
        {allFulfilled ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between p-4 bg-background rounded-[20px]">
              <div className="flex items-center gap-2 text-primary">
                <div className="border border-primary/80 rounded-full p-1.5">
                  <Check size={16} strokeWidth={1.5} />
                </div>
                <span className="font-semibold">Collateral Acquired</span>
              </div>
              {tokenToggle}
            </div>
            {orderList}
            <MintExecute />
          </div>
        ) : isSeriousFailure ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between p-4 bg-background rounded-[20px]">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-orange-500">
                  Your order needs attention
                </span>
                <span className="text-sm text-muted-foreground">
                  Review and choose how to proceed.
                </span>
              </div>
              {tokenToggle}
            </div>
            {orderList}
            <Button
              size="lg"
              className="w-full h-[49px] rounded-[20px]"
              onClick={() => setStep('recovery-options')}
            >
              Review options
            </Button>
          </div>
        ) : isSimpleRetry ? (
          <div className="flex flex-col gap-2">
            <div className="mx-1 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-[20px] p-3 flex items-center justify-between">
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
            {orderList}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {/* Acquiring collateral — shimmer border */}
            <div className="relative rounded-[20px] p-[1px] bg-gradient-to-r from-transparent via-primary to-transparent animate-[shimmer_5s_infinite] bg-[length:200%_100%]">
              <div className="flex items-center justify-between p-4 bg-card rounded-[20px] shadow-md">
                <div className="flex items-center gap-2 text-primary">
                  <div className="border border-primary/40 rounded-full p-1.5">
                    <Loader
                      size={16}
                      strokeWidth={1.5}
                      className="animate-spin-slow"
                    />
                  </div>
                  <span className="font-semibold">Acquiring Collateral</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">
                    {getTimerFormat(elapsedTime)}
                  </span>
                  {tokenToggle}
                </div>
              </div>
            </div>
            {orderList}
          </div>
        )}
      </div>

      {/* Rate + fee info */}
      <div className="flex items-center justify-between px-4 py-3 text-sm text-muted-foreground">
        <span>
          ≈{dtfPrice ? formatTokenAmount(1 / dtfPrice) : '...'}{' '}
          {indexDTF?.token.symbol} = $1
        </span>
        <div className="flex items-center gap-1">
          <span>Fee {fee !== 0 ? `${Math.abs(fee).toFixed(2)}%` : '0%'}</span>
          <ChevronDown size={14} />
        </div>
      </div>
    </div>
  )
}

export default Processing
