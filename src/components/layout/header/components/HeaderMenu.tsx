import { t } from '@lingui/macro'
import BasketCubeIcon from 'components/icons/BasketCubeIcon'
import BridgeIcon from 'components/icons/BridgeIcon'
import BridgeNavIcon from 'components/icons/BridgeNavIcon'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { NavLink } from 'react-router-dom'
import { chainIdAtom, selectedRTokenAtom } from 'state/atoms'
import { borderRadius } from 'theme'
import { Box, Text } from 'theme-ui'
import { ROUTES } from 'utils/constants'
import TokenToggle from './TokenToggle'

const HeaderMenu = () => {
  const chainId = useAtomValue(chainIdAtom)
  const selectedRToken = useAtomValue(selectedRTokenAtom)
  const menuItems = useMemo(
    () => [
      { label: t`Compare`, icon: <BasketCubeIcon />, to: ROUTES.HOME },
      {
        label: t`Portfolio`,
        icon: (
          <Text
            variant="strong"
            sx={{
              fontSize: 4,
              lineHeight: '10px',
              position: 'relative',
              top: '5px',
            }}
          >
            *
          </Text>
        ),
        to: ROUTES.PORTFOLIO,
      },
      {
        label: t`Earn`,
        icon: <Text variant="strong">$</Text>,
        to: ROUTES.EARN,
      },
      { label: t`Bridge`, icon: <BridgeNavIcon />, to: ROUTES.BRIDGE },
    ],
    []
  )

  return (
    <Box
      variant="layout.verticalAlign"
      p={1}
      sx={{
        border: '1px solid',
        borderColor: 'darkBorder',
        fontSize: 1,
        borderRadius: borderRadius.boxes,
      }}
    >
      {menuItems.map((menuItem, index) => (
        <NavLink
          key={menuItem.to}
          to={`${menuItem.to}?chainId=${chainId}`}
          style={({ isActive }) => ({
            textDecoration: 'none',
            color: 'inherit',
            backgroundColor: isActive ? 'background' : 'transparent',
            borderRadius: borderRadius.boxes,
          })}
        >
          <Box variant="layout.verticalAlign" p={2} ml={index ? 2 : 0}>
            {menuItem.icon} <Text ml="2">{menuItem.label}</Text>
          </Box>
        </NavLink>
      ))}
      <Box
        ml="2"
        p={2}
        sx={{
          backgroundColor: !!selectedRToken ? 'background' : 'transparent',
          borderRadius: borderRadius.boxes,
        }}
      >
        <TokenToggle />
      </Box>
    </Box>
  )
}

export default HeaderMenu
