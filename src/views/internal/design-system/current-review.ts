export type CurrentReviewType =
  | 'visual decision'
  | 'canonical review'
  | 'real-screen validation'

export const FOUNDATION_CONFORMANCE_AREAS = [
  'spacing',
  'typography',
  'color',
  'radius',
  'motion',
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

export type CurrentReviewTarget =
  | { kind: 'component'; id: string }
  | { kind: 'foundation'; id: string }

export interface CurrentReviewItem {
  target: CurrentReviewTarget
  title: string
  reason: string
  destination: string
  type: CurrentReviewType
  foundationConformance: FoundationConformanceClaim[]
}

export const CURRENT_REVIEW: CurrentReviewItem[] = []
