import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { cn } from '@/lib/utils'
import {
  ArrowLeft,
  ChevronDownIcon,
  NotepadText,
  ScanQrCode,
  ScrollText,
  Signature,
} from 'lucide-react'
import { ReactNode } from 'react'
import ManageAbout from './manage-about'
import ManageCreator from './manage-creator'
import ManageCurator from './manage-curator'
import ManageSocials from './manage-socials'
import { Link } from 'react-router-dom'

type Step = 'about' | 'creator' | 'curator' | 'socials'

export type ProposalStep = {
  id: Step
  icon: ReactNode
  title: string
  description: ReactNode
  content: ReactNode
}

export const DEPLOY_STEPS: ProposalStep[] = [
  {
    id: 'about',
    icon: <Signature size={14} />,
    title: 'About',
    description: (
      <span>
        Customize the appearance of this DTF on{' '}
        <a
          href="https://app.reserve.org"
          target="_blank"
          className="text-primary"
        >
          app.reserve.org
        </a>{' '}
        and provide additional information for prospective holders. These
        changes will not automatically populate on external services like
        CoinGecko or CoinMarketCap.
      </span>
    ),
    content: <ManageAbout />,
  },
  {
    id: 'creator',
    icon: <ScrollText size={14} />,
    title: 'Creator',
    description: (
      <span>
        Customize the creator section below the DTF name. You can choose the
        profile picture, name of the creator, and provide a link to the creators
        website.
      </span>
    ),
    content: <ManageCreator />,
  },
  {
    id: 'curator',
    icon: <NotepadText size={14} />,
    title: 'Curator',
    description: (
      <span>
        Customize the curator section below the DTF name. You can choose the
        profile picture, name of the creator, and provide a link to the creators
        website.
      </span>
    ),
    content: <ManageCurator />,
  },
  {
    id: 'socials',
    icon: <ScanQrCode size={14} />,
    title: 'Socials',
    description: 'Add links to your social media accounts and website.',
    content: <ManageSocials />,
  },
]

const StepTrigger = ({
  id,
  icon,
  title,
}: Omit<ProposalStep, 'content' | 'description'>) => {
  return (
    <AccordionTrigger
      value={id}
      withChevron={false}
      className={cn(
        'flex items-center justify-between w-full p-5 group data-[state=open]:pb-2'
      )}
    >
      <div className="flex items-center gap-2 ">
        <div className="p-1 border rounded-full border-foreground group-data-[state=open]:border-primary group-data-[state=open]:text-primary">
          {icon}
        </div>
        <div
          className={cn(
            'text-left text-base sm:text-xl font-bold animate-fade-in group-data-[state=open]:hidden'
          )}
        >
          {title}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="bg-muted-foreground/10 rounded-full p-1" role="button">
          <ChevronDownIcon
            size={24}
            strokeWidth={1.5}
            className="transition-all group-data-[state=open]:rotate-180"
          />
        </div>
      </div>
    </AccordionTrigger>
  )
}

const Header = () => (
  <div className="p-4 pb-3">
    <Link className="flex items-center gap-2 ml-2 group" to="../overview">
      <div className="rounded-full text-primary border-primary border p-1 group-hover:bg-primary/10">
        <ArrowLeft size={16} />
      </div>
      <h1 className="text-primary font-bold text-xl">Edit Overview Content</h1>
    </Link>
  </div>
)

const ManageForm = () => {
  return (
    <div className="w-full bg-secondary rounded-3xl h-fit">
      <Header />
      <Accordion
        type="multiple"
        defaultValue={['about', 'creator', 'curator', 'socials']}
      >
        {DEPLOY_STEPS.map(({ id, icon, title, description, content }) => (
          <AccordionItem
            key={id}
            value={id}
            className="rounded-3xl bg-card m-1 border-none"
          >
            <StepTrigger id={id} icon={icon} title={title} />
            <AccordionContent className="flex flex-col animate-fade-in">
              <div className="mx-5 mb-2">
                <h2 className="text-xl sm:text-2xl font-bold text-primary">
                  {title}
                </h2>
                <p className="text-sm text-legend">{description}</p>
              </div>

              {content}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}

export default ManageForm
