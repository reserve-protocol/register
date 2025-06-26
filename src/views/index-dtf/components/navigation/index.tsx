import TokenLogo from '@/components/token-logo'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { indexDTFAtom, indexDTFBrandAtom } from '@/state/dtf/atoms'
import { ROUTES } from '@/utils/constants'
import { t } from '@lingui/macro'
import { useAtomValue } from 'jotai'
import {
  ArrowLeftRight,
  Blend,
  CirclePlus,
  Fingerprint,
  Globe,
  Landmark,
  Wallet2,
} from 'lucide-react'
import { useMemo } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Address } from 'viem'
import { useAccount, useWatchAsset } from 'wagmi'

const NavigationItem = ({
  icon,
  label,
  route,
  subItems,
}: {
  icon: React.ReactNode
  label: string
  route: string
  subItems?: {
    label: string
    route: string
  }[]
}) => {
  const { pathname } = useLocation()
  const showSubItems = subItems && pathname.includes(route)

  return (
    <div className="flex flex-col">
      <NavLink to={route}>
        {({ isActive }) => {
          return (
            <div
              className={cn(
                'flex items-center transition-all rounded-full gap-2 hover:text-primary',
                isActive
                  ? 'text-primary bg-primary/10 md:bg-transparent'
                  : 'text-text'
              )}
            >
              <div className="h-10 w-10 md:h-6 md:w-6 flex items-center justify-center">
                {icon}
              </div>
              <div className="text-base hidden md:block">{label}</div>
            </div>
          )
        }}
      </NavLink>
      {subItems && (
        <div
          className={cn(
            'flex flex-col gap-2 overflow-hidden transition-all duration-300 ease-in-out',
            showSubItems
              ? 'mt-3 max-h-[500px] opacity-100'
              : 'max-h-0 opacity-0'
          )}
        >
          {subItems.map((item) => {
            const hasMoreThanOneActiveSubItem =
              subItems?.filter((item) => pathname.includes(item.route)).length >
              1
            return (
              <NavLink key={item.route} to={item.route}>
                {({ isActive }) => {
                  const isLikeMainItem = isActive && route === item.route
                  const _isActive =
                    isActive &&
                    (!isLikeMainItem || !hasMoreThanOneActiveSubItem)
                  return (
                    <div
                      className={cn(
                        'flex items-center gap-2 text-sm font-light text-muted-foreground pl-8',
                        _isActive && 'text-primary pl-0.5'
                      )}
                    >
                      {_isActive && (
                        <div className="h-1.5 w-1.5 bg-primary rounded-full mx-2" />
                      )}
                      {item.label}
                    </div>
                  )
                }}
              </NavLink>
            )
          })}
        </div>
      )}
    </div>
  )
}

const NavigationHeader = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const brand = useAtomValue(indexDTFBrandAtom)
  const { address: walletAddress, chainId } = useAccount()
  const { watchAsset } = useWatchAsset()

  const handleWatchAsset = () => {
    if (!indexDTF || !walletAddress) return

    watchAsset({
      type: 'ERC20',
      options: {
        address: indexDTF.id as Address,
        symbol: indexDTF.token.symbol,
        decimals: indexDTF.token.decimals,
      },
    })
  }

  return (
    <div className="items-center gap-2 hidden md:flex">
      <TokenLogo
        src={brand?.dtf?.icon || undefined}
        alt={indexDTF?.token.symbol ?? 'dtf token logo'}
        size="lg"
      />
      <div className="text-base font-semibold truncate">
        {indexDTF?.token.symbol}
      </div>
      {!!walletAddress && !!indexDTF && chainId === indexDTF.chainId && (
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto relative"
          onClick={handleWatchAsset}
        >
          <Wallet2 strokeWidth={1.5} size={16} />
          <CirclePlus
            strokeWidth={1.5}
            size={12}
            className="absolute bottom-2 right-1 bg-background"
          />
        </Button>
      )}
    </div>
  )
}

const NavigationItems = () => {
  const dtf = useAtomValue(indexDTFAtom)

  const items = useMemo(
    () => [
      {
        icon: <Globe strokeWidth={1.5} size={16} />,
        label: t`Overview`,
        route: ROUTES.OVERVIEW,
      },
      {
        icon: <Blend strokeWidth={1.5} size={16} />,
        label: t`Mint + Redeem`,
        route: ROUTES.ISSUANCE,
        subItems: [
          {
            label: t`Zap`,
            route: ROUTES.ISSUANCE,
          },
          {
            label: t`Automated`,
            route: ROUTES.ISSUANCE + '/automated',
          },
          {
            label: t`Manual`,
            route: ROUTES.ISSUANCE + '/manual',
          },
        ],
      },
      {
        icon: <Landmark strokeWidth={1.5} size={16} />,
        label: t`Governance`,
        route: ROUTES.GOVERNANCE,
      },
      {
        icon: <ArrowLeftRight strokeWidth={1.5} size={16} />,
        label: t`Auctions`,
        route: ROUTES.AUCTIONS,
      },
      {
        icon: <Fingerprint strokeWidth={1.5} size={16} />,
        label: t`Details + Roles`,
        route: ROUTES.SETTINGS,
      },
    ],
    [dtf?.token.symbol]
  )

  return (
    <div className="flex lg:flex-col gap-5 justify-evenly lg:justify-start">
      {items.map((item) => (
        <NavigationItem key={item.route} {...item} />
      ))}
    </div>
  )
}

const IndexDTFNavigation = () => {
  return (
    <div className="w-full lg:sticky lg:top-0 p-3 md:p-6 fixed bottom-0 border-t lg:border-t-0 lg:w-56 flex-shrink-0 bg-background z-[1] h-16 lg:h-full">
      <div className="sticky top-6">
        <NavigationHeader />
        <Separator className="my-4 hidden md:block" />
        <NavigationItems />
      </div>
    </div>
  )
}

export default IndexDTFNavigation
