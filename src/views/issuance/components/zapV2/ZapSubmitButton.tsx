import { useZap } from './context/ZapContext'
import { LoadingButton } from 'components/button'

const ZapSubmitButton = () => {
  const { onSubmit, loadingZap } = useZap()

  return (
    <LoadingButton onClick={onSubmit} loading={loadingZap} text="Zap mint" />
  )
}

export default ZapSubmitButton
