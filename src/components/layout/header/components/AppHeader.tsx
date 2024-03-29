import Account from 'components/account'
import ThemeColorMode from 'components/dark-mode-toggle/ThemeColorMode'
import { useAtomValue } from 'jotai'
import { selectedRTokenAtom } from 'state/atoms'
import { Box, Flex } from 'theme-ui'
import Brand from './Brand'
import CoinbaseSubscribe from './CoinbaseSubscribe'
import HeaderMenu from './HeaderMenu'
import RegisterHelp from './RegisterHelp'

/**
 * Application header
 */
const AppHeader = () => {
  const isRTokenSelected = !!useAtomValue(selectedRTokenAtom)

  return (
    <Box
      sx={{
        width: '100%',
        ...(isRTokenSelected
          ? {
              borderBottom: '1px solid',
              borderColor: 'border',
            }
          : {}),
      }}
    >
      <Flex
        px={[2, 5]}
        variant="layout.wrapper"
        sx={{
          alignItems: 'center',
          height: ['52px', '72px'],
          justifyContent: ['left', 'center'],
          position: 'relative',
        }}
      >
        <Box
          variant="layout.verticalAlign"
          sx={{ position: 'absolute', left: ['8px', '24px'] }}
        >
          <Brand mr={[2, 4]} />
          <ThemeColorMode
            sx={{
              display: ['none', 'flex'],
            }}
          />
        </Box>
        <HeaderMenu />
        <Box
          variant="layout.verticalAlign"
          sx={{ position: 'absolute', right: ['8px', '24px'] }}
        >
          <RegisterHelp />
          <CoinbaseSubscribe
            mr="2"
            sx={{ display: ['none', 'none', 'block'] }}
          />
          <Account />
        </Box>
      </Flex>
    </Box>
  )
}
export default AppHeader
