import { ReactNode } from 'react'
import { Box, Flex } from 'theme-ui'
import Header from './header'
import Sidebar from './sidebar'

// TODO: Mobile layout
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
      height: '100%',
    }}
  >
    <Sidebar />
    <Flex
      sx={{
        flexGrow: 99999,
        flexBasis: 0,
        height: '100vh',
        overflow: 'hidden',
        position: 'relative',
        flexDirection: 'column',
      }}
    >
      <Header />
      <Box sx={{ overflow: 'auto', flexGrow: 99999 }}>{children}</Box>
    </Flex>
  </Flex>
)

export default Layout
