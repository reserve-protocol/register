import ZapError from '../ZapError'
import { useZap } from '../context/ZapContext'
import { useZapTx } from '../context/ZapTxContext'
import ZapApprovalButton from './ZapApprovalButton'
import ZapConfirmButton from './ZapConfirmButton'
import ZapRefreshQuote from './ZapRefreshQuote'
import ZapRevokeButton from './ZapRevokeButton'

const ZapConfirm = () => {
  const { tokenIn } = useZap()
  const { error, needsRevoke, revokeSuccess } = useZapTx()

  const showRevoke = needsRevoke && !revokeSuccess
  const showApproval =
    tokenIn.symbol !== 'ETH' && (!needsRevoke || revokeSuccess)

  return (
    <div className="flex flex-col gap-3">
      {error && <ZapError error={error} />}
      <div className="flex flex-col gap-1">
        <ZapRefreshQuote>
          <>
            {showRevoke && <ZapRevokeButton />}
            {showApproval && <ZapApprovalButton />}
            <ZapConfirmButton />
          </>
        </ZapRefreshQuote>
      </div>
    </div>
  )
}

export default ZapConfirm
