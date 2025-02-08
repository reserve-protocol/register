import GovernanceIcon from '@/components/icons/Governance'
import IssuanceIcon from '@/components/icons/Issuance'
import TradeIcon from '@/components/icons/Trade'
import TokenLogo from '@/components/token-logo'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { ROUTES } from '@/utils/constants'
import { t } from '@lingui/macro'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { Link, NavLink } from 'react-router-dom'

const Header = () => {
  const dtf = useAtomValue(indexDTFAtom)

  if (!dtf) {
    return (
      <div className="hidden lg:flex flex-col gap-2 mb-4">
        <Skeleton className="h-4 w-20" />
      </div>
    )
  }

  return (
    <Link
      to={ROUTES.HOME}
      className="lg:flex items-center gap-2 hidden pb-4 mb-4 border-b"
    >
      {/* <div className="p-1 rounded-full bg-muted">
        <ChevronLeft size={16} />
      </div> */}
      <h4 className="text-legend max-w-40 break-words">${dtf.token.symbol}</h4>
    </Link>
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
        icon: <TokenLogo symbol={dtf?.token.symbol} />,
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
      // {
      //   icon: <Asterisk size={12} />,
      //   label: t`DTF settings`,
      //   route: ROUTES.SETTINGS,
      // },
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
        <Header />
        <NavigationItems />
      </div>
    </div>
  )
}

export default IndexDTFNavigation
