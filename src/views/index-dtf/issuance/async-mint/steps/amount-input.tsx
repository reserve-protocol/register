import { Button } from '@/components/ui/button'
import { NumericalInput } from '@/components/ui/input'
import { balancesAtom } from '@/state/atoms'
import { formatCurrency } from '@/utils'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { ArrowLeft, Minus, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { formatUnits } from 'viem'
import {
  inputTokenAtom,
  mintAmountAtom,
  mintStrategyAtom,
  wizardStepAtom,
} from '../atoms'
const AmountInput = () => {
  const setStep = useSetAtom(wizardStepAtom)
  const strategy = useAtomValue(mintStrategyAtom)
  const inputToken = useAtomValue(inputTokenAtom)
  const [amount, setAmount] = useAtom(mintAmountAtom)
  const balances = useAtomValue(balancesAtom)
  const [showExplanation, setShowExplanation] = useState(false)

  const inputBalance = balances[inputToken.address]
  const availableBalance = inputBalance
    ? Number(formatUnits(inputBalance.value ?? 0n, inputToken.decimals))
    : 0

  // Default to max balance on mount
  useEffect(() => {
    if (!amount && availableBalance > 0) {
      setAmount(availableBalance.toString())
    }
  }, [availableBalance]) // eslint-disable-line react-hooks/exhaustive-deps

  const MIN_MINT_AMOUNT = 1
  const parsedAmount = Number(amount) || 0
  const isValid = parsedAmount >= MIN_MINT_AMOUNT
  const exceedsBalance = parsedAmount > availableBalance

  const handleMax = () => {
    setAmount(availableBalance.toString())
  }

  const backStep =
    strategy === 'partial' ? 'token-selection' : 'collateral-decision'

  const subtitle =
    strategy === 'partial'
      ? `Enter the total amount across all your selected tokens. We'll use your collateral first, then ${inputToken.symbol} for the rest.`
      : `Enter the amount of ${inputToken.symbol} you'd like to use.`

  // Show "Why can't I mint more?" when using partial strategy
  const showConstraintInfo = strategy === 'partial'

  return (
    <div className="bg-secondary rounded-3xl p-1 w-full min-w-[398px] max-w-[468px] mx-auto">
      {/* Header */}
      <div className="flex flex-col min-h-[288px] rounded-[20px]">
        <div className="flex-1 px-6 pt-6 pb-5 flex flex-col justify-between">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-background h-8 w-8"
            onClick={() => setStep(backStep)}
          >
            <ArrowLeft size={16} />
          </Button>

          <div className="flex flex-col gap-1.5">
            <h2 className="text-xl font-semibold text-primary">
              How much would you like to use?
            </h2>
            <p className="text-base font-light">{subtitle}</p>
          </div>
        </div>
      </div>

      {/* Input area */}
      <div className="bg-background rounded-[20px]">
        <div className="p-2">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center w-full">
              {amount && <span className="text-2xl font-light">$</span>}
              <NumericalInput
                variant="transparent"
                value={amount}
                onChange={setAmount}
                placeholder="$0.00"
                className="text-2xl font-light w-full placeholder:text-muted-foreground/50"
              />
            </div>
            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              <span className="text-sm text-muted-foreground font-light">
                Avbl.
              </span>
              <span className="text-sm font-semibold">
                ${formatCurrency(availableBalance)}
              </span>
              <button
                className="text-sm font-medium text-primary bg-muted/50 rounded-full px-2 py-0.5"
                onClick={handleMax}
              >
                Max
              </button>
            </div>
          </div>

          {/* Expandable constraint explanation */}
          {showConstraintInfo && (
            <div className="px-4 pb-2">
              <button
                className="flex items-center justify-between w-full py-2"
                onClick={() => setShowExplanation(!showExplanation)}
              >
                <span className="text-sm font-semibold">
                  Why can&apos;t I mint more?
                </span>
                {showExplanation ? (
                  <Minus size={16} />
                ) : (
                  <Plus size={16} />
                )}
              </button>
              {showExplanation && (
                <p className="text-sm text-muted-foreground font-light pb-2">
                  Your collateral tokens can only be used up to their weight in
                  the DTF. The rest depends on your {inputToken.symbol} balance,
                  which limits your total mint to $
                  {formatCurrency(availableBalance)}.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {exceedsBalance && (
        <div className="text-sm text-destructive px-4 py-1">
          Exceeds your {inputToken.symbol} balance
        </div>
      )}

      {parsedAmount > 0 && parsedAmount < MIN_MINT_AMOUNT && (
        <div className="text-sm text-destructive px-4 py-1">
          Minimum mint amount is $1
        </div>
      )}

      {/* Continue button */}
      <Button
        size="lg"
        className="w-full h-[49px] rounded-[20px] mt-1"
        disabled={!isValid || exceedsBalance}
        onClick={() =>
          setStep(strategy === 'single' ? 'quote-summary' : 'review')
        }
      >
        Continue
      </Button>
    </div>
  )
}

export default AmountInput
