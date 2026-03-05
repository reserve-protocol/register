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
import { Check, ChevronDown, ChevronRight, X } from 'lucide-react'
import { useState } from 'react'
import { formatEther, formatUnits } from 'viem'
import {
  ASYNC_MINT_BUFFER,
  actualMintedSharesAtom,
  inputTokenAtom,
  leftoverCollateralAtom,
  mintAmountAtom,
  mintTxHashAtom,
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
  const slippage = useAtomValue(slippageAtom)
  const orderIds = useAtomValue(orderIdsAtom)
  const recoveryChoice = useAtomValue(recoveryChoiceAtom)
  const leftoverCollateral = useAtomValue(leftoverCollateralAtom)
  const tokenPrices = useAtomValue(tokenPricesAtom)
  const basket = useAtomValue(indexDTFBasketAtom)
  const mintTxHash = useAtomValue(mintTxHashAtom)
  const actualMintedShares = useAtomValue(actualMintedSharesAtom)
  const resetWizard = useSetAtom(resetWizardAtom)

  const [showTxs, setShowTxs] = useState(false)
  const [conversionDone, setConversionDone] = useState(false)

  const { reverseAsync, isPending: isConverting } = useReverseOrders()

  const parsedAmount = Number(mintAmount)
  // WHY: Use actual shares from mint tx when available, fall back to estimate
  const dtfAmount = actualMintedShares > 0n
    ? Number(formatEther(actualMintedShares))
    : dtfPrice
      ? (parsedAmount / dtfPrice) * (1 - ASYNC_MINT_BUFFER)
      : 0
  const dtfValue = dtfPrice ? dtfAmount * dtfPrice : 0
  const spreadPct =
    parsedAmount > 0 ? ((parsedAmount - dtfValue) / parsedAmount) * 100 : 0
  const slippagePct = Number(slippage) / 100
  const originalDtfAmount = dtfPrice ? parsedAmount / dtfPrice : 0
  const isReduced = recoveryChoice === 'mint-reduced'
  const mintFee = indexDTF?.mintingFee
    ? (indexDTF.mintingFee * 100).toFixed(2)
    : '0'

  const hasLeftovers =
    isReduced && Object.keys(leftoverCollateral).length > 0

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
    <div className="bg-secondary rounded-3xl w-[468px] max-w-full mx-auto relative">
      <div className="relative z-10">
        <SuccessHeader
          showTxs={showTxs}
          onToggleTxs={() => setShowTxs(!showTxs)}
          onClose={handleClose}
          txHash={mintTxHash}
        />

        <div className="px-1 pb-1">
        {/* Convert leftover tokens banner */}
        {hasLeftovers && !conversionDone && (
          <div className="bg-background rounded-[20px] p-6 shadow-[0px_2px_45px_0px_rgba(0,0,0,0.08)]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-light text-primary">
                Convert {leftoverCount} tokens ($
                {formatCurrency(leftoverValue)})
              </span>
              <span className="text-sm font-light text-muted-foreground">
                ≈{formatCurrency(estimatedReturn)} {inputToken.symbol} (-
                {slippagePct}%)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <StackTokenLogo
                  tokens={(basket || [])
                    .filter((t) =>
                      Object.keys(leftoverCollateral).some(
                        (a) => a.toLowerCase() === t.address.toLowerCase()
                      )
                    )
                    .slice(0, 4)
                    .map((t) => ({
                      ...t,
                      chain: indexDTF?.chainId,
                    }))}
                  size={32}
                  overlap={8}
                  reverseStack
                  outsource
                />
                <div className="bg-muted rounded-full p-2">
                  <ChevronDown size={16} className="text-muted-foreground" />
                </div>
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
          <div className="bg-background rounded-[20px] p-6 shadow-[0px_2px_45px_0px_rgba(0,0,0,0.08)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-sm">
                <Check size={16} className="text-primary" />
                <span>Converted {leftoverCount} tokens</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <span className="text-muted-foreground">Received</span>
                <span className="font-medium">
                  {formatCurrency(estimatedReturn)} {inputToken.symbol}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* All Txs expandable */}
        {showTxs && (
          <div className="bg-background rounded-[20px] px-3 mt-1">
            {orderIds.map((id) => (
              <OrderRow key={id} orderId={id} disableFetch />
            ))}
          </div>
        )}

        {/* You Minted */}
        <div className="bg-background rounded-[20px] -mt-8 p-6 shadow-[0px_2px_45px_0px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-light text-primary">
              You Minted:
            </span>
            {isReduced && (
              <span className="text-sm text-muted-foreground line-through font-light">
                {formatTokenAmount(originalDtfAmount)}{' '}
                {indexDTF?.token.symbol}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-[26px] font-light text-primary leading-[24px]">
                {formatTokenAmount(dtfAmount)}
              </span>
              <span className="text-[26px] font-light leading-[30px]">
                {indexDTF?.token.symbol}
              </span>
            </div>
            <TokenLogo
              symbol={indexDTF?.token.symbol || ''}
              address={indexDTF?.id || ''}
              chain={chainId}
              size="xl"
            />
          </div>
          <div className="flex items-center gap-1 mt-2 text-sm font-light">
            <span>${formatCurrency(dtfValue)}</span>
            <span className="text-muted-foreground">
              (-{spreadPct.toFixed(2)}%)
            </span>
          </div>
        </div>

        {/* You Used */}
        <div className="bg-background/80 rounded-[20px] mt-1 p-2">
          <div className="p-4">
            <div className="text-sm font-light text-primary mb-2">
              You Used:
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-[26px] font-light text-primary leading-[24px]">
                  {formatCurrency(parsedAmount)}
                </span>
                <span className="text-[26px] font-light leading-[30px]">
                  {inputToken.symbol}
                </span>
              </div>
              <TokenLogo symbol={inputToken.symbol} size="xl" />
            </div>
            <div className="text-sm font-light mt-2">
              ${formatCurrency(parsedAmount)}
            </div>
          </div>

          {/* Rate + fee info */}
          <div className="flex items-center justify-between px-4 pt-4 pb-2 text-sm border-t border-border">
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
      </div>
    </div>
  )
}

export default Success
