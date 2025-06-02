import useTrackIndexDTFPage from '../hooks/useTrackIndexDTFPage'
import ProposalTrades from './legacy/components/proposal-trades'
import Updater from './updater'

{
  /* <ProposalTrades /> */
}

const IndexDTFAuctions = () => {
  useTrackIndexDTFPage('auctions')

  return (
    <div>
      <Updater />
    </div>
  )
}

export default IndexDTFAuctions
