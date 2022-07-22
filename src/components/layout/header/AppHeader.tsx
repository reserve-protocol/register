import styled from '@emotion/styled'
import { Trans } from '@lingui/macro'
import Account from 'components/account'
import LanguageSelector from 'components/language-selector'
import RTokenSelector from 'components/rtoken-selector'
import { useAtomValue } from 'jotai/utils'
import { useLocation } from 'react-router-dom'
import { selectedRTokenAtom } from 'state/atoms'
import { Box, Divider, Flex, Text } from 'theme-ui'
import { isContentOnlyView } from 'utils/constants'
import Brand from '../Brand'

const Separator = styled(Divider)`
  border: none;
  border-right: 1px solid var(--theme-ui-colors-border);
  height: 100%;
`

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
      {isDeployer ||
        (!selectedToken && (
          <Flex mr={[2, 2, 4]} px={[2, 4]} sx={{ alignItems: 'center' }}>
            <Brand />
            {isDeployer && (
              <Text ml={3} sx={{ fontSize: 3 }} variant="subtitle">
                <Trans>RToken Deployer</Trans>
              </Text>
            )}
          </Flex>
        ))}
      {!isDeployer && <RTokenSelector />}
      <Separator ml="auto" mr={2} />
      <Box ml={3} sx={{ alignItems: 'center', display: 'flex' }}>
        <LanguageSelector />
      </Box>
      <Separator mr={2} />
      <Account />
    </Container>
  )
}

export default AppHeader
