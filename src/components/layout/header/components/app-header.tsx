import CommandMenu from '@/components/command-menu'
import DarkModeToggle from '@/components/dark-mode-toggle'
import { ContactBellButton } from '@/components/layout/contact-modal'
import { cn } from '@/lib/utils'
import Account from 'components/account'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import AppNavigation from './app-navigation'
import HeaderActionsMenu from './header-actions-menu'
import { type HeaderControlSurface } from './header-control-button'
import LanguageSelector from './language-selector'
import MobileNavigationDrawer from './mobile-navigation-drawer'
import Reserve from '@/components/icons/Reserve'
import { Link } from 'react-router-dom'

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

const useLocationParams = () => {
  const { pathname } = useLocation()
  const scrolled = useAppContainerScrolled()

  const isHome = pathname === '/'
  const isIndexDtfOverview =
    pathname.includes('/index-dtf/') && pathname.endsWith('/overview')
  const shouldHaveBorder =
    pathname.includes('earn') ||
    ((!pathname.includes('index-dtf') || pathname.includes('deploy')) &&
      !pathname.includes('bridge'))
  const mobileHeaderSurface: HeaderControlSurface =
    isIndexDtfOverview && !scrolled ? 'transparent-header' : 'default'

  return {
    isHome,
    isIndexDtfOverview,
    shouldHaveBorder,
    mobileHeaderSurface,
    scrolled,
  }
}

const Brand = () => {
  return (
    <Link
      to="/"
      className="relative z-[50] -ml-0.5 mr-2 cursor-pointer text-primary sm:mr-4 md:-mt-1 lg:ml-0"
    >
      <div className="hidden md:hidden lg:flex items-center cursor-pointer dark:text-foreground">
        <Reserve className="h-[22px] w-auto" />
      </div>
      <div className="flex h-9 items-center justify-center dark:text-foreground lg:hidden">
        <Reserve className="h-5 w-auto" />
      </div>
    </Link>
  )
}

/**
 * Application header
 */
const AppHeader = () => {
  const {
    isHome,
    isIndexDtfOverview,
    shouldHaveBorder,
    mobileHeaderSurface,
    scrolled,
  } = useLocationParams()

  return (
    <div
      className={cn(
        'w-full flex-shrink-0',
        shouldHaveBorder && !isHome && 'border-b'
      )}
    >
      <div
        className={cn(
          'container flex items-center h-[56px] md:h-[72px] pl-5 pr-2 sm:px-4 lg:px-6 md:bg-transparent',
          isIndexDtfOverview && !scrolled ? 'bg-transparent' : 'bg-card'
        )}
      >
        <Brand />
        <AppNavigation />
        <div className="ml-auto flex items-center gap-1 sm:gap-2 min-[850px]:ml-0">
          <div className="hidden min-[850px]:block">
            <ContactBellButton />
          </div>
          <div className="hidden xl:flex items-center gap-2">
            <CommandMenu />
            <DarkModeToggle />
            <LanguageSelector />
          </div>
          <HeaderActionsMenu surface={mobileHeaderSurface} />
          <Account mobileSurface={mobileHeaderSurface} />
          <MobileNavigationDrawer surface={mobileHeaderSurface} />
        </div>
      </div>
    </div>
  )
}

export default AppHeader
