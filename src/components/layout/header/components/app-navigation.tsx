import TelegramIcon from '@/components/icons/TelegramIcon'
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
import {
  PROTOCOL_DOCS,
  REGISTER_FEEDBACK,
  RESERVE_BLOG,
  RESERVE_FORUM,
  ROUTES,
  TELEGRAM_INVITE,
} from '@/utils/constants'
import { Trans, useLingui } from '@lingui/react/macro'
import {
  BadgePlus,
  BookOpen,
  Cable,
  Ear,
  Flower,
  Landmark,
  MessagesSquare,
  Microscope,
  Newspaper,
  Wallet,
} from 'lucide-react'
import { useMemo } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  headerNavIconClassName,
  headerNavItemClassName,
  HeaderNavItemContent,
} from './header-nav-items'

const DiscoverItem = () => {
  const { pathname } = useLocation()
  const isDTF =
    (pathname.includes('/index-dtf/') || pathname.includes('/token/')) &&
    !pathname.includes('deploy')

  return (
    <NavigationMenuItem>
      <NavigationMenuLink asChild>
        <NavLink to={ROUTES.DISCOVER}>
          {({ isActive }: { isActive: boolean }) => (
            <div
              className={cn(
                navigationMenuTriggerStyle(),
                'text-foreground hover:text-primary focus:text-primary dark:text-muted-foreground dark:hover:text-foreground dark:focus:text-foreground',
                (isActive || isDTF) && 'text-primary dark:text-foreground'
              )}
            >
              <span className="hidden text-base font-normal min-[850px]:block">
                <Trans>Discover DTFs</Trans>
              </span>
            </div>
          )}
        </NavLink>
      </NavigationMenuLink>
    </NavigationMenuItem>
  )
}

const AppNavigation = () => {
  const { t } = useLingui()
  const { pathname } = useLocation()
  const [menuItems, moreLinks, externalLinks] = useMemo(
    () => [
      [
        {
          label: t`Participate & Earn`,
          icon: <Landmark strokeWidth={1.5} size={16} />,
          to: ROUTES.EARN,
        },
        {
          label: t`Portfolio`,
          icon: <Wallet strokeWidth={1.5} size={16} />,
          to: ROUTES.PORTFOLIO,
        },
        {
          label: t`Create DTF`,
          icon: <BadgePlus strokeWidth={1.5} size={16} />,
          to: ROUTES.DEPLOY_INDEX,
        },
      ],
      [
        {
          label: t`Create DTF`,
          icon: (
            <BadgePlus
              className={headerNavIconClassName}
              strokeWidth={1.5}
              size={16}
            />
          ),
          description: t`Launch your own Index DTF`,
          to: ROUTES.DEPLOY_INDEX,
          mobileOnly: true,
        },
        {
          label: t`DTF Explorer`,
          icon: (
            <Microscope
              className={headerNavIconClassName}
              strokeWidth={1.5}
              size={16}
            />
          ),
          description: t`Get an overview of everything going on`,
          to: ROUTES.EXPLORER,
        },
        {
          label: t`Bridge`,
          icon: (
            <Cable
              className={headerNavIconClassName}
              strokeWidth={1.5}
              size={16}
            />
          ),
          description: t`Transfer DTFs across chains`,
          to: ROUTES.BRIDGE,
        },
        {
          label: t`Create Yield DTF`,
          icon: (
            <Flower
              className={headerNavIconClassName}
              strokeWidth={1.5}
              size={16}
            />
          ),
          description: t`Create a new overcollateralized Yield DTF`,
          to: ROUTES.DEPLOY_YIELD,
        },
      ],
      [
        {
          label: t`Feedback & Requests`,
          icon: <Ear className={headerNavIconClassName} size={16} />,
          description: t`File issues or upvote existing ones`,
          to: REGISTER_FEEDBACK,
          external: true,
        },
        {
          label: t`Blog`,
          icon: (
            <Newspaper
              className={headerNavIconClassName}
              strokeWidth={1.5}
              size={16}
            />
          ),
          description: t`Stay up to date in long form`,
          to: RESERVE_BLOG,
          external: true,
        },
        {
          label: t`Docs`,
          icon: (
            <BookOpen
              className={headerNavIconClassName}
              strokeWidth={1.5}
              size={16}
            />
          ),
          description: t`Understand the project and protocols`,
          to: PROTOCOL_DOCS,
          external: true,
        },
        {
          label: t`Forum`,
          icon: (
            <MessagesSquare
              className={headerNavIconClassName}
              strokeWidth={1.5}
              size={16}
            />
          ),
          description: t`Discussions of ecosystem ideas`,
          to: RESERVE_FORUM,
          external: true,
        },
        {
          label: t`Telegram`,
          icon: <TelegramIcon color="#5865F2" width={20} />,
          description: t`Join the conversation or ask questions`,
          to: TELEGRAM_INVITE,
          external: true,
        },
      ],
    ],
    [t]
  )

  return (
    <NavigationMenu
      className="mr-auto hidden rounded-3xl border min-[850px]:flex min-[850px]:border-none"
      vClassName="-left-10 min-[850px]:left-auto min-[850px]:right-0"
    >
      <NavigationMenuList className="pl-0 pr-2">
        <DiscoverItem />
        {menuItems.map((item) => (
          <NavigationMenuItem
            key={item.to}
            className={cn(
              item.to === ROUTES.DEPLOY_INDEX && 'hidden min-[850px]:block'
            )}
          >
            <NavigationMenuLink asChild>
              <NavLink to={item.to}>
                {({ isActive }: { isActive: boolean }) => (
                  <div
                    className={cn(
                      navigationMenuTriggerStyle(),
                      'text-foreground hover:text-primary focus:text-primary dark:text-muted-foreground dark:hover:text-foreground dark:focus:text-foreground',
                      isActive && 'text-primary dark:text-foreground'
                    )}
                  >
                    <span className="hidden text-base font-normal min-[850px]:block">
                      {item.label}
                    </span>
                  </div>
                )}
              </NavLink>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
        <NavigationMenuItem>
          <NavigationMenuTrigger className="text-foreground hover:text-primary focus:text-primary data-[state=open]:text-primary dark:text-muted-foreground dark:hover:text-foreground dark:focus:text-foreground dark:data-[state=open]:text-foreground">
            <span className="hidden text-base font-normal min-[850px]:block">
              <Trans>More</Trans>
            </span>
          </NavigationMenuTrigger>
          <NavigationMenuContent className="bg-secondary">
            <div className="w-72 sm:w-96 flex flex-col gap-1 p-1 pb-1.5">
              {moreLinks
                .filter((item) => !item.mobileOnly)
                .map((item) => {
                  const isActive =
                    pathname === item.to || pathname.startsWith(`${item.to}/`)

                  return (
                    <NavigationMenuLink key={item.to} asChild>
                      <NavLink
                        to={item.to}
                        className={cn(headerNavItemClassName, 'rounded-2xl')}
                      >
                        <HeaderNavItemContent
                          item={item}
                          isActive={isActive}
                          showDescription={false}
                        />
                      </NavLink>
                    </NavigationMenuLink>
                  )
                })}
              {externalLinks.map((item) => (
                <NavigationMenuLink
                  key={item.to}
                  href={item.to}
                  target="_blank"
                  className={cn(headerNavItemClassName, 'rounded-2xl')}
                >
                  <HeaderNavItemContent item={item} showDescription={false} />
                </NavigationMenuLink>
              ))}
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

export default AppNavigation
