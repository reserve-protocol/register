import { ReactNode, Suspense, lazy } from 'react'
import { useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
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
const Layout = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation()
  const isDesignSystem =
    pathname === '/internal/design-system' ||
    pathname.startsWith('/internal/design-system/')
  const isIndexDtfOverview =
    pathname.includes('/index-dtf/') && pathname.endsWith('/overview')

  return (
    <div
      className={cn(
        'flex flex-col h-full overflow-hidden relative',
        isIndexDtfOverview && 'bg-secondary sm:bg-transparent'
      )}
    >
      {!isDesignSystem && <Header />}
      <div id="app-container" className="overflow-auto  flex-grow">
        {children}
      </div>
      {!isDesignSystem && (
        <Suspense fallback={null}>
          <DtfChat />
        </Suspense>
      )}
    </div>
  )
}
export default Layout
