import CommandMenu from '@/components/command-menu'
import ThemeColorMode from '@/components/dark-mode-toggle/ThemeColorMode'
import { cn } from '@/lib/utils'
import Account from 'components/account'
import { useEffect, useState } from 'react'
import AppNavigation from '@/components/layout/header/components/app-navigation'
import Brand from '@/components/layout/header/components/Brand'

const HomeHeader = () => {
  const [isPastCover, setIsPastCover] = useState(false)
  const [needsBackground, setNeedsBackground] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = document.getElementById('app-container')?.scrollTop || 0
      const viewportHeight = window.innerHeight
      
      // Add solid blue background when content is about to go under header
      // This happens when Hero starts fading (around 200-300px scroll)
      setNeedsBackground(scrollPosition > 200)
      
      // Change text color when scrolled past the blue cover (100vh)
      setIsPastCover(scrollPosition > viewportHeight - 100) // Small offset for smoother transition
    }

    const container = document.getElementById('app-container')
    container?.addEventListener('scroll', handleScroll)
    handleScroll() // Check initial scroll position
    
    return () => {
      container?.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div 
      className={cn(
        "fixed top-0 left-0 right-0 transition-all duration-300",
        needsBackground ? "bg-primary" : "bg-transparent"
      )}
      style={{ zIndex: 100 }}
    >
      <div className={cn(
        "container flex items-center h-[56px] md:h-[72px] px-4 sm:px-6 transition-colors duration-300",
        isPastCover ? "text-foreground" : "text-primary-foreground"
      )}>
        <Brand 
          className={cn(
            "mr-2 sm:mr-4 cursor-pointer md:-mt-1 transition-colors duration-300",
            isPastCover ? "text-primary" : "text-primary-foreground"
          )} 
        />
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
                backgroundColor: isPastCover ? 'secondaryBackground' : 'rgba(255,255,255,0.1)',
              },
            }}
          />
          <Account />
        </div>
      </div>
    </div>
  )
}

export default HomeHeader