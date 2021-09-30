import { useColorMode, Flex, Box, Text } from 'theme-ui'
import { useBlockNumber } from '@usedapp/core'
import LanguageSelector from 'components/language-selector'

import Account from '../../account'
import DarkModeToggle from '../../dark-mode-toggle'

const Header = () => {
  const latestBlock = useBlockNumber()
  const [colorMode, setColorMode] = useColorMode()

  return (
    <Flex
      py={2}
      px={3}
      sx={{
        height: 60,
        alignItems: 'center',
      }}
      color="white"
      bg="black"
      style={{ borderBottom: '1px solid #f5f5f5' }}
    >
      <div>
        Latest synced block: <b>&nbsp;{latestBlock ?? '-'}</b>
      </div>
      <Box mx="auto" />
      <Box mr={4} sx={{ alignItems: 'center', display: 'flex' }}>
        <LanguageSelector />
        <DarkModeToggle mode={colorMode} onToggle={setColorMode} />
      </Box>
      <Account />
    </Flex>
  )
}

export default Header
