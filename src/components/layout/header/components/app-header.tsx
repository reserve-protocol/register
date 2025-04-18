import Account from 'components/account'
import Brand from './Brand'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import AppNavigation from './app-navigation'
import ThemeColorMode from '@/components/dark-mode-toggle/ThemeColorMode'
import { Button } from '@/components/ui/button'
import { ArrowUpRight, Gem } from 'lucide-react'
import { CAMPAIGN_URL } from '@/views/index-dtf/overview/hooks/use-campaign'

const Container = ({ children }: { children: ReactNode }) => {
  // Check if the route is a "index-dtf" route
  const { pathname } = useLocation()

  const border = !pathname.includes('index-dtf') || pathname.includes('deploy')

  return (
    <div className={cn('w-full flex-shrink-0', border && 'border-b')}>
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
      <div className="flex items-center">
        <Button
          className="hidden lg:flex items-center pl-3 py-2 pr-[10px] rounded-[12px] h-8 mr-2 bg-[#FFBE45] hover:bg-[#FFBE45]/90 text-black text-base font-light"
          asChild
        >
          <a href={CAMPAIGN_URL} target="_blank">
            <Gem size={16} />
            <span className="ml-[6px] mr-1">$25K in Rewards</span>
            <ArrowUpRight size={16} />
          </a>
        </Button>
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
              backgroundColor: 'secondaryBackground',
            },
          }}
        />
        <Account />
      </div>
    </div>
  </Container>
)

export default AppHeader
