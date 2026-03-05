import StackTokenLogo from '@/components/token-logo/StackTokenLogo'
import TokenLogo from '@/components/token-logo'
import { Button } from '@/components/ui/button'
import { chainIdAtom } from '@/state/atoms'
import {
  indexDTFAtom,
  indexDTFBasketAtom,
  indexDTFPriceAtom,
} from '@/state/dtf/atoms'
import { formatCurrency, formatTokenAmount } from '@/utils'
import { useAtomValue, useSetAtom } from 'jotai'
import { ArrowUpRight, Check, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { formatUnits } from 'viem'
import {
  ASYNC_MINT_BUFFER,
  inputTokenAtom,
  leftoverCollateralAtom,
  mintAmountAtom,
  mintQuotesAtom,
  orderIdsAtom,
  recoveryChoiceAtom,
  resetWizardAtom,
  slippageAtom,
  tokenPricesAtom,
} from '../atoms'
import OrderRow from '../components/order-row'
import SuccessHeader from '../components/success-header'
import { useReverseOrders } from '../hooks/use-reverse-orders'

const Success = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)
  const dtfPrice = useAtomValue(indexDTFPriceAtom)
  const inputToken = useAtomValue(inputTokenAtom)
  const mintAmount = useAtomValue(mintAmountAtom)
  const quotes = useAtomValue(mintQuotesAtom)
  const slippage = useAtomValue(slippageAtom)
  const orderIds = useAtomValue(orderIdsAtom)
  const recoveryChoice = useAtomValue(recoveryChoiceAtom)
  const leftoverCollateral = useAtomValue(leftoverCollateralAtom)
  const tokenPrices = useAtomValue(tokenPricesAtom)
  const basket = useAtomValue(indexDTFBasketAtom)
  const resetWizard = useSetAtom(resetWizardAtom)

  const [showTxs, setShowTxs] = useState(false)
  const [conversionDone, setConversionDone] = useState(false)

  const { reverseAsync, isPending: isConverting } = useReverseOrders()

  const parsedAmount = Number(mintAmount)
  const dtfAmount = dtfPrice
    ? (parsedAmount / dtfPrice) * (1 - ASYNC_MINT_BUFFER)
    : 0
  const dtfValue = dtfPrice ? dtfAmount * dtfPrice : 0
  const slippagePct = Number(slippage) / 100
  const originalDtfAmount = dtfPrice ? parsedAmount / dtfPrice : 0
  const isReduced = recoveryChoice === 'mint-reduced'

  const hasLeftovers =
    isReduced && Object.keys(leftoverCollateral).length > 0

  // Calculate leftover value for the convert banner
  const leftoverCount = Object.keys(leftoverCollateral).length
  const leftoverValue = Object.entries(leftoverCollateral).reduce(
    (sum, [addr, amount]) => {
      const token = basket?.find(
        (t) => t.address.toLowerCase() === addr.toLowerCase()
      )
      const price = tokenPrices[addr.toLowerCase() as `0x${string}`] ?? 0
      const dec = token?.decimals ?? 18
      return sum + Number(formatUnits(amount, dec)) * price
    },
    0
  )
  const estimatedReturn = leftoverValue * (1 - slippagePct / 100)

  // Fee calculation
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

  const handleConvert = async () => {
    try {
      await reverseAsync(leftoverCollateral)
      setConversionDone(true)
    } catch {
      // User rejected or tx failed — button re-enables via isPending
    }
  }

  const handleClose = () => {
    resetWizard()
  }

  return (
    <div className="bg-secondary rounded-3xl p-1 w-full max-w-[468px] mx-auto relative">
      <div className="relative z-10">
        <SuccessHeader
          showTxs={showTxs}
          onToggleTxs={() => setShowTxs(!showTxs)}
          onClose={handleClose}
        />

        {/* Convert leftover tokens banner */}
        {hasLeftovers && !conversionDone && (
          <div className="bg-background rounded-[20px] mx-1 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">
                Convert {leftoverCount} tokens ($
                {formatCurrency(leftoverValue)})
              </span>
              <span className="text-sm text-muted-foreground">
                ≈{formatCurrency(estimatedReturn)} {inputToken.symbol} (-
                {slippagePct}%)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <StackTokenLogo
                  tokens={(basket || [])
                    .filter((t) =>
                      Object.keys(leftoverCollateral).some(
                        (a) => a.toLowerCase() === t.address.toLowerCase()
                      )
                    )
                    .slice(0, 5)
                    .map((t) => ({
                      ...t,
                      chain: indexDTF?.chainId,
                    }))}
                  size={24}
                  overlap={4}
                  reverseStack
                  outsource
                />
                <ChevronDown size={14} className="text-muted-foreground" />
              </div>
              <Button
                size="sm"
                className="rounded-full"
                onClick={handleConvert}
                disabled={isConverting}
              >
                {isConverting
                  ? 'Converting...'
                  : `Swap to ${inputToken.symbol}`}
              </Button>
            </div>
          </div>
        )}

        {/* Conversion completed banner */}
        {hasLeftovers && conversionDone && (
          <div className="bg-background rounded-[20px] mx-1 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-sm">
                <Check size={16} className="text-primary" />
                <span>Converted {leftoverCount} tokens</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <span className="text-muted-foreground">Received</span>
                <span className="font-semibold">
                  {formatCurrency(estimatedReturn)} {inputToken.symbol}
                </span>
                <ArrowUpRight size={14} className="text-muted-foreground" />
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-0.5 mt-0.5">
          {/* All Txs expandable */}
          {showTxs && (
            <div className="bg-background rounded-[20px] mx-1 px-3">
              {orderIds.map((id) => (
                <OrderRow key={id} orderId={id} disableFetch />
              ))}
            </div>
          )}

          {/* You Minted */}
          <div className="bg-background rounded-[20px] mx-1 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-primary">You Minted:</span>
              {isReduced && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatTokenAmount(originalDtfAmount)}{' '}
                  {indexDTF?.token.symbol}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between mt-1">
              <div className="flex items-center gap-1">
                <span className="text-2xl font-semibold text-primary">
                  {formatTokenAmount(dtfAmount)}
                </span>
                <span className="text-2xl">{indexDTF?.token.symbol}</span>
              </div>
              <TokenLogo
                symbol={indexDTF?.token.symbol || ''}
                address={indexDTF?.id || ''}
                chain={chainId}
                size="xl"
                className="rounded-full"
              />
            </div>
            <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
              <span>${formatCurrency(dtfValue)}</span>
              <span>(-{slippagePct}%)</span>
            </div>
          </div>

          {/* You Used */}
          <div className="bg-background rounded-[20px] mx-1 p-4">
            <div className="text-sm text-primary mb-1">You Used:</div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="text-2xl font-semibold text-primary">
                  {formatCurrency(parsedAmount)}
                </span>
                <span className="text-2xl">{inputToken.symbol}</span>
              </div>
              <TokenLogo
                symbol={inputToken.symbol}
                size="xl"
                className="rounded-full"
              />
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              ${formatCurrency(parsedAmount)}
            </div>
          </div>

          {/* Rate + fee info */}
          <div className="flex items-center justify-between px-4 py-3 text-sm text-muted-foreground">
            <span>
              ≈{dtfPrice ? formatTokenAmount(1 / dtfPrice) : '...'}{' '}
              {indexDTF?.token.symbol} = $1
            </span>
            <div className="flex items-center gap-1">
              <span>
                Fee {fee !== 0 ? `${Math.abs(fee).toFixed(2)}%` : '0%'}
              </span>
              <ChevronDown size={14} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Success
