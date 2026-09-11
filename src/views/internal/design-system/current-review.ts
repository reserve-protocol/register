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
    target: { kind: 'component', id: 'table' },
    title: 'Discover browsing rows',
    reason:
      'Review classified identity, the basket hover strip and compact performance trends on wide rows, then compare compact/full-chart mobile cards using the existing Home/Discover chart and ticker. Portfolio and Holdings remain checkpoints. This is not a complete Discover page or approved production replacement. Transactions remain paused.',
    destination:
      '/internal/design-system/components/table#discover-family-review',
    type: 'visual decision',
    foundationConformance: [
      {
        area: 'spacing',
        status: 'declared-provisional',
        detail:
          'Wide rows retain 24px insets and a 12px identity gap. Narrow card header and Market Cap content use 24px total edge insets without added shell padding; chart/ticker edges remain region-owned. The 2px secondary surround and seams are contrast-only lab framing, not a saved container preference. TokenStackTrigger retains 24px artwork in a 44px target aligned with the Basket header.',
        verification:
          'Inspect discover-columns.tsx, narrow/wide captures and the 1151/1152px container boundary; Holdings remains independently scoped.',
      },
      {
        area: 'typography',
        status: 'conforms',
        detail:
          'Table identity names use 16px/500; card names use the 20px/500 panel-title role. Ordinary numeric peers remain 16px/300, supporting text 14px/300. Financial values stay tabular, not monospace; no dense variant. Holdings narrow allocation retains its local neutral 16px/500 emphasis.',
        verification:
          'Compare Discover cell owners and light/dark long-name and zero/unavailable captures.',
      },
      {
        area: 'color',
        status: 'declared-provisional',
        detail:
          'Names, ticker, classifications and contextual basket actions are neutral. Period-qualified return and its companion trend use performance roles; zero is neutral and unavailable supporting. Narrow cards preview a steady card-colored surface without the highlighted-card attention gradient. The secondary surround only provides lab contrast; product container design is undecided.',
        verification:
          'Compare zero/unavailable, positive/negative return and basket open/focus states.',
      },
      {
        area: 'radius',
        status: 'declared-provisional',
        detail:
          'Discover list cards trial square outer and media regions at the user’s direction; the accepted Home media-card 8px radius is unchanged. Canonical logos, status pills and buttons retain their owning radii.',
        verification:
          'Inspect the full-width table composition, not its lab controls.',
      },
      {
        area: 'motion',
        status: 'declared-provisional',
        detail:
          'The desktop basket strip preserves its 72px/second cruise and 1.2-second ramp. Cards reuse the production ticker’s 18-second cycle and visibility behavior, pausing on keyboard focus. Card charts and tickers honor reduced motion; loading reserves content geometry, and unavailable series are not invented.',
        verification:
          'Run discover-motion-lab-regressions for strip movement/manual access and discover-cards-lab-regressions for ticker loading recovery, focus pause and reduced motion; inspect both themes.',
      },
      {
        area: 'component-dependencies',
        status: 'declared-provisional',
        detail:
          'DataTable owns sorting across its opt-in alternative renderer; only one presentation mounts. Cards reuse the production chart and ticker in a lab-local wrapper. TokenStackTrigger and the positioned horizontal strip remain separate wide-row candidates. Search, production pagination/adoption, bridge-dialog design and rich records remain outside this slice; shared defaults are unchanged.',
        verification:
          'Run Discover plus Holdings/Portfolio regression seams and types. Consult the Discover transfer brief and retained source/candidate evidence before reuse.',
      },
    ],
  },
]
