import { cn } from '@/lib/utils'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { ROUTES } from '@/utils/constants'
import { t } from '@lingui/macro'
import { useAtomValue } from 'jotai'
import {
  Globe,
  Blend,
  Landmark,
  ArrowLeftRight,
  Fingerprint,
} from 'lucide-react'
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
            'flex items-center transition-all rounded-full gap-2  hover:text-primary',
            isActive
              ? 'text-primary bg-primary/10 md:bg-transparent'
              : 'text-text'
          )}
        >
          {/* <div
            className={cn(
              'flex items-center justify-center rounded-full h-6 w-6 border border-border',
              isActive ? 'bg-primary/10' : 'bg-border'
            )}
          > */}
          <div className="h-10 w-10 md:h-6 md:w-6 flex items-center justify-center">
            {icon}
          </div>
          {/* </div> */}
          <div className="text-base hidden md:block">{label}</div>
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
        icon: <Globe strokeWidth={1.5} size={16} />,
        label: t`Overview`,
        route: ROUTES.OVERVIEW,
      },
      {
        icon: <Blend strokeWidth={1.5} size={16} />,
        label: t`Mint + Redeem`,
        route: ROUTES.ISSUANCE,
      },
      {
        icon: <Landmark strokeWidth={1.5} size={16} />,
        label: t`Governance`,
        route: ROUTES.GOVERNANCE,
      },
      {
        icon: <ArrowLeftRight strokeWidth={1.5} size={16} />,
        label: t`Auctions`,
        route: ROUTES.AUCTIONS,
      },
      {
        icon: <Fingerprint strokeWidth={1.5} size={16} />,
        label: t`Details + Roles`,
        route: ROUTES.SETTINGS,
      },
    ],
    [dtf?.token.symbol]
  )

  return (
    <div className="flex lg:flex-col gap-5 justify-evenly lg:justify-start">
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
