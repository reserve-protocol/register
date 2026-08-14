import { Checkbox } from '@/components/checkbox'

const CheckboxStateSheet = () => (
  <section
    data-testid="checkbox-state-sheet"
    className="space-y-4"
    aria-labelledby="checkbox-state-sheet-title"
  >
    <div>
      <h2 id="checkbox-state-sheet-title" className="text-xl font-medium">
        Canonical candidate · selection mark
      </h2>
      <p className="mt-1 max-w-3xl text-sm font-light leading-6 text-muted-foreground">
        This candidate owns the 20px square mark and its essential binary
        states. Label, help, indeterminate, invalid, and rich-row composition
        remain outside this narrow promotion.
      </p>
    </div>
    <div className="grid gap-0.5 bg-secondary p-0.5 sm:grid-cols-3">
      <State label="Unchecked">
        <Checkbox aria-label="Unchecked checkbox" />
      </State>
      <State label="Checked">
        <Checkbox aria-label="Checked checkbox" checked />
      </State>
      <State label="Focus-visible">
        <Checkbox
          aria-label="Focused checkbox"
          className="ring-2 ring-ring ring-offset-2 ring-offset-card"
        />
      </State>
      <State label="Unchecked · disabled">
        <Checkbox aria-label="Disabled unchecked checkbox" disabled />
      </State>
      <State label="Checked · disabled">
        <Checkbox aria-label="Disabled checked checkbox" checked disabled />
      </State>
      <State label="Interactive proof">
        <label className="flex items-center gap-3 text-sm font-light">
          <Checkbox aria-label="Interactive checkbox" />
          Confirm independently
        </label>
      </State>
    </div>
  </section>
)

const State = ({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) => (
  <div className="bg-card p-4">
    <p className="mb-5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
      {label}
    </p>
    <div className="flex min-h-12 items-center">{children}</div>
  </div>
)

export default CheckboxStateSheet
