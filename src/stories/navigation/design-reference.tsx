import { useEffect, useRef, useState, type Ref } from 'react'

import {
  EllipsisVertical,
  Languages,
  Menu,
  MessageCircle,
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
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
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
  ProductNavigation,
  ProductNavigationIdentityTrigger,
  ProductNavigationMobileIdentityTrigger,
  productNavigationDrawerRowRecipe,
  type NavigationDestination,
} from '@/components/design-system-v1/navigation'

import { ChainId } from '@/utils/chains'

import { cn } from '@/lib/utils'

import {
  DTF_FIXTURES,
  GLOBAL_DESTINATIONS,
  GLOBAL_OVERFLOW,
  MOBILE_GLOBAL_GROUPS,
  MOBILE_UTILITY_MESSAGES,
  PRODUCT_DESTINATIONS,
  getDtfSwitcherDestinations,
  type DtfFixture,
} from './navigation-review-fixtures'

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
        <div className="h-[560px] overflow-hidden bg-secondary">
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
            <>
              <MobileHeaderCandidate
                {...themeControls}
                navigationExpanded={open}
                navigationLabel="Open global navigation"
                navigationRef={(node) => {
                  if (node) navigationTriggerRef.current = node
                }}
                onNavigationClick={() => setOpen(true)}
              />
              <div className="space-y-4 p-4">
                <p className="text-sm font-light leading-5 text-supporting-foreground">
                  Application page
                </p>
                <h3 className="text-xl font-medium">Discover DTFs</h3>
                <div className="grid gap-2 pt-4">
                  <div className="h-24 bg-card" />
                  <div className="h-24 bg-card" />
                </div>
              </div>
            </>
          )}
        </div>
      </PhoneFrame>

      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          State and surface checks
        </p>
        <div className="mx-auto max-w-[390px] overflow-hidden border border-border bg-secondary">
          <p className="px-4 pt-3 text-sm font-light leading-5 text-supporting-foreground">
            Connected account
          </p>
          <MobileHeaderCandidate
            {...themeControls}
            connected
            data-testid="mobile-header-connected-state"
            navigationLabel="Open global navigation (connected state)"
          />
        </div>
        <div className="mx-auto max-w-[390px] overflow-hidden border border-border bg-primary/5">
          <p className="px-4 pt-3 text-sm font-light leading-5 text-supporting-foreground">
            Transparent landing surface
          </p>
          <MobileHeaderCandidate
            {...themeControls}
            data-testid="mobile-header-transparent-state"
            navigationLabel="Open global navigation (transparent state)"
            surface="transparent"
          />
        </div>
        <div
          className="mx-auto max-w-[360px] overflow-hidden border border-border bg-card"
          data-testid="mobile-header-narrow-state"
        >
          <p className="px-4 pt-3 text-sm font-light leading-5 text-supporting-foreground">
            360px square-mark compression check
          </p>
          <MobileHeaderCandidate
            {...themeControls}
            connected
            navigationLabel="Open global navigation (narrow state)"
          />
        </div>
        <div
          className="mx-auto max-w-[320px] overflow-hidden border border-border bg-card"
          data-testid="mobile-header-compact-brand-state"
        >
          <p className="px-4 pt-3 text-sm font-light leading-5 text-supporting-foreground">
            320px lower-bound pressure check
          </p>
          <MobileHeaderCandidate
            {...themeControls}
            connected
            navigationLabel="Open global navigation (compact brand state)"
          />
        </div>
      </div>
    </div>
  )
}

const MobileHeaderCandidate = ({
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
        brand={<MobileBrand />}
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
          <MobileUtilityPanel
            language={locale}
            messages={MOBILE_UTILITY_MESSAGES}
            onLanguageChange={setLocale}
            onSearch={() => setSearchOpen(true)}
            onThemeChange={onThemeChange}
            theme={theme}
          />
        }
      />
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent>
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

const MobileMenuHeader = ({ label }: { label: string }) => (
  <DrawerHeader
    action={
      <DrawerClose asChild>
        <IconButton
          label={`Close ${label}`}
          icon={<X aria-hidden="true" />}
          size="compact"
          tone="secondary"
        />
      </DrawerClose>
    }
    data-slot="mobile-navigation-drawer-header"
  >
    <DrawerTitle
      className={cn(
        'flex min-h-8 min-w-0 items-center truncate',
        v1Typography.itemTitle
      )}
      data-slot="mobile-navigation-drawer-title"
    >
      {label}
    </DrawerTitle>
  </DrawerHeader>
)

export const MobileProductNavigationSpecimen = () => {
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
          className="relative h-[560px] overflow-hidden bg-secondary"
          data-testid="mobile-product-navigation-specimen"
        >
          <div className="space-y-5 p-4">
            <div>
              <p className="text-sm font-light leading-5 text-supporting-foreground">
                {selectedDtf.name}
              </p>
              <h3 className="mt-1 text-xl font-medium">Governance</h3>
            </div>
            <div className="min-h-52 bg-card p-4">
              <p className="text-sm font-medium">Proposal activity</p>
            </div>
          </div>

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

            <div className="flex items-center gap-2 rounded-full bg-card/90 p-2 shadow-lg backdrop-blur-sm">
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
              <Button size="compact">Trade</Button>
              <IconButton
                label="Ask Reserve AI"
                icon={<MessageCircle aria-hidden="true" />}
              />
            </div>
          </div>
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
        <ProductNavigation
          currentId={isPagesOpen ? 'overview' : undefined}
          destinations={
            isSwitcherOpen
              ? getDtfSwitcherDestinations(selectedDtf.id)
              : PRODUCT_DESTINATIONS
          }
          identity={
            <MobileMenuHeader
              label={
                isSwitcherOpen ? 'Switch DTF' : `${selectedDtf.symbol} pages`
              }
            />
          }
          label={
            isSwitcherOpen
              ? 'Switch DTF'
              : `${selectedDtf.symbol} page navigation`
          }
          onDestinationSelect={
            isSwitcherOpen ? handleDtfSelect : () => setActivePanel(null)
          }
          overflowFade={isSwitcherOpen}
          presentation="drawer"
          showDestinationChevron={!isSwitcherOpen}
          supplementary={
            isSwitcherOpen ? undefined : (
              <TokenAddresses product={selectedDtf} />
            )
          }
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
  const [isOverflowOpen, setIsOverflowOpen] = useState(false)
  const [isProductExpanded, setIsProductExpanded] = useState(false)
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false)
  const [selectedDtfId, setSelectedDtfId] = useState(DTF_FIXTURES[0].id)
  const selectedDtf =
    DTF_FIXTURES.find((dtf) => dtf.id === selectedDtfId) ?? DTF_FIXTURES[0]
  const isRailExpanded = isProductExpanded || isSwitcherOpen

  const handleDtfSelect = (destination: NavigationDestination) => {
    setSelectedDtfId(destination.id)
    setIsSwitcherOpen(false)
  }

  const dismissProductRail = () => {
    setIsProductExpanded(false)
    setIsSwitcherOpen(false)
  }

  return (
    <div
      className="overflow-x-auto border border-border bg-background"
      data-testid="coordinated-navigation-desktop"
    >
      <div className="min-w-[1200px]">
        <GlobalNavigation
          actions={<GlobalActions />}
          brand={<Brand />}
          currentId={home ? undefined : 'discover'}
          destinations={GLOBAL_DESTINATIONS}
          label={home ? 'Home screen global navigation' : 'Global navigation'}
          onOverflowOpenChange={setIsOverflowOpen}
          overflowAriaLabel="Additional destinations"
          overflowDestinations={GLOBAL_OVERFLOW}
          overflowLabel="More"
          overflowOpen={isOverflowOpen}
        />
        {!home && (
          <div
            className={cn(
              'relative min-h-[480px] bg-secondary',
              showProductNavigation && 'grid grid-cols-[72px_minmax(0,1fr)]'
            )}
          >
            {showProductNavigation && (
              <div className="relative z-10 w-[72px]">
                <div
                  className="absolute inset-y-0 left-0 shadow-sm"
                  data-testid="product-navigation-rail-shell"
                  onMouseEnter={() => setIsProductExpanded(true)}
                  onMouseLeave={dismissProductRail}
                  onFocusCapture={() => setIsProductExpanded(true)}
                  onBlurCapture={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget)) {
                      dismissProductRail()
                    }
                  }}
                >
                  <ProductNavigation
                    currentId={isSwitcherOpen ? undefined : 'overview'}
                    destinations={
                      isSwitcherOpen
                        ? getDtfSwitcherDestinations(selectedDtf.id)
                        : PRODUCT_DESTINATIONS
                    }
                    expanded={isRailExpanded}
                    identity={
                      <ProductIdentity
                        expanded={isRailExpanded}
                        onToggle={() =>
                          setIsSwitcherOpen((current) => !current)
                        }
                        open={isSwitcherOpen}
                        product={selectedDtf}
                      />
                    }
                    label={
                      isSwitcherOpen
                        ? 'Switch DTF'
                        : `${selectedDtf.symbol} on ${getChainName(selectedDtf.chain)} navigation`
                    }
                    onDestinationSelect={
                      isSwitcherOpen ? handleDtfSelect : undefined
                    }
                    overflowFade={isSwitcherOpen}
                    showDestinationChevron={!isSwitcherOpen}
                  />
                </div>
              </div>
            )}
            <OverviewContext product={selectedDtf} />
          </div>
        )}
      </div>
    </div>
  )
}

const Brand = () => (
  <a
    href="#navigation-review"
    aria-label="Reserve home"
    className="flex min-h-10 items-center text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
  >
    <Reserve className="h-5 w-auto" />
  </a>
)

const MobileBrand = () => (
  <a
    href="#navigation-review"
    aria-label="Reserve home"
    className="flex min-h-10 items-center text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
  >
    <Reserve
      className="hidden h-5 w-auto [@container(min-width:352px)]:block"
      data-mobile-header-brand="wordmark"
      data-testid="mobile-brand-wordmark"
    />
    <RBrand
      className="block size-5 [@container(min-width:352px)]:hidden"
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

const GlobalActions = ({ connected = false }: { connected?: boolean }) => (
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

const ProductIdentity = ({
  expanded = false,
  onToggle = () => undefined,
  open = false,
  presentation = 'rail',
  product = DTF_FIXTURES[0],
}: {
  expanded?: boolean
  onToggle?: () => void
  open?: boolean
  presentation?: 'rail' | 'menu'
  product?: DtfFixture
}) => (
  <ProductNavigationIdentityTrigger
    expanded={expanded}
    label={`Switch DTF, current ${product.symbol}`}
    onClick={onToggle}
    open={open}
    presentation={presentation}
    mark={
      presentation === 'rail' && !expanded ? (
        <TokenLogo
          address={product.address}
          alt=""
          chain={product.chain}
          data-testid="collapsed-product-identity-logo"
          size="lg"
          src={product.src}
          symbol={product.symbol}
        />
      ) : (
        <ChainBadgedLogo
          src={product.src}
          chain={product.chain}
          size={presentation === 'rail' ? 'lg' : 'md'}
          alt=""
        />
      )
    }
    name={product.symbol}
  />
)

const OverviewContext = ({ product }: { product: DtfFixture }) => (
  <main className="min-w-0 p-6">
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-light leading-5 text-supporting-foreground">
            {product.name}
          </p>
          <h3 className="mt-1 text-2xl font-medium">Overview</h3>
        </div>
        <Button size="compact">Trade {product.symbol}</Button>
      </div>
      <div className="grid gap-px bg-border lg:grid-cols-[minmax(0,3fr)_minmax(16rem,2fr)]">
        <div className="min-h-64 bg-card p-6">
          <p className="text-sm font-medium">Performance</p>
          <p className="mt-6 text-3xl font-medium tabular-nums">$14.82</p>
          <div className="mt-8 h-24 border-b border-l border-border">
            <div className="mt-12 h-px w-full -rotate-2 bg-primary" />
          </div>
        </div>
        <div className="bg-card p-6">
          <p className="text-sm font-medium">Index details</p>
          <dl className="mt-6 space-y-4 text-sm">
            <Metric label="Market cap" value="$18.4M" />
            <Metric label="Assets" value="20" />
            <Metric label="Chain" value={getChainName(product.chain)} />
          </dl>
        </div>
      </div>
    </div>
  </main>
)

const Metric = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between gap-4">
    <dt className="font-light text-supporting-foreground">{label}</dt>
    <dd className="font-medium tabular-nums">{value}</dd>
  </div>
)

const PhoneFrame = ({
  children,
  label,
}: {
  children: React.ReactNode
  label: string
}) => (
  <article className="overflow-hidden border border-border bg-card">
    <p className="border-b border-border px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
      {label}
    </p>
    <div className="mx-auto max-w-[390px] border-x border-border">
      {children}
    </div>
  </article>
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

const TokenAddresses = ({ product }: { product: DtfFixture }) => {
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
