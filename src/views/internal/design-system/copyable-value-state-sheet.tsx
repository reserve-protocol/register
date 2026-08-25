import { CopyableValue } from '@/components/design-system-v1/copyable-value'

const CopyableValueStateSheet = () => (
  <section data-testid="copyable-value-state-sheet" className="space-y-5">
    <div>
      <p className="text-sm font-medium text-primary">Provisional candidate</p>
      <h2 className="mt-1 text-xl font-medium">Copyable value</h2>
      <p className="mt-1 max-w-3xl text-sm font-light leading-5 text-muted-foreground">
        Addresses use the product's deliberate shortened form by default; they
        are never clipped into an accidental trailing ellipsis. A full value is
        shown only when its composition provides enough room. The copy action
        owns its two-second transient feedback: the resting prompt uses the
        neutral Tooltip surface, then that same open surface transitions into
        semantic success color and a check mark without replaying entrance
        motion. Explanatory HelpTooltip is not involved.
      </p>
    </div>
    <div className="border border-border bg-card p-5">
      <ValueSpecimen label="Address · shortened default">
        <CopyableValue value="0x8ba1f109551bD432803012645Ac136ddd64DBA72" />
      </ValueSpecimen>
    </div>
    <p className="max-w-3xl text-xs font-light leading-5 text-muted-foreground">
      Review scope is the inline value, copy action, and transient feedback.
      Paired explorer actions and native/bridged chain-address lists are later
      compositions that consume this primitive; their layout is not approved
      here.
    </p>
  </section>
)

const ValueSpecimen = ({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) => (
  <div className="min-w-0 space-y-3">
    <p className="text-xs font-medium text-muted-foreground">{label}</p>
    {children}
  </div>
)

export default CopyableValueStateSheet
