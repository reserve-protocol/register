import { Flex, Box, Text, Divider } from 'theme-ui'
import LanguageSelector from 'components/language-selector'
import RTokenSelector from 'components/rtoken-selector'
import Account from '../../account'
import TransactionCenter from 'components/transactions/table/manager/TransactionCenter'
import styled from '@emotion/styled'
import { Link, useLocation } from 'react-router-dom'
import { ROUTES } from 'utils/constants'
import Logo from 'components/icons/Logo'
import { useNavigate } from 'react-router-dom'
import { Trans } from '@lingui/macro'

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

  return (
    <Container px={4}>
      {pathname === ROUTES.DEPLOY ? (
        <Logo
          style={{ cursor: 'pointer', marginLeft: 16 }}
          onClick={() => navigate('/')}
        />
      ) : (
        <RTokenSelector />
      )}
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
