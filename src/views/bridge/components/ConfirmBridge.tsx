import { useAtomValue } from 'jotai'
import { Box } from 'theme-ui'
import { ChainId } from 'utils/chains'
import { bridgeL2Atom } from '../atoms'
import ConfirmArbitrumBridge from './ConfirmArbitrumBridge'
import ConfirmBaseBridge from './ConfirmBaseBridge'

const ConfirmBridge = () => {
  const l2 = useAtomValue(bridgeL2Atom)

  return (
    <Box p={4}>
      {l2 === ChainId.Base ? <ConfirmBaseBridge /> : <ConfirmArbitrumBridge />}
    </Box>
  )
}

export default ConfirmBridge
