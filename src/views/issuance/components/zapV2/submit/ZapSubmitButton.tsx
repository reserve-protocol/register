import { useCallback, useMemo } from 'react'
import { useZap } from '../context/ZapContext'
import { LoadingButton } from 'components/button'
import { TransactionButtonContainer } from 'components/button/TransactionButton'
import mixpanel from 'mixpanel-browser'
import DisabledByGeolocationMessage from 'state/geolocation/DisabledByGeolocationMessage'
import { Box, Text } from 'theme-ui'
import AlertIcon from 'components/icons/AlertIcon'
import { rTokenAtom } from 'state/atoms'
import { useAtomValue } from 'jotai'

const NoSupplyWarning = () => {
  const rToken = useAtomValue(rTokenAtom)

  if (rToken?.supply !== 0) {
    return null
  }

  return (
    <Box variant="layout.verticalAlign" sx={{ gap: 2 }}>
      <AlertIcon />
      <Text variant="warning">
        Zap minting is not available for RTokens with $0 TVL
      </Text>
    </Box>
  )
}

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
    chainId,
    zapToYieldPosition,
  } = useZap()

  const title = useMemo(() => {
    if (error && error.submitButtonTitle) return error.submitButtonTitle
    if (zapToYieldPosition) {
      return 'Zap Deposit'
    }
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
      <TransactionButtonContainer sx={{ width: '100%' }} chain={chainId}>
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
      <NoSupplyWarning />
    </>
  )
}

export default ZapSubmitButton
