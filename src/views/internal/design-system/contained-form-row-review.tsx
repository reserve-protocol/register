import { Button } from '@/components/button'
import { SingleChoiceGroup } from '@/components/design-system-v1/single-choice-group'
import {
  Field,
  FieldDescription,
  FieldLabel,
  FieldMessage,
  TextArea,
  TextInput,
} from '@/components/design-system-v1/field'

const ContainedFormRowReview = () => (
  <div data-testid="contained-form-row-review" className="space-y-10">
    <section aria-labelledby="ordinary-field-stack-title" className="space-y-4">
      <div>
        <p className="text-sm font-medium text-primary">
          Canonical candidate · foundation consequence
        </p>
        <h2
          id="ordinary-field-stack-title"
          className="mt-1 text-2xl font-light"
        >
          Ordinary field stack
        </h2>
        <p className="mt-1 max-w-3xl text-sm font-light leading-6 text-muted-foreground">
          The label and control share one outer axis. Label, control, help, and
          validation use the accepted 8px related-content relationship; complete
          fields use 24px. One-row controls are fully rounded, while multiline
          input uses the restrained 8px contained-object radius.
        </p>
      </div>

      <div className="grid gap-0.5 bg-secondary p-0.5 xl:grid-cols-2">
        <Specimen label="Empty and supporting text">
          <Field className="w-full">
            <FieldLabel htmlFor="candidate-token-name">Token Name</FieldLabel>
            <TextInput
              id="candidate-token-name"
              placeholder="Enter token name"
              aria-describedby="candidate-token-name-help"
            />
            <FieldDescription id="candidate-token-name-help">
              The public name shown across the app.
            </FieldDescription>
          </Field>
        </Specimen>

        <Specimen label="Filled with suffix">
          <Field className="w-full">
            <FieldLabel htmlFor="candidate-initial-value">
              Initial value
            </FieldLabel>
            <TextInput
              id="candidate-initial-value"
              inputMode="decimal"
              defaultValue="1.00"
              trailing="USD"
            />
          </Field>
        </Specimen>

        <Specimen label="Invalid">
          <Field className="w-full">
            <FieldLabel htmlFor="candidate-wallet-address">
              Wallet address
            </FieldLabel>
            <TextInput
              id="candidate-wallet-address"
              defaultValue="0x83a1…24"
              invalid
              aria-describedby="candidate-wallet-address-error"
            />
            <FieldMessage id="candidate-wallet-address-error">
              Enter a valid address.
            </FieldMessage>
          </Field>
        </Specimen>

        <Specimen label="Multiline">
          <Field className="w-full">
            <FieldLabel htmlFor="candidate-mandate">Mandate</FieldLabel>
            <TextArea
              id="candidate-mandate"
              rows={4}
              placeholder="This Index DTF will…"
            />
          </Field>
        </Specimen>
      </div>
    </section>

    <section
      id="complex-field-group-review"
      aria-labelledby="complex-field-group-title"
      className="space-y-4"
    >
      <div>
        <p className="text-sm font-medium text-primary">
          Provisional composition · visual review
        </p>
        <h2 id="complex-field-group-title" className="mt-1 text-2xl font-light">
          Repeated governance parameters
        </h2>
        <p className="mt-1 max-w-3xl text-sm font-light leading-6 text-muted-foreground">
          Judge the unboxed hierarchy and density: does spacing plus a divider
          separate repeated parameters clearly enough without recreating the
          current stack of tinted mini-cards? The controls below are actual V1
          candidates rather than local substitutes.
        </p>
      </div>

      <div className="max-w-3xl bg-card p-6">
        <div className="space-y-1">
          <h3 className="text-2xl font-light leading-8">
            Governance parameters
          </h3>
          <p className="text-base font-light leading-6 text-muted-foreground">
            Configure how proposals are created, voted on, and executed.
          </p>
        </div>

        <div className="mt-6 divide-y divide-border">
          <GovernanceParameter
            title="Voting Delay"
            description="The time between a proposal being submitted and when governors can cast their votes."
            options={[
              { value: '0.5', label: '12 hours' },
              { value: '1', label: '1 day' },
              { value: '1.5', label: '1.5 days' },
              { value: '2', label: '2 days' },
            ]}
            selected="1"
            value="1"
            suffix="days"
          />
          <GovernanceParameter
            title="Voting Quorum"
            description="The minimum percentage of votes required for a proposal to be eligible to pass."
            options={[
              { value: '10', label: '10%' },
              { value: '15', label: '15%' },
              { value: '20', label: '20%' },
              { value: '25', label: '25%' },
            ]}
            selected="20"
            value="20"
            suffix="%"
          />
        </div>

        <Button className="mt-6 w-full">Continue</Button>
      </div>
    </section>
  </div>
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
    <div className="flex min-h-52 items-start p-6">{children}</div>
  </div>
)

const GovernanceParameter = ({
  description,
  options,
  selected,
  suffix,
  title,
  value,
}: {
  description: string
  options: Array<{ value: string; label: string }>
  selected: string
  suffix: string
  title: string
  value: string
}) => (
  <div className="space-y-4 py-6 first:pt-0 last:pb-0">
    <div className="space-y-1">
      <h4 className="text-base font-medium leading-6">{title}</h4>
      <p className="max-w-2xl text-sm font-light leading-5 text-muted-foreground">
        {description}
      </p>
    </div>
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <SingleChoiceGroup
        accessibleLabel={`${title} presets`}
        defaultValue={selected}
        options={options}
      />
      <TextInput
        className="sm:w-40"
        aria-label={`Custom ${title.toLowerCase()}`}
        defaultValue={value}
        trailing={suffix}
      />
    </div>
  </div>
)

export default ContainedFormRowReview
