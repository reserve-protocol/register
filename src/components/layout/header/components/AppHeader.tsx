import { Trans } from '@lingui/macro'
import Account from 'components/account'
import ChainSelector from 'components/chain-selector/ChainSelector'
import ThemeColorMode from 'components/dark-mode-toggle/ThemeColorMode'
import { useLocation } from 'react-router-dom'
import { Box, Flex, Text } from 'theme-ui'
import { ROUTES } from 'utils/constants'
import Brand from './Brand'
import HeaderMenu from './HeaderMenu'
import { HelpCircle } from 'react-feather'
import AsteriskIcon from 'components/icons/AsteriskIcon'
import Button from 'components/button'
import RegisterHelp from './HelpPopup'

const Divider = () => (
  <Box
    mx={3}
    sx={{
      backgroundColor: 'inputBorder',
      width: '1px',
      height: '16px',
      display: ['none', 'block'],
    }}
  />
)

const HeaderAction = () => {
  const { pathname } = useLocation()

  if (pathname.indexOf(ROUTES.DEPLOY) !== -1) {
    return (
      <Text sx={{ fontSize: 2 }} variant="subtitle">
        <Trans>RToken Deployer</Trans>
      </Text>
    )
  }

  return <HeaderMenu />
}

// TODO: Currently only for bridging, but expected for other views
const useHeaderColor = () => {
  const { pathname } = useLocation()

  if (pathname.indexOf(ROUTES.BRIDGE) !== -1 || pathname === '/') {
    return 'contentBackground'
  }

  return 'background'
}

/**
 * Application header
 */
const AppHeader = () => {
  const backgroundColor = useHeaderColor()

  return (
    <Box
      sx={{
        borderBottom: '1px solid',
        borderColor: 'border',
        position: 'fixed',
        top: 0,
        backgroundColor,
        width: '100%',
      }}
    >
      <Flex
        px={[3, 5]}
        variant="layout.wrapper"
        sx={{ alignItems: 'center', height: '72px' }}
      >
        <Box mr="auto" variant="layout.verticalAlign">
          <Brand mr={[2, 4]} />
          <HeaderAction />
        </Box>
        <RegisterHelp />
        <Divider />
        <ThemeColorMode
          sx={{
            display: ['none', 'flex'],
          }}
        />
        {/* <Box ml={4} sx={{ alignItems: 'center', display: 'flex' }}>
            <LanguageSelector />
          </Box> */}
        <Divider />
        <Box sx={{ display: ['none', 'block'] }}>
          <ChainSelector />
        </Box>
        <Divider />
        <Account />
      </Flex>
    </Box>
  )
}
export default AppHeader
