import { Button } from '@/components/ui/button'
import TransactionsIcon from 'components/icons/TransactionsIcon'
import { Loader2 } from 'lucide-react'
import { useZap } from '../context/ZapContext'
import { useZapTx } from '../context/ZapTxContext'
import ZapGasCost from '../overview/ZapGasCost'

const ZapConfirmButton = () => {
  const { operation, zapResult, validatingZap, loadingZap } = useZap()
  const {
    hasAllowance,
    approvalSuccess,
    loadingTx,
    validatingTx,
    sendTransaction,
    receipt,
    onGoingConfirmation,
  } = useZapTx()

  if (onGoingConfirmation) {
    return (
      <div className="flex items-center">
        <div className="flex items-center gap-4">
          <TransactionsIcon />
          <div>
            <span className="font-bold block">
              {!receipt
                ? `Confirm ${operation}`
                : receipt.status === 'success'
                  ? 'Transaction Submitted'
                  : 'Transaction Failed'}
            </span>
            {(loadingTx ||
              validatingTx ||
              (approvalSuccess && validatingZap)) && (
              <span className="text-legend">
                {!validatingTx &&
                  !loadingTx &&
                  validatingZap &&
                  'Validating transaction'}
                {loadingTx && 'Proceed in wallet'}
                {validatingTx && 'Confirming transaction'}
              </span>
            )}
          </div>
        </div>
        {(loadingTx || validatingTx || (approvalSuccess && validatingZap)) && (
          <Loader2 className="ml-auto h-4 w-4 animate-spin" />
        )}
      </div>
    )
  }

  const isLoading = !zapResult || loadingZap || validatingZap

  return (
    <div>
      {hasAllowance && (
        <Button
          onClick={() => sendTransaction?.()}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading
            ? 'Finding route...'
            : operation === 'mint'
              ? 'Confirm Mint'
              : 'Confirm Redeem'}
        </Button>
      )}
      <ZapGasCost className="mt-2" />
    </div>
  )
}

export default ZapConfirmButton
