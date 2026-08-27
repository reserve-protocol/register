import type { ReactNode } from 'react'
import { ArrowRight, Plus, Trash2 } from 'lucide-react'

import { Button, InlineAction } from '@/components/button'

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
        This sheet renders the accepted reusable V1 candidate—not a production
        baseline. It includes centered momentary press feedback and opaque
        semantic interaction colors. Button labels stay concise and single-line;
        constrained compositions restructure before overflow. Inline Action is
        the bounded text-action treatment for dense field accessories such as
        Max or Use; it is neither navigation nor a replacement for ordinary
        Buttons.
      </p>
    </div>

    <div className="border border-border bg-card">
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
      </StateRow>
      <StateRow label="Dense field action">
        <InlineAction>Max</InlineAction>
        <InlineAction disabled>Unavailable</InlineAction>
      </StateRow>
      <StateRow label="Unavailable">
        <Button disabled>Disabled</Button>
        <Button disabled tone="quiet">
          Quiet disabled
        </Button>
        <Button loading>Submitting…</Button>
        <Button tone="destructive" loading>
          Deleting…
        </Button>
      </StateRow>
      <StateRow label="Interaction states">
        <Button>Default</Button>
        <Button className="bg-primary-hover">Hover preview</Button>
        <Button data-testid="design-system-focus-button">Tab to focus</Button>
        <Button>Press and hold</Button>
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
