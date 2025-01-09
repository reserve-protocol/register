import BasketCubeIcon from '@/components/icons/BasketCubeIcon'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { cn } from '@/lib/utils'
import { useAtom, useAtomValue } from 'jotai'
import {
  ArrowUpRightIcon,
  Asterisk,
  ChevronDownIcon,
  ChevronUpIcon,
} from 'lucide-react'
import { ReactNode, useEffect } from 'react'
import { deployStepAtom } from '../atoms'
import MetadataAndChain from '../steps/metadata'
import { DeployStepId } from '../form-fields'
import FTokenBasket from '../steps/basket'
import Governance from '../steps/governance'
import Fees from '../steps/fee'
import RevenueDistribution from '../steps/revenue'
import Auctions from '../steps/auctions'
import Roles from '../steps/roles'
import Voting from '../steps/voting'

export type DeployStep = {
  id: DeployStepId
  icon: ReactNode
  title: string
  titleSecondary: string
  content: ReactNode
}

export const DEPLOY_STEPS: DeployStep[] = [
  {
    id: 'metadata',
    icon: <Asterisk size={24} strokeWidth={1.5} />,
    title: 'Metadata & Chain',
    titleSecondary: 'Metadata & Chain',
    content: <MetadataAndChain />,
  },
  {
    id: 'basket',
    icon: <BasketCubeIcon fontSize={24} />,
    title: 'Basket',
    titleSecondary: 'What should the initial index include?',
    content: <FTokenBasket />,
  },
  {
    id: 'governance',
    icon: <Asterisk size={24} strokeWidth={1.5} />,
    title: 'Governance',
    titleSecondary: 'How would you like to govern?',
    content: <Governance />,
  },
  {
    id: 'fees',
    icon: <Asterisk size={24} strokeWidth={1.5} />,
    title: 'Fees',
    titleSecondary: 'Fees',
    content: <Fees />,
  },
  {
    id: 'revenue-distribution',
    icon: <Asterisk size={24} strokeWidth={1.5} />,
    title: 'Revenue distribution',
    titleSecondary: 'Revenue distribution',
    content: <RevenueDistribution />,
  },
  {
    id: 'auctions',
    icon: <Asterisk size={24} strokeWidth={1.5} />,
    title: 'Auctions',
    titleSecondary: 'Auctions',
    content: <Auctions />,
  },
  {
    id: 'roles',
    icon: <Asterisk size={24} strokeWidth={1.5} />,
    title: 'Roles',
    titleSecondary: 'Roles',
    content: <Roles />,
  },
  {
    id: 'voting',
    icon: <Asterisk size={24} strokeWidth={1.5} />,
    title: 'Voting',
    titleSecondary: 'Voting',
    content: <Voting />,
  },
]

const DeployAccordionTrigger = ({
  id,
  icon,
  title,
}: Omit<DeployStep, 'content' | 'titleSecondary'>) => {
  const selectedSection = useAtomValue(deployStepAtom)
  const isActive = selectedSection === id

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
            'rounded-full p-1',
            isActive ? 'bg-primary/10 text-primary' : 'bg-muted-foreground/10'
          )}
        >
          {icon}
        </div>
        <div
          className={cn(
            'text-xl font-bold animate-fade-in',
            isActive ? 'text-primary hidden' : ''
          )}
        >
          {title}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <div className="bg-muted-foreground/10 rounded-full p-1" role="button">
          <ArrowUpRightIcon size={24} strokeWidth={1.5} />
        </div>
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

const DeployAccordion = () => {
  const [section, setSection] = useAtom(deployStepAtom)

  useEffect(() => {
    setSection(DEPLOY_STEPS[0].id)
  }, [])

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full bg-secondary rounded-xl"
      value={section}
      onValueChange={(value) => setSection(value as DeployStepId)}
    >
      {DEPLOY_STEPS.map(({ id, icon, title, titleSecondary, content }) => (
        <AccordionItem
          key={id}
          value={id}
          className="[&:not(:last-child)]:border-b-4 [&:not(:first-child)]:border-t border-secondary rounded-[1.25rem] bg-card"
        >
          <DeployAccordionTrigger id={id} icon={icon} title={title} />
          <AccordionContent className="flex flex-col animate-fade-in">
            <div className="text-2xl font-bold text-primary ml-6 mb-2">
              {titleSecondary}
            </div>
            {content}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
export default DeployAccordion
