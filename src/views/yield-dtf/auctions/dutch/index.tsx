import EndedDutchAuctions from './components/EndedDutchAuctions'
import OngoingDutchAuctions from './components/OngoingDutchAuctions'
import PendingToSettleAuctions from './components/PendingToSettleAuctions'
import useDutchTrades from './components/useDutchTrades'

const DutchAuctions = () => {
  useDutchTrades()

  return (
    <div>
      <OngoingDutchAuctions />
      <PendingToSettleAuctions />
      <EndedDutchAuctions />
    </div>
  )
}

export default DutchAuctions
