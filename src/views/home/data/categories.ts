import type { MessageDescriptor } from '@lingui/core'
import { msg } from '@lingui/core/macro'

export type CategoryKey =
  | 'deposits'
  | 'withdrawals'
  | 'sends'
  | 'card'
  | 'savings'
  | 'other'

export type Category = {
  key: CategoryKey
  label: MessageDescriptor
  color: string
}

// Two blues for money in and out, then one distinct hue per type so stacked segments can be told apart.
export const CATEGORIES: Category[] = [
  { key: 'deposits', label: msg`Deposits`, color: 'hsl(var(--primary))' },
  {
    key: 'withdrawals',
    label: msg`Withdrawals`,
    color: 'hsl(var(--primary) / 0.45)',
  },
  { key: 'sends', label: msg`Sends`, color: 'hsl(var(--chart-2))' },
  { key: 'card', label: msg`Card spends`, color: 'hsl(var(--chart-5))' },
  { key: 'savings', label: msg`Savings`, color: 'hsl(var(--chart-4))' },
  { key: 'other', label: msg`Other`, color: 'hsl(var(--legend) / 0.45)' },
]
