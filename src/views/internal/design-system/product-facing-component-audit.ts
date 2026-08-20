export type DecisionLane = 1 | 2 | 3

export interface ProductEvidenceFamily {
  name: string
  requirement: string
  sources: string[]
}

export interface ProductFacingDecision {
  name: string
  lane: DecisionLane
  reason: string
}

export interface ProductFacingReview {
  id: string
  componentId: string
  name: string
  status: 'ready' | 'queued' | 'complete'
  purpose: string
  evidence: ProductEvidenceFamily[]
  decisions: ProductFacingDecision[]
  migrationSeam: string
  avoid: string
}

export const PRODUCT_FACING_REVIEWS: ProductFacingReview[] = [
  {
    id: 'information-rows',
    componentId: 'table',
    name: 'Repeated information rows',
    status: 'ready',
    purpose:
      'Find shared identity, metric, status, density, and action anatomy without forcing every repeated item into one Row component.',
    evidence: [
      {
        name: 'Comparable asset data',
        requirement:
          'Logo, name, symbol, sortable numeric columns, performance meaning, and long values in a divider-free table.',
        sources: [
          'src/views/index-dtf/overview/components/basket-overview/exposure-table-rows.tsx',
          'src/views/index-dtf/overview/components/basket-overview/basket-table-header.tsx',
        ],
      },
      {
        name: 'Discover and Earn indexes',
        requirement:
          'Long DTF identity, tags, basket counts, multiple financial values, paired primary/secondary values, variable governed entities, and APR/APY units.',
        sources: [
          'src/views/home/components/discover-index-dtf/index-dtf-table.tsx',
          'src/views/earn/views/index-dtf/components/vote-lock-positions.tsx',
        ],
      },
      {
        name: 'Transaction history',
        requirement:
          'Type, primary and secondary amounts, relative time, sortable columns, and an explorer action.',
        sources: [
          'src/views/index-dtf/overview/components/index-transaction-table-with-swaps/columns.tsx',
          'src/views/index-dtf/overview/components/index-transaction-table.tsx',
        ],
      },
      {
        name: 'Governance records',
        requirement:
          'Long titles, lifecycle status, time pressure, optional progress, vote distribution, qualifiers, and whole-row navigation.',
        sources: [
          'src/views/index-dtf/governance/components/proposal-list-item.tsx',
          'src/views/index-dtf/governance/components/governance-proposal-list.tsx',
        ],
      },
      {
        name: 'Rebalance records',
        requirement:
          'Title, completion state, three outcome metrics, provenance, loading, active/empty sections, and whole-item navigation.',
        sources: [
          'src/views/index-dtf/auctions/views/rebalance-list/components/historical-rebalance-item.tsx',
          'src/views/index-dtf/auctions/views/rebalance-list/components/metrics-row.tsx',
        ],
      },
    ],
    decisions: [
      {
        name: 'Dense asset-row identity and vertical density',
        lane: 3,
        reason:
          'Logo scale, stacked versus inline identity, and row height materially change the visual character of the most important data table.',
      },
      {
        name: 'Numeric alignment and peer text sizing',
        lane: 1,
        reason:
          'Accepted typography rules and comparison usability already imply right alignment, tabular numerals, and equal size for horizontal peers.',
      },
      {
        name: 'Rich navigable-record composition',
        lane: 3,
        reason:
          'Proposal and rebalance records need more hierarchy than table rows, and their composition must survive long titles and changing status content.',
      },
      {
        name: 'Always-visible versus revealed row actions',
        lane: 2,
        reason:
          'The choice depends on whether the whole row navigates and whether the action is essential, but does not initially need a new visual study.',
      },
    ],
    migrationSeam:
      'Share Entity identity, Metric, Status, Copyable value, and table-cell recipes; keep dense table rows and rich navigable records as distinct compositions.',
    avoid:
      'Do not replace all lists and tables with a universal Row prop matrix or preserve legacy padding as variants.',
  },
  {
    id: 'metric-blocks',
    componentId: 'metric',
    name: 'Metric blocks',
    status: 'ready',
    purpose:
      'Define a small label/value grammar that works inline, stacked, and in outcome summaries without creating a universal metric card.',
    evidence: [
      {
        name: 'Overview key/value rows',
        requirement:
          'Inline label/value alignment with optional icon, help, link, tooltip, and loading state.',
        sources: [
          'src/views/index-dtf/overview/components/metrics-item.tsx',
          'src/views/index-dtf/overview/components/fees-stats.tsx',
        ],
      },
      {
        name: 'Homepage headline metrics',
        requirement:
          'Compact stacked pairs use a 16px/300 label and 16px/500 value in the strong current source; the parent stats bar owns centering and help.',
        sources: ['src/views/home/components/protocol-metrics.tsx'],
      },
      {
        name: 'Governance stats',
        requirement:
          'Grouped inline pairs with section labels, semantic icons, long token values, and account-like quantities.',
        sources: [
          'src/views/index-dtf/governance/components/governance-stats.tsx',
        ],
      },
      {
        name: 'Rebalance outcomes',
        requirement:
          'Three parallel headline metrics with performance meaning and skeletons. Existing semantic icons are parent-owned composition evidence, not a Metric API requirement.',
        sources: [
          'src/views/index-dtf/auctions/views/rebalance-list/components/metrics-row.tsx',
        ],
      },
    ],
    decisions: [
      {
        name: 'Inline and headline roles',
        lane: 1,
        reason:
          'The real content jobs reuse two label/value anatomies; outcome summaries do not justify a third Metric role.',
      },
      {
        name: 'Headline alignment in parallel groups',
        lane: 3,
        reason:
          'Centered and start-aligned headline groups are both evidenced compositions, and the choice materially changes the auction record hierarchy.',
      },
      {
        name: 'Icon and help composition boundary',
        lane: 1,
        reason:
          'Icons and help describe the surrounding record or label context, so the parent composes them without expanding Metric into a universal content wrapper.',
      },
      {
        name: 'Missing, stale, and loading value language',
        lane: 2,
        reason:
          'The semantic distinction matters, but concise rules and existing source states should settle it before visual alternatives are built.',
      },
    ],
    migrationSeam:
      'Standardize Metric anatomy and formatting hooks; let the parent region own grids, framing, and responsive composition.',
    avoid:
      'Do not make every metric a Card or allow each route to invent label/value typography and missing-data symbols.',
  },
  {
    id: 'product-navigation',
    componentId: 'product-navigation',
    name: 'Product navigation items',
    status: 'ready',
    purpose:
      'Make the persistent Index DTF rail feel intentional across current, hover, disabled, and expanded states while preserving route behavior.',
    evidence: [
      {
        name: 'Index DTF persistent rail',
        requirement:
          'DTF identity, icon-led routes, hover expansion, current state, deprecation-disabled items, and chain/account actions. The current item configuration has no nested navigation; generic dormant subitem support is not V1 evidence.',
        sources: ['src/views/index-dtf/components/navigation/index.tsx'],
      },
      {
        name: 'Small-screen route menu',
        requirement:
          'The same route and disabled-state truth in a different composition, without requiring the lab itself to be mobile-optimized.',
        sources: ['src/views/index-dtf/components/navigation/index.tsx'],
      },
    ],
    decisions: [
      {
        name: 'Framed icon slot for the vertical rail',
        lane: 1,
        reason:
          'The accepted icon-alignment rule and the stacked rail context strongly support a stable frame rather than bare left-aligned glyphs.',
      },
      {
        name: 'Current implementation review and system alignment',
        lane: 3,
        reason:
          'The faithful collapsed and hover-expanded rail should be reviewed as one product-defining composition; any refinement should be designer-led and checked against accepted color, spacing, icon, shape, and motion rules rather than invented alternatives.',
      },
      {
        name: 'Expanded-label behavior and geometry',
        lane: 1,
        reason:
          'The existing product already establishes hover disclosure; V1 first preserves that behavior and inspects its timing, spacing, and alignment before proposing any behavioral change.',
      },
    ],
    migrationSeam:
      'Keep one route model and shared item state recipe; render it through desktop rail and constrained-screen menu compositions.',
    avoid:
      'Do not turn route navigation into Button variants or create separate active-state vocabularies for each Index page.',
  },
  {
    id: 'content-regions',
    componentId: 'card',
    name: 'Cards and content regions',
    status: 'complete',
    purpose:
      'Separate repeated/actionable cards from structural page regions before migration removes legacy rounded wrappers.',
    evidence: [
      {
        name: 'Overview and governance regions',
        requirement:
          'Flat content regions, selective substrate-reveal corners, section headings, tables, supporting copy, and actions.',
        sources: [
          'src/views/index-dtf/overview/index.tsx',
          'src/views/index-dtf/governance/index.tsx',
        ],
      },
      {
        name: 'Repeated interactive cards',
        requirement:
          'Whole-card navigation, hover/current treatment, repeated identity, media, metrics, and long content.',
        sources: [
          'src/views/home/components/highlighted-dtfs/feature-card.tsx',
          'src/views/home/components/highlighted-dtfs/constants.ts',
          'src/views/index-dtf/auctions/views/rebalance-list/components/historical-rebalance-item.tsx',
        ],
      },
    ],
    decisions: [
      {
        name: 'Region versus card criteria',
        lane: 1,
        reason:
          'Accepted substrate and shape rules already imply that page sections should not inherit a generic rounded Card shell.',
      },
      {
        name: 'Interactive card hierarchy and media treatment',
        lane: 3,
        reason:
          'Repeated discovery objects and auction records materially shape product character and need composition-level review.',
      },
    ],
    migrationSeam:
      'Keep the accepted structural-region recipe separate from a later repeated interactive-card shell; interaction and media opt in, while layout-owned corners stay outside both defaults.',
    avoid:
      'Do not migrate every current Card import to one replacement component or encode page substrate geometry as Card variants.',
  },
  {
    id: 'contained-form-rows',
    componentId: 'input',
    name: 'Contained form rows',
    status: 'complete',
    purpose:
      'Standardize label, field, help, validation, affix, and repeated-group anatomy across deploy and proposal flows.',
    evidence: [
      {
        name: 'Deploy fields',
        requirement:
          'Text, address, percentage, duration, additions, selectors, validation, and supporting preview inside a progressive workflow.',
        sources: [
          'src/views/index-dtf/deploy/components/basic-input.tsx',
          'src/views/index-dtf/deploy/components/basic-input-with-additionals.tsx',
        ],
      },
      {
        name: 'Proposal settings',
        requirement:
          'The same financial and governance field jobs in a different task shell, including changed-value review and optional sections.',
        sources: [
          'src/views/index-dtf/governance/views/propose/views/propose-dtf-settings/components/sections/propose-metadata.tsx',
          'src/views/index-dtf/governance/views/propose/views/propose-dao-settings/components/sections/propose-dao-governance.tsx',
        ],
      },
    ],
    decisions: [
      {
        name: 'Shared field stack and horizontal axis',
        lane: 1,
        reason:
          'The accepted 24px contained-form axis and reviewed field geometry already constrain the ordinary composition.',
      },
      {
        name: 'Repeated groups, additions, and advanced sections',
        lane: 3,
        reason:
          'Composition and density determine whether complex governance/deploy forms become clear or remain visually noisy.',
      },
    ],
    migrationSeam:
      'Evolve shared form anatomy and add composable field-group recipes; keep business validation and on-chain semantics in existing feature code.',
    avoid:
      'Do not reproduce every legacy form wrapper as a design-system variant or move product validation into visual primitives.',
  },
  {
    id: 'action-groups',
    componentId: 'button-group',
    name: 'Action groups',
    status: 'complete',
    purpose:
      'Apply the accepted Button hierarchy to real primary/secondary, continuation, retry, and transaction follow-up compositions.',
    evidence: [
      {
        name: 'Proposal and simulation actions',
        requirement:
          'Single continuation, simulation follow-up, review, submit, wallet, pending, recovery, and destructive confirmation actions.',
        sources: [
          'src/views/index-dtf/governance/components/simulate-proposal.tsx',
          'src/views/index-dtf/governance/views/propose/basket/components/submit-proposal-button.tsx',
        ],
      },
      {
        name: 'Workflow completion and persistent submit',
        requirement:
          'New-task versus view-result follow-up actions and elevated action wrappers that remain available during long forms.',
        sources: [
          'src/views/index-dtf/issuance/async-mint/steps/success.tsx',
          'src/views/index-dtf/manage/components/submit-button.tsx',
        ],
      },
    ],
    decisions: [
      {
        name: 'Hierarchy, ordering, and destructive separation',
        lane: 1,
        reason:
          'The accepted Button and Dialog decisions already determine most ordinary, reversible, and destructive group hierarchy.',
      },
      {
        name: 'Inline and shared-width compositions',
        lane: 1,
        reason:
          'Source-grounded success and destructive actions establish compact horizontal groups without ragged wrapping and vertical groups with shared full width.',
      },
    ],
    migrationSeam:
      'Use a small composition recipe around accepted Button roles; transaction lifecycle stays in Transaction action rather than Action group.',
    avoid:
      'Do not create page-specific Button variants to solve group layout or encode business lifecycle into a visual wrapper.',
  },
  {
    id: 'tooltip-help-labels',
    componentId: 'tooltip',
    name: 'Tooltip, help, and label icons',
    status: 'complete',
    purpose:
      'Separate supplemental explanation, accessible naming support, and transient action feedback before consolidating overlapping help wrappers.',
    evidence: [
      {
        name: 'Metric and field explanation',
        requirement:
          'Short labels need optional explanatory content without moving ownership of the label or metric into Tooltip.',
        sources: [
          'src/views/index-dtf/overview/components/metrics-item.tsx',
          'src/views/home/components/protocol-metrics.tsx',
          'src/components/ui/help.tsx',
        ],
      },
      {
        name: 'Named actions and transient feedback',
        requirement:
          'Icon-only copy and anchor actions need an accessible name, while the popup may change briefly to confirm completion.',
        sources: [
          'src/components/ui/copy-value.tsx',
          'src/components/section-anchor.tsx',
          'src/components/help/index.tsx',
        ],
      },
    ],
    decisions: [
      {
        name: 'Explanation versus action-feedback contract',
        lane: 1,
        reason:
          'The source jobs are semantically distinct and should share popup presentation without sharing state ownership or trigger behavior.',
      },
      {
        name: 'Help trigger, label relationship, and touch behavior',
        lane: 3,
        reason:
          'Two current Help wrappers disagree on glyph, size, click, touch, and keyboard handling; the visible label-help composition needs one deliberate product choice.',
      },
      {
        name: 'Content length and non-hover fallback',
        lane: 2,
        reason:
          'Current metric explanations can be long and hover is unavailable on touch, so content limits and escalation to persistent disclosure need explicit rules before a visual sheet.',
      },
    ],
    migrationSeam:
      'Keep Radix Tooltip as the popup primitive; consolidate Help only after trigger semantics and label ownership are decided, and keep copy-success state in Copy value.',
    avoid:
      'Do not make Tooltip the sole accessible name, put essential instructions behind hover, or preserve both legacy Help wrappers as variants.',
  },
  {
    id: 'value-and-action-popups',
    componentId: 'select',
    name: 'Select, combobox, and action menus',
    status: 'ready',
    purpose:
      'Define the semantic split between bounded value selection, searchable entity selection, and immediate actions before standardizing their shared popup visuals.',
    evidence: [
      {
        name: 'Bounded value selection',
        requirement:
          'Short date and chain lists need label, placeholder/value, disabled-item, keyboard, and narrow-screen behavior using Select semantics.',
        sources: [
          'src/views/internal/dtf-list/components/dtf-date-chain-filters.tsx',
          'src/components/ui/select.tsx',
        ],
      },
      {
        name: 'Navigation search',
        requirement:
          'Global DTF search filters grouped identity-rich results and navigates immediately; it is Command search rather than a form-value Combobox.',
        sources: ['src/components/command-menu/index.tsx'],
      },
      {
        name: 'Multi-value filtering',
        requirement:
          'Earn DTF filters and governance tags commit zero or more values and must remain multi-select rather than being used as Combobox evidence.',
        sources: [
          'src/views/earn/views/index-dtf/components/table-filters.tsx',
          'src/views/index-dtf/manage/components/manage-tags.tsx',
        ],
      },
      {
        name: 'Asset picking',
        requirement:
          'Token selection uses searchable drawer-based identity lists with loading, empty, and selected states; it is an Asset picker composition.',
        sources: ['src/components/token-selector-drawer/index.tsx'],
      },
      {
        name: 'Immediate action menus',
        requirement:
          'Contract-address and external-link menus invoke actions rather than committing a value and need disabled, destructive, and external-link rules.',
        sources: [
          'src/views/index-dtf/overview/components/index-token-address.tsx',
          'src/views/index-dtf/overview/components/index-about-meta.tsx',
          'src/components/layout/header/components/header-actions-menu.tsx',
        ],
      },
    ],
    decisions: [
      {
        name: 'Select, combobox, and menu semantic boundary',
        lane: 1,
        reason:
          'Whether the user chooses a bounded value, searches a collection, or invokes an action determines behavior more reliably than visual similarity.',
      },
      {
        name: 'No generic Combobox without a real form-value job',
        lane: 1,
        reason:
          'The audited searchable sources resolve into Command navigation, multi-select filtering, and Asset picker behavior; combining them would invent a generic component without a product seam.',
      },
      {
        name: 'One-line trigger geometry',
        lane: 1,
        reason:
          'Ordinary Select triggers should inherit the accepted Field height, radius, focus, disabled, and text rules instead of creating a parallel control geometry.',
      },
      {
        name: 'Popup density, selected state, and responsive adaptation',
        lane: 3,
        reason:
          'Identity-rich token results, simple value lists, and action menus need visibly related but distinct compositions; mobile popover-versus-drawer behavior also needs product judgment.',
      },
      {
        name: 'Multi-value rows use selection controls',
        lane: 1,
        reason:
          'Checkboxes communicate staged set membership; Switch implies an immediate setting change and is not a reusable multi-select row treatment.',
      },
    ],
    migrationSeam:
      'Share popup surface, item, focus, and empty/loading recipes while retaining separate Select, Multi-select filter, Combobox, Menu, and domain-specific entity-row behaviors.',
    avoid:
      'Do not treat action menus as value selects, force short lists through search, or turn every token picker into a generic Select variant.',
  },
  {
    id: 'empty-states',
    componentId: 'empty-state',
    name: 'Empty states',
    status: 'queued',
    purpose:
      'Define when absence needs only a quiet message versus explanation, recovery, action, or illustration.',
    evidence: [
      {
        name: 'Product absence and no results',
        requirement:
          'No proposals, no delegates, no rebalances, no yield opportunities, and token-search no-results with different recovery needs.',
        sources: [
          'src/views/index-dtf/governance/components/governance-proposal-list.tsx',
          'src/views/index-dtf/governance/components/governance-delegate-list.tsx',
          'src/views/index-dtf/auctions/views/rebalance-list/index.tsx',
          'src/views/earn/components/pools-table.tsx',
          'src/views/index-dtf/deploy/steps/basket/token-selector.tsx',
        ],
      },
    ],
    decisions: [
      {
        name: 'Quiet absence versus actionable empty state',
        lane: 1,
        reason:
          'Whether the user can or should resolve the absence determines the hierarchy more reliably than route-specific styling.',
      },
      {
        name: 'Illustration and composition for meaningful first-use states',
        lane: 3,
        reason:
          'Illustration materially affects product character and should be reserved for a small evidenced set rather than applied generically.',
      },
    ],
    migrationSeam:
      'Use one empty-state recipe with optional explanation and action slots; let tables, searches, and full regions choose the appropriate composition.',
    avoid:
      'Do not invent onboarding screens or add illustrations to routine filtered no-results states.',
  },
]

export const READY_PRODUCT_FACING_REVIEWS = PRODUCT_FACING_REVIEWS.filter(
  (review) => review.status === 'ready'
)
