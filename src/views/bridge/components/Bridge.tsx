import { Card } from 'components'
import { ArrowDown } from 'react-feather'
import { Box, Divider } from 'theme-ui'
import BridgeHeader from './BridgeHeader'
import BridgeInput from './BridgeInput'
import BridgeOutput from './BridgeOutput'
import ConfirmBridge from './ConfirmBridge'
import { boxShadow } from 'theme'

const Bridge = () => (
  <Card
    p={0}
    sx={{
      backgroundColor: 'contentBackground',
      height: 'fit-content',
      width: ['100vw', 525],
      boxShadow: ['none', boxShadow],
      border: ['none', '1px solid'],
      borderColor: ['outlineBorder'],
    }}
  >
    <BridgeHeader />
    <Box p={4} sx={{ borderBottom: '1px solid', borderColor: 'darkBorder' }}>
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
    <ConfirmBridge />
  </Card>
)

export default Bridge
