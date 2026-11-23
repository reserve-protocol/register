import { cn } from '@/lib/utils'
import { Trans } from '@lingui/react/macro'
import {
  ArrowLeftRight,
  Landmark,
  Package,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { ROUTES } from 'utils/constants'

const NavItem = ({
  to,
  icon: Icon,
  children,
}: {
  to: string
  icon: LucideIcon
  children: ReactNode
}) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      cn(
        'border-b-[3px] border-transparent pb-[9px] pt-3 text-foreground no-underline transition-colors',
        'sm:flex sm:h-10 sm:items-center sm:gap-2 sm:rounded-full sm:border-0 sm:px-4 sm:py-0 sm:font-medium sm:hover:bg-muted',
        isActive &&
          'border-primary font-bold sm:bg-accent sm:font-semibold sm:text-primary sm:hover:bg-accent'
      )
    }
  >
    <Icon size={18} strokeWidth={1.8} className="hidden sm:block" aria-hidden />
    {children}
  </NavLink>
)

const ExplorerNav = () => (
  <nav
    data-testid="explorer-nav"
    className="flex items-center justify-between gap-3 px-4 text-sm sm:mx-auto sm:w-fit sm:justify-center sm:gap-0.5 sm:rounded-full sm:bg-card sm:p-1 sm:text-base sm:shadow-sm sm:ring-1 sm:ring-border/60"
  >
    <NavItem to={ROUTES.EXPLORER_GOVERNANCE} icon={Landmark}>
      <Trans>Governance</Trans>
    </NavItem>
    <NavItem to={ROUTES.EXPLORER_TRANSACTIONS} icon={ArrowLeftRight}>
      <span className="sm:hidden">
        <Trans>Txs</Trans>
      </span>
      <span className="hidden sm:inline">
        <Trans>Transactions</Trans>
      </span>
    </NavItem>
    <NavItem to={ROUTES.EXPLORER_REVENUE} icon={TrendingUp}>
      <Trans>Revenue</Trans>
    </NavItem>
    <NavItem to={ROUTES.EXPLORER_COLLATERALS} icon={Package}>
      <Trans>Collaterals</Trans>
    </NavItem>
  </nav>
)

export default ExplorerNav
