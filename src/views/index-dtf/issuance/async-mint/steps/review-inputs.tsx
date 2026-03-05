import TokenLogoWithChain from '@/components/token-logo/TokenLogoWithChain'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { chainIdAtom } from '@/state/atoms'
import { indexDTFBasketAtom } from '@/state/dtf/atoms'
import { formatCurrency, formatTokenAmount } from '@/utils'
import { useAtomValue, useSetAtom } from 'jotai'
import { ArrowLeft } from 'lucide-react'
import { formatUnits } from 'viem'
import {
  collateralAllocationAtom,
  inputTokenAtom,
  wizardStepAtom,
} from '../atoms'
import { useAllocationData } from '../hooks/use-collateral-allocation'

const ReviewInputs = () => {
  const setStep = useSetAtom(wizardStepAtom)
  const allocation = useAtomValue(collateralAllocationAtom)
  const basket = useAtomValue(indexDTFBasketAtom)
  const chainId = useAtomValue(chainIdAtom)
  const inputToken = useAtomValue(inputTokenAtom)

  // Ensure allocation data is loaded
  useAllocationData()

  const entries = Object.entries(allocation)

  return (
    <div className="bg-secondary rounded-3xl p-1 w-full max-w-[468px] mx-auto my-4 flex flex-col max-h-[calc(100vh-120px-64px)] lg:max-h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="px-6 pt-6 pb-5 flex flex-col gap-4 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-background h-8 w-8"
          onClick={() => setStep('amount-input')}
        >
          <ArrowLeft size={16} />
        </Button>
        <div className="flex flex-col gap-1.5">
          <h2 className="text-xl font-semibold text-primary">
            Review your inputs
          </h2>
          <p className="text-base font-light">
            Your collateral is used up to each token's basket weight or your
            available balance, whichever is less. The remaining amount is covered
            by {inputToken.symbol}.
          </p>
        </div>
      </div>

      {/* Token cards */}
      <div className="flex-1 min-h-0 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        <div className="flex flex-col gap-0.5">
          {entries.length === 0 ? (
            <Skeleton className="h-32 rounded-[20px]" />
          ) : (
            entries.map(([address, alloc]) => {
              const token = basket?.find(
                (t) => t.address.toLowerCase() === address.toLowerCase()
              )
              const decimals = token?.decimals ?? 18
              const totalAmount = alloc.fromWallet + alloc.fromSwap
              const formattedAmount = formatTokenAmount(
                Number(formatUnits(totalAmount, decimals))
              )

              return (
                <div
                  key={address}
                  className="bg-background rounded-[20px] p-4 flex flex-col gap-3"
                >
                  <div className="flex items-center gap-3">
                    <TokenLogoWithChain
                      address={address}
                      symbol={token?.symbol || ''}
                      chain={chainId}
                      size="xl"
                    />
                    <div className="flex flex-col">
                      <span className="font-semibold text-base">
                        ${formatCurrency(alloc.usdValue)}
                      </span>
                      <span className="text-sm text-muted-foreground font-light">
                        {formattedAmount} {token?.symbol}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-semibold">
                      {alloc.explanation}
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="p-1 pt-2 shrink-0">
        <Button
          size="lg"
          className="w-full h-[49px] rounded-[20px]"
          disabled={entries.length === 0}
          onClick={() => setStep('quote-summary')}
        >
          Confirm & Get Quote
        </Button>
      </div>
    </div>
  )
}

export default ReviewInputs
