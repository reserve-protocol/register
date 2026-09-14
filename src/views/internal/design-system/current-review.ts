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

export const CURRENT_REVIEW: CurrentReviewItem[] = [
  {
    target: { kind: 'component', id: 'chart' },
    title: 'Time-series charts',
    reason:
      'Current table work is approved for now, not production adoption. Review the existing Overview and Home renderers in source-based contexts, plus a realistic Discover sparkline. Compare header inspection with the existing tooltip. Technical pressure tests are separate, not replacement layouts. No financial basis, source, freshness, sampling or chart-type default changes. Transactions remain paused; the redesigned auction workspace is unfinished and deferred.',
    destination: '/internal/design-system/components/chart#chart-first-review',
    type: 'visual decision',
    foundationConformance: [
      {
        area: 'spacing',
        status: 'declared-provisional',
        detail:
          'Overview uses the ordinary 24px content inset and retained 288/332px plot. Home consumes the accepted 8px shell/24px content axis with 16px/8px relationships and an edge-to-edge 208px media plot. Discover stays 90×40px. These are host roles, not a universal chart inset.',
        verification:
          'Source-bound chart-review-lab-regressions covers phone, constrained and desktop containers.',
      },
      {
        area: 'typography',
        status: 'conforms',
        detail:
          'Overview uses the 32px page-title role; Home uses the 20px panel-title role. Financial summaries use the 16px body role and semantic foreground/supporting colors. Existing plot-axis typography is retained for chart-family review; frozen footer labels remain placement context.',
        verification:
          'Inspect both themes, long values and supplied sample labels in the chart review.',
      },
      {
        area: 'color',
        status: 'declared-provisional',
        detail:
          'Consumes the existing performance palette without raw colors or shared changes. Direction and estimated flags are supplied metadata, not inferred financial meaning. Palette token consolidation remains separate.',
        verification:
          'Compare monthly/weekly, neutral, zero and estimated cases against the retained palette owner.',
      },
      {
        area: 'radius',
        status: 'conforms',
        detail:
          'Overview and Home outer surfaces are square and flat. Home’s contained media alone uses the accepted 8px radius within its 8px shell. Canonical controls and identity marks keep their own geometry; legacy card rounding is not authority.',
        verification:
          'Review mounted controls and containers at narrow and desktop widths.',
      },
      {
        area: 'motion',
        status: 'declared-provisional',
        detail:
          'Home replay uses its existing animation opt-out. Overview retains its current renderer animation; reduced-motion hardening there remains a separately named adoption need. Technical pressure plots and canonical Skeleton cover reduced motion, not the production renderer.',
        verification:
          'Browser coverage checks reduced motion, inspection and stable plot geometry through loading.',
      },
      {
        area: 'component-dependencies',
        status: 'declared-provisional',
        detail:
          'Actual Overview and Home renderers, source-derived Discover line and canonical lab controls. Overview has an optional header-readout callback used only in this lab; existing callers keep their tooltip. Engineer review is required before adoption.',
        verification:
          'See design-system-charts-source-reset.md for provenance, verification and separate engineer-owned questions.',
      },
    ],
  },
]
