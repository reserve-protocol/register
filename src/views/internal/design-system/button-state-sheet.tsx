import type { ReactNode } from 'react'
import { ArrowRight, LoaderCircle, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

const ButtonStateSheet = () => (
  <section id="buttons" aria-labelledby="buttons-heading" className="space-y-5">
    <div>
      <p className="text-sm font-medium text-primary">
        Actions · current baseline
      </p>
      <h2 id="buttons-heading" className="mt-1 text-2xl font-semibold">
        Button state sheet
      </h2>
      <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
        The complete current API and its common content states are shown
        together. Forced previews document hover and focus; the missing active
        treatment remains visible as a gap rather than an invented baseline.
      </p>
    </div>

    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <StateRow label="Variants">
        <Button type="button">Primary</Button>
        <Button type="button" variant="secondary">
          Secondary
        </Button>
        <Button type="button" variant="outline">
          Outline
        </Button>
        <Button type="button" variant="ghost">
          Ghost
        </Button>
        <Button type="button" variant="destructive">
          Destructive
        </Button>
        <Button type="button" variant="accent">
          Accent
        </Button>
        <Button type="button" variant="outline-primary">
          Outline primary
        </Button>
        <Button type="button" variant="ghost-accent">
          Ghost accent
        </Button>
        <Button type="button" variant="link">
          Link
        </Button>
        <Button type="button" variant="muted">
          Muted
        </Button>
        <Button type="button" variant="circle" aria-label="Circle action">
          <Plus className="h-4 w-4" />
        </Button>
        <Button type="button" variant="none">
          None
        </Button>
      </StateRow>
      <StateRow label="Sizes">
        <Button type="button" size="xs">
          Extra small
        </Button>
        <Button type="button" size="sm">
          Small
        </Button>
        <Button type="button">Default</Button>
        <Button type="button" size="lg">
          Large
        </Button>
        <Button type="button" size="icon" aria-label="Add item">
          <Plus className="h-4 w-4" />
        </Button>
        <Button type="button" size="icon-rounded" aria-label="Add rounded item">
          <Plus className="h-4 w-4" />
        </Button>
        <Button type="button" size="inline">
          Inline
        </Button>
      </StateRow>
      <StateRow label="Content">
        <Button type="button" className="gap-2">
          Continue <ArrowRight className="h-4 w-4" />
        </Button>
        <Button type="button" variant="outline" className="gap-2">
          <Plus className="h-4 w-4" /> Add token
        </Button>
        <Button type="button">A deliberately longer action label</Button>
      </StateRow>
      <StateRow label="Unavailable">
        <Button type="button" disabled>
          Disabled
        </Button>
        <Button type="button" disabled className="gap-2" aria-busy="true">
          <LoaderCircle className="h-4 w-4 animate-spin" /> Loading
        </Button>
      </StateRow>
      <StateRow label="Interaction states">
        <Button type="button">Default</Button>
        <Button type="button" className="bg-primary/90">
          Hover preview
        </Button>
        <Button
          type="button"
          data-testid="design-system-focus-button"
          className="ring-2 ring-ring ring-offset-2"
        >
          Focus preview
        </Button>
        <span className="rounded-md border border-dashed border-border px-3 py-2 text-sm text-muted-foreground">
          Active · undefined
        </span>
      </StateRow>
    </div>
  </section>
)

const StateRow = ({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) => (
  <div className="grid gap-4 border-b border-border p-5 last:border-0 lg:grid-cols-[9rem_minmax(0,1fr)]">
    <h3 className="text-sm font-medium text-muted-foreground">{label}</h3>
    <div className="flex flex-wrap items-center gap-3">{children}</div>
  </div>
)

export default ButtonStateSheet
