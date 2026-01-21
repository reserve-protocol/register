import { Button } from '@/components/ui/button'
import TokenLogo from 'components/icons/TokenLogo'
import { Check, Loader2 } from 'lucide-react'
import { Box, Spinner, Text } from 'theme-ui'
import { useZap } from '../context/ZapContext'
import { useZapTx } from '../context/ZapTxContext'

const ZapApprovalButton = () => {
  const { tokenIn, loadingZap, validatingZap } = useZap()
  const {
    hasAllowance,
    loadingApproval,
    validatingApproval,
    approve,
    approvalSuccess,
    error,
  } = useZapTx()

  if (loadingApproval) {
    return (
      <Box variant="layout.verticalAlign" mb={3}>
        <TokenLogo width={24} symbol={tokenIn.symbol} />
        <Box ml="3">
          <Text variant="bold" sx={{ display: 'block' }}>
            Approve in wallet
          </Text>
          <Text variant="legend">
            {!validatingApproval && 'Proceed in wallet'}
            {validatingApproval && 'Confirming transaction'}
          </Text>
        </Box>
        <Spinner ml="auto" size={16} />
      </Box>
    )
  }

  if (approvalSuccess && !error) {
    return (
      <Box variant="layout.verticalAlign" sx={{ gap: 3 }} mb={3}>
        <Check size={24} />
        <Text variant="legend" sx={{ fontWeight: 'bold' }}>
          {tokenIn.symbol} Approved
        </Text>
      </Box>
    )
  }

  if (hasAllowance) return null

  const isLoading = loadingApproval || loadingZap || validatingZap

  return (
    <Button onClick={approve} disabled={isLoading} className="w-full">
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isLoading
        ? loadingApproval
          ? 'Approving...'
          : 'Finding route...'
        : `Approve use of ${tokenIn.symbol}`}
    </Button>
  )
}

export default ZapApprovalButton
