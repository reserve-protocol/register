import { useEffect, useRef, useState, type Ref } from 'react'

import {
  EllipsisVertical,
  Languages,
  Menu,
  Moon,
  Search,
  X,
} from 'lucide-react'

import { Button } from '@/components/button'

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/dialog'
import { SearchField } from '@/components/design-system-v1/search-field'

import { CopyableValue } from '@/components/design-system-v1/copyable-value'

import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from '@/components/design-system-v1/drawer'

import {
  MobileGlobalHeader,
  MobileUtilityPanel,
} from '@/components/design-system-v1/mobile-global-header'

import { v1Typography } from '@/components/design-system-v1/typography'

import { ChainBadgedLogo } from '@/components/entity-identity'

import { IconButton } from '@/components/icon-button'

import ChainLogo from '@/components/icons/ChainLogo'

import RBrand from '@/components/icons/RBrand'

import Reserve from '@/components/icons/Reserve'

import TokenLogo from '@/components/token-logo'

import {
  GlobalNavigation,
  GlobalNavigationMenu,
  ProductNavigationMobileIdentityTrigger,
  productNavigationDrawerRowRecipe,
  type NavigationDestination,
} from '@/components/design-system-v1/navigation'

import { ChainId } from '@/utils/chains'
import { v1LayoutRecipes } from '@/components/ui/v1-layout-recipes'

import { cn } from '@/lib/utils'
import { MobileProductControls } from './mobile-product-controls'

import {
  DTF_FIXTURES,
  GLOBAL_DESTINATIONS,
  GLOBAL_OVERFLOW,
  MOBILE_GLOBAL_GROUPS,
  MOBILE_UTILITY_MESSAGES,
  type DtfFixture,
} from './navigation-review-fixtures'

import {
  DesktopProductNavigation,
  MobileProductNavigationActions,
  MobileProductNavigationPanel,
} from './product-navigation-patterns'

type ThemeControls = {
  theme: 'light' | 'dark'
  onThemeChange: (theme: string) => void
}

export const MobileGlobalNavigationSpecimen = (
  themeControls: ThemeControls
) => {
  const [open, setOpen] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)
  const navigationTriggerRef = useRef<HTMLButtonElement | null>(null)
  const shouldRestoreFocusRef = useRef(false)

  useEffect(() => {
    if (open) {
      closeRef.current?.focus()
      const dismissWithEscape = (event: KeyboardEvent) => {
        if (event.key !== 'Escape') return
        shouldRestoreFocusRef.current = true
        setOpen(false)
      }
      document.addEventListener('keydown', dismissWithEscape)
      return () => document.removeEventListener('keydown', dismissWithEscape)
    }

    if (shouldRestoreFocusRef.current) {
      navigationTriggerRef.current?.focus()
      shouldRestoreFocusRef.current = false
    }
    return undefined
  }, [open])

  const closeNavigation = () => {
    shouldRestoreFocusRef.current = true
    setOpen(false)
  }

  return (
    <div className="space-y-4" data-testid="mobile-global-navigation-specimen">
      <PhoneFrame label="Default · disconnected">
        <div
          className={cn(
            'overflow-hidden bg-secondary has-[[role=region]]:box-content has-[[role=region]]:min-h-dvh',
            open ? 'h-[560px]' : 'pb-0.5'
          )}
          data-testid="mobile-global-preview"
        >
          {open ? (
            <GlobalNavigationMenu
              brand={<Brand />}
              currentId="discover"
              groups={MOBILE_GLOBAL_GROUPS}
              label="Global mobile navigation"
              trailing={
                <IconButton
                  ref={closeRef}
                  label="Close global navigation"
                  icon={<X aria-hidden="true" />}
                  onClick={closeNavigation}
                  tone="quiet"
                />
              }
            />
          ) : (
            <MobileHeaderCandidate
              {...themeControls}
              navigationExpanded={open}
              navigationLabel="Open global navigation"
              navigationRef={(node) => {
                if (node) navigationTriggerRef.current = node
              }}
              onNavigationClick={() => setOpen(true)}
            />
          )}
        </div>
      </PhoneFrame>

      <div className="space-y-5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          State and surface checks
        </p>
        <figure className="mx-auto max-w-[390px]">
          <figcaption className="mb-2 text-xs font-medium text-muted-foreground">
            Connected account
          </figcaption>
          <div className="overflow-hidden border border-border bg-secondary has-[[role=region]]:box-content has-[[role=region]]:min-h-dvh">
            <MobileHeaderCandidate
              {...themeControls}
              connected
              data-testid="mobile-header-connected-state"
              navigationLabel="Open global navigation (connected state)"
            />
          </div>
        </figure>
        <figure className="mx-auto max-w-[390px]">
          <figcaption className="mb-2 text-xs font-medium text-muted-foreground">
            Transparent landing surface
          </figcaption>
          <div className="overflow-hidden border border-border bg-primary/5 has-[[role=region]]:box-content has-[[role=region]]:min-h-dvh">
            <MobileHeaderCandidate
              {...themeControls}
              data-testid="mobile-header-transparent-state"
              navigationLabel="Open global navigation (transparent state)"
              surface="transparent"
            />
          </div>
        </figure>
        <figure className="mx-auto max-w-[360px]">
          <figcaption className="mb-2 text-xs font-medium text-muted-foreground">
            360px square-mark compression check
          </figcaption>
          <div
            className="overflow-hidden border border-border bg-card has-[[role=region]]:box-content has-[[role=region]]:min-h-dvh"
            data-testid="mobile-header-narrow-state"
          >
            <MobileHeaderCandidate
              {...themeControls}
              connected
              navigationLabel="Open global navigation (narrow state)"
            />
          </div>
        </figure>
        <figure className="mx-auto max-w-[320px]">
          <figcaption className="mb-2 text-xs font-medium text-muted-foreground">
            320px lower-bound pressure check
          </figcaption>
          <div
            className="overflow-hidden border border-border bg-card has-[[role=region]]:box-content has-[[role=region]]:min-h-dvh"
            data-testid="mobile-header-compact-brand-state"
          >
            <MobileHeaderCandidate
              {...themeControls}
              connected
              navigationLabel="Open global navigation (compact brand state)"
            />
          </div>
        </figure>
      </div>
    </div>
  )
}

export const MobileHeaderCandidate = ({
  theme,
  onThemeChange,
  connected = false,
  navigationExpanded = false,
  navigationLabel,
  navigationRef,
  onNavigationClick,
  surface = 'default',
  ...props
}: {
  connected?: boolean
  navigationExpanded?: boolean
  navigationLabel: string
  navigationRef?: Ref<HTMLButtonElement>
  onNavigationClick?: () => void
  surface?: 'default' | 'transparent'
} & ThemeControls &
  React.HTMLAttributes<HTMLElement>) => {
  const [locale, setLocale] = useState<'en' | 'es' | 'ko' | 'zh'>('en')
  const [searchOpen, setSearchOpen] = useState(false)
  const utilitiesRef = useRef<HTMLDivElement>(null)

  return (
    <>
      <MobileGlobalHeader
        {...props}
        account={
          connected ? (
            <ConnectedAccountControl displayAddress="0x71…2A6C" />
          ) : (
            <Button size="compact" tone="primary">
              Connect
            </Button>
          )
        }
        brand={<MobileBrand connected={connected} />}
        navigation={
          <IconButton
            ref={navigationRef}
            aria-expanded={navigationExpanded}
            label={navigationLabel}
            icon={<Menu aria-hidden="true" />}
            onClick={onNavigationClick}
            size="compact"
            tone="secondary"
          />
        }
        surface={surface}
        utilities={
          <div ref={utilitiesRef} className="contents">
            <MobileUtilityPanel
              language={locale}
              messages={MOBILE_UTILITY_MESSAGES}
              onLanguageChange={setLocale}
              onSearch={() => setSearchOpen(true)}
              onThemeChange={onThemeChange}
              theme={theme}
            />
          </div>
        }
      />
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            utilitiesRef.current?.querySelector('button')?.focus()
          }}
        >
          <DialogTitle>Search assets</DialogTitle>
          <DialogDescription>
            Search by name or token address.
          </DialogDescription>
          <SearchField aria-label="Search assets" />
        </DialogContent>
      </Dialog>
    </>
  )
}

type MobileProductPanel = 'pages' | 'switcher' | null

export const MobileProductNavigationSpecimen = ({
  controlsSize = 'compact',
}: {
  controlsSize?: 'compact' | 'default'
}) => {
  const [selectedDtfId, setSelectedDtfId] = useState(DTF_FIXTURES[0].id)
  const [activePanel, setActivePanel] = useState<MobileProductPanel>(null)
  const [drawerContainer, setDrawerContainer] = useState<HTMLDivElement | null>(
    null
  )
  const lastDrawerTriggerRef = useRef<HTMLButtonElement | null>(null)
  const selectedDtf =
    DTF_FIXTURES.find((dtf) => dtf.id === selectedDtfId) ?? DTF_FIXTURES[0]
  const isSwitcherOpen = activePanel === 'switcher'
  const isPagesOpen = activePanel === 'pages'

  const handleDtfSelect = (destination: NavigationDestination) => {
    setSelectedDtfId(destination.id)
    setActivePanel(null)
  }

  return (
    <Drawer
      open={Boolean(activePanel)}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) setActivePanel(null)
      }}
    >
      <PhoneFrame label="DTF navigation · detached identity + page cluster">
        <div
          ref={setDrawerContainer}
          className={cn(
            'relative overflow-hidden bg-secondary',
            activePanel ? 'h-[560px]' : 'h-[176px]'
          )}
          data-testid="mobile-product-navigation-specimen"
        >
          {controlsSize === 'default' ? (
            <MobileProductControls
              className="absolute inset-x-2 bottom-2 z-30"
              product={selectedDtf}
              pagesOpen={isPagesOpen}
              switcherOpen={isSwitcherOpen}
              onOpenPages={(trigger) => {
                lastDrawerTriggerRef.current = trigger
                setActivePanel('pages')
              }}
              onOpenSwitcher={(trigger) => {
                lastDrawerTriggerRef.current = trigger
                setActivePanel('switcher')
              }}
            />
          ) : (
            <div className="absolute inset-x-2 bottom-2 z-30 flex items-center justify-between gap-2">
              <DrawerTrigger asChild>
                <ProductNavigationMobileIdentityTrigger
                  label={`Switch DTF, current ${selectedDtf.symbol}`}
                  mark={
                    <TokenLogo
                      address={selectedDtf.address}
                      alt=""
                      chain={selectedDtf.chain}
                      data-testid="mobile-product-switcher-token-logo"
                      size="xl"
                      src={selectedDtf.src}
                      symbol={selectedDtf.symbol}
                    />
                  }
                  onClick={(event) => {
                    lastDrawerTriggerRef.current = event.currentTarget
                    setActivePanel('switcher')
                  }}
                  open={isSwitcherOpen}
                />
              </DrawerTrigger>

              <MobileProductNavigationActions
                navigation={
                  <DrawerTrigger asChild>
                    <IconButton
                      aria-expanded={isPagesOpen}
                      label={`Open ${selectedDtf.symbol} page navigation`}
                      icon={<EllipsisVertical aria-hidden="true" />}
                      onClick={(event) => {
                        lastDrawerTriggerRef.current = event.currentTarget
                        setActivePanel('pages')
                      }}
                    />
                  </DrawerTrigger>
                }
              />
            </div>
          )}
        </div>
      </PhoneFrame>

      <DrawerContent
        aria-describedby={undefined}
        aria-label={
          isSwitcherOpen ? 'Switch DTF' : `${selectedDtf.symbol} pages`
        }
        data-slot="mobile-navigation-bottom-drawer"
        onCloseAutoFocus={(event) => {
          event.preventDefault()
          lastDrawerTriggerRef.current?.focus()
        }}
        placement="contained-bottom"
        portalContainer={drawerContainer}
      >
        <MobileProductNavigationPanel
          product={selectedDtf}
          isSwitcherOpen={isSwitcherOpen}
          onDtfSelect={handleDtfSelect}
          onPageSelect={() => setActivePanel(null)}
          supplementary={<TokenAddresses product={selectedDtf} />}
        />
      </DrawerContent>
    </Drawer>
  )
}

export const DesktopShell = ({
  showProductNavigation,
  home = false,
}: {
  showProductNavigation: boolean
  home?: boolean
}) => {
  const shellRef = useRef<HTMLDivElement>(null)
  const [shellWidth, setShellWidth] = useState(1400)
  const [isOverflowOpen, setIsOverflowOpen] = useState(false)
  const [selectedDtfId, setSelectedDtfId] = useState(DTF_FIXTURES[0].id)
  const selectedDtf =
    DTF_FIXTURES.find((dtf) => dtf.id === selectedDtfId) ?? DTF_FIXTURES[0]
  const visibleDestinationCount =
    shellWidth >= 1200 ? 4 : shellWidth >= 1024 ? 2 : 1

  useEffect(() => {
    if (!shellRef.current) return
    const observer = new ResizeObserver(([entry]) => {
      setShellWidth(entry.contentRect.width)
    })
    observer.observe(shellRef.current)
    return () => observer.disconnect()
  }, [])

  const handleDtfSelect = (destination: NavigationDestination) => {
    setSelectedDtfId(destination.id)
  }

  return (
    <div
      ref={shellRef}
      className="w-full min-w-0 bg-background"
      data-testid="coordinated-navigation-desktop"
    >
      <div
        className={cn(
          'flex w-full flex-col bg-secondary',
          v1LayoutRecipes.seam.major
        )}
      >
        <GlobalNavigation
          actions={<GlobalActions />}
          brand={<Brand />}
          currentId={home ? undefined : 'discover'}
          destinations={GLOBAL_DESTINATIONS.slice(0, visibleDestinationCount)}
          label={home ? 'Home screen global navigation' : 'Global navigation'}
          onOverflowOpenChange={setIsOverflowOpen}
          overflowAriaLabel="Additional destinations"
          overflowDestinations={[
            ...GLOBAL_DESTINATIONS.slice(visibleDestinationCount),
            ...GLOBAL_OVERFLOW,
          ]}
          overflowLabel="More"
          overflowOpen={isOverflowOpen}
        />
        {!home && showProductNavigation && (
          <div className="relative grid min-h-[640px] grid-cols-[72px_minmax(0,1fr)] bg-secondary">
            <div className="relative z-10 w-[72px]">
              <DesktopProductNavigation
                product={selectedDtf}
                label={`${selectedDtf.symbol} on ${getChainName(selectedDtf.chain)} navigation`}
                onDtfSelect={handleDtfSelect}
                className="absolute inset-y-0 left-0 [&>nav]:shadow-sm"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export const Brand = () => (
  <a
    href="#navigation-review"
    aria-label="Reserve home"
    className="flex min-h-10 items-center text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
  >
    <Reserve className="h-5 w-auto" />
  </a>
)

const MobileBrand = ({ connected }: { connected: boolean }) => (
  <a
    href="#navigation-review"
    aria-label="Reserve home"
    className="flex min-h-10 items-center text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
  >
    <Reserve
      className={cn(
        'hidden h-5 w-auto',
        connected
          ? '[@container(min-width:352px)]:block'
          : '[@container(min-width:320px)]:block'
      )}
      data-mobile-header-brand="wordmark"
      data-testid="mobile-brand-wordmark"
    />
    <RBrand
      className={cn(
        'block size-5',
        connected
          ? '[@container(min-width:352px)]:hidden'
          : '[@container(min-width:320px)]:hidden'
      )}
      data-mobile-header-brand="mark"
      data-testid="mobile-brand-mark"
    />
  </a>
)

const ConnectedAccountControl = ({
  displayAddress = '0x71F9…2A6C',
}: {
  displayAddress?: string
}) => (
  <Button
    aria-label="Connected wallet 0x71F9…2A6C"
    className="gap-1 [&>svg]:size-3.5"
    leadingIcon={<ChainLogo aria-hidden="true" chain={ChainId.Mainnet} />}
    size="compact"
    tone="secondary"
  >
    {displayAddress}
  </Button>
)

export const GlobalActions = ({
  connected = false,
}: {
  connected?: boolean
}) => (
  <div
    className="flex h-10 items-center gap-1 rounded-full bg-card p-1 ring-1 ring-inset ring-border"
    data-account-state={connected ? 'connected' : 'disconnected'}
    data-testid="global-application-controls"
  >
    <IconButton
      label="Search"
      icon={<Search aria-hidden="true" />}
      tone="secondary"
    />
    <IconButton
      label="Change theme"
      icon={<Moon aria-hidden="true" />}
      tone="secondary"
    />
    <IconButton
      label="Select language"
      icon={<Languages aria-hidden="true" />}
      tone="secondary"
    />
    {connected ? (
      <ConnectedAccountControl />
    ) : (
      <Button size="compact" tone="primary">
        Connect
      </Button>
    )}
  </div>
)

const PhoneFrame = ({
  children,
  label,
}: {
  children: React.ReactNode
  label: string
}) => (
  <figure className="mx-auto w-full max-w-[390px]">
    <figcaption className="mb-2 text-xs font-medium text-muted-foreground">
      {label}
    </figcaption>
    <div className="overflow-hidden border border-border bg-card">
      {children}
    </div>
  </figure>
)

const TokenAddressRow = ({
  address,
  chain,
  product,
  relationship,
  showProductIdentity,
}: {
  address: string
  chain: number
  product: DtfFixture
  relationship?: 'Native' | 'Bridged'
  showProductIdentity: boolean
}) => (
  <div
    className={cn(
      'flex min-w-0 items-center text-foreground ring-border',
      productNavigationDrawerRowRecipe
    )}
    data-testid="product-token-contract"
  >
    <span className="flex size-6 shrink-0 items-center justify-center">
      {showProductIdentity ? (
        <ChainBadgedLogo
          address={address}
          alt=""
          chain={chain}
          size="md"
          src={product.src}
          symbol={product.symbol}
        />
      ) : (
        <ChainLogo
          aria-hidden="true"
          chain={chain}
          data-testid="product-token-contract-chain"
          height={16}
          width={16}
        />
      )}
    </span>
    <span className={cn('min-w-0 truncate', v1Typography.label)}>
      {showProductIdentity ? product.symbol : getChainName(chain)}
      <span
        className={cn('text-supporting-foreground', v1Typography.supporting)}
      >
        {showProductIdentity
          ? ` on ${getChainName(chain)}`
          : ` · ${relationship}`}
      </span>
    </span>
    <CopyableValue
      className="ml-auto shrink-0"
      value={address}
      valueClassName="text-foreground"
    />
  </div>
)

export const TokenAddresses = ({ product }: { product: DtfFixture }) => {
  const contracts = [
    {
      address: product.address,
      chain: product.chain,
      relationship: 'Native' as const,
    },
    ...(product.bridgedAddresses?.map((contract) => ({
      ...contract,
      relationship: 'Bridged' as const,
    })) ?? []),
  ]

  if (contracts.length === 1) {
    return (
      <TokenAddressRow
        address={product.address}
        chain={product.chain}
        product={product}
        showProductIdentity
      />
    )
  }

  const labelId = `${product.id}-token-addresses-label`

  return (
    <section aria-labelledby={labelId} data-testid="product-token-contracts">
      <h3
        className={cn(
          'px-4 pb-2 text-supporting-foreground',
          v1Typography.label
        )}
        id={labelId}
      >
        {product.symbol} token addresses
      </h3>
      <div className="space-y-1">
        {contracts.map((contract) => (
          <TokenAddressRow
            key={`${contract.chain}-${contract.address}`}
            address={contract.address}
            chain={contract.chain}
            product={product}
            relationship={contract.relationship}
            showProductIdentity={false}
          />
        ))}
      </div>
    </section>
  )
}

const getChainName = (chain: number) => {
  if (chain === ChainId.BSC) return 'BNB Chain'
  if (chain === ChainId.Base) return 'Base'
  return 'Ethereum'
}
