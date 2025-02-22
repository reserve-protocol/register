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
            'flex items-center transition-all rounded-full justify-center gap-2 h-10 w-10 md:h-6 md:w-6 hover:text-primary',
            isActive ? 'text-primary bg-primary/10' : 'text-text'
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
        icon: <Globe className="h-6 w-6 md:w-3 md:h-3" />,
        label: t`Overview`,
        route: ROUTES.OVERVIEW,
      },
      {
        icon: <IssuanceIcon className="text-2xl md:text-sm" />,
        label: t`Mint + Redeem`,
        route: ROUTES.ISSUANCE,
      },
      {
        icon: <GovernanceIcon className="text-2xl md:text-sm" />,
        label: t`Governance`,
        route: ROUTES.GOVERNANCE,
      },
      {
        icon: <TradeIcon className="text-2xl md:text-sm" />,
        label: t`Auctions`,
        route: ROUTES.AUCTIONS,
      },
      {
        icon: <ManagerIcon className="text-2xl md:text-sm" />,
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
    <div className="w-full lg:sticky lg:top-0 p-3 md:p-6 fixed bottom-0 border-t lg:border-t-0 lg:w-56 flex-shrink-0 bg-background z-[1] h-16 lg:h-full">
      <div className="sticky top-6">
        <NavigationItems />
      </div>
    </div>
  )
}

export default IndexDTFNavigation
