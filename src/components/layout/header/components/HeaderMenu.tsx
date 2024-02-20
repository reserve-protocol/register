import { t } from '@lingui/macro'
import BasketCubeIcon from 'components/icons/BasketCubeIcon'
import BridgeNavIcon from 'components/icons/BridgeNavIcon'
import EarnNavIcon from 'components/icons/EarnNavIcon'
import WalletOutlineIcon from 'components/icons/WalletOutlineIcon'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { NavLink } from 'react-router-dom'
import { selectedRTokenAtom } from 'state/atoms'
import { borderRadius } from 'theme'
import { Box, Text } from 'theme-ui'
import { ROUTES } from 'utils/constants'
import TokenToggle from './TokenToggle'

const TokenSelector = () => {
  const selectedRToken = useAtomValue(selectedRTokenAtom)

  return (
    <Box
      ml={1}
      sx={{
        backgroundColor: !!selectedRToken ? 'backgroundNested' : 'transparent',
        // borderColor: !!selectedRToken ? 'primary' : 'transparent',
        borderRadius: borderRadius.inner,
        ':hover': {
          backgroundColor: !!selectedRToken ? 'background' : 'backgroundNested',
        },
      }}
    >
      <TokenToggle />
    </Box>
  )
}

const HeaderMenu = () => {
  const menuItems = useMemo(
    () => [
      {
        label: t`Compare`,
        icon: <BasketCubeIcon fontSize={16} />,
        to: ROUTES.HOME,
      },
      {
        label: t`Portfolio`,
        icon: <WalletOutlineIcon fontSize={16} />,
        to: ROUTES.PORTFOLIO,
      },
      {
        label: t`Earn`,
        icon: <EarnNavIcon fontSize={16} />,
        to: ROUTES.EARN,
      },
      { label: t`Bridge`, icon: <BridgeNavIcon />, to: ROUTES.BRIDGE },
    ],
    []
  )

  return (
    <Box
      variant="layout.verticalAlign"
      p={'2px'}
      sx={{
        backgroundColor: 'inputBackground',
        fontSize: 1,
        borderRadius: borderRadius.inputs,
      }}
    >
      {menuItems.map((menuItem, index) => (
        <NavLink
          key={menuItem.to}
          to={`${menuItem.to}`}
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          {({ isActive }: { isActive: boolean }) => (
            <Box
              variant="layout.verticalAlign"
              sx={{
                backgroundColor: isActive ? 'backgroundNested' : 'transparent',
                // border: '1px solid',
                color: isActive ? 'text' : 'secondaryText',
                // borderColor: isActive ? 'primary' : 'transparent',
                borderRadius: borderRadius.inner,
                justifyContent: 'center',
                fontWeight: 500,
                boxShadow: isActive
                  ? '0px 0px 5px 2px rgba(0, 0, 0, 0.05)'
                  : 'none',
                width: [40, 'auto'],
                ':hover': {
                  backgroundColor: 'backgroundNested',
                },
              }}
              px={2}
              py={1}
              ml={index ? 1 : 0}
            >
              {menuItem.icon}
              <Text ml="1" sx={{ display: ['none', 'none', 'none', 'block'] }}>
                {menuItem.label}
              </Text>
            </Box>
          )}
        </NavLink>
      ))}
      <TokenSelector />
    </Box>
  )
}

export default HeaderMenu
