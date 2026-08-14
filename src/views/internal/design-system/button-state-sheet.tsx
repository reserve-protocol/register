import type { ReactNode } from 'react'
import { ArrowRight, Plus, Trash2 } from 'lucide-react'

import { Button } from '@/components/button'

const ButtonStateSheet = () => (
  <section id="buttons" aria-labelledby="buttons-heading" className="space-y-5">
    <div>
      <p className="text-sm font-medium text-primary">
        Actions · canonical candidate
      </p>
      <h2 id="buttons-heading" className="mt-1 text-2xl font-semibold">
        Button state sheet
      </h2>
      <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
        This sheet renders the reusable V1 candidate—not a local visual replica
        or the production baseline. Pressed treatment and long-label behavior
        remain intentionally open.
      </p>
    </div>

    <div className="overflow-hidden border border-border bg-card">
      <StateRow label="Hierarchy">
        <Button>Primary</Button>
        <Button tone="secondary">Secondary</Button>
        <Button tone="quiet">Quiet</Button>
        <Button tone="destructive" leadingIcon={<Trash2 />}>
          Delete
        </Button>
      </StateRow>
      <StateRow label="Sizes">
        <Button size="micro" tone="secondary">
          Micro
        </Button>
        <Button size="compact" tone="secondary">
          Compact
        </Button>
        <Button tone="secondary">Default</Button>
      </StateRow>
      <StateRow label="Content">
        <Button leadingIcon={<Plus />}>Add token</Button>
        <Button trailingIcon={<ArrowRight />}>Continue</Button>
        <Button>A deliberately longer action label</Button>
      </StateRow>
      <StateRow label="Unavailable">
        <Button disabled>Disabled</Button>
        <Button loading>Submitting…</Button>
        <Button tone="destructive" loading>
          Deleting…
        </Button>
      </StateRow>
      <StateRow label="Interaction states">
        <Button>Default</Button>
        <Button className="bg-primary/80">Hover preview</Button>
        <Button data-testid="design-system-focus-button">
          Focus with keyboard
        </Button>
        <span className="border border-dashed border-border px-3 py-2 text-sm text-muted-foreground">
          Pressed · open
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
