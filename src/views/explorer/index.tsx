import { NavLink, Outlet } from 'react-router-dom'
import { Box } from 'theme-ui'
import { ROUTES } from 'utils/constants'

const NavItem = ({
  to,
  children,
}: {
  to: string
  children: React.ReactNode
}) => (
  <NavLink
    style={({ isActive }) => ({
      textDecoration: 'none',
      display: 'block',
      paddingBottom: !isActive ? '15px' : '12px',
      paddingTop: '12px',
      // width: 120,
      color: 'inherit',
      lineHeight: '32px',
      fontWeight: isActive ? 'bold' : 'normal',
      borderBottom: isActive ? '3px solid' : '0px solid',
      borderColor: 'primary',
      textAlign: 'center',
    })}
    to={to}
  >
    {children}
  </NavLink>
)

const Navigation = () => {
  return (
    <Box
      variant="layout.verticalAlign"
      sx={{
        borderBottom: '1px solid',
        borderColor: 'border',
        gap: [3, 4],
        justifyContent: 'center',
        fontSize: [1, 2],
      }}
    >
      <NavItem to={ROUTES.EXPLORER_TRANSACTIONS}>
        <Box as="span" sx={{ display: ['block', 'none'] }}>
          Txs
        </Box>
        <Box sx={{ display: ['none', 'block'] }}>Transactions</Box>
      </NavItem>
      <NavItem to={ROUTES.EXPLORER_TOKENS}>Tokens</NavItem>
      <NavItem to={ROUTES.EXPLORER_COLLATERALS}>Collaterals</NavItem>
      <NavItem to={ROUTES.EXPLORER_GOVERNANCE}>Governance</NavItem>
      <NavItem to={ROUTES.EXPLORER_REVENUE}>Revenue</NavItem>
      <NavItem to={ROUTES.EXPLORER_STAKING_ESTIMATOR}>
        <Box as="span" sx={{ display: ['block', 'none'] }}>
          Estimator
        </Box>
        <Box sx={{ display: ['none', 'block'] }}>Staking Estimator</Box>
      </NavItem>
    </Box>
  )
}

const Explorer = () => (
  <Box variant="layout.wrapper">
    <Navigation />
    <Box sx={{ flexGrow: 1 }}>
      <Outlet />
    </Box>
  </Box>
)
export default Explorer
