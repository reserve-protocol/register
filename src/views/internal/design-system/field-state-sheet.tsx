import { AtSign, DollarSign } from 'lucide-react'

import {
  Field,
  FieldDescription,
  FieldLabel,
  FieldMessage,
  TextInput,
} from '@/components/design-system-v1/field'

const FieldStateSheet = () => (
  <section
    data-testid="field-state-sheet"
    className="space-y-4"
    aria-labelledby="field-state-sheet-title"
  >
    <div>
      <p className="text-sm font-medium text-primary">
        Reusable candidate · independent review
      </p>
      <h2 id="field-state-sheet-title" className="mt-1 text-xl font-medium">
        Field and TextInput
      </h2>
      <p className="mt-1 max-w-3xl text-sm font-light leading-6 text-muted-foreground">
        The candidate covers the ordinary short-value jobs evidenced in Index
        deploy and governance: visible labels, hints, filled values, prefixes,
        suffixes, validation, disabled state, and read-only addresses. It uses
        the accepted 44px atomic-control geometry and remains independent of
        SingleChoice and repeated parameter-group composition.
      </p>
    </div>

    <div className="grid gap-0.5 bg-secondary p-0.5 xl:grid-cols-3">
      <Specimen label="Empty · supporting hint">
        <Field className="w-full">
          <FieldLabel htmlFor="field-token-name">Token Name</FieldLabel>
          <TextInput
            id="field-token-name"
            placeholder="Enter token name"
            aria-describedby="field-token-name-help"
          />
          <FieldDescription id="field-token-name-help">
            The public name shown across the app.
          </FieldDescription>
        </Field>
      </Specimen>
      <Specimen label="Filled · leading adornment">
        <Field className="w-full">
          <FieldLabel htmlFor="field-symbol">Symbol</FieldLabel>
          <TextInput
            id="field-symbol"
            defaultValue="CMC20"
            leading={<DollarSign aria-hidden="true" />}
          />
        </Field>
      </Specimen>
      <Specimen label="Numeric · trailing unit">
        <Field className="w-full">
          <FieldLabel htmlFor="field-fee">Annualized TVL fee</FieldLabel>
          <TextInput
            id="field-fee"
            inputMode="decimal"
            defaultValue="1.50"
            trailing="%"
          />
        </Field>
      </Specimen>
      <Specimen label="Invalid · connected message">
        <Field className="w-full">
          <FieldLabel htmlFor="field-wallet">Wallet address</FieldLabel>
          <TextInput
            id="field-wallet"
            defaultValue="0x83a1…24"
            invalid
            aria-describedby="field-wallet-error"
            aria-errormessage="field-wallet-error"
          />
          <FieldMessage id="field-wallet-error">
            Enter a valid address.
          </FieldMessage>
        </Field>
      </Specimen>
      <Specimen label="Read only · derived value">
        <Field className="w-full">
          <FieldLabel htmlFor="field-governor">Governor</FieldLabel>
          <TextInput
            id="field-governor"
            defaultValue="0x6B17…1d0F"
            readOnly
            aria-describedby="field-governor-help"
          />
          <FieldDescription id="field-governor-help">
            Derived from the current governance deployment.
          </FieldDescription>
        </Field>
      </Specimen>
      <Specimen label="Disabled · unavailable">
        <Field className="w-full">
          <FieldLabel htmlFor="field-email">Email</FieldLabel>
          <TextInput
            id="field-email"
            defaultValue="team@reserve.org"
            leading={<AtSign aria-hidden="true" />}
            disabled
            aria-describedby="field-email-help"
          />
          <FieldDescription id="field-email-help">
            This field is currently unavailable.
          </FieldDescription>
        </Field>
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
    <div className="flex min-h-52 items-start p-5">{children}</div>
  </div>
)

export default FieldStateSheet
