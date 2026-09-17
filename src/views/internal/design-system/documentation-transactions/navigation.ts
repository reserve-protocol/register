import { msg } from '@lingui/core/macro'

export const TRANSACTION_DOCUMENTATION_SECTIONS = [
  { id: 'transactions-zapper', label: msg`Zapper` },
  { id: 'transactions-automated', label: msg`Automated issuance` },
  { id: 'transactions-stake', label: msg`Stake` },
  { id: 'transactions-vote-lock', label: msg`Vote lock` },
  { id: 'transactions-manual', label: msg`Manual issuance` },
] as const

export const TRANSACTION_DOCUMENTATION_SECTION_IDS =
  TRANSACTION_DOCUMENTATION_SECTIONS.map(({ id }) => id)
