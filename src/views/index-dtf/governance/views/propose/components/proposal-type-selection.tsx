import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ROUTES, GOVERNANCE_PROPOSAL_TYPES } from '@/utils/constants'
import { Trans } from '@lingui/macro'
import { ArrowRight, Asterisk } from 'lucide-react'
import { Link } from 'react-router-dom'

const proposalTypes = [
  {
    icon: <Asterisk size={24} />,
    title: 'DTF Basket',
    route: GOVERNANCE_PROPOSAL_TYPES.BASKET,
    enabled: true,
  },
  {
    icon: <Asterisk size={24} />,
    title: 'Fees',
    route: GOVERNANCE_PROPOSAL_TYPES.FEES,
    enabled: false,
  },
  {
    icon: <Asterisk size={24} />,
    title: 'Roles',
    route: GOVERNANCE_PROPOSAL_TYPES.ROLES,
    enabled: false,
  },
  {
    icon: <Asterisk size={24} />,
    title: 'Other',
    route: GOVERNANCE_PROPOSAL_TYPES.OTHER,
    enabled: false,
  },
]

const Header = () => (
  <div className="flex flex-row items-center border-none p-7 py-5">
    <h1 className="mr-auto text-primary text-xl font-bold">
      <Trans>Select proposal type</Trans>
    </h1>
    <Link to={`../${ROUTES.GOVERNANCE}`}>
      <Button
        variant="outline"
        className="text-destructive hover:text-destructive"
      >
        Cancel
      </Button>
    </Link>
  </div>
)

const TypeList = () => (
  <div className="bg-card m-1 rounded-3xl">
    {proposalTypes.map((proposalType, index) => (
      <Link
        key={proposalType.title}
        to={proposalType.enabled ? proposalType.route : ''}
        className={cn(
          'flex flex-row items-center p-6 gap-4 hover:text-primary',
          index !== proposalTypes.length - 1 ? 'border-b border-border' : '',
          !proposalType.enabled &&
            'opacity-50 cursor-not-allowed hover:text-muted-foreground'
        )}
      >
        <div className="rounded-full h-8 w-8 bg-input flex items-center justify-center">
          {proposalType.icon}
        </div>
        <h4 className="bg-card m-1 mr-auto font-bold">{proposalType.title}</h4>
        <div className="rounded-full h-8 w-8 bg-input flex items-center justify-center">
          <ArrowRight size={16} />
        </div>
      </Link>
    ))}
  </div>
)

const ProposalTypeSelection = () => {
  return (
    <div className="flex h-[calc(100vh-146px)] lg:h-[calc(100vh-72px)] w-full">
      <div className="flex items-center justify-center m-4 flex-grow  border-dashed border-2 border-foreground/40 rounded-3xl">
        <div className="bg-secondary rounded-3xl w-[408px]">
          <Header />
          <TypeList />
        </div>
      </div>
    </div>
  )
}

export default ProposalTypeSelection
