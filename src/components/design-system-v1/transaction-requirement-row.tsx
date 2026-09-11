import type { ReactNode } from 'react'

import { v1Typography } from '@/components/design-system-v1/typography'
import {
  LifecycleStatusPill,
  type LifecycleStatusRole,
} from '@/components/lifecycle-status'
import { v1SemanticRoles as roles } from '@/components/design-system-v1/semantic-roles'
import { cn } from '@/lib/utils'

export interface TransactionRequirementRowProps {
  action?: ReactNode
  identity: ReactNode
  required: string
  requiredLabel?: string
  balance: string
  balanceLabel?: string
  status?: string
  statusRole?: LifecycleStatusRole
}

export const TransactionRequirementRow = ({
  action,
  balance,
  balanceLabel = 'Balance',
  identity,
  required,
  requiredLabel = 'Required',
  status,
  statusRole,
}: TransactionRequirementRowProps) => (
  <div
    data-testid="transaction-requirement-row"
    className={cn(
      'grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-3 border-b border-border px-4 py-4 last:border-b-0 sm:items-center',
      status || action
        ? 'sm:grid-cols-[minmax(8rem,1fr)_minmax(6rem,auto)_minmax(6rem,auto)_auto]'
        : 'sm:grid-cols-[minmax(8rem,1fr)_minmax(6rem,auto)_minmax(6rem,auto)]'
    )}
  >
    <div data-testid="transaction-requirement-identity" className="min-w-0">
      {identity}
    </div>
    <div className="col-start-1 row-start-2 sm:col-auto sm:row-auto sm:text-right">
      <p className={cn(v1Typography.supporting, roles.text.supporting)}>
        {requiredLabel}
      </p>
      <p className={cn(v1Typography.label, 'tabular-nums')}>{required}</p>
    </div>
    <div className="col-start-2 row-start-2 text-right sm:col-auto sm:row-auto">
      <p className={cn(v1Typography.supporting, roles.text.supporting)}>
        {balanceLabel}
      </p>
      <p className={cn(v1Typography.label, 'tabular-nums')}>{balance}</p>
    </div>
    {(status || action) && (
      <div className="col-start-2 row-start-1 flex flex-wrap items-center justify-end gap-2 sm:col-auto sm:row-auto">
        {status && statusRole && (
          <LifecycleStatusPill role={statusRole}>{status}</LifecycleStatusPill>
        )}
        {action}
      </div>
    )}
  </div>
)
