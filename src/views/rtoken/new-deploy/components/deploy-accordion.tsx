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
import MetadataAndChain from './metadata-and-chain'

export type DeploySection = {
  icon: ReactNode
  title: string
  content: ReactNode
}

export const DEPLOY_SECTIONS: DeploySection[] = [
  {
    icon: <Asterisk size={24} strokeWidth={1.5} />,
    title: 'Metadata & Chain',
    content: <MetadataAndChain />,
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
  const [section, setSection] = useAtom(deploySectionAtom)

  useEffect(() => {
    setSection(DEPLOY_SECTIONS[0].title)
  }, [])

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full bg-secondary rounded-xl"
      value={section}
      onValueChange={(value) => setSection(value)}
    >
      {DEPLOY_SECTIONS.map(({ icon, title, content }) => (
        <AccordionItem
          key={title}
          value={title}
          className="[&:not(:last-child)]:border-b-4 [&:not(:first-child)]:border-t border-secondary rounded-[1.25rem] bg-card"
        >
          <DeployAccordionTrigger icon={icon} title={title} />
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
