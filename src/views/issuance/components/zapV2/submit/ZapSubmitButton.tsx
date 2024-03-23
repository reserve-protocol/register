import { useMemo } from 'react'
import { useZap } from '../context/ZapContext'
import { LoadingButton } from 'components/button'
import { TransactionButtonContainer } from 'components/button/TransactionButton'

const ZapSubmitButton = () => {
  const {
    setOpenSubmitModal,
    loadingZap,
    amountIn,
    amountOut,
    operation,
    error,
  } = useZap()

  const title = useMemo(() => {
    if (error && error.submitButtonTitle) return error.submitButtonTitle
    return operation === 'mint' ? 'Zap Mint' : 'Zap Redeem'
  }, [error, operation])

  const disabled = useMemo(
    () =>
      !amountIn ||
      Number(amountIn) === 0 ||
      error?.disableSubmit ||
      !amountOut ||
      Number(amountOut) === 0,
    [error, amountIn]
  )

  return (
    <TransactionButtonContainer sx={{ width: '100%' }}>
      <LoadingButton
        onClick={() => setOpenSubmitModal(true)}
        loading={loadingZap}
        text={title}
        backgroundColor={error?.color || 'primary'}
        disabled={disabled}
        loadingText="Finding route..."
        fullWidth
      />
    </TransactionButtonContainer>
  )
}

export default ZapSubmitButton
