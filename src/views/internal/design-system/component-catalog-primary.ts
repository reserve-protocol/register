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
        outputStatus: 'rendered',
        designAuthority: 'current-baseline',
        implementationStatus: 'canonical-candidate',
        implementationSource: 'src/components/button/index.tsx',
        adoptionStatus: 'none',
        review: {
          status: 'ready',
          scope:
            'Review the accepted hierarchy, 28/32/44px geometry, icon spacing, focus, disabled, and loading presentation. Pressed and long-label behavior remain outside this review.',
          dependencies: [
            {
              name: 'Semantic state recipes',
              status: 'canonical',
            },
          ],
        },
        statusDetail:
          'A reusable V1 candidate implements the accepted hierarchy, sizes, focus, disabled, loading, and icon-spacing rules. Pressed and long-label behavior remain open; production adoption has not started.',
      },
      {
        ...component(
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
              'Use the compact candidate in the canonical Dialog shell, then revisit target-area and toggle behavior only when a real composition requires it.',
          }
        ),
        outputStatus: 'rendered',
        designAuthority: 'current-baseline',
        implementationStatus: 'canonical-candidate',
        implementationSource: 'src/components/icon-button/index.tsx',
        adoptionStatus: 'none',
        review: {
          status: 'ready',
          scope:
            'Review the compact 32px dialog/header action only. Tooltip policy, toggle/selected behavior, and invisible hit-target expansion remain intentionally open.',
          dependencies: [
            { name: 'Button', status: 'canonical' },
            { name: 'Lucide glyphs', status: 'retained' },
          ],
        },
        statusDetail:
          'A reusable V1 candidate implements the compact 32px named-action role needed by dialog headers and disclosures. Tooltip, toggle/selected, and expanded hit-target behavior remain open; production adoption has not started.',
      },
      {
        ...component(
          'button-group',
          'Action group',
          'A visually related set of peer or primary/secondary actions.',
          'Action groups apply accepted Button hierarchy and width relationships without adding another action family.',
          {
            priority: 'v1-core',
            ...mapped,
            evidence: [
              'A shared ButtonGroup exists but has only one direct product import.',
              'Paired actions are frequently composed ad hoc in dialogs and proposal flows.',
              'The accepted Button width rule prefers intrinsic horizontal groups and equal-width default actions in intentional vertical stacks.',
              'Async Mint completion supplies evidence for a real compact two-action relationship; destructive dialogs supply the safe Cancel / consequence relationship. Their exact action choice and icon use remain composition-owned.',
            ],
            decisionPrompts: [
              'Verify that product compositions switch intentionally between the horizontal and vertical recipes instead of allowing ragged wrapping.',
              'Keep persistent or floating action wrappers in their owning compositions rather than expanding this recipe.',
            ],
            relationships: [
              {
                id: 'button',
                note: 'Consumes Button hierarchy, size, and state without redefining them.',
              },
              {
                id: 'segmented-control',
                note: 'Groups actions; does not represent a selected mode.',
              },
            ],
            nextAction:
              'Review the recipe in real horizontal and constrained-width action rows before any production adoption.',
          }
        ),
        outputStatus: 'rendered',
        designAuthority: 'current-baseline',
        implementationStatus: 'reusable-recipe',
        implementationSource:
          'src/components/design-system-v1/action-group.tsx',
        adoptionStatus: 'none',
        review: {
          status: 'ready',
          scope:
            'Review intrinsic horizontal grouping, intentional full-width vertical grouping, and the accepted 8px peer gap. Button hierarchy and transaction lifecycle remain owned elsewhere.',
          dependencies: [{ name: 'Button', status: 'canonical' }],
        },
        statusDetail:
          'The accepted reusable composition recipe encodes intrinsic horizontal groups, intentional equal-width vertical groups, and the 8px peer gap. It adds no new Button tone, size, lifecycle, or production adoption.',
      },
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
      {
        ...component(
          'input',
          'Text input',
          'Collects a short text or formatted value.',
          'The default field establishes label, help, validation, and affix anatomy.',
          {
            priority: 'v1-core',
            ...mapped,
            evidence: [
              '38 product-source imports use the shared Input; 13 additional raw inputs remain outside shared UI.',
              'Index deploy BasicInput and governance metadata establish text, number, address, percentage, suffix, help, validation, and multiline requirements.',
            ],
            decisionPrompts: [
              'Pressure-test clear actions and unusually long values only when real compositions require them.',
              'Keep preset-or-custom mutual exclusion in its reusable composition rather than changing Field or SingleChoice semantics.',
            ],
            nextAction:
              'Use the accepted repeated-group and preset-or-custom composition in a bounded opt-in adoption only when migration begins.',
          }
        ),
        outputStatus: 'rendered',
        designAuthority: 'current-baseline',
        implementationStatus: 'canonical-candidate',
        implementationSource: 'src/components/design-system-v1/field.tsx',
        adoptionStatus: 'none',
        review: {
          status: 'ready',
          scope:
            'Review the independent label/control/help/error stack, default one-row geometry, affixes, validation, disabled, and read-only states. Repeated governance grouping, SingleChoice, business validation, multiline input, and production adoption remain outside this review.',
          dependencies: [
            { name: 'Spacing and typography', status: 'canonical' },
            { name: 'Control geometry and shape', status: 'canonical' },
            { name: 'Semantic state recipes', status: 'canonical' },
          ],
        },
        statusDetail:
          'The accepted reusable V1 baseline implements the independent Field / TextInput anatomy and evidenced states. The reviewed repeated-group composition and PresetOrCustomField recipe consume it without moving business validation into the design system; multiline input and production adoption remain separate.',
      },
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
      {
        ...component(
          'select',
          'Select',
          'Chooses one value from a bounded list.',
          'A predictable select covers common short lists without turning every choice into a custom picker.',
          {
            priority: 'v1-core',
            ...mapped,
            evidence: [
              'Eight product-source imports use the shared custom Select; two raw selects remain.',
              'The internal DTF date and chain filters provide the strongest simple bounded-list fixtures.',
              'Data table pagination proves a real 32px compact trigger requirement alongside the accepted 44px ordinary Field geometry.',
            ],
            decisionPrompts: ['State when native select is preferable.'],
            relationships: [
              {
                id: 'combobox',
                note: 'Use Combobox when filtering is a meaningful part of selection.',
              },
            ],
            nextAction:
              'Consume this baseline in bounded-value compositions; review native-select policy, Combobox, and Menu separately when their real requirements are active.',
          }
        ),
        outputStatus: 'rendered',
        designAuthority: 'current-baseline',
        implementationStatus: 'canonical-candidate',
        implementationSource: 'src/components/design-system-v1/select.tsx',
        adoptionStatus: 'none',
        review: {
          status: 'ready',
          scope:
            'The accepted baseline covers popup anatomy, subtle focus treatment, persistent right-side selected check, leading chain-identity support, and the relationship between 44px default and evidenced fixed-width 32px compact triggers. The rendered options currently participate in the shared provisional balanced-inset candidate: 8px popup-list padding and 12px item padding on both axes, plus a 14px/16px single-line option role, produce 40px ordinary rows and 44px rows when a 20px visual owns the content height. Text-only compact triggers use the shared 14px-leading/10px-trailing optical padding recipe. Search, rich entity options, action menus, native-select policy, mobile dropdown substitution, and production adoption remain outside this scope.',
          dependencies: [
            { name: 'Field and TextInput geometry', status: 'canonical' },
            { name: 'Typography and spacing', status: 'canonical' },
            { name: 'Radius and semantic color roles', status: 'canonical' },
            { name: 'Entity identity stack geometry', status: 'canonical' },
            { name: 'Radix Select behavior', status: 'retained' },
            { name: 'Popup item row density', status: 'provisional' },
          ],
        },
        statusDetail:
          'The accepted reusable V1 baseline applies Field geometry to bounded lists, retains Radix selection semantics, and defines default and compact triggers, popup and option anatomy, shared interaction treatment, selected-check placement, and optional leading identity. Width and visible-label treatment remain composition-owned; no production consumer has adopted it.',
      },
      {
        ...component(
          'combobox',
          'Combobox',
          'Searches and chooses from a potentially large list.',
          'Large token, chain, and entity lists require filtering, empty states, and keyboard access.',
          {
            priority: 'v1-core',
            auditStatus: 'mapped',
            evidence: [
              'Source inspection found no recurring single-value searchable form control that justifies a generic Combobox candidate today.',
              'Global DTF search is navigation Command; Earn DTF and governance tag filters are multi-select; token selection is a drawer-based asset picker.',
            ],
            decisionPrompts: [
              'Reopen only when a real searchable single-value form job cannot use Select, Search, Command navigation, multi-select, or Asset picker semantics.',
            ],
            relationships: [
              {
                id: 'select',
                note: 'Not needed when the bounded list is short and immediately scannable.',
              },
            ],
            nextAction:
              'Do not manufacture a Combobox from adjacent jobs; keep the classification available for future evidenced use.',
          }
        ),
        status: 'not-needed',
        statusDetail:
          'No recurring generic Combobox job is evidenced in the current product. Reopen only when a real single-value searchable form seam appears.',
        review: {
          status: 'blocked',
          scope:
            'No Combobox review is active. Navigation Command, Search, multi-select, and Asset picker remain distinct product jobs.',
          dependencies: [],
        },
      },
      {
        ...component(
          'multi-select-filter',
          'Multi-select filter',
          'Stages and applies more than one value from a bounded filter list.',
          'Earn DTF and governance filtering need multi-value choice without being misclassified as Select, Menu, or Combobox.',
          {
            priority: 'v1-core',
            auditStatus: 'mapped',
            evidence: [
              'The shared multi-select dropdown is used by Index and Yield Earn DTF filters; governance and explorer filters retain a second duplicate implementation.',
              'Real fixtures include identity-rich DTF and network options, text-only proposal statuses, an optional minimum selection, and staged Apply behavior.',
              'The current implementations use Switch for set membership and locally override popup, trigger, and footer geometry.',
            ],
            decisionPrompts: [
              'Judge the checkbox-row density, staged-selection clarity, trigger summary, and footer action relationship.',
            ],
            relationships: [
              {
                id: 'select',
                note: 'Select immediately commits one bounded value; this pattern stages multiple filter values.',
              },
              {
                id: 'popover',
                note: 'Consumes the shared floating shell while owning filter-specific rows and actions.',
              },
              {
                id: 'combobox',
                note: 'Search remains a later composition concern when a long multi-value list requires it.',
              },
            ],
            nextAction:
              'Consume the accepted baseline where multi-value filtering is needed; keep search, mobile drawer substitution, token-result density, and production adoption separate.',
          }
        ),
        outputStatus: 'rendered',
        designAuthority: 'current-baseline',
        implementationStatus: 'canonical-candidate',
        implementationSource:
          'src/components/design-system-v1/multi-select-filter.tsx',
        adoptionStatus: 'none',
        review: {
          status: 'ready',
          scope:
            'The accepted baseline covers the 44px summary trigger with 16px/300 selection-value typography, 12px summary-to-chevron spacing, and 20px-leading/18px-trailing optical padding. Its identity-first 44px rows use the shared 8px popup and 12px item balanced insets, 14px/16px labels, and matching 20px leading identity and visible Checkbox marks while preserving the Checkbox’s 28px target. The no-divider footer uses canonical compact secondary Clear and primary Apply actions grouped right with an 8px gap, 20px horizontal and bottom insets, and 8px top padding. Staged Apply and minimum-selection behavior are included. Search, large-list loading and empty states, mobile drawer substitution, token-result density, and production adoption remain separate.',
          dependencies: [
            { name: 'Button and ActionGroup', status: 'canonical' },
            { name: 'Checkbox', status: 'canonical' },
            { name: 'Entity identity stack geometry', status: 'canonical' },
            { name: 'Shared Popover shell', status: 'canonical' },
            { name: 'Floating elevation', status: 'provisional' },
            { name: 'Popup item row density', status: 'provisional' },
          ],
        },
        statusDetail:
          'The accepted reusable V1 baseline replaces Switch-based set membership with canonical trailing Checkbox rows, preserves the clean leading identity axis and real staged Apply job, and uses selection-value rather than action typography in its trigger. Search, responsive substitution, and production consumers remain unchanged.',
      },
      {
        ...component(
          'search',
          'Search field',
          'Filters or retrieves content from a query.',
          'Search needs recognizable clearing, loading, keyboard, and no-result behavior.',
          {
            priority: 'v1-core',
            auditStatus: 'mapped',
            evidence: [
              'The shared legacy SearchInput has ten product consumers across Discover, Top 100, Earn filters, token drawers, and deploy flows, but locally varies between 64px and 68px treatments.',
              'The current Discover filter row provides the strongest composition evidence: standalone search paired with a chain filter rather than a labeled form field.',
              'Global DTF search proves grouped navigation-result requirements, while token drawers prove async loading and empty-result requirements owned by their surrounding compositions.',
            ],
            decisionPrompts: [
              'Judge whether the inherited 44px Field geometry, 16px search mark, clear action, and quiet loading state form a complete reusable search-field baseline.',
            ],
            relationships: [
              {
                id: 'input',
                note: 'Consumes TextInput geometry while owning search-specific semantics and affordances.',
              },
              {
                id: 'combobox',
                note: 'Search does not imply committing one selected value.',
              },
            ],
            nextAction:
              'Review the reusable SearchField in standalone and real Discover-style filter compositions; keep result-list semantics outside the field.',
          }
        ),
        outputStatus: 'rendered',
        designAuthority: 'current-baseline',
        implementationStatus: 'canonical-candidate',
        implementationSource:
          'src/components/design-system-v1/search-field.tsx',
        adoptionStatus: 'none',
        review: {
          status: 'ready',
          scope:
            'The accepted baseline covers the inherited 44px TextInput geometry, leading search mark, optional clear action with focus return, retained query while loading, and alignment beside a default Select. Result rows, no-results recovery, grouping, command navigation, asset selection, compact sizing, responsive substitution, and production adoption remain outside this field baseline.',
          dependencies: [
            { name: 'Field and TextInput', status: 'canonical' },
            { name: 'IconButton clear action', status: 'canonical' },
            { name: 'Select filter peer', status: 'canonical' },
          ],
        },
        statusDetail:
          'The accepted reusable V1 baseline composes TextInput and IconButton for standalone search, clear, and loading behavior. One 44px size is sufficient for evidenced use; result semantics and production consumers remain unchanged.',
      },
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
      {
        ...component(
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
              'Use the transparent 28px slot with its 20px mark in the eligibility composition; define indeterminate, invalid, and richer label/help anatomy only when evidenced.',
          }
        ),
        outputStatus: 'rendered',
        designAuthority: 'current-baseline',
        implementationStatus: 'canonical-candidate',
        implementationSource: 'src/components/checkbox/index.tsx',
        adoptionStatus: 'none',
        review: {
          status: 'ready',
          scope:
            'Review the transparent 28px alignment slot, 20px square mark, and its unchecked, checked, focus-visible, and disabled states. Indeterminate, invalid, and row composition remain intentionally open.',
          dependencies: [
            {
              name: 'Semantic state recipes',
              status: 'canonical',
            },
            { name: 'Radix Checkbox behavior', status: 'retained' },
          ],
        },
        statusDetail:
          'A reusable V1 candidate implements a transparent 28px alignment slot around the 20px square binary mark and its essential focus and disabled states. Indeterminate, invalid, and rich row composition remain open; production adoption has not started.',
      },
      {
        ...component(
          'radio-group',
          'Radio group',
          'Selects exactly one option from a visible set.',
          'Visible alternatives need a semantic single-selection control even if card-style options are used.',
          {
            priority: 'v1-core',
            ...mapped,
            evidence: [
              'Index deploy and governance parameter forms use compact ToggleGroup presets to select one submitted value from a visible set.',
              'The accepted geometry requires horizontally paired default controls to share a 44px height; the form-value labels use the 14px medium control role.',
              'The accepted color grammar assigns neutral control chrome to the resting track and reserves structural beige for substrate between regions.',
            ],
            decisionPrompts: [
              'Later define standard radio rows, rich selectable cards, error placement, and long-option behavior from real evidence.',
            ],
            relationships: [
              {
                id: 'segmented-control',
                note: 'Radio is for a form value; segmented control immediately changes a mode or view.',
              },
            ],
            nextAction:
              'Use the accepted default-size form-value control when the contained-form composition resumes. Defer standard radio rows and rich choice cards until evidenced.',
          }
        ),
        outputStatus: 'rendered',
        designAuthority: 'current-baseline',
        implementationStatus: 'canonical-candidate',
        implementationSource:
          'src/components/design-system-v1/single-choice-group.tsx',
        adoptionStatus: 'none',
        review: {
          status: 'ready',
          scope:
            'Review the complete one-row presentation for a submitted single-choice form value. It uses native radio semantics and faithfully inherits the contained-selection language: 44px default peer height, 14px medium labels, 20px item padding, matching two-pixel track inset and inter-item gap, intrinsic track and item sizing by default, equal item growth when explicitly full width, full radius, neutral control chrome, and a subtly elevated white selected item. Standard rows, rich choice cards, and production adoption remain open.',
          dependencies: [
            { name: 'Control geometry', status: 'canonical' },
            { name: 'Shape and color roles', status: 'canonical' },
            { name: 'Native radio behavior', status: 'retained' },
          ],
        },
        statusDetail:
          'The accepted reusable V1 baseline implements only the one-row pill-style single-choice job evidenced by governance parameter forms. Other radio compositions and production adoption remain open.',
      },
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
      {
        ...component(
          'tabs',
          'Tabs',
          'Switches between related content panels in one context.',
          'Tabs need to be separated from route navigation and segmented view controls.',
          {
            priority: 'v1-core',
            ...mapped,
            evidence: [
              '20 product-source imports use shared Tabs, with additional tab-like implementations likely.',
              'The contained-selection visual treatment is an accepted cross-component baseline and is now available as a reusable recipe.',
              'The recent Index overview timespan treatment remains the strongest text-only evidence.',
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
              'Classify real Tabs semantics and variants before building the component; consume the existing contained-selection recipe whenever that accepted presentation applies.',
          }
        ),
        outputStatus: 'rendered',
        designAuthority: 'current-baseline',
        implementationStatus: 'reusable-recipe',
        implementationSource:
          'src/components/design-system-v1/tab-presentation.ts',
        review: {
          status: 'provisional',
          scope:
            'The compact/default text-only and contained presentations are accepted visual baselines. The complete Tabs contract remains provisional until panel semantics, variant roles, overflow, counts, deep linking, and the reusable API are resolved.',
          dependencies: [
            { name: 'Control geometry', status: 'canonical' },
            { name: 'Typography and color roles', status: 'canonical' },
            { name: 'Radix Tabs behavior', status: 'retained' },
          ],
        },
        statusDetail:
          'The accepted compact/default text-only and contained visual treatments are restored as a current reusable recipe. The broader Tabs family remains incomplete: presentation roles, panel semantics, overflow, counts, deep linking, and the final API are unresolved.',
      },
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
