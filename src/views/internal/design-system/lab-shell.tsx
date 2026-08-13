import type { ReactNode } from 'react'
import DarkModeToggle from '@/components/dark-mode-toggle'
import LabNavigation from './lab-navigation'

const LabShell = ({ children }: { children: ReactNode }) => (
  <main
    data-testid="design-system-lab"
    className="min-h-full bg-background text-foreground"
  >
    <div className="container px-4 py-6 sm:px-6 sm:py-8">
      <header className="flex flex-col justify-between gap-5 border-b border-border pb-6 lg:flex-row lg:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
              V1 cockpit
            </span>
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              Capability map · provisional
            </span>
          </div>
          <p className="mt-4 text-2xl font-semibold tracking-tight">
            Register design system
          </p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Expected structure, current evidence, open decisions, and adoption
            status in one working surface.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Theme</span>
          <div className="[&>button]:h-11 [&>button]:w-11">
            <DarkModeToggle />
          </div>
        </div>
      </header>

      <div className="sticky top-0 z-20 -mx-4 border-b border-border bg-background/95 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6">
        <LabNavigation />
      </div>

      <div className="py-8 sm:py-10">{children}</div>
    </div>
  </main>
)

export default LabShell
