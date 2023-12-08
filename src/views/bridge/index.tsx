import { Flex } from 'theme-ui'
import Bridge from './components/Bridge'
import BridgeFaq from './components/BridgeFaq'
import BridgeWithdrawals from './components/BridgeWithdrawals'

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
