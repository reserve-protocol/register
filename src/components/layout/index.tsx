import { ReactNode } from 'react'
import { Box } from 'theme-ui'
import Header from './header'

/**
 * Application Layout
 *
 * @param children - required
 * @returns {JSX.Element}
 */
const Layout = ({ children }: { children: ReactNode }) => (
  <Box
    sx={{ height: '100%', paddingTop: '72px', overflow: 'auto' }}
    id="app-container"
  >
    {children}
    <Header />
  </Box>
)
export default Layout
