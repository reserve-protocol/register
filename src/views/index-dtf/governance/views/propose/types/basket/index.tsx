import BasketProposalSteps from './components/basket-proposal-steps'
import BasketProposalOverview from './components/basket-proposal-overview'
import { useEffect } from 'react'
import { useSetAtom } from 'jotai'
import {
  permissionlessLaunchingAtom,
  proposedIndexBasketAtom,
  stepAtom,
  tradeRangeOptionAtom,
  tradeVolatilityAtom,
} from './atoms'

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

const IndexDTFBasketProposal = () => (
  <div className="grid grid-cols-[1.5fr_1fr] gap-2 pr-2 pb-6">
    <BasketProposalSteps />
    <div>
      <BasketProposalOverview />
    </div>
    <Updater />
  </div>
)

export default IndexDTFBasketProposal
