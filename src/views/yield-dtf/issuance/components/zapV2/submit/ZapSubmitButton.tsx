import { Button } from '@/components/ui/button'
import { TransactionButtonContainer } from '@/components/ui/transaction-button'
import { Loader2 } from 'lucide-react'
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

  const isLoading = loadingZap || validatingZap

  return (
    <>
      <TransactionButtonContainer className="w-full">
        <Button
          onClick={onSubmit}
          disabled={disabled || isLoading}
          className="w-full"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? 'Finding route...' : title}
        </Button>
      </TransactionButtonContainer>
      <DisabledByGeolocationMessage />
    </>
  )
}

export default ZapSubmitButton
