import { Box, Spinner, Text } from 'theme-ui'
import { ZapErrorType, useZap } from '../context/ZapContext'
import { LoadingButton } from 'components/button'
import TokenLogo from 'components/icons/TokenLogo'
import { Check } from 'react-feather'

type ZapApprovalButtonProps = {
  hasAllowance: boolean
  approve?: () => void
  isLoading: boolean
  validatingApproval: boolean
  isSuccess?: boolean
  error?: ZapErrorType
}

const ZapApprovalButton = ({
  hasAllowance,
  approve,
  isLoading,
  validatingApproval,
  isSuccess,
  error,
}: ZapApprovalButtonProps) => {
  const { tokenIn } = useZap()

  if (isLoading) {
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

  if (isSuccess && !error) {
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

  return (
    <LoadingButton
      onClick={approve}
      loading={isLoading}
      text={`Approve use of ${tokenIn.symbol}`}
      fullWidth
    />
  )
}

export default ZapApprovalButton
