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
      'color',
      'typography',
      'spacing',
      'radius',
      'iconography',
      'motion',
      'accessibility',
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
      {
        name: 'Interaction states',
        status: 'defined',
        detail:
          'Filled actions use opaque semantic hover and pressed colors with a centered 0.98 momentary press scale. Neutral actions retain their accepted quiet interaction surfaces; focus stays independent and reduced motion removes scale.',
      },
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
              'Validate the accepted action hierarchy in production compositions before adoption.',
            ],
            nextAction:
              'Consume the accepted baseline in bounded production compositions without reopening its visual contract.',
          }
        ),
        outputStatus: 'rendered',
        designAuthority: 'current-baseline',
        implementationStatus: 'canonical-candidate',
        implementationSource: 'src/components/button/index.tsx',
        contextSources: [
          {
            role: 'authority',
            label: 'Typed Button contract',
            path: 'src/views/internal/design-system/component-catalog-primary.ts',
          },
          {
            role: 'accepted-decision',
            label: 'Button width belongs to its composition',
            path: 'docs/wiki/decisions.md#2026-08-14--button-width-belongs-to-the-action-group-composition',
          },
          {
            role: 'implementation',
            label: 'Reusable V1 Button candidate',
            path: 'src/components/button/index.tsx',
          },
        ],
        adoptionStatus: 'none',
        review: {
          status: 'ready',
          scope:
            'The accepted baseline covers hierarchy, 28/32/44px geometry, icon spacing, focus, disabled, loading presentation, concise single-line label policy, opaque semantic interaction colors, and centered momentary pressed feedback. Persistent toggle selection and production adoption remain separate.',
          dependencies: [
            {
              name: 'Semantic state recipes',
              status: 'canonical',
            },
          ],
        },
        statusDetail:
          'A reusable V1 candidate implements the accepted hierarchy, sizes, focus, disabled, loading, icon-spacing, label-fit, and pressed-interaction rules. The co-located InlineAction is a provisional transaction-pressure candidate for compact text actions such as Max; it does not expand the accepted Button tones or sizes. Production adoption remains open.',
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
      {
        ...component(
          'transaction-action',
          'Transaction system',
          'Assembles truthful transaction amounts, selection, requirements, details, actions, execution, recovery, durable state, identity, and outcomes without owning product mechanics.',
          'Register needs one composition-first transaction family built from shared candidates, recipes, retained behavior, and flow-owned truth.',
          {
            priority: 'product-extension',
            ...mapped,
            evidence: [
              'The transaction-system audit maps atomic, RFQ, transparent staged, and delayed-settlement models across primary and supporting flows.',
              'Direct implementation evidence: manual issuance preserves an editable share goal, a stateful approval-to-mint action slot, and persistent per-asset requirements.',
              'Direct implementation evidence: automated mint progresses from a narrow configure step to a wider order workspace and dedicated result, while delayed unstake crosses from its input page through a confirmation modal into a page-owned durable queue.',
              'Direct implementation evidence: Vote Lock keeps Lock, Unlock, and Delegate in one shell; Lock may require approval before deposit; Unlock redeems quote-backed shares into a delayed Portfolio withdrawal.',
              'Direct implementation evidence: explicit Delegation edits normal and optional fast governance delegates; changing both produces two independent sequential transactions with a real partial-success boundary.',
              'The Delegation outcome candidate preserves one overall result while associating each changed delegate with its own explorer link; approval transactions remain supporting infrastructure and do not appear in the completed result.',
              'Named strong visual composition evidence, not canonical authority: src/views/internal/design-system/zapper-modal-study.tsx preserves the best evidenced input/output relationship, financial hierarchy, density, and focused action treatment from the earlier lab.',
              'Real package-host evidence, not local styling authority: src/views/index-dtf/components/zapper/zapper-wrapper.tsx establishes the installed Zapper context and upstream ownership boundary.',
              '40 product-source imports use the shared TransactionButton, while consequential outcomes remain inconsistent across local flows.',
              'V1 distinguishes direct wallet instructions before submission from transaction lifecycle status after submission.',
              'In dialogs, the anchored action remains stable while complex workflow bodies may update; recoverable errors preserve inputs and expose a contextual retry.',
              'A named provisional transaction-task geometry recipe now owns the shared 432px substantial width, compact header axis, submitted-content boundary, facts-region divider ownership, and action-footer relationship consumed by Zapper and Vote Lock.',
              'Transaction amount input/output regions use the accepted 8px geometry across editable, read-only, submitted, and loading replacements; ordinary Field inputs retain their own full-radius control geometry.',
            ],
            decisionPrompts: [
              'On explicit resumption, judge the five transaction families without implying identical orchestration or information volume; contextual launchers and the standalone selector remain outside this checkpoint.',
              'Confirm the narrow lifecycle vocabulary, stable action hierarchy, identity treatment, recovery prominence, and consequential outcome anatomy.',
              'Keep money, chain, order, queue, and package behavior in existing trusted seams while reviewing presentation.',
              'Preserve or improve every successful quality from the named strongest predecessor; if one is removed, record the stronger evidence or product constraint that replaces it.',
            ],
            stateAdditions: [
              'Wallet action required',
              'Submitted and confirming',
              'Open order and expiry',
              'Partial completion and scoped retry',
              'Confirmed with follow-up remaining',
              'Claimable later',
              'Complete',
            ],
            relationships: [
              {
                id: 'button',
                note: 'Consumes Button presentation without becoming a visual variant.',
              },
              {
                id: 'alert',
                note: 'Uses the accepted Inline Message anatomy for persistent contextual recovery; exact copy and recovery remain flow-owned.',
              },
              {
                id: 'copy-value',
                note: 'Uses Copyable Value inside transaction and order identity compositions.',
              },
              {
                id: 'toast',
                note: 'Routine transient acknowledgement remains Toast; consequential results stay in context.',
              },
            ],
            nextAction:
              'Paused at the verified transaction checkpoint. Resume only the human-selected scope; preserve recorded local decisions without promoting the whole specimen or migrating production.',
          }
        ),
        outputStatus: 'rendered',
        designAuthority: 'exploratory',
        implementationStatus: 'specimen',
        implementationSource:
          'src/views/internal/design-system/transaction-truth-spectrum.tsx',
        contextSources: [
          {
            role: 'implementation',
            label: 'Provisional transaction review composition',
            path: 'src/views/internal/design-system/transaction-truth-spectrum.tsx',
          },
          {
            role: 'visual-evidence',
            label: 'Transaction checkpoint scope and regression evidence',
            path: 'docs/plans/transaction-consolidated-regression.md',
            detail:
              'Verified lab checkpoint, not blanket design acceptance or production adoption; names retained local decisions and unreviewed surrounding surfaces.',
          },
          {
            role: 'implementation',
            label: 'Provisional transaction-task geometry recipe',
            path: 'src/components/design-system-v1/transaction-task-geometry.ts',
            detail:
              'Shared relationship geometry only; it does not own flow mechanics, copy, lifecycle, or production adoption.',
          },
          {
            role: 'visual-evidence',
            label: 'Strong earlier Zapper composition',
            path: 'src/views/internal/design-system/zapper-modal-study.tsx',
            detail:
              'Composition quality evidence only; it is not canonical authority.',
          },
          {
            role: 'product-evidence',
            label: 'Installed Index Zapper host boundary',
            path: 'src/views/index-dtf/components/zapper/zapper-wrapper.tsx',
          },
          {
            role: 'product-evidence',
            label: 'Current Vote Lock shell',
            path: 'src/components/vote-lock/drawer.tsx',
          },
          {
            role: 'product-evidence',
            label: 'Current Vote Lock quote composition',
            path: 'src/components/vote-lock/components/vote-lock.tsx',
          },
          {
            role: 'product-evidence',
            label: 'Current explicit Delegation composition',
            path: 'src/components/vote-lock/components/delegate.tsx',
          },
          {
            role: 'product-evidence',
            label: 'Current sequential Delegation action',
            path: 'src/components/vote-lock/components/submit-delegate-button.tsx',
          },
          {
            role: 'product-evidence',
            label: 'Current governance entry',
            path: 'src/views/index-dtf/governance/components/governance-vote-lock.tsx',
          },
          {
            role: 'product-evidence',
            label: 'Current delayed Vote Lock withdrawal',
            path: 'src/views/portfolio-page/components/pending-withdrawals.tsx',
          },
          {
            role: 'product-evidence',
            label: 'Cross-flow transaction requirements audit',
            path: 'docs/plans/transaction-system-audit.md',
          },
          {
            role: 'legacy-evidence',
            label: 'Yield DTF Zapper coverage',
            path: 'src/views/yield-dtf/issuance/components/zapV2/RTokenZapIssuance.tsx',
            detail:
              'Coverage and migration evidence; not current Index DTF visual authority.',
          },
        ],
        adoptionStatus: 'none',
        review: {
          status: 'ready',
          scope:
            'Review the input/output and selection candidates, requirement and detail hierarchy, action stability, lifecycle language, identity, recovery, durable state, and consequential outcomes inside compositions that preserve each current flow’s real structural boundaries. Compare them against the direct-source disposition contract and named Zapper predecessor transfer contract without treating either local study or package internals as authority. This is a lab-only pressure test: orchestration, exact result sourcing, complete production screens, package internals, and adoption remain outside.',
          dependencies: [
            { name: 'Button and Action Group', status: 'canonical' },
            { name: 'Field and Entity Identity', status: 'canonical' },
            { name: 'Lifecycle Status', status: 'canonical' },
            { name: 'Copyable Value and Link', status: 'canonical' },
            {
              name: 'Inline Message presentation',
              status: 'canonical',
              detail:
                'The accepted unadopted full and compact-summary presentations supply feedback anatomy; product copy, recovery, and lifecycle remain composition-owned.',
            },
            {
              name: 'Transaction-system audit',
              status: 'retained',
              detail:
                'Source-grounded requirements and ownership boundaries remain evidence, not component authority.',
            },
            {
              name: 'Transaction-task geometry recipe',
              status: 'provisional',
              detail:
                'Zapper and Vote Lock consume the same relationship owner while the pressure register tracks departures from current baselines and retained precedent.',
            },
          ],
        },
        statusDetail:
          'Five transaction families are rendered and regression-checked: Zapper, Vote Lock, Stake, Automated Mint/Redeem and Manual Mint/Redeem. This checkpoint preserves human-directed local refinements without promoting the transaction system as a shared component. Entry cards, the standalone selector and persistent Portfolio rows remain unreviewed or deferred. Receipt sources, approval/security behavior and production adoption remain engineering-owned. See the consolidated regression report for evidence and limits.',
      },
    ],
  },
  {
    id: 'fields',
    name: 'Fields',
    description: 'Controls for entering, searching, and choosing values.',
    foundationDependencies: [
      'typography',
      'spacing',
      'radius',
      'color',
      'accessibility',
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
        contextSources: [
          {
            role: 'authority',
            label: 'Typed Field and TextInput contract',
            path: 'src/views/internal/design-system/component-catalog-primary.ts',
          },
          {
            role: 'accepted-decision',
            label: 'Field and TextInput baseline',
            path: 'docs/wiki/decisions.md#2026-08-19--field-and-textinput-baseline-accepted',
          },
          {
            role: 'implementation',
            label: 'Reusable V1 Field candidate',
            path: 'src/components/design-system-v1/field.tsx',
          },
        ],
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
      {
        ...component(
          'textarea',
          'Textarea',
          'Collects longer multi-line text.',
          'Long-form input needs coherent field anatomy without inheriting the pill shape.',
          {
            priority: 'v1-core',
            ...mapped,
            evidence: [
              'Four product-source imports use the shared Textarea, especially governance and deploy flows.',
              'Governance rationale and deploy summary fixtures pressure-test help, validation, disabled, and read-only states.',
            ],
            decisionPrompts: [
              'Confirm restrained radius, vertical resize, and inherited Field states; add character guidance only when a real limit requires it.',
            ],
            nextAction:
              'Review the provisional multiline Field candidate before any opt-in adoption.',
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
            'The accepted candidate inherits Field anatomy and state semantics, including the accepted 20px ordinary horizontal field inset, while using a 16px multiline vertical inset, restrained radius, and vertical resize. Character count, rich text, and production adoption remain outside scope.',
          dependencies: [
            { name: 'Field / TextInput', status: 'canonical' },
            { name: 'Native textarea behavior', status: 'retained' },
          ],
        },
        statusDetail:
          'The accepted reusable V1 Textarea baseline covers governance and deploy long-form states without adding a new Field family. Production adoption has not started.',
      },
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
          status: 'deferred',
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
      {
        ...component(
          'amount-field',
          'Amount field',
          'Enters or displays a financial amount with asset, balance, and helper actions.',
          'Swap, mint, redeem, and deploy flows need a reusable financial object rather than a stretched text input.',
          {
            priority: 'product-extension',
            auditStatus: 'partial',
            evidence: [
              'The imported Zapper and local issuance flows use specialized amount surfaces.',
              'Named strong visual composition evidence, not canonical authority: src/views/internal/design-system/zapper-modal-study.tsx tests input/output distinction, amount and asset prominence, Max spacing, quote details, and swap direction.',
              'Human review accepted restrained 8px transaction amount input/output regions and required replacement states such as quote search to preserve the same boundary.',
            ],
            decisionPrompts: [
              'Define input versus output anatomy, asset selector, fiat equivalent, balance/Max, precision, errors, and loading.',
              'Keep restrained 8px transaction amount geometry separate from fully rounded atomic fields and square structural sections.',
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
              'Reuse the checkpointed transaction amount object within its recorded scope. Review any broader deploy or standalone amount-field contract only with a real consumer; do not recreate upstream Zapper behavior.',
          }
        ),
        outputStatus: 'in-composition',
        designAuthority: 'exploratory',
        implementationStatus: 'reusable-recipe',
        implementationSource:
          'src/components/design-system-v1/transaction-amount-object.tsx',
        compositionSource: {
          componentId: 'transaction-action',
          anchor: 'transaction-composition-rfq',
          label: 'Transaction amount input/output in the Zapper checkpoint',
        },
        review: {
          status: 'exploration',
          scope:
            'Reusable transaction amount anatomy is exercised across the checkpointed flows. Preserve their reviewed local choices; a generic Amount field baseline, additional consumers, and production adoption are not approved.',
          dependencies: [],
        },
        statusDetail:
          'Implementation and rendered transaction evidence exist. The inventory routes to that limited recipe rather than treating amount entry as unbuilt or promoting a general field contract.',
      },
      {
        ...component(
          'asset-picker',
          'Asset picker',
          'Chooses a token, DTF, chain, or other financial entity.',
          'Register needs consistent identity, balances, search, and network context across high-value flows.',
          {
            priority: 'product-extension',
            auditStatus: 'partial',
            evidence: [
              'TokenSelectorDrawer and multiple deploy/governance selectors already exist.',
              'src/components/design-system-v1/transaction-asset-picker.tsx supplies the interactive transaction-local picker. The separate task-shell selector pressure test remains unreviewed and static.',
            ],
            decisionPrompts: [
              'Define trigger, search, row identity, balance, chain, disabled/unlisted, empty, and recent-item behavior.',
              'Choose popover versus drawer adaptation by available space, not by a separate component vocabulary.',
            ],
            relationships: [
              {
                id: 'search',
                note: 'Reuse accepted search-field behavior where appropriate; result selection and navigation remain composition-owned, not a dependency on the unneeded generic Combobox.',
              },
              {
                id: 'entity-identity',
                note: 'Rows consume the shared identity primitive.',
              },
            ],
            nextAction:
              'Compare the existing transaction picker with local deploy/governance selection needs. Review the standalone selector separately; the transaction checkpoint does not approve it or authorize upstream widget changes.',
          }
        ),
        outputStatus: 'in-composition',
        designAuthority: 'exploratory',
        implementationStatus: 'reusable-recipe',
        implementationSource:
          'src/components/design-system-v1/transaction-asset-picker.tsx',
        compositionSource: {
          componentId: 'transaction-action',
          anchor: 'transaction-composition-rfq',
          label: 'Interactive asset selection within the Zapper checkpoint',
        },
        review: {
          status: 'exploration',
          scope:
            'The transaction-local picker is implemented; the standalone selector specimen and broader Asset picker contract are not accepted. Preserve the distinction between local evidence and package-owned production selection.',
          dependencies: [],
        },
        statusDetail:
          'Rendered transaction-local selection evidence is available. Cross-consumer audit and standalone design review remain open; no generic picker or production adoption is claimed.',
      },
    ],
  },
  {
    id: 'selection',
    name: 'Selection',
    description: 'Controls for choosing options, modes, and boolean states.',
    foundationDependencies: [
      'color',
      'spacing',
      'radius',
      'motion',
      'accessibility',
    ],
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
      {
        ...component(
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
              'Review immediate checked/focus/disabled geometry; keep async recovery separate.',
          }
        ),
        outputStatus: 'rendered',
        designAuthority: 'current-baseline',
        implementationStatus: 'canonical-candidate',
        implementationSource: 'src/components/design-system-v1/switch.tsx',
        adoptionStatus: 'none',
        review: {
          status: 'ready',
          scope:
            'The accepted 36×20 immediate Switch baseline covers checked, focus-visible, disabled-on, and disabled-off states. Disabled preserves position and uses the semantic disabled-structure role in inverse neutral contrast while removing active color and thumb elevation. Every enabled specimen is interactive. Rows own the 44px target; pending and recovery stay outside scope.',
          dependencies: [
            { name: 'Radix Switch behavior', status: 'retained' },
            { name: 'Semantic state recipes', status: 'canonical' },
          ],
        },
        statusDetail:
          'The accepted reusable V1 Switch baseline implements the recorded geometry and disabled-state recipe without changing production consumers or adding async lifecycle.',
      },
      {
        ...component(
          'segmented-control',
          'Segmented control',
          'Switches between a small set of peer modes.',
          'Segmented controls are often confused with tabs and need a separate semantic role.',
          {
            priority: 'v1-core',
            ...mapped,
            evidence: [
              'ToggleGroup has 16 product imports, while the recent Index overview supplies the accepted unframed time-range and data-type treatment.',
            ],
            decisionPrompts: [
              'Confirm the text-only versus contained presentation boundary and compact/default sizing.',
              'Add icons or new overflow behavior only when a real composition requires them.',
              'Use only for mode changes whose content does not require tab semantics.',
            ],
            relationships: [
              {
                id: 'tabs',
                note: 'Tabs own content panels and keyboard tab semantics.',
              },
            ],
            nextAction:
              'Review the controlled immediate-mode contract independently from Tabs.',
          }
        ),
        outputStatus: 'rendered',
        designAuthority: 'current-baseline',
        implementationStatus: 'canonical-candidate',
        implementationSource:
          'src/components/design-system-v1/segmented-control.tsx',
        adoptionStatus: 'none',
        review: {
          status: 'ready',
          scope:
            'The accepted controlled single-value baseline prevents deselection. Text-only compact/default preserves the accepted Index overview range and data-type language, including the full-width compact mobile chart range; contained compact/default reuses the accepted contained-selection geometry. Intrinsic/full remain layout settings selected by composition. Routes, panels, icons, and new overflow policy remain outside scope.',
          dependencies: [
            {
              name: 'Index overview text-only selection treatment',
              status: 'canonical',
            },
            { name: 'Contained-selection presentation', status: 'canonical' },
            { name: 'Radix ToggleGroup behavior', status: 'retained' },
          ],
        },
        statusDetail:
          'The accepted reusable V1 baseline owns text-only and contained immediate mode selection without depending on Tabs or submitted form values. Production adoption has not started.',
      },
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
    foundationDependencies: [
      'typography',
      'color',
      'spacing',
      'iconography',
      'layout',
      'accessibility',
    ],
    defaultStates: ['Default', 'Hover', 'Focus-visible', 'Current', 'Disabled'],
    expectedDecisions: openDefinitionSlots(
      'Navigation semantics',
      'Current state',
      'Overflow and responsiveness',
      'Keyboard and history behavior'
    ),
    items: [
      {
        ...component(
          'global-navigation',
          'Global navigation',
          'Moves between the application’s primary destinations and resources.',
          'The application header appears across routes and establishes hierarchy above object-scoped navigation.',
          {
            priority: 'product-extension',
            ...mapped,
            evidence: [
              'The production App Header uses one desktop route row plus a grouped More menu for Discover, Earn, Portfolio, creation, tools, and resources.',
              'The constrained-screen header recomposes the same destinations into Main, Create & tools, and Resources regions rather than shrinking the desktop row.',
              'Global and Index DTF navigation are visible in the same product context, so their hierarchy must be judged together without merging their component contracts.',
            ],
            decisionPrompts: [
              'Judge the quiet desktop hierarchy, current destination treatment, grouped overflow, and relationship to application actions.',
              'Judge the full-region constrained-screen composition and its continuity with the application header.',
              'Keep route information architecture and destination copy source-owned; this candidate reviews presentation and behavior only.',
            ],
            relationships: [
              {
                id: 'link',
                note: 'Each destination retains link semantics while Global navigation owns recurring application hierarchy and current state.',
              },
              {
                id: 'product-navigation',
                note: 'Product navigation is a separate object-scoped system that may be visible beneath the global header.',
              },
              {
                id: 'dropdown-menu',
                note: 'The grouped desktop overflow consumes accepted popup geometry without turning the complete header into a Menu.',
              },
            ],
            nextAction:
              'Consume the accepted baseline in later realistic screen validation; keep route taxonomy, account behavior, analytics, and production header adoption separate.',
          }
        ),
        status: 'defined',
        outputStatus: 'rendered',
        designAuthority: 'current-baseline',
        implementationStatus: 'canonical-candidate',
        implementationSource: 'src/components/design-system-v1/navigation.tsx',
        adoptionStatus: 'none',
        review: {
          status: 'ready',
          scope:
            'The accepted baseline covers desktop application hierarchy, current state, grouped More overflow, external-resource indication, application-action separation, and the grouped constrained-screen composition. Route taxonomy, destination copy, analytics, account behavior, and production adoption remain source-owned and outside.',
          dependencies: [
            { name: 'Link and Button semantics', status: 'canonical' },
            { name: 'Menu popup geometry', status: 'canonical' },
            {
              name: 'Typography, color, spacing, and motion',
              status: 'canonical',
            },
          ],
        },
        statusDetail:
          'The accepted, reusable, unadopted V1 baseline renders the source-grounded desktop and constrained-screen global navigation compositions. It was reviewed with—but remains structurally independent from—the Index DTF Product navigation baseline.',
      },
      {
        ...component(
          'product-navigation',
          'Product navigation',
          'Moves between the persistent sections of a product object or workspace.',
          'The Index DTF rail is present across the most important routes and materially shapes product identity beyond a generic Link.',
          {
            priority: 'product-extension',
            ...mapped,
            evidence: [
              'One persistent Index DTF route model supplies Overview, Swap, Governance, Auctions, Details + Roles, disabled routes, and the DTF identity header.',
              'The same route truth is recomposed into the constrained-screen menu; this is a presentation change, not a second navigation vocabulary.',
              'Current production uses a 40px framed icon slot, hover-expanded labels, blue active treatment, and a distinct disabled treatment. Dormant generic subitem support has no current route evidence and is excluded.',
              'The current Index DTF rail header presents the symbol and chain mark on one line rather than using the two-line asset-row identity anatomy.',
            ],
            decisionPrompts: [
              'Judge current, hover, focus, and disabled treatment for the persistent Index DTF navigation.',
              'Decide whether labels disclose on hover or occupy persistent width, and define the DTF identity relationship.',
              'Preserve one route/state model across desktop rail and constrained-screen compositions.',
              'Evaluate a source-grounded DTF-switcher submode entered from the identity row, including which DTF set it exposes, how the rail returns to page navigation, and its constrained-screen equivalent.',
              'Judge whether small public active/notable indicators communicate destination activity without counts or wallet-personalized state, and whether compact 30-day performance adds useful switcher context without overpowering DTF identity.',
            ],
            relationships: [
              {
                id: 'link',
                note: 'Each destination retains link semantics; Product navigation owns the recurring item and route-state composition.',
              },
              {
                id: 'global-navigation',
                note: 'Global navigation remains a separate application-level system even when both are visible in the same shell.',
              },
            ],
            nextAction:
              'Consume the accepted desktop and mobile baseline in later realistic screen validation. Keep production list sourcing, ranking, search threshold, route preservation, domain-event logic, analytics, and adoption separate.',
          }
        ),
        status: 'defined',
        outputStatus: 'rendered',
        designAuthority: 'current-baseline',
        implementationStatus: 'canonical-candidate',
        implementationSource: 'src/components/design-system-v1/navigation.tsx',
        adoptionStatus: 'none',
        review: {
          status: 'ready',
          scope:
            'The accepted baseline covers the non-wrapping desktop Global header at its explicit 1200px host boundary and bounded More overflow; the one-line desktop DTF identity trigger, its plain token logo inside an outlined 40px collapsed container, the badged expanded identity and far-edge chevron, expandable rail, switcher transition, bottom-reaching scroll viewport and fade, alternative-only DTF rows, public active/notable route indicators, right-aligned 30-day performance, outside-rail dismissal back to page routes, and return after selection. It also covers the mobile top-global trigger and detached 82 × 48px DTF identity pill with its unbadged 32px token logo and separate 32px ghost switch cue at the established 2px contained-control gap beside the 48px page-navigation/action cluster. Both DTF triggers use the canonical Radix-backed full-width bottom drawer, with a taller scrollable switcher and shorter content-led page drawer; Escape, outside dismissal, and close restore the initiating trigger. The page drawer keeps chain-identified copyable token-address actions outside the navigation landmark. The static snapshot-derived fixture set demonstrates density, overflow, and metadata composition only; production sourcing, ranking, search threshold, route-preservation policy, domain event logic, personalized state, analytics, and adoption remain outside.',
          dependencies: [
            { name: 'Link semantics', status: 'canonical' },
            { name: 'Entity identity and IconButton', status: 'canonical' },
            {
              name: 'Typography, color, spacing, and motion',
              status: 'canonical',
            },
          ],
        },
        statusDetail:
          'The accepted, reusable, unadopted V1 baseline preserves the evidenced Index DTF route model through a compact expandable rail and mobile floating entry points. Desktop identity opens the DTF submode; mobile gives switching to the detached DTF mark and page routes to the neighboring action cluster, with both opening the shared bottom-drawer presentation. Generic public-state and trailing-metadata seams exercise active/notable route indicators and compact 30-day DTF performance without authorizing live sourcing or personalized logic. List sourcing and production adoption remain unresolved.',
      },
      {
        ...component(
          'link',
          'Link',
          'Navigates to a route, resource, or content location.',
          'Links need a recognizable contract distinct from actions.',
          {
            priority: 'v1-core',
            ...mapped,
            evidence: [
              'The shared legacy Link defaults every destination to a new tab, while direct React Router and native anchors retain route-appropriate behavior.',
              'Inline legal and help links repeatedly use the brand foreground; standalone flow-switch links add a recognizable icon and hover underline.',
              'Existing Button asChild consumers prove that route navigation can compose Button presentation without nesting an operation inside an anchor.',
              'External explorer, documentation, and social-resource links repeatedly pair navigation with a trailing ArrowUpRight indicator.',
              'A new-window cue must reach assistive technology as caller-owned localized copy; the decorative external icon alone is insufficient.',
            ],
            decisionPrompts: [
              'Validate the accepted inline and standalone treatments in real product compositions before adoption.',
              'Keep recurring route state, breadcrumbs, and product-navigation hierarchy in their owning composition contracts.',
            ],
            relationships: [
              {
                id: 'button',
                note: 'Operations use Button. Button-shaped navigation composes canonical Button presentation with an anchor or router link.',
              },
              {
                id: 'product-navigation',
                note: 'Product navigation owns recurring route/current-state composition; each destination retains link semantics.',
              },
            ],
            nextAction:
              'Consume the accepted navigation contract in bounded compositions while keeping recurring product navigation and production adoption separate.',
          }
        ),
        outputStatus: 'rendered',
        designAuthority: 'current-baseline',
        implementationStatus: 'canonical-candidate',
        implementationSource: 'src/components/design-system-v1/link.tsx',
        adoptionStatus: 'none',
        review: {
          status: 'ready',
          scope:
            'The accepted baseline covers inline underlining with inherited typography, 14px medium standalone hierarchy, the quiet named-return treatment, secure external-resource behavior, outcome-specific trailing visuals, caller-owned accessible new-window announcement, long-label wrapping, visible focus, and canonical Button composition for button-shaped navigation. Current/visited styling, unavailable destinations, Product navigation, tab routes, breadcrumbs, analytics policy, and production adoption remain outside scope.',
          dependencies: [
            { name: 'Typography, color, and focus roles', status: 'canonical' },
            { name: 'Iconography and motion', status: 'canonical' },
            { name: 'Button presentation', status: 'canonical' },
            {
              name: 'Native and React Router link behavior',
              status: 'retained',
            },
          ],
        },
        statusDetail:
          'The accepted, unadopted V1 baseline covers evidenced inline, standalone, return, external-resource, router, and Button-shaped navigation boundaries. Product navigation, current and visited state, breadcrumbs, and production adoption remain separate.',
      },
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
              'Current product panel-switching evidence supports the contained treatment; chart ranges and other immediate modes belong to Segmented Control.',
            ],
            decisionPrompts: [
              'Add counts, route behavior, deep linking, or a new overflow policy only when real panel evidence requires them.',
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
              'Consume the accepted contained compact/default contract in a bounded panel composition when migration begins.',
          }
        ),
        outputStatus: 'rendered',
        designAuthority: 'current-baseline',
        implementationStatus: 'canonical-candidate',
        implementationSource: 'src/components/design-system-v1/tabs.tsx',
        review: {
          status: 'ready',
          scope:
            'The accepted Tabs contract uses contained compact/default presentation with retained Radix panel and keyboard behavior. Intrinsic/full width are layout settings rather than variants. Text-only navigation, routes, counts, deep linking, and new overflow policy are excluded until real evidence requires them.',
          dependencies: [
            { name: 'Control geometry', status: 'canonical' },
            { name: 'Typography and color roles', status: 'canonical' },
            { name: 'Radix Tabs behavior', status: 'retained' },
          ],
        },
        statusDetail:
          'The accepted reusable Radix-backed V1 baseline applies contained compact/default geometry to real panels. Text-only presentation was removed after its strongest assumed uses were correctly classified as Segmented Control; production adoption remains unchanged.',
      },
      {
        ...component(
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
              'Review the table-independent API without changing DataTable defaults.',
          }
        ),
        outputStatus: 'rendered',
        designAuthority: 'current-baseline',
        implementationStatus: 'canonical-candidate',
        implementationSource: 'src/components/design-system-v1/pagination.tsx',
        adoptionStatus: 'none',
        review: {
          status: 'ready',
          scope:
            'The candidate builds from the approved responsive DataTable treatment through 1-based callbacks, aligns all peers to the compact 32px control scale, and uses fixed edge actions plus a five-item mobile page window. Available navigation is quiet, the current page is a non-clickable neutral selection, and unavailable quiet actions are bare and muted. Pagination owns row geometry while its host owns outer inset; page-size selection is optional. A shared mobile 44px hit-target treatment is intentionally deferred to the accessibility pass rather than improvised locally. Loading, filtering reset, and DataTable adoption remain separate.',
          dependencies: [
            { name: 'DataTable pagination treatment', status: 'canonical' },
            { name: 'Button and Select', status: 'canonical' },
          ],
        },
        statusDetail:
          'The accepted reusable V1 Pagination baseline is independent of TanStack Table and leaves shared DataTable defaults untouched. Production adoption has not started.',
      },
      {
        ...component(
          'stepper',
          'Stepper',
          'Shows progress through a multi-step task.',
          'Deploy and proposal flows need explicit progress, completion, and revisiting rules.',
          {
            priority: 'v1-core',
            auditStatus: 'partial',
            evidence: [
              'Deploy and proposal creation provide several high-value multi-step flows.',
              'src/views/internal/design-system/transaction-progress-stepper.tsx provides flow-local lifecycle evidence; automated/manual issuance instead express substantial stages through their content sections.',
            ],
            decisionPrompts: [
              'Define current/completed/error states, optional steps, revisiting, labels, and constrained layouts.',
            ],
            nextAction:
              'Use transaction lifecycle progress as evidence, not a universal stepper. Compare deploy and governance task navigation only when those compositions are active; distinguish navigable form steps from transaction execution.',
          }
        ),
        outputStatus: 'in-composition',
        designAuthority: 'exploratory',
        implementationStatus: 'specimen',
        implementationSource:
          'src/views/internal/design-system/transaction-progress-stepper.tsx',
        compositionSource: {
          componentId: 'transaction-action',
          anchor: 'transaction-composition-vote-lock',
          label: 'Flow-local progress within the Vote Lock checkpoint',
        },
        review: {
          status: 'exploration',
          scope:
            'Transaction-local progress is available as evidence. Generic workflow navigation, revisiting rules, and shared stepper anatomy remain open; no promotion or production adoption is implied.',
          dependencies: [],
        },
        statusDetail:
          'The transaction checkpoint contains an implemented local stepper. A broader task-navigation contract remains to be evaluated in deploy/proposal compositions.',
      },
      {
        ...component(
          'breadcrumb',
          'Breadcrumb',
          'Shows hierarchy and paths back to parent levels.',
          'Nested detail pages may benefit from parent context that existing navigation and a labeled return link cannot provide.',
          {
            priority: 'v1-conditional',
            auditStatus: 'partial',
            evidence: [
              'Proposal and rebalance detail headers already link to their parent section; absence of a shared Breadcrumb does not establish whether a trail would improve orientation.',
              'src/views/index-dtf/auctions/views/rebalance/components/manage-weights/manage-weights-header.tsx shows a breadcrumb-like proposal-title / Manage Basket Weights relationship, but remains a local task header rather than an accepted Breadcrumb pattern.',
            ],
            decisionPrompts: [
              'Use a trail only when meaningful parent destinations remain unclear or difficult to reach, including from direct links; prefer the accepted named-return Link when one parent destination is sufficient.',
              'Do not derive breadcrumbs from URL depth, duplicate surrounding product navigation, or use them as workflow progress or permission to leave an in-progress task.',
            ],
            nextAction:
              'Low priority: no standalone V1 work is scheduled. Reconsider within a scoped nested-page migration only when a concrete orientation problem remains. The migration owner should assess the need through normal team review without requiring the original designer personally. If uncertain, preserve existing navigation and record the question; do not block unrelated migration or invent a breadcrumb pattern.',
          }
        ),
        review: {
          status: 'deferred',
          scope:
            'Deliberately low priority. No standalone Breadcrumb work is scheduled, and it is not a prerequisite for V1 or unrelated migration.',
          dependencies: [],
        },
      },
    ],
  },
]
