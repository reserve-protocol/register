import { Trans } from '@lingui/macro'
import TokenLogo from 'components/icons/TokenLogo'
import { Check } from 'lucide-react'
import { Box, Spinner, Text } from 'theme-ui'
import { Allowance } from 'types'
import { Hex } from 'viem'

interface IApprovalStatus {
  allowance: Allowance
  hash: Hex | undefined
  success: boolean
}

const ApprovalStatus = ({ allowance, hash, success }: IApprovalStatus) => {
  if (success) {
    return (
      <Box variant="layout.verticalAlign" sx={{ color: 'muted' }} mb={3}>
        <Check size={16} />
        <Text ml="2">{allowance.symbol} Approved</Text>
      </Box>
    )
  }

  return (
    <Box variant="layout.verticalAlign" mb={3}>
      <TokenLogo width={24} symbol={allowance.symbol} />
      <Box ml="3">
        <Text variant="bold" sx={{ display: 'block' }}>
          <Trans>Approve in wallet</Trans>
        </Text>
        <Text variant="legend">
          {!hash && 'Proceed in wallet'}
          {hash && 'Confirming transaction'}
        </Text>
      </Box>
      <Spinner ml="auto" size={16} />
    </Box>
  )
}

export default ApprovalStatus
