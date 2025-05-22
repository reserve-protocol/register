import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useQuoteSignatures } from '../hooks/useQuoteSignatures'

type SubmitMintProps = {
  loadingQuote?: boolean
}

const SubmitMint = ({ loadingQuote }: SubmitMintProps) => {
  const { mutate, data: orderData, isPending } = useQuoteSignatures()

  return (
    <div>
      <Button
        size="lg"
        className={cn(
          'w-full rounded-xl',
          isPending && 'opacity-50 cursor-not-allowed'
        )}
        onClick={() => mutate()}
        disabled={isPending}
      >
        {isPending ? (
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
