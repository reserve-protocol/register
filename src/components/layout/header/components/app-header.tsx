import CommandMenu from '@/components/command-menu'
import DarkModeToggle from '@/components/dark-mode-toggle'
import { ContactBellButton } from '@/components/layout/contact-modal'
import { cn } from '@/lib/utils'
import Account from 'components/account'
import { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import AppNavigation from './app-navigation'
import Brand from './Brand'
import HeaderActionsMenu from './header-actions-menu'
import LanguageSelector from './language-selector'

const Container = ({ children }: { children: ReactNode }) => {
  // Check if the route is a "index-dtf" route
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  const border =
    pathname.includes('earn') ||
    ((!pathname.includes('index-dtf') || pathname.includes('deploy')) &&
      !pathname.includes('bridge'))

  return (
    <div
      className={cn(
        'w-full flex-shrink-0',
        border && (isHome ? 'lg:border-b' : 'border-b')
      )}
    >
      {children}
    </div>
  )
}

/**
 * Application header
 */
const AppHeader = () => (
  <Container>
    <div className="container flex items-center h-[56px] md:h-[72px] px-4 sm:px-6">
      <Brand className="text-primary mr-2 sm:mr-4 cursor-pointer md:-mt-1" />
      <AppNavigation />
      <div className="flex items-center gap-1 sm:gap-2">
        <ContactBellButton />
        {/* CommandMenu stays mounted below xl for the ⌘K dialog, only its button is hidden */}
        <div className="hidden xl:flex items-center gap-2">
          <CommandMenu />
          <DarkModeToggle />
          <LanguageSelector />
        </div>
        <HeaderActionsMenu />
        <Account />
      </div>
    </div>
  </Container>
)

export default AppHeader
