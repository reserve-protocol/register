import { candidateSemanticRoles as semanticRoles } from './semantic-roles'

// Shared relationships only; flow anatomy, mechanics, lifecycle, and copy remain composition-owned.
export const transactionTaskGeometry = {
  substantialWidth: 'max-w-[432px]',
  shellInset: 'p-2',
  contentInsetWithinShell: 'px-4',
  compactHeaderInset: 'px-2 pb-4 pt-2',
  compactHeaderRow: 'flex min-h-8 items-center gap-4',
  submittedContentBoundary:
    'before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-border',
  factsRegion: 'border-t border-border divide-y divide-border',
  actionFooter: 'px-0 pb-0 pt-0',
} as const

export const transactionAttachedRegionGeometry = {
  frame: 'overflow-hidden ring-2 ring-card ring-offset-0',
  content: 'relative z-10 bg-card',
  surface: semanticRoles.surface.subtleSubstrate,
} as const

export const transactionOutcomeGeometry = {
  minimumSurfaceHeight: 'min-h-[26rem]',
} as const
