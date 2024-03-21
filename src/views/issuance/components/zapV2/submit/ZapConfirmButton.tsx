import { LoadingButton } from 'components/button'
import { useEffect } from 'react'
import {
  Address,
  usePrepareSendTransaction,
  useSendTransaction,
  useWaitForTransaction,
} from 'wagmi'
import { ZapErrorType, useZap } from '../context/ZapContext'
import TransactionsIcon from 'components/icons/TransactionsIcon'
import { Box, Spinner, Text } from 'theme-ui'
import ZapGasCost from '../overview/ZapGasCost'

type ZapConfirmButtonProps = {
  hasAllowance: boolean
  loadingApproval: boolean
  approvalSuccess: boolean
  setError: (error?: ZapErrorType) => void
}

const ZapConfirmButton = ({
  hasAllowance,
  loadingApproval,
  approvalSuccess,
  setError,
}: ZapConfirmButtonProps) => {
  const { zapResult, chainId, operation } = useZap()

  const { config } = usePrepareSendTransaction(
    zapResult
      ? {
          data: zapResult.tx.data as Address,
          gas: BigInt(zapResult.gas),
          to: zapResult.tx.to as Address,
          value: BigInt(zapResult.tx.value),
        }
      : undefined
  )

  const {
    data,
    isLoading: loadingTx,
    sendTransaction,
    error: sendError,
  } = useSendTransaction(config)

  const {
    data: receipt,
    isLoading: validatingTx,
    error: validatingTxError,
  } = useWaitForTransaction({
    hash: data?.hash,
    chainId,
  })

  useEffect(() => {
    if (approvalSuccess && sendTransaction) {
      sendTransaction()
    }
  }, [approvalSuccess, sendTransaction])

  useEffect(() => {
    if (sendError || validatingTxError) {
      setError({
        title: 'Transaction rejected',
        message: 'Please try again',
        color: 'danger',
        secondaryColor: 'rgba(255, 0, 0, 0.20)',
      })
    } else {
      setError(undefined)
    }
  }, [sendError, validatingTxError, setError])

  if (
    (loadingApproval ||
      approvalSuccess ||
      loadingTx ||
      validatingTx ||
      receipt) &&
    !sendError &&
    !validatingTxError
  ) {
    return (
      <Box variant="layout.verticalAlign">
        <Box variant="layout.verticalAlign" sx={{ gap: 3 }}>
          <TransactionsIcon />
          <Box>
            <Text variant="bold" sx={{ display: 'block' }}>
              {!receipt ? 'Confirm Stake' : 'Transaction submitted'}
            </Text>
            {(loadingTx || validatingTx) && (
              <Text variant="legend">
                {loadingTx && 'Proceed in wallet'}
                {validatingTx && 'Confirming transaction'}
              </Text>
            )}
          </Box>
        </Box>
        {(loadingTx || validatingTx) && <Spinner ml="auto" size={16} />}
      </Box>
    )
  }

  return (
    <Box>
      {hasAllowance && (
        <LoadingButton
          onClick={() => sendTransaction?.()}
          loading={!zapResult}
          text={operation === 'mint' ? 'Confirm Mint' : 'Confirm Redeem'}
          fullWidth
        />
      )}
      <ZapGasCost mt={2} />
    </Box>
  )
}

export default ZapConfirmButton
