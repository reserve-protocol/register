import { openDefinitionSlots, type ComponentGroup } from './catalog-types'
import { pendingComponent as component } from './component-catalog-item'

const mapped = {
  status: 'evidence-found' as const,
  auditStatus: 'mapped' as const,
}

export const SUPPORT_COMPONENT_GROUPS: ComponentGroup[] = [
  {
    id: 'overlays',
    name: 'Overlays',
    description: 'Temporary surfaces that appear above the current context.',
    foundationDependencies: [
      'elevation',
      'color',
      'radius',
      'spacing',
      'motion',
      'layout',
      'accessibility',
    ],
    defaultStates: ['Closed', 'Opening', 'Open', 'Closing', 'Disabled trigger'],
    expectedDecisions: [
      {
        name: 'Trigger and dismissal',
        status: 'defined',
        detail:
          'Shell dismissal cancels ordinary reversible tasks; destructive dialogs also show an explicit Cancel action; dialogs never nest.',
      },
      ...openDefinitionSlots('Focus management'),
      {
        name: 'Long-content behavior',
        status: 'defined',
        detail:
          'When content overflows the viewport, the body scrolls while header and action regions remain anchored.',
      },
      {
        name: 'Constrained-screen adaptation',
        status: 'defined',
        detail:
          'The same blocking Dialog becomes a full-width, bottom-flush sheet below 640px; it keeps Dialog semantics, anchored regions, safe-area padding, and no implied drag dismissal.',
      },
    ],
    items: [
      {
        ...component(
          'dialog',
          'Dialog',
          'Focuses attention on a blocking decision or contained task.',
          'Dialogs need consistent focus, dismissal, action, and destructive behavior.',
          {
            priority: 'v1-core',
            ...mapped,
            evidence: [
              'Nineteen direct product dialogs use the shared Dialog or legacy Modal shells; the package-owned Zapper adds a third shell system.',
              'Current jobs collapse to review, configure, select, attest, explain, and outcome; media and drawers remain adjacent overlay families.',
              'The accepted spacing foundation sets a 4px title-to-description relationship and a 24px ordinary contained-dialog content axis.',
              'The compact 32px close action participates in DialogHeader layout, so its visible control boundary follows the same 24px content axis as the rest of the header.',
            ],
            decisionPrompts: [
              'Define the exact composition for evidenced consequential success outcomes.',
              'Define the visual style and placement of milestone illustration.',
              'Verify focus management in the shared shell.',
            ],
            stateAdditions: [
              'Long content',
              'Destructive',
              'Pending action',
              'Error',
            ],
            nextAction:
              'Visually resolve consequential outcome composition using real transaction requirements.',
          }
        ),
        outputStatus: 'rendered',
        designAuthority: 'current-baseline',
        implementationStatus: 'canonical-candidate',
        implementationSource: 'src/components/dialog/index.tsx',
        contextSources: [
          {
            role: 'authority',
            label: 'Typed Dialog contract',
            path: 'src/views/internal/design-system/component-catalog-support.ts',
          },
          {
            role: 'accepted-decision',
            label: 'Modal role and stable-width decision',
            path: 'docs/wiki/decisions.md#2026-08-13--modal-widths-follow-content-roles-workflows-do-not-resize-between-states',
          },
          {
            role: 'implementation',
            label: 'Reusable V1 Dialog candidate',
            path: 'src/components/dialog/index.tsx',
          },
        ],
        adoptionStatus: 'none',
        review: {
          status: 'ready',
          scope:
            'Review the reusable 384/432px desktop shell, full-width bottom-flush phone presentation, square structure, 24px content axis, 4px title/description relationship, close action, anchored regions, and non-dismissible behavior. Outcome composition, illustration, and final elevation remain provisional.',
          dependencies: [
            { name: 'Button', status: 'canonical' },
            { name: 'IconButton', status: 'canonical' },
            { name: 'Radix Dialog behavior', status: 'retained' },
          ],
        },
        statusDetail:
          'A reusable V1 shell implements the accepted desktop widths, adaptive phone presentation, content axis, region, close-action, and non-dismissible contracts. Outcome composition and final elevation remain provisional; production adoption has not started.',
      },
      {
        ...component(
          'drawer',
          'Drawer',
          'Presents contextual detail or a task from a screen edge.',
          'Drawers need clear use criteria, sizing, focus, and responsive behavior.',
          {
            priority: 'v1-conditional',
            ...mapped,
            evidence: [
              'Eight product imports use the shared Drawer; token selection, staking, voting, and deploy all depend on it.',
              'Current task and selector drawers share a 512px wider-screen shell while composing materially different bodies.',
              'The accepted Dialog contract establishes Radix focus and dismissal behavior, anchored regions, a 24px content axis, and bottom-attached phone adaptation without implied drag dismissal.',
            ],
            decisionPrompts: [
              'Pressure-test each existing right-side Drawer flow against the canonical responsive Dialog before retaining a desktop edge surface.',
              'Retain Drawer only if a real flow cannot move to Dialog without losing important context or usability.',
            ],
            nextAction:
              'Evaluate existing task and selector flows one at a time as Dialog migrations; do not promote Drawer by default.',
          }
        ),
        outputStatus: 'rendered',
        designAuthority: 'exploratory',
        implementationStatus: 'canonical-candidate',
        implementationSource: 'src/components/design-system-v1/drawer.tsx',
        adoptionStatus: 'none',
        review: {
          status: 'exploration',
          scope:
            'This rendered shell preserves existing right-side desktop Drawer evidence and its bottom-attached phone behavior, but it is not a V1 baseline or ready for canonical review. The migration target is the accepted centered-desktop/bottom-phone Dialog pattern. Task lifecycle, selector rows, tabs, validation, drag gestures, mobile navigation, and production adoption remain separate. Revisit Drawer only if a concrete flow cannot migrate to Dialog without meaningful loss.',
          dependencies: [
            { name: 'Button', status: 'canonical' },
            { name: 'IconButton', status: 'canonical' },
            { name: 'Dialog overlay behavior', status: 'canonical' },
            { name: 'Radix Dialog behavior', status: 'retained' },
            { name: 'Floating elevation', status: 'provisional' },
          ],
        },
        statusDetail:
          'Conditional migration evidence preserves current task and selector behavior without turning legacy right-side placement into V1 authority. Existing flows should be pressure-tested against responsive Dialog one at a time. The shell owns an 8px structural edge and body scrolling; compositions may add 16px for the ordinary 24px axis or remain edge-aligned for dense input/output flows. Existing production behavior remains unchanged.',
      },
      {
        ...component(
          'popover',
          'Popover',
          'Shows contextual interactive content near a trigger.',
          'Popovers require stable placement, collision, focus, and dismissal behavior.',
          {
            priority: 'v1-core',
            ...mapped,
            evidence: [
              'Nine product imports use shared Popover; multi-select filters provide the first active V1 consumer.',
              'Select and Menu already establish the transferable 8px offset, 8px shell radius, collision inset, semantic surface, and restrained elevation.',
            ],
            decisionPrompts: [
              'Resolve composition-owned width, padding, scrolling, and responsive substitution only from the content job being hosted.',
            ],
            relationships: [
              {
                id: 'tooltip',
                note: 'Popover contains interactive content; tooltip does not.',
              },
              {
                id: 'dropdown-menu',
                note: 'Use Menu when the content is primarily actions.',
              },
            ],
            nextAction:
              'Consume the shell in source-grounded compositions; do not add generic padding, width, or inner anatomy.',
          }
        ),
        status: 'defined',
        outputStatus: 'in-composition',
        designAuthority: 'current-baseline',
        implementationStatus: 'canonical-candidate',
        implementationSource: 'src/components/design-system-v1/popover.tsx',
        contextSources: [
          {
            role: 'authority',
            label: 'Minimal Popover recorded baseline',
            path: 'docs/wiki/domains/design-system-reference.md#minimal-popover-shell',
            detail:
              'No dedicated decision entry is recorded. The baseline classification predates this reconciliation; direct human-approval provenance has not been independently recovered. Preserve the existing contract without promoting provisional density or elevation.',
          },
        ],
        compositionSource: {
          componentId: 'multi-select-filter',
          label: 'Popover shell in the Multi-select filter state sheet',
        },
        adoptionStatus: 'none',
        review: {
          status: 'ready',
          scope:
            'The shared shell inherits the accepted 8px popup offset and radius, collision inset, semantic floating surface, restrained elevation, and Radix focus/dismissal behavior. Width, padding, scrolling, inner anatomy, responsive substitution, and production adoption remain composition-owned.',
          dependencies: [
            { name: 'Radius and semantic color roles', status: 'canonical' },
            { name: 'Radix Popover behavior', status: 'retained' },
            { name: 'Floating elevation', status: 'provisional' },
          ],
        },
        statusDetail:
          'A minimal reusable V1 shell exists for interactive floating content. Multi-select filter is its first rendered candidate consumer; no production consumer has adopted it.',
      },
      {
        ...component(
          'dropdown-menu',
          'Menu',
          'Presents a compact list of contextual actions.',
          'Menus need semantic action grouping and complete keyboard behavior.',
          {
            priority: 'v1-core',
            ...mapped,
            evidence: [
              'Nine product imports use shared DropdownMenu.',
              'Index DTF contract-address actions, About links, external-market links, and the header Search invocation provide real immediate-action and external-link jobs.',
              'Chart type, time range, language, theme, and social-channel choice commit values; they remain selection evidence rather than authority for an action Menu.',
              'The accepted Select popup provides transferable surface, spacing, radius, and interaction recipes without lending Menu its selection semantics.',
            ],
            decisionPrompts: [
              'Judge the action-item density, optional leading/trailing visual axes, ordinary versus destructive treatment, and relationship to canonical Button and IconButton triggers.',
            ],
            relationships: [
              {
                id: 'select',
                note: 'Select commits one bounded value; Menu invokes an action or follows a link.',
              },
              {
                id: 'popover',
                note: 'Popover hosts arbitrary interactive content; Menu owns a keyboard-navigable action list.',
              },
            ],
            nextAction:
              'Defer selection items, grouped header panels, submenus, responsive substitution, and production adoption until real requirements need them.',
          }
        ),
        status: 'defined',
        outputStatus: 'rendered',
        designAuthority: 'current-baseline',
        implementationStatus: 'canonical-candidate',
        implementationSource: 'src/components/design-system-v1/menu.tsx',
        contextSources: [
          {
            role: 'authority',
            label: 'Action Menu recorded baseline',
            path: 'docs/wiki/domains/design-system-reference.md#action-menu',
            detail:
              'No dedicated decision entry is recorded. The baseline classification predates this reconciliation; direct human-approval provenance has not been independently recovered. Preserve the existing contract without promoting provisional density or elevation.',
          },
        ],
        adoptionStatus: 'none',
        review: {
          status: 'ready',
          scope:
            'The accepted baseline covers the 8px floating surface, 4px nested item radius, edge-to-edge group separators, 16px optional leading/trailing visuals, subtle focus treatment, destructive action placement, external-link item, and canonical trigger relationships. The rendered action rows currently participate in the shared provisional balanced-inset candidate: 8px popup padding and 12px item padding on both axes pair with a 14px/16px single-line role to produce 40px rows. Labeled compact Menu and Select triggers share the same 14px-leading/10px-trailing optical padding and 120ms open-state chevron; icon-only triggers remain unchanged. The exact destructive foreground remains dependent on the provisional feedback palette. Value selection, shortcuts, grouped header panels, submenus, responsive substitution, and production adoption remain outside this baseline.',
          dependencies: [
            { name: 'Button and IconButton triggers', status: 'canonical' },
            { name: 'Typography and spacing', status: 'canonical' },
            { name: 'Radius and neutral color roles', status: 'canonical' },
            { name: 'Destructive feedback foreground', status: 'provisional' },
            { name: 'Radix DropdownMenu behavior', status: 'retained' },
            { name: 'Floating elevation', status: 'provisional' },
            { name: 'Popup item row density', status: 'provisional' },
          ],
        },
        statusDetail:
          'The accepted reusable V1 baseline covers immediate actions and external links while preserving Radix menu behavior. Selection menus, grouped header panels, submenus, and production consumers remain unchanged.',
      },
      {
        ...component(
          'tooltip',
          'Tooltip',
          'Provides brief non-essential explanation on demand.',
          'Tooltips must not carry information unavailable to touch or keyboard users.',
          {
            priority: 'v1-core',
            ...mapped,
            evidence: [
              '21 product imports use shared Tooltip; 13 Help imports indicate adjacent explanatory behavior.',
              'Index and homepage metrics exercise label explanation and long copy; CopyValue and SectionAnchor exercise transient action feedback.',
              'The two current Help wrappers disagree on glyph, size, click, touch, and keyboard handling.',
            ],
            decisionPrompts: [
              'Resolve other tooltip jobs only from real product evidence; keep essential instructions visible and action feedback in its owning component.',
            ],
            nextAction:
              'Defer other tooltip jobs and production adoption until a real composition requires them.',
          }
        ),
        status: 'defined',
        outputStatus: 'rendered',
        designAuthority: 'current-baseline',
        implementationStatus: 'canonical-candidate',
        implementationSource:
          'src/components/design-system-v1/help-tooltip.tsx',
        contextSources: [
          {
            role: 'accepted-decision',
            label: 'Explanatory HelpTooltip baseline accepted',
            path: 'docs/wiki/decisions.md#2026-08-19--explanatory-helptooltip-baseline-accepted',
          },
        ],
        adoptionStatus: 'none',
        review: {
          status: 'ready',
          scope:
            'The explanatory help trigger beside accepted field and metric labels, its 4px visible relationship, bare 16px glyph, bounded dynamic-width 8px floating surface, and click/touch behavior are accepted. Truncated values, icon-button naming, transient action feedback, essential instructions, menus, and production adoption remain outside this baseline.',
          dependencies: [
            { name: 'Typography and spacing', status: 'canonical' },
            { name: 'Iconography', status: 'canonical' },
            { name: 'Radix Tooltip behavior', status: 'retained' },
            { name: 'Floating elevation', status: 'provisional' },
          ],
        },
        statusDetail:
          'The accepted reusable baseline consolidates the explanatory-help job with a bare inline trigger, retained Radix semantics, explicit click/touch access, and a bounded dynamic-width floating surface. Other tooltip jobs and production consumers remain unchanged.',
      },
    ],
  },
  {
    id: 'feedback',
    name: 'Feedback',
    description:
      'Communicates status, progress, results, loading, and absence.',
    foundationDependencies: [
      'color',
      'typography',
      'iconography',
      'motion',
      'accessibility',
    ],
    defaultStates: [
      'Informational',
      'Success',
      'Warning',
      'Danger',
      'In progress',
    ],
    expectedDecisions: openDefinitionSlots(
      'Intent hierarchy',
      'Persistence and dismissal',
      'Loading lifecycle',
      'Recovery actions'
    ),
    items: [
      {
        ...component(
          'alert',
          'Inline message',
          'Communicates important contextual status or risk within the current flow.',
          'Inline feedback needs consistent intent, prominence, and recovery guidance.',
          {
            priority: 'v1-core',
            ...mapped,
            evidence: [
              'Eighteen product imports use shared Alert, while warning, compliance, upload, approval, and transaction consumers locally reconstruct icon placement, radius, color, and density.',
              'Trading-paused and low-liquidity notices establish persistent warning jobs with full title/body and compact titleless anatomy.',
              'Approval failures establish an actionable danger job; transient confirmation remains Toast and transaction orchestration remains a higher-level lifecycle composition.',
              'Zapper action qualifiers establish a compact summary presentation that keeps one title row visible and moves nonessential explanation into the accepted Help Tooltip.',
              'Automated issuance guidance establishes an opt-in contained summary icon when a leading semantic symbol must balance a trailing compact action.',
            ],
            decisionPrompts: [
              'Judge the shared information/success/warning/danger anatomy, 8px icon/title relationship, full-width explanatory body, 16px default and 12px compact full-message inset, restrained 8px full-message radius, opaque semantic surface/border roles, and the compact summary’s fully rounded one-row geometry.',
              'Judge the summary-only contained icon as a 32px semantic circle with a 16px glyph and 8px outer inset, used to balance a trailing compact action without changing the plain default.',
              'Confirm that persistence and announcement urgency remain caller-owned: the component has no generic close action and no blanket alert role.',
              'Confirm that summary presentation hides only supporting explanation; material instructions, recovery truth, and required next actions remain visible in the full layout.',
            ],
            relationships: [
              {
                id: 'toast',
                note: 'Use Toast for routine transient confirmation; use Inline Message when information must remain in context.',
              },
              {
                id: 'transaction-action',
                note: 'Transaction lifecycle compositions may consume the full or summary Inline Message presentation, but tooltip content, retry orchestration, and modal lifecycle remain composition-owned.',
              },
            ],
            nextAction:
              'Adopt the accepted full or summary presentation explicitly where product context matches; keep announcement urgency, tooltip content, dismissal, and recovery orchestration caller-owned.',
          }
        ),
        outputStatus: 'rendered',
        designAuthority: 'current-baseline',
        implementationStatus: 'canonical-candidate',
        implementationSource:
          'src/components/design-system-v1/inline-message.tsx',
        contextSources: [
          {
            role: 'authority',
            label: 'Typed Inline Message contract',
            path: 'src/views/internal/design-system/component-catalog-support.ts',
          },
          {
            role: 'accepted-decision',
            label: 'Inline Message presentation decision',
            path: 'docs/wiki/decisions.md#2026-09-01--inline-message-supports-full-and-compact-summary-presentations',
          },
          {
            role: 'implementation',
            label: 'Reusable Inline Message candidate',
            path: 'src/components/design-system-v1/inline-message.tsx',
          },
        ],
        adoptionStatus: 'none',
        review: {
          status: 'ready',
          scope:
            'The accepted unadopted baseline covers persistent information, success, warning, and danger; default and compact full-message density; the opt-in compact summary; and its opt-in contained leading icon for a trailing compact action. Summary may hide only supporting explanation in a Help Tooltip. Material instructions, consequences, recovery truth, and required next actions remain visible. Toast timing/stacking, field validation, compliance copy, dismissal, transaction orchestration, and production adoption remain outside.',
          dependencies: [
            { name: 'Feedback color direction', status: 'canonical' },
            { name: 'Typography and spacing roles', status: 'canonical' },
            { name: 'Iconography', status: 'canonical' },
            { name: 'Button', status: 'canonical' },
          ],
        },
        statusDetail:
          'The accepted reusable implementation separates persistent contextual feedback from Toast and supports a constrained one-row summary with plain or contained icon geometry without making lifecycle, dismissal, or product explanation component-owned.',
      },
      component(
        'toast',
        'Toast',
        'Confirms a transient result without blocking work.',
        'Toasts need strict timing, stacking, announcement, and action rules.',
        {
          priority: 'v1-core',
          ...mapped,
          evidence: [
            'Sonner is installed as the shared toast implementation and transaction results use notifications.',
          ],
          decisionPrompts: [
            'Apply the accepted routine-versus-consequential outcome boundary, then define duration, pause, stacking, action/retry, and persistent-error fallback.',
          ],
          relationships: [
            {
              id: 'alert',
              note: 'Use Inline message when users must retain or act on the information in context.',
            },
          ],
          nextAction:
            'Classify current notifications by transient versus persistent need.',
        }
      ),
      component(
        'progress',
        'Progress indicator',
        'Shows determinate completion of an operation.',
        'Progress indicators need meaningful values and completion behavior.',
        {
          priority: 'v1-core',
          ...mapped,
          evidence: [
            'Three product imports use shared Progress; steppers and transaction flows add progress-like states.',
          ],
          decisionPrompts: [
            'Define bar anatomy, labels, percentages, indeterminate fallback, completion, and error interruption.',
          ],
          nextAction:
            'Audit upload/deploy/transaction progress separately from step navigation.',
        }
      ),
      {
        ...component(
          'spinner',
          'Spinner',
          'Shows short indeterminate activity.',
          'Spinners need constraints so they do not replace informative loading states.',
          {
            priority: 'v1-core',
            ...mapped,
            evidence: ['29 product imports use shared Spinner.'],
            decisionPrompts: [
              'Define sizes, accessible label, delayed appearance, inline versus blocking use, and timeout escalation.',
            ],
            relationships: [
              {
                id: 'skeleton',
                note: 'Use Skeleton when preserving content geometry is more informative.',
              },
            ],
            nextAction:
              'Preserve the accepted role-based scale and contextual color during adoption; keep timing, timeout, and transaction progress composition-owned.',
          }
        ),
        outputStatus: 'rendered',
        designAuthority: 'current-baseline',
        implementationStatus: 'canonical-candidate',
        implementationSource: 'src/components/design-system-v1/loading.tsx',
        contextSources: [
          {
            role: 'authority',
            label: 'Spinner recorded baseline',
            path: 'docs/wiki/domains/design-system-reference.md#skeleton-and-spinner',
            detail:
              'No dedicated decision entry is recorded. This synthesis documents the current baseline; retain the catalog review exclusions and provisional dependencies.',
          },
        ],
        adoptionStatus: 'none',
        review: {
          status: 'ready',
          scope:
            'The candidate covers 14px status, 16px inline/control, and 24px local-region indeterminate activity with inherited contextual color, labeled or context-hidden accessibility, and reduced-motion treatment.',
          dependencies: [
            { name: 'Contextual semantic foreground', status: 'canonical' },
          ],
        },
        statusDetail:
          'The accepted unadopted Spinner baseline covers three distinct placement roles and does not replace Skeleton or determinate progress.',
      },
      {
        ...component(
          'skeleton',
          'Skeleton',
          'Reserves layout while content loads.',
          'Skeletons should preserve final geometry and avoid false detail.',
          {
            priority: 'v1-core',
            ...mapped,
            evidence: [
              '73 product imports make Skeleton the second-most-used shared primitive.',
            ],
            decisionPrompts: [
              'Define base tone, motion policy, shape matching, repetition limits, and transition to empty/error.',
            ],
            nextAction:
              'Preserve host-authored loading geometry during consumer migration; do not replace refined overview or feature-card compositions wholesale.',
          }
        ),
        outputStatus: 'rendered',
        designAuthority: 'current-baseline',
        implementationStatus: 'canonical-candidate',
        implementationSource: 'src/components/design-system-v1/loading.tsx',
        contextSources: [
          {
            role: 'authority',
            label: 'Skeleton recorded baseline',
            path: 'docs/wiki/domains/design-system-reference.md#skeleton-and-spinner',
            detail:
              'No dedicated decision entry is recorded. This synthesis documents the current baseline; retain the catalog review exclusions and provisional dependencies.',
          },
        ],
        adoptionStatus: 'none',
        review: {
          status: 'ready',
          scope:
            'The primitive owns border-neutral fill, quiet pulse, reduced-motion handling, and no default shape. Hosts retain truthful width, height, radius, repetition, and loading boundaries; migration must preserve refined product compositions and audit consumers that relied on the legacy default radius.',
          dependencies: [{ name: 'Border neutral', status: 'canonical' }],
        },
        statusDetail:
          'The accepted unadopted Skeleton baseline supplies material and motion only; existing overview and feature-card loading compositions remain authoritative evidence.',
      },
      {
        ...component(
          'empty-state',
          'Empty state',
          'Explains why content is absent and what can happen next.',
          'Empty states turn absence into a clear product state rather than a blank surface.',
          {
            priority: 'v1-core',
            auditStatus: 'mapped',
            evidence: [
              'No proposals, delegates, rebalances, yield opportunities, and token-search results establish routine quiet absence.',
              'The deploy token picker establishes a user-resolvable absence with explanation and existing follow-up actions.',
            ],
            decisionPrompts: [
              'Choose bespoke illustration only for a small evidenced set of meaningful first-use or milestone states.',
            ],
            relationships: [
              {
                id: 'alert',
                note: 'An empty state owns an absent content region; an alert annotates existing context.',
              },
            ],
            nextAction:
              'Review quiet and actionable absence hierarchy without treating host framing, request-channel copy, or bespoke milestone artwork as part of the primitive.',
          }
        ),
        outputStatus: 'rendered',
        designAuthority: 'current-baseline',
        implementationStatus: 'canonical-candidate',
        implementationSource: 'src/components/empty-state/index.tsx',
        contextSources: [
          {
            role: 'authority',
            label: 'EmptyState recorded baseline',
            path: 'docs/wiki/domains/design-system-reference.md#emptystate',
            detail:
              'No dedicated decision entry is recorded. This synthesis documents the current baseline; retain the catalog review exclusions and provisional dependencies.',
          },
        ],
        adoptionStatus: 'none',
        review: {
          status: 'ready',
          scope:
            'The accepted baseline covers quiet title-only absence and actionable title, description, optional bare icon, and canonical ActionGroup hierarchy. Host framing, exact request-channel actions, bespoke milestone artwork, loading/error states, and production adoption remain outside it.',
          dependencies: [
            { name: 'Button', status: 'canonical' },
            { name: 'ActionGroup', status: 'canonical' },
          ],
        },
        statusDetail:
          'The accepted unadopted baseline covers quiet and actionable absence anatomy; bespoke milestone compositions and production adoption remain separate.',
      },
    ],
  },
  {
    id: 'data-display',
    name: 'Data display',
    description: 'Presents identity, status, metrics, and structured data.',
    foundationDependencies: [
      'typography',
      'spacing',
      'color',
      'iconography',
      'layout',
    ],
    defaultStates: [
      'Default',
      'Loading',
      'Missing',
      'Truncated',
      'Interactive if applicable',
    ],
    expectedDecisions: openDefinitionSlots(
      'Information hierarchy',
      'Formatting and truncation',
      'Responsive transformation',
      'Loading and missing data'
    ),
    items: [
      {
        ...component(
          'badge',
          'Lifecycle status',
          'Communicates a process phase, actionable state, or final outcome.',
          'Lifecycle meaning should be consistent without turning every compact label into the same component.',
          {
            priority: 'v1-core',
            auditStatus: 'mapped',
            evidence: [
              'Governance proposals and Auctions rebalances require consistent waiting, active, actionable, processing, successful, unsuccessful, and closed lifecycle states.',
              'The accepted lifecycle roles, opaque semantic tones, standardized indicators, countdown pairing, and restricted processing motion were pressure-tested across active, waiting, actionable, successful, unsuccessful, and closed proposal and auction records; the current lab reopens only the compact geometry as a 28px trial beside micro actions.',
              'Category labels, counts, qualifiers, and removable chips remain distinct jobs and are not generalized into this lifecycle candidate.',
            ],
            decisionPrompts: [
              'Resolve category, count, qualifier, and removable-chip anatomy only when their product compositions are reviewed.',
            ],
            nextAction:
              'Choose an opt-in production adoption seam when a reviewed product composition is migrated; leave other compact-label jobs open.',
          }
        ),
        outputStatus: 'rendered',
        designAuthority: 'current-baseline',
        implementationStatus: 'canonical-candidate',
        implementationSource: 'src/components/lifecycle-status/index.tsx',
        contextSources: [
          {
            role: 'accepted-decision',
            label: 'Lifecycle Status roles accepted; sizing reopened',
            path: 'docs/wiki/decisions.md#2026-08-18--lifecycle-status-is-canonical-other-compact-labels-are-not',
            detail:
              'Roles remain accepted; the same decision explicitly leaves the later 28px geometry trial unaccepted.',
          },
        ],
        adoptionStatus: 'none',
        review: {
          status: 'ready',
          scope:
            'Lifecycle roles, role-to-icon and role-to-tone mapping, supporting countdown pairing, and spinner only for short indeterminate processing are accepted. Exact compact geometry is reopened for human review through one shared 28px trial with increased intrinsic side inset. Category labels, counts, qualifiers, removable chips, proposal outcome-detail composition, progress behavior, and production adoption remain outside this candidate.',
          dependencies: [
            { name: 'Feedback color roles', status: 'provisional' },
            { name: 'Iconography', status: 'canonical' },
          ],
        },
        statusDetail:
          'A reusable V1 candidate owns lifecycle role, standardized indicator, opaque semantic tone, and restricted motion after pressure testing in Governance and Auctions records. Other compact-label jobs and production adoption remain open.',
      },
      {
        ...component(
          'entity-identity',
          'Entity identity',
          'Pairs logo/avatar with name, symbol, chain, and optional supporting metadata.',
          'Token, DTF, account, and governance identity appears across nearly every golden screen.',
          {
            priority: 'product-extension',
            ...mapped,
            evidence: [
              'TokenLogo appears in 78 product consumer files; the Overview asset table provides high-density name/symbol/logo evidence while Avatar has different fallback needs.',
              'TokenLogoWithChain has repeated Portfolio consumers, while recent Index surfaces locally reconstruct the same DTF-logo plus chain-badge composition.',
              'Overlapping asset identity uses two legacy StackTokenLogo implementations; the canonical chain and token stacks now own a shared outside-artwork separator and optical leading-axis correction.',
              'The canonical candidate now passes long-name truncation, deterministic logo fallback, account-mark composition, and a dense 32px Index holdings slice.',
              'EntityIdentity owns the accepted 8px direct mark-slot-to-copy relationship; alignment slots remain parent-owned and must not add a second arbitrary text gap.',
            ],
            decisionPrompts: [
              'Choose the first opt-in production adoption slice after visual review; legacy stack and badge consumers remain unchanged.',
            ],
            nextAction:
              'Review the corrected chain-badge ratio and dense holdings slice, then choose one opt-in production adoption seam.',
          }
        ),
        outputStatus: 'rendered',
        designAuthority: 'current-baseline',
        implementationStatus: 'canonical-candidate',
        implementationSource: 'src/components/entity-identity/index.ts',
        contextSources: [
          {
            role: 'implementation',
            label: 'Canonical identity-family exports',
            path: 'src/components/entity-identity/index.ts',
          },
          {
            role: 'accepted-decision',
            label: 'Stacked identity artwork and axis decision',
            path: 'docs/wiki/decisions.md#2026-08-19--stacked-identity-separators-preserve-artwork-size-and-axis',
            detail:
              'This decision scopes stack separators and alignment, not every identity or asset-picker composition.',
          },
          {
            role: 'implementation',
            label: 'Provisional token-stack trigger',
            path: 'src/components/entity-identity/token-stack-trigger.tsx',
            detail:
              'Opt-in 44px logo-led trigger under Discover review; not part of accepted ordinary Button geometry or production adoption.',
          },
          {
            role: 'visual-evidence',
            label: 'Compact wrapping table-title trial',
            path: 'docs/plans/design-system-table-family-holdings-slice.md#compact-wrapping-identity-titles--september-12-trial',
            detail:
              'Opt-in 16px/20px name leading with a 24px single-line floor. Existing identity defaults and reviewed type roles remain unchanged; the table trial is not design acceptance.',
          },
        ],
        adoptionStatus: 'none',
        review: {
          status: 'ready',
          scope:
            'Review identity anatomy, truncation, fallbacks, chain-badge ratio, and overlapping-logo separation. The domain logo renderers are retained intentionally.',
          dependencies: [
            { name: 'TokenLogo', status: 'retained' },
            { name: 'ChainLogo', status: 'retained' },
            { name: 'Blockies', status: 'retained' },
          ],
        },
        statusDetail:
          'A reusable V1 candidate implements identity text with an 8px mark-to-copy relationship, domain marks, chain-badge geometry, shared chain/token stack frames, fallbacks, and truncation. Existing product consumers remain unchanged.',
      },
      {
        ...component(
          'metric',
          'Metric',
          'Presents a label and formatted value without owning the surrounding card or grid.',
          'Financial screens repeatedly need consistent value hierarchy, alignment, and missing-data behavior.',
          {
            priority: 'product-extension',
            ...mapped,
            evidence: [
              'Overview and Governance use inline key/value pairs; Home uses headline stacked values; Auctions uses three parallel outcome metrics.',
              'The strong Home source uses a 16px/300 headline label and 16px/500 value. The canonical candidate preserves that typography and equal sizing for horizontal peers.',
            ],
            decisionPrompts: [
              'Keep auction-selector alignment parent-owned without adding an outcome role or icon API.',
              'Confirm stale-data language only when a real product source distinguishes stale from missing or loading.',
            ],
            nextAction:
              'Preserve the reviewed inline anatomy in auction selectors; pressure-test any separate full-view outcome composition only when that surface is reviewed.',
          }
        ),
        outputStatus: 'rendered',
        designAuthority: 'current-baseline',
        implementationStatus: 'canonical-candidate',
        implementationSource: 'src/components/metric/index.tsx',
        contextSources: [
          {
            role: 'authority',
            label: 'Metric recorded baseline',
            path: 'docs/wiki/domains/design-system-reference.md#metric-anatomy',
            detail:
              'This synthesis covers the broader Metric anatomy. The linked rich-record decision below supports auction-selector composition only, not a universal value-weight default.',
          },
          {
            role: 'accepted-decision',
            label: 'Rich-record Metric composition boundary',
            path: 'docs/wiki/decisions.md#2026-08-18--rich-records-share-foundations-not-a-universal-row',
            detail:
              'Auction selectors reuse inline Metric anatomy with parent-owned 16px/500 value emphasis. Keep generic inline defaults and headline anatomy separate.',
          },
        ],
        adoptionStatus: 'none',
        review: {
          status: 'ready',
          scope:
            'Inline and centered-headline metric anatomy are accepted, including the source-faithful 16px/300 label and 16px/500 value. Auction selectors reuse inline anatomy with one consistent parent-owned value emphasis; icons, help affordances, and the shown legacy loading skeleton are not canonical Metric variants.',
          dependencies: [],
        },
        statusDetail:
          'Reusable V1 Metric and MetricValue candidates implement the accepted inline and centered-headline anatomy. Auction selector metrics reuse inline anatomy while their parent owns consistent value emphasis, framing, and layout. Production adoption has not started.',
      },
      {
        ...component(
          'card',
          'Card / content region',
          'Groups a coherent repeated or actionable unit when framing is meaningful.',
          'Clear criteria prevent every page section from becoming nested rounded cards.',
          {
            priority: 'v1-core',
            ...mapped,
            evidence: [
              'The 50 shared Card imports are dominated by 29 legacy Yield DTF consumers; 12 Index imports primarily frame Overview sections rather than repeated interactive objects.',
              'The shared production Card default hardcodes rounded-3xl, 20px header/content padding, and title typography that conflict with accepted V1 shape, spacing, and typography rules, so it is evidence rather than a migration target.',
              'The recent Home Index feature card is authoritative existing visual and interaction evidence; the compact Discover treatment shows how that source adapts without proving a universal Card shell.',
              'Reviewed Governance proposals and Auction selectors establish a separate square repeated-record grammar and must not become generic Card variants.',
            ],
            decisionPrompts: [
              'Preserve the accepted square shell, 8/24/16px structural spacing, 8px related-content spacing, and 24px supporting-row axis.',
              'Keep all unspecified Home behavior plus structural content-region and selective substrate-corner rules outside the repeated-card API.',
            ],
            nextAction:
              'At the next synchronization boundary, extract preservation-first from the production Home source without removing unspecified chart, ticker, transcript, video, chain, or interaction behavior.',
          }
        ),
        outputStatus: 'rendered',
        designAuthority: 'current-baseline',
        implementationStatus: 'specimen',
        contextSources: [
          {
            role: 'accepted-decision',
            label: 'Structural regions and Home card review boundary',
            path: 'docs/wiki/decisions.md#2026-08-18--structural-content-regions-and-interactive-cards-are-separate-jobs',
            detail:
              'The Home delta and preservation contract do not establish a universal Card API or other card families.',
          },
        ],
        adoptionStatus: 'none',
        review: {
          status: 'provisional',
          scope:
            'The accepted review preserves the Home source while applying a square outer shell, 8px shell inset and contained-media radius, 24px primary and supporting-row axes, 16px internal-region spacing, and 8px directly related spacing. Final API, non-media families, responsive edge cases, and production adoption remain later.',
          dependencies: [
            { name: 'Index feature card', status: 'retained' },
            { name: 'Metric', status: 'canonical' },
          ],
        },
        statusDetail:
          'The preservation-first Home feature-card foundation alignment is accepted. Real usage and structural-region rules are mapped; reusable extraction is queued and no production adoption is claimed.',
      },
      {
        ...component(
          'table',
          'Table',
          'Displays structured rows and columns for comparison.',
          'Tables require shared alignment and density rules without forcing one rigid composition.',
          {
            priority: 'v1-core',
            ...mapped,
            evidence: [
              '27 imports use Table, 18 DataTable, and 13 legacy Table; at least three table systems coexist.',
              'Overview holdings supplies the identity/allocation-first narrow precedent; the local candidate retains ordinary 16px peers without defining a dense variant.',
              'Governance proposals and Auctions rebalances prove that rich navigable records need a distinct composition.',
              'The reviewed fixtures map real CMC20 proposal and rebalance mechanics with deterministic names, values, dates, vote distribution, metrics, and provenance; fixture copy is not a migration source.',
            ],
            decisionPrompts: [
              'Review rich navigable-record hierarchy separately; it is not a dense Table row variant.',
              'Preserve the pressure-tested constrained-width record wrapping; resolve dense-table transformation and final Auctions route behavior in a deliberate integration experiment.',
            ],
            relationships: [
              {
                id: 'data-table',
                note: 'Data table adds interaction to the same display anatomy.',
              },
            ],
            nextAction:
              'Review the new Earn opportunities alongside the still-open Discover mobile-card trials. Earn includes governance, staking and DeFi Yield after direct source checks. Portfolio and Exposure/Collateral remain checkpoints. Rich records, transaction design and production adoption remain separate; no universal row API is proposed.',
          }
        ),
        outputStatus: 'rendered',
        designAuthority: 'exploratory',
        implementationStatus: 'specimen',
        implementationSource:
          'src/views/internal/design-system/table-family/review.tsx',
        contextSources: [
          {
            role: 'implementation',
            label: 'Bounded table-family candidate',
            path: 'src/views/internal/design-system/table-family/review.tsx',
          },
          {
            role: 'product-evidence',
            label: 'Production transfer and review boundary',
            path: 'docs/plans/design-system-table-family-first-slice.md',
          },
          {
            role: 'visual-evidence',
            label: 'Holdings mobile predecessor',
            path: 'docs/plans/design-system-table-family-evidence/index.md',
          },
          {
            role: 'implementation',
            label: 'Exposure and Collateral candidate',
            path: 'src/views/internal/design-system/table-family/holdings-review.tsx',
          },
          {
            role: 'product-evidence',
            label: 'Holdings source transfer and verification boundary',
            path: 'docs/plans/design-system-table-family-holdings-slice.md',
          },
          {
            role: 'implementation',
            label: 'Discover browsing-cell candidate',
            path: 'src/views/internal/design-system/table-family/discover-review.tsx',
          },
          {
            role: 'product-evidence',
            label: 'Discover source transfer and scoped proof',
            path: 'docs/plans/design-system-table-family-discover-slice.md',
          },
          {
            role: 'product-evidence',
            label: 'Discover mobile card transfer and review boundary',
            path: 'docs/plans/design-system-discover-mobile-cards.md',
          },
          {
            role: 'implementation',
            label: 'Earn opportunity candidate',
            path: 'src/views/internal/design-system/table-family/earn-review.tsx',
          },
          {
            role: 'product-evidence',
            label: 'Earn source transfer and bounded verification',
            path: 'docs/plans/design-system-table-family-earn-preparation.md',
          },
          {
            role: 'product-evidence',
            label: 'DeFi Yield source transfer and review boundary',
            path: 'docs/plans/design-system-table-family-defi-slice.md',
          },
        ],
        adoptionStatus: 'none',
        review: {
          status: 'provisional',
          scope:
            'Bounded Portfolio, Holdings, Discover and Earn candidates share cell vocabulary and sorting ownership. Discover adds classifications, basket inspection, return/trends and production chart/ticker previews. Earn adds governed assets, rate kinds and wallet-dependent pairs with non-executing action boundaries; DeFi Yield adds pool identities, rate breakdowns and separate external destinations. Rich records, transaction design and page-level controls remain separate. No universal Table/Row API, chart-system acceptance or production adoption.',
          dependencies: [
            { name: 'Entity identity', status: 'canonical' },
            { name: 'Metric value', status: 'canonical' },
            {
              name: 'Lifecycle status pill',
              status: 'canonical',
              detail:
                'The lifecycle meaning and presentation contract is canonical; its current 28px geometry trial remains under human review, while rich-record and Table/Row anatomy remain provisional.',
            },
            { name: 'Table / row anatomy', status: 'provisional' },
          ],
        },
      },
      {
        ...component(
          'data-table',
          'Data table',
          'Adds sorting, filtering, selection, or pagination to tabular data.',
          'Interactive tables need consistent controls without turning every table into a framework.',
          {
            priority: 'v1-core',
            ...mapped,
            evidence: [
              '18 product imports use DataTable across Discover, Overview, Earn, and Portfolio.',
            ],
            decisionPrompts: [
              'Define sorting, filtering, selection, pagination, loading, error, empty, sticky regions, and responsive behavior.',
              'Allow product-specific columns and cells; standardize interaction contracts and geometry.',
            ],
            stateAdditions: [
              'Sorted',
              'Filtered',
              'Selected rows',
              'Paginated',
              'No results',
            ],
            nextAction:
              'Use Discover/Earn plus Portfolio as complementary stress tests after base Table anatomy.',
          }
        ),
        outputStatus: 'in-composition',
        designAuthority: 'exploratory',
        implementationStatus: 'specimen',
        implementationSource: 'src/components/ui/data-table.tsx',
        compositionSource: {
          componentId: 'table',
          anchor: 'table-family-review',
          label: 'Portfolio table-family candidate',
        },
        review: {
          status: 'provisional',
          scope:
            'The first Table slice exercises existing sorting and row rendering through local cells, plus opt-in accessible table naming/sort state. Filtering, selection, pagination and other table families are not newly designed or approved.',
          dependencies: [
            { name: 'Table / row anatomy', status: 'provisional' },
          ],
        },
      },
      component(
        'chart',
        'Chart',
        'Visualizes change, comparison, or composition in data.',
        'Charts need truthful scales, accessible summaries, and consistent interaction.',
        {
          priority: 'product-extension',
          ...mapped,
          evidence: [
            'Eight product imports use shared chart helpers; recent Home and Overview performance charts establish a reviewed color direction.',
          ],
          decisionPrompts: [
            'Define container anatomy, axis/type, tooltip, legend, time range, loading/empty/error, accessible summary, and performance/categorical color use.',
          ],
          nextAction:
            'Treat performance, allocation, and comparison charts as separate chart patterns sharing foundations.',
        }
      ),
      {
        ...component(
          'copy-value',
          'Copyable value',
          'Displays a deliberately formatted value with an explicit copy action.',
          'Addresses and transaction identifiers recur throughout the product and need reliable feedback.',
          {
            priority: 'product-extension',
            ...mapped,
            evidence: [
              'CopyValue has ten product imports and Copy has nine.',
              'DTF token-address rows and Delegation outcomes show repeated dense-row pressure where a separate icon button distorts otherwise 20px aligned facts.',
            ],
            decisionPrompts: [
              'Define visible formatting, copy affordance, success feedback, failure, and sensitive-value policy.',
            ],
            relationships: [
              {
                id: 'tooltip',
                note: 'Tooltip may reveal the full value but must not be the only accessible text.',
              },
            ],
            nextAction:
              'Use the accepted primitive in later source-grounded address/action compositions; define failure presentation and sensitive-value policy only from real requirements.',
          }
        ),
        outputStatus: 'rendered',
        designAuthority: 'current-baseline',
        implementationStatus: 'canonical-candidate',
        implementationSource:
          'src/components/design-system-v1/copyable-value.tsx',
        contextSources: [
          {
            role: 'accepted-decision',
            label: 'Copyable Value integrated treatment accepted',
            path: 'docs/wiki/decisions.md#2026-08-31--copyable-value-supports-an-integrated-dense-row-treatment',
            detail:
              'The default remains separated; paired explorer and native/bridged lists remain composition-owned.',
          },
        ],
        adoptionStatus: 'none',
        review: {
          status: 'ready',
          scope:
            'The candidate covers two explicit treatments. Default keeps the deliberately formatted value beside a canonical micro copy control. Inline integrates the 14px monospace value and 14px copy/check icon into one 20px action with an 8px relationship gap for dense aligned rows. Both preserve full accessible text, deliberate shortening without CSS clipping, address normalization, resolved clipboard writes, event isolation, polite success announcement, Escape dismissal, and two-second semantic-success feedback without geometry shift or replayed entrance motion. Failure presentation, paired explorer layouts, native/bridged chain-address lists, and sensitive-value policy remain outside scope.',
          dependencies: [
            { name: 'IconButton', status: 'canonical' },
            {
              name: 'InlineAction presentation',
              status: 'provisional',
            },
            {
              name: 'Tooltip primitive for transient feedback',
              status: 'retained',
            },
          ],
        },
        statusDetail:
          'The accepted unadopted Copyable Value owns deliberate formatting, separated and integrated copy-action treatments, truthful transient success feedback, and 14px monospace machine-value typography. The inline treatment is opt-in and does not replace the default micro control. Explorer and multi-chain address compositions remain separate composition work.',
      },
    ],
  },
  {
    id: 'disclosure',
    name: 'Disclosure',
    description:
      'Reveals secondary detail without changing the user’s location.',
    foundationDependencies: [
      'typography',
      'spacing',
      'iconography',
      'motion',
      'accessibility',
    ],
    defaultStates: [
      'Collapsed',
      'Expanded',
      'Hover',
      'Focus-visible',
      'Disabled',
    ],
    expectedDecisions: openDefinitionSlots(
      'Disclosure semantics',
      'Trigger anatomy',
      'Motion',
      'Nested content'
    ),
    items: [
      {
        ...component(
          'accordion',
          'Accordion',
          'Reveals one or more stacked content sections.',
          'Repeated expandable regions need consistent headers and keyboard behavior.',
          {
            priority: 'v1-core',
            ...mapped,
            evidence: [
              'Thirteen product imports use shared Accordion, but FAQ/help, product detail, and task-section compositions currently override its anatomy differently.',
              'Earn FAQ and Yield staking About converge on coordinated question-and-answer rows with a trailing chevron and full-width trigger.',
              'The Index whitepaper change summary supplies a nested product-detail disclosure with long structured content.',
              'Deploy, manage, governance, and legacy auction consumers add progress, validation, edit controls, and bespoke step headers; those jobs are explicitly excluded from the shared informational candidate.',
            ],
            decisionPrompts: [
              'Judge the stable 16px row/content axis, 48px minimum trigger, 16px medium hierarchy, trailing 16px chevron, divider-free grouping, focus, long-label wrapping, and 14px/20px supporting content.',
              'Confirm that informational FAQ/detail anatomy is coherent without absorbing task-section progress, validation, or actions.',
            ],
            relationships: [
              {
                id: 'collapsible',
                note: 'Accordion coordinates a set; the audited independent disclosures remain a distinct Collapsible job and do not inherit this proposal as authority.',
              },
            ],
            nextAction:
              'Pressure-test the accepted informational anatomy in real FAQ/detail consumers without absorbing task-section behavior or starting broad production adoption.',
          }
        ),
        outputStatus: 'rendered',
        designAuthority: 'current-baseline',
        implementationStatus: 'canonical-candidate',
        implementationSource: 'src/components/design-system-v1/accordion.tsx',
        contextSources: [
          {
            role: 'accepted-decision',
            label: 'Informational Accordion baseline accepted',
            path: 'docs/wiki/decisions.md#2026-08-21--informational-accordion-baseline-accepted',
          },
        ],
        adoptionStatus: 'none',
        review: {
          status: 'ready',
          scope:
            'The accepted baseline covers coordinated informational FAQ and product-detail rows with retained Radix single/multiple expansion, keyboard behavior, stable 16px row/content axis, 48px minimum trigger, an 8px expanded title/body relationship, a 20px body-to-next-title rhythm, 16px medium label, trailing unframed chevron, divider-free grouping, text-and-chevron hover feedback, focus, long labels, disabled state, 14px/20px supporting content, and V1-specific 180ms content-height motion. Multiple expansion is the recommended ordinary informational mode; single expansion is explicit for mutually substitutive or unusually long regions. Task-section headers, progress, validation, edit actions, content-specific internal layout, one independent disclosure, and production adoption remain outside.',
          dependencies: [
            {
              name: 'Spacing, typography, and iconography',
              status: 'canonical',
            },
            { name: 'Focus and content color roles', status: 'canonical' },
            { name: 'Radix Accordion behavior', status: 'retained' },
            { name: 'Ordinary component motion', status: 'canonical' },
          ],
        },
        statusDetail:
          'The accepted, unadopted V1 baseline covers only the coherent informational FAQ/detail seam. Callers explicitly choose single or multiple behavior; multiple is the normal informational recommendation. Task accordions remain composition evidence and independent disclosures remain Collapsible work.',
      },
      {
        ...component(
          'collapsible',
          'Collapsible',
          'Toggles a single contextual block of content.',
          'A light disclosure primitive is useful when accordion grouping semantics do not apply.',
          {
            priority: 'v1-conditional',
            ...mapped,
            evidence: [
              'All nine product importers were classified: bridge token help and eligibility jurisdiction detail are subordinate one-off disclosures; auction bids and max-auction-size controls reveal optional dense regions; two dev-only rebalance diagnostics reveal raw data; four governance previews repeat the same executable-code disclosure job.',
              'None of these consumers coordinates peer sections or needs Accordion single/multiple set semantics.',
              'The governance consumers suggest one product-specific CodeDisclosure composition on top of Collapsible; they do not justify absorbing arbitrary code layout into a shared disclosure primitive.',
            ],
            decisionPrompts: [
              'Define whether the trigger is fully owned by the primitive or always composition-owned, and align disclosure motion with the accepted 180ms ordinary-component duration.',
              'Decide whether native details supplies enough behavior for static help while controlled product disclosures retain Radix Collapsible.',
            ],
            relationships: [
              {
                id: 'accordion',
                note: 'Use Accordion for a coordinated set; retain Collapsible for one independent region or optional adjunct.',
              },
            ],
            nextAction:
              'Use the accepted one-region disclosure baseline and its shared Accordion presentation; hosted content, bespoke triggers and production adoption remain separate.',
          }
        ),
        outputStatus: 'rendered',
        designAuthority: 'current-baseline',
        auditStatus: 'mapped',
        implementationStatus: 'canonical-candidate',
        implementationSource: 'src/components/design-system-v1/collapsible.tsx',
        contextSources: [
          {
            role: 'accepted-decision',
            label: 'Independent Collapsible baseline accepted',
            path: 'docs/wiki/decisions.md#2026-08-21--independent-collapsible-baseline-accepted',
          },
        ],
        adoptionStatus: 'none',
        review: {
          status: 'ready',
          scope:
            'The rendered candidate covers one independently controlled disclosure with retained Radix behavior, the accepted disclosure trigger/content presentation, 180ms motion, and an optional caller-owned closed/open action cue for ambiguous resting states. Trigger and cue copy must name the actual hidden subject and action; they are never product copy defaults. It does not coordinate peer items, choose single versus multiple expansion, or standardize hosted help, auction fields, bid lists, executable code, or debug content. Native details, bespoke composition triggers, and production adoption remain outside.',
          dependencies: [
            { name: 'Radix Collapsible behavior', status: 'retained' },
            { name: 'Accordion disclosure presentation', status: 'canonical' },
            { name: 'Ordinary component motion', status: 'canonical' },
          ],
        },
        statusDetail:
          'The accepted, unadopted V1 baseline covers one independently controlled disclosure. It consumes the Accordion presentation rather than rebuilding it; hosts own their surrounding composition, revealed content, specific trigger wording, and any truthful closed/open cue.',
      },
    ],
  },
]
