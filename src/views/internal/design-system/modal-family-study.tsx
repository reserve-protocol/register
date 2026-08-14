import { useState } from 'react'
import { Check, ChevronDown, Scale } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { modalFamilyAudit } from './modal-family-audit'

const PROHIBITED_JURISDICTIONS = [
  'Afghanistan',
  'Belarus',
  'Canada',
  'Crimea, Donetsk People’s Republic (DNR), Luhansk People’s Republic (LNR), Kherson and Zaporizhzhia regions (Ukraine), the city of Sevastopol',
  'Cuba',
  'Democratic Republic of Korea',
  'Iran',
  'Libya',
  'Myanmar',
  'Russia',
  'Somalia',
  'South Sudan',
  'Sudan',
  'Syria',
  'United States, or any of its states, possessions, territories or federal districts*',
]

const ModalFamilyStudy = () => (
  <section
    id="modal-family-study"
    className="scroll-mt-28 space-y-4"
    aria-labelledby="modal-family-heading"
  >
    <Heading />

    <div className="grid gap-px bg-secondary sm:grid-cols-2 xl:grid-cols-4">
      <Evidence value="19" label="Direct product dialogs found" />
      <Evidence value="3" label="Overlapping shell systems today" />
      <Evidence value="7" label="Real product jobs to cover" />
      <Evidence value="1" label="Real comparison ready" selected />
    </div>

    <EligibilityPressureTest />
    <SourceContract />
    <PressureTestQueue />
    <AuditMap />
  </section>
)

const Heading = () => (
  <div>
    <div className="flex flex-wrap items-center gap-2">
      <h2 id="modal-family-heading" className="text-xl font-semibold">
        Real modal pressure tests
      </h2>
      <span className="rounded-full bg-warning/10 px-2.5 py-1 text-xs font-medium ring-1 ring-inset ring-warning/30">
        Eligibility · first pass
      </span>
    </div>
    <p className="mt-1 max-w-4xl text-sm font-light leading-6 text-muted-foreground">
      Reconstruct real product requirements first, apply the provisional
      foundations second, and extract a shared modal grammar only after several
      different flows survive the same treatment.
    </p>
  </div>
)

const EligibilityPressureTest = () => (
  <article className="overflow-hidden border border-border bg-card">
    <div className="border-b border-border p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-primary">
        Real case 01 · confirm eligibility
      </p>
      <h3 className="mt-1 text-2xl font-light">
        Current implementation versus foundations applied
      </h3>
      <p className="mt-2 max-w-4xl text-sm font-light leading-6 text-muted-foreground">
        Both specimens preserve the real copy, three required attestations,
        expandable jurisdiction list, disabled-action logic, privacy note, and
        intentional lack of a close action. Try the checkboxes and disclosure.
      </p>
    </div>
    <div className="grid items-start gap-px bg-secondary xl:grid-cols-2">
      <SpecimenCanvas
        label="Source-faithful current baseline · 448px"
        status="Current"
      >
        <CurrentEligibilitySpecimen />
      </SpecimenCanvas>
      <SpecimenCanvas
        label="Same requirements with foundations applied · 432px"
        status="Candidate"
      >
        <CandidateEligibilitySpecimen />
      </SpecimenCanvas>
    </div>
  </article>
)

const CurrentEligibilitySpecimen = () => {
  const state = useEligibilityState()

  return (
    <div
      data-real-modal-specimen="eligibility-current"
      className="w-full max-w-[448px] rounded-4xl border-2 border-secondary bg-card p-2 shadow-lg"
    >
      <div className="p-4 pb-2">
        <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-full border border-foreground">
          <Scale className="h-5 w-5" strokeWidth={1.5} />
        </div>
        <p className="mb-2 text-base text-primary">Verify your eligibility</p>
        <h4 className="max-w-[320px] text-xl font-semibold leading-tight">
          Before continuing, please confirm the following
        </h4>
      </div>

      <div className="rounded-3xl border border-border bg-background">
        <CurrentAttestationRow
          id="current-terms"
          checked={state.acceptedTerms}
          onCheckedChange={state.setAcceptedTerms}
        >
          I have read and agree to the{' '}
          <InlineLink href="https://reserve.org/terms-and-conditions">
            Terms of Use
          </InlineLink>
          .
        </CurrentAttestationRow>
        <div className="border-t border-border" />
        <Collapsible>
          <CurrentAttestationRow
            id="current-jurisdiction"
            checked={state.confirmedJurisdiction}
            onCheckedChange={state.setConfirmedJurisdiction}
            trailing={<DisclosureButton />}
          >
            I confirm I am not located in, a resident of, or a citizen of a{' '}
            <InlineLink href="https://docs.ondo.finance/ondo-global-markets/eligibility">
              restricted jurisdiction
            </InlineLink>
            .
          </CurrentAttestationRow>
          <CurrentJurisdictionList />
        </Collapsible>
        <div className="border-t border-border" />
        <CurrentAttestationRow
          id="current-tokenized-stocks"
          checked={state.confirmedTokenizedStocks}
          onCheckedChange={state.setConfirmedTokenizedStocks}
        >
          I confirm that I am allowed to purchase tokenized stocks under the
          laws of my country of residence.
        </CurrentAttestationRow>
      </div>

      <Button
        className="mt-2 w-full rounded-2xl"
        size="lg"
        disabled={!state.canConfirm}
      >
        Confirm
      </Button>
      <PrivacyNote className="mt-2 px-4 pb-4" />
    </div>
  )
}

const CandidateEligibilitySpecimen = () => {
  const state = useEligibilityState()

  return (
    <div
      data-real-modal-specimen="eligibility-candidate"
      className="w-full max-w-[432px] bg-card p-2 shadow-lg"
    >
      <div className="px-4 pb-2 pt-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border">
          <Scale className="h-4 w-4" strokeWidth={1.5} />
        </span>
        <h4 className="mt-5 text-2xl font-light leading-8">
          Verify your eligibility
        </h4>
        <p className="mt-2 text-base font-light leading-6 text-muted-foreground">
          Before continuing, please confirm the following.
        </p>
      </div>

      <div className="divide-y divide-border px-4">
        <CandidateAttestationRow
          id="candidate-terms"
          checked={state.acceptedTerms}
          onCheckedChange={state.setAcceptedTerms}
        >
          I have read and agree to the{' '}
          <InlineLink href="https://reserve.org/terms-and-conditions">
            Terms of Use
          </InlineLink>
          .
        </CandidateAttestationRow>
        <Collapsible>
          <CandidateAttestationRow
            id="candidate-jurisdiction"
            checked={state.confirmedJurisdiction}
            onCheckedChange={state.setConfirmedJurisdiction}
            trailing={<DisclosureButton />}
          >
            I confirm I am not located in, a resident of, or a citizen of a{' '}
            <InlineLink href="https://docs.ondo.finance/ondo-global-markets/eligibility">
              restricted jurisdiction
            </InlineLink>
            .
          </CandidateAttestationRow>
          <CandidateJurisdictionList />
        </Collapsible>
        <CandidateAttestationRow
          id="candidate-tokenized-stocks"
          checked={state.confirmedTokenizedStocks}
          onCheckedChange={state.setConfirmedTokenizedStocks}
        >
          I confirm that I am allowed to purchase tokenized stocks under the
          laws of my country of residence.
        </CandidateAttestationRow>
      </div>

      <div className="px-4 pb-4 pt-3">
        <Button
          className="h-11 w-full rounded-full px-5 text-sm"
          disabled={!state.canConfirm}
        >
          Confirm
        </Button>
        <PrivacyNote className="mt-4" />
      </div>
    </div>
  )
}

const SourceContract = () => (
  <article className="overflow-hidden border border-border bg-card">
    <div className="border-b border-border p-5">
      <h3 className="font-medium">What the real modal is made from</h3>
      <p className="mt-1 max-w-4xl text-sm font-light leading-5 text-muted-foreground">
        This is the contract the redesign must support—not merely a screenshot
        of the current styling.
      </p>
    </div>
    <div className="grid gap-px bg-border lg:grid-cols-3">
      <ContractColumn
        title="Shared primitives"
        items={[
          'Radix Dialog and DialogContent',
          'Checkbox',
          'Collapsible and trigger',
          'Button',
        ]}
      />
      <ContractColumn
        title="Local composition"
        items={[
          'EligibilityCheck row',
          'Scale semantic lead',
          'Three attestation statements',
          'Restricted-jurisdiction list',
        ]}
      />
      <ContractColumn
        title="Behavior that must survive"
        items={[
          'Non-dismissible eligibility gate',
          'All checks required before confirm',
          'Expandable legal detail',
          'Wallet-scoped persistence and tracking',
        ]}
      />
    </div>
    <div className="grid gap-px bg-border lg:grid-cols-2">
      <ChangeColumn
        title="Foundations already applied"
        items={[
          '432px task width and stable workflow geometry',
          'Square structural shell; contained controls keep their shape',
          '24px content axis through the 8px shell inset',
          '24px light title, 16px light explanatory and row text',
          'Pill primary action at the 44px default height',
          'Gray dividers stay contained entirely within white',
        ]}
      />
      <ChangeColumn
        title="Components this case now asks us to refine"
        items={[
          'Dialog shell and non-dismissible header treatment',
          'Attestation or selectable text row',
          'Checkbox sizing and optical alignment with wrapping copy',
          'Inline legal link and disclosure trigger',
          'Long-content body ownership',
          'Disabled primary action and privacy-support copy',
        ]}
      />
    </div>
  </article>
)

const PressureTestQueue = () => (
  <article className="overflow-hidden border border-border bg-card">
    <div className="border-b border-border p-5">
      <h3 className="font-medium">Real modal sequence</h3>
      <p className="mt-1 max-w-4xl text-sm font-light leading-5 text-muted-foreground">
        We will not name the final modal variations until this small set proves
        which differences are structural and which are accidental.
      </p>
    </div>
    <div className="grid gap-px bg-border sm:grid-cols-2 xl:grid-cols-4">
      <QueueItem
        number="01"
        title="Eligibility"
        detail="Attestation, long copy, disclosure, gated action"
        status="Behavior reviewed"
      />
      <QueueItem
        number="02"
        title="Zapper"
        detail="Specialized input/output, quote detail, workflow states"
        status="Real evidence ready"
      />
      <QueueItem
        number="03"
        title="Liquidity config"
        detail="Ordinary input, slider, explanatory copy, save action"
        status="Action rule accepted"
      />
      <QueueItem
        number="04"
        title="Consequential completion"
        detail="Real confirmation details, next action and optional milestone illustration"
        status="Success composition next"
        active
      />
    </div>
  </article>
)

const AuditMap = () => (
  <article className="overflow-hidden border border-border bg-card">
    <div className="border-b border-border p-5">
      <h3 className="font-medium">Audit coverage map</h3>
      <p className="mt-1 max-w-4xl text-sm font-light leading-5 text-muted-foreground">
        These source-backed jobs tell us what still needs a real specimen. They
        do not prescribe layouts or preserve current styling.
      </p>
    </div>
    <div data-modal-audit-map className="grid gap-px bg-border lg:grid-cols-2">
      {modalFamilyAudit.map((entry) => (
        <div key={entry.job} data-modal-audit-entry className="bg-card p-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h4 className="font-medium">{entry.job}</h4>
            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-light">
              {entry.status}
            </span>
          </div>
          <p className="mt-2 text-xs font-light text-muted-foreground">
            {entry.evidence}
          </p>
          <p className="mt-3 text-sm font-light leading-5">
            {entry.requiredContent}
          </p>
          <p className="mt-3 text-xs font-light text-muted-foreground">
            Representative test: {entry.representativeTest}
          </p>
        </div>
      ))}
    </div>
  </article>
)

const CurrentAttestationRow = ({
  id,
  checked,
  onCheckedChange,
  trailing,
  children,
}: AttestationRowProps) => (
  <div className="flex items-center gap-4 p-4 sm:p-5">
    <Checkbox
      id={id}
      checked={checked}
      onCheckedChange={(value) => onCheckedChange(value === true)}
      className="h-6 w-6 shrink-0 rounded-full"
    />
    <label htmlFor={id} className="text-base leading-snug">
      {children}
    </label>
    {trailing}
  </div>
)

const CandidateAttestationRow = ({
  id,
  checked,
  onCheckedChange,
  trailing,
  children,
}: AttestationRowProps) => (
  <div className="flex min-h-16 items-center gap-4 py-3">
    <Checkbox
      id={id}
      checked={checked}
      onCheckedChange={(value) => onCheckedChange(value === true)}
      className="h-6 w-6 shrink-0 rounded-full"
    />
    <label htmlFor={id} className="text-base font-light leading-6">
      {children}
    </label>
    {trailing}
  </div>
)

type AttestationRowProps = {
  id: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  trailing?: React.ReactNode
  children: React.ReactNode
}

const DisclosureButton = () => (
  <CollapsibleTrigger
    className="group ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground"
    aria-label="Show restricted jurisdictions"
  >
    <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
  </CollapsibleTrigger>
)

const CurrentJurisdictionList = () => (
  <CollapsibleContent className="px-4 pb-4 sm:px-5">
    <JurisdictionList />
  </CollapsibleContent>
)

const CandidateJurisdictionList = () => (
  <CollapsibleContent className="border-t border-border py-4">
    <div className="max-h-44 overflow-y-auto pr-3">
      <JurisdictionList />
    </div>
  </CollapsibleContent>
)

const JurisdictionList = () => (
  <>
    <p className="mb-2 text-sm font-medium">Jurisdiction-Based Prohibitions:</p>
    <ul className="space-y-1 text-sm font-light leading-5 text-muted-foreground">
      {PROHIBITED_JURISDICTIONS.map((jurisdiction) => (
        <li key={jurisdiction}>{jurisdiction}</li>
      ))}
    </ul>
  </>
)

const InlineLink = ({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    className="text-primary underline underline-offset-2"
  >
    {children}
  </a>
)

const PrivacyNote = ({ className }: { className?: string }) => (
  <p
    className={`text-sm font-light leading-5 text-muted-foreground ${className}`}
  >
    Your privacy is protected. This confirmation is only ever associated with
    your wallet address — never your personal information.{' '}
    <InlineLink href="https://reserve.org/terms-and-conditions#privacy">
      Privacy Policy
    </InlineLink>
  </p>
)

const SpecimenCanvas = ({
  label,
  status,
  children,
}: {
  label: string
  status: string
  children: React.ReactNode
}) => (
  <div className="px-4 py-6">
    <div className="mb-4 flex items-center justify-center gap-2 text-xs">
      <span className="font-medium text-muted-foreground">{label}</span>
      <span className="rounded-full bg-card px-2 py-0.5 font-light text-muted-foreground">
        {status}
      </span>
    </div>
    <div className="flex justify-center">{children}</div>
  </div>
)

const Evidence = ({
  value,
  label,
  selected = false,
}: {
  value: string
  label: string
  selected?: boolean
}) => (
  <div className="bg-card p-5">
    <div className="flex items-center gap-2">
      {selected && <Check className="h-4 w-4 text-primary" />}
      <code className="text-sm font-medium">{value}</code>
    </div>
    <p className="mt-1 text-xs font-light text-muted-foreground">{label}</p>
  </div>
)

const ContractColumn = ({
  title,
  items,
}: {
  title: string
  items: string[]
}) => (
  <div className="bg-card p-5">
    <h4 className="font-medium">{title}</h4>
    <BulletList items={items} />
  </div>
)

const ChangeColumn = ContractColumn

const BulletList = ({ items }: { items: string[] }) => (
  <ul className="mt-3 space-y-2 text-sm font-light leading-5 text-muted-foreground">
    {items.map((item) => (
      <li key={item} className="flex gap-2">
        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
        <span>{item}</span>
      </li>
    ))}
  </ul>
)

const QueueItem = ({
  number,
  title,
  detail,
  status,
  active = false,
}: {
  number: string
  title: string
  detail: string
  status: string
  active?: boolean
}) => (
  <div
    className={`bg-card p-5 ${active ? 'ring-1 ring-inset ring-primary' : ''}`}
  >
    <span className="text-xs font-medium text-primary">{number}</span>
    <h4 className="mt-3 font-medium">{title}</h4>
    <p className="mt-1 text-sm font-light leading-5 text-muted-foreground">
      {detail}
    </p>
    <p className="mt-4 text-xs font-medium">{status}</p>
  </div>
)

const useEligibilityState = () => {
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [confirmedJurisdiction, setConfirmedJurisdiction] = useState(false)
  const [confirmedTokenizedStocks, setConfirmedTokenizedStocks] =
    useState(false)

  return {
    acceptedTerms,
    setAcceptedTerms,
    confirmedJurisdiction,
    setConfirmedJurisdiction,
    confirmedTokenizedStocks,
    setConfirmedTokenizedStocks,
    canConfirm:
      acceptedTerms && confirmedJurisdiction && confirmedTokenizedStocks,
  }
}

export default ModalFamilyStudy
