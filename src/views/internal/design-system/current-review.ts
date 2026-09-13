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
    title: 'Current rebalance workspace',
    reason:
      'Review the full-width current rebalance above the retained history table: preparation, hybrid weights, simulated launch and indexing wait, live bids, repeat rounds and outcomes. Compare wallet roles, data recovery and constrained widths. Lab simulation only; production transactions, copy approval and engineering adoption remain gated. Transactions remain paused as a separate component-family review.',
    destination:
      '/internal/design-system/components/table#auctions-browse-review',
    type: 'visual decision',
    foundationConformance: [
      {
        area: 'spacing',
        status: 'declared-provisional',
        detail:
          'The current square card owns a 24px axis. At 832px container width, trade planning and operation regions share a 3:2 grid; below it they form one mounted column. Inset separators distinguish general context, the working auction and cumulative results. History retains full-width columns, its 896px projection boundary and whole-cell centering. No reserved detail pane or gray row dividers.',
        verification:
          'Inspect auctions-current/workspace.tsx and the current-rebalance browser suites alongside retained history regressions.',
      },
      {
        area: 'typography',
        status: 'conforms',
        detail:
          'The workspace title is 20px/500 above 16px task headings and 14px metadata. Inline facts reuse the transaction-detail 14px/20px recipe on both sides. Stacked facts use 14px labels and 16px values; fields use 16px entered values. History typography remains unchanged.',
        verification:
          'Inspect source-bound long-title phone and desktop captures plus mounted typography checks.',
      },
      {
        area: 'color',
        status: 'conforms',
        detail:
          'Current and history use card-colored structural surfaces; the operation region remains transparent within the same current card. Lifecycle and persistent risk retain canonical roles. Unknown metrics remain unavailable rather than zero. History rows stay static.',
        verification:
          'Run both-theme history/link checks and positive-cost, negative-cost, missing and zero display tests.',
      },
      {
        area: 'radius',
        status: 'declared-provisional',
        detail:
          'Structural records stay square. Canonical Select, Switch and LifecycleStatusPill keep their own geometry; the current 28px lifecycle-pill sizing trial remains unaccepted.',
        verification:
          'Compare both themes and narrow captures without overriding shared component defaults.',
      },
      {
        area: 'motion',
        status: 'conforms',
        detail:
          'The lab clock is opt-in; operation transitions simulate wallet, receipt and indexing independently. Canonical disclosures and skeletons retain reduced-motion behavior. Width changes preserve the same task, draft and bid selection.',
        verification:
          'Inspect canonical Skeleton reuse and check responsive focus transfer in the history browser suite.',
      },
      {
        area: 'component-dependencies',
        status: 'declared-provisional',
        detail:
          'Reuses Button, Field/TextInput, Collapsible, InlineMessage, LifecycleStatusPill, Link and the transaction inline-fact recipe. React Hook Form and Zod validate the local weight draft. The guard uses Dialog; the workspace does not. Chart, state simulation and fixture arithmetic are local, not new shared defaults.',
        verification:
          'See design-system-current-rebalance-workspace.md and its source-bound evidence. No wallet request, real transaction or production adoption is claimed.',
      },
    ],
  },
]
