import styled from '@emotion/styled'
import { Trans } from '@lingui/macro'
import Logo from 'components/icons/Logo'
import LanguageSelector from 'components/language-selector'
import RTokenSelector from 'components/rtoken-selector'
import TransactionCenter from 'components/transactions/manager/TransactionCenter'
import { useAtomValue } from 'jotai/utils'
import { useLocation, useNavigate } from 'react-router-dom'
import { selectedRTokenAtom } from 'state/atoms'
import { Box, Divider, Flex, Text } from 'theme-ui'
import { isContentOnlyView } from 'utils/constants'
import Account from '../../account'

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
  const navigate = useNavigate()
  const selectedToken = useAtomValue(selectedRTokenAtom)
  const isDeployer = isContentOnlyView(pathname)

  return (
    <Container px={4}>
      {isDeployer ||
        (!selectedToken && (
          <Flex ml={4} mr={[0, 0, 4]} sx={{ alignItems: 'center' }}>
            <Logo
              style={{ cursor: 'pointer', color: 'boldText' }}
              onClick={() => navigate('/')}
            />
            {isDeployer && (
              <Text ml={3} sx={{ fontSize: 3 }} variant="subtitle">
                <Trans>RToken Deployer</Trans>
              </Text>
            )}
          </Flex>
        ))}
      {!isDeployer && <RTokenSelector />}
      <Box mx="auto" />
      <Separator mr={2} />
      <Account />
      <Separator mx={2} />
      <Box ml={3} sx={{ alignItems: 'center', display: 'flex' }}>
        <LanguageSelector />
      </Box>
      <Separator />
      <TransactionCenter />
    </Container>
  )
}

export default AppHeader
