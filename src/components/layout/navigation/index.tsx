import { t, Trans } from '@lingui/macro'
import AuctionsIcon from 'components/icons/AuctionsIcon'
import DiscussionsIcon from 'components/icons/DiscussionsIcon'
import GovernanceIcon from 'components/icons/GovernanceIcon'
import IssuanceIcon from 'components/icons/IssuanceIcon'
import ManagerIcon from 'components/icons/ManagerIcon'
import OverviewIcon from 'components/icons/OverviewIcon'
import StakeIcon from 'components/icons/StakeIcon'
import useRToken from 'hooks/useRToken'
import { useMemo } from 'react'
import { NavLink } from 'react-router-dom'
import { transition } from 'theme'
import { Box, Link, NavLinkProps, Text } from 'theme-ui'
import { ROUTES } from 'utils/constants'

interface Item {
  path: string
  title: string
  Icon: React.ElementType
  collapsed?: boolean
}

interface NavItemProps extends Item, Omit<NavLinkProps, 'title'> {
  rTokenAddress: string
  to?: any
}

const MenuItem = ({ title, Icon, collapsed }: Omit<Item, 'path'>) => {
  return (
    <Box
      px={2}
      sx={{
        display: 'flex',
        flexGrow: 1,
        alignItems: 'center',
        transition,
      }}
      my={[10, 10, 2]}
    >
      <Icon />
      <Text
        sx={{
          display: collapsed ? 'none' : ['none', 'none', 'inherit'],
          whiteSpace: 'nowrap',
          fontWeight: 300,
        }}
        ml={2}
      >
        {title}
      </Text>
    </Box>
  )
}

const NavItem = ({
  path,
  title,
  Icon,
  rTokenAddress,
  collapsed,
  ...props
}: NavItemProps) => (
  <NavLink
    style={({ isActive }) => ({
      textDecoration: 'none',
      marginLeft: 12,
      marginRight: 12,
      paddingBottom: '12px',
      paddingTop: '12px',
      opacity: isActive ? '1' : '0.68',
      color: 'inherit',
      lineHeight: '32px',
      boxShadow: isActive
        ? 'inset 0 0px 0px var(--theme-ui-colors-background), inset 0 -2px 0px currentColor, inset 0 0px 0px var(--theme-ui-colors-background)'
        : 'none',
      display: 'flex',
    })}
    to={`${path}?token=${rTokenAddress}`}
    {...props}
  >
    <MenuItem title={title} Icon={Icon} collapsed={collapsed} />
  </NavLink>
)

// Sidebar Navigation
const Navigation = ({ collapsed = false }) => {
  const currentToken = useRToken()
  const PAGES = useMemo(() => {
    const items = [
      { path: ROUTES.OVERVIEW, title: t`Overview`, Icon: OverviewIcon },
      { path: ROUTES.ISSUANCE, title: t`Mint + Redeem`, Icon: IssuanceIcon },
      { path: ROUTES.STAKING, title: t`Stake + Unstake`, Icon: StakeIcon },
      { path: ROUTES.AUCTIONS, title: t`Auctions`, Icon: AuctionsIcon },
      { path: ROUTES.GOVERNANCE, title: t`Governance`, Icon: GovernanceIcon },
      {
        path: ROUTES.SETTINGS,
        title: t`Details + Roles`,
        Icon: ManagerIcon,
      },
    ]

    return items
  }, [])

  const pages = useMemo(() => {
    if (currentToken?.isRSV) {
      return [...PAGES.slice(0, 2)]
    }

    return PAGES
  }, [currentToken?.isRSV])

  return (
    <Box sx={{ display: 'flex' }} mx={'auto'}>
      {pages.map((item) => (
        <NavItem
          key={item.path}
          {...item}
          collapsed={collapsed}
          rTokenAddress={currentToken?.address ?? ''}
        />
      ))}
    </Box>
  )
}

export default Navigation
