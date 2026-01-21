import { Button } from '@/components/ui/button'
import TransactionsIcon from 'components/icons/TransactionsIcon'
import { Loader2 } from 'lucide-react'
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

  const isLoading = !zapResult || loadingZap || validatingZap

  return (
    <Box>
      {hasAllowance && (
        <Button
          onClick={() => sendTransaction?.()}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading
            ? 'Finding route...'
            : operation === 'mint'
              ? 'Confirm Mint'
              : 'Confirm Redeem'}
        </Button>
      )}
      <ZapGasCost mt={2} />
    </Box>
  )
}

export default ZapConfirmButton
