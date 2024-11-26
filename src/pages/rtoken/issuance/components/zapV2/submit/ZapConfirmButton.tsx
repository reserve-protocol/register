import { LoadingButton } from 'components/button'
import TransactionsIcon from 'components/icons/TransactionsIcon'
import { Box, Spinner, Text } from 'theme-ui'
import { useZap } from '../context/ZapContext'
import { useZapTx } from '../context/ZapTxContext'
import ZapGasCost from '../overview/ZapGasCost'

const ZapConfirmButton = () => {
  const { operation, zapResult, validatingZap, loadingZap } = useZap()
  const {
    hasAllowance,
    approvalSuccess,
    loadingTx,
    validatingTx,
    sendTransaction,
    receipt,
    onGoingConfirmation,
  } = useZapTx()

  if (onGoingConfirmation) {
    return (
      <Box variant="layout.verticalAlign">
        <Box variant="layout.verticalAlign" sx={{ gap: 3 }}>
          <TransactionsIcon />
          <Box>
            <Text variant="bold" sx={{ display: 'block' }}>
              {!receipt
                ? `Confirm ${operation}`
                : receipt.status === 'success'
                ? 'Transaction Submitted'
                : 'Transaction Failed'}
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
          loading={!zapResult || loadingZap || validatingZap}
          text={operation === 'mint' ? 'Confirm Mint' : 'Confirm Redeem'}
          fullWidth
          loadingText="Finding route..."
        />
      )}
      <ZapGasCost mt={2} />
    </Box>
  )
}

export default ZapConfirmButton
