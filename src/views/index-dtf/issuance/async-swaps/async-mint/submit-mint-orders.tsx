import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useMemo } from 'react'
import {
  balanceAfterSwapAtom,
  infoMessageAtom,
  insufficientBalanceAtom,
  selectedTokenBalanceAtom,
  userInputAtom,
} from '../atom'
import { useStableQuoteSignatures } from '../hooks/useQuoteSignatures'

type SubmitMintProps = {
  loadingQuote?: boolean
  insufficientBalance?: boolean
}

const SubmitMintButton = ({
  mutate,
  isPending,
  loadingQuote,
}: {
  mutate: () => void
  isPending: boolean
  loadingQuote?: boolean
}) => {
  const insufficientBalance = useAtomValue(insufficientBalanceAtom)
  const selectedTokenBalance = useAtomValue(selectedTokenBalanceAtom)
  const inputAmount = useAtomValue(userInputAtom)
  const infoMessage = useAtomValue(infoMessageAtom)
  const setBalanceAfterSwap = useSetAtom(balanceAfterSwapAtom)

  const handleSubmit = useCallback(() => {
    setBalanceAfterSwap(selectedTokenBalance?.value || 0n)
    mutate()
  }, [mutate, selectedTokenBalance?.value, setBalanceAfterSwap])

  const disabled = useMemo(
    () =>
      isPending || loadingQuote || !inputAmount || isNaN(Number(inputAmount)),
    [isPending, loadingQuote, inputAmount]
  )

  const buttonText = useMemo(() => {
    if (loadingQuote) {
      return 'Awaiting Quote'
    }
    if (infoMessage) {
      return infoMessage
    }
    if (isPending) {
      return 'Signing...'
    }
    if (insufficientBalance) {
      return 'Insufficient Balance'
    }
    return (
      <span className="flex items-center gap-1">
        <span className="font-bold">Start Mint</span>
        <span className="font-light">- Step 1/2</span>
      </span>
    )
  }, [insufficientBalance, isPending, loadingQuote, infoMessage])

  return (
    <Button
      size="lg"
      className={cn(
        'w-full rounded-xl',
        isPending && 'opacity-50 cursor-not-allowed'
      )}
      onClick={handleSubmit}
      disabled={disabled}
    >
      {buttonText}
    </Button>
  )
}

const SubmitMint = ({ loadingQuote }: SubmitMintProps) => {
  const { mutate, isPending } = useStableQuoteSignatures()

  return (
    <SubmitMintButton
      mutate={mutate}
      isPending={isPending}
      loadingQuote={loadingQuote}
    />
  )
}

export default SubmitMint
