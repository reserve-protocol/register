import { LoadingButton } from 'components/button'
import TransactionsIcon from 'components/icons/TransactionsIcon'
import { Box, Spinner, Text } from 'theme-ui'
import { useZap } from '../context/ZapContext'
import { useZapTx } from '../context/ZapTxContext'
import ZapGasCost from '../overview/ZapGasCost'

const ZapConfirmButton = () => {
  const { operation, zapResult, validatingZap } = useZap()
  const {
    hasAllowance,
    loadingApproval,
    approvalSuccess,
    loadingTx,
    validatingTx,
    sendTransaction,
    receipt,
    error,
  } = useZapTx()

  if (
    (loadingApproval ||
      approvalSuccess ||
      loadingTx ||
      validatingTx ||
      receipt) &&
    !error
  ) {
    return (
      <Box variant="layout.verticalAlign">
        <Box variant="layout.verticalAlign" sx={{ gap: 3 }}>
          <TransactionsIcon />
          <Box>
            <Text variant="bold" sx={{ display: 'block' }}>
              {!receipt ? `Confirm ${operation}` : 'Transaction submitted'}
            </Text>
            {(loadingTx ||
              validatingTx ||
              (approvalSuccess && validatingZap)) && (
              <Text variant="legend">
                {!validatingTx &&
                  !loadingTx &&
                  validatingZap &&
                  'Validating transaction'}
                {loadingTx && 'Proceed in wallet'}
                {validatingTx && 'Confirming transaction'}
              </Text>
            )}
          </Box>
        </Box>
        {(loadingTx || validatingTx || (approvalSuccess && validatingZap)) && (
          <Spinner ml="auto" size={16} />
        )}
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
