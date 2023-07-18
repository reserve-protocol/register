import FinalizedAuctions from '../components/FinalizedAuctions'
import OngoingAuctions from '../components/OngoingAuctions'
import TradesUpdater from '../components/TradesUpdater'

const BatchAuctions = () => (
  <>
    <TradesUpdater />
    <OngoingAuctions mb={6} />
    <FinalizedAuctions />
  </>
)

export default BatchAuctions
