import { Check, ChevronDown, CircleCheck, ExternalLink, X } from 'lucide-react'
import { ZapperModalSpecimen } from './zapper-modal-study'
import { ComponentReviewReadiness } from './catalog-ui'

const ModalGeometryStudy = () => (
  <section
    id="modal-geometry-study"
    className="scroll-mt-28 space-y-4"
    aria-labelledby="modal-geometry-heading"
  >
    <Heading />

    <ComponentReviewReadiness
      testId="modal-geometry-readiness"
      review={{
        status: 'provisional',
        scope:
          'Use these copied specimens to judge width and state continuity only. Their bodies, actions, and outcome layouts are not canonical dialog compositions.',
        dependencies: [
          { name: '432/384px width roles', status: 'canonical' },
          { name: 'Dialog shell', status: 'canonical' },
          { name: 'Zapper body copy', status: 'provisional' },
          { name: 'Outcome composition', status: 'blocked' },
        ],
      }}
    />

    <div className="grid gap-px bg-secondary sm:grid-cols-2 lg:grid-cols-4">
      <Evidence value="432px" label="Substantial task dialog" selected />
      <Evidence value="384px" label="Compact confirmation" selected />
      <Evidence value="Open" label="Wide comparison role" />
      <Evidence value="Viewport-aware" label="Narrow-screen behavior" />
    </div>

    <StudyCard
      label="One Zapper width across the workflow"
      copy="Quote entry and completion both stay 432px. The finished state is not a tiny message: the real package includes received value, USD used, a transaction link, collapsible details, and sometimes contact capture."
    >
      <div className="grid items-start gap-px bg-secondary xl:grid-cols-2">
        <SpecimenCanvas label="Quote ready · rounded-number stress case">
          <ZapperModalSpecimen
            widthClass="max-w-[432px]"
            amount="1,234,567.89"
          />
        </SpecimenCanvas>
        <SpecimenCanvas label="Successful purchase · details expanded">
          <ZapperSuccessModal />
        </SpecimenCanvas>
      </div>
    </StudyCard>

    <StudyCard
      label="Compact is a content role, not a Zapper state"
      copy="A consequential acknowledgement with one useful next action can use 384px. Routine non-blocking results use a toast instead. If the outcome gains transaction details, forms, warnings, or multiple decisions, it moves to the 432px task role."
    >
      <div className="flex justify-center bg-secondary px-4 py-6 sm:px-8">
        <CompactConfirmation />
      </div>
    </StudyCard>

    <div className="grid gap-2 text-sm font-light text-muted-foreground md:grid-cols-3">
      <Rule title="State continuity">
        A workflow does not resize as it moves through input, pending, error, or
        success states.
      </Rule>
      <Rule title="Round for reading">
        Output amounts use separators and a deliberate significant-digit limit;
        full precision remains available in details or copy affordances.
      </Rule>
      <Rule title="Width follows structure">
        Use 384px only for truly short acknowledgement. Use 432px for forms,
        transaction detail, warnings, or multiple decisions.
      </Rule>
    </div>
  </section>
)

const Heading = () => (
  <div>
    <div className="flex flex-wrap items-center gap-2">
      <h2 id="modal-geometry-heading" className="text-xl font-semibold">
        Modal width and state continuity
      </h2>
      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
        Provisional
      </span>
    </div>
    <p className="mt-1 max-w-3xl text-sm font-light leading-5 text-muted-foreground">
      Start with two deliberate widths rather than allowing every modal to size
      itself: one substantial task role and one genuinely compact role.
    </p>
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
      <code className="text-sm font-medium text-foreground">{value}</code>
    </div>
    <p className="mt-1 text-xs font-light text-muted-foreground">{label}</p>
  </div>
)

const StudyCard = ({
  label,
  copy,
  children,
}: {
  label: string
  copy: string
  children: React.ReactNode
}) => (
  <article className="overflow-hidden border border-border bg-card">
    <div className="border-b border-border p-5">
      <h3 className="font-medium">{label}</h3>
      <p className="mt-1 max-w-4xl text-sm font-light leading-5 text-muted-foreground">
        {copy}
      </p>
    </div>
    {children}
  </article>
)

const SpecimenCanvas = ({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) => (
  <div className="px-4 py-6">
    <p className="mb-4 text-center text-xs font-medium text-muted-foreground">
      {label}
    </p>
    <div className="flex justify-center">{children}</div>
  </div>
)

const ZapperSuccessModal = () => (
  <div
    data-modal-width-specimen="standard"
    className="w-full max-w-[432px] bg-card p-2 shadow-lg"
  >
    <div className="space-y-4 px-4 pb-4 pt-2">
      <div className="flex items-center justify-between">
        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-success text-success">
          <CircleCheck className="h-4 w-4" />
        </span>
        <button
          type="button"
          aria-label="Close Zapper success specimen"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="bg-success/10 px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-medium">Successful purchase</h3>
          <button
            type="button"
            className="flex shrink-0 items-center gap-1 text-sm font-light"
          >
            Hide details <ChevronDown className="h-4 w-4" />
          </button>
        </div>
        <dl className="mt-4 space-y-3 text-sm font-light">
          <DetailRow label="Received">
            <span className="tabular-nums">1,234,567.89 LCAP</span>
          </DetailRow>
          <DetailRow label="Used">
            <span className="tabular-nums">$87.37</span>
          </DetailRow>
          <DetailRow label="Transaction">
            <span className="flex items-center gap-1 text-primary">
              0x91d…3af2 <ExternalLink className="h-3.5 w-3.5" />
            </span>
          </DetailRow>
        </dl>
      </div>

      <div className="space-y-1 py-2">
        <h4 className="text-xl font-light">Stay informed about this DTF</h4>
        <p className="text-sm font-light leading-5 text-muted-foreground">
          Get relevant updates about changes that may affect this DTF.
        </p>
      </div>

      <button
        type="button"
        className="flex h-11 w-full items-center justify-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground"
      >
        Close
      </button>
    </div>
  </div>
)

const DetailRow = ({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) => (
  <div className="grid grid-cols-[92px_minmax(0,1fr)] items-center gap-4">
    <dt className="font-medium">{label}</dt>
    <dd className="min-w-0 truncate">{children}</dd>
  </div>
)

const CompactConfirmation = () => (
  <div
    data-modal-width-specimen="compact"
    className="w-full max-w-[384px] bg-card p-2 shadow-lg"
  >
    <div className="flex justify-end px-2 pt-1">
      <button
        type="button"
        aria-label="Close compact confirmation specimen"
        className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
    <div className="px-4 pb-4 pt-5 text-center">
      <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-success text-success">
        <CircleCheck className="h-4 w-4" />
      </span>
      <h3 className="mt-4 text-2xl font-light">Proposal submitted</h3>
      <p className="mx-auto mt-2 max-w-[30ch] text-sm font-light leading-5 text-muted-foreground">
        Your proposal is onchain and ready for the community to review.
      </p>
      <button
        type="button"
        className="mt-8 flex h-11 w-full items-center justify-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground"
      >
        View proposal
      </button>
    </div>
  </div>
)

const Rule = ({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) => (
  <div className="border border-border bg-card p-4">
    <div className="flex items-center gap-2">
      <Check className="h-3.5 w-3.5 text-primary" />
      <p className="font-medium text-foreground">{title}</p>
    </div>
    <p className="mt-2 text-xs leading-5">{children}</p>
  </div>
)

export default ModalGeometryStudy
