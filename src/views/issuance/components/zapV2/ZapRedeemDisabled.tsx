import { Button } from 'components'
import { Box, Text } from 'theme-ui'
import { useZap } from './context/ZapContext'

const ZapRedeemDisabled = ({ disableRedeem }: { disableRedeem: boolean }) => {
  const { operation, setZapEnabled } = useZap()
  if (operation !== 'redeem' || !disableRedeem) return null

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'cardAlternative',
        borderRadius: '14px',
        opacity: 0.95,
        zIndex: 1,
      }}
    >
      <Text sx={{ fontSize: 4 }}>
        Zap Redeem not available during re-collateralization
      </Text>
      <Button
        backgroundColor="primary"
        small
        onClick={() => setZapEnabled(false)}
      >
        Switch to manual minting
      </Button>
    </Box>
  )
}

export default ZapRedeemDisabled
