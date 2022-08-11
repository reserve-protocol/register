import styled from '@emotion/styled'
import { Trans } from '@lingui/macro'
import Account from 'components/account'
import ThemeColorMode from 'components/dark-mode-toggle/ThemeColorMode'
import LanguageSelector from 'components/language-selector'
import RTokenSelector from 'components/rtoken-selector'
import { useAtomValue } from 'jotai/utils'
import { HelpCircle } from 'react-feather'
import { useLocation } from 'react-router-dom'
import { selectedRTokenAtom } from 'state/atoms'
import { Box, Divider, Flex, Text } from 'theme-ui'
import { isContentOnlyView } from 'utils/constants'
import Brand from '../Brand'

const Container = styled(Flex)`
  align-items: center;
  flex-shrink: 0;
  position: relative;
  border-bottom: 1px solid var(--theme-ui-colors-border);
  height: 3.5em;
`

/**
 * Application header      {pathname !== '/deploy' && <Sidebar />}
 */
const AppHeader = () => {
  const { pathname } = useLocation()
  const selectedToken = useAtomValue(selectedRTokenAtom)
  const isDeployer = isContentOnlyView(pathname)

  return (
    <Container px={[3, 4]}>
      {(isDeployer || !selectedToken) && (
        <Flex mr={[2, 2, 4]} px={[2, 4]} sx={{ alignItems: 'center' }}>
          <Brand />
          {isDeployer && (
            <Text ml={3} sx={{ fontSize: 3 }} variant="subtitle">
              <Trans>RToken Deployer</Trans>
            </Text>
          )}
        </Flex>
      )}
      {!isDeployer && <RTokenSelector />}
      <Box mx="auto" />
      <HelpCircle size={20} />
      <ThemeColorMode ml={4} mt={1} />
      <Box ml={4} sx={{ alignItems: 'center', display: 'flex' }}>
        <LanguageSelector />
      </Box>
      <Account />
    </Container>
  )
}

export default AppHeader
