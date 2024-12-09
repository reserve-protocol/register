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
import MetadataAndChain from './metadata-and-chain'
import { DeployStepId } from '../form-fields'
import FTokenBasket from './ftoken-basket'

export type DeployStep = {
  id: DeployStepId
  icon: ReactNode
  title: string
  content: ReactNode
}

export const DEPLOY_STEPS: DeployStep[] = [
  {
    id: 'metadata',
    icon: <Asterisk size={24} strokeWidth={1.5} />,
    title: 'Metadata & Chain',
    content: <MetadataAndChain />,
  },
  {
    id: 'primary-basket',
    icon: <BasketCubeIcon fontSize={24} />,
    title: 'FToken Basket',
    content: <FTokenBasket />,
  },
  {
    id: 'emergency-collateral',
    icon: <Asterisk size={24} strokeWidth={1.5} />,
    title: 'Emergency collateral',
    content: 'content',
  },
  {
    id: 'revenue-distribution',
    icon: <Asterisk size={24} strokeWidth={1.5} />,
    title: 'Revenue distribution',
    content: 'content',
  },
  {
    id: 'governance',
    icon: <Asterisk size={24} strokeWidth={1.5} />,
    title: 'Governance',
    content: 'content',
  },
]

const DeployAccordionTrigger = ({
  id,
  icon,
  title,
}: Omit<DeployStep, 'content'>) => {
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
      {DEPLOY_STEPS.map(({ id, icon, title, content }) => (
        <AccordionItem
          key={id}
          value={id}
          className="[&:not(:last-child)]:border-b-4 [&:not(:first-child)]:border-t border-secondary rounded-[1.25rem] bg-card"
        >
          <DeployAccordionTrigger id={id} icon={icon} title={title} />
          <AccordionContent className="flex flex-col animate-fade-in">
            <div className="text-2xl font-bold text-primary ml-6 mb-2">
              {title}
            </div>
            {content}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
export default DeployAccordion
