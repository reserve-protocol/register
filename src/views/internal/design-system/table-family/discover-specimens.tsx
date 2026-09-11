import { Specimen } from './cell-specimens'
import { DiscoverIdentity, DiscoverBasket } from './discover-cells'
import { DiscoverPerformance } from './discover-performance'
import { DISCOVER } from './discover-fixtures'
import { v1Typography as type } from '@/components/design-system-v1/typography'
import { cn } from '@/lib/utils'

export function DiscoverSpecimens() {
  const lcap = DISCOVER.find((row) => row.symbol === 'LCAP')!
  const buildout = DISCOVER.find((row) => row.symbol === 'BUILDOUT')!
  return (
    <div className="space-y-4">
      <p className={cn(type.supporting, 'text-supporting-foreground')}>
        Cell examples — individual building blocks, not a table row.
      </p>
      <div className="grid gap-4 lg:grid-cols-3" data-testid="discover-cells">
        <Specimen label="Identity and classifications">
          <DiscoverIdentity row={lcap} />
        </Specimen>
        <Specimen label="Held-token basket · inspect all assets">
          <DiscoverBasket row={buildout} />
        </Specimen>
        <Specimen label="Return and trend · same period">
          <DiscoverPerformance row={buildout} />
        </Specimen>
      </div>
    </div>
  )
}
