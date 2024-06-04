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
      ml="4px"
      sx={{
        backgroundColor: !!selectedRToken ? 'backgroundNested' : 'transparent',
        boxShadow: !!selectedRToken
          ? '0px 0px 5px 2px rgba(0, 0, 0, 0.05)'
          : 'none',
        // borderColor: !!selectedRToken ? 'primary' : 'transparent',
        borderRadius: borderRadius.inner,
        ':hover': {
          backgroundColor: !!selectedRToken
            ? 'backgroundNested'
            : 'inputBorder',
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
        label: t`Browse RTokens`,
        icon: <BasketCubeIcon fontSize={16} />,
        to: ROUTES.COMPARE,
      },
      {
        label: t`Earn`,
        icon: <EarnNavIcon fontSize={16} />,
        to: ROUTES.EARN,
      },
      {
        label: t`Portfolio`,
        icon: <WalletOutlineIcon fontSize={16} />,
        to: ROUTES.PORTFOLIO,
      },
      { label: t`Bridge`, icon: <BridgeNavIcon />, to: ROUTES.BRIDGE },
    ],
    []
  )

  return (
    <Box
      variant="layout.verticalAlign"
      p="4px"
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
                color: isActive ? 'text' : 'secondaryText',
                borderRadius: borderRadius.inner,
                justifyContent: 'center',
                fontWeight: 500,
                boxShadow: isActive
                  ? '0px 0px 5px 2px rgba(0, 0, 0, 0.05)'
                  : 'none',
                width: [32, 'auto'],
                ':hover': {
                  backgroundColor: isActive
                    ? 'backgroundNested'
                    : 'inputBorder',
                },
              }}
              px={[1, 2]}
              py={1}
              ml={index ? [1, 1, 1, '4px'] : 0}
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
