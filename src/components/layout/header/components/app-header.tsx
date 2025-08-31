import CommandMenu from '@/components/command-menu'
import ThemeColorMode from '@/components/dark-mode-toggle/ThemeColorMode'
import { cn } from '@/lib/utils'
import Account from 'components/account'
import { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import AppNavigation from './app-navigation'
import Brand from './Brand'

const Container = ({ children }: { children: ReactNode }) => {
  // Check if the route is a "index-dtf" route
  const { pathname } = useLocation()

  const isHome = pathname === '/home'
  const border = !pathname.includes('index-dtf') || pathname.includes('deploy')

  return (
    <div 
      className={cn(
        'w-full flex-shrink-0 relative z-10',
        border && !isHome && 'border-b',
        !isHome && 'bg-background'
      )}
      style={isHome ? { backgroundColor: 'transparent' } : undefined}
    >
      {children}
    </div>
  )
}

/**
 * Application header
 */
const AppHeader = () => {
  const { pathname } = useLocation()
  const isHome = pathname === '/home'
  
  return (
    <Container>
      <div 
        className={cn(
          "container flex items-center h-[56px] md:h-[72px] px-4 sm:px-6",
          isHome && "text-white"
        )}
        style={isHome ? { backgroundColor: 'transparent' } : undefined}
      >
        <Brand className={cn(
          "mr-2 sm:mr-4 cursor-pointer md:-mt-1",
          isHome ? "text-white" : "text-primary"
        )} />
        <AppNavigation />
        <CommandMenu />
        <div className="flex ml-1 items-center">
          <ThemeColorMode
            sx={{
              display: 'flex',
              px: 2,
              mr: [2, 3],
              py: '3px',
              maxWidth: '32px',
              borderRadius: '6px',
              ml: 'auto',
              cursor: 'pointer',
              ':hover': {
                backgroundColor: isHome ? 'rgba(255,255,255,0.1)' : 'secondaryBackground',
              },
            }}
          />
          <Account />
        </div>
      </div>
    </Container>
  )
}

export default AppHeader
