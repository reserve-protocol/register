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
import { deploySectionAtom } from '../atoms'
import ChainSelector from './chain-selector'

export type DeploySection = {
  icon: ReactNode
  title: string
  content: ReactNode
}

export const DEPLOY_SECTIONS: DeploySection[] = [
  {
    icon: <Asterisk size={24} strokeWidth={1.5} />,
    title: 'Select chain',
    content: <ChainSelector />,
  },
  {
    icon: <BasketCubeIcon fontSize={24} />,
    title: 'Primary basket',
    content: 'content',
  },
  {
    icon: <Asterisk size={24} strokeWidth={1.5} />,
    title: 'Emergency collateral',
    content: 'content',
  },
  {
    icon: <Asterisk size={24} strokeWidth={1.5} />,
    title: 'Revenue distribution',
    content: 'content',
  },
  {
    icon: <Asterisk size={24} strokeWidth={1.5} />,
    title: 'Basic metadata',
    content: 'content',
  },
  {
    icon: <Asterisk size={24} strokeWidth={1.5} />,
    title: 'Governance',
    content: 'content',
  },
]

const DeployAccordionTrigger = ({
  icon,
  title,
}: Omit<DeploySection, 'content'>) => {
  const selectedSection = useAtomValue(deploySectionAtom)
  const isActive = selectedSection === title

  return (
    <AccordionTrigger
      withChevron={false}
      className="flex items-center justify-between w-full p-6"
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
          className={cn('text-xl font-bold', isActive ? 'text-primary' : '')}
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
  const [section, setSection] = useAtom(deploySectionAtom)

  useEffect(() => {
    setSection(DEPLOY_SECTIONS[0].title)
  }, [])

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full bg-secondary"
      value={section}
      onValueChange={(value) => setSection(value)}
    >
      {DEPLOY_SECTIONS.map(({ icon, title, content }) => (
        <AccordionItem
          key={title}
          value={title}
          className="border-b-4 border-t border-secondary rounded-xl bg-background"
        >
          <DeployAccordionTrigger icon={icon} title={title} />
          <AccordionContent className="px-8">{content}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
export default DeployAccordion
