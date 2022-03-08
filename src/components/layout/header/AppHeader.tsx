import { Flex, Box } from '@theme-ui/components'
import LanguageSelector from 'components/language-selector'
import RTokenSelector from 'components/rtoken-selector'
import Account from '../../account'

/**
 * Application header
 */
const AppHeader = () => (
  <Flex
    py={4}
    pb={3}
    pt={3}
    px={4}
    sx={{
      alignItems: 'center',
    }}
  >
    <Box mx="auto" />
    <RTokenSelector />
    <Box mr={4} />
    <Account />
    <Box ml={4} mr={2} sx={{ alignItems: 'center', display: 'flex' }}>
      <LanguageSelector />
    </Box>
  </Flex>
)

export default AppHeader
