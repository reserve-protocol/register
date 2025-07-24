import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/utils/constants'
import { useAtom } from 'jotai'
import { ArrowLeftIcon, Boxes } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Step, stepAtom } from '../atoms'
import ProposalBasketAdvanceSettings from './proposal-basket-advance-settings'
import ProposalBasketSetup from './proposal-basket-setup'
import ProposalStepTrigger from './proposal-step-trigger'

const Header = () => (
  <div className="p-4 pb-3 flex items-center gap-2">
    <Link
      to={`../${ROUTES.GOVERNANCE}/${ROUTES.GOVERNANCE_PROPOSE}`}
      className="sm:ml-3"
    >
      <Button variant="outline" size="icon-rounded">
        <ArrowLeftIcon size={24} strokeWidth={1.5} />
      </Button>
    </Link>
    <h1 className="font-bold text-xl">Basket change proposal</h1>
  </div>
)
const BasketSetupAccordion = () => (
  <AccordionItem value="basket" className="rounded-3xl bg-card m-1 border-none">
    <ProposalStepTrigger
      id="basket"
      icon={<Boxes size={16} strokeWidth={1.5} />}
      title="Set basket composition"
    />
    <AccordionContent className="flex flex-col animate-fade-in">
      <h2 className="text-xl  sm:text-2xl font-bold text-primary mx-4 sm:mx-6 mb-2">
        Basket composition
      </h2>
      <ProposalBasketSetup />
    </AccordionContent>
  </AccordionItem>
)

const BasketProposal = () => {
  const [step, setStep] = useAtom(stepAtom)

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full bg-secondary rounded-4xl pb-0.5 h-fit"
      value={step}
      onValueChange={(value) => setStep(value as Step)}
    >
      <Header />
      <BasketSetupAccordion />
      <ProposalBasketAdvanceSettings />
    </Accordion>
  )
}

export default BasketProposal
