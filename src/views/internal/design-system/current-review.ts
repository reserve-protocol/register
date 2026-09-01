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
    target: { kind: 'component', id: 'transaction-action' },
    title: 'Composition-first transaction system',
    reason:
      'Judge four transaction-family anchors plus the focused Vote Lock / Unlock / Delegate candidate reconstructed from current product implementations. Manual issuance preserves its page split and approval action slot; automated mint preserves progressive disclosure and scoped order recovery; delayed unstake reviews initiation through its immediate cooldown handoff while deferring page-owned management rows; Zapper remains package-owned; Vote Lock preserves quote-backed shares, conditional approval, configured delay, later Portfolio handoff, and explicit normal/fast delegation with truthful sequential-call recovery. Shared lifecycle, recovery, identity, and outcome language must improve consistency without flattening those structures.',
    destination:
      '/internal/design-system/components/transaction-action#transaction-truth-spectrum',
    type: 'visual decision',
    foundationConformance: [
      {
        area: 'spacing',
        status: 'conforms',
        detail:
          'The specimen uses accepted 4px text, 8px related, 16px internal-region, 24px complete-group, and ordinary/nested inset relationships.',
        verification:
          'Review v1LayoutRecipes usage and the rendered desktop/mobile axes.',
      },
      {
        area: 'typography',
        status: 'conforms',
        detail:
          'Titles, labels, supporting copy, and outcome values consume the accepted V1 typography roles and 14px/20px supporting leading.',
        verification:
          'Inspect v1Typography usage and multiline copy in every family fixture.',
      },
      {
        area: 'color',
        status: 'conforms',
        detail:
          'Surfaces, text, lifecycle roles, focus, and feedback use semantic theme recipes with the same light/dark role names.',
        verification:
          'Inspect both themes and confirm no raw or theme-specific color override exists.',
      },
      {
        area: 'radius',
        status: 'conforms',
        detail:
          'Structural review surfaces and transaction amount input/output regions remain square while ordinary fields, status pills, actions, and the provisional Inline Message retain their owning radii.',
        verification:
          'Inspect amount, quote-search replacement, ordinary Field, status, action, and recovery boundaries in the rendered board.',
      },
      {
        area: 'motion',
        status: 'declared-provisional',
        detail:
          'The board adds no fabricated progress motion. Simple transaction outcomes share one 360ms structural entrance, while their completed or delayed status remains semantically distinct. Outcome follow-ups use the responsive sidecar reveal after the outcome transition; Zapper review advisories instead reveal immediately beneath the action surface without changing the action axis.',
        verification:
          'Inspect attached review and sidecar outcome entrances at desktop and phone widths, then confirm reduced motion removes both reveals.',
      },
      {
        area: 'component-dependencies',
        status: 'declared-provisional',
        detail:
          'Dialog, Field, Entity Identity, Button, Action Group, Segmented Control, Checkbox, Lifecycle Status, Link, and Copyable Value are current baselines; Inline Message, the attached Zapper review region, and the outcome-only Transaction Sidecar remain provisional inside realistic context. The named Zapper study is strong visual composition evidence rather than authority; the package-owned RFQ and durable-card shells are contextual fixtures, not promoted components.',
        verification:
          'Inspect catalog dependency badges and ensure the specimen remains lab-only and unadopted.',
      },
    ],
  },
]
