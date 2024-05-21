import { useCallback, useMemo } from 'react'
import { useZap } from '../context/ZapContext'
import { LoadingButton } from 'components/button'
import { TransactionButtonContainer } from 'components/button/TransactionButton'
import mixpanel from 'mixpanel-browser'

const ZapSubmitButton = () => {
  const {
    setOpenSubmitModal,
    loadingZap,
    validatingZap,
    amountIn,
    amountOut,
    operation,
    error,
    endpoint,
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
    [error, amountIn, amountOut]
  )

  const onSubmit = useCallback(() => {
    setOpenSubmitModal(true)

    mixpanel.track('Clicked Zap', {
      Operation: operation,
      Endpoint: endpoint,
    })
  }, [setOpenSubmitModal, operation, endpoint])

  return (
    <TransactionButtonContainer sx={{ width: '100%' }}>
      <LoadingButton
        onClick={onSubmit}
        loading={loadingZap || validatingZap}
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
