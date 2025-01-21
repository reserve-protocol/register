import { useAtomValue } from 'jotai'
import { isProposalConfirmedAtom } from './atoms'
import BasketProposalOverview from './components/basket-proposal-overview'
import BasketProposalSteps from './components/basket-proposal-steps'
import ConfirmBasketProposal from './components/confirm-basket-proposal'
import Updater from './updater'

const ProposalStage = () => {
  const isConfirmed = useAtomValue(isProposalConfirmedAtom)

  if (isConfirmed) return <ConfirmBasketProposal />

  return <BasketProposalSteps />
}

const IndexDTFBasketProposal = () => (
  <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-2 pb-6 pr-2 overflow-x-hidden">
    <ProposalStage />
    <div>
      <BasketProposalOverview />
    </div>
    <Updater />
  </div>
)

export default IndexDTFBasketProposal
