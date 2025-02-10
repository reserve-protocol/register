// import HeaderMenu from './HeaderMenu'
import Binoculars from '@/components/icons/Binoculars'
import CirclesIcon from '@/components/icons/CirclesIcon'
import Money from '@/components/icons/Money'
import RSRSquare from '@/components/icons/RSRSquare'
import ReserveSquare from '@/components/icons/ReserveSquare'
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
  DISCORD_INVITE,
  PROTOCOL_DOCS,
  REGISTER_FEEDBACK,
  RESERVE_BLOG,
  RESERVE_FORUM,
  ROUTES,
} from '@/utils/constants'
import { t, Trans } from '@lingui/macro'
import { ArrowRight, ArrowUpRight, Asterisk, SquarePlus } from 'lucide-react'
import { useMemo } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

const DiscoverItem = () => {
  const { pathname } = useLocation()
  const isDTF = pathname.includes('dtf') && !pathname.includes('deploy')

  return (
    <NavigationMenuItem>
      <NavigationMenuLink asChild>
        <NavLink to={ROUTES.HOME}>
          {({ isActive }: { isActive: boolean }) => (
            <div
              className={cn(
                navigationMenuTriggerStyle(),
                (isActive || isDTF) && 'text-primary font-bold'
              )}
            >
              <Binoculars />
              <span className="hidden md:block">
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
  const [menuItems, moreLinks, externalLinks] = useMemo(
    () => [
      [
        {
          label: t`Earn Yield`,
          icon: <Money />,
          to: ROUTES.EARN,
        },
        {
          label: t`Create New DTF`,
          icon: <SquarePlus strokeWidth={1.5} size={16} />,
          to: ROUTES.DEPLOY_INDEX,
        },
      ],
      [
        {
          label: t`DTF Explorer`,
          icon: <Asterisk size={16} />,
          description: t`Get an overview of everything going on`,
          to: ROUTES.EXPLORER,
        },
        {
          label: t`Reserve Bridge`,
          icon: <Asterisk size={16} />,
          description: t`Transfer DTFs across chains`,
          to: ROUTES.BRIDGE,
        },
        {
          label: t`Yield DTF Creator`,
          icon: <Asterisk size={16} />,
          description: t`Make a new over-collateralized yield DTF`,
          to: ROUTES.DEPLOY_YIELD,
        },
      ],
      [
        {
          label: t`Feedback`,
          icon: <Asterisk size={16} />,
          description: t`File issues or upvote existing ones`,
          to: REGISTER_FEEDBACK,
        },
        {
          label: t`Reserve Blog`,
          icon: <Asterisk size={16} />,
          description: t`Stay up to date in long form`,
          to: RESERVE_BLOG,
        },
        {
          label: t`Protocol Docs`,
          icon: <Asterisk size={16} />,
          description: t`Understand the Reserve Protocol`,
          to: PROTOCOL_DOCS,
        },
        {
          label: t`Reserve Forum`,
          icon: <Asterisk size={16} />,
          description: t`Discussions of ecosystem ideas`,
          to: RESERVE_FORUM,
        },
        {
          label: t`Reserve Discord`,
          icon: <Asterisk size={16} />,
          description: t`Join the conversation or ask questions`,
          to: DISCORD_INVITE,
        },
      ],
    ],
    []
  )

  return (
    <NavigationMenu
      className="mr-auto border md:border-none rounded-3xl"
      vClassName="-left-10 md:left-40"
    >
      <NavigationMenuList>
        <DiscoverItem />
        {menuItems.map((item) => (
          <NavigationMenuItem key={item.to}>
            <NavigationMenuLink asChild>
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
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
        <NavigationMenuItem>
          <NavigationMenuTrigger>
            <CirclesIcon />
            <span className="hidden md:block">More</span>
          </NavigationMenuTrigger>
          <NavigationMenuContent className="rounded-3xl">
            <div className="bg-secondary w-72 sm:w-96 flex p-1 flex-col gap-1">
              {moreLinks.map((item) => (
                <NavigationMenuLink
                  key={item.to}
                  asChild
                  className="p-4 gap-2 flex items-center rounded-3xl bg-card border border-transparent hover:border-primary"
                >
                  <NavLink to={item.to}>
                    <div className="bg-primary p-1 rounded-full text-primary-foreground">
                      {item.icon}
                    </div>
                    <div className="mr-auto">
                      <span className="font-bold">{item.label}</span>
                      <p className="hidden md:block text-sm text-legend">
                        {item.description}
                      </p>
                    </div>
                    <div className="bg-primary p-1 rounded-full text-primary-foreground">
                      <ArrowRight size={16} />
                    </div>
                  </NavLink>
                </NavigationMenuLink>
              ))}
              {externalLinks.map((item) => (
                <NavigationMenuLink
                  key={item.to}
                  href={item.to}
                  target="_blank"
                  className="p-4 gap-2 flex items-center rounded-3xl bg-card border border-transparent hover:border-primary"
                >
                  <div className="bg-primary p-1 rounded-full text-primary-foreground">
                    <Asterisk size={16} />
                  </div>
                  <div className="mr-auto">
                    <span className="font-bold">{item.label}</span>
                    <p className="hidden md:block text-sm text-legend">
                      {item.description}
                    </p>
                  </div>
                  <div className="bg-muted p-1 rounded-full">
                    <ArrowUpRight size={16} />
                  </div>
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
