import { Box } from 'theme-ui'
import EndedDutchAuctions from './components/EndedDutchAuctions'
import OngoingDutchAuctions from './components/OngoingDutchAuctions'
import useDutchTrades from './components/useDutchTrades'

const DutchAuctions = () => {
  useDutchTrades()

  return (
    <Box>
      <OngoingDutchAuctions />
      <EndedDutchAuctions />
    </Box>
  )
}

export default DutchAuctions
