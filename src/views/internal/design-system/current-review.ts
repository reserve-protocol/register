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
    title: 'Transaction checkpoint (paused)',
    reason:
      'Paused after the consolidated regression checkpoint. Preserve the current human-directed Zapper, Vote Lock, Stake, Automated Mint/Redeem and Manual Mint/Redeem designs; resume only for an explicitly selected question. This checkpoint does not approve the contextual entry cards, standalone selector specimen, Portfolio management rows or production adoption. Manual outcomes and recovery are rendered lab simulations, not receipt-source or approval-policy authority. The active V1 plan and consolidated report own the retained decisions, exclusions and engineering handoff.',
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
        status: 'declared-provisional',
        detail:
          'Surfaces, text, lifecycle roles, focus, and feedback use semantic theme recipes. Attachment outcomes locally pressure the hierarchy with an opt-in deeper Organic Brand tone; standalone outcomes keep the default tone.',
        verification:
          'Inspect attachment and standalone outcomes in both themes; confirm the deeper tone separates atmosphere from actions without becoming a new baseline by implication.',
      },
      {
        area: 'radius',
        status: 'conforms',
        detail:
          'Structural review surfaces remain square; transaction amount input/output and replacement regions use their accepted 8px radius. Ordinary fields, status pills, actions, and Inline Message retain their owning radii.',
        verification:
          'Inspect amount, quote-search replacement, ordinary Field, status, action, and recovery boundaries in the rendered board.',
      },
      {
        area: 'motion',
        status: 'declared-provisional',
        detail:
          'The board adds no fabricated progress motion. Simple transaction outcomes share one 360ms bottom-anchored structural entrance, so the outcome color rises from the former action edge while their completed or delayed status remains semantically distinct. Stake and Unstake use flow-local result floors derived from their respective preceding states, allowing the brand region to absorb removed task content without a height drop. Outcome follow-ups mount with the outcome and use one attached reveal; the no-shrink minimum belongs to that combined frame rather than inflating its main result card. Zapper review advisories instead reveal immediately beneath the action surface without changing the action axis.',
        verification:
          'Inspect review and outcome attachment entrances at desktop and phone widths, then confirm reduced motion removes both reveals.',
      },
      {
        area: 'component-dependencies',
        status: 'declared-provisional',
        detail:
          'Dialog, Field, Entity Identity, Button, Action Group, Segmented Control, Checkbox, Lifecycle Status, Link, Copyable Value, and Inline Message are current baselines; the attached Zapper review region, the outcome attachment, and the theme-aware Organic Brand deep tone remain provisional inside realistic context. The reusable Stake-family tasks own transaction content while the contained lab host owns overlay, focus, dismissal, and placement; this boundary does not promote a universal transaction shell. Organic Brand extra depth applies only in dark mode; light mode retains the standard outcome surface. Attachment states omit the redundant Done action at composition level without changing the Button default. The named Zapper study is strong visual composition evidence rather than authority; the package-owned RFQ and durable-card shells are contextual fixtures, not promoted components.',
        verification:
          'Inspect catalog dependency badges and ensure the specimen remains lab-only and unadopted.',
      },
    ],
  },
]
