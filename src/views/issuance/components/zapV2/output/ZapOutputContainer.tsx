import useRToken from 'hooks/useRToken'
import { Box, Text } from 'theme-ui'
import ZapOutputBalance from './ZapOutputBalance'
import ZapOutput from './ZapOutput'
import ZapOutputUSD from './ZapOutputUSD'
import { useZap } from '../context/ZapContext'

const ZapOutputContainer = () => {
  const { rTokenSymbol } = useZap()

  return (
    <Box
      variant="layout.centered"
      sx={{
        position: 'relative',
        border: '1px solid',
        borderColor: 'border',
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
        <Text variant="legend" ml="2">
          {rTokenSymbol || ''}
        </Text>
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
          justifyContent: 'end',
        }}
        p={3}
      >
        <ZapOutputBalance />
      </Box>
    </Box>
  )
}

export default ZapOutputContainer
