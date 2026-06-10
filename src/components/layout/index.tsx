import { ReactNode, Suspense, lazy } from 'react'
import Header from './header'

// Route-aware AI assistant — replaces the floating Feedback button app-wide.
// Lazy so visitors who never open it don't pay for the chat bundle.
const DtfChat = lazy(() => import('@/components/dtf-chat'))

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
    <Suspense fallback={null}>
      <DtfChat />
    </Suspense>
  </div>
)
export default Layout
