import IssuanceIcon from 'components/icons/IssuanceIcon'
import OverviewIcon from 'components/icons/OverviewIcon'
import StakeIcon from 'components/icons/StakeIcon'
import useIsSidebarVisible from 'hooks/useIsSidebarVisible'
import useRToken from 'hooks/useRToken'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { NavLink } from 'react-router-dom'
import { selectedRTokenAtom } from 'state/atoms'
import { Box } from 'theme-ui'
import { ROUTES } from 'utils/constants'

const items = [
  { path: ROUTES.OVERVIEW, Icon: OverviewIcon },
  { path: ROUTES.ISSUANCE, Icon: IssuanceIcon },
  { path: ROUTES.STAKING, Icon: StakeIcon },
]

const MobileNav = () => {
  const rToken = useRToken()
  const isVisible = useIsSidebarVisible()
  const address = useAtomValue(selectedRTokenAtom)

  const menuItems = useMemo(() => {
    if (rToken?.isRSV) {
      return [...items.slice(0, 3)]
    }

    return items
  }, [rToken?.address])

  if (!isVisible) {
    return null
  }

  return (
    <Box
      sx={{
        display: ['flex', 'none'],
        borderTop: '1px solid',
        borderColor: 'darkBorder',
        alignItems: 'center',
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
            borderBottom: isActive
              ? '3px solid var(--theme-ui-colors-text)'
              : 'none',
          })}
          key={path}
          to={`${path}?token=${address}`}
        >
          <Icon />
        </NavLink>
      ))}
    </Box>
  )
}

export default MobileNav
