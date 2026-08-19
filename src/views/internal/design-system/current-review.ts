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

export const CURRENT_REVIEW: CurrentReviewItem[] = [
  {
    componentId: 'radio-group',
    title: 'Single-choice form control',
    reason:
      'Review the complete reusable control after accepted surface, shape, typography, and 44px peer geometry have been applied. The blocked governance composition will inherit this result.',
    destination: '/internal/design-system/components/radio-group',
    type: 'canonical review',
    foundationConformance: [
      {
        area: 'spacing',
        status: 'conforms',
        detail:
          'The control uses the accepted two-pixel track inset, zero invented inter-item gap, default 20px item padding, and the 44px height of its horizontal field peer.',
        verification: 'Focused browser checks measure group and item height.',
      },
      {
        area: 'typography',
        status: 'conforms',
        detail:
          'Option labels use the accepted 14px medium control-label role.',
        verification:
          'Source inspection and the component state sheet cover the owned label role.',
      },
      {
        area: 'color',
        status: 'conforms',
        detail:
          'The resting track uses neutral control chrome and the selected option uses the white content surface; structural beige is absent.',
        verification:
          'The component consumes the authoritative contained-selection recipe and the focused browser check inspects the rendered track.',
      },
      {
        area: 'radius',
        status: 'conforms',
        detail:
          'The one-row atomic control and its options use the accepted full radius.',
        verification: 'Source inspection confirms the shared atomic shape.',
      },
      {
        area: 'component-dependencies',
        status: 'conforms',
        detail:
          'The reusable candidate owns native radio semantics and consumes the authoritative contained-selection recipe; no parent-composition substitute is involved.',
        verification:
          'The component detail imports the authoritative reusable candidate directly.',
      },
    ],
  },
]
