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
  ArrowDown,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Loader,
  RefreshCw,
  Settings,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import {
  ASYNC_MINT_BUFFER,
  allOrdersFulfilledAtom,
  failedOrdersAtom,
  folioDetailsAtom,
  inputTokenAtom,
  mintAmountAtom,
  orderIdsAtom,
  ordersCreatedAtAtom,
  pendingOrdersAtom,
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

  const parsedAmount = Number(mintAmount)
  const dtfAmount = dtfPrice
    ? (parsedAmount / dtfPrice) * (1 - ASYNC_MINT_BUFFER)
    : 0
  const dtfValue = dtfPrice ? dtfAmount * dtfPrice : 0
  const spreadPct =
    parsedAmount > 0 ? ((parsedAmount - dtfValue) / parsedAmount) * 100 : 0
  const mintFee = indexDTF?.mintingFee
    ? (indexDTF.mintingFee * 100).toFixed(2)
    : '0'

  const tokenToggle = (
    <button
      className="border border-border rounded-full flex items-center gap-0.5 pl-2 pr-1.5 h-8"
      onClick={() => setShowOrders(!showOrders)}
    >
      <StackTokenLogo
        tokens={(basket || []).slice(0, 3).map((t) => ({
          ...t,
          chain: indexDTF?.chainId,
        }))}
        size={16}
        overlap={4}
        reverseStack
        outsource
      />
      {showOrders ? (
        <ChevronUp size={14} className="text-muted-foreground" />
      ) : (
        <ChevronRight size={14} className="text-muted-foreground" />
      )}
    </button>
  )

  return (
    <div className="bg-secondary rounded-3xl p-1 w-[468px] max-w-full mx-auto">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2">
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
        {(isSeriousFailure || isSimpleRetry) && (
          <button
            className="bg-background rounded-[12px] h-8 w-8 flex items-center justify-center transition-colors hover:bg-primary hover:text-primary-foreground"
            onClick={() => setStep('quote-summary')}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* You use — static display */}
      <div className="bg-background rounded-[20px] p-2">
        <div className="px-4 pt-4 pb-4">
          <div className="text-sm font-light text-primary mb-2">You use</div>
          <div className="flex items-center justify-between">
            <div className="text-[26px] font-light text-primary leading-[24px]">
              ${formatCurrency(parsedAmount)}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <TokenLogo symbol={inputToken.symbol} size="lg" />
              <div className="bg-muted rounded-full p-1">
                <ChevronDown size={16} className="text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Arrow separator */}
      <div className="flex justify-center -my-[17px] relative z-10">
        <div className="bg-background border-4 border-secondary rounded-full flex items-center justify-center size-10">
          <ArrowDown size={16} className="text-muted-foreground" />
        </div>
      </div>

      {/* You receive + status + fee */}
      <div className="bg-background rounded-[20px] p-2">
        <div className="p-4">
          <div className="text-sm text-muted-foreground mb-2">You receive:</div>
          <div className="flex items-center justify-between">
            <div className="text-[26px] font-light text-primary leading-[24px]">
              {formatTokenAmount(dtfAmount)}
            </div>
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
            <span className="text-sm text-muted-foreground font-light">
              (-{spreadPct.toFixed(2)}%)
            </span>
          </div>
        </div>

        {/* Status area */}
        {/* WHY: orderIds.length === 0 means all tokens came from wallet, no CowSwap needed */}
        {orderIds.length === 0 ? (
          <MintExecute />
        ) : allFulfilled ? (
          <>
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3 text-primary">
                <div className="border border-primary rounded-full p-1.5">
                  <Check size={16} strokeWidth={1.5} />
                </div>
                <span className="font-medium">Collateral Acquired</span>
              </div>
              {tokenToggle}
            </div>
            {showOrders && (
              <div className="px-3 pb-2">
                {orderIds.map((id) => (
                  <OrderRow key={id} orderId={id} disableFetch={allFulfilled} />
                ))}
              </div>
            )}
            <MintExecute />
          </>
        ) : isSeriousFailure ? (
          <>
            <div className="flex items-center justify-between px-4 py-3">
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
            {showOrders && (
              <div className="px-3 pb-2">
                {orderIds.map((id) => (
                  <OrderRow key={id} orderId={id} disableFetch />
                ))}
              </div>
            )}
            <Button
              size="lg"
              className="w-full h-[49px] rounded-[12px]"
              onClick={() => setStep('recovery-options')}
            >
              Review options
            </Button>
          </>
        ) : isSimpleRetry ? (
          <>
            <div className="mx-2 mb-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-3 flex items-center justify-between">
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
          </>
        ) : (
          <>
            {/* Progress bar */}
            <div className="overflow-hidden rounded-b-[12px] shadow-sm">
              <div className="bg-primary/20 h-[2px] w-full">
                <div
                  className="bg-primary h-full transition-all duration-1000"
                  style={{
                    // WHY: CowSwap orders typically fill in 30-120s, animate to 90% over 120s
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
                  <span className="font-medium">Acquiring Collateral</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm font-medium">
                    {getTimerFormat(elapsedTime)}
                  </span>
                  {tokenToggle}
                </div>
              </div>
            </div>
            {showOrders && (
              <div className="px-3 pb-2">
                {orderIds.map((id) => (
                  <OrderRow key={id} orderId={id} />
                ))}
              </div>
            )}
          </>
        )}

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

export default Processing
