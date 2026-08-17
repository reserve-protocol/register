/**
 * Intent-based layout relationships accepted by the V1 spacing foundation.
 *
 * These recipes prevent reviewable compositions from selecting raw spacing
 * values without naming the relationship they represent. Component-specific
 * geometry remains owned by the component contract.
 */
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
