import { Card } from 'components'
import { Divider } from 'theme-ui'
import BridgeAmount from './BridgeAmount'
import BridgeHeader from './BridgeHeader'
import BridgeNetworkPreview from './BridgeNetworkPreview'
import BridgeTokenSelector from './BridgeTokenSelector'
import ConfirmBridge from './ConfirmBridge'

const Bridge = () => (
  <Card
    p={4}
    sx={{
      backgroundColor: 'contentBackground',
      height: 'fit-content',
    }}
  >
    <BridgeHeader />
    <BridgeNetworkPreview />
    <BridgeTokenSelector mt={3} mb={2} />
    <BridgeAmount />
    <Divider my={4} mx={-4} sx={{ borderColor: 'darkBorder' }} />
    <ConfirmBridge />
  </Card>
)

export default Bridge
