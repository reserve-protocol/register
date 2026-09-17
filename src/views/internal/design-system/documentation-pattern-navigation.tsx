import { Trans, useLingui } from '@lingui/react/macro'
import {
  EllipsisVertical,
  Languages,
  Menu,
  Moon,
  Search,
  X,
} from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'

import { Button } from '@/components/button'
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

export const NAVIGATION_DOCUMENTATION_SECTIONS = [
  'navigation-global',
  'navigation-product',
  'navigation-anatomy',
] as const

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
} as const

const scopeDestinations = (
  destinations: NavigationDestination[],
  hash: string
) => destinations.map((destination) => ({ ...destination, href: hash }))

const sectionHref = (href: string, sectionId: string) => {
  const [pathAndSearch] = href.split('#')
  const [pathname, search = ''] = pathAndSearch.split('?')
  const params = new URLSearchParams(search)
  const prefix = `${sectionId}.`

  for (const key of Array.from(params.keys())) {
    if (!key.startsWith(prefix)) params.delete(key)
  }

  const sectionSearch = params.toString()
  return `${pathname}${sectionSearch ? `?${sectionSearch}` : ''}#${sectionId}`
}

const StateLink = ({ href }: { href: string }) => (
  <Button asChild size="compact" tone="quiet">
    <a href={href}>
      <Trans>State URL</Trans>
    </a>
  </Button>
)

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
    <select
      aria-label={t`Product identity`}
      className="min-h-11 rounded-full border border-border bg-card px-4 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      value={value}
      onChange={(event) => onValueChange(event.target.value)}
    >
      {DOCUMENTATION_DTF_FIXTURES.map((dtf) => (
        <option key={dtf.id} value={dtf.id}>
          {dtf.symbol}
        </option>
      ))}
    </select>
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
          name: t`Cropped application header`,
          backgroundOwner: t`Global Navigation`,
          insetOwner: t`Global Navigation header`,
        }}
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
        link={
          <StateLink
            href={sectionHref(specimen.href, 'navigation-global-desktop')}
          />
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
          backgroundOwner: t`Global Navigation`,
          insetOwner: t`Constrained application header`,
        }}
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
        link={
          <StateLink
            href={sectionHref(specimen.href, 'navigation-global-constrained')}
          />
        }
        fallbacks={specimen.fallbacks}
        provenance={
          <Trans>
            Accepted MobileGlobalHeader, MobileUtilityPanel, and
            GlobalNavigationMenu owners; no application body is simulated.
          </Trans>
        }
      >
        <div className="mx-auto min-h-14 w-[390px] max-w-full bg-muted/30">
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
          backgroundOwner: t`Product page substrate`,
          insetOwner: t`Product Navigation rail`,
        }}
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
        link={
          <StateLink
            href={sectionHref(specimen.href, 'navigation-product-desktop')}
          />
        }
        fallbacks={specimen.fallbacks}
        provenance={
          <Trans>
            Accepted ProductNavigation and identity owners in a neutral blank
            two-column host; no product data or application composition is
            invented.
          </Trans>
        }
      >
        <div
          className="flex h-[360px] min-w-[720px] bg-muted/30"
          data-testid="neutral-product-host"
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
            label={isSwitcher ? t`Switch DTF` : t`${product.symbol} navigation`}
            onDestinationSelect={(destination) => {
              if (!isSwitcher) return
              specimen.setValue('identity', destination.id)
              specimen.setValue('state', 'expanded')
            }}
            overflowFade={isSwitcher}
            showDestinationChevron={!isSwitcher}
          />
          <div
            aria-label={t`Neutral two-column product structure`}
            className="grid min-w-0 flex-1 grid-cols-[minmax(0,3fr)_minmax(12rem,2fr)] gap-2 p-2"
            role="img"
          >
            <div className="bg-card" />
            <div className="bg-card" />
          </div>
        </div>
      </DocumentationSpecimenCanvas>
    </div>
  )
}

const ProductPanelHeader = ({
  label,
  onClose,
}: {
  label: string
  onClose: () => void
}) => {
  const { t } = useLingui()

  return (
    <div className="flex min-h-14 items-center gap-4 px-6 py-3">
      <p className="min-w-0 flex-1 truncate text-base font-medium">{label}</p>
      <IconButton
        label={t`Close ${label}`}
        icon={<X aria-hidden="true" />}
        onClick={onClose}
        size="compact"
        tone="secondary"
      />
    </div>
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
          backgroundOwner: t`Product page substrate`,
          insetOwner: t`Detached Product Navigation controls`,
        }}
        controls={{
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
        link={
          <StateLink
            href={sectionHref(specimen.href, 'navigation-product-constrained')}
          />
        }
        fallbacks={specimen.fallbacks}
        provenance={
          <Trans>
            Accepted mobile Product Navigation triggers and drawer presentation
            shown against a neutral empty host; contextual product actions are
            intentionally absent.
          </Trans>
        }
      >
        <div className="relative mx-auto h-[430px] w-[390px] max-w-full overflow-hidden bg-muted/30">
          {isPanelOpen ? (
            <ProductNavigation
              currentId={isSwitcher ? undefined : 'overview'}
              destinations={destinations}
              identity={
                <ProductPanelHeader
                  label={
                    isSwitcher ? t`Switch DTF` : t`${product.symbol} pages`
                  }
                  onClose={() => specimen.setValue('state', 'resting')}
                />
              }
              label={isSwitcher ? t`Switch DTF` : t`${product.symbol} pages`}
              onDestinationSelect={(destination) => {
                if (isSwitcher) specimen.setValue('identity', destination.id)
                specimen.setValue('state', 'resting')
              }}
              overflowFade={isSwitcher}
              presentation="drawer"
              showDestinationChevron={!isSwitcher}
            />
          ) : (
            <div className="absolute inset-x-2 bottom-2 flex items-center justify-between gap-2">
              <ProductNavigationMobileIdentityTrigger
                label={t`Switch DTF, current ${product.symbol}`}
                mark={<DocumentationDtfMark product={product} size="xl" />}
                onClick={() => specimen.setValue('state', 'switcher')}
              />
              <div className="rounded-full bg-card/90 p-2 shadow-lg backdrop-blur-sm">
                <IconButton
                  label={t`Open ${product.symbol} page navigation`}
                  icon={<EllipsisVertical aria-hidden="true" />}
                  onClick={() => specimen.setValue('state', 'pages')}
                />
              </div>
            </div>
          )}
        </div>
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
  const { t } = useLingui()
  const sectionLabels: Record<
    (typeof NAVIGATION_DOCUMENTATION_SECTIONS)[number],
    string
  > = {
    'navigation-global': t`Global system`,
    'navigation-product': t`Product system`,
    'navigation-anatomy': t`Anatomy and states`,
  }

  return (
    <div className="space-y-12" data-testid="navigation-pattern-documentation">
      <nav
        aria-label={t`Navigation system sections`}
        className="flex flex-wrap gap-x-4 gap-y-2 border-b border-border pb-4"
      >
        {NAVIGATION_DOCUMENTATION_SECTIONS.map((sectionId) => (
          <a
            key={sectionId}
            className="min-h-11 content-center text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            href={`#${sectionId}`}
          >
            {sectionLabels[sectionId]}
          </a>
        ))}
      </nav>

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
