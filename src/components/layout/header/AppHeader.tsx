import { Flex, Box } from 'theme-ui'
import LanguageSelector from 'components/language-selector'
import RTokenSelector from 'components/rtoken-selector'
import Account from '../../account'

/**
 * Application header
 */
const AppHeader = () => (
  <Flex
    py={4}
    px={4}
    sx={{
      alignItems: 'center',
    }}
  >
    <RTokenSelector />
    <Box mx="auto" />
    <Account />
    <Box ml={4} mr={2} sx={{ alignItems: 'center', display: 'flex' }}>
      <LanguageSelector />
    </Box>
  </Flex>
)

export default AppHeader
