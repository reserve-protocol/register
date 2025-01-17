import BasketProposalSteps from './components/basket-proposal-steps'
import BasketProposalOverview from './components/basket-proposal-overview'

const IndexDTFBasketProposal = () => (
  <div className="grid grid-cols-[1.5fr_1fr] gap-2 pr-2">
    <BasketProposalSteps />
    <BasketProposalOverview />
  </div>
)

export default IndexDTFBasketProposal
