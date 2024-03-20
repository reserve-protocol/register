import CirclesIcon from 'components/icons/CirclesIcon'
import { Box, Text } from 'theme-ui'
import { useZap } from '../context/ZapContext'
import { Button } from 'components'

const ZapManualMint = () => {
  const { setZapEnabled } = useZap()

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 3 }}>
      <CirclesIcon color="currentColor" />
      <Text variant="title" sx={{ fontWeight: 700, mt: 1 }}>
        Bring your own collateral
      </Text>
      <Box mt={2}>
        <Button
          backgroundColor="muted"
          color="black"
          onClick={() => setZapEnabled(false)}
          small
        >
          Manual Mint
        </Button>
      </Box>
    </Box>
  )
}

export default ZapManualMint
