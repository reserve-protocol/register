import { LoadingButton } from '@/components/old/button'
import { TransactionButtonContainer } from '@/components/old/button/TransactionButton'
import mixpanel from 'mixpanel-browser/src/loaders/loader-module-core'
import { useCallback, useMemo } from 'react'
import DisabledByGeolocationMessage from 'state/geolocation/DisabledByGeolocationMessage'
import { useZap } from '../context/ZapContext'

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
    <>
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
      <DisabledByGeolocationMessage />
    </>
  )
}

export default ZapSubmitButton
