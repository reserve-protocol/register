import { Box } from 'theme-ui'
import ZapError from '../ZapError'
import { useZap } from '../context/ZapContext'
import { useZapTx } from '../context/ZapTxContext'
import ZapApprovalButton from './ZapApprovalButton'
import ZapConfirmButton from './ZapConfirmButton'
import ZapRefreshQuote from './ZapRefreshQuote'

const ZapConfirm = () => {
  const { tokenIn } = useZap()
  const { error } = useZapTx()

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {error && <ZapError error={error} />}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <ZapRefreshQuote>
          <>
            {tokenIn.symbol !== 'ETH' && <ZapApprovalButton />}
            <ZapConfirmButton />
          </>
        </ZapRefreshQuote>
      </Box>
    </Box>
  )
}

export default ZapConfirm
