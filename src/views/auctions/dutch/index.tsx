import { Box } from 'theme-ui'
import EndedDutchAuctions from './components/EndedDutchAuctions'
import OngoingDutchAuctions from './components/OngoingDutchAuctions'
import PendingToSettleAuctions from './components/PendingToSettleAuctions'
import useDutchTrades from './components/useDutchTrades'

const DutchAuctions = () => {
  useDutchTrades()

  return (
    <Box>
      <OngoingDutchAuctions />
      <PendingToSettleAuctions />
      <EndedDutchAuctions />
    </Box>
  )
}

export default DutchAuctions
