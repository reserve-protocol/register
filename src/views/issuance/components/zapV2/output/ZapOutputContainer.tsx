import { Box, Text } from 'theme-ui'
import { useZap } from '../context/ZapContext'
import ZapTokenSelector from '../token-selector/ZapTokenSelector'
import ZapOutput from './ZapOutput'
import ZapOutputBalance from './ZapOutputBalance'
import ZapOutputUSD from './ZapOutputUSD'

const ZapOutputContainer = () => {
  const { tokenOut, operation, loadingZap } = useZap()

  return (
    <Box
      variant="layout.centered"
      sx={{
        position: 'relative',
        border: '1px solid',
        borderColor: 'borderSecondary',
        borderRadius: '8px',
        overflow: 'hidden',
        gap: '8px',
        alignItems: 'start',
      }}
      p={3}
    >
      <Text sx={{ display: 'block' }}>You receive:</Text>
      <Box
        variant="layout.verticalAlign"
        sx={{ fontSize: 4, fontWeight: 700, overflow: 'hidden' }}
      >
        <ZapOutput />
        {!loadingZap && (
          <Text variant="legend" ml="2">
            {tokenOut.symbol}
          </Text>
        )}
      </Box>
      <Box variant="layout.verticalAlign">
        <ZapOutputUSD />
      </Box>
      <Box
        sx={{
          position: 'absolute',
          height: '100%',
          top: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'end',
          justifyContent:
            operation === 'redeem' ? 'space-between' : ['start', 'end'],
        }}
        p={3}
      >
        {operation === 'redeem' && <ZapTokenSelector />}
        <ZapOutputBalance />
      </Box>
    </Box>
  )
}

export default ZapOutputContainer
