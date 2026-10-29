import { LifecycleStatusPill } from '@/components/lifecycle-status'
import { v1Typography as type } from '@/components/design-system-v1/typography'
import { cn } from '@/lib/utils'
import { parseDurationShort } from '@/utils'
import type { WithdrawalFixture } from './fixtures'
import type { WithdrawalPreview } from './withdrawals'

export const WithdrawalProgress = ({
  row,
  state,
  showAvailabilityLabel = false,
}: {
  row: WithdrawalFixture
  state: WithdrawalPreview
  showAvailabilityLabel?: boolean
}) => {
  if (state === 'withdrawn')
    return <LifecycleStatusPill role="success">Withdrawn</LifecycleStatusPill>
  if (row.remaining <= 0)
    return <LifecycleStatusPill role="actionable">Ready</LifecycleStatusPill>
  const fraction = Math.min(
    1,
    Math.max(0, (row.delay - row.remaining) / row.delay)
  )
  return (
    <span
      className={cn(
        type.body,
        'inline-flex items-center gap-2 whitespace-nowrap text-supporting-foreground'
      )}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        aria-hidden
        className="-rotate-90"
      >
        <circle
          cx="8"
          cy="8"
          r="6"
          fill="none"
          strokeWidth="2"
          className="stroke-border"
        />
        <circle
          cx="8"
          cy="8"
          r="6"
          fill="none"
          strokeWidth="2"
          pathLength="1"
          strokeDasharray={`${fraction} 1`}
          className="stroke-primary"
        />
      </svg>
      <span>
        {showAvailabilityLabel && 'Available in '}
        {parseDurationShort(row.remaining, {
          units: ['d', 'h', 'm'],
          round: true,
        })
          .replaceAll(' ', '')
          .replaceAll(',', ' ')}
      </span>
    </span>
  )
}
