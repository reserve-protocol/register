export type CurrentReviewType =
  | 'visual decision'
  | 'canonical review'
  | 'real-screen validation'

export const FOUNDATION_CONFORMANCE_AREAS = [
  'spacing',
  'typography',
  'color',
  'radius',
  'component-dependencies',
] as const

export type FoundationConformanceArea =
  (typeof FOUNDATION_CONFORMANCE_AREAS)[number]

export type FoundationConformanceStatus =
  | 'conforms'
  | 'declared-provisional'
  | 'not-applicable'

export interface FoundationConformanceClaim {
  area: FoundationConformanceArea
  status: FoundationConformanceStatus
  detail: string
  verification: string
}

export interface CurrentReviewItem {
  componentId: string
  title: string
  reason: string
  destination: string
  type: CurrentReviewType
  foundationConformance: FoundationConformanceClaim[]
}

export const CURRENT_REVIEW: CurrentReviewItem[] = []
