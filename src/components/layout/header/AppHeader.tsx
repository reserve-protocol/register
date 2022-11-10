import styled from '@emotion/styled'
import { Trans } from '@lingui/macro'
import Account from 'components/account'
import ThemeColorMode from 'components/dark-mode-toggle/ThemeColorMode'
import useIsDeployer from 'hooks/useIsDeployer'
import useIsSidebarVisible from 'hooks/useIsSidebarVisible'
import { HelpCircle } from 'react-feather'
import { Box, Flex, Text } from 'theme-ui'
import Brand from './Brand'
import TokenToggle from './TokenToggle'

const Container = styled(Flex)`
  align-items: center;
  flex-shrink: 0;
  position: relative;
  border-bottom: 1px solid var(--theme-ui-colors-darkBorder);
  height: 56px;
`

/**
 * Application header
 */
const AppHeader = () => {
  const isSidebarVisible = useIsSidebarVisible()
  const isDeployer = useIsDeployer()

  return (
    <Container px={[5, isSidebarVisible ? 5 : 7]}>
      <Box mr="auto" variant="layout.verticalAlign">
        <Brand mr={5} />
        {isDeployer && (
          <Text sx={{ fontSize: 3 }} variant="subtitle">
            <Trans>RToken Deployer</Trans>
          </Text>
        )}
        {!isDeployer && <TokenToggle />}
      </Box>
      <Box
        sx={{ display: ['none', 'block'], marginTop: '7px', cursor: 'pointer' }}
        variant="layout.verticalAlign"
        onClick={() => window.open('https://reserve.org/protocol/', '_blank')}
      >
        <HelpCircle size={20} />
      </Box>
      <ThemeColorMode ml={4} mr={3} mt={1} />
      {/* <Box ml={4} sx={{ alignItems: 'center', display: 'flex' }}>
        <LanguageSelector />
      </Box> */}
      <Account />
    </Container>
  )
}

export default AppHeader
