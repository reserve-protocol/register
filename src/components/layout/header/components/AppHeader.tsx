import { Trans } from '@lingui/macro'
import Account from 'components/account'
import ChainSelector from 'components/chain-selector/ChainSelector'
import ThemeColorMode from 'components/dark-mode-toggle/ThemeColorMode'
import { useLocation } from 'react-router-dom'
import { Box, Flex, Text } from 'theme-ui'
import { ROUTES } from 'utils/constants'
import Brand from './Brand'
import HeaderMenu from './HeaderMenu'
import RegisterHelp from './RegisterHelp'
import { useAtomValue } from 'jotai'
import { selectedRTokenAtom } from 'state/atoms'
import VerticalDivider from 'views/home/components/VerticalDivider'

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

  if (pathname.indexOf(ROUTES.BRIDGE) !== -1) {
    return 'contentBackground'
  }

  return 'background'
}

/**
 * Application header
 */
const AppHeader = () => {
  const isRTokenSelected = !!useAtomValue(selectedRTokenAtom)

  return (
    <Box
      sx={{
        width: '100%',
        ...(isRTokenSelected
          ? {
              borderBottom: '1px solid',
              borderColor: 'border',
            }
          : {}),
      }}
    >
      <Flex
        px={[2, 5]}
        variant="layout.wrapper"
        sx={{
          alignItems: 'center',
          height: '72px',
          justifyContent: ['left', 'center'],
          position: 'relative',
        }}
      >
        <Box
          variant="layout.verticalAlign"
          sx={{ position: 'absolute', left: 20 }}
        >
          <Brand mr={[2, 4]} />
          <VerticalDivider sx={{ display: ['none', 'block'] }} />
          <ThemeColorMode
            ml="4"
            sx={{
              display: ['none', 'flex'],
            }}
          />
        </Box>

        {/* 
        <Box mr="auto" variant="layout.verticalAlign">
          <Brand mr={[2, 4]} />
          <HeaderAction />
        </Box> */}
        <HeaderMenu />
        <Box
          variant="layout.verticalAlign"
          sx={{ position: 'absolute', right: 20 }}
        >
          <RegisterHelp />
          {/* <Box ml={4} sx={{ alignItems: 'center', display: 'flex' }}>
            <LanguageSelector />
          </Box> */}
          <VerticalDivider sx={{ display: ['none', 'block'] }} mx="4" />
          <Account />
        </Box>
      </Flex>
    </Box>
  )
}
export default AppHeader
