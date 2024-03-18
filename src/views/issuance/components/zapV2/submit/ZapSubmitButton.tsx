import { useZap } from '../context/ZapContext'
import { LoadingButton } from 'components/button'

const ZapSubmitButton = () => {
  const { setOpenSubmitModal, loadingZap, amountOut } = useZap()

  return (
    <LoadingButton
      onClick={() => setOpenSubmitModal(true)}
      loading={loadingZap}
      text="Zap mint"
      disabled={!amountOut || Number(amountOut) === 0}
      fullWidth
    />
  )
}

export default ZapSubmitButton
