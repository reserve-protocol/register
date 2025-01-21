import BasketProposalSteps from './components/basket-proposal-steps'
import BasketProposalOverview from './components/basket-proposal-overview'
import { useEffect } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import {
  isProposalConfirmedAtom,
  permissionlessLaunchingAtom,
  proposedIndexBasketAtom,
  stepAtom,
  tradeRangeOptionAtom,
  tradeVolatilityAtom,
} from './atoms'
import ConfirmBasketProposal from './components/confirm-basket-proposal'

// TODO: Get initial proposed basket HERE
const Updater = () => {
  const setStep = useSetAtom(stepAtom)
  const setProposedBasket = useSetAtom(proposedIndexBasketAtom)
  const setTradeVolatility = useSetAtom(tradeVolatilityAtom)
  const setTradeRangeOption = useSetAtom(tradeRangeOptionAtom)
  const setPermissionlessLaunching = useSetAtom(permissionlessLaunchingAtom)

  useEffect(() => {
    return () => {
      setStep('basket')
      // TODO: Currently using mock data!
      // setProposedBasket(undefined)
      setTradeVolatility([])
      setTradeRangeOption(undefined)
      setPermissionlessLaunching(undefined)
    }
  }, [])

  return null
}

const ProposalStage = () => {
  const isConfirmed = useAtomValue(isProposalConfirmedAtom)

  if (isConfirmed) return <ConfirmBasketProposal />

  return <BasketProposalSteps />
}

const IndexDTFBasketProposal = () => (
  <div className="grid grid-cols-[1.5fr_1fr] gap-2 pr-2 pb-6">
    <ProposalStage />
    <div>
      <BasketProposalOverview />
    </div>
    <Updater />
  </div>
)

export default IndexDTFBasketProposal
