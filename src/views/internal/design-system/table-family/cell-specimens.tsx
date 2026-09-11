import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { v1Typography as type } from '@/components/design-system-v1/typography'
import { IdentityCell, NumericCell, PerformanceCell } from './cells'
import { POSITIONS, WITHDRAWALS, value } from './fixtures'
import { WithdrawalProgress } from './progress'

export const Specimen = ({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) => (
  <div data-slot="cell-specimen" className="min-w-0 space-y-4 bg-card p-6">
    <h3 className={type.supporting}>{label}</h3>
    <div data-slot="cell-example" className="flex h-20 items-center gap-6">
      {children}
    </div>
  </div>
)

export function CellSpecimens() {
  return (
    <div className="space-y-4">
      <p className={cn(type.supporting, 'text-supporting-foreground')}>
        Cell examples — individual building blocks, not a table row.
      </p>
      <div
        data-testid="table-family-cells"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <Specimen label="Identity">
          <IdentityCell {...POSITIONS[0]} />
        </Specimen>
        <Specimen label="Zero / unavailable">
          <span data-testid="cell-zero">
            <NumericCell value={value('$0.00', 0n)} />
          </span>
          <span data-testid="cell-unavailable">
            <NumericCell value={null} />
          </span>
        </Specimen>
        <Specimen label="Performance (7D)">
          <span>
            <PerformanceCell value={4.21} />
          </span>
          <span>
            <PerformanceCell value={-1.28} />
          </span>
        </Specimen>
        <Specimen label="Progress">
          <WithdrawalProgress row={WITHDRAWALS[0]} state="idle" />
          <WithdrawalProgress row={WITHDRAWALS[1]} state="idle" />
        </Specimen>
      </div>
    </div>
  )
}
