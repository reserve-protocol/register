import { Box, Divider, Flex } from 'theme-ui'
import Bridge from './components/Bridge'
import BridgeWithdrawals from './components/BridgeWithdrawals'

const ChainBridge = () => {
  return (
    <>
      <Flex mt={[1, 5]} sx={{ justifyContent: 'center' }}>
        <Bridge />
      </Flex>
      <Divider my={[3, 6]} />
      <BridgeWithdrawals />
    </>
  )
}

export default ChainBridge
