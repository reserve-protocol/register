import { FileText, Settings, Users, GalleryHorizontal } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import Mandate from './mandate'
import Fees from './fees'
import Roles from './roles'
import Auctions from './auctions'

const GOVERNANCE_STEPS = [
  {
    id: 'mandate',
    title: 'Mandate',
    icon: FileText,
    content: <Mandate />,
  },
  {
    id: 'fees',
    title: 'Fees',
    icon: Settings,
    content: <Fees />,
  },
  {
    id: 'roles',
    title: 'Roles',
    icon: Users,
    content: <Roles />,
  },
  {
    id: 'auctions',
    title: 'Auctions',
    icon: GalleryHorizontal,
    content: <Auctions />,
  },
] as const

const GovernanceAccordion = () => {
  return (
    <Accordion type="multiple" className="w-full bg-secondary rounded-xl">
      {GOVERNANCE_STEPS.map(({ id, title, icon: Icon, content }) => (
        <AccordionItem
          key={id}
          value={id}
          id={`governance-section-${id}`}
          className="[&:not(:last-child)]:border-b-4 [&:not(:first-child)]:border-t group border-secondary rounded-[1.25rem] bg-card"
        >
          <AccordionTrigger className="flex items-center justify-between w-full p-6">
            <div className="flex items-center gap-2">
              <div className="rounded-full p-2 border border-foreground group-data-[state=open]:border-primary group-data-[state=open]:text-primary">
                <Icon size={14} strokeWidth={1.5} />
              </div>
              <div className="text-xl font-bold animate-fade-in group-data-[state=open]:hidden">
                {title}
              </div>
            </div>
          </AccordionTrigger>
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

export default GovernanceAccordion
