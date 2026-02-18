import { cn } from '@/lib/utils'
import { GOVERNANCE_PROPOSAL_TYPES, ROUTES } from '@/utils/constants'
import { Trans } from '@lingui/macro'
import {
  ArrowLeft,
  ArrowRight,
  Boxes,
  Crown,
  LayoutGrid,
  Settings,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import ProposeV4Upgrade from './upgrade-banners/propose-v4-upgrade'
import ProposeV5Upgrade from './upgrade-banners/propose-v5-upgrade'

const proposalTypes = [
  {
    icon: <Boxes strokeWidth={1.5} size={16} />,
    title: 'DTF Basket',
    route: GOVERNANCE_PROPOSAL_TYPES.BASKET,
    enabled: true,
  },
  {
    icon: <Settings size={16} strokeWidth={1.5} />,
    title: 'DTF Settings',
    route: GOVERNANCE_PROPOSAL_TYPES.DTF,
    enabled: true,
  },
  {
    icon: <Crown size={16} strokeWidth={1.5} />,
    title: 'Basket settings',
    route: GOVERNANCE_PROPOSAL_TYPES.BASKET_SETTINGS,
    enabled: true,
  },
  {
    icon: <LayoutGrid size={16} strokeWidth={1.5} />,
    title: 'DAO',
    route: GOVERNANCE_PROPOSAL_TYPES.OTHER,
    enabled: true,
  },
]

const Header = () => (
  <div className="flex flex-row items-center border-none p-4 pl-7 pb-3">
    <Link
      className="p-2 rounded-full border border-primary text-primary hover:bg-primary/10"
      to={`../${ROUTES.GOVERNANCE}`}
    >
      <ArrowLeft size={14} />
    </Link>
    <h1 className="ml-4 text-primary text-xl font-bold">
      <Trans>Select proposal type</Trans>
    </h1>
  </div>
)

const TypeList = () => (
  <div className="bg-card m-1 rounded-3xl">
    {proposalTypes.map(({ title, icon, route, enabled }, index) => (
      <Link
        key={title}
        to={enabled ? route : ''}
        className={cn(
          'flex flex-row items-center p-6 gap-4 hover:text-primary group',
          index !== proposalTypes.length - 1 ? 'border-b border-border' : '',
          !enabled && 'cursor-not-allowed hover:text-muted-foreground'
        )}
      >
        <div className="rounded-full h-8 w-8 border border-foreground flex items-center justify-center group-hover:border-primary">
          {icon}
        </div>
        <h4 className="bg-card m-1 mr-auto font-bold">{title}</h4>
        {!enabled && (
          <div className="text-nowrap text-legend text-xs border rounded-full px-2 py-1 bg-card">
            Coming soon
          </div>
        )}
        <div
          className={cn(
            'rounded-full h-8 w-8 bg-muted flex items-center justify-center',
            !enabled && 'opacity-50'
          )}
        >
          <ArrowRight size={16} />
        </div>
      </Link>
    ))}
  </div>
)

const ProposalTypeSelection = () => {
  return (
    <>
      <div className="flex h-[calc(100vh-146px)] lg:h-[calc(100vh-72px)] w-full">
        <div className="flex flex-col gap-4 items-center justify-center m-4 flex-grow border-none sm:border-dashed border-2 border-foreground/40 rounded-3xl">
          <ProposeV4Upgrade />
          <ProposeV5Upgrade />

          <div className="bg-secondary rounded-3xl w-full sm:w-[408px]">
            <Header />
            <TypeList />
          </div>
        </div>
      </div>
    </>
  )
}

export default ProposalTypeSelection
