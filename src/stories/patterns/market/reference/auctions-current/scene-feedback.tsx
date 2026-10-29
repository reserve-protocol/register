import { Skeleton } from '@/components/design-system-v1/loading'
import { v1Typography as type } from '@/components/design-system-v1/typography'
import { cn } from '@/lib/utils'
import type { Scenario } from './fixtures'

export function CurrentSceneFeedback({
  scenario,
  empty,
}: {
  scenario: Scenario
  empty: boolean
}) {
  if (scenario === 'loading')
    return (
      <Skeleton data-testid="current-list-loading" className="h-52 w-full" />
    )
  if (scenario === 'not-found')
    return (
      <p className={type.supporting}>
        no proposal matches this route. No launch state is inferred.
      </p>
    )
  if (!empty) return null
  return (
    <p
      data-testid="current-empty"
      role="status"
      className={cn(type.body, 'bg-card p-6 text-muted-foreground')}
    >
      No rebalances found
    </p>
  )
}
