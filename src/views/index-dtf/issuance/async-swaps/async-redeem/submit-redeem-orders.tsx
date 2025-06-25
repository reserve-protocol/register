import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { redeemAssetsAtom } from '../atom'
import { useStableQuoteSignatures } from '../hooks/useQuoteSignatures'

type SubmitRedeemOrdersProps = {
  loadingQuote?: boolean
}

const SubmitRedeemButton = ({
  mutate,
  isPending,
  loadingQuote,
}: {
  mutate: () => void
  isPending: boolean
  loadingQuote?: boolean
}) => {
  const redeemAssets = useAtomValue(redeemAssetsAtom)

  const disabled = useMemo(
    () =>
      isPending ||
      loadingQuote ||
      !redeemAssets ||
      Object.keys(redeemAssets).length === 0,
    [isPending, loadingQuote, redeemAssets]
  )

  const buttonText = useMemo(() => {
    if (loadingQuote) {
      return 'Awaiting Quote'
    }
    if (isPending) {
      return 'Signing...'
    }
    return (
      <span className="flex items-center gap-1">
        <span className="font-bold">Sell Collateral for USDC</span>
        <span className="font-light">- Step 2/2</span>
      </span>
    )
  }, [isPending, loadingQuote])

  return (
    <Button
      size="lg"
      className={cn(
        'w-full rounded-xl',
        isPending && 'opacity-50 cursor-not-allowed'
      )}
      onClick={() => mutate()}
      disabled={disabled}
    >
      {buttonText}
    </Button>
  )
}

const SubmitRedeemOrders = ({ loadingQuote }: SubmitRedeemOrdersProps) => {
  const { mutate, isPending } = useStableQuoteSignatures()

  return (
    <SubmitRedeemButton
      mutate={mutate}
      isPending={isPending}
      loadingQuote={loadingQuote}
    />
  )
}

export default SubmitRedeemOrders
