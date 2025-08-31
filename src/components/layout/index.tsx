import { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import Header from './header'

/**
 * Application Layout
 *
 * @param children - required
 * @returns {JSX.Element}
 */
const Layout = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation()
  const isHome = pathname === '/home'
  
  return (
    <div className="flex flex-col h-full overflow-hidden relative">
      {!isHome && <Header />}
      <div id="app-container" className="overflow-auto flex-grow">
        {children}
      </div>
    </div>
  )
}
export default Layout
