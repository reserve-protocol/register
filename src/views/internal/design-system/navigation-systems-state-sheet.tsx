import { useEffect, useRef, useState, type Ref } from 'react'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
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
import { searchMenuOpenAtom } from '@/components/command-menu'
import {
  setThemeModeAtom,
  themeModeAtom,
} from '@/components/dark-mode-toggle/atoms'
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
  GlobalNavigationItem,
  GlobalNavigationMenu,
  ProductNavigation,
  ProductNavigationIdentityTrigger,
  ProductNavigationItem,
  ProductNavigationMobileIdentityTrigger,
  productNavigationDrawerRowRecipe,
  type NavigationDestination,
} from '@/components/design-system-v1/navigation'
import { ChainId } from '@/utils/chains'
import { localeAtom } from '@/i18n'
import { cn } from '@/lib/utils'

import {
  DTF_FIXTURES,
  DTF_SWITCHER_DESTINATIONS,
  GLOBAL_DESTINATIONS,
  GLOBAL_OVERFLOW,
  MOBILE_GLOBAL_GROUPS,
  MOBILE_UTILITY_MESSAGES,
  PRODUCT_DESTINATIONS,
  getDtfSwitcherDestinations,
  type DtfFixture,
} from './navigation-review-fixtures'

export interface NavigationSystemsStateSheetProps {
  focus?: 'global' | 'product'
}

const NavigationSystemsStateSheet = ({
  focus = 'product',
}: NavigationSystemsStateSheetProps) => (
  <section
    id="navigation-review"
    data-testid="navigation-systems-state-sheet"
    className="space-y-6"
    aria-labelledby="navigation-systems-title"
  >
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <h2 id="navigation-systems-title" className="text-xl font-medium">
          Coordinated navigation candidate
        </h2>
        <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          Global + product
        </span>
      </div>
      <p className="mt-1 max-w-3xl text-sm font-light leading-5 text-supporting-foreground">
        Two separate navigation systems shown in the same application context.
        Global navigation stays quiet and route-level; the Index DTF rail owns
        object identity and local destinations. Neither candidate inherits
        unreviewed decisions from the other.
      </p>
    </div>

    <NavigationBuildingBlocks />
    {focus === 'global' ? <GlobalNavigationReview /> : <CoordinatedReview />}
  </section>
)

const NavigationBuildingBlocks = () => (
  <div className="space-y-4">
    <ReviewLabel
      title="The pieces that build the navigation"
      copy="These are the actual reusable route and identity components used in the complete desktop and constrained-screen compositions below—not lookalike specimens."
    />
    <div className="grid gap-4 xl:grid-cols-2">
      <PrimitiveSpecimen
        title="Top-level global route"
        copy="Icon and label identify a destination. The selected route uses the shared selected surface instead of an underline."
      >
        <div className="flex flex-wrap items-center gap-2 bg-card p-2">
          <GlobalNavigationItem
            currentId="discover"
            destination={GLOBAL_DESTINATIONS[0]}
          />
          <GlobalNavigationItem destination={GLOBAL_DESTINATIONS[2]} />
        </div>
      </PrimitiveSpecimen>

      <PrimitiveSpecimen
        title="Shared global destination row"
        copy="The More popup and constrained-screen global menu consume one single-line destination owner. Mobile uses the outlined 48px drawer density shared with DTF page navigation; desktop More keeps the outlined pill treatment and the same icon-label-trailing anatomy at the established 40px popup density. Group headings, rather than per-row subtitles, provide mobile context. Both surfaces render the complete current destination inventory."
      >
        <div className="max-w-sm space-y-1 rounded-lg border border-border bg-popover p-2 shadow-sm">
          <GlobalNavigationItem
            destination={GLOBAL_OVERFLOW[0]}
            presentation="menu"
          />
          <GlobalNavigationItem
            destination={GLOBAL_OVERFLOW[2]}
            presentation="menu"
          />
        </div>
      </PrimitiveSpecimen>

      <PrimitiveSpecimen
        title="Product identity axis"
        copy="Desktop identity uses the route row's alignment language: a plain DTF logo inside an outlined 40px collapsed trigger, then a badged logo, label, and far-edge chevron when expanded. Mobile separates switching from page navigation—the detached 82 × 48px pill uses an 8px outer inset and a 2px relationship gap between its 32px logo and ghost switch cue."
      >
        <div className="flex flex-wrap items-start gap-4">
          <div className="w-[72px] bg-card p-4">
            <ProductIdentity />
          </div>
          <div className="w-64 bg-card p-4">
            <ProductIdentity expanded />
          </div>
          <div className="min-w-56 rounded-lg border border-border bg-popover p-3 shadow-sm">
            <ProductIdentity presentation="menu" />
          </div>
          <div className="bg-secondary p-4">
            <ProductNavigationMobileIdentityTrigger
              label="Switch DTF, current CMC20"
              mark={
                <TokenLogo
                  address={DTF_FIXTURES[0].address}
                  alt=""
                  chain={DTF_FIXTURES[0].chain}
                  size="xl"
                  src={DTF_FIXTURES[0].src}
                  symbol={DTF_FIXTURES[0].symbol}
                />
              }
            />
          </div>
        </div>
      </PrimitiveSpecimen>

      <PrimitiveSpecimen
        title="Product destination row"
        copy="The collapsed rail uses one 40px circle. When expanded, that becomes a 40px outer pill containing a 36px icon circle on the same fixed axis, with an 8px optical circle-to-label gap. Public DTF state adds either an informational activity dot or a time-sensitive notable dot without changing row geometry."
      >
        <div className="flex flex-wrap items-start gap-4">
          <div className="w-[72px] bg-card p-4">
            <ProductNavigationItem destination={PRODUCT_DESTINATIONS[2]} />
          </div>
          <div className="w-64 bg-card p-4">
            <ProductNavigationItem
              destination={PRODUCT_DESTINATIONS[2]}
              expanded
            />
          </div>
          <div className="min-w-56 rounded-lg border border-border bg-popover p-2 shadow-sm">
            <ProductNavigationItem
              destination={PRODUCT_DESTINATIONS[3]}
              presentation="menu"
            />
          </div>
        </div>
      </PrimitiveSpecimen>

      <PrimitiveSpecimen
        title="DTF switcher row"
        copy="Switcher rows reuse the same navigation anatomy while replacing the route chevron with a right-aligned 30-day performance value. Financial movement keeps its accepted positive, negative, neutral, and unavailable treatments."
      >
        <div className="flex flex-wrap items-start gap-4">
          <div className="w-64 bg-card p-4">
            <ProductNavigationItem
              destination={DTF_SWITCHER_DESTINATIONS[2]}
              expanded
            />
          </div>
          <div className="min-w-56 rounded-lg border border-border bg-popover p-2 shadow-sm">
            <ProductNavigationItem
              destination={DTF_SWITCHER_DESTINATIONS[4]}
              presentation="menu"
              showDestinationChevron={false}
            />
          </div>
        </div>
      </PrimitiveSpecimen>

      <PrimitiveSpecimen
        title="Global application controls"
        copy="The common desktop cluster contains search, theme, language, and account access. A 40px toolbar shell gives its outlined 32px controls an equal 4px outer inset and 4px sibling gap. Connected account controls use the existing 14px micro mark and 4px mark-to-address relationship; constrained headers shorten the visible address further without changing its accessible identity. Conditional utilities such as the contact-team bell are not treated as permanent navigation controls."
      >
        <div className="grid gap-px bg-border">
          <ApplicationControlState label="Disconnected">
            <GlobalActions />
          </ApplicationControlState>
          <ApplicationControlState label="Connected">
            <GlobalActions connected />
          </ApplicationControlState>
        </div>
      </PrimitiveSpecimen>
    </div>
  </div>
)

const GlobalNavigationReview = () => (
  <div className="space-y-4">
    <ReviewLabel
      title="Global application navigation"
      copy="Desktop route hierarchy, grouped overflow, and constrained-screen recomposition using the same destinations."
    />
    <DesktopShell showProductNavigation={false} />
    <div className="max-w-sm border border-border bg-card">
      <GlobalNavigationMenu
        brand={<Brand />}
        currentId="discover"
        groups={MOBILE_GLOBAL_GROUPS}
        label="Global navigation"
        trailing={
          <IconButton
            label="Close navigation"
            icon={<X aria-hidden="true" />}
            tone="quiet"
          />
        }
      />
    </div>
  </div>
)

const CoordinatedReview = () => (
  <div className="space-y-8">
    <div className="space-y-4">
      <ReviewLabel
        title="Home screen · no active destination"
        copy="The application home route does not select a destination. The same global navigation remains fully interactive without implying that one of its product areas owns the page."
      />
      <HomeGlobalNavigationSpecimen />
    </div>

    <div className="space-y-4">
      <ReviewLabel
        title="Seen together · desktop"
        copy="Hover or focus the product rail to reveal labels and public activity indicators. Activate the DTF identity to replace page routes with a scrollable set of alternative DTFs and their 30-day performance—the current identity is not repeated in the list. Selecting a DTF restores the same page-navigation model."
      />
      <DesktopShell showProductNavigation />
    </div>

    <div className="space-y-4">
      <ReviewLabel
        title="Constrained screens · separate entry points"
        copy="These are deliberately separate phone specimens. The closed global header keeps the existing grouped Search, Theme, and Language utility in a header-owned composite panel: a search-field launcher opens the full search dialog, default contained Segmented Control owns theme, and a 44px language summary expands only the alternative languages inside one connected outlined disclosure. The utility surface grows in place rather than opening a second popup, and the panel shares the header's card surface in both themes. Selecting an alternative updates the summary and collapses the disclosure. The surface begins directly below the 56px header and spans the same full width. Header actions remain canonical 32px compact controls. Connected states retain the chain mark and shortened address at every tested width; the full wordmark remains at 390px, while the 360px and 320px states switch to the square mark rather than shrinking the wordmark or discarding account identity. On DTF pages, the detached logo opens the DTF switcher while the right floating cluster opens local page navigation and retains room for contextual actions. Both drawers keep the canonical 24px content axis and omit header/content dividers. The current experiment pairs a 16px item-title heading and outlined close control with matching 24px leading and trailing icon slots. Drawer rows use a visible default outline and a shared 12px leading-slot-to-label gap, with the active row reusing the established primary/30 selected-pill outline. Rows retain an 8px outer inset, 16px horizontal/12px vertical padding, a 48px height, and a 4px sibling gap. The page drawer retains the token contract as a chain-identified, copyable drawer row rather than quiet footer metadata or a nested card."
      />
      <div className="grid gap-4 xl:grid-cols-2">
        <MobileGlobalNavigationSpecimen />
        <MobileProductNavigationSpecimen />
      </div>
    </div>

    <div className="grid gap-4 lg:grid-cols-3">
      <Boundary
        title="Global owns application hierarchy"
        copy="Brand, top-level destinations, grouped resources, and application actions stay outside the DTF route model."
      />
      <Boundary
        title="Product owns object context"
        copy="DTF identity, local destinations, current route, and availability stay stable across rail and menu presentations."
      />
      <Boundary
        title="Shared foundations, separate candidates"
        copy="Both consume accepted link, icon, popup, focus, typography, color, spacing, radius, and motion rules without sharing a speculative item recipe."
      />
    </div>
  </div>
)

const HomeGlobalNavigationSpecimen = () => {
  const [isOverflowOpen, setIsOverflowOpen] = useState(false)

  return (
    <div
      className="overflow-x-auto border border-border bg-background"
      data-testid="home-global-navigation"
    >
      <div className="min-w-[1200px]">
        <GlobalNavigation
          actions={<GlobalActions />}
          brand={<Brand />}
          destinations={GLOBAL_DESTINATIONS}
          label="Home screen global navigation"
          onOverflowOpenChange={setIsOverflowOpen}
          overflowAriaLabel="Additional destinations"
          overflowDestinations={GLOBAL_OVERFLOW}
          overflowLabel="More"
          overflowOpen={isOverflowOpen}
        />
      </div>
    </div>
  )
}

const MobileGlobalNavigationSpecimen = () => {
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
            connected
            navigationLabel="Open global navigation (compact brand state)"
          />
        </div>
      </div>
    </div>
  )
}

const MobileHeaderCandidate = ({
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
} & React.HTMLAttributes<HTMLElement>) => {
  const [locale, setLocale] = useAtom(localeAtom)
  const theme = useAtomValue(themeModeAtom)
  const setTheme = useSetAtom(setThemeModeAtom)
  const setSearchOpen = useSetAtom(searchMenuOpenAtom)

  return (
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
          language={locale === 'pseudo' ? 'en' : locale}
          messages={MOBILE_UTILITY_MESSAGES}
          onLanguageChange={setLocale}
          onSearch={() => setSearchOpen(true)}
          onThemeChange={setTheme}
          theme={theme}
        />
      }
    />
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

const MobileProductNavigationSpecimen = () => {
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

const DesktopShell = ({
  showProductNavigation,
}: {
  showProductNavigation: boolean
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
          currentId="discover"
          destinations={GLOBAL_DESTINATIONS}
          label="Global navigation"
          onOverflowOpenChange={setIsOverflowOpen}
          overflowAriaLabel="Additional destinations"
          overflowDestinations={GLOBAL_OVERFLOW}
          overflowLabel="More"
          overflowOpen={isOverflowOpen}
        />
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
                      onToggle={() => setIsSwitcherOpen((current) => !current)}
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

const ApplicationControlState = ({
  children,
  label,
}: {
  children: React.ReactNode
  label: string
}) => (
  <div className="flex flex-wrap items-center justify-between gap-4 bg-card p-3">
    <p className="text-sm font-light leading-5 text-supporting-foreground">
      {label}
    </p>
    <div className="flex items-center gap-2">{children}</div>
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

const ReviewLabel = ({ title, copy }: { title: string; copy: string }) => (
  <div>
    <h3 className="text-base font-medium leading-6">{title}</h3>
    <p className="mt-1 max-w-3xl text-sm font-light leading-5 text-supporting-foreground">
      {copy}
    </p>
  </div>
)

const PrimitiveSpecimen = ({
  children,
  copy,
  title,
}: {
  children: React.ReactNode
  copy: string
  title: string
}) => (
  <article className="border border-border bg-secondary p-4">
    <p className="text-sm font-medium leading-5">{title}</p>
    <p className="mt-1 max-w-xl text-sm font-light leading-5 text-supporting-foreground">
      {copy}
    </p>
    <div className="mt-4">{children}</div>
  </article>
)

const Boundary = ({ title, copy }: { title: string; copy: string }) => (
  <div className="border border-border bg-card p-4">
    <p className="text-sm font-medium leading-5">{title}</p>
    <p className="mt-2 text-sm font-light leading-5 text-supporting-foreground">
      {copy}
    </p>
  </div>
)

export default NavigationSystemsStateSheet
