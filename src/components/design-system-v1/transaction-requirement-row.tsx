import type { ReactNode } from 'react'

import { v1Typography } from '@/components/design-system-v1/typography'
import {
  LifecycleStatusPill,
  type LifecycleStatusRole,
} from '@/components/lifecycle-status'
import { v1SemanticRecipes as roles } from '@/components/ui/v1-semantic-recipes'
import { cn } from '@/lib/utils'

export interface TransactionRequirementRowProps {
  identity: ReactNode
  required: string
  balance: string
  balanceLabel?: string
  status: string
  statusRole: LifecycleStatusRole
}

export const TransactionRequirementRow = ({
  balance,
  balanceLabel = 'Balance',
  identity,
  required,
  status,
  statusRole,
}: TransactionRequirementRowProps) => (
  <div
    data-testid="transaction-requirement-row"
    className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-3 border-b border-border py-4 last:border-b-0 sm:grid-cols-[minmax(8rem,1fr)_minmax(6rem,auto)_minmax(6rem,auto)_auto] sm:items-center"
  >
    <div data-testid="transaction-requirement-identity" className="min-w-0">
      {identity}
    </div>
    <div className="col-start-1 row-start-2 sm:col-auto sm:row-auto sm:text-right">
      <p className={cn(v1Typography.supporting, roles.text.supporting)}>
        Required
      </p>
      <p className={cn(v1Typography.label, 'tabular-nums')}>{required}</p>
    </div>
    <div className="col-start-2 row-start-2 text-right sm:col-auto sm:row-auto">
      <p className={cn(v1Typography.supporting, roles.text.supporting)}>
        {balanceLabel}
      </p>
      <p className={cn(v1Typography.label, 'tabular-nums')}>{balance}</p>
    </div>
    <div className="col-start-2 row-start-1 flex flex-wrap items-center justify-end gap-2 sm:col-auto sm:row-auto">
      <LifecycleStatusPill role={statusRole}>{status}</LifecycleStatusPill>
    </div>
  </div>
)
