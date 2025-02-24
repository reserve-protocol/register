import useTrackIndexDTFPage from '../hooks/useTrackIndexDTFPage'
import ProposalTrades from './components/proposal-trades'
import Updater from './updater'

const IndexDTFAuctions = () => {
  useTrackIndexDTFPage('auctions')
  return (
    <div>
      <ProposalTrades />
      <Updater />
    </div>
  )
}

export default IndexDTFAuctions
