import { Card } from 'components'
import { ArrowDown } from 'react-feather'
import { Box, Divider } from 'theme-ui'
import BridgeHeader from './BridgeHeader'
import BridgeInput from './BridgeInput'
import BridgeOutput from './BridgeOutput'
import ConfirmBridge from './ConfirmBridge'

const Bridge = () => (
  <Card
    p={0}
    sx={{
      backgroundColor: 'contentBackground',
      height: 'fit-content',
      width: 525,
    }}
  >
    <BridgeHeader />
    <Box p={4}>
      <BridgeInput />
      <Box variant="layout.verticalAlign">
        <Divider sx={{ flexGrow: 1, borderColor: 'darkBorder' }} />
        <Box mx={4} my={3}>
          <ArrowDown size={24} color="#666666" />
        </Box>
        <Divider sx={{ flexGrow: 1 }} />
      </Box>
      <BridgeOutput />
    </Box>
    <Divider my={0} sx={{ borderColor: 'darkBorder' }} />
    <ConfirmBridge />
  </Card>
)

export default Bridge
