import { ChainId } from 'utils/chains'
import ChainLogo from './ChainLogo'
import { Box } from 'theme-ui'

// Shows ethereum/base stacked logos to indicate multichain
// TODO: When adding an extra L2 this icon should have props
const StackedChainLogo = () => (
  <Box sx={{ position: 'relative', height: 20, width: 24 }} pt={'2px'}>
    <ChainLogo chain={ChainId.Base} style={{ position: 'absolute' }} />
    <ChainLogo
      chain={ChainId.Mainnet}
      style={{ position: 'absolute', left: -10 }}
    />
  </Box>
)

export default StackedChainLogo
