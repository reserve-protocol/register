import { Flex, Box, Text } from 'theme-ui'
import LanguageSelector from 'components/language-selector'
import RTokenSelector from 'components/rtoken-selector'
import Account from '../../account'
import TransactionCenter from 'components/transactions/table/manager/TransactionCenter'

/**
 * Application header
 */
const AppHeader = () => (
  <Flex
    py={2}
    px={4}
    sx={{
      alignItems: 'center',
      borderBottom: '1px solid #E8E8E8',
    }}
  >
    <RTokenSelector />
    <Box mx="auto" />
    <Account />
    <Box ml={4} sx={{ alignItems: 'center', display: 'flex' }}>
      <LanguageSelector />
    </Box>
    <TransactionCenter />
  </Flex>
)

export default AppHeader
