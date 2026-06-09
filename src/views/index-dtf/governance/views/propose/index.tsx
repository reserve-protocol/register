import { cn } from '@/lib/utils'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { GOVERNANCE_PROPOSAL_TYPES, ROUTES } from '@/utils/constants'
import { Trans } from '@lingui/react/macro'
import { useAtomValue } from 'jotai'
import {
  ArrowLeft,
  ArrowRight,
  Boxes,
  Crown,
  LayoutGrid,
  Settings,
} from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import UpgradeBanners from './upgrade-banners'

const Header = () => (
  <div className="flex flex-row items-center border-none p-4 pl-7 pb-3">
    <Link
      className="p-2 rounded-full border border-primary text-primary hover:bg-primary/10"
      to={`../${ROUTES.GOVERNANCE}`}
    >
      <ArrowLeft size={14} />
    </Link>
    <h1 className="ml-4 text-primary text-xl font-semibold">
      <Trans>Select proposal type</Trans>
    </h1>
  </div>
)

const TypeList = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const proposalTypes = useMemo(() => {
    const ownerGovernor = dtf?.ownerGovernance?.id.toLowerCase()
    const basketGovernor = dtf?.tradingGovernance?.id.toLowerCase()
    const hasSharedGovernor = !!ownerGovernor && ownerGovernor === basketGovernor

    const types = [
      {
        icon: <Boxes strokeWidth={1.5} size={16} />,
        title: <Trans>DTF Basket</Trans>,
        route: GOVERNANCE_PROPOSAL_TYPES.BASKET,
      },
      {
        icon: <Settings size={16} strokeWidth={1.5} />,
        title: <Trans>DTF Settings</Trans>,
        route: GOVERNANCE_PROPOSAL_TYPES.DTF,
      },
      {
        icon: <Crown size={16} strokeWidth={1.5} />,
        title: <Trans>Basket settings</Trans>,
        route: GOVERNANCE_PROPOSAL_TYPES.BASKET_SETTINGS,
      },
      {
        icon: <LayoutGrid size={16} strokeWidth={1.5} />,
        title: <Trans>DAO</Trans>,
        route: GOVERNANCE_PROPOSAL_TYPES.OTHER,
      },
    ]
    if (hasSharedGovernor) {
      types.splice(2, 1)
    }

    return types
  }, [dtf])

  return (
    <div className="bg-card m-1 rounded-3xl">
      {proposalTypes.map(({ title, icon, route }, index) => (
        <Link
          key={route}
          to={route}
          className={cn(
            'flex flex-row items-center p-6 gap-4 hover:text-primary group',
            index !== proposalTypes.length - 1
              ? 'border-b border-border'
              : '',
          )}
        >
          <div className="rounded-full h-8 w-8 border border-foreground flex items-center justify-center group-hover:border-primary">
            {icon}
          </div>
          <h4 className="bg-card m-1 mr-auto font-semibold">{title}</h4>
          <div className="rounded-full h-8 w-8 bg-muted flex items-center justify-center">
            <ArrowRight size={16} />
          </div>
        </Link>
      ))}
    </div>
  )
}

const ProposalTypeSelection = () => {
  return (
    <>
      <div className="flex h-[calc(100vh-146px)] lg:h-[calc(100vh-72px)] w-full">
        <div className="flex flex-col gap-4 items-center justify-center m-4 flex-grow border-none sm:border-dashed border-2 border-foreground/40 rounded-3xl">
          <UpgradeBanners />
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
