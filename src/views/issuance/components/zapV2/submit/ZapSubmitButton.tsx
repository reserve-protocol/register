import { useZap } from '../context/ZapContext'
import { LoadingButton } from 'components/button'

const ZapSubmitButton = () => {
  const { setOpenSubmitModal, loadingZap, amountOut, operation } = useZap()

  return (
    <LoadingButton
      onClick={() => setOpenSubmitModal(true)}
      loading={loadingZap}
      text={operation === 'mint' ? 'Zap Mint' : 'Zap Redeem'}
      disabled={!amountOut || Number(amountOut) === 0}
      fullWidth
    />
  )
}

export default ZapSubmitButton
