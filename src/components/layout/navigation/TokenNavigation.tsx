import { t } from '@lingui/macro'
import AuctionsIcon from 'components/icons/AuctionsIcon'
import GovernanceIcon from 'components/icons/GovernanceIcon'
import IssuanceIcon from 'components/icons/IssuanceIcon'
import ManagerIcon from 'components/icons/ManagerIcon'
import StakeIcon from 'components/icons/StakeIcon'
import TokenLogo from 'components/icons/TokenLogo'
import useRToken from 'hooks/useRToken'
import { NavLink } from 'react-router-dom'
import { Box, Flex, Text } from 'theme-ui'
import { ROUTES } from 'utils/constants'

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
      style={{
        marginBottom: '4px',
        textDecoration: 'none',
        display: 'block',
      }}
      to={route}
    >
      {({ isActive }) => (
        <Box
          variant="layout.verticalAlign"
          p={[3, 2]}
          sx={{
            textDecoration: 'none',
            backgroundColor: isActive ? 'contentBackground' : 'background',
            borderRadius: '8px',
            color: isActive ? 'accent' : 'text',
          }}
        >
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
          <Text sx={{ fontWeight: 700, display: ['none', 'block'] }} ml="2">
            {label}
          </Text>
        </Box>
      )}
    </NavLink>
  )
}

const TokenNavigation = () => (
  <Box
    sx={{
      width: ['100%', '200px'],
      borderRight: ['none', '1px solid'],
      borderTop: ['1px solid', 'none'],
      borderColor: ['border', 'border'],
      position: ['fixed', 'relative'],
      bottom: [0, undefined],
      flexShrink: 0,
      zIndex: 1,
      backgroundColor: ['background', 'none'],
    }}
  >
    <Box
      sx={{
        position: 'sticky',
        top: 0,
        display: ['flex', 'block'],
        justifyContent: ['space-evenly', 'none'],
      }}
      padding={[2, 3]}
    >
      {navigation.map((props) => (
        <NavItem key={props.route} {...props} />
      ))}
    </Box>
  </Box>
)

export default TokenNavigation
