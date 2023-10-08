import styled from '@emotion/styled'
import { Trans } from '@lingui/macro'
import Account from 'components/account'
import ChainSelector from 'components/chain-selector/ChainSelector'
import ThemeColorMode from 'components/dark-mode-toggle/ThemeColorMode'
import BridgeIcon from 'components/icons/BridgeIcon'
import ExternalArrowIcon from 'components/icons/ExternalArrowIcon'
import { useLocation } from 'react-router-dom'
import { Box, Flex, Text } from 'theme-ui'
import { ROUTES } from 'utils/constants'
import Brand from './Brand'
import TokenToggle from './TokenToggle'

const Container = styled(Flex)`
  align-items: center;
  flex-shrink: 0;
  position: fixed;
  top: 0;
  width: 100%;
  max-width: 95em;
  height: 72px;
`

const Divider = () => (
  <Box
    mx={4}
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

  if (pathname.indexOf(ROUTES.BRIDGE) !== -1) {
    return (
      <Box variant="layout.verticalAlign">
        <BridgeIcon />
        <Text ml={3} sx={{ fontSize: 2 }} variant="subtitle">
          <Trans>L2 Bridge</Trans>
        </Text>
      </Box>
    )
  }

  return <TokenToggle />
}

/**
 * Application header
 */
const AppHeader = () => (
  <Container
    px={[3, 5]}
    sx={{
      borderBottom: '1px solid',
      borderColor: 'border',
      backgroundColor: 'background',
    }}
  >
    <Box mr="auto" variant="layout.verticalAlign">
      <Brand />
      <Divider />
      <HeaderAction />
    </Box>
    <Box
      variant="layout.verticalAlign"
      sx={{
        display: ['none', 'flex'],
        cursor: 'pointer',
      }}
      onClick={() => window.open('https://reserve.org/protocol/', '_blank')}
    >
      <Text mr={1}>Docs</Text>
      <Box mt={2}>
        <ExternalArrowIcon />
      </Box>
    </Box>
    <Divider />
    <ThemeColorMode pt={1} mr={[3, 0]} />
    {/* <Box ml={4} sx={{ alignItems: 'center', display: 'flex' }}>
        <LanguageSelector />
      </Box> */}
    <Divider />
    <ChainSelector mr={3} />
    <Account />
  </Container>
)

export default AppHeader
