import type { ReactNode } from 'react'
import DarkModeToggle from '@/components/dark-mode-toggle'
import LabNavigation from './lab-navigation'

const LabShell = ({ children }: { children: ReactNode }) => (
  <main
    data-testid="design-system-lab"
    className="min-h-full bg-background text-foreground"
  >
    <div className="container px-4 py-4 sm:px-6">
      <header className="flex items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <p className="text-lg font-medium tracking-tight">
            Register design system
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
              V1 lab
            </span>
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              Visual system · readiness labeled
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="hidden text-sm text-muted-foreground sm:inline">
            Theme
          </span>
          <div className="[&>button]:h-11 [&>button]:w-11">
            <DarkModeToggle />
          </div>
        </div>
      </header>

      <div className="sticky top-0 z-20 -mx-4 border-b border-border bg-background/95 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6">
        <LabNavigation />
      </div>

      <div className="py-6 sm:py-8">{children}</div>
    </div>
  </main>
)

export default LabShell
