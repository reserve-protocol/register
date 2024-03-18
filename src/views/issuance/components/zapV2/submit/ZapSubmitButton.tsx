import { useZap } from '../context/ZapContext'
import { LoadingButton } from 'components/button'

const ZapSubmitButton = () => {
  const { setOpenSubmitModal, loadingZap } = useZap()

  return (
    <LoadingButton
      onClick={() => setOpenSubmitModal(true)}
      loading={loadingZap}
      text="Zap mint"
      fullWidth
    />
  )
}

export default ZapSubmitButton
