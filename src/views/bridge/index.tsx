import { Box, Divider, Flex } from 'theme-ui'
import Bridge from './components/Bridge'
import BridgeWithdrawals from './components/BridgeWithdrawals'

const ChainBridge = () => {
  return (
    <>
      <Flex
        py={[1, 8]}
        sx={{
          backgroundColor: 'contentBackground',
          justifyContent: 'center',
          borderBottom: '1px solid',
          borderColor: 'darkBorder',
        }}
      >
        <Bridge />
      </Flex>
      <BridgeWithdrawals />
    </>
  )
}

export default ChainBridge
