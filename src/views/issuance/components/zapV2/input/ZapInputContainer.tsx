import { Box, Text } from 'theme-ui'
import ZapInput from './ZapInput'
import ZapTokenSelector from './ZapTokenSelector'
import ZapInputMaxButton from './ZapInputMaxButton'
import ZapInputUSD from './ZapInputUSD'

const ZapInputContainer = () => {
  return (
    <Box
      variant="layout.verticalAlign"
      sx={{
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: 'lightGrey',
        borderRadius: '8px',
        gap: '8px',
        alignItems: 'start',
      }}
      p={3}
    >
      <Box
        variant="layout.centered"
        sx={{
          overflow: 'hidden',
          gap: '8px',
          alignItems: 'start',
          flexGrow: 1,
        }}
      >
        <Text>You use:</Text>
        <ZapInput />
        <ZapInputUSD />
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
          justifyContent: 'space-between',
        }}
        p={3}
      >
        <ZapTokenSelector />
        <ZapInputMaxButton />
      </Box>
    </Box>
  )
}

export default ZapInputContainer
