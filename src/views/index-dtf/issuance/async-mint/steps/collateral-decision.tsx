import TokenLogo from '@/components/token-logo'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useERC20Balances } from '@/hooks/useERC20Balance'
import { chainIdAtom } from '@/state/atoms'
import { indexDTFBasketAtom } from '@/state/dtf/atoms'
import { useAtomValue, useSetAtom } from 'jotai'
import { Address } from 'viem'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useEffect } from 'react'
import {
  inputTokenAtom,
  mintStrategyAtom,
  selectedCollateralsAtom,
  wizardStepAtom,
} from '../atoms'

const TokenGrid = ({
  tokens,
  chainId,
}: {
  tokens: { address: string; symbol: string }[]
  chainId: number
}) => (
  <div className="grid grid-cols-2 size-8 shrink-0">
    {tokens.slice(0, 4).map((token) => (
      <TokenLogo
        key={token.address}
        address={token.address}
        symbol={token.symbol}
        chain={chainId}
        width={14}
        height={14}
      />
    ))}
  </div>
)

const CollateralDecision = () => {
  const setStep = useSetAtom(wizardStepAtom)
  const setStrategy = useSetAtom(mintStrategyAtom)
  const setSelectedCollaterals = useSetAtom(selectedCollateralsAtom)
  const basket = useAtomValue(indexDTFBasketAtom)
  const chainId = useAtomValue(chainIdAtom)
  const inputToken = useAtomValue(inputTokenAtom)

  const { data: balances, isLoading } = useERC20Balances(
    (basket || []).map((token) => ({
      address: token.address,
      chainId,
    }))
  )

  // If user holds NO basket tokens (excluding input token), skip to single strategy
  const hasBasketTokens =
    balances &&
    basket &&
    (balances as bigint[]).some(
      (b, i) =>
        b > 0n &&
        basket[i].address.toLowerCase() !== inputToken.address.toLowerCase()
    )

  useEffect(() => {
    if (!isLoading && balances && !hasBasketTokens) {
      setStrategy('single')
      setStep('amount-input')
    }
  }, [isLoading, balances, hasBasketTokens, setStrategy, setStep])

  if (isLoading || !basket) {
    return <Skeleton className="mx-auto w-full max-w-[468px] h-[525px]" />
  }

  const handlePartial = () => {
    setStrategy('partial')
    setStep('token-selection')
  }

  const handleSingle = () => {
    setStrategy('single')
    setSelectedCollaterals(new Set<Address>())
    setStep('quote-summary')
  }

  return (
    <div className="bg-secondary rounded-3xl p-1 w-full max-w-[468px] mx-auto">
      {/* Header area */}
      <div className="flex flex-col min-h-[353px] rounded-[20px]">
        <div className="flex-1 px-6 pt-6 pb-5 flex flex-col justify-between">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-background h-8 w-8"
            onClick={() => setStep('operation-select')}
          >
            <ArrowLeft size={16} />
          </Button>

          <div className="flex flex-col gap-1.5">
            <h2 className="text-xl font-semibold text-primary max-w-[380px]">
              Would you like to use tokens you already have that are part of the
              DTF?
            </h2>
            <p className="text-base font-light">
              If you hold tokens that back this DTF, we can include them in your
              mint.
            </p>
          </div>
        </div>
      </div>

      {/* Option cards */}
      <div className="flex flex-col gap-0.5">
        <button
          className="bg-background rounded-[20px] p-3 w-full text-left transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handlePartial}
          disabled={!hasBasketTokens}
        >
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <TokenGrid tokens={basket} chainId={chainId} />
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="font-medium text-base">
                  Yes, use tokens I already have
                </span>
                <span className="text-sm text-muted-foreground font-light">
                  {hasBasketTokens
                    ? 'Also use tokens I hold that are part of this DTF'
                    : "You don't hold any of this DTF's basket tokens."}
                </span>
              </div>
            </div>
            {hasBasketTokens && (
              <div className="bg-muted group-hover:bg-primary group-hover:text-primary-foreground size-8 rounded-full flex items-center justify-center transition-colors shrink-0 ml-3">
                <ArrowRight size={16} strokeWidth={1.5} />
              </div>
            )}
          </div>
        </button>

        <button
          className="bg-background rounded-[20px] p-3 w-full text-left transition-colors group"
          onClick={handleSingle}
        >
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <TokenLogo symbol={inputToken.symbol} size="xl" />
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="font-medium text-base">
                  No, Mint using only {inputToken.symbol}
                </span>
                <span className="text-sm text-muted-foreground font-light">
                  Swap {inputToken.symbol} for all the tokens I need to mint the
                  DTF
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

export default CollateralDecision
