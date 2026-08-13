import { Check, CircleDashed, ExternalLink, MousePointer2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import ColorFoundationEvidence from './color-foundation-evidence'

const ICON_SAMPLES = [
  { name: 'Check', Icon: Check },
  { name: 'External link', Icon: ExternalLink },
  { name: 'Pointer', Icon: MousePointer2 },
] as const

const FoundationReference = ({ foundationId }: { foundationId: string }) => (
  <section aria-labelledby="current-evidence-heading" className="space-y-4">
    <div>
      <h2 id="current-evidence-heading" className="text-xl font-semibold">
        Current evidence
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Existing product sources are evidence, not an approved v1 decision.
      </p>
    </div>
    <div
      className={cn(
        foundationId !== 'color' &&
          'rounded-2xl border border-border bg-card p-5'
      )}
    >
      <FoundationEvidence foundationId={foundationId} />
    </div>
  </section>
)

const FoundationEvidence = ({ foundationId }: { foundationId: string }) => {
  if (foundationId === 'color') {
    return <ColorFoundationEvidence />
  }

  if (foundationId === 'typography') {
    return (
      <div className="space-y-4">
        <TypeSample label="Light · 300" className="font-light" />
        <TypeSample label="Medium · 500" className="font-medium" />
        <TypeSample label="Bold · 700" className="font-bold" />
      </div>
    )
  }

  if (foundationId === 'radius') {
    return (
      <div className="grid grid-cols-4 gap-3">
        <RadiusSample label="sm" className="rounded-sm" />
        <RadiusSample label="md" className="rounded-md" />
        <RadiusSample label="lg" className="rounded-lg" />
        <RadiusSample label="3xl" className="rounded-3xl" />
      </div>
    )
  }

  if (foundationId === 'layout') {
    return (
      <div className="space-y-4">
        <EvidenceList
          items={[
            '1400px centered outer container',
            '220px Index navigation rail',
            '1.5:1 governance and settings split',
            '2:1 deploy and manage split',
            'Fluid overview plus 480px support rail',
            '408–480px focused workflow widths',
          ]}
        />
        <p className="text-xs font-light leading-5 text-muted-foreground">
          Method: static source inspection of current Index layout classes and
          shared dialog defaults. Limits: these are implementation measurements,
          not runtime content-fit tests or approved V1 values.
        </p>
      </div>
    )
  }

  if (foundationId === 'motion') {
    return (
      <EvidenceList
        items={[
          'Fade in',
          'Slide up',
          'Accordion and dialog',
          'Spin and shimmer',
        ]}
      />
    )
  }

  if (foundationId === 'iconography') {
    return (
      <div className="flex flex-wrap gap-3">
        {ICON_SAMPLES.map(({ name, Icon }) => (
          <div
            key={name}
            className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted"
          >
            <Icon className="h-5 w-5" />
          </div>
        ))}
        <p className="flex items-center text-sm text-muted-foreground">
          Lucide plus legacy product and chain sources
        </p>
      </div>
    )
  }

  return (
    <div className="flex min-h-24 items-center gap-3 text-sm text-muted-foreground">
      <CircleDashed className="h-5 w-5 shrink-0" />
      No structured evidence has been added yet. The automated audit owns the
      next step.
    </div>
  )
}

const TypeSample = ({
  label,
  className,
}: {
  label: string
  className: string
}) => (
  <div className="flex items-baseline justify-between gap-4 border-b border-border pb-3 last:border-0 last:pb-0">
    <p className={cn('text-xl', className)}>
      Reserve builds durable onchain products.
    </p>
    <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
  </div>
)

const RadiusSample = ({
  label,
  className,
}: {
  label: string
  className: string
}) => (
  <div>
    <div
      className={cn('h-16 border border-primary bg-primary/10', className)}
    />
    <p className="mt-2 text-center text-xs text-muted-foreground">{label}</p>
  </div>
)

const EvidenceList = ({ items }: { items: string[] }) => (
  <ul className="grid gap-3 sm:grid-cols-2">
    {items.map((item) => (
      <li key={item} className="rounded-xl bg-muted p-3 text-sm">
        {item}
      </li>
    ))}
  </ul>
)

export default FoundationReference
