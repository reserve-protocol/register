import { Button } from '@/components/ui/button'
import TokenLogo from 'components/icons/TokenLogo'
import { Check, Loader2 } from 'lucide-react'
import { useZap } from '../context/ZapContext'
import { useZapTx } from '../context/ZapTxContext'

const ZapApprovalButton = () => {
  const { tokenIn, loadingZap, validatingZap } = useZap()
  const {
    hasAllowance,
    loadingApproval,
    validatingApproval,
    approve,
    approvalSuccess,
    error,
  } = useZapTx()

  if (loadingApproval) {
    return (
      <div className="flex items-center mb-4">
        <TokenLogo width={24} symbol={tokenIn.symbol} />
        <div className="ml-4">
          <span className="font-bold block">
            Approve in wallet
          </span>
          <span className="text-legend">
            {!validatingApproval && 'Proceed in wallet'}
            {validatingApproval && 'Confirming transaction'}
          </span>
        </div>
        <Loader2 className="ml-auto h-4 w-4 animate-spin" />
      </div>
    )
  }

  if (approvalSuccess && !error) {
    return (
      <div className="flex items-center gap-4 mb-4">
        <Check size={24} />
        <span className="text-legend font-bold">
          {tokenIn.symbol} Approved
        </span>
      </div>
    )
  }

  if (hasAllowance) return null

  const isLoading = loadingApproval || loadingZap || validatingZap

  return (
    <Button onClick={approve} disabled={isLoading} className="w-full">
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isLoading
        ? loadingApproval
          ? 'Approving...'
          : 'Finding route...'
        : `Approve use of ${tokenIn.symbol}`}
    </Button>
  )
}

export default ZapApprovalButton
