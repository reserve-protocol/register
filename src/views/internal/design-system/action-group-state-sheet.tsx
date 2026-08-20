import { Button } from '@/components/button'
import { ActionGroup } from '@/components/design-system-v1/action-group'

const ActionGroupStateSheet = () => (
  <section
    data-testid="action-group-state-sheet"
    className="space-y-4"
    aria-labelledby="action-group-state-sheet-title"
  >
    <div>
      <p className="text-sm font-medium text-primary">
        Current baseline · layout recipe
      </p>
      <h2
        id="action-group-state-sheet-title"
        className="mt-1 text-xl font-medium"
      >
        Action groups
      </h2>
      <p className="mt-1 max-w-3xl text-sm font-light leading-6 text-muted-foreground">
        Prefer intrinsic-width horizontal groups when the actions fit. When a
        narrow surface needs a vertical group, switch deliberately to equal
        full-width default actions instead of stacking uneven compact buttons.
        The group owns only direction, width relationship, and the accepted 8px
        peer gap; Button still owns hierarchy, size, and state. The owning
        composition chooses the actions, order, labels, and whether icons help.
      </p>
    </div>

    <div className="grid gap-0.5 bg-secondary p-0.5 xl:grid-cols-3">
      <Specimen label="Related actions · horizontal compact">
        <ActionGroup>
          <Button size="compact" tone="secondary">
            New mint
          </Button>
          <Button size="compact">View DTF</Button>
        </ActionGroup>
      </Specimen>
      <Specimen label="Destructive confirmation · horizontal default">
        <ActionGroup>
          <Button tone="secondary">Close</Button>
          <Button tone="destructive">Cancel proposal</Button>
        </ActionGroup>
      </Specimen>
      <Specimen label="Narrow task · vertical shared width">
        <ActionGroup direction="vertical" className="max-w-72">
          <Button>Continue</Button>
          <Button tone="secondary">Review details</Button>
        </ActionGroup>
      </Specimen>
    </div>

    <p className="border border-border bg-card p-4 text-sm font-light leading-6 text-muted-foreground">
      Do not allow a horizontal group to wrap into a ragged partial stack. The
      owning composition chooses the vertical recipe when its available width
      cannot preserve the horizontal relationship. Transaction lifecycle stays
      in Transaction action rather than becoming an Action group variant. These
      specimens validate layout only; they do not approve a completion flow or
      prescribe icons for its actions.
    </p>
  </section>
)

const Specimen = ({
  children,
  label,
}: {
  children: React.ReactNode
  label: string
}) => (
  <div className="min-w-0 bg-card">
    <p className="border-b border-border px-4 py-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
      {label}
    </p>
    <div className="flex min-h-36 items-center overflow-x-auto p-5">
      {children}
    </div>
  </div>
)

export default ActionGroupStateSheet
