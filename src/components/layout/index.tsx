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
  <div className="flex flex-col h-full relative">
    <Header />
    <div id="app-container" className="overflow-auto flex-grow">
      {children}
    </div>
  </div>
)
export default Layout
