import { openDefinitionSlots, type ComponentGroup } from './catalog-types'
import { pendingComponent as component } from './component-catalog-item'

const mapped = {
  status: 'evidence-found' as const,
  auditStatus: 'mapped' as const,
}

export const PRIMARY_COMPONENT_GROUPS: ComponentGroup[] = [
  {
    id: 'actions',
    name: 'Actions',
    description: 'Controls that initiate, confirm, or cancel an operation.',
    foundationDependencies: [
      'Color',
      'Typography',
      'Control geometry',
      'Iconography',
      'Motion',
    ],
    defaultStates: [
      'Default',
      'Hover',
      'Focus-visible',
      'Pressed',
      'Disabled',
      'Loading',
    ],
    expectedDecisions: [
      {
        name: 'Hierarchy and intent',
        status: 'defined',
        detail:
          'Primary is blue; secondary is outlined white; quiet is visually bare until interaction; destructive is red and reserved for destructive consequences.',
      },
      {
        name: 'Sizes and content',
        status: 'defined',
        detail:
          'Micro, compact, and default actions use 28px, 32px, and 44px heights with 14px medium labels and size-matched icons.',
      },
      ...openDefinitionSlots('Interaction states'),
      {
        name: 'Loading communication',
        status: 'defined',
        detail:
          'Ordinary work uses a progress verb; user-required wallet states use direct instructions; submitted transactions use lifecycle status. Width, size, role, placement, spinner, and disabled interaction stay stable.',
      },
      {
        name: 'Destructive behavior',
        status: 'defined',
        detail:
          'Destructive confirmation pairs an outlined Cancel action with a red, consequence-specific action rather than a generic Confirm label.',
      },
    ],
    items: [
      {
        ...component(
          'button',
          'Button',
          'Initiates an immediate action or advances a task.',
          'Buttons establish action hierarchy and need predictable states across transactional flows.',
          {
            priority: 'v1-core',
            ...mapped,
            evidence: [
              '229 product-source imports of the shared Button make it the highest-reach primitive.',
              'The current component exposes many overlapping variants and seven sizes.',
              'V1 hierarchy now defines primary, outlined-white secondary, quiet, and destructive roles.',
              'The reviewed 28/32/44px geometry is accepted for micro, compact, and default actions.',
            ],
            decisionPrompts: [
              'Define pressed treatment across the accepted hierarchy roles.',
              'Define long-label behavior.',
            ],
            nextAction: 'Define the remaining pressed and long-label contract.',
          }
        ),
        outputStatus: 'proposal',
        statusDetail:
          'Hierarchy, intent, control sizes, loading communication, and destructive confirmation are accepted; pressed and long-label behavior remain open.',
      },
      component(
        'icon-button',
        'Icon button',
        'A compact action represented primarily by an icon.',
        'Icon-only actions need consistent sizing, labeling, tooltip, and target-area behavior.',
        {
          priority: 'v1-core',
          auditStatus: 'partial',
          evidence: [
            'Icon-only actions appear throughout headers, tables, dialogs, and the Zapper modal.',
            'The Zapper study validates a 32px visible button with glyph alignment to a 24px content axis.',
          ],
          decisionPrompts: [
            'Confirm when an icon is recognizable enough to omit visible text.',
            'Define visible geometry separately from the minimum hit target.',
            'Define tooltip, aria-label, and selected/toggle behavior.',
          ],
          relationships: [
            {
              id: 'button',
              note: 'Shares size, tone, and state rules with Button.',
            },
            {
              id: 'tooltip',
              note: 'May provide non-essential naming support.',
            },
          ],
          nextAction:
            'Extract representative header, table, and modal examples into the Actions state sheet.',
        }
      ),
      component(
        'button-group',
        'Action group',
        'A visually related set of peer or primary/secondary actions.',
        'Action groups need simple hierarchy, spacing, order, and responsive-wrap rules.',
        {
          priority: 'v1-core',
          auditStatus: 'partial',
          evidence: [
            'A shared ButtonGroup exists but has only one direct product import.',
            'Paired actions are frequently composed ad hoc in dialogs and proposal flows.',
          ],
          decisionPrompts: [
            'Define primary/secondary ordering and when destructive actions separate.',
            'Choose wrapping, stacking, and full-width behavior at constrained widths.',
          ],
          relationships: [
            {
              id: 'segmented-control',
              note: 'Groups actions; does not represent a selected mode.',
            },
          ],
          nextAction:
            'Audit dialog and proposal action rows rather than preserving the existing wrapper API.',
        }
      ),
      component(
        'transaction-action',
        'Transaction action',
        'Owns wallet, approval, pending, success, and failure states around an on-chain action.',
        'Register repeatedly needs one trusted lifecycle contract beyond a visual Button.',
        {
          priority: 'product-extension',
          ...mapped,
          evidence: [
            '40 product-source imports use the shared TransactionButton.',
            'Transaction and seamless-transaction primitives already encode product behavior.',
            'V1 distinguishes direct wallet instructions before submission from transaction lifecycle status after submission.',
            'In dialogs, the anchored action remains stable while complex workflow bodies may update; recoverable errors preserve inputs and expose a contextual retry.',
          ],
          decisionPrompts: [
            'Separate visual Button roles from wallet and transaction lifecycle behavior.',
            'Map approval, signing, submitted, confirmed, failed, retry, and wrong-network source states onto the accepted communication and recovery rules.',
            'Keep money and chain behavior in existing trusted seams while restyling presentation.',
          ],
          stateAdditions: [
            'Connect wallet',
            'Wrong network',
            'Approval required',
            'Signing',
            'Pending',
            'Succeeded',
            'Failed and retryable',
          ],
          relationships: [
            {
              id: 'button',
              note: 'Consumes Button presentation without becoming a visual variant.',
            },
            {
              id: 'toast',
              note: 'May announce non-blocking lifecycle results.',
            },
          ],
          nextAction:
            'Map the existing transaction lifecycle before changing any shared behavior or defaults.',
        }
      ),
    ],
  },
  {
    id: 'fields',
    name: 'Fields',
    description: 'Controls for entering, searching, and choosing values.',
    foundationDependencies: [
      'Typography',
      'Control geometry',
      'Spacing',
      'Shape',
      'Color',
    ],
    defaultStates: [
      'Empty',
      'Filled',
      'Hover',
      'Focus-visible',
      'Disabled',
      'Read-only',
      'Invalid',
      'Valid',
    ],
    expectedDecisions: openDefinitionSlots(
      'Shared field anatomy',
      'Sizes and density',
      'Validation and help',
      'Affixes and formatting'
    ),
    items: [
      component(
        'input',
        'Text input',
        'Collects a short text or formatted value.',
        'The default field establishes label, help, validation, and affix anatomy.',
        {
          priority: 'v1-core',
          ...mapped,
          evidence: [
            '38 product-source imports use the shared Input; 13 additional raw inputs remain outside shared UI.',
          ],
          decisionPrompts: [
            'Confirm full-radius one-line geometry and the shared label/help/error stack.',
            'Define prefix, suffix, clear action, read-only, and long-value behavior.',
          ],
          nextAction:
            'Cluster ordinary text, number, address, and percentage fields to find one stable anatomy.',
        }
      ),
      component(
        'textarea',
        'Textarea',
        'Collects longer multi-line text.',
        'Long-form input needs coherent field anatomy without inheriting the pill shape.',
        {
          priority: 'v1-core',
          ...mapped,
          evidence: [
            'Four product-source imports use the shared Textarea, especially governance and deploy flows.',
          ],
          decisionPrompts: [
            'Inherit field states while choosing restrained object radius, resize behavior, and character guidance.',
          ],
          nextAction:
            'Pair with Text input in one state sheet and pressure-test proposal descriptions.',
        }
      ),
      component(
        'select',
        'Select',
        'Chooses one value from a bounded list.',
        'A predictable select covers common short lists without turning every choice into a custom picker.',
        {
          priority: 'v1-core',
          ...mapped,
          evidence: [
            'Eight product-source imports use the shared custom Select; two raw selects remain.',
          ],
          decisionPrompts: [
            'Define trigger geometry, value/placeholder, menu sizing, grouping, keyboard, and disabled items.',
            'State when native select is preferable.',
          ],
          relationships: [
            {
              id: 'combobox',
              note: 'Use Combobox when filtering is a meaningful part of selection.',
            },
          ],
          nextAction:
            'Compare simple product selects before token pickers and multiselects.',
        }
      ),
      component(
        'combobox',
        'Combobox',
        'Searches and chooses from a potentially large list.',
        'Large token, chain, and entity lists require filtering, empty states, and keyboard access.',
        {
          priority: 'v1-core',
          auditStatus: 'partial',
          evidence: [
            'Command, popover, multiselect, and bespoke selector primitives indicate multiple overlapping implementations.',
          ],
          decisionPrompts: [
            'Define input/list anatomy, async loading, no results, creation policy, single vs multiple selection, and mobile adaptation.',
          ],
          relationships: [
            {
              id: 'select',
              note: 'Not needed when the bounded list is short and immediately scannable.',
            },
          ],
          nextAction:
            'Inventory Command/Popover and multiselect compositions as one behavioral cluster.',
        }
      ),
      component(
        'search',
        'Search field',
        'Filters or retrieves content from a query.',
        'Search needs recognizable clearing, loading, keyboard, and no-result behavior.',
        {
          priority: 'v1-core',
          auditStatus: 'partial',
          evidence: [
            'Search appears in global navigation and list/table filtering, often as ad hoc Input composition.',
          ],
          decisionPrompts: [
            'Define submit-as-you-type behavior, clear action, shortcut hint, loading, and compact toolbar use.',
          ],
          relationships: [
            {
              id: 'input',
              note: 'Shares field anatomy but owns search-specific affordances and behavior.',
            },
          ],
          nextAction:
            'Compare global search with table/list filters before defining variants.',
        }
      ),
      component(
        'amount-field',
        'Amount field',
        'Enters or displays a financial amount with asset, balance, and helper actions.',
        'Swap, mint, redeem, and deploy flows need a reusable financial object rather than a stretched text input.',
        {
          priority: 'product-extension',
          auditStatus: 'partial',
          evidence: [
            'The imported Zapper and local issuance flows use specialized amount surfaces.',
            'The Zapper study already tests input/output distinction, Max spacing, quote details, and swap direction.',
          ],
          decisionPrompts: [
            'Define input versus output anatomy, asset selector, fiat equivalent, balance/Max, precision, errors, and loading.',
            'Keep composite 8px geometry separate from one-line atomic fields.',
          ],
          stateAdditions: [
            'Insufficient balance',
            'Quote loading',
            'Price impact',
            'Read-only output',
            'Unavailable asset',
          ],
          relationships: [
            {
              id: 'asset-picker',
              note: 'Contains or triggers an asset picker.',
            },
          ],
          nextAction:
            'Audit local mint/redeem amount objects after foundations are confirmed; do not recreate upstream Zapper behavior.',
        }
      ),
      component(
        'asset-picker',
        'Asset picker',
        'Chooses a token, DTF, chain, or other financial entity.',
        'Register needs consistent identity, balances, search, and network context across high-value flows.',
        {
          priority: 'product-extension',
          auditStatus: 'partial',
          evidence: [
            'TokenSelectorDrawer and multiple deploy/governance selectors already exist.',
            'TokenLogo has 78 product consumer files, providing strong shared identity evidence.',
          ],
          decisionPrompts: [
            'Define trigger, search, row identity, balance, chain, disabled/unlisted, empty, and recent-item behavior.',
            'Choose popover versus drawer adaptation by available space, not by a separate component vocabulary.',
          ],
          relationships: [
            {
              id: 'combobox',
              note: 'Reuses combobox behavior with domain-specific row content.',
            },
            {
              id: 'entity-identity',
              note: 'Rows consume the shared identity primitive.',
            },
          ],
          nextAction:
            'Cluster token-selector drawer, deploy selectors, and Zapper selector states.',
        }
      ),
    ],
  },
  {
    id: 'selection',
    name: 'Selection',
    description: 'Controls for choosing options, modes, and boolean states.',
    foundationDependencies: ['Color', 'Control geometry', 'Shape', 'Motion'],
    defaultStates: [
      'Default',
      'Hover',
      'Focus-visible',
      'Selected',
      'Disabled',
    ],
    expectedDecisions: openDefinitionSlots(
      'Selection semantics',
      'Labels and help',
      'Keyboard behavior',
      'Indeterminate and disabled states'
    ),
    items: [
      component(
        'checkbox',
        'Checkbox',
        'Selects zero or more independent options.',
        'Checkboxes need clear checked, unchecked, and indeterminate behavior.',
        {
          priority: 'v1-core',
          ...mapped,
          evidence: ['22 product-source imports use the shared Checkbox.'],
          decisionPrompts: [
            'Define control/label/help composition and checked, indeterminate, invalid, disabled behavior.',
          ],
          nextAction:
            'Audit checkbox use in governance forms and data selection together.',
        }
      ),
      component(
        'radio-group',
        'Radio group',
        'Selects exactly one option from a visible set.',
        'Visible alternatives need a semantic single-selection control even if card-style options are used.',
        {
          priority: 'v1-core',
          auditStatus: 'pending',
          decisionPrompts: [
            'Define simple radio rows versus rich selectable cards, keyboard movement, help, and error placement.',
          ],
          relationships: [
            {
              id: 'segmented-control',
              note: 'Radio is for form choice; segmented control immediately changes a mode or view.',
            },
          ],
          nextAction:
            'Find single-choice form patterns currently implemented as cards, buttons, or custom toggles.',
        }
      ),
      component(
        'switch',
        'Switch',
        'Changes an immediately applied boolean setting.',
        'Switches must be distinguished from choices submitted later.',
        {
          priority: 'v1-core',
          ...mapped,
          evidence: ['Ten product-source imports use the shared Switch.'],
          decisionPrompts: [
            'Confirm immediate-commit semantics, label placement, pending/error feedback, and disabled state.',
          ],
          nextAction:
            'Inspect settings and feature-toggle uses for async edge states.',
        }
      ),
      component(
        'segmented-control',
        'Segmented control',
        'Switches between a small set of peer modes.',
        'Segmented controls are often confused with tabs and need a separate semantic role.',
        {
          priority: 'v1-core',
          ...mapped,
          evidence: [
            'ToggleGroup has 16 product imports and current overview controls supply a strong visual reference.',
          ],
          decisionPrompts: [
            'Define two-to-five option limits, micro/default density, selection, icons, and overflow.',
            'Use only for mode changes whose content does not require tab semantics.',
          ],
          relationships: [
            {
              id: 'tabs',
              note: 'Tabs own content panels and keyboard tab semantics.',
            },
          ],
          nextAction:
            'Audit ToggleGroup and pill-tab lookalikes together, then classify by behavior.',
        }
      ),
      component(
        'slider',
        'Slider',
        'Selects a value or range from a continuous scale.',
        'Sliders need numeric feedback, keyboard control, and precise constraints.',
        {
          priority: 'v1-conditional',
          ...mapped,
          evidence: ['Three product-source imports use the shared Slider.'],
          decisionPrompts: [
            'Confirm whether V1 needs single and range variants, marks, input pairing, and financial precision.',
          ],
          nextAction:
            'Inspect the three consumers; mark not-needed if a numeric field is more usable.',
        }
      ),
    ],
  },
  {
    id: 'navigation',
    name: 'Navigation',
    description:
      'Controls that move through routes, content regions, and task steps.',
    foundationDependencies: ['Typography', 'Color', 'Spacing', 'Iconography'],
    defaultStates: ['Default', 'Hover', 'Focus-visible', 'Current', 'Disabled'],
    expectedDecisions: openDefinitionSlots(
      'Navigation semantics',
      'Current state',
      'Overflow and responsiveness',
      'Keyboard and history behavior'
    ),
    items: [
      component(
        'product-navigation',
        'Product navigation',
        'Moves between the persistent sections of a product object or workspace.',
        'The Index DTF rail is present across the most important routes and materially shapes product identity beyond a generic Link.',
        {
          priority: 'product-extension',
          ...mapped,
          evidence: [
            'One persistent Index DTF route model supplies Overview, Swap, Governance, Auctions, Details + Roles, nested routes, disabled routes, and the DTF identity header.',
            'The same route truth is recomposed into the constrained-screen menu; this is a presentation change, not a second navigation vocabulary.',
            'Current production uses a 40px framed icon slot, hover-expanded labels, blue active treatment, nested active dots, and a distinct disabled treatment.',
          ],
          decisionPrompts: [
            'Define current, hover, focus, disabled, and nested treatment for the persistent Index DTF navigation.',
            'Decide whether labels disclose on hover or occupy persistent width, and define the DTF identity relationship.',
            'Preserve one route/state model across desktop rail and constrained-screen compositions.',
          ],
          relationships: [
            {
              id: 'link',
              note: 'Each destination retains link semantics; Product navigation owns the recurring item and route-state composition.',
            },
          ],
          nextAction:
            'Review the prepared current-state alternatives with real Overview, Governance, Auctions, nested, and deprecated-route evidence.',
        }
      ),
      component(
        'link',
        'Link',
        'Navigates to a route, resource, or content location.',
        'Links need a recognizable contract distinct from actions.',
        {
          priority: 'v1-core',
          ...mapped,
          evidence: [
            'A shared Link exists, while route and inline links are also composed directly.',
          ],
          decisionPrompts: [
            'Define inline, standalone, external, current, visited-if-needed, and disabled/non-link alternatives.',
          ],
          relationships: [
            {
              id: 'button',
              note: 'Use Button for an operation and Link for navigation, regardless of visual treatment.',
            },
          ],
          nextAction:
            'Audit inline content links and button-shaped route links separately.',
        }
      ),
      component(
        'tabs',
        'Tabs',
        'Switches between related content panels in one context.',
        'Tabs need to be separated from route navigation and segmented view controls.',
        {
          priority: 'v1-core',
          ...mapped,
          evidence: [
            '20 product-source imports use shared Tabs, with additional tab-like implementations likely.',
          ],
          decisionPrompts: [
            'Define content-panel semantics, text-only versus contained presentation, overflow, counts, and deep-link policy.',
          ],
          relationships: [
            {
              id: 'segmented-control',
              note: 'Segmented control changes a mode; tabs organize content panels.',
            },
            {
              id: 'link',
              note: 'Route navigation may look tab-like but must retain link behavior.',
            },
          ],
          nextAction:
            'Use the planned tabs family audit to classify behavior before collapsing visual variants.',
        }
      ),
      component(
        'pagination',
        'Pagination',
        'Moves through ordered pages of a data set.',
        'Dense product tables need consistent counts, pages, and constrained-width behavior.',
        {
          priority: 'v1-core',
          ...mapped,
          evidence: [
            'DataTable pagination is shared and covered by focused unit tests.',
          ],
          decisionPrompts: [
            'Define page-size, item count, previous/next, direct pages, loading, and reset after filtering.',
          ],
          relationships: [
            {
              id: 'data-table',
              note: 'Usually composed by Data table but remains independently usable.',
            },
          ],
          nextAction:
            'Audit current pagination together with large portfolio and transaction result sets.',
        }
      ),
      component(
        'stepper',
        'Stepper',
        'Shows progress through a multi-step task.',
        'Deploy and proposal flows need explicit progress, completion, and revisiting rules.',
        {
          priority: 'v1-core',
          auditStatus: 'partial',
          evidence: [
            'Deploy and proposal creation provide several high-value multi-step flows.',
          ],
          decisionPrompts: [
            'Define current/completed/error states, optional steps, revisiting, labels, and constrained layouts.',
          ],
          nextAction:
            'Compare deploy and governance task navigation; extract shared behavior only.',
        }
      ),
      component(
        'breadcrumb',
        'Breadcrumb',
        'Shows hierarchy and paths back to parent levels.',
        'Some deep administrative areas may need location context without duplicating primary navigation.',
        {
          priority: 'v1-conditional',
          auditStatus: 'pending',
          decisionPrompts: [
            'Validate a real hierarchy need before defining collapse and current-page behavior.',
          ],
          nextAction:
            'Mark not-needed unless route audit finds repeated deep hierarchy with poor orientation.',
        }
      ),
    ],
  },
]
