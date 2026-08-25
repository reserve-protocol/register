import { Button } from '@/components/button'
import { Link as V1Link } from '@/components/design-system-v1/link'
import { cn } from '@/lib/utils'
import { ArrowLeft, ArrowRight, Download } from 'lucide-react'
import { Link as RouterLink } from 'react-router-dom'

const LinkStateSheet = () => (
  <section
    data-testid="link-state-sheet"
    className="space-y-6"
    aria-labelledby="link-state-sheet-title"
  >
    <div>
      <p className="text-sm font-medium text-primary">
        Accepted current baseline
      </p>
      <h2 id="link-state-sheet-title" className="mt-1 text-xl font-medium">
        Navigation links
      </h2>
      <p className="mt-1 max-w-3xl text-sm font-light leading-5 text-muted-foreground">
        The accepted link treatments are shown inside realistic product
        hierarchy: inline policy copy, return navigation, and downloadable
        resources. The surrounding contexts are evidence, not new composition
        proposals. Current route, visited, disabled-link, product navigation,
        tabs, breadcrumbs, and production adoption remain outside this contract.
      </p>
    </div>

    <div className="grid gap-0.5 bg-secondary p-0.5 xl:grid-cols-2">
      <CandidateCell label="Inline content · inherited type">
        <p className="max-w-md text-base font-light leading-6">
          Review the{' '}
          <V1Link
            data-testid="design-system-link-inline"
            href="https://reserve.org/terms_and_conditions/"
          >
            Terms and Conditions
          </V1Link>{' '}
          before interacting with an Index DTF.
        </p>
      </CandidateCell>

      <CandidateCell label="Return navigation · proposal header">
        <div className="w-full max-w-md">
          <V1Link asChild treatment="return">
            <RouterLink to="/internal/design-system/components">
              <ArrowLeft
                aria-hidden="true"
                className="size-4"
                strokeWidth={1.5}
              />
              Back to governance
            </RouterLink>
          </V1Link>
          <div className="mt-4 space-y-1">
            <p className="text-sm font-light text-muted-foreground">
              Governance proposal
            </p>
            <h3 className="text-xl font-medium">
              Update the DTF revenue distribution
            </h3>
          </div>
        </div>
      </CandidateCell>

      <CandidateCell
        className="xl:col-span-2"
        label="External resource · DTF overview"
      >
        <div className="w-full max-w-md space-y-4">
          <div className="space-y-1">
            <h3 className="text-base font-medium">Downloadable resources</h3>
            <p className="text-sm font-light leading-5 text-muted-foreground">
              Read the methodology and investment thesis for this DTF.
            </p>
          </div>
          <V1Link
            data-testid="design-system-link-long-external"
            href="https://docs.reserve.org/"
            external
            externalAnnouncement=", opens in a new tab"
            externalIcon={
              <Download aria-hidden="true" className="size-4 shrink-0" />
            }
            treatment="standalone"
          >
            DTF methodology and investment thesis
          </V1Link>
        </div>
      </CandidateCell>
    </div>

    <div className="border border-border bg-card p-5">
      <p className="text-sm font-medium">
        Implementation evidence · Button-shaped navigation
      </p>
      <p className="mt-1 max-w-3xl text-sm font-light leading-5 text-muted-foreground">
        A destination that earns primary-action hierarchy composes the canonical
        Button as a real anchor. This verifies semantics and does not introduce
        another Link appearance.
      </p>
      <Button
        asChild
        className="mt-4"
        data-testid="design-system-link-button-route"
        trailingIcon={<ArrowRight aria-hidden="true" strokeWidth={1.5} />}
      >
        <RouterLink to="/internal/design-system/screens">
          View proposals
        </RouterLink>
      </Button>
    </div>

    <p className="border border-border bg-card p-4 text-sm font-light leading-5 text-muted-foreground">
      Named return links are not the universal back-navigation default. Use them
      when naming the parent improves orientation; compact headers with an
      already-obvious parent use the canonical framed IconButton instead.{' '}
      Unavailable destinations are not anchors. Render explanatory text or the
      owning disabled control until a real destination exists. Product
      navigation, tab-like routes, and breadcrumbs keep their separate
      composition contracts.
    </p>
  </section>
)

const CandidateCell = ({
  className,
  label,
  children,
}: {
  className?: string
  label: string
  children: React.ReactNode
}) => (
  <div className={cn('min-w-0 bg-card', className)}>
    <p className="border-b border-border px-4 py-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
      {label}
    </p>
    <div className="flex min-h-40 items-center p-6">{children}</div>
  </div>
)

export default LinkStateSheet
