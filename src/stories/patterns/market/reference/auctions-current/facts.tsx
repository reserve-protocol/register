import type { ReactNode } from 'react'
import { Skeleton } from '@/components/design-system-v1/loading'
import { TransactionOutcomeDetailRow } from '../../../transactions/reference/transaction-outcome-detail-row'
import type { DataState } from './fixtures'

export function Fact({
  label,
  children,
  inline = false,
}: {
  label: ReactNode
  children: ReactNode
  inline?: boolean
}) {
  return (
    <TransactionOutcomeDetailRow
      testId="current-inline-fact"
      label={label}
      value={children}
      inline={inline}
      wrap
    />
  )
}

export function CurrentValue({
  children,
  data,
}: {
  children: ReactNode
  data: DataState
}) {
  if (data === 'pending')
    return <Skeleton className="inline-block h-5 w-16 align-middle" />
  if (data !== 'ready') return <span className="text-muted-foreground">—</span>
  return <span className="tabular-nums">{children}</span>
}
