import { Button } from '@/components/ui/button'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { ChevronDown, ChevronUp, Settings } from 'lucide-react'
import {
  advancedControlsAtom,
  isProposalConfirmedAtom,
  isProposedBasketValidAtom,
  stepAtom,
} from '../../atoms'
import BasketCsvSetup from './basket-csv-setup'
import ProposalBasketTable from './proposal-basket-table'

const NextButton = () => {
  const isValid = useAtomValue(isProposedBasketValidAtom)
  const setStep = useSetAtom(stepAtom)
  const setIsConfirmed = useSetAtom(isProposalConfirmedAtom)
  const [AdvancedControls, setAdvancedControls] = useAtom(advancedControlsAtom)

  const handleNext = () => {
    setStep('confirmation')

    if (isValid) {
      setIsConfirmed(true)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        onClick={() => setAdvancedControls((toggle) => !toggle)}
        className="flex gap-[6px] px-4 py-[20px]"
        size="lg"
      >
        <Settings size={16} />
        {AdvancedControls ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </Button>
      <Button
        disabled={!isValid}
        onClick={handleNext}
        className="w-full my-2"
        size="lg"
      >
        Confirm & Prepare Proposal
      </Button>
    </div>
  )
}

const ProposalBasketSetup = () => (
  <>
    <p className="text-sm sm:text-base mx-4 sm:mx-6 mb-6">
      Enter the updated weights for the tokens in the basket. Remember, the
      weights represent the proportion of each token relative to the total USD
      value of basket at the time of the proposal. We will calculate the
      required auctions needed to adopt the new basket if the proposal passes
      governance.
    </p>
    <div className="flex flex-col gap-2 mx-2">
      <BasketCsvSetup />
      <ProposalBasketTable />
      <NextButton />
    </div>
  </>
)

export default ProposalBasketSetup
