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
      'Elevation',
      'Color',
      'Shape',
      'Spacing',
      'Motion',
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
      ...openDefinitionSlots('Constrained-screen adaptation'),
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
            ],
            decisionPrompts: [
              'Define the exact composition for evidenced consequential success outcomes.',
              'Define the visual style and placement of milestone illustration.',
              'Verify focus management and constrained-screen adaptation in the shared shell.',
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
        outputStatus: 'proposal',
        implementationStatus: 'canonical-candidate',
        adoptionStatus: 'none',
        review: {
          status: 'ready',
          scope:
            'Review the reusable 384/432px shell, square structure, 24px content axis, close action, anchored regions, and non-dismissible behavior. Outcome composition, illustration, constrained screens, and final elevation remain provisional.',
          dependencies: [
            { name: 'Button', status: 'canonical' },
            { name: 'IconButton', status: 'canonical' },
            { name: 'Radix Dialog behavior', status: 'retained' },
          ],
        },
        statusDetail:
          'A reusable V1 shell implements the accepted width, content-axis, region, close-action, and non-dismissible contracts. Outcome composition, final elevation, and constrained-screen behavior remain provisional; production adoption has not started.',
      },
      component(
        'drawer',
        'Drawer',
        'Presents contextual detail or a task from a screen edge.',
        'Drawers need clear use criteria, sizing, focus, and responsive behavior.',
        {
          priority: 'v1-core',
          ...mapped,
          evidence: [
            'Eight product imports use shared Drawer; token selection, staking, voting, and deploy all depend on it.',
          ],
          decisionPrompts: [
            'Define side/bottom placement, widths, header/footer, scrolling, nesting, and when a dialog is preferable.',
          ],
          nextAction:
            'Compare task drawers with selector drawers; retain one shell with composition-specific bodies if behavior aligns.',
        }
      ),
      component(
        'popover',
        'Popover',
        'Shows contextual interactive content near a trigger.',
        'Popovers require stable placement, collision, focus, and dismissal behavior.',
        {
          priority: 'v1-core',
          ...mapped,
          evidence: [
            'Nine product imports use shared Popover; many selectors and filters compose on it.',
          ],
          decisionPrompts: [
            'Define spacing from trigger, width ownership, collision, focus entry, dismissal, and contained chrome.',
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
            'Audit filter, help, and picker popovers for shell convergence.',
        }
      ),
      component(
        'dropdown-menu',
        'Menu',
        'Presents a compact list of contextual actions.',
        'Menus need semantic action grouping and complete keyboard behavior.',
        {
          priority: 'v1-core',
          ...mapped,
          evidence: ['Nine product imports use shared DropdownMenu.'],
          decisionPrompts: [
            'Define item anatomy, icons, shortcuts, separators, destructive items, submenus-if-needed, and selection versus action.',
          ],
          relationships: [
            {
              id: 'select',
              note: 'Select chooses a form value; Menu invokes actions.',
            },
          ],
          nextAction:
            'Inspect overflow and account/navigation menus for one item contract.',
        }
      ),
      component(
        'tooltip',
        'Tooltip',
        'Provides brief non-essential explanation on demand.',
        'Tooltips must not carry information unavailable to touch or keyboard users.',
        {
          priority: 'v1-core',
          ...mapped,
          evidence: [
            '21 product imports use shared Tooltip; 13 Help imports indicate adjacent explanatory behavior.',
          ],
          decisionPrompts: [
            'Define delay, placement, maximum copy, icon-button naming support, and touch alternatives.',
          ],
          nextAction:
            'Audit Tooltip and Help together; prevent long instructional content from entering tooltips.',
        }
      ),
    ],
  },
  {
    id: 'feedback',
    name: 'Feedback',
    description:
      'Communicates status, progress, results, loading, and absence.',
    foundationDependencies: [
      'Feedback color',
      'Typography',
      'Iconography',
      'Motion',
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
      component(
        'alert',
        'Inline message',
        'Communicates important contextual status or risk within the current flow.',
        'Inline feedback needs consistent intent, prominence, and recovery guidance.',
        {
          priority: 'v1-core',
          ...mapped,
          evidence: ['18 product imports use shared Alert.'],
          decisionPrompts: [
            'Define info/success/warning/danger anatomy, title/body/action, compact use, dismissal, and icon treatment.',
          ],
          nextAction:
            'Audit Alert plus ad hoc banners and validation summaries by persistence and required action.',
        }
      ),
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
      component(
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
            'Map spinner contexts by expected duration and blocked scope.',
        }
      ),
      component(
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
            'Pressure-test real tables, cards, and metrics; avoid one generic rounded bar language.',
        }
      ),
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
              'Pressure-test the canonical quiet anatomy in a table and reserve illustration decisions for meaningful real states.',
          }
        ),
        outputStatus: 'proposal',
        implementationStatus: 'canonical-candidate',
        adoptionStatus: 'none',
        review: {
          status: 'ready',
          scope:
            'Review quiet and user-resolvable absence anatomy. Illustration-led milestone states remain outside this candidate.',
          dependencies: [{ name: 'Button', status: 'canonical' }],
        },
        statusDetail:
          'A reusable V1 candidate implements quiet and user-resolvable absence anatomy using canonical actions. Illustration-led milestone states remain open; production adoption has not started.',
      },
    ],
  },
  {
    id: 'data-display',
    name: 'Data display',
    description: 'Presents identity, status, metrics, and structured data.',
    foundationDependencies: ['Typography', 'Spacing', 'Color', 'Iconography'],
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
      component(
        'badge',
        'Badge',
        'Labels status, category, or compact metadata.',
        'Badges need semantic roles that do not become decorative noise.',
        {
          priority: 'v1-core',
          auditStatus: 'partial',
          evidence: [
            'Status pills and metadata chips appear widely without one obvious shared Badge primitive.',
          ],
          decisionPrompts: [
            'Separate status, category, count, and removable-chip jobs; define icon, dot, and long-label behavior.',
          ],
          nextAction:
            'Cluster badges, pills, and chips by meaning before choosing one anatomy.',
        }
      ),
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
              'Overlapping asset identity uses two StackTokenLogo implementations; separating borders are currently added by individual consumers such as Discover.',
              'The canonical candidate now passes long-name truncation, deterministic logo fallback, account-mark composition, and a dense 32px Index holdings slice.',
            ],
            decisionPrompts: [
              'Choose the first opt-in production adoption slice after visual review; legacy stack and badge consumers remain unchanged.',
            ],
            nextAction:
              'Review the corrected chain-badge ratio and dense holdings slice, then choose one opt-in production adoption seam.',
          }
        ),
        outputStatus: 'proposal',
        implementationStatus: 'canonical-candidate',
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
          'A reusable V1 candidate implements identity text, domain marks, chain-badge geometry, overlapping stacks, fallbacks, and truncation. Existing product consumers remain unchanged.',
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
              'The canonical candidate now covers accepted inline and centered-headline anatomy while preserving equal sizing for horizontal peers.',
            ],
            decisionPrompts: [
              'Review outcome-summary emphasis and icon treatment before adding that role to the canonical API.',
              'Confirm stale-data language only when a real product source distinguishes stale from missing or loading.',
            ],
            nextAction:
              'Pressure-test the canonical inline anatomy inside dense Index data and review outcome-summary emphasis separately.',
          }
        ),
        outputStatus: 'proposal',
        implementationStatus: 'canonical-candidate',
        adoptionStatus: 'none',
        review: {
          status: 'ready',
          scope:
            'Review inline and centered-headline metric anatomy. Outcome emphasis, help affordances, and the shown legacy loading skeleton are not canonical Metric variants.',
          dependencies: [],
        },
        statusDetail:
          'Reusable V1 Metric and MetricValue candidates implement inline and centered-headline anatomy. Outcome emphasis, help affordances, and loading presentation remain open; production adoption has not started.',
      },
      component(
        'card',
        'Card / content region',
        'Groups a coherent repeated or actionable unit when framing is meaningful.',
        'Clear criteria prevent every page section from becoming nested rounded cards.',
        {
          priority: 'v1-core',
          ...mapped,
          evidence: [
            '50 product imports use shared Card, while many page regions compose surfaces directly.',
          ],
          decisionPrompts: [
            'Define when Card is appropriate, flat versus interactive behavior, padding ownership, media, selected state, and nesting ban.',
            'Keep substrate-reveal corner logic in page composition rather than Card defaults.',
          ],
          nextAction:
            'Audit repeated interactive cards separately from page sections and supporting panels.',
        }
      ),
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
              'Overview holdings establishes a divider-free dense row with 32px two-line identity and equally sized, right-aligned numeric peers.',
              'Governance proposals and Auctions rebalances prove that rich navigable records need a distinct composition.',
            ],
            decisionPrompts: [
              'Review rich navigable-record hierarchy separately; it is not a dense Table row variant.',
              'Resolve responsive transformation when a real route integration experiment begins, not in the desktop-only lab.',
            ],
            relationships: [
              {
                id: 'data-table',
                note: 'Data table adds interaction to the same display anatomy.',
              },
            ],
            nextAction:
              'Use the canonical Entity identity and Metric value seams in one opt-in route experiment before consolidating the three table systems.',
          }
        ),
        outputStatus: 'proposal',
        implementationStatus: 'specimen',
        adoptionStatus: 'none',
        review: {
          status: 'provisional',
          scope:
            'Review only the source-grounded data density and how canonical Entity identity and Metric value compose. Table, row, header, and responsive contracts are still hand-built specimens.',
          dependencies: [
            { name: 'Entity identity', status: 'canonical' },
            { name: 'Metric value', status: 'canonical' },
            { name: 'Table / row anatomy', status: 'provisional' },
          ],
        },
      },
      component(
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
      component(
        'copy-value',
        'Copyable value',
        'Displays a value with safe truncation and an explicit copy action.',
        'Addresses and transaction identifiers recur throughout the product and need reliable feedback.',
        {
          priority: 'product-extension',
          ...mapped,
          evidence: ['CopyValue has ten product imports and Copy has nine.'],
          decisionPrompts: [
            'Define truncation, visible label, copy affordance, success feedback, failure, and sensitive-value policy.',
          ],
          relationships: [
            {
              id: 'tooltip',
              note: 'Tooltip may reveal the full value but must not be the only accessible text.',
            },
          ],
          nextAction:
            'Converge Copy and CopyValue presentation without changing clipboard behavior.',
        }
      ),
    ],
  },
  {
    id: 'disclosure',
    name: 'Disclosure',
    description:
      'Reveals secondary detail without changing the user’s location.',
    foundationDependencies: ['Typography', 'Spacing', 'Iconography', 'Motion'],
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
      component(
        'accordion',
        'Accordion',
        'Reveals one or more stacked content sections.',
        'Repeated expandable regions need consistent headers and keyboard behavior.',
        {
          priority: 'v1-core',
          ...mapped,
          evidence: ['13 product imports use shared Accordion.'],
          decisionPrompts: [
            'Define single/multiple expansion, trigger hierarchy, icon position, content inset, separators, and long labels.',
          ],
          nextAction:
            'Audit FAQ/help and product-detail accordions for one anatomy.',
        }
      ),
      component(
        'collapsible',
        'Collapsible',
        'Toggles a single contextual block of content.',
        'A light disclosure primitive is useful when accordion grouping semantics do not apply.',
        {
          priority: 'v1-conditional',
          ...mapped,
          evidence: ['Nine product imports use shared Collapsible.'],
          decisionPrompts: [
            'Confirm distinct need from Accordion and Details patterns; define trigger ownership and animation.',
          ],
          relationships: [
            {
              id: 'accordion',
              note: 'Use Accordion for a coordinated set; Collapsible for one independent region.',
            },
          ],
          nextAction:
            'Inspect all nine consumers and merge the slot with Accordion if no distinct contract remains.',
        }
      ),
    ],
  },
]
