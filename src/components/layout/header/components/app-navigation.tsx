// import HeaderMenu from './HeaderMenu'
import Binoculars from '@/components/icons/Binoculars'
import CirclesIcon from '@/components/icons/CirclesIcon'
import DiscordIcon from '@/components/icons/DiscordIcon'
import Money from '@/components/icons/Money'
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
import {
  ArrowRight,
  ArrowUpRight,
  Asterisk,
  Cable,
  Ear,
  Flower,
  Globe,
  Microscope,
} from 'lucide-react'
import { ReactNode, useMemo } from 'react'
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

const IconContainer = ({ children }: { children: ReactNode }) => (
  <div className=" p-1 rounded-full border border-foreground">{children}</div>
)

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
          icon: <Globe strokeWidth={1.5} size={16} />,
          to: ROUTES.DEPLOY_INDEX,
        },
      ],
      [
        {
          label: t`DTF Explorer`,
          icon: (
            <IconContainer>
              <Microscope size={16} />
            </IconContainer>
          ),
          description: t`Get an overview of everything going on`,
          to: ROUTES.EXPLORER,
        },
        {
          label: t`Reserve Bridge`,
          icon: (
            <IconContainer>
              <Cable size={16} />
            </IconContainer>
          ),
          description: t`Transfer DTFs across chains`,
          to: ROUTES.BRIDGE,
        },
        {
          label: t`Yield DTF Creator`,
          icon: (
            <IconContainer>
              <Flower size={16} />
            </IconContainer>
          ),
          description: t`Make a new overcollateralized yield DTF`,
          to: ROUTES.DEPLOY_YIELD,
        },
      ],
      [
        {
          label: t`Feedback`,
          icon: <Ear color="#5F5DF9" />,
          description: t`File issues or upvote existing ones`,
          to: REGISTER_FEEDBACK,
        },
        {
          label: t`Reserve Blog`,
          icon: <ReserveSquare />,
          description: t`Stay up to date in long form`,
          to: RESERVE_BLOG,
        },
        {
          label: t`Protocol Docs`,
          icon: <ReserveSquare />,
          description: t`Understand the Reserve Protocol`,
          to: PROTOCOL_DOCS,
        },
        {
          label: t`Reserve Forum`,
          icon: <ReserveSquare />,
          description: t`Discussions of ecosystem ideas`,
          to: RESERVE_FORUM,
        },
        {
          label: t`Reserve Discord`,
          icon: <DiscordIcon color="#5865F2" width={20} />,
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
                    {item.icon}
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
                  {item.icon}
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
