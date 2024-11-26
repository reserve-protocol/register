import { Box } from 'theme-ui'
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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {error && <ZapError error={error} />}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <ZapRefreshQuote>
          <>
            {showRevoke && <ZapRevokeButton />}
            {showApproval && <ZapApprovalButton />}
            <ZapConfirmButton />
          </>
        </ZapRefreshQuote>
      </Box>
    </Box>
  )
}

export default ZapConfirm
