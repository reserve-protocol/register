import { Trans, useLingui } from '@lingui/react/macro'
import {
  EllipsisVertical,
  Languages,
  Menu,
  MessageCircle,
  Moon,
  Search,
  Wallet,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

import { Button } from '@/components/button'
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
  type MobileUtilityLanguage,
  type MobileUtilityTheme,
} from '@/components/design-system-v1/mobile-global-header'
import {
  GlobalNavigation,
  GlobalNavigationItem,
  GlobalNavigationMenu,
  ProductNavigation,
  ProductNavigationIdentityTrigger,
  ProductNavigationItem,
  ProductNavigationMobileIdentityTrigger,
  type NavigationDestination,
} from '@/components/design-system-v1/navigation'
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@/components/design-system-v1/segmented-control'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/design-system-v1/select'
import { v1Typography } from '@/components/design-system-v1/typography'
import { IconButton } from '@/components/icon-button'
import ChainLogo from '@/components/icons/ChainLogo'
import RBrand from '@/components/icons/RBrand'
import Reserve from '@/components/icons/Reserve'
import { ChainId } from '@/utils/chains'

import {
  DOCUMENTATION_DTF_FIXTURES,
  DocumentationDtfMark,
  type DocumentationDtfFixture,
  useDocumentationNavigationFixtures,
} from './documentation-navigation-fixtures'
import DocumentationSpecimenCanvas from './documentation-specimen-canvas'
import {
  DocumentationSpecimenCell,
  DocumentationSpecimenGrid,
} from './documentation-specimen-layout'
import { useDocumentationSpecimenState } from './use-documentation-specimen-state'

const GLOBAL_DESKTOP_SCHEMA = {
  state: {
    defaultValue: 'resting',
    values: ['resting', 'overflow'],
  },
  identity: {
    defaultValue: 'disconnected',
    values: ['disconnected', 'connected'],
  },
} as const

const GLOBAL_CONSTRAINED_SCHEMA = {
  state: {
    defaultValue: 'resting',
    values: ['resting', 'destinations', 'utilities'],
  },
  identity: GLOBAL_DESKTOP_SCHEMA.identity,
} as const

const PRODUCT_DESKTOP_SCHEMA = {
  state: {
    defaultValue: 'collapsed',
    values: ['collapsed', 'expanded', 'switcher'],
  },
  identity: {
    defaultValue: DOCUMENTATION_DTF_FIXTURES[0].id,
    values: DOCUMENTATION_DTF_FIXTURES.map(({ id }) => id),
  },
} as const

const PRODUCT_CONSTRAINED_SCHEMA = {
  state: {
    defaultValue: 'resting',
    values: ['resting', 'pages', 'switcher'],
  },
  identity: PRODUCT_DESKTOP_SCHEMA.identity,
  actionContext: {
    defaultValue: 'holder',
    values: ['holder', 'visitor', 'eligibility'],
  },
} as const

const scopeDestinations = (
  destinations: NavigationDestination[],
  hash: string
) => destinations.map((destination) => ({ ...destination, href: hash }))

const ResetPreview = ({ onReset }: { onReset: () => void }) => (
  <Button size="compact" tone="quiet" onClick={onReset}>
    <Trans>Reset preview</Trans>
  </Button>
)

const ChoiceControl = ({
  label,
  value,
  values,
  onValueChange,
}: {
  label: string
  value: string
  values: ReadonlyArray<{ label: string; value: string }>
  onValueChange: (value: string) => void
}) => (
  <SegmentedControl
    aria-label={label}
    presentation="text-only"
    size="compact"
    textOnlyDensity="compact"
    value={value}
    onValueChange={onValueChange}
  >
    {values.map((option) => (
      <SegmentedControlItem key={option.value} value={option.value}>
        {option.label}
      </SegmentedControlItem>
    ))}
  </SegmentedControl>
)

const IdentityControl = ({
  value,
  onValueChange,
}: {
  value: string
  onValueChange: (value: string) => void
}) => {
  const { t } = useLingui()

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger
        aria-label={t`Product identity`}
        className="w-44"
        size="compact"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {DOCUMENTATION_DTF_FIXTURES.map((dtf) => (
          <SelectItem key={dtf.id} value={dtf.id}>
            {dtf.symbol}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

const NavigationSection = ({
  id,
  title,
  description,
  children,
}: {
  id: string
  title: ReactNode
  description: ReactNode
  children: ReactNode
}) => (
  <section
    id={id}
    aria-labelledby={`${id}-title`}
    className="scroll-mt-20 space-y-6 border-b border-border pb-12 md:scroll-mt-6"
    data-testid="documentation-navigation-section"
  >
    <header className="max-w-3xl space-y-1">
      <h3 id={`${id}-title`} className="text-xl font-light">
        {title}
      </h3>
      <p className="text-sm leading-6 text-muted-foreground">{description}</p>
    </header>
    {children}
  </section>
)

const SubsystemHeader = ({
  title,
  description,
}: {
  title: ReactNode
  description: ReactNode
}) => (
  <header className="max-w-3xl space-y-1">
    <h4 className="text-base font-medium">{title}</h4>
    <p className="text-sm leading-6 text-muted-foreground">{description}</p>
  </header>
)

const Brand = ({ compact = false }: { compact?: boolean }) => {
  const { t } = useLingui()

  return (
    <a
      aria-label={t`Reserve home`}
      className="flex min-h-10 items-center text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      href="#navigation-global"
    >
      {compact ? (
        <RBrand className="size-5" />
      ) : (
        <Reserve className="h-5 w-auto" />
      )}
    </a>
  )
}

const ConnectedAccount = ({ compact = false }: { compact?: boolean }) => {
  const { t } = useLingui()

  return (
    <Button
      aria-label={t`Connected wallet 0x71F9…2A6C`}
      className="gap-1 [&>svg]:size-3.5"
      leadingIcon={<ChainLogo aria-hidden="true" chain={ChainId.Mainnet} />}
      size="compact"
      tone="secondary"
    >
      {compact ? '0x71…2A6C' : '0x71F9…2A6C'}
    </Button>
  )
}

const ApplicationActions = ({ connected }: { connected: boolean }) => {
  const { t } = useLingui()

  return (
    <div className="flex h-10 items-center gap-1 rounded-full bg-card p-1 ring-1 ring-inset ring-border">
      <IconButton
        label={t`Search`}
        icon={<Search aria-hidden="true" />}
        tone="secondary"
      />
      <IconButton
        label={t`Theme control preview`}
        icon={<Moon aria-hidden="true" />}
        tone="secondary"
      />
      <IconButton
        label={t`Select language`}
        icon={<Languages aria-hidden="true" />}
        tone="secondary"
      />
      {connected ? (
        <ConnectedAccount />
      ) : (
        <Button size="compact">
          <Trans>Connect</Trans>
        </Button>
      )}
    </div>
  )
}

const GlobalDesktopDocumentation = () => {
  const { t } = useLingui()
  const { globalDestinations, globalOverflow } =
    useDocumentationNavigationFixtures()
  const scopedGlobalDestinations = scopeDestinations(
    globalDestinations,
    '#navigation-global'
  )
  const scopedGlobalOverflow = scopeDestinations(
    globalOverflow,
    '#navigation-global'
  )
  const specimen = useDocumentationSpecimenState(
    'navigation-global-desktop',
    GLOBAL_DESKTOP_SCHEMA
  )
  const isConnected = specimen.state.identity === 'connected'
  const scrollHostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scrollHost = scrollHostRef.current
    if (isConnected && typeof scrollHost?.scrollTo === 'function') {
      scrollHost.scrollTo({ left: scrollHost.scrollWidth, behavior: 'smooth' })
    }
  }, [isConnected])

  return (
    <div data-testid="navigation-global-desktop" className="space-y-3">
      <SubsystemHeader
        title={<Trans>Desktop application header</Trans>}
        description={
          <Trans>
            Primary destinations, bounded overflow, and application actions stay
            visible as one accepted application-level system.
          </Trans>
        }
      />
      <DocumentationSpecimenCanvas
        host={{
          name: t`1200px application header — scroll horizontally for actions`,
          backdropOwner: t`Documentation contrast canvas`,
          insetOwner: t`Global Navigation header`,
        }}
        mode="intrinsic"
        backdrop="neutral"
        padding="contained"
        align="start"
        stableHeight="standard"
        controls={{
          state: (
            <ChoiceControl
              label={t`Desktop Global state`}
              value={specimen.state.state}
              values={[
                { label: t`Resting`, value: 'resting' },
                { label: t`More open`, value: 'overflow' },
              ]}
              onValueChange={(value) =>
                specimen.setValue(
                  'state',
                  value as (typeof GLOBAL_DESKTOP_SCHEMA.state.values)[number]
                )
              }
            />
          ),
          identity: (
            <ChoiceControl
              label={t`Application identity state`}
              value={specimen.state.identity}
              values={[
                { label: t`Connect`, value: 'disconnected' },
                { label: t`Account`, value: 'connected' },
              ]}
              onValueChange={(value) =>
                specimen.setValue(
                  'identity',
                  value as (typeof GLOBAL_DESKTOP_SCHEMA.identity.values)[number]
                )
              }
            />
          ),
        }}
        reset={
          specimen.isDefault ? undefined : (
            <ResetPreview onReset={specimen.reset} />
          )
        }
        fallbacks={specimen.fallbacks}
        provenance={
          <Trans>
            Accepted GlobalNavigation owner with the complete source-grounded
            destination inventory; the product page body is intentionally
            cropped out.
          </Trans>
        }
      >
        <div
          ref={scrollHostRef}
          className="overflow-x-auto"
          data-testid="global-desktop-scroll-host"
        >
          <div className="min-w-[1200px]">
            <GlobalNavigation
              actions={<ApplicationActions connected={isConnected} />}
              brand={<Brand />}
              currentId="discover"
              destinations={scopedGlobalDestinations}
              label={t`Global navigation`}
              onOverflowOpenChange={(open) =>
                specimen.setValue('state', open ? 'overflow' : 'resting')
              }
              overflowAriaLabel={t`Additional destinations`}
              overflowDestinations={scopedGlobalOverflow}
              overflowLabel={t`More`}
              overflowOpen={specimen.state.state === 'overflow'}
            />
          </div>
        </div>
      </DocumentationSpecimenCanvas>
    </div>
  )
}

const GlobalConstrainedResult = ({
  connected,
  state,
  onStateChange,
}: {
  connected: boolean
  state: (typeof GLOBAL_CONSTRAINED_SCHEMA.state.values)[number]
  onStateChange: (
    state: (typeof GLOBAL_CONSTRAINED_SCHEMA.state.values)[number]
  ) => void
}) => {
  const { t } = useLingui()
  const { mobileGlobalGroups, mobileUtilityMessages } =
    useDocumentationNavigationFixtures()
  const scopedMobileGlobalGroups = mobileGlobalGroups.map((group) => ({
    ...group,
    destinations: scopeDestinations(group.destinations, '#navigation-global'),
  }))
  const [theme, setTheme] = useState<MobileUtilityTheme>('dark')
  const [language, setLanguage] = useState<MobileUtilityLanguage>('en')

  if (state === 'destinations') {
    return (
      <GlobalNavigationMenu
        brand={<Brand />}
        currentId="discover"
        groups={scopedMobileGlobalGroups}
        label={t`Global mobile navigation`}
        trailing={
          <IconButton
            label={t`Close global navigation`}
            icon={<X aria-hidden="true" />}
            onClick={() => onStateChange('resting')}
            tone="quiet"
          />
        }
      />
    )
  }

  return (
    <MobileGlobalHeader
      account={
        connected ? (
          <ConnectedAccount compact />
        ) : (
          <Button size="compact">
            <Trans>Connect</Trans>
          </Button>
        )
      }
      brand={<Brand compact />}
      navigation={
        <IconButton
          aria-expanded={false}
          label={t`Open global navigation`}
          icon={<Menu aria-hidden="true" />}
          onClick={() => onStateChange('destinations')}
          size="compact"
          tone="secondary"
        />
      }
      utilities={
        <MobileUtilityPanel
          key={state}
          defaultOpen={state === 'utilities'}
          language={language}
          messages={mobileUtilityMessages}
          onLanguageChange={setLanguage}
          onSearch={() => undefined}
          onThemeChange={setTheme}
          theme={theme}
        />
      }
    />
  )
}

const GlobalConstrainedDocumentation = () => {
  const { t } = useLingui()
  const specimen = useDocumentationSpecimenState(
    'navigation-global-constrained',
    GLOBAL_CONSTRAINED_SCHEMA
  )

  return (
    <div data-testid="navigation-global-constrained" className="space-y-3">
      <SubsystemHeader
        title={<Trans>Constrained application header</Trans>}
        description={
          <Trans>
            The same destinations become complete navigation regions; utilities
            stay grouped without changing the documentation theme.
          </Trans>
        }
      />
      <DocumentationSpecimenCanvas
        host={{
          name: t`Cropped constrained header`,
          backdropOwner: t`Documentation contrast canvas`,
          insetOwner: t`Constrained application header`,
        }}
        mode="host-constrained"
        backdrop="neutral"
        padding="contained"
        align="center"
        controls={{
          state: (
            <ChoiceControl
              label={t`Constrained Global state`}
              value={specimen.state.state}
              values={[
                { label: t`Resting`, value: 'resting' },
                { label: t`Destinations`, value: 'destinations' },
                { label: t`Utilities`, value: 'utilities' },
              ]}
              onValueChange={(value) =>
                specimen.setValue(
                  'state',
                  value as (typeof GLOBAL_CONSTRAINED_SCHEMA.state.values)[number]
                )
              }
            />
          ),
          identity: (
            <ChoiceControl
              label={t`Constrained identity state`}
              value={specimen.state.identity}
              values={[
                { label: t`Connect`, value: 'disconnected' },
                { label: t`Account`, value: 'connected' },
              ]}
              onValueChange={(value) =>
                specimen.setValue(
                  'identity',
                  value as (typeof GLOBAL_CONSTRAINED_SCHEMA.identity.values)[number]
                )
              }
            />
          ),
        }}
        reset={
          specimen.isDefault ? undefined : (
            <ResetPreview onReset={specimen.reset} />
          )
        }
        fallbacks={specimen.fallbacks}
        provenance={
          <Trans>
            Accepted MobileGlobalHeader, MobileUtilityPanel, and
            GlobalNavigationMenu owners; no application body is simulated.
          </Trans>
        }
      >
        <div
          className={`mx-auto w-[390px] max-w-full bg-muted/30 ${
            specimen.state.state === 'utilities' ? 'min-h-[22rem]' : 'min-h-14'
          }`}
          data-testid="global-constrained-host"
        >
          <GlobalConstrainedResult
            connected={specimen.state.identity === 'connected'}
            state={specimen.state.state}
            onStateChange={(state) => specimen.setValue('state', state)}
          />
        </div>
      </DocumentationSpecimenCanvas>
    </div>
  )
}

const ProductIdentity = ({
  expanded,
  open,
  product,
  onClick,
}: {
  expanded: boolean
  open: boolean
  product: DocumentationDtfFixture
  onClick: () => void
}) => {
  const { t } = useLingui()

  return (
    <ProductNavigationIdentityTrigger
      expanded={expanded}
      label={t`Switch DTF, current ${product.symbol}`}
      mark={<DocumentationDtfMark product={product} />}
      name={product.symbol}
      onClick={onClick}
      open={open}
    />
  )
}

const useSelectedDtf = (id: string) =>
  useMemo(
    () =>
      DOCUMENTATION_DTF_FIXTURES.find((candidate) => candidate.id === id) ??
      DOCUMENTATION_DTF_FIXTURES[0],
    [id]
  )

const ProductDesktopDocumentation = () => {
  const { t } = useLingui()
  const { productDestinations, getDtfSwitcherDestinations } =
    useDocumentationNavigationFixtures()
  const scopedProductDestinations = scopeDestinations(
    productDestinations,
    '#navigation-product'
  )
  const specimen = useDocumentationSpecimenState(
    'navigation-product-desktop',
    PRODUCT_DESKTOP_SCHEMA
  )
  const product = useSelectedDtf(specimen.state.identity)
  const isSwitcher = specimen.state.state === 'switcher'
  const expanded = specimen.state.state !== 'collapsed'
  const destinations = isSwitcher
    ? scopeDestinations(
        getDtfSwitcherDestinations(product.id),
        '#navigation-product'
      )
    : scopedProductDestinations

  return (
    <div data-testid="navigation-product-desktop" className="space-y-3">
      <SubsystemHeader
        title={<Trans>Desktop product rail</Trans>}
        description={
          <Trans>
            One route model moves from a compact rail to labeled navigation and
            an explicit DTF switcher without changing the surrounding product.
          </Trans>
        }
      />
      <DocumentationSpecimenCanvas
        host={{
          name: t`Neutral product structure`,
          backdropOwner: t`Documentation Product-navigation frame`,
          insetOwner: t`Product Navigation rail`,
        }}
        mode="full-canvas"
        backdrop="beige"
        padding="none"
        align="start"
        controls={{
          state: (
            <ChoiceControl
              label={t`Desktop Product state`}
              value={specimen.state.state}
              values={[
                { label: t`Collapsed`, value: 'collapsed' },
                { label: t`Expanded`, value: 'expanded' },
                { label: t`Switcher`, value: 'switcher' },
              ]}
              onValueChange={(value) =>
                specimen.setValue(
                  'state',
                  value as (typeof PRODUCT_DESKTOP_SCHEMA.state.values)[number]
                )
              }
            />
          ),
          identity: (
            <IdentityControl
              value={specimen.state.identity}
              onValueChange={(value) => specimen.setValue('identity', value)}
            />
          ),
        }}
        reset={
          specimen.isDefault ? undefined : (
            <ResetPreview onReset={specimen.reset} />
          )
        }
        fallbacks={specimen.fallbacks}
        provenance={
          <Trans>
            Accepted ProductNavigation and identity owners in a neutral blank
            two-column host; no product data or application composition is
            invented. Token initials are provider-safe placeholder marks.
          </Trans>
        }
      >
        <div
          className="relative grid h-[480px] w-full min-w-[720px] grid-cols-[72px_minmax(0,1fr)] gap-0.5 bg-secondary"
          data-testid="neutral-product-host"
        >
          <div className="relative z-10 w-[72px]">
            <div
              className="absolute inset-y-0 left-0"
              data-testid="product-navigation-rail-shell"
              onMouseEnter={() => {
                if (!isSwitcher) specimen.setValue('state', 'expanded')
              }}
              onMouseLeave={() => {
                if (!isSwitcher) specimen.setValue('state', 'collapsed')
              }}
              onFocusCapture={() => {
                if (!isSwitcher) specimen.setValue('state', 'expanded')
              }}
              onBlurCapture={(event) => {
                if (
                  !isSwitcher &&
                  !event.currentTarget.contains(event.relatedTarget)
                ) {
                  specimen.setValue('state', 'collapsed')
                }
              }}
              onClickCapture={(event) => {
                if (
                  isSwitcher &&
                  (event.target as Element).closest('[data-navigation-id]')
                ) {
                  event.preventDefault()
                }
              }}
            >
              <ProductNavigation
                currentId={isSwitcher ? undefined : 'overview'}
                destinations={destinations}
                expanded={expanded}
                identity={
                  <ProductIdentity
                    expanded={expanded}
                    open={isSwitcher}
                    product={product}
                    onClick={() =>
                      specimen.setValue(
                        'state',
                        isSwitcher ? 'expanded' : 'switcher'
                      )
                    }
                  />
                }
                label={
                  isSwitcher ? t`Switch DTF` : t`${product.symbol} navigation`
                }
                onDestinationSelect={(destination) => {
                  if (!isSwitcher) return
                  specimen.setValues({
                    identity: destination.id,
                    state: 'expanded',
                  })
                }}
                overflowFade={isSwitcher}
                showDestinationChevron={!isSwitcher}
              />
            </div>
          </div>
          <div
            aria-label={t`Neutral two-column product structure`}
            className="grid min-w-0 flex-1 grid-cols-[minmax(0,3fr)_minmax(12rem,2fr)] gap-px bg-secondary"
            role="img"
          >
            <div
              className="h-full bg-card"
              data-testid="product-primary-region"
            />
            <div
              className="h-full bg-card"
              data-testid="product-supporting-region"
            />
          </div>
        </div>
      </DocumentationSpecimenCanvas>
    </div>
  )
}

const ProductPanelHeader = ({ label }: { label: string }) => {
  const { t } = useLingui()

  return (
    <DrawerHeader
      action={
        <DrawerClose asChild>
          <IconButton
            label={t`Close ${label}`}
            icon={<X aria-hidden="true" />}
            size="compact"
            tone="secondary"
          />
        </DrawerClose>
      }
      data-slot="mobile-navigation-drawer-header"
    >
      <DrawerTitle
        className={`flex min-h-8 min-w-0 items-center truncate ${v1Typography.itemTitle}`}
        data-slot="mobile-navigation-drawer-title"
      >
        {label}
      </DrawerTitle>
    </DrawerHeader>
  )
}

const ProductConstrainedDocumentation = () => {
  const { t } = useLingui()
  const { productDestinations, getDtfSwitcherDestinations } =
    useDocumentationNavigationFixtures()
  const scopedProductDestinations = scopeDestinations(
    productDestinations,
    '#navigation-product'
  )
  const specimen = useDocumentationSpecimenState(
    'navigation-product-constrained',
    PRODUCT_CONSTRAINED_SCHEMA
  )
  const product = useSelectedDtf(specimen.state.identity)
  const isSwitcher = specimen.state.state === 'switcher'
  const isPanelOpen = specimen.state.state !== 'resting'
  const destinations = isSwitcher
    ? scopeDestinations(
        getDtfSwitcherDestinations(product.id),
        '#navigation-product'
      )
    : scopedProductDestinations
  const [drawerContainer, setDrawerContainer] = useState<HTMLDivElement | null>(
    null
  )
  const lastDrawerTriggerRef = useRef<HTMLButtonElement | null>(null)

  return (
    <div data-testid="navigation-product-constrained" className="space-y-3">
      <SubsystemHeader
        title={<Trans>Constrained product navigation</Trans>}
        description={
          <Trans>
            Detached DTF switching and page navigation remain separate entry
            points, with every important panel state directly selectable.
          </Trans>
        }
      />
      <DocumentationSpecimenCanvas
        host={{
          name: t`Neutral constrained product structure`,
          backdropOwner: t`Documentation mobile frame`,
          insetOwner: t`Detached Product Navigation controls`,
        }}
        mode="host-constrained"
        backdrop="neutral"
        padding="contained"
        align="center"
        controls={{
          family: (
            <ChoiceControl
              label={t`Mobile action context`}
              value={specimen.state.actionContext}
              values={[
                { label: t`Holder`, value: 'holder' },
                { label: t`Visitor`, value: 'visitor' },
                { label: t`Eligibility`, value: 'eligibility' },
              ]}
              onValueChange={(value) =>
                specimen.setValue(
                  'actionContext',
                  value as (typeof PRODUCT_CONSTRAINED_SCHEMA.actionContext.values)[number]
                )
              }
            />
          ),
          state: (
            <ChoiceControl
              label={t`Constrained Product state`}
              value={specimen.state.state}
              values={[
                { label: t`Resting`, value: 'resting' },
                { label: t`Pages`, value: 'pages' },
                { label: t`Switcher`, value: 'switcher' },
              ]}
              onValueChange={(value) =>
                specimen.setValue(
                  'state',
                  value as (typeof PRODUCT_CONSTRAINED_SCHEMA.state.values)[number]
                )
              }
            />
          ),
          identity: (
            <IdentityControl
              value={specimen.state.identity}
              onValueChange={(value) => specimen.setValue('identity', value)}
            />
          ),
        }}
        reset={
          specimen.isDefault ? undefined : (
            <ResetPreview onReset={specimen.reset} />
          )
        }
        fallbacks={specimen.fallbacks}
        provenance={
          <Trans>
            Accepted mobile Product Navigation triggers and drawer presentation
            with presentation-only product action fixtures. The actions execute
            no product behavior. Token initials are provider-safe placeholder
            marks.
          </Trans>
        }
      >
        <Drawer
          open={isPanelOpen}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) specimen.setValue('state', 'resting')
          }}
        >
          <div
            ref={setDrawerContainer}
            className="relative mx-auto h-[560px] w-[390px] min-w-[390px] max-w-none overflow-hidden bg-card"
            data-testid="mobile-product-host"
          >
            <div className="absolute inset-x-2 bottom-2 z-30 flex items-center justify-between gap-2">
              <DrawerTrigger asChild>
                <ProductNavigationMobileIdentityTrigger
                  label={t`Switch DTF, current ${product.symbol}`}
                  mark={<DocumentationDtfMark product={product} size="xl" />}
                  onClick={(event) => {
                    lastDrawerTriggerRef.current = event.currentTarget
                    specimen.setValue('state', 'switcher')
                  }}
                  open={isSwitcher}
                />
              </DrawerTrigger>
              <div className="flex items-center gap-2 rounded-full bg-card/90 p-2 shadow-lg backdrop-blur-sm">
                <DrawerTrigger asChild>
                  <IconButton
                    aria-expanded={specimen.state.state === 'pages'}
                    label={t`Open ${product.symbol} page navigation`}
                    icon={<EllipsisVertical aria-hidden="true" />}
                    onClick={(event) => {
                      lastDrawerTriggerRef.current = event.currentTarget
                      specimen.setValue('state', 'pages')
                    }}
                  />
                </DrawerTrigger>
                {specimen.state.actionContext === 'holder' ? (
                  <Button
                    asChild
                    aria-label={t`View portfolio`}
                    className="size-11 p-0"
                    tone="secondary"
                  >
                    <a href="#navigation-product">
                      <Wallet aria-hidden="true" />
                    </a>
                  </Button>
                ) : null}
                {specimen.state.actionContext === 'eligibility' ? (
                  <Button size="compact">
                    <Trans>Verify eligibility</Trans>
                  </Button>
                ) : (
                  <Button size="compact">
                    <Trans>Buy / Sell</Trans>
                  </Button>
                )}
                <IconButton
                  label={t`Ask Reserve AI`}
                  icon={<MessageCircle aria-hidden="true" />}
                  tone="secondary"
                />
              </div>
            </div>
          </div>
          <DrawerContent
            aria-describedby={undefined}
            aria-label={isSwitcher ? t`Switch DTF` : t`${product.symbol} pages`}
            data-slot="mobile-navigation-bottom-drawer"
            onClickCapture={(event) => {
              if (
                isSwitcher &&
                (event.target as Element).closest('[data-navigation-id]')
              ) {
                event.preventDefault()
              }
            }}
            onCloseAutoFocus={(event) => {
              event.preventDefault()
              lastDrawerTriggerRef.current?.focus()
            }}
            placement="contained-bottom"
            portalContainer={drawerContainer}
          >
            <ProductNavigation
              currentId={isSwitcher ? undefined : 'overview'}
              destinations={destinations}
              identity={
                <ProductPanelHeader
                  label={
                    isSwitcher ? t`Switch DTF` : t`${product.symbol} pages`
                  }
                />
              }
              label={isSwitcher ? t`Switch DTF` : t`${product.symbol} pages`}
              onDestinationSelect={(destination) => {
                specimen.setValues({
                  ...(isSwitcher ? { identity: destination.id } : {}),
                  state: 'resting',
                })
              }}
              overflowFade={isSwitcher}
              presentation="drawer"
              showDestinationChevron={!isSwitcher}
            />
          </DrawerContent>
        </Drawer>
      </DocumentationSpecimenCanvas>
    </div>
  )
}

const NavigationAnatomy = () => {
  const { globalDestinations, globalOverflow, productDestinations } =
    useDocumentationNavigationFixtures()
  const scopedGlobalDestinations = scopeDestinations(
    globalDestinations,
    '#navigation-global'
  )
  const scopedGlobalOverflow = scopeDestinations(
    globalOverflow,
    '#navigation-global'
  )
  const scopedProductDestinations = scopeDestinations(
    productDestinations,
    '#navigation-product'
  )
  const unavailableDestination = {
    ...scopedProductDestinations[4],
    unavailable: true,
  }

  return (
    <DocumentationSpecimenGrid className="xl:grid-cols-2">
      <DocumentationSpecimenCell
        label={<Trans>Global destination hierarchy</Trans>}
      >
        <div className="flex flex-wrap items-center gap-2 bg-card p-2">
          <GlobalNavigationItem
            currentId="discover"
            destination={scopedGlobalDestinations[0]}
          />
          <GlobalNavigationItem destination={scopedGlobalDestinations[2]} />
        </div>
      </DocumentationSpecimenCell>
      <DocumentationSpecimenCell label={<Trans>Global overflow row</Trans>}>
        <div className="max-w-sm rounded-lg border border-border bg-popover p-2">
          <GlobalNavigationItem
            destination={scopedGlobalOverflow[0]}
            presentation="menu"
          />
        </div>
      </DocumentationSpecimenCell>
      <DocumentationSpecimenCell label={<Trans>Product route states</Trans>}>
        <div className="w-64 space-y-1 bg-card p-2">
          <ProductNavigationItem
            currentId="governance"
            destination={scopedProductDestinations[2]}
            expanded
          />
          <ProductNavigationItem
            destination={scopedProductDestinations[3]}
            expanded
          />
          <ProductNavigationItem
            destination={unavailableDestination}
            expanded
          />
        </div>
      </DocumentationSpecimenCell>
      <DocumentationSpecimenCell
        label={<Trans>Application identity states</Trans>}
      >
        <div className="flex flex-wrap items-center gap-3 bg-card p-3">
          <Button size="compact">
            <Trans>Connect</Trans>
          </Button>
          <ConnectedAccount />
        </div>
      </DocumentationSpecimenCell>
    </DocumentationSpecimenGrid>
  )
}

const NavigationPatternDocumentation = () => {
  return (
    <div className="space-y-12" data-testid="navigation-pattern-documentation">
      <NavigationSection
        id="navigation-global"
        title={<Trans>Global navigation system</Trans>}
        description={
          <Trans>
            Application-level routes, resources, utilities, and account access.
            Desktop and constrained presentations share real destinations while
            remaining distinct compositions.
          </Trans>
        }
      >
        <GlobalDesktopDocumentation />
        <GlobalConstrainedDocumentation />
      </NavigationSection>

      <NavigationSection
        id="navigation-product"
        title={<Trans>Product navigation system</Trans>}
        description={
          <Trans>
            Object identity, local destinations, public route activity, and DTF
            switching across persistent and constrained presentations.
          </Trans>
        }
      >
        <ProductDesktopDocumentation />
        <ProductConstrainedDocumentation />
      </NavigationSection>

      <NavigationSection
        id="navigation-anatomy"
        title={<Trans>Secondary anatomy and state reference</Trans>}
        description={
          <Trans>
            Inspect the shared destination, identity, current, notable, and
            unavailable treatments after reviewing both complete systems.
          </Trans>
        }
      >
        <NavigationAnatomy />
      </NavigationSection>
    </div>
  )
}

export default NavigationPatternDocumentation
