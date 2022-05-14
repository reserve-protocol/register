import { ReactNode } from 'react'
import { Box, Flex } from 'theme-ui'
import Header from './header'
import Sidebar from './sidebar'

/**
 * Application Layout
 *
 * @param children - required
 * @returns {JSX.Element}
 */
const Layout = ({ children }: { children: ReactNode }) => (
  <Flex
    sx={{
      flexWrap: 'wrap',
      height: '100vh',

    }}
  >
    <Sidebar />
    <Box
      sx={{
        flexGrow: 99999,
        flexBasis: 0,
        minWidth: 768,
        height: '100%',
        overflow: 'auto',
      }}
    >
      <Header />
      {children}
    </Box>
  </Flex>
)

export default Layout
