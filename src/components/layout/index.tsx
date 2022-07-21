import { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { Box, Flex } from 'theme-ui'
import { isContentOnlyView } from 'utils/constants'
import Header from './header'
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
        <Box sx={{ overflow: 'auto', flexGrow: 99999, position: 'relative' }}>
          {children}
        </Box>
      </Flex>
    </Flex>
  )
}
export default Layout
