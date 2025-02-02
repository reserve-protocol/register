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
  <>
    <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-2 pr-0 lg:pr-2 pb-2 sm:pb-6 relative">
      <ProposalStage />
      <BasketProposalOverview />
    </div>
    <Updater />
  </>
)

export default IndexDTFBasketProposal
