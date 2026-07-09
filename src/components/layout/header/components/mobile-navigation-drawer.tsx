import TelegramIcon from '@/components/icons/TelegramIcon'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
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
  Binoculars,
  BookOpen,
  Cable,
  Ear,
  Flower,
  Landmark,
  Menu,
  MessagesSquare,
  Microscope,
  Newspaper,
  Wallet,
  X,
} from 'lucide-react'
import { ReactNode, useMemo, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  HeaderNavItem,
  headerNavIconClassName,
  HeaderNavItemContent,
  headerNavItemClassName,
} from './header-nav-items'
import HeaderControlButton, {
  type HeaderControlSurface,
} from './header-control-button'

const headerNavIconProps = {
  className: headerNavIconClassName,
  strokeWidth: 1.5,
  size: 16,
}

const MobileNavSection = ({
  title,
  items,
}: {
  title: ReactNode
  items: HeaderNavItem[]
}) => {
  const { pathname } = useLocation()

  return (
    <section>
      <h3 className="px-5 py-4 mb-[1px] bg-card text-xs font-semibold uppercase text-legend">
        {title}
      </h3>
      <div className="flex flex-col gap-[1px]">
        {items.map((item) => {
          const isActive =
            !item.external &&
            (pathname === item.to || pathname.startsWith(`${item.to}/`))
          const content = (
            <HeaderNavItemContent
              item={item}
              isActive={isActive}
              activeTone="muted"
            />
          )

          if (item.external) {
            return (
              <DrawerClose asChild key={item.to}>
                <a
                  href={item.to}
                  target="_blank"
                  rel="noreferrer"
                  className={headerNavItemClassName}
                >
                  {content}
                </a>
              </DrawerClose>
            )
          }

          return (
            <DrawerClose asChild key={item.to}>
              <NavLink to={item.to} className={headerNavItemClassName}>
                {content}
              </NavLink>
            </DrawerClose>
          )
        })}
      </div>
    </section>
  )
}

const MobileNavigationDrawer = ({
  surface = 'default',
}: {
  surface?: HeaderControlSurface
}) => {
  const { t } = useLingui()
  const [open, setOpen] = useState(false)
  const sections = useMemo(
    () => [
      {
        title: <Trans>Main</Trans>,
        items: [
          {
            label: t`Discover DTFs`,
            description: t`Browse Index and Yield DTFs`,
            icon: <Binoculars {...headerNavIconProps} />,
            to: ROUTES.DISCOVER,
          },
          {
            label: t`Participate & Earn`,
            description: t`Govern, stake, and find yield opportunities`,
            icon: <Landmark {...headerNavIconProps} />,
            to: ROUTES.EARN,
          },
          {
            label: t`Portfolio`,
            description: t`Track your Reserve activity`,
            icon: <Wallet {...headerNavIconProps} />,
            to: ROUTES.PORTFOLIO,
          },
        ],
      },
      {
        title: <Trans>Create & tools</Trans>,
        items: [
          {
            label: t`Create DTF`,
            description: t`Launch your own Index DTF`,
            icon: <BadgePlus {...headerNavIconProps} />,
            to: ROUTES.DEPLOY_INDEX,
          },
          {
            label: t`DTF Explorer`,
            description: t`Get an overview of everything going on`,
            icon: <Microscope {...headerNavIconProps} />,
            to: ROUTES.EXPLORER,
          },
          {
            label: t`Bridge`,
            description: t`Transfer DTFs across chains`,
            icon: <Cable {...headerNavIconProps} />,
            to: ROUTES.BRIDGE,
          },
          {
            label: t`Create Yield DTF`,
            description: t`Create a new overcollateralized Yield DTF`,
            icon: <Flower {...headerNavIconProps} />,
            to: ROUTES.DEPLOY_YIELD,
          },
        ],
      },
      {
        title: <Trans>Resources</Trans>,
        items: [
          {
            label: t`Feedback`,
            description: t`File issues or upvote existing ones`,
            icon: <Ear className={headerNavIconClassName} size={16} />,
            to: REGISTER_FEEDBACK,
            external: true,
          },
          {
            label: t`Blog`,
            description: t`Stay up to date in long form`,
            icon: <Newspaper {...headerNavIconProps} />,
            to: RESERVE_BLOG,
            external: true,
          },
          {
            label: t`Docs`,
            description: t`Understand the project and protocols`,
            icon: <BookOpen {...headerNavIconProps} />,
            to: PROTOCOL_DOCS,
            external: true,
          },
          {
            label: t`Forum`,
            description: t`Discussions of ecosystem ideas`,
            icon: <MessagesSquare {...headerNavIconProps} />,
            to: RESERVE_FORUM,
            external: true,
          },
          {
            label: t`Telegram`,
            description: t`Join the conversation or ask questions`,
            icon: <TelegramIcon color="#5865F2" width={20} />,
            to: TELEGRAM_INVITE,
            external: true,
          },
        ],
      },
    ],
    [t]
  )

  return (
    <Drawer open={open} onOpenChange={setOpen} shouldScaleBackground={false}>
      <DrawerTrigger asChild>
        <HeaderControlButton
          surface={surface}
          className={cn('w-9 min-[850px]:hidden', open && 'relative z-[60]')}
        >
          {open ? (
            <X size={16} strokeWidth={1.5} />
          ) : (
            <Menu size={16} strokeWidth={1.5} />
          )}
          <span className="sr-only">
            {open ? (
              <Trans>Close navigation menu</Trans>
            ) : (
              <Trans>Open navigation menu</Trans>
            )}
          </span>
        </HeaderControlButton>
      </DrawerTrigger>
      <DrawerContent
        showClose={false}
        overlayClassName="bg-card opacity-100"
        className="!bottom-0 !left-0 !right-0 !top-[56px] !w-screen !max-w-none !rounded-none !bg-secondary !p-0 !pt-[1px] md:!left-0 md:!right-0 md:!top-[72px] md:!w-screen"
      >
        <DrawerTitle className="sr-only">
          <Trans>Navigation menu</Trans>
        </DrawerTitle>
        <div className="flex flex-col gap-[1px] overflow-y-auto">
          {sections.map((section, index) => (
            <MobileNavSection
              key={index}
              title={section.title}
              items={section.items}
            />
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default MobileNavigationDrawer
