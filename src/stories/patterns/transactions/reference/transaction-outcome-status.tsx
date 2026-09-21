import { Check } from 'lucide-react'

import { Spinner } from '@/components/design-system-v1/loading'
import { v1Typography } from '@/components/design-system-v1/typography'

export const TransactionOutcomeStatus = ({
  label = 'Completed',
  remaining,
  remainingAnnouncement,
  status = 'complete',
  testId = 'transaction-outcome-status',
}: {
  label?: string
  remaining?: string
  remainingAnnouncement?: string
  status?: 'complete' | 'delayed'
  testId?: string
}) => {
  const isDelayed = status === 'delayed'

  return (
    <div
      aria-label={
        isDelayed && remainingAnnouncement
          ? `${label}, ${remainingAnnouncement}`
          : undefined
      }
      data-outcome-status={status}
      data-testid={testId}
      className="flex h-8 items-center gap-2 rounded-full bg-card p-0.5 pr-3 text-foreground"
    >
      <span
        className={`flex size-7 items-center justify-center rounded-full ${
          isDelayed
            ? 'bg-foreground/10 text-foreground'
            : 'bg-primary text-primary-foreground'
        }`}
      >
        {isDelayed ? (
          <Spinner
            data-testid="transaction-outcome-progress"
            size={16}
            className="[animation-duration:4s]"
          />
        ) : (
          <Check aria-hidden="true" className="size-4 stroke-[1.5]" />
        )}
      </span>
      <span className="flex items-center gap-1">
        <span className={v1Typography.label}>{label}</span>
        {remaining && (
          <>
            <span aria-hidden="true" className="text-muted-foreground">
              ·
            </span>
            <span
              data-testid="transaction-outcome-remaining"
              className={`${v1Typography.label} tabular-nums`}
            >
              {remaining}
            </span>
          </>
        )}
      </span>
    </div>
  )
}
