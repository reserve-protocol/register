import { Menu, X } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { Trans, useLingui } from '@lingui/react/macro'
import { useLocation } from 'react-router-dom'
import DarkModeToggle from '@/components/dark-mode-toggle'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import DocumentationNavigation from './documentation-navigation'
import DocumentationMobileSectionControl from './documentation-mobile-section-control'
import DocumentationSearch from './documentation-search'
import { DocumentationSectionProvider } from './documentation-section-observer'

const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-border px-4 py-4">
        <p className="text-base font-medium tracking-tight">
          <Trans>Register design system</Trans>
        </p>
        <p
          data-testid="documentation-sidebar-subtitle"
          className="mt-1 text-xs text-muted-foreground"
        >
          <Trans>Documentation and review</Trans>
        </p>
        <div className="mt-4">
          <DocumentationSearch
            inputId={
              onNavigate
                ? 'design-system-search-mobile'
                : 'design-system-search-desktop'
            }
            onNavigate={onNavigate}
          />
        </div>
      </div>
      <div className="min-h-0 flex-1 px-3 py-4">
        <DocumentationNavigation onNavigate={onNavigate} />
      </div>
      <div className="flex items-center justify-between border-t border-border px-4 py-3">
        <span className="text-xs text-muted-foreground">
          <Trans>Theme</Trans>
        </span>
        <div className="[&>button]:h-11 [&>button]:w-11">
          <DarkModeToggle />
        </div>
      </div>
    </div>
  )
}

const LabShell = ({ children }: { children: ReactNode }) => {
  return (
    <DocumentationSectionProvider>
      <LabShellFrame>{children}</LabShellFrame>
    </DocumentationSectionProvider>
  )
}

const LabShellFrame = ({ children }: { children: ReactNode }) => {
  const { t } = useLingui()
  const { pathname } = useLocation()
  const [isNavigationOpen, setIsNavigationOpen] = useState(false)

  useEffect(() => setIsNavigationOpen(false), [pathname])

  return (
    <main
      data-testid="design-system-lab"
      className="flex min-h-full bg-background text-foreground"
    >
      <a
        href="#documentation-main-content"
        onClick={(event) => {
          event.preventDefault()
          document.getElementById('documentation-main-content')?.focus()
        }}
        className="sr-only z-50 min-h-11 items-center border border-border bg-background px-3 text-sm font-medium text-foreground focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:flex focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {t`Skip to main content`}
      </a>
      <aside
        data-testid="documentation-sidebar"
        className="sticky top-0 hidden h-[100dvh] w-64 shrink-0 overflow-y-auto border-r border-border bg-background md:block"
      >
        <SidebarContent />
      </aside>

      <div
        id="documentation-main-content"
        tabIndex={-1}
        className="min-w-0 flex-1 outline-none"
      >
        <header
          data-documentation-mobile-header
          className="sticky top-0 z-30 flex min-h-14 items-center justify-between border-b border-border bg-background/95 px-3 backdrop-blur md:hidden"
        >
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <p className="hidden shrink-0 text-sm font-medium sm:block">
              <Trans>Register design system</Trans>
            </p>
            <DocumentationMobileSectionControl />
          </div>
          <Drawer
            open={isNavigationOpen}
            onOpenChange={setIsNavigationOpen}
            shouldScaleBackground={false}
          >
            <DrawerTrigger asChild>
              <Button
                data-testid="documentation-mobile-navigation"
                variant="ghost"
                size="icon"
                aria-label={t`Open design system navigation`}
                className="size-11"
              >
                <Menu className="size-5" />
              </Button>
            </DrawerTrigger>
            <DrawerContent
              aria-label={t`Design system navigation`}
              showClose={false}
              className="bottom-0 left-0 right-auto top-0 w-[min(20rem,calc(100%-1rem))] rounded-none border-r border-border bg-background"
            >
              <DrawerTitle className="sr-only">
                <Trans>Design system navigation</Trans>
              </DrawerTitle>
              <DrawerDescription className="sr-only">
                <Trans>
                  Browse documentation, Workbench tools, and internal records.
                </Trans>
              </DrawerDescription>
              <DrawerClose asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={t`Close design system navigation`}
                  className="absolute right-2 top-2 z-10 size-11"
                >
                  <X className="size-5" />
                </Button>
              </DrawerClose>
              <SidebarContent onNavigate={() => setIsNavigationOpen(false)} />
            </DrawerContent>
          </Drawer>
        </header>

        <div className="mx-auto w-full max-w-[90rem] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
          {children}
        </div>
      </div>
    </main>
  )
}

export default LabShell
