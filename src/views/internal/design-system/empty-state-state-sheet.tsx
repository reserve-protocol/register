import { Button } from '@/components/button'
import { EmptyState } from '@/components/empty-state'
import { PackageOpen } from 'lucide-react'

const EmptyStateStateSheet = () => (
  <section
    data-testid="empty-state-state-sheet"
    className="space-y-4"
    aria-labelledby="empty-state-state-sheet-title"
  >
    <div>
      <h2 id="empty-state-state-sheet-title" className="text-xl font-medium">
        Accepted current baseline
      </h2>
      <p className="mt-1 max-w-3xl text-sm font-light leading-5 text-muted-foreground">
        Judge the shared hierarchy for quiet and actionable absence. The token
        picker supplies real evidence for the actionable role; host framing and
        its specific request channels are not part of the primitive. The
        optional icon is independent of mode and action count; one specimen
        shows it only to avoid repeating every combination.
      </p>
    </div>

    <div className="grid gap-0.5 bg-secondary p-0.5">
      <CandidateCell label="Quiet table absence">
        <EmptyState className="w-full" title="No proposals found" />
      </CandidateCell>
      <CandidateCell label="Actionable absence">
        <EmptyState
          className="w-full"
          mode="actionable"
          title="No tokens found"
          description="Request a token through Canny, or message us on Telegram."
          actions={
            <>
              <Button size="compact" tone="secondary">
                Open Canny
              </Button>
              <Button size="compact" tone="secondary">
                Open Telegram
              </Button>
            </>
          }
        />
      </CandidateCell>
      <CandidateCell label="Single primary action · icon shown">
        <EmptyState
          className="w-full"
          mode="actionable"
          icon={<PackageOpen />}
          title="No tokens in basket"
          description="An Index DTF is a tokenized basket of assets. Add the tokens that will compose your basket at launch."
          actions={<Button size="compact">Add token</Button>}
        />
      </CandidateCell>
    </div>

    <p className="border border-border bg-card p-4 text-sm font-light leading-5 text-muted-foreground">
      Illustration is intentionally absent from this contract. A small set of
      meaningful first-use or milestone states may earn bespoke artwork after
      visual review; routine no-results states do not.
    </p>
  </section>
)

const CandidateCell = ({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) => (
  <div className="min-w-0 bg-card">
    <p className="border-b border-border px-4 py-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
      {label}
    </p>
    <div className="flex min-h-64 items-center justify-center p-6">
      {children}
    </div>
  </div>
)

export default EmptyStateStateSheet
