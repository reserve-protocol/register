import { ArrowDown } from 'lucide-react'

export const TransactionStageBoundary = ({ testId }: { testId: string }) => (
  <div
    aria-hidden="true"
    data-testid={testId}
    className="relative z-10 h-0.5 shrink-0 bg-secondary"
  >
    <span
      data-testid={`${testId}-indicator`}
      className="absolute left-1/2 top-1/2 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-secondary"
    >
      <span
        data-testid={`${testId}-indicator-core`}
        className="flex size-8 items-center justify-center rounded-full bg-card text-muted-foreground"
      >
        <ArrowDown className="size-4" strokeWidth={1.5} />
      </span>
    </span>
  </div>
)
