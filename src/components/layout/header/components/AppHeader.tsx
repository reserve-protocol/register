import Account from 'components/account'
import ThemeColorMode from 'components/dark-mode-toggle/ThemeColorMode'
import { Box, Flex } from 'theme-ui'
import Brand from './Brand'
import CoinbaseSubscribe from './CoinbaseSubscribe'
import HeaderMenu from './HeaderMenu'
import RegisterHelp from './RegisterHelp'
import Blog from './Blog'

// px={[2, 5]}
// variant="layout.wrapper"
// sx={{
//   alignItems: 'center',
//   height: ['52px', '72px'],
//   justifyContent: ['left', 'center'],
//   position: 'relative',
// }}
/**
 * Application header
 */
const AppHeader = () => {
  return (
    <div className="w-full border-b">
      <div className="container flex items-center h-[52px] md:h-[72px] justify-center relative">
        <Box
          variant="layout.verticalAlign"
          sx={{ position: ['relative', 'absolute'], left: ['8px', '24px'] }}
        >
          <Brand mr={4} />
          <Blog />
        </Box>
        <HeaderMenu />
        <Box
          variant="layout.verticalAlign"
          sx={{ position: 'absolute', right: ['8px', '24px'] }}
        >
          <ThemeColorMode
            sx={{
              display: ['none', 'flex'],
              px: 2,
              mr: 1,
              py: '3px',
              maxWidth: '32px',
              borderRadius: '6px',
              cursor: 'pointer',
              ':hover': {
                backgroundColor: 'secondaryBackground',
              },
            }}
          />
          <RegisterHelp />
          <CoinbaseSubscribe
            mr="2"
            sx={{ display: ['none', 'none', 'block'] }}
          />
          <Account />
        </Box>
      </div>
    </div>
  )
}
export default AppHeader
