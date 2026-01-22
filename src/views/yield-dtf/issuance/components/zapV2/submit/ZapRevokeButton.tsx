import { Button } from '@/components/ui/button'
import TokenLogo from 'components/icons/TokenLogo'
import { Loader2 } from 'lucide-react'
import { useZap } from '../context/ZapContext'
import { useZapTx } from '../context/ZapTxContext'
import Help from 'components/help'

const ZapRevokeButton = () => {
  const { tokenIn, loadingZap, validatingZap } = useZap()

  const { loadingRevoke, validatingRevoke, revoke } = useZapTx()

  if (loadingRevoke) {
    return (
      <div className="flex items-center mb-4">
        <TokenLogo width={24} symbol={tokenIn.symbol} />
        <div className="ml-4">
          <span className="font-bold block">
            Revoke in wallet
          </span>
          <span className="text-legend">
            {!validatingRevoke && 'Proceed in wallet'}
            {validatingRevoke && 'Confirming transaction'}
          </span>
        </div>
        <Loader2 className="ml-auto h-4 w-4 animate-spin" />
      </div>
    )
  }

  const isLoading = loadingRevoke || loadingZap || validatingZap

  return (
    <div className="flex flex-col items-center gap-2 mb-6">
      <Button onClick={revoke} disabled={isLoading} className="w-full">
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isLoading
          ? loadingRevoke
            ? 'Revoking...'
            : 'Finding route...'
          : `Revoke existing ${tokenIn.symbol} allowance`}
      </Button>
      <div className="flex items-center gap-1">
        <span className="text-legend text-xs">
          Why I do need to revoke my allowance?
        </span>
        <Help content="Due to how USDT approvals are managed, we need to reset your current allowance to zero before updating it to a new value. This step is necessary for completing your transaction." />
      </div>
    </div>
  )
}

export default ZapRevokeButton
