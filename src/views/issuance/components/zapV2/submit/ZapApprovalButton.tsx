import { useZap } from '../context/ZapContext'
import { LoadingButton } from 'components/button'

const ZapApprovalButton = ({
  approve,
  isLoading,
}: {
  approve?: () => void
  isLoading: boolean
}) => {
  const { loadingZap, selectedToken } = useZap()

  return (
    <LoadingButton
      onClick={approve}
      loading={loadingZap}
      text={`Approve use of ${selectedToken?.symbol}`}
      fullWidth
    />
  )
}

export default ZapApprovalButton
