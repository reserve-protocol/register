import CommandMenu from '@/components/command-menu'
import DarkModeToggle from '@/components/dark-mode-toggle'
import { ContactBellButton } from '@/components/layout/contact-modal'
import { cn } from '@/lib/utils'
import Account from 'components/account'
import { ReactNode, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import AppNavigation from './app-navigation'
import Brand from './Brand'
import HeaderActionsMenu from './header-actions-menu'
import LanguageSelector from './language-selector'
import MobileNavigationDrawer from './mobile-navigation-drawer'

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
      className={cn('w-full flex-shrink-0', border && !isHome && 'border-b')}
    >
      {children}
    </div>
  )
}

const useAppContainerScrolled = () => {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const scroller = document.getElementById('app-container')
    if (!scroller) return

    const update = () => setScrolled(scroller.scrollTop > 0)
    update()
    scroller.addEventListener('scroll', update, { passive: true })

    return () => scroller.removeEventListener('scroll', update)
  }, [])

  return scrolled
}

/**
 * Application header
 */
const AppHeader = () => {
  const { pathname } = useLocation()
  const isIndexDtfOverview =
    pathname.includes('/index-dtf/') && pathname.endsWith('/overview')
  const scrolled = useAppContainerScrolled()
  const mobileOverviewButtonClassName = isIndexDtfOverview
    ? cn(scrolled ? 'border-border' : 'border-card', 'dark:border-border')
    : undefined

  return (
    <Container>
      <div
        className={cn(
          'container flex items-center h-[56px] md:h-[72px] pl-5 pr-2 sm:px-4 lg:px-6 md:bg-transparent',
          isIndexDtfOverview && !scrolled ? 'bg-transparent' : 'bg-card'
        )}
      >
        <Brand className="relative z-[60] -ml-0.5 mr-2 cursor-pointer text-primary sm:mr-4 md:-mt-1 lg:ml-0" />
        <AppNavigation />
        <div className="ml-auto flex items-center gap-1 sm:gap-2 min-[850px]:ml-0">
          <div className="hidden min-[850px]:block">
            <ContactBellButton />
          </div>
          {/* CommandMenu stays mounted below xl for the ⌘K dialog, only its button is hidden */}
          <div className="hidden xl:flex items-center gap-2">
            <CommandMenu />
            <DarkModeToggle />
            <LanguageSelector />
          </div>
          <HeaderActionsMenu triggerClassName={mobileOverviewButtonClassName} />
          <Account mobileAccountClassName={mobileOverviewButtonClassName} />
          <MobileNavigationDrawer
            triggerClassName={mobileOverviewButtonClassName}
          />
        </div>
      </div>
    </Container>
  )
}

export default AppHeader
