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
  Boxes,
  ChevronDownIcon,
  ChevronUpIcon,
  PenLineIcon,
  Sunrise,
} from 'lucide-react'
import { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Step, stepAtom, stepStateAtom, advancedControlsAtom } from '../atoms'
import ProposalBasketSetup from './proposal-basket-setup'
import ProposalRebalanceLaunchSettings, {
  TradingExpirationTriggerLabel,
} from './proposal-rebalance-launch-settings'
import ProposalTradingRanges, {
  TradeRangeTriggerLabel,
} from './proposal-basket-price-settings'
import { ROUTES } from '@/utils/constants'

export type ProposalStep = {
  id: Step
  icon: ReactNode
  title: string
  titleSecondary: string
  content: ReactNode
  triggerLabel?: ReactNode
}

const StepTrigger = ({
  id,
  icon,
  title,
  triggerLabel,
  advanced,
}: ProposalStepTrigger) => {
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
            'rounded-full flex-shrink-0 p-2 border',
            isActive || isCompleted
              ? 'text-primary border-primary'
              : 'text-black border-black'
          )}
        >
          {icon}
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
      <div className="flex items-center gap-3">
        {!isActive && triggerLabel}
        <div
          className={cn(
            'w-8 h-8 flex items-center justify-center rounded-full p-1',
            !advanced && 'bg-muted-foreground/10',
            advanced && 'border-[1px] border-muted-foreground/20'
          )}
          role="button"
        >
          {isActive ? (
            <ChevronUpIcon size={16} strokeWidth={2} />
          ) : isCompleted ? (
            <PenLineIcon size={16} strokeWidth={2} />
          ) : (
            <ChevronDownIcon size={16} strokeWidth={2} />
          )}
        </div>
      </div>
    </AccordionTrigger>
  )
}

const ADVANCED_CONTROLS: ProposalStep[] = [
  {
    id: 'prices',
    icon: <AlignCenterVertical size={16} strokeWidth={1.5} />,
    title: 'Price Settings',
    titleSecondary: 'Price Settings',
    content: <ProposalTradingRanges />,
    triggerLabel: <TradeRangeTriggerLabel />,
  },
  {
    id: 'expiration',
    icon: <Sunrise size={16} strokeWidth={1.5} />,
    title: 'Launch Settings',
    titleSecondary: 'Launch Settings',
    content: <ProposalRebalanceLaunchSettings />,
    triggerLabel: <TradingExpirationTriggerLabel />,
  },
]

const AdvancedControls = () => {
  const advancedControls = useAtomValue(advancedControlsAtom)

  if (!advancedControls) return null

  return (
    <div>
      <div className="flex justify-center items-center gap-4 py-3 px-3">
        <div className="flex-grow h-[1px] bg-muted-foreground/10" />
        <div className="text-base font-bold">Advanced Controls</div>
        <div className="flex-grow h-[1px] bg-muted-foreground/10" />
      </div>

      {ADVANCED_CONTROLS.map(
        ({ id, icon, title, titleSecondary, content, triggerLabel }) => (
          <AccordionItem
            key={id}
            value={id}
            className="rounded-3xl bg-card m-1 border-none"
          >
            <StepTrigger
              id={id}
              icon={icon}
              title={title}
              triggerLabel={triggerLabel}
              advanced
            />
            <AccordionContent className="flex flex-col animate-fade-in">
              <h2 className="text-xl  sm:text-2xl font-bold text-primary mx-4 sm:mx-6 mb-2">
                {titleSecondary}
              </h2>
              {content}
            </AccordionContent>
          </AccordionItem>
        )
      )}
    </div>
  )
}

interface ProposalStepTrigger
  extends Omit<ProposalStep, 'content' | 'titleSecondary'> {
  advanced?: boolean
}

const PROPOSAL_SETTINGS: ProposalStep[] = [
  {
    id: 'basket',
    icon: <Boxes size={16} strokeWidth={1.5} />,
    title: 'Set basket composition',
    titleSecondary: 'Basket Composition',
    content: <ProposalBasketSetup />,
  },
]

// TODO: A lot of these components could be shared, don't worry at this point
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
      {PROPOSAL_SETTINGS.map(({ id, icon, title, titleSecondary, content }) => (
        <AccordionItem
          key={id}
          value={id}
          className="rounded-3xl bg-card m-1 border-none"
        >
          <StepTrigger id={id} icon={icon} title={title} />
          <AccordionContent className="flex flex-col animate-fade-in">
            <h2 className="text-xl  sm:text-2xl font-bold text-primary mx-4 sm:mx-6 mb-2">
              {titleSecondary}
            </h2>
            {content}
          </AccordionContent>
        </AccordionItem>
      ))}
      <AdvancedControls />
    </Accordion>
  )
}

export default BasketProposal
