import { Button } from '@/components/ui/button'
import { indexDTFAtom, indexDTFPriceAtom } from '@/state/dtf/atoms'
import { indexDTFBasketAtom } from '@/state/dtf/atoms'
import { formatCurrency, formatTokenAmount } from '@/utils'
import { useAtomValue, useSetAtom } from 'jotai'
import { ArrowLeft, ArrowRight, Check, Plus, Undo2 } from 'lucide-react'
import { useMemo } from 'react'
import { Address, formatEther, formatUnits } from 'viem'
import {
  folioDetailsAtom,
  inputTokenAtom,
  leftoverCollateralAtom,
  mintAmountAtom,
  mintSharesAtom,
  recoveryChoiceAtom,
  slippageAtom,
  tokenPricesAtom,
  walletBalancesAtom,
  wizardStepAtom,
} from '../atoms'
import {
  calculateReducedMint,
  calculateReversalEstimate,
  calculateTopUp,
} from '../hooks/use-recovery'
import { useReverseOrders } from '../hooks/use-reverse-orders'

const RecoveryOptions = () => {
  const setStep = useSetAtom(wizardStepAtom)
  const setRecoveryChoice = useSetAtom(recoveryChoiceAtom)
  const setLeftoverCollateral = useSetAtom(leftoverCollateralAtom)

  const indexDTF = useAtomValue(indexDTFAtom)
  const dtfPrice = useAtomValue(indexDTFPriceAtom) || 0
  const mintAmount = useAtomValue(mintAmountAtom)
  const mintShares = useAtomValue(mintSharesAtom)
  const inputToken = useAtomValue(inputTokenAtom)
  const walletBalances = useAtomValue(walletBalancesAtom)
  const tokenPrices = useAtomValue(tokenPricesAtom)
  const folioDetails = useAtomValue(folioDetailsAtom)
  const slippage = useAtomValue(slippageAtom)
  const basket = useAtomValue(indexDTFBasketAtom)

  const { reverseAsync, isPending: isReversing } = useReverseOrders()

  const parsedAmount = Number(mintAmount)
  const slippageBps = Number(slippage)

  const decimalsMap = useMemo(() => {
    const map: Record<Address, number> = {}
    if (basket) {
      for (const token of basket) {
        map[token.address.toLowerCase() as Address] = token.decimals
      }
    }
    return map
  }, [basket])

  const totalAcquiredUsd = useMemo(() => {
    let total = 0
    for (const [addr, amount] of Object.entries(walletBalances)) {
      const price = tokenPrices[addr as Address] ?? 0
      const dec = decimalsMap[addr as Address] ?? 18
      total += Number(formatUnits(amount, dec)) * price
    }
    return total
  }, [walletBalances, tokenPrices, decimalsMap])

  const topUp = useMemo(() => {
    return calculateTopUp(parsedAmount, totalAcquiredUsd)
  }, [parsedAmount, totalAcquiredUsd])

  const reduced = useMemo(() => {
    if (!folioDetails) {
      return { reducedShares: 0n, unusedCollateral: {}, swapLossEstimate: 0 }
    }
    return calculateReducedMint({
      acquiredBalances: walletBalances,
      assets: folioDetails.assets,
      mintValues: folioDetails.mintValues,
      folioAmount: mintShares,
      dtfPrice,
      slippageBps,
    })
  }, [walletBalances, folioDetails, mintShares, dtfPrice, slippageBps])

  const reducedDtfAmount = Number(formatEther(reduced.reducedShares))

  const reversal = useMemo(() => {
    return calculateReversalEstimate(
      walletBalances,
      tokenPrices,
      decimalsMap as Record<Address, number>,
      slippageBps
    )
  }, [walletBalances, tokenPrices, decimalsMap, slippageBps])

  const unusedCollateralValue = useMemo(() => {
    let total = 0
    for (const [addr, amount] of Object.entries(reduced.unusedCollateral)) {
      const price = tokenPrices[addr as Address] ?? 0
      const dec = decimalsMap[addr as Address] ?? 18
      total += Number(formatUnits(amount, dec)) * price
    }
    return total
  }, [reduced.unusedCollateral, tokenPrices, decimalsMap])

  const handleTopUp = () => {
    setRecoveryChoice('top-up')
    setStep('quote-summary')
  }

  const handleReducedMint = () => {
    setRecoveryChoice('mint-reduced')
    setLeftoverCollateral(reduced.unusedCollateral)
    setStep('quote-summary')
  }

  const handleCancel = async () => {
    setRecoveryChoice('cancel')
    try {
      await reverseAsync(walletBalances)
      setStep('success')
    } catch {
      // User rejected or tx failed — stay on recovery screen
    }
  }

  return (
    <div className="bg-secondary rounded-3xl p-1 w-full max-w-[468px] mx-auto">
      {/* Header */}
      <div className="px-6 pt-6 pb-5 flex flex-col gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-background h-8 w-8"
          onClick={() => setStep('processing')}
        >
          <ArrowLeft size={16} />
        </Button>
        <div className="flex flex-col gap-1.5">
          <h2 className="text-xl font-semibold text-primary">
            Prices have moved
          </h2>
          <p className="text-base font-light">
            Your funds are safe, but we couldn&apos;t complete the mint as
            quoted. Choose how you&apos;d like to proceed.
          </p>
        </div>
      </div>

      {/* Option cards */}
      <div className="flex flex-col gap-0.5">
        {/* Option 1: Top up */}
        <button
          className="bg-background rounded-[20px] p-3 w-full text-left transition-colors group"
          onClick={handleTopUp}
        >
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="size-8 rounded-full border border-border flex items-center justify-center shrink-0">
                <Plus size={16} strokeWidth={1.5} />
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="font-medium text-base">
                  Top up and mint full amount
                </span>
                <span className="text-sm text-muted-foreground font-light">
                  Approve an additional{' '}
                  <span className="font-semibold text-foreground">
                    ${formatCurrency(topUp.topUpAmount)} {inputToken.symbol}
                  </span>{' '}
                  to receive {formatTokenAmount(parsedAmount / (dtfPrice || 1))}{' '}
                  {indexDTF?.token.symbol}
                </span>
              </div>
            </div>
            <div className="bg-muted group-hover:bg-primary group-hover:text-primary-foreground size-8 rounded-full flex items-center justify-center transition-colors shrink-0 ml-3">
              <ArrowRight size={16} strokeWidth={1.5} />
            </div>
          </div>
        </button>

        {/* Option 2: Mint reduced */}
        <div className="flex flex-col">
          <button
            className="bg-background rounded-[20px] p-3 w-full text-left transition-colors group"
            onClick={handleReducedMint}
          >
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="size-8 rounded-full border border-border flex items-center justify-center shrink-0">
                  <Check size={16} strokeWidth={1.5} />
                </div>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="font-medium text-base">
                    Mint with what&apos;s approved
                  </span>
                  <span className="text-sm text-muted-foreground font-light">
                    Receive{' '}
                    <span className="font-semibold text-foreground">
                      {formatTokenAmount(reducedDtfAmount)}{' '}
                      {indexDTF?.token.symbol}
                    </span>{' '}
                    using only your current inputs
                  </span>
                </div>
              </div>
              <div className="bg-muted group-hover:bg-primary group-hover:text-primary-foreground size-8 rounded-full flex items-center justify-center transition-colors shrink-0 ml-3">
                <ArrowRight size={16} strokeWidth={1.5} />
              </div>
            </div>
          </button>
          {unusedCollateralValue > 0 && (
            <p className="text-sm text-muted-foreground font-light px-6 py-2">
              ≈${formatCurrency(unusedCollateralValue)} {inputToken.symbol}{' '}
              returned from unused collateral
              {reduced.swapLossEstimate > 0 &&
                ` (~${reduced.swapLossEstimate.toFixed(1)}% swap loss)`}
              .
            </p>
          )}
        </div>

        {/* Option 3: Cancel and reverse */}
        <button
          className="bg-yellow-50 dark:bg-yellow-900/20 rounded-[20px] p-3 w-full text-left hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
          onClick={handleCancel}
          disabled={isReversing}
        >
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="size-8 rounded-full border border-border flex items-center justify-center shrink-0">
                <Undo2 size={16} strokeWidth={1.5} />
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="font-medium text-base text-destructive">
                  Cancel and reverse swaps
                </span>
                <span className="text-sm text-muted-foreground font-light">
                  Swap collateral back to {inputToken.symbol}.{' '}
                  <span className="font-semibold text-foreground">
                    Est. return: ≈${formatCurrency(reversal.estimatedReturn)}
                  </span>{' '}
                  of your original ${formatCurrency(parsedAmount)}.
                </span>
              </div>
            </div>
            <div className="bg-muted group-hover:bg-primary group-hover:text-primary-foreground size-8 rounded-full flex items-center justify-center transition-colors shrink-0 ml-3">
              <ArrowRight size={16} strokeWidth={1.5} />
            </div>
          </div>
        </button>
      </div>
    </div>
  )
}

export default RecoveryOptions
