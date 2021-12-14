import { ReactNode } from 'react'
import { Box, Flex } from '@theme-ui/components'
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
      overflow: 'hidden',
    }}
  >
    <Sidebar />
    <Box
      sx={{
        flexGrow: 99999,
        flexBasis: 0,
        minWidth: 768,
        overflow: 'hidden',
      }}
    >
      <Header />
      {children}
    </Box>
  </Flex>
)

export default Layout
