import { Box } from 'theme-ui'
import { ROUTES } from 'utils/constants'
import AuctionsIcon from 'components/icons/AuctionsIcon'
import HomeIcon from 'components/icons/HomeIcon'
import IssuanceIcon from 'components/icons/IssuanceIcon'
import OverviewIcon from 'components/icons/OverviewIcon'
import StakeIcon from 'components/icons/StakeIcon'
import { NavLink } from 'react-router-dom'
import useRToken from 'hooks/useRToken'
import { useMemo } from 'react'

const items = [
  { path: ROUTES.HOME, Icon: HomeIcon },
  { path: ROUTES.OVERVIEW, Icon: OverviewIcon },
  { path: ROUTES.ISSUANCE, Icon: IssuanceIcon },
  { path: ROUTES.INSURANCE, Icon: StakeIcon },
  { path: ROUTES.AUCTIONS, Icon: AuctionsIcon },
]

const MobileNav = () => {
  const rToken = useRToken()
  const menuItems = useMemo(() => {
    if (rToken?.isRSV) {
      return [...items.slice(0, 3)]
    }

    return items
  }, [rToken?.address])

  if (!rToken) {
    return null
  }

  return (
    <Box
      variant="layout.verticalAlign"
      sx={{
        display: ['flex', 'none'],
        borderTop: '1px solid',
        borderColor: 'darkBorder',
        justifyContent: 'space-evenly',
      }}
    >
      {menuItems.map(({ path, Icon }) => (
        <NavLink
          style={({ isActive }) => ({
            padding: 16,
            textDecoration: 'none',
            color: 'inherit',
            display: 'flex',
            alignItems: 'center',
            paddingBottom: isActive ? '13px' : 16,
            borderBottom: isActive ? '3px solid black' : 'none',
          })}
          key={path}
          to={`${path}?token=${rToken?.address}`}
        >
          <Icon />
        </NavLink>
      ))}
    </Box>
  )
}

export default MobileNav
