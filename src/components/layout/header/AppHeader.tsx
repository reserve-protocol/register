import { Flex, Box, Text, Divider } from 'theme-ui'
import LanguageSelector from 'components/language-selector'
import RTokenSelector from 'components/rtoken-selector'
import Account from '../../account'
import TransactionCenter from 'components/transactions/table/manager/TransactionCenter'
import styled from '@emotion/styled'

const Separator = styled(Divider)`
  border: none;
  border-right: 1px solid var(--theme-ui-colors-border);
  height: 100%;
`

const Container = styled(Flex)`
  align-items: center;
  position: relative;
  border-bottom: 1px solid var(--theme-ui-colors-border);
  height: 3.5em;
`

/**
 * Application header
 */
const AppHeader = () => (
  <Container px={4}>
    <RTokenSelector />
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

export default AppHeader
