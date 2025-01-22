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
  ArrowLeftIcon,
  Asterisk,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from 'lucide-react'
import { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Step, stepAtom, stepStateAtom } from '../atoms'
import ProposalBasketSetup from './proposal-basket-setup'
import ProposalTradingExpiration from './proposal-trading-expiration'
import ProposalTradingRanges from './proposal-trading-ranges'

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
    icon: <Asterisk size={24} strokeWidth={1.5} />,
    title: 'Set basket composition',
    titleSecondary: 'Define new proposed basket',
    content: <ProposalBasketSetup />,
  },
  {
    id: 'prices',
    icon: <Asterisk size={24} strokeWidth={1.5} />,
    title: 'Set price range(s)',
    titleSecondary: 'Set acceptable trading price range(s)',
    content: <ProposalTradingRanges />,
  },
  {
    id: 'expiration',
    icon: <Asterisk size={24} strokeWidth={1.5} />,
    title: 'Set permissionless execution',
    titleSecondary: 'Permissionless trade expiration',
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
        'flex items-center justify-between w-full p-6',
        isActive ? 'pb-3' : ''
      )}
    >
      <div className="flex items-center gap-2">
        <div
          className={cn(
            'rounded-full flex-shrink-0 p-1',
            isActive || isCompleted
              ? 'bg-primary/10 text-primary'
              : 'bg-muted-foreground/10'
          )}
        >
          {isCompleted ? <CheckIcon size={24} strokeWidth={1.5} /> : icon}
        </div>
        <div
          className={cn(
            'text-xl font-bold animate-fade-in',
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
        <span className="text-primary text-sm">Step {index + 1}/3</span>
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
        <Link to="../" className="ml-3">
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
            className=" rounded-3xl bg-card m-1 border-none"
          >
            <StepTrigger id={id} icon={icon} title={title} index={index} />
            <AccordionContent className="flex flex-col animate-fade-in">
              <h2 className="text-2xl font-bold text-primary ml-6 mb-2">
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
