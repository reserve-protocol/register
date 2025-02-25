import { LoadingButton } from '@/components/old/button'
import TokenLogo from 'components/icons/TokenLogo'
import { Box, Spinner, Text } from 'theme-ui'
import { useZap } from '../context/ZapContext'
import { useZapTx } from '../context/ZapTxContext'
import Help from 'components/help'

const ZapRevokeButton = () => {
  const { tokenIn, loadingZap, validatingZap } = useZap()

  const { loadingRevoke, validatingRevoke, revoke } = useZapTx()

  if (loadingRevoke) {
    return (
      <Box variant="layout.verticalAlign" mb={3}>
        <TokenLogo width={24} symbol={tokenIn.symbol} />
        <Box ml="3">
          <Text variant="bold" sx={{ display: 'block' }}>
            Revoke in wallet
          </Text>
          <Text variant="legend">
            {!validatingRevoke && 'Proceed in wallet'}
            {validatingRevoke && 'Confirming transaction'}
          </Text>
        </Box>
        <Spinner ml="auto" size={16} />
      </Box>
    )
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        mb: 4,
      }}
    >
      <LoadingButton
        onClick={revoke}
        loading={loadingRevoke || loadingZap || validatingZap}
        text={`Revoke existing ${tokenIn.symbol} allowance`}
        fullWidth
        loadingText={loadingRevoke ? 'Revoking...' : 'Finding route...'}
      />
      <Box variant="layout.verticalAlign" sx={{ gap: 1 }}>
        <Text variant="legend" sx={{ fontSize: 1 }}>
          Why I do need to revoke my allowance?
        </Text>
        <Help content="Due to how USDT approvals are managed, we need to reset your current allowance to zero before updating it to a new value. This step is necessary for completing your transaction." />
      </Box>
    </Box>
  )
}

export default ZapRevokeButton
