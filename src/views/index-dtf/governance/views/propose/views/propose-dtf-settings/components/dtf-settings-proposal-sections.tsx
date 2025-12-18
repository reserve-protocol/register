import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/utils/constants'
import { useAtom, useAtomValue } from 'jotai'
import {
  ArrowLeftIcon,
  BadgePercent,
  Braces,
  ChevronDownIcon,
  ChevronUpIcon,
  Coins,
  Crown,
  Scale,
  Landmark,
} from 'lucide-react'
import { ReactNode, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { selectedSectionAtom } from '../atoms'
import ProposeAuctionSettings from './sections/propose-auction-settings'
import ProposeDTFRevenue from './sections/propose-dtf-revenue'
import ProposeDTFRoles from './sections/propose-dtf-roles'
import ProposeMetadata from './sections/propose-metadata'
import RemoveDustTokens from './sections/remove-dust-tokens'
import ProposeGovernanceSettings from './sections/propose-governance-settings'

type DTF_SETTINGS_ID = 'mandate' | 'fees' | 'auction' | 'tokens' | 'roles' | 'governance'

// Scroll utility function adapted from deploy
const scrollToSection = (sectionId: string) => {
  setTimeout(() => {
    const element = document.getElementById(`propose-section-${sectionId}`)
    if (element) {
      const wrapper = document.getElementById('app-container')
      if (wrapper) {
        const count = element.offsetTop - wrapper.scrollTop
        wrapper.scrollBy({ top: count, left: 0, behavior: 'smooth' })
      }
    }
  }, 250)
}

export type DTF_SETTING = {
  id: DTF_SETTINGS_ID
  icon: ReactNode
  title: string
  titleSecondary: string
  content: ReactNode
}

const DTF_SETTINGS: DTF_SETTING[] = [
  {
    id: 'mandate',
    icon: <Braces size={14} strokeWidth={1.5} />,
    title: 'Basics',
    titleSecondary: 'Basics',
    content: <ProposeMetadata />,
  },
  {
    id: 'roles',
    icon: <Crown size={14} strokeWidth={1.5} />,
    title: 'Roles',
    titleSecondary: 'Roles',
    content: <ProposeDTFRoles />,
  },
  {
    id: 'fees',
    icon: <BadgePercent size={14} strokeWidth={1.5} />,
    title: 'Fees & Distribution',
    titleSecondary: 'Fees & Distribution',
    content: <ProposeDTFRevenue />,
  },
  {
    id: 'auction',
    icon: <Scale size={14} strokeWidth={1.5} />,
    title: 'Auctions',
    titleSecondary: 'Auction settings',
    content: <ProposeAuctionSettings />,
  },
  {
    id: 'tokens',
    icon: <Coins size={14} strokeWidth={1.5} />,
    title: 'Remove Dust Tokens',
    titleSecondary: 'Remove tokens from basket',
    content: <RemoveDustTokens />,
  },
  {
    id: 'governance',
    icon: <Landmark size={14} strokeWidth={1.5} />,
    title: 'Governance',
    titleSecondary: 'Governance Parameters',
    content: <ProposeGovernanceSettings />,
  },
]

const ProposeSectionTrigger = ({
  id,
  icon,
  title,
}: Omit<DTF_SETTING, 'content' | 'titleSecondary'>) => {
  const selectedSection = useAtomValue(selectedSectionAtom)
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
            'rounded-full p-2 border border-foreground',
            isActive && 'border-primary text-primary'
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
    <h1 className="font-bold text-xl">DTF settings proposal</h1>
  </div>
)

const DTFSettingsProposalSections = () => {
  const [section, setSection] = useAtom(selectedSectionAtom)

  return (
    <div className="w-full bg-secondary rounded-4xl h-fit">
      <Header />
      <Accordion
        type="single"
        collapsible
        value={section}
        className="p-1"
        onValueChange={(value: string | undefined) => {
          setSection(value)
          if (value) {
            scrollToSection(value)
          }
        }}
      >
        {DTF_SETTINGS.map(({ id, icon, title, titleSecondary, content }) => (
          <AccordionItem
            key={id}
            value={id}
            id={`propose-section-${id}`}
            className="[&:not(:last-child)]:border-b-4 [&:not(:first-child)]:border-t border-secondary rounded-[1.25rem] bg-card"
          >
            <ProposeSectionTrigger id={id} icon={icon} title={title} />
            <AccordionContent className="flex flex-col animate-fade-in">
              <div className="text-2xl font-bold text-primary ml-6 mb-2">
                {titleSecondary}
              </div>
              {content}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}

export default DTFSettingsProposalSections
