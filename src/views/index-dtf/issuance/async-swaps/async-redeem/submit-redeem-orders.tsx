import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAtomValue } from 'jotai'
import { redeemAssetsAtom } from '../atom'
import { useQuoteSignatures } from '../hooks/useQuoteSignatures'

type SubmitRedeemOrdersProps = {
  loadingQuote?: boolean
}

const SubmitRedeemOrders = ({ loadingQuote }: SubmitRedeemOrdersProps) => {
  const redeemAssets = useAtomValue(redeemAssetsAtom)
  const { mutate, isPending } = useQuoteSignatures()

  const disabled =
    isPending ||
    loadingQuote ||
    !redeemAssets ||
    Object.keys(redeemAssets).length === 0

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
        {isPending ? (
          'Signing...'
        ) : loadingQuote ? (
          'Awaiting Quote'
        ) : (
          <span className="flex items-center gap-1">
            <span className="font-bold">Sell Collateral for USDC</span>
            <span className="font-light">- Step 2/2</span>
          </span>
        )}
      </Button>
    </div>
  )
}

export default SubmitRedeemOrders
