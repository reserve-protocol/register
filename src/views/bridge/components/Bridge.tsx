import { Button, Card } from 'components'
import { ArrowDown } from 'react-feather'
import { boxShadow } from 'theme'
import { Box, Divider, Text } from 'theme-ui'
import BridgeHeader from './BridgeHeader'
import BridgeInput from './BridgeInput'
import BridgeOutput from './BridgeOutput'
import ConfirmBaseBridge from './ConfirmBaseBridge'
import { useAtomValue } from 'jotai'
import { bridgeL2Atom, isBridgeWrappingAtom } from '../atoms'
import { ChainId } from 'utils/chains'
import ConfirmArbitrumBridge from './ConfirmArbitrumBridge'

const ConfirmBridge = () => {
  const l2 = useAtomValue(bridgeL2Atom)
  const isWrapping = useAtomValue(isBridgeWrappingAtom)

  if (!l2) {
    return (
      <Box p={4} sx={{ textAlign: 'center' }}>
        <Button mb="2" disabled fullWidth>
          {isWrapping ? 'Deposit' : 'Withdraw'}
        </Button>
        <Text variant="legend">Please choose L2 Network</Text>
      </Box>
    )
  }

  if (l2 === ChainId.Arbitrum) {
    return <ConfirmArbitrumBridge />
  }

  return <ConfirmBaseBridge />
}

const Bridge = () => (
  <Card
    p={0}
    sx={{
      backgroundColor: 'backgroundNested',
      position: 'relative',
      height: 'fit-content',
      width: ['100vw', 514],
      minHeight: 566,
      boxShadow: ['none', boxShadow],
      border: ['none', '3px solid'],
      borderColor: ['none', 'borderFocused'],
    }}
  >
    <BridgeHeader />
    <Box p={4} sx={{ borderBottom: '1px solid', borderColor: 'border' }}>
      <BridgeInput />
      <Box variant="layout.verticalAlign">
        <Divider sx={{ flexGrow: 1, borderColor: 'border' }} />
        <Box mx={4} my={3}>
          <ArrowDown size={24} color="#666666" />
        </Box>
        <Divider sx={{ flexGrow: 1 }} />
      </Box>
      <BridgeOutput />
    </Box>
    <ConfirmBridge />
  </Card>
)

export default Bridge
