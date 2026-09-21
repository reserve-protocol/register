// Relationships remain separate from component-owned geometry and semantic colors.
export const v1LayoutRecipes = {
  inset: {
    ordinaryContent: 'p-6',
    nestedContent: 'p-4',
  },
  stack: {
    tightText: 'space-y-1',
    relatedContent: 'space-y-2',
    internalRegions: 'space-y-4',
    completeGroups: 'space-y-6',
    majorRegions: 'space-y-8',
  },
  cluster: {
    tightText: 'gap-1',
    relatedContent: 'gap-2',
    internalRegions: 'gap-4',
    completeGroups: 'gap-6',
  },
  seam: {
    subsection: 'gap-px',
    major: 'gap-0.5',
  },
} as const
