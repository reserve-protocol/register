import { Flex, Box } from 'theme-ui'
import LanguageSelector from 'components/language-selector'

import Account from '../../account'

const Header = () => (
  <Flex
    py={2}
    px={3}
    sx={{
      height: 60,
      alignItems: 'center',
    }}
  >
    <Box mx="auto" />
    <Account />
    <Box ml={4} mr={2} sx={{ alignItems: 'center', display: 'flex' }}>
      <LanguageSelector />
    </Box>
  </Flex>
)

export default Header
