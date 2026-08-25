import {
  Field,
  FieldDescription,
  FieldLabel,
  FieldMessage,
  TextArea,
} from '@/components/design-system-v1/field'

const TextAreaStateSheet = () => (
  <section data-testid="textarea-state-sheet" className="space-y-5">
    <div>
      <p className="text-sm font-medium text-primary">
        Accepted current baseline
      </p>
      <h2 className="mt-1 text-xl font-medium">Multiline Field</h2>
      <p className="mt-1 max-w-3xl text-sm font-light leading-5 text-muted-foreground">
        Textarea inherits Field anatomy and state semantics, including the 20px
        horizontal field inset, while using a 16px multiline vertical inset,
        restrained object radius, and vertical resize. Character counting and
        rich text remain outside the contract.
      </p>
    </div>
    <div className="grid gap-6 border border-border bg-card p-5 xl:grid-cols-2">
      <Field>
        <FieldLabel htmlFor="governance-rationale">
          Governance rationale
        </FieldLabel>
        <TextArea
          id="governance-rationale"
          aria-describedby="governance-rationale-description"
          defaultValue="Explain why this proposal improves the DTF mandate and how delegates should evaluate it."
        />
        <FieldDescription id="governance-rationale-description">
          Visible to delegates before they vote.
        </FieldDescription>
      </Field>
      <Field>
        <FieldLabel htmlFor="deploy-summary">Deployment summary</FieldLabel>
        <TextArea
          id="deploy-summary"
          invalid
          aria-describedby="deploy-summary-error"
          aria-errormessage="deploy-summary-error"
          defaultValue="Missing required risk controls."
        />
        <FieldMessage id="deploy-summary-error">
          Describe the intended risk controls.
        </FieldMessage>
      </Field>
      <Field>
        <FieldLabel htmlFor="readonly-rationale">
          Submitted rationale
        </FieldLabel>
        <TextArea
          id="readonly-rationale"
          readOnly
          aria-describedby="readonly-rationale-description"
          value="This rationale is locked after submission."
        />
        <FieldDescription id="readonly-rationale-description">
          Read-only values remain selectable.
        </FieldDescription>
      </Field>
      <Field>
        <FieldLabel htmlFor="disabled-summary">Unavailable summary</FieldLabel>
        <TextArea
          id="disabled-summary"
          disabled
          value="Available after wallet connection."
        />
      </Field>
    </div>
  </section>
)

export default TextAreaStateSheet
