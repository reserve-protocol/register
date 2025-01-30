import Account from 'components/account'
import ThemeColorMode from 'components/dark-mode-toggle/ThemeColorMode'
import Brand from './Brand'
import CoinbaseSubscribe from './CoinbaseSubscribe'
// import HeaderMenu from './HeaderMenu'
import BasketCubeIcon from '@/components/icons/BasketCubeIcon'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/utils/constants'
import { t } from '@lingui/macro'
import { Asterisk, DollarSign, Rocket } from 'lucide-react'
import { ReactNode, useMemo } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import RegisterHelp from './RegisterHelp'

const HeaderMenu = () => {
  const menuItems = useMemo(
    () => [
      {
        label: t`Discover`,
        icon: <BasketCubeIcon fontSize={14} />,
        to: ROUTES.HOME,
      },
      {
        label: t`Farm`,
        icon: <DollarSign size={14} />,
        to: ROUTES.EARN,
      },
      {
        label: t`Deploy`,
        icon: <Rocket size={14} />,
        to: ROUTES.DEPLOY,
      },
    ],
    []
  )

  return (
    <NavigationMenu className="mr-auto border md:border-none rounded-3xl">
      <NavigationMenuList>
        {menuItems.map((item) => (
          <NavigationMenuItem key={item.to}>
            <NavLink to={item.to}>
              {({ isActive }: { isActive: boolean }) => (
                <div
                  className={cn(
                    navigationMenuTriggerStyle(),
                    isActive && 'text-primary font-bold'
                  )}
                >
                  {item.icon}
                  <span className="hidden md:block">{item.label}</span>
                </div>
              )}
            </NavLink>
          </NavigationMenuItem>
        ))}
        <NavigationMenuItem>
          <NavigationMenuTrigger>
            <Asterisk size={16} />
            <span className="hidden md:block">More</span>
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink>Link</NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

const Container = ({ children }: { children: ReactNode }) => {
  // Check if the route is a "index-dtf" route
  const { pathname } = useLocation()

  const border = !pathname.includes('index-dtf') && pathname !== '/'

  return (
    <div
      className={cn(
        'w-full overflow-hidden flex-shrink-0',
        border && 'border-b'
      )}
    >
      {children}
    </div>
  )
}

/**
 * Application header
 */
const AppHeader = () => {
  return (
    <Container>
      <div className="container flex items-center h-[56px] md:h-[72px] px-2 sm:px-6">
        <Brand className="text-primary mr-4 cursor-pointer" />
        <HeaderMenu />

        {/* <ThemeColorMode
          sx={{
            display: ['none', 'flex'],
            px: 2,
            mr: 1,
            py: '3px',
            maxWidth: '32px',
            borderRadius: '6px',
            ml: 'auto',
            cursor: 'pointer',
            ':hover': {
              backgroundColor: 'secondaryBackground',
            },
          }}
        /> */}
        <RegisterHelp />
        <CoinbaseSubscribe mr="2" sx={{ display: ['none', 'none', 'block'] }} />
        <Account />
      </div>
    </Container>
  )
}
export default AppHeader
