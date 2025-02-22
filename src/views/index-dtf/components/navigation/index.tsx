import GovernanceIcon from '@/components/icons/Governance'
import IssuanceIcon from '@/components/icons/Issuance'
import ManagerIcon from '@/components/icons/ManagerIcon'
import TradeIcon from '@/components/icons/Trade'
import { cn } from '@/lib/utils'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { ROUTES } from '@/utils/constants'
import { t } from '@lingui/macro'
import { useAtomValue } from 'jotai'
import { Globe } from 'lucide-react'
import { useMemo } from 'react'
import { NavLink } from 'react-router-dom'

const NavigationItem = ({
  icon,
  label,
  route,
}: {
  icon: React.ReactNode
  label: string
  route: string
}) => {
  return (
    <NavLink to={route}>
      {({ isActive }) => (
        <div
          className={cn(
            'flex items-center gap-2 h-6 hover:text-primary',
            isActive ? 'text-primary' : 'text-text'
          )}
        >
          {/* <div
            className={cn(
              'flex items-center justify-center rounded-full h-6 w-6 border border-border',
              isActive ? 'bg-primary/10' : 'bg-border'
            )}
          > */}
          <div className="h-6 w-6 flex items-center justify-center">{icon}</div>
          {/* </div> */}
          <div className="text-sm hidden md:block">{label}</div>
        </div>
      )}
    </NavLink>
  )
}

const NavigationItems = () => {
  const dtf = useAtomValue(indexDTFAtom)

  const items = useMemo(
    () => [
      {
        icon: <Globe size={14} />,
        label: t`Overview`,
        route: ROUTES.OVERVIEW,
      },
      {
        icon: <IssuanceIcon />,
        label: t`Mint + Redeem`,
        route: ROUTES.ISSUANCE,
      },
      {
        icon: <GovernanceIcon />,
        label: t`Governance`,
        route: ROUTES.GOVERNANCE,
      },
      {
        icon: <TradeIcon />,
        label: t`Auctions`,
        route: ROUTES.AUCTIONS,
      },
      {
        icon: <ManagerIcon />,
        label: t`Details + Roles`,
        route: ROUTES.SETTINGS,
      },
    ],
    [dtf?.token.symbol]
  )

  return (
    <div className="flex lg:flex-col gap-4 justify-evenly lg:justify-start">
      {items.map((item) => (
        <NavigationItem key={item.route} {...item} />
      ))}
    </div>
  )
}

const IndexDTFNavigation = () => {
  return (
    <div className="w-full lg:sticky lg:top-0 p-6 fixed bottom-0 border-t lg:border-t-0 lg:w-56 flex-shrink-0 bg-background z-[1] h-[72px] lg:h-full">
      <div className="sticky top-6">
        <NavigationItems />
      </div>
    </div>
  )
}

export default IndexDTFNavigation
