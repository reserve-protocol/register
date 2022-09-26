import { ReactNode, Suspense } from 'react'
import { Box, Flex } from 'theme-ui'
import Header from './header'
import MobileNav from './MobileNav'
import Sidebar from './sidebar'

/**
 * Application Layout
 *
 * @param children - required
 * @returns {JSX.Element}
 */
const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <Flex
      sx={{
        flexWrap: 'wrap',
        height: '100%',
        maxWidth: '108em',
        margin: 'auto',
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
        <Suspense>
          <Box sx={{ overflow: 'auto', flexGrow: 99999, position: 'relative' }}>
            {children}
          </Box>
        </Suspense>
        <MobileNav />
      </Flex>
    </Flex>
  )
}
export default Layout
