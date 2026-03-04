import { NavLink, Outlet } from 'react-router-dom'
import { ROUTES } from 'utils/constants'

const NavItem = ({
  to,
  children,
}: {
  to: string
  children: React.ReactNode
}) => (
  <NavLink
    className={({ isActive }) =>
      `block py-3 text-center leading-8 no-underline ${isActive
        ? 'font-bold border-b-[3px] border-primary pb-[9px]'
        : 'border-b-0'
      }`
    }
    to={to}
  >
    {children}
  </NavLink>
)

const Navigation = () => {
  return (
    <div className="flex items-center border-b border-border gap-4 md:gap-6 justify-center text-sm md:text-base">
      <NavItem to={ROUTES.EXPLORER_TRANSACTIONS}>
        <span className="block md:hidden">Txs</span>
        <span className="hidden md:block">Transactions</span>
      </NavItem>
      <NavItem to={ROUTES.EXPLORER_TOKENS}>Tokens</NavItem>
      <NavItem to={ROUTES.EXPLORER_COLLATERALS}>Collaterals</NavItem>
      <NavItem to={ROUTES.EXPLORER_GOVERNANCE}>Governance</NavItem>
      <NavItem to={ROUTES.EXPLORER_REVENUE}>Revenue</NavItem>
    </div>
  )
}

const Explorer = () => (
  <div className="container flex flex-col gap-1 ">
    <Navigation />
    <div className="flex-grow">
      <Outlet />
    </div>
  </div>
)

export default Explorer
