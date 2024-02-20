import { Box, Flex, useColorMode } from 'theme-ui'
import Bridge from './components/Bridge'
import BridgeFaq from './components/BridgeFaq'
import BridgeWithdrawals from './components/BridgeWithdrawals'

const HeroBackground = () => {
  const [colorMode] = useColorMode()
  const url =
    colorMode === 'dark'
      ? '/imgs/bg-bridge-dark.png'
      : '/imgs/bg-bridge-light.png'

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        top: 0,
        zIndex: -1,
        position: 'absolute',
        background: `url(${url}) no-repeat`,
        backgroundSize: 'cover',
        borderBottom: '3px solid',
        borderColor: 'borderFocused',
      }}
    />
  )
}

const ChainBridge = () => (
  <>
    <Flex
      py={[1, 8]}
      sx={{
        position: 'relative',
        justifyContent: 'center',
        borderRadius: '0 0 20px 20px',
        borderTop: '1px solid',
        borderColor: 'border',
      }}
    >
      <HeroBackground />
      <Bridge />
    </Flex>
    <BridgeWithdrawals />
    <BridgeFaq />
  </>
)

export default ChainBridge
