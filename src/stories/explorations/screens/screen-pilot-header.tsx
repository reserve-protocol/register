import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
} from '@/components/design-system-v1/drawer'
import {
  GlobalNavigation,
  GlobalNavigationMenu,
} from '@/components/design-system-v1/navigation'
import { IconButton } from '@/components/icon-button'
import { cn } from '@/lib/utils'
import {
  Brand,
  GlobalActions,
  MobileHeaderCandidate,
} from '../../navigation/design-reference'
import {
  GLOBAL_DESTINATIONS,
  GLOBAL_OVERFLOW,
  MOBILE_GLOBAL_GROUPS,
} from '../../navigation/navigation-review-fixtures'
import { focusVisibleNavigation } from '../../shared/focus-visible-navigation'
import { screenPilotLayout } from './screen-pilot-layout'

export function ScreenPilotHeader({
  viewportWidth,
  embedded,
  currentId,
  theme,
  onThemeChange,
  seamTestId,
  mobileSurface = 'content',
}: {
  viewportWidth: number
  embedded: boolean
  currentId: 'discover' | 'earn'
  theme: 'light' | 'dark'
  onThemeChange: (theme: string) => void
  seamTestId: string
  mobileSurface?: 'content' | 'substrate'
}) {
  const [overflowOpen, setOverflowOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)
  const lastTrigger = useRef<HTMLElement | null>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const mobileTrigger = useRef<HTMLButtonElement>(null)
  const {
    desktop,
    hasOuterGutters,
    destinationCount: visibleCount,
  } = screenPilotLayout(viewportWidth)
  useEffect(() => {
    if (desktop) setMobileOpen(false)
    else setOverflowOpen(false)
  }, [desktop])
  // Only phones blend the header into the beige hero; tablets keep the white surface.
  const usesSubstrateSurface = !hasOuterGutters && mobileSurface === 'substrate'
  useEffect(() => {
    if (embedded || !usesSubstrateSurface) return
    const updateScroll = () => setHasScrolled(window.scrollY > 0)
    updateScroll()
    window.addEventListener('scroll', updateScroll, { passive: true })
    return () => window.removeEventListener('scroll', updateScroll)
  }, [embedded, usesSubstrateSurface])
  const hasSubstrateSurface = usesSubstrateSurface && !hasScrolled
  useEffect(() => {
    const header = headerRef.current
    if (!header) return
    const observer = new ResizeObserver(() => {
      header.parentElement?.style.setProperty(
        '--mobile-header-height',
        `${header.getBoundingClientRect().height}px`
      )
    })
    observer.observe(header)
    return () => observer.disconnect()
  }, [])
  return (
    <>
      <div
        ref={headerRef}
        className={cn(
          'top-0 z-40 bg-card',
          embedded ? 'sticky' : 'fixed inset-x-0'
        )}
        data-testid="pilot-global-header"
      >
        <div className={hasOuterGutters ? 'px-6' : undefined}>
          <div
            className={cn(
              'mx-auto max-w-[1400px] border-x border-secondary',
              hasSubstrateSurface ? 'bg-secondary' : 'bg-card'
            )}
            data-slot="screen-pilot-header-surface"
          >
            <div className={desktop ? undefined : 'hidden'}>
              <GlobalNavigation
                label="Global navigation"
                brand={<Brand />}
                actions={<GlobalActions />}
                currentId={currentId}
                destinations={GLOBAL_DESTINATIONS.slice(0, visibleCount)}
                overflowDestinations={[
                  ...GLOBAL_DESTINATIONS.slice(visibleCount),
                  ...GLOBAL_OVERFLOW,
                ]}
                overflowLabel="More"
                overflowAriaLabel="Additional destinations"
                overflowOpen={overflowOpen}
                onOverflowOpenChange={setOverflowOpen}
                onOverflowCloseAutoFocus={(event) => {
                  if (desktop) return
                  event.preventDefault()
                  focusVisibleNavigation(mobileTrigger.current)
                }}
              />
            </div>
            <div className={desktop ? 'hidden' : undefined}>
              <MobileHeaderCandidate
                className="h-auto min-h-[72px] flex-wrap gap-y-4 px-5 py-4 [&>div:last-child]:max-w-full [&>div:last-child]:flex-wrap [&>div:last-child]:justify-end [&>div:last-child]:gap-y-1"
                theme={theme}
                onThemeChange={onThemeChange}
                surface="transparent"
                navigationLabel="Open global navigation"
                navigationRef={mobileTrigger}
                navigationExpanded={mobileOpen}
                onNavigationClick={() => {
                  lastTrigger.current = mobileTrigger.current
                  setMobileOpen(true)
                }}
              />
            </div>
          </div>
        </div>
        <div
          className={cn(
            'h-px',
            hasSubstrateSurface ? 'bg-card' : 'bg-secondary'
          )}
          aria-hidden="true"
          data-testid={seamTestId}
        />
      </div>
      {!embedded && (
        <div
          aria-hidden="true"
          className="h-[var(--mobile-header-height,73px)]"
        />
      )}
      <Drawer open={mobileOpen && !desktop} onOpenChange={setMobileOpen}>
        <DrawerContent
          aria-label="Global navigation"
          aria-describedby={undefined}
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            focusVisibleNavigation(
              lastTrigger.current,
              headerRef.current?.querySelector<HTMLElement>(
                '[aria-current="page"]'
              ),
              headerRef.current?.querySelector<HTMLElement>(
                '[data-testid="global-navigation-overflow-trigger"]'
              ),
              mobileTrigger.current
            )
          }}
        >
          <DrawerTitle className="sr-only">Global navigation</DrawerTitle>
          <GlobalNavigationMenu
            brand={<Brand />}
            currentId={currentId}
            groups={MOBILE_GLOBAL_GROUPS}
            label="Global mobile navigation"
            overflowFade
            trailing={
              <DrawerClose asChild>
                <IconButton
                  label="Close global navigation"
                  icon={<X aria-hidden="true" />}
                  tone="quiet"
                />
              </DrawerClose>
            }
          />
        </DrawerContent>
      </Drawer>
    </>
  )
}
