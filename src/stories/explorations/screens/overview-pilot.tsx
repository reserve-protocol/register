import { useEffect, useRef, useState } from 'react'

import { Drawer, DrawerContent } from '@/components/design-system-v1/drawer'
import { Tabs } from '@/components/design-system-v1/tabs'
import { v1LayoutRecipes as layout } from '@/components/ui/v1-layout-recipes'
import { cn } from '@/lib/utils'

import { TokenAddresses } from '../../navigation/design-reference'
import {
  DTF_FIXTURES,
  getDtfSwitcherDestinations,
} from '../../navigation/navigation-review-fixtures'
import {
  DesktopProductNavigation,
  MobileProductNavigationPanel,
} from '../../navigation/product-navigation-patterns'
import {
  SourceOverviewChart,
  type SourceOverviewChartType,
} from '../../patterns/market/reference/charts/source-overview'
import { HOLDINGS } from '../../patterns/market/reference/table-family/holdings-fixtures'
import { HoldingsTable } from '../../patterns/market/reference/table-family/holdings-table'
import { ZapperInlineReference } from '../../patterns/transactions/reference/transaction-composition-rfq'
import { ScreenPilotHeader } from './screen-pilot-header'
import photonLogo from '../../patterns/market/reference/assets/0xa0fe4e0aeca5479705ce996615b2eacb6b6a10fb.svg'
import { MobileProductControls } from '../../navigation/mobile-product-controls'
import { focusVisibleNavigation } from '../../shared/focus-visible-navigation'
import { useScreenPilotViewport } from './screen-pilot-layout'

const photon = {
  ...DTF_FIXTURES.find((dtf) => dtf.id === 'photon')!,
  src: photonLogo,
}

const pilotDtfDestinations = getDtfSwitcherDestinations(photon.id).map(
  (destination) => ({ ...destination, unavailable: true })
)

export type OverviewPilotArgs = {
  chartType: SourceOverviewChartType
  holdingsTab: 'exposure' | 'collateral'
}

type ThemeControls = {
  theme: 'light' | 'dark'
  onThemeChange: (theme: string) => void
}

export function OverviewPilot({
  chartType,
  holdingsTab,
  embedded = false,
  onHoldingsTabChange,
  ...themeControls
}: OverviewPilotArgs &
  ThemeControls & {
    embedded?: boolean
    onHoldingsTabChange: (tab: string) => void
  }) {
  const {
    viewportRef,
    viewportWidth,
    desktop: desktopNavigation,
    hasSupport,
  } = useScreenPilotViewport()
  const [mobilePanel, setMobilePanel] = useState<'pages' | 'switcher' | null>(
    null
  )
  const lastTrigger = useRef<HTMLElement | null>(null)
  useEffect(() => {
    if (desktopNavigation) setMobilePanel(null)
  }, [desktopNavigation])
  const openPanel = (
    panel: 'pages' | 'switcher',
    trigger: HTMLButtonElement
  ) => {
    lastTrigger.current = trigger
    setMobilePanel(panel)
  }

  return (
    <div
      ref={viewportRef}
      className={cn(
        'min-h-screen bg-card [&_main_*]:scroll-mt-[calc(var(--mobile-header-height,73px)+1rem)] [&_main_*]:scroll-mb-[calc(var(--mobile-product-controls-height,3.75rem)+max(0.5rem,env(safe-area-inset-bottom))+1rem)]',
        !desktopNavigation && '[--screen-content-inset:theme(spacing.5)]'
      )}
      data-testid="overview-pilot-viewport"
    >
      <ScreenPilotHeader
        viewportWidth={viewportWidth}
        embedded={embedded}
        currentId="discover"
        mobileSurface="substrate"
        {...themeControls}
        seamTestId="overview-pilot-header-seam"
      />
      <div className={cn('relative isolate', viewportWidth >= 640 && 'px-6')}>
        <div
          aria-hidden="true"
          className={cn(
            'pointer-events-none inset-x-0 bottom-0 -z-10',
            embedded ? 'absolute top-0' : 'fixed top-[73px]',
            viewportWidth >= 640 && 'px-6'
          )}
          data-testid="overview-pilot-backing-frame"
        >
          <div
            className="mx-auto h-full max-w-[1400px] bg-secondary"
            data-testid="overview-pilot-backing"
          />
        </div>
        <div
          className="mx-auto max-w-[1400px] border-x border-transparent"
          data-testid="overview-pilot-shell"
        >
          <div
            className={cn(
              'grid min-w-0',
              desktopNavigation && 'grid-cols-[72px_minmax(0,1fr)]',
              layout.seam.subsection
            )}
          >
            <div
              className={cn(
                'relative z-20 bg-card',
                !desktopNavigation && 'hidden'
              )}
              data-testid="overview-pilot-desktop-navigation"
            >
              {desktopNavigation && (
                <DesktopProductNavigation
                  product={photon}
                  label="PHOTON navigation"
                  onDtfSelect={() => undefined}
                  switcherDestinations={pilotDtfDestinations}
                  className={cn(
                    'top-[73px] h-[calc(100dvh-73px)] w-[72px] [&>[data-expanded=true]]:shadow-lg [&>[data-expanded=true]]:[clip-path:inset(0_-100%_0_0)]',
                    embedded ? 'sticky' : 'fixed'
                  )}
                />
              )}
            </div>
            <div
              className={cn(
                'grid min-w-0 items-start',
                hasSupport && 'grid-cols-[minmax(768px,1fr)_480px]',
                layout.seam.subsection
              )}
            >
              <main
                className={cn(
                  'grid min-w-0',
                  !desktopNavigation &&
                    'pb-[calc(var(--mobile-product-controls-height,3.75rem)+max(0.5rem,env(safe-area-inset-bottom))+0.75rem)]',
                  layout.seam.subsection
                )}
                data-testid="overview-pilot-primary"
              >
                <SourceOverviewChart
                  chartType={chartType}
                  inspectHeader
                  className="bg-transparent bg-gradient-to-b from-transparent to-card"
                />
                <section
                  aria-label="Holdings"
                  className="min-w-0 bg-card"
                  data-testid="overview-pilot-holdings"
                >
                  <Tabs value={holdingsTab} onValueChange={onHoldingsTabChange}>
                    <HoldingsTable
                      rows={HOLDINGS.photon}
                      tab={holdingsTab}
                      state="default"
                      onBridge={() => undefined}
                    />
                  </Tabs>
                </section>
                <div
                  aria-hidden="true"
                  className="min-h-[100dvh] bg-card"
                  data-testid="overview-pilot-scroll-placeholder"
                />
              </main>
              <aside
                className={cn(
                  'flex min-h-[calc(100dvh-73px)] flex-col self-start',
                  layout.seam.subsection,
                  !hasSupport && 'hidden'
                )}
                aria-label="Trade preview"
                data-testid="overview-pilot-support"
              >
                {hasSupport && (
                  <>
                    <ZapperInlineReference
                      state="Pre-quote"
                      presentation="embedded"
                    />
                    <div aria-hidden="true" className="flex-1 bg-card" />
                  </>
                )}
              </aside>
            </div>
          </div>
        </div>
      </div>
      <MobileProductControls
        product={photon}
        switcherOpen={mobilePanel === 'switcher'}
        pagesOpen={mobilePanel === 'pages'}
        onOpenSwitcher={(trigger) => openPanel('switcher', trigger)}
        onOpenPages={(trigger) => openPanel('pages', trigger)}
        onHeightChange={(height) =>
          viewportRef.current?.style.setProperty(
            '--mobile-product-controls-height',
            `${height}px`
          )
        }
        className={cn(
          'pointer-events-none fixed inset-x-2 bottom-[max(0.5rem,env(safe-area-inset-bottom))] z-30 flex items-center justify-between gap-2',
          desktopNavigation && 'hidden'
        )}
      />
      <Drawer
        open={mobilePanel !== null && !desktopNavigation}
        onOpenChange={(open) => {
          if (!open) setMobilePanel(null)
        }}
      >
        <DrawerContent
          aria-label={
            mobilePanel === 'switcher' ? 'Switch DTF' : 'PHOTON pages'
          }
          aria-describedby={undefined}
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            focusVisibleNavigation(
              lastTrigger.current,
              viewportRef.current?.querySelector<HTMLElement>(
                '[data-testid="product-navigation-rail-shell"] button'
              )
            )
          }}
        >
          <MobileProductNavigationPanel
            product={photon}
            isSwitcherOpen={mobilePanel === 'switcher'}
            switcherDestinations={pilotDtfDestinations}
            onDtfSelect={() => undefined}
            onPageSelect={() => setMobilePanel(null)}
            supplementary={<TokenAddresses product={photon} />}
          />
        </DrawerContent>
      </Drawer>
    </div>
  )
}
