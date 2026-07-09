import ChainLogo from '@/components/icons/ChainLogo'
import TokenLogo from '@/components/token-logo'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { isInactiveDTF } from '@/hooks/use-dtf-status'
import { cn } from '@/lib/utils'
import { chainIdAtom } from '@/state/atoms'
import {
  indexDTFAtom,
  indexDTFBrandAtom,
  indexDTFStatusAtom,
  iTokenAddressAtom,
} from '@/state/dtf/atoms'
import { BRIDGED_INDEX_DTFS, CHAIN_TAGS, ROUTES } from '@/utils/constants'
import { shortenAddress } from '@/utils'
import { ChainId } from '@/utils/chains'
import { useLingui } from '@lingui/react/macro'
import { useAtomValue } from 'jotai'
import {
  ArrowLeftRight,
  Blend,
  CirclePlus,
  Copy,
  EllipsisVertical,
  Fingerprint,
  Globe,
  Landmark,
  Wallet2,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { NavLink, useLocation, useParams } from 'react-router-dom'
import { Address } from 'viem'
import { useAccount, useWatchAsset } from 'wagmi'
import { toast } from 'sonner'

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
      <NavLink to={route} end={route === ROUTES.ISSUANCE}>
        {({ isActive }) => {
          return (
            <div
              className={cn(
                'group/item flex items-center gap-3 rounded-full transition-colors hover:text-primary',
                isActive ? 'text-primary' : 'text-text'
              )}
            >
              <div
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors',
                  isActive
                    ? 'dark:border-primary/20 bg-primary/10'
                    : 'border-transparent bg-transparent group-hover/item:border-border group-hover/item:bg-card'
                )}
              >
                {icon}
              </div>
              <div className="hidden whitespace-nowrap text-base opacity-0 transition-opacity duration-150 group-hover/nav:opacity-100 lg:block">
                {label}
              </div>
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
  const { t } = useLingui()
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
    <div className="hidden items-center gap-3 lg:flex">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
        <TokenLogo
          src={brand?.dtf?.icon || undefined}
          alt={indexDTF?.token.symbol ?? t`dtf token logo`}
          size="lg"
        />
      </div>
      <div className="hidden min-w-0 flex-1 items-center gap-2 opacity-0 transition-opacity duration-150 group-hover/nav:flex group-hover/nav:opacity-100">
        <div className="min-w-0 flex-1 truncate text-base font-semibold">
          {indexDTF?.token.symbol}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {!!indexDTF?.chainId && (
            <ChainLogo
              chain={indexDTF.chainId}
              className="h-4 w-4 rounded-md"
            />
          )}
          {!!walletAddress && !!indexDTF && chainId === indexDTF.chainId && (
            <Button
              variant="ghost"
              size="icon"
              className="relative shrink-0 rounded-full text-foreground  hover:bg-card hover:text-primary"
              onClick={handleWatchAsset}
            >
              <Wallet2 strokeWidth={1.5} size={16} />
              <CirclePlus
                strokeWidth={1.5}
                size={16}
                className="absolute bottom-0 right-0 rounded-full border border-card bg-card"
              />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

const DisabledNavigationItem = ({
  icon,
  label,
}: {
  icon: React.ReactNode
  label: string
}) => {
  return (
    <div className="pointer-events-none flex items-center gap-3 rounded-full text-legend opacity-50 transition-all">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border">
        {icon}
      </div>
      <div className="hidden whitespace-nowrap text-base opacity-0 transition-opacity duration-150 group-hover/nav:opacity-100 lg:block">
        {label}
      </div>
    </div>
  )
}

const DISABLED_ROUTES_WHEN_DEPRECATED: string[] = [ROUTES.AUCTIONS]

const getCompactChainLabel = (chain: number) =>
  chain === ChainId.BSC ? 'BSC' : CHAIN_TAGS[chain] || `Chain ${chain}`

const useNavigationItems = () => {
  const { t } = useLingui()

  return useMemo(
    () => [
      {
        icon: <Globe strokeWidth={1.5} size={16} />,
        label: t`Overview`,
        route: ROUTES.OVERVIEW,
      },
      {
        icon: <Blend strokeWidth={1.5} size={16} />,
        label: t`Swap`,
        route: ROUTES.ISSUANCE,
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
    [t]
  )
}

const NavigationItems = () => {
  const status = useAtomValue(indexDTFStatusAtom)
  const isDeprecated = isInactiveDTF(status)
  const items = useNavigationItems()

  return (
    <div className="flex justify-evenly gap-3 lg:flex-col lg:justify-start">
      {items.map((item) =>
        isDeprecated && DISABLED_ROUTES_WHEN_DEPRECATED.includes(item.route) ? (
          <DisabledNavigationItem
            key={item.route}
            icon={item.icon}
            label={item.label}
          />
        ) : (
          <NavigationItem key={item.route} {...item} />
        )
      )}
    </div>
  )
}

const MobileTokenAddresses = () => {
  const { t } = useLingui()
  const chainId = useAtomValue(chainIdAtom)
  const address = useAtomValue(iTokenAddressAtom)
  const dtf = useAtomValue(indexDTFAtom)
  const brand = useAtomValue(indexDTFBrandAtom)
  const bridgedAddresses = useMemo(
    () => (address ? BRIDGED_INDEX_DTFS[address.toLowerCase()] : null),
    [address]
  )

  if (!address) return null

  const ticker = dtf?.token.symbol ? `$${dtf.token.symbol}` : null
  const nativeAddress = bridgedAddresses?.[0]?.address.toLowerCase()
  const addressRows = bridgedAddresses ?? [{ address, chain: chainId }]

  const copyAddress = async (addr: string) => {
    try {
      await navigator.clipboard.writeText(addr)
      toast.success(t`Address copied to clipboard`)
    } catch {
      toast.error(t`Unable to copy address`)
    }
  }

  return (
    <div className="mt-2">
      <div className="px-3 pb-2 text-xs font-medium text-muted-foreground">
        {ticker
          ? bridgedAddresses
            ? t`${ticker} token addresses`
            : t`${ticker} token address`
          : bridgedAddresses
            ? t`Token addresses`
            : t`Token address`}
      </div>
      <div className="overflow-hidden rounded-xl border border-border">
        {addressRows.map(({ address: rowAddress, chain }) => {
          const isNative =
            !bridgedAddresses ||
            rowAddress.toLowerCase() === nativeAddress?.toLowerCase()
          const chainLabel = getCompactChainLabel(chain)

          return (
            <button
              type="button"
              key={`${chain}-${rowAddress}`}
              className="flex min-h-11 w-full min-w-0 items-center gap-3 border-b border-border px-3 py-3 text-left transition-colors last:border-b-0 hover:bg-muted/60"
              aria-label={t`Copy address`}
              onClick={() => copyAddress(rowAddress)}
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <TokenLogo
                  src={brand?.dtf?.icon || undefined}
                  symbol={dtf?.token.symbol}
                  address={dtf?.id ?? address}
                  chain={dtf?.chainId ?? chainId}
                  width={16}
                  height={16}
                  className="shrink-0"
                />
                <span className="truncate text-base">
                  {bridgedAddresses
                    ? isNative
                      ? t`${chainLabel} (Native)`
                      : t`${chainLabel} (Bridged)`
                    : ticker || chainLabel}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
                <ChainLogo chain={chain} className="h-3.5 w-3.5 shrink-0" />
                {shortenAddress(rowAddress)}
              </div>
              <div className="flex shrink-0 items-center text-muted-foreground">
                <Copy className="h-3.5 w-3.5" />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export const DTFMobilePagesMenuButton = ({
  buttonClassName = 'h-14 w-14 rounded-full border-card bg-card/80 p-0 shadow-[0_-16px_60px_rgba(0,0,0,0.18)] backdrop-blur-[7px] dark:shadow-[0_-20px_80px_rgba(0,0,0,0.76),0_0_0_1px_rgba(255,255,255,0.08)]',
}: {
  buttonClassName?: string
}) => {
  const { t } = useLingui()
  const { pathname } = useLocation()
  const { chain, tokenId } = useParams()
  const dtf = useAtomValue(indexDTFAtom)
  const status = useAtomValue(indexDTFStatusAtom)
  const isDeprecated = isInactiveDTF(status)
  const [open, setOpen] = useState(false)
  const items = useNavigationItems()
  const ticker = dtf?.token.symbol ? `$${dtf.token.symbol}` : null

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open])

  const isCurrentRoute = (route: string) =>
    pathname.endsWith(`/${route}`) || pathname.includes(`/${route}/`)
  const getPageRoute = (route: string) =>
    chain && tokenId ? `/${chain}/index-dtf/${tokenId}/${route}` : route

  return (
    <>
      <Button
        variant="outline"
        className={buttonClassName}
        aria-label={t`Open DTF pages`}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <EllipsisVertical className="h-5 w-5" />
      </Button>
      {open &&
        createPortal(
          <>
            <button
              type="button"
              aria-label={t`Close DTF pages`}
              className="fixed inset-0 z-40 bg-transparent lg:hidden"
              onClick={() => setOpen(false)}
            />
            <div
              role="menu"
              className="fixed bottom-20 right-2 z-50 flex max-w-[calc(100vw-1rem)] w-80 flex-col gap-2 rounded-3xl border border-card bg-card/90 p-2 shadow-[0_-16px_60px_rgba(0,0,0,0.18)] backdrop-blur-[7px] dark:shadow-[0_-22px_90px_rgba(0,0,0,0.82),0_0_0_1px_rgba(255,255,255,0.08)] sm:bottom-24 lg:hidden"
            >
              <div className="px-3 pb-1 pt-2 text-sm text-muted-foreground">
                {ticker ? t`${ticker} pages` : t`DTF pages`}
              </div>
              <div className="overflow-hidden rounded-xl border border-border">
                {items.map((item) => {
                  const isCurrent = isCurrentRoute(item.route)
                  const isDisabled =
                    isDeprecated &&
                    DISABLED_ROUTES_WHEN_DEPRECATED.includes(item.route)

                  if (isDisabled) {
                    return (
                      <div
                        key={item.route}
                        role="menuitem"
                        aria-disabled
                        className="flex min-h-11 items-center gap-3 border-b border-border px-3 py-3 opacity-50 last:border-b-0"
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </div>
                    )
                  }

                  return (
                    <NavLink
                      key={item.route}
                      to={getPageRoute(item.route)}
                      role="menuitem"
                      onClick={() => setOpen(false)}
                      className={cn(
                        'flex min-h-11 w-full items-center gap-3 border-b border-border px-3 py-3 last:border-b-0',
                        isCurrent && 'bg-muted/60 text-foreground'
                      )}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                      {isCurrent && (
                        <span className="ml-auto text-xs text-muted-foreground">
                          {t`Current`}
                        </span>
                      )}
                    </NavLink>
                  )
                })}
              </div>
              <MobileTokenAddresses />
            </div>
          </>,
          document.body
        )}
    </>
  )
}

const IndexDTFNavigation = () => {
  const location = useLocation()
  const isFactsheet = location.pathname.endsWith(`/${ROUTES.FACTSHEET}`)

  if (isFactsheet) return null

  return (
    <>
      <div
        data-testid="dtf-nav"
        className="hidden lg:sticky lg:top-0 lg:z-30 lg:mr-2 lg:block lg:h-[calc(100vh-80px)] lg:w-20 lg:flex-shrink-0 lg:bg-transparent lg:p-0"
      >
        <div className="group/nav sticky top-6 lg:absolute lg:left-0 lg:top-0 lg:z-20 lg:h-full lg:w-20 lg:overflow-hidden lg:rounded-2xl lg:bg-transparent lg:p-5 lg:py-7 lg:transition-all lg:duration-200 lg:before:pointer-events-none lg:before:absolute lg:before:inset-0 lg:before:rounded-[inherit] lg:before:opacity-0 lg:before:backdrop-blur-[7px] lg:before:transition-opacity lg:before:duration-200 lg:after:pointer-events-none lg:after:absolute lg:after:inset-0 lg:after:rounded-[inherit] lg:after:border-2 lg:after:border-card lg:after:bg-background/50 lg:after:opacity-0 lg:after:transition-opacity lg:after:duration-200 lg:hover:w-64 lg:hover:before:opacity-100 lg:hover:after:opacity-100">
          <div className="relative z-10">
            <NavigationHeader />
            <Separator className="my-4 hidden lg:block" />
            <NavigationItems />
          </div>
        </div>
      </div>
    </>
  )
}

export default IndexDTFNavigation
