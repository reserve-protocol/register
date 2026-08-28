/**
 * Provisional transaction-task geometry shared by the current Zapper and
 * Vote Lock review compositions. This owns relationships only; flow anatomy,
 * copy, mechanics, and lifecycle remain composition-owned.
 */
export const transactionTaskGeometry = {
  substantialWidth: 'max-w-[432px]',
  compactHeaderInset: 'px-2 pb-4 pt-2',
  compactHeaderRow: 'flex min-h-8 items-center gap-4',
  submittedContentBoundary:
    'before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-border',
  factsRegion: 'border-t border-border divide-y divide-border',
  factList: 'divide-y divide-border',
  factRow: 'flex items-center justify-between gap-3 px-4 py-4',
  actionFooter: 'px-0 pb-0 pt-0',
} as const
