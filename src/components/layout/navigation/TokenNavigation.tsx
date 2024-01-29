import { t } from '@lingui/macro'
import AuctionsIcon from 'components/icons/AuctionsIcon'
import GovernanceIcon from 'components/icons/GovernanceIcon'
import IssuanceIcon from 'components/icons/IssuanceIcon'
import ManagerIcon from 'components/icons/ManagerIcon'
import StakeIcon from 'components/icons/StakeIcon'
import TokenLogo from 'components/icons/TokenLogo'
import useRToken from 'hooks/useRToken'
import { useAtomValue } from 'jotai'
import { chainIdAtom, selectedRTokenAtom } from 'state/atoms'
import { NavLink } from 'react-router-dom'
import { Box, Flex, Text } from 'theme-ui'
import { ROUTES } from 'utils/constants'
import { getTokenRoute } from 'utils'

interface NavigationItem {
  icon: any
  label: string
  route: string
  subnav?: { label: string; index: string }[]
}

const RTokenIcon = () => {
  const token = useRToken()

  return <TokenLogo symbol={token?.symbol} />
}

const navigation: NavigationItem[] = [
  {
    icon: <RTokenIcon />,
    label: t`Overview`,
    route: ROUTES.OVERVIEW,
  },
  {
    icon: <IssuanceIcon />,
    label: t`Issuance`,
    route: ROUTES.ISSUANCE,
  },
  {
    icon: <StakeIcon />,
    label: t`Staking`,
    route: ROUTES.STAKING,
  },
  {
    icon: <AuctionsIcon />,
    label: t`Auctions`,
    route: ROUTES.AUCTIONS,
  },
  {
    icon: <GovernanceIcon />,
    label: t`Governance`,
    route: ROUTES.GOVERNANCE,
  },
  {
    icon: <ManagerIcon />,
    label: t`Details + Roles`,
    route: ROUTES.SETTINGS,
  },
]

const NavItem = ({ icon, label, route }: NavigationItem) => {
  return (
    <NavLink
      style={({ isActive }) => ({
        marginBottom: '4px',
        textDecoration: 'none',
        backgroundColor: isActive ? 'red' : 'white',
        color: isActive ? '#2150A9' : 'inherit',
      })}
      to={route}
      // sx={{
      //   cursor: 'pointer',
      //   borderRadius: '8px',
      //   ':hover': { backgroundColor: 'border' },
      // }}
    >
      <Box variant="layout.verticalAlign" p="2">
        <Flex
          sx={{
            width: '20px',
            fontSize: 3,
            justifyContent: 'center',
            color: 'text',
          }}
        >
          {icon}
        </Flex>
        <Text sx={{ fontWeight: 700 }} ml="2">
          {label}
        </Text>
      </Box>
    </NavLink>
  )
}

const TokenNavigation = () => {
  return (
    <Box
      sx={{
        width: '200px',
        borderRight: '1px solid',
        borderColor: 'border',
        position: 'relative',
        flexShrink: 0,
      }}
    >
      <Box sx={{ position: 'sticky', top: 0 }} padding={[16]}>
        {navigation.map((props) => (
          <NavItem key={props.route} {...props} />
        ))}
      </Box>
    </Box>
  )
}

export default TokenNavigation
