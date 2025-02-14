import { ReactNode } from 'react'
import Header from './header'

/**
 * Application Layout
 *
 * @param children - required
 * @returns {JSX.Element}
 */
const Layout = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-col h-full overflow-hidden relative">
    <Header />
    <div id="app-container" className="overflow-auto  flex-grow">
      {children}
    </div>
  </div>
)
export default Layout
