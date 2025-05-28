import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useQuoteSignatures } from '../hooks/useQuoteSignatures'
import { insufficientBalanceAtom, userInputAtom } from '../atom'
import { useAtomValue } from 'jotai'

type SubmitMintProps = {
  loadingQuote?: boolean
  insufficientBalance?: boolean
}

const SubmitMint = ({ loadingQuote }: SubmitMintProps) => {
  const inputAmount = useAtomValue(userInputAtom)
  const insufficientBalance = useAtomValue(insufficientBalanceAtom)
  const { data, mutate, isPending } = useQuoteSignatures()

  const disabled =
    isPending ||
    loadingQuote ||
    !inputAmount ||
    isNaN(Number(inputAmount)) ||
    insufficientBalance

  return (
    <div>
      <Button
        size="lg"
        className={cn(
          'w-full rounded-xl',
          isPending && 'opacity-50 cursor-not-allowed'
        )}
        onClick={() => mutate()}
        disabled={disabled}
      >
        {insufficientBalance ? (
          'Insufficient Balance'
        ) : isPending ? (
          'Signing...'
        ) : loadingQuote ? (
          'Awaiting Quote'
        ) : (
          <span className="flex items-center gap-1">
            <span className="font-bold">Start Mint</span>
            <span className="font-light">- Step 1/2</span>
          </span>
        )}
      </Button>
    </div>
  )
}

export default SubmitMint
