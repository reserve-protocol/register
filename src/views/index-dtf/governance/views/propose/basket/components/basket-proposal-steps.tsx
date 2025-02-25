import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAtom, useAtomValue } from 'jotai'
import {
  AlignCenterVertical,
  ArrowLeftIcon,
  Asterisk,
  Boxes,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  Sunrise,
} from 'lucide-react'
import { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Step, stepAtom, stepStateAtom } from '../atoms'
import ProposalBasketSetup from './proposal-basket-setup'
import ProposalTradingExpiration from './proposal-trading-expiration'
import ProposalTradingRanges from './proposal-trading-ranges'
import { ROUTES } from '@/utils/constants'

export type ProposalStep = {
  id: Step
  icon: ReactNode
  title: string
  titleSecondary: string
  content: ReactNode
}

interface ProposalStepTrigger
  extends Omit<ProposalStep, 'content' | 'titleSecondary'> {
  index: number
}

export const DEPLOY_STEPS: ProposalStep[] = [
  {
    id: 'basket',
    icon: <Boxes size={16} strokeWidth={1.5} />,
    title: 'Set basket composition',
    titleSecondary: 'Basket Composition',
    content: <ProposalBasketSetup />,
  },
  {
    id: 'prices',
    icon: <AlignCenterVertical size={16} strokeWidth={1.5} />,
    title: 'Price Settings',
    titleSecondary: 'Price Settings',
    content: <ProposalTradingRanges />,
  },
  {
    id: 'expiration',
    icon: <Sunrise size={16} strokeWidth={1.5} />,
    title: 'Launch Settings',
    titleSecondary: 'Launch Settings',
    content: <ProposalTradingExpiration />,
  },
]

const StepTrigger = ({ id, icon, title, index }: ProposalStepTrigger) => {
  const selectedSection = useAtomValue(stepAtom)
  const isActive = selectedSection === id
  const isCompleted = useAtomValue(stepStateAtom)[id]

  return (
    <AccordionTrigger
      withChevron={false}
      className={cn(
        'flex items-center justify-between w-full p-4 sm:p-6',
        isActive ? 'pb-3' : ''
      )}
    >
      <div className="flex items-center gap-2">
        <div
          className={cn(
            'rounded-full flex-shrink-0 p-2',
            isActive || isCompleted
              ? 'bg-primary/10 text-primary'
              : 'bg-muted-foreground/10'
          )}
        >
          {isCompleted ? <CheckIcon size={16} strokeWidth={1.5} /> : icon}
        </div>
        <div
          className={cn(
            'text-left text-base sm:text-xl font-bold animate-fade-in',
            isActive || isCompleted ? 'text-primary' : '',
            isActive ? 'hidden' : ''
          )}
        >
          {title}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {/* <div className="bg-muted-foreground/10 rounded-full p-1" role="button">
            <ArrowUpRightIcon size={24} strokeWidth={1.5} />
          </div> */}
        <span className="text-primary whitespace-nowrap text-xs sm:text-sm">
          Step {index + 1}/3
        </span>
        <div className="bg-muted-foreground/10 rounded-full p-1" role="button">
          {isActive ? (
            <ChevronUpIcon size={24} strokeWidth={1.5} />
          ) : (
            <ChevronDownIcon size={24} strokeWidth={1.5} />
          )}
        </div>
      </div>
    </AccordionTrigger>
  )
}

// TODO: A lot of these components could be shared, don't worry at this point
const BasketProposalSteps = () => {
  const [step, setStep] = useAtom(stepAtom)

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full bg-secondary rounded-4xl pb-0.5 h-fit"
      value={step}
      onValueChange={(value) => setStep(value as Step)}
    >
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
      {DEPLOY_STEPS.map(
        ({ id, icon, title, titleSecondary, content }, index) => (
          <AccordionItem
            key={id}
            value={id}
            className="rounded-3xl bg-card m-1 border-none"
          >
            <StepTrigger id={id} icon={icon} title={title} index={index} />
            <AccordionContent className="flex flex-col animate-fade-in">
              <h2 className="text-xl  sm:text-2xl font-bold text-primary mx-4 sm:mx-6 mb-2">
                {titleSecondary}
              </h2>
              {content}
            </AccordionContent>
          </AccordionItem>
        )
      )}
    </Accordion>
  )
}

export default BasketProposalSteps
