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

// Stacks read by opacity steps of one hue, so they do not depend on telling hues apart.
export const CATEGORIES: Category[] = [
  { key: 'deposits', label: msg`Deposits`, color: 'hsl(var(--primary))' },
  {
    key: 'withdrawals',
    label: msg`Withdrawals`,
    color: 'hsl(var(--primary) / 0.72)',
  },
  { key: 'sends', label: msg`Sends`, color: 'hsl(var(--primary) / 0.48)' },
  { key: 'card', label: msg`Card spends`, color: 'hsl(var(--primary) / 0.28)' },
  { key: 'savings', label: msg`Savings`, color: 'hsl(var(--success))' },
  { key: 'other', label: msg`Other`, color: 'hsl(var(--legend) / 0.45)' },
]
