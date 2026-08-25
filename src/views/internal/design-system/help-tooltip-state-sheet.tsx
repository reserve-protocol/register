import { HelpTooltip } from '@/components/design-system-v1/help-tooltip'
import {
  Field,
  FieldDescription,
  FieldLabel,
  TextInput,
} from '@/components/design-system-v1/field'
import { Metric } from '@/components/metric'

const HelpTooltipStateSheet = () => (
  <section
    data-testid="help-tooltip-state-sheet"
    className="space-y-4"
    aria-labelledby="help-tooltip-title"
  >
    <div>
      <p className="text-sm font-medium text-primary">
        Reusable candidate · visual review
      </p>
      <h2 id="help-tooltip-title" className="mt-1 text-2xl font-light">
        Explanatory help
      </h2>
      <p className="mt-1 max-w-3xl text-sm font-light leading-5 text-muted-foreground">
        Judge the bare help trigger beside real label roles and the quiet
        floating surface. The icon supplements an already visible label; it is
        not an icon-only action name. Hover or focus opens brief explanation,
        while click keeps it available to touch users.
      </p>
    </div>

    <div className="grid gap-0.5 bg-secondary p-0.5 xl:grid-cols-2">
      <Specimen label="Field label · supplemental explanation">
        <Field className="w-full">
          <div className="flex items-center gap-1">
            <FieldLabel htmlFor="tooltip-voting-quorum">
              Voting quorum
            </FieldLabel>
            <HelpTooltip
              accessibleLabel="About voting quorum"
              content="The minimum percentage of votes that must be cast for a proposal to be eligible to pass."
            />
          </div>
          <TextInput
            id="tooltip-voting-quorum"
            defaultValue="20"
            inputMode="decimal"
            trailing="%"
          />
        </Field>
      </Specimen>

      <Specimen label="Metric label · parent-owned help">
        <div className="w-full space-y-3">
          <Metric
            label={
              <span className="flex items-center gap-1">
                TVL
                <HelpTooltip
                  accessibleLabel="About TVL"
                  content="Sum of all assets held in Reserve smart contracts."
                />
              </span>
            }
            value="$531M"
          />
          <Metric label="Market cap" value="$48.3M" />
        </div>
      </Specimen>

      <Specimen label="Boundary · essential instruction stays visible">
        <Field className="w-full">
          <FieldLabel htmlFor="tooltip-governor-address">
            Governor address
          </FieldLabel>
          <TextInput
            id="tooltip-governor-address"
            placeholder="0x…"
            aria-describedby="tooltip-governor-address-help"
          />
          <FieldDescription id="tooltip-governor-address-help">
            This address can create and execute governance proposals.
          </FieldDescription>
        </Field>
      </Specimen>

      <Specimen label="Boundary · other tooltip jobs stay separate">
        <p className="text-sm font-light leading-5 text-muted-foreground">
          Truncated-value disclosure, accessible naming for icon-only actions,
          and temporary “Copied” feedback may share the floating surface, but
          their state and trigger behavior remain owned by those components.
        </p>
      </Specimen>
    </div>
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
    <div className="flex min-h-44 items-center p-6">{children}</div>
  </div>
)

export default HelpTooltipStateSheet
