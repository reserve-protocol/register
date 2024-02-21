import { ReactNode } from 'react'
import { Box, Flex } from 'theme-ui'
import Header from './header'

/**
 * Application Layout
 *
 * @param children - required
 * @returns {JSX.Element}
 */
const Layout = ({ children }: { children: ReactNode }) => (
  <Flex
    sx={{
      flexDirection: 'column',
      height: '100%',
      position: 'relative',
    }}
  >
    <Header />
    <Box
      id="app-container"
      sx={{
        overflow: 'auto',
        // background: 'background',
        flexGrow: 1,
      }}
    >
      {children}
    </Box>
  </Flex>
)
export default Layout
