import TokenLogo from '@/components/token-logo'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { iTokenAtom } from '@/state/dtf/atoms'
import { ROUTES } from '@/utils/constants'
import { t } from '@lingui/macro'
import { useAtomValue } from 'jotai'
import { Asterisk } from 'lucide-react'
import { useMemo } from 'react'
import { NavLink } from 'react-router-dom'

const Header = () => {
  const token = useAtomValue(iTokenAtom)

  if (!token) {
    return (
      <div className="hidden lg:flex flex-col gap-2 mb-4">
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-4 w-20" />
      </div>
    )
  }

  return (
    <div className="lg:flex flex-col gap-2 hidden mb-4">
      <TokenLogo size="lg" symbol={token.address} />
      <h4 className="font-bold">${token.symbol}</h4>
    </div>
  )
}

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
          <div
            className={cn(
              'flex items-center justify-center rounded-full h-6 w-6 border border-border',
              isActive ? 'bg-primary/10' : 'bg-border'
            )}
          >
            {icon}
          </div>
          <div className="text-sm">{label}</div>
        </div>
      )}
    </NavLink>
  )
}

const NavigationItems = () => {
  const items = useMemo(
    () => [
      {
        icon: <Asterisk size={12} />,
        label: t`Overview`,
        route: ROUTES.OVERVIEW,
      },
      {
        icon: <Asterisk size={12} />,
        label: t`Mint + Redeem`,
        route: ROUTES.ISSUANCE,
      },
      {
        icon: <Asterisk size={12} />,
        label: t`Governance`,
        route: ROUTES.GOVERNANCE,
      },
      {
        icon: <Asterisk size={12} />,
        label: t`Auctions`,
        route: ROUTES.AUCTIONS,
      },
      // {
      //   icon: <Asterisk size={12} />,
      //   label: t`DTF settings`,
      //   route: ROUTES.SETTINGS,
      // },
    ],
    []
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
    <div className="w-full lg:sticky top-6 p-6 fixed bottom-0 border-t lg:border-t-0 lg:w-56 flex-shrink-0 bg-background z-[1] h-[72px] lg:h-full">
      <div className="sticky top-6">
        <Header />
        <NavigationItems />
      </div>
    </div>
  )
}

export default IndexDTFNavigation
