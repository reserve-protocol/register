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
      'Judge four transaction-family anchors plus the focused Vote Lock / Unlock / Delegate candidate reconstructed from current product implementations. Manual issuance preserves its page split and approval action slot; automated Mint and Redeem begin as one narrow amount-entry task, then share the production-backed Input, Collateral, terminal-output, and paired-order workspace. Operation policy changes assets, order direction, action boundaries, stage count, and outcome facts without forking the layout: Mint retains its separate final action, while Redeem authorizes its final transaction before collateral-sale orders fill. The adjacent desktop order workspace or opt-in narrow-screen ledger owns subordinate per-order evidence, including the existing-collateral-only Redeem branch. The lab exposes quote recovery, funding branches, scoped per-order failure, and completion evidence without adding a second generic lifecycle beneath the same content; Stake, Unstake, and single-role Delegate reconcile the legacy page-to-confirmation flow, current Earn drawer, and existing delegate transaction inside host-independent tasks, preserving conditional approval, immediate reward cessation, and the delayed withdrawal handoff while deferring page-owned management rows; Zapper remains package-owned; Vote Lock preserves quote-backed shares, conditional approval, configured delay, later Portfolio handoff, and explicit normal/fast delegation with truthful sequential-call recovery. Shared lifecycle, recovery, identity, and outcome language must improve consistency without flattening those structures.',
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
          'Structural review surfaces and transaction amount input/output regions remain square while ordinary fields, status pills, actions, and the provisional Inline Message retain their owning radii.',
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
          'Dialog, Field, Entity Identity, Button, Action Group, Segmented Control, Checkbox, Lifecycle Status, Link, and Copyable Value are current baselines; Inline Message, the attached Zapper review region, the outcome attachment, and the theme-aware Organic Brand deep tone remain provisional inside realistic context. The reusable Stake-family tasks own transaction content while the contained lab host owns overlay, focus, dismissal, and placement; this boundary does not promote a universal transaction shell. Organic Brand extra depth applies only in dark mode; light mode retains the standard outcome surface. Attachment states omit the redundant Done action at composition level without changing the Button default. The named Zapper study is strong visual composition evidence rather than authority; the package-owned RFQ and durable-card shells are contextual fixtures, not promoted components.',
        verification:
          'Inspect catalog dependency badges and ensure the specimen remains lab-only and unadopted.',
      },
    ],
  },
]
