import { LoadingButton } from 'components/button'
import EstimatedGasInfo from 'components/transaction-modal/EstimatedGasInfo'
import { useEffect } from 'react'
import { Box } from 'theme-ui'
import { TRANSACTION_STATUS } from 'utils/constants'
import useAuctions from './useAuctions'

const ConfirmAuction = ({ onClose }: { onClose(): void }) => {
  const { tx, onExecute, fee, status } = useAuctions()
  const isLoading =
    status === TRANSACTION_STATUS.PENDING ||
    status === TRANSACTION_STATUS.SIGNING

  useEffect(() => {
    if (
      status === TRANSACTION_STATUS.MINING ||
      status === TRANSACTION_STATUS.CONFIRMED
    ) {
      onClose()
    }
  }, [status])

  return (
    <Box p={4} sx={{ borderTop: '1px solid', borderColor: 'text' }}>
      <LoadingButton
        sx={{ width: '100%' }}
        text="Trigger auctions"
        variant="primary"
        disabled={!fee}
        loading={isLoading}
        onClick={onExecute}
      />
      {!!tx && <EstimatedGasInfo mt={3} fee={fee} />}
    </Box>
  )
}

export default ConfirmAuction
