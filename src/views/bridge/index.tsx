import { Box, Divider, Flex } from 'theme-ui'
import Bridge from './components/Bridge'
import BridgeWithdrawals from './components/BridgeWithdrawals'
import BridgeFaq from './components/BridgeFaq'

const ChainBridge = () => (
  <>
    <Flex
      py={[1, 8]}
      sx={{
        backgroundColor: 'contentBackground',
        justifyContent: 'center',
        borderRadius: '0 0 20px 20px',
      }}
    >
      <Bridge />
    </Flex>
    <BridgeWithdrawals />
    <BridgeFaq />
  </>
)

export default ChainBridge
