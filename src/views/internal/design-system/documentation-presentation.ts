import type { MessageDescriptor } from '@lingui/core'
import { msg } from '@lingui/core/macro'
import type { ComponentItem } from './catalog-types'
import {
  COMPONENT_GROUPS,
  COMPONENT_ITEMS,
  getComponentItem,
} from './component-catalog'
import {
  getComponentGroupMessage,
  getComponentNameMessage,
  getFoundationNameMessage,
} from './documentation-catalog-messages'
import { TRANSACTION_DOCUMENTATION_SECTIONS } from './documentation-transactions/navigation'
import { FOUNDATION_ITEMS } from './foundation-catalog'

export type HumanDesignStatus =
  | 'accepted'
  | 'exploring'
  | 'not-started'
  | 'not-planned'
  | 'superseded'

export type HumanCodeStatus =
  | 'no-module'
  | 'lab-specimen'
  | 'reusable-recipe'
  | 'reusable-module'

export type HumanProductionStatus =
  | 'not-in-production'
  | 'opt-in'
  | 'in-production'

export interface ComponentPresentation {
  design: HumanDesignStatus
  code: HumanCodeStatus
  production: HumanProductionStatus
}

export interface PatternPresentation {
  id: 'charts' | 'tables' | 'forms' | 'navigation' | 'transactions'
  label: MessageDescriptor
  sourceKey: string
  design: HumanDesignStatus
  designLabel: MessageDescriptor
  activityLabel?: MessageDescriptor
  description: DocumentationText
  scope: MessageDescriptor
  hostLabel?: MessageDescriptor
  provenance?: MessageDescriptor
  workbenchRoute: string
  reviewRoute: string
  recordsRoute: string
  legacyRoute: string
}

export type DocumentationText = string | MessageDescriptor
export type DocumentationTranslator = (message: MessageDescriptor) => string

export interface DocumentationNavigationItem {
  id: string
  label: DocumentationText
  route: string
  sourceKey?: string
  legacy?: boolean
  items?: readonly DocumentationNavigationItem[]
}

export interface DocumentationNavigationGroup extends DocumentationNavigationItem {
  items?: readonly DocumentationNavigationItem[]
}

export type DocumentationDestination =
  | 'canonical'
  | 'workbench'
  | 'records'
  | 'legacy'

export interface DocumentationSearchRecord {
  sourceKey: string
  label: DocumentationText
  route: string
  description: DocumentationText
  destination: DocumentationDestination
  aliases: readonly DocumentationText[]
  searchTerms?: readonly DocumentationText[]
}

export interface WorkbenchActivityRecord {
  sourceKey: string
  route: string
  question: MessageDescriptor
  owner: MessageDescriptor
  activity: 'paused' | 'deferred'
}

export const DESIGN_STATUS_MESSAGES: Record<
  HumanDesignStatus,
  MessageDescriptor
> = {
  accepted: msg`Accepted`,
  exploring: msg`Exploring`,
  'not-started': msg`Not started`,
  'not-planned': msg`Not planned`,
  superseded: msg`Superseded`,
}

export const CODE_STATUS_MESSAGES: Record<HumanCodeStatus, MessageDescriptor> =
  {
    'no-module': msg`No module`,
    'lab-specimen': msg`Lab specimen`,
    'reusable-recipe': msg`Reusable recipe`,
    'reusable-module': msg`Reusable module`,
  }

export const PRODUCTION_STATUS_MESSAGES: Record<
  HumanProductionStatus,
  MessageDescriptor
> = {
  'not-in-production': msg`Not in production`,
  'opt-in': msg`Opt-in`,
  'in-production': msg`In production`,
}

export const WORKBENCH_ACTIVITY_MESSAGES: Record<
  WorkbenchActivityRecord['activity'],
  MessageDescriptor
> = {
  paused: msg`Paused`,
  deferred: msg`Deferred`,
}

export const DOCUMENTATION_DESTINATION_MESSAGES: Record<
  DocumentationDestination,
  MessageDescriptor
> = {
  canonical: msg`Canonical`,
  workbench: msg`Workbench`,
  records: msg`Records`,
  legacy: msg`Legacy lab`,
}

const DESIGN_STATUS: Record<
  ComponentItem['designAuthority'],
  HumanDesignStatus
> = {
  'current-baseline': 'accepted',
  exploratory: 'exploring',
  undefined: 'not-started',
  superseded: 'superseded',
}

const CODE_STATUS: Record<
  ComponentItem['implementationStatus'],
  HumanCodeStatus
> = {
  none: 'no-module',
  specimen: 'lab-specimen',
  'reusable-recipe': 'reusable-recipe',
  'canonical-candidate': 'reusable-module',
}

const PRODUCTION_STATUS: Record<
  ComponentItem['adoptionStatus'],
  HumanProductionStatus
> = {
  none: 'not-in-production',
  'opt-in': 'opt-in',
  'in-use': 'in-production',
}

export const getComponentPresentation = (
  item: ComponentItem
): ComponentPresentation => ({
  design:
    item.status === 'not-needed'
      ? 'not-planned'
      : DESIGN_STATUS[item.designAuthority],
  code: CODE_STATUS[item.implementationStatus],
  production: PRODUCTION_STATUS[item.adoptionStatus],
})

export const CHART_PATTERN = {
  id: 'charts',
  label: msg`Charts`,
  sourceKey: 'component:chart',
  route: '/internal/design-system/patterns#charts',
} as const satisfies DocumentationNavigationItem

export const getChartPatternPresentation = () => {
  const item = getComponentItem('chart').item
  if (!item) throw new Error('Missing component:chart catalog source')

  return {
    ...CHART_PATTERN,
    item,
    presentation: getComponentPresentation(item),
  }
}

export const LEGACY_PATTERN_ALIASES = [
  {
    id: 'tables',
    label: msg`Tables and records`,
    route: '/internal/design-system/patterns/tables',
    sourceKey: 'component:table',
    legacy: true,
  },
  {
    id: 'forms',
    label: msg`Forms`,
    route: '/internal/design-system/patterns/forms',
    sourceKey: 'component:input',
    legacy: true,
  },
  {
    id: 'navigation',
    label: msg`Navigation systems`,
    route: '/internal/design-system/patterns/navigation',
    sourceKey: 'component:product-navigation',
    legacy: true,
  },
  {
    id: 'transactions',
    label: msg`Transactions`,
    route: '/internal/design-system/patterns/transactions',
    sourceKey: 'component:transaction-action',
    legacy: true,
  },
] as const satisfies readonly DocumentationNavigationItem[]

export const getPatternSourceItem = (sourceKey: string) => {
  const item = getComponentItem(sourceKey.replace('component:', '')).item
  if (!item) throw new Error(`Missing ${sourceKey} catalog source`)
  return item
}

const hasAcceptedComponentAuthority = (id: string) => {
  const item = getComponentItem(id).item
  return item ? getComponentPresentation(item).design === 'accepted' : false
}

export const hasAcceptedPatternAuthority = (id: PatternPresentation['id']) => {
  const pattern = PATTERN_PRESENTATIONS.find((candidate) => candidate.id === id)
  if (!pattern) return false
  if (
    !hasAcceptedComponentAuthority(pattern.sourceKey.replace('component:', ''))
  )
    return false
  return (
    id !== 'navigation' || hasAcceptedComponentAuthority('global-navigation')
  )
}

const patternPresentation = ({
  activityLabel,
  description,
  hostLabel,
  id,
  label,
  legacyRoute,
  provenance,
  reviewRoute,
  scope,
  sourceKey,
  workbenchRoute,
}: Omit<
  PatternPresentation,
  'design' | 'designLabel' | 'recordsRoute'
>): PatternPresentation => {
  const presentation = getComponentPresentation(getPatternSourceItem(sourceKey))

  return {
    id,
    label,
    sourceKey,
    design: presentation.design,
    designLabel: DESIGN_STATUS_MESSAGES[presentation.design],
    activityLabel,
    description,
    scope,
    hostLabel,
    provenance,
    workbenchRoute,
    reviewRoute,
    recordsRoute: `/internal/design-system/records#pattern-${id}`,
    legacyRoute,
  }
}

export const PATTERN_PRESENTATIONS = [
  patternPresentation({
    id: 'charts',
    label: msg`Charts`,
    sourceKey: 'component:chart',
    description: msg`Visualizes change, comparison, or composition in data.`,
    scope: msg`The approved-for-now lab baseline covers source-based Overview line and candles, Home and Discover, Yield historical metrics, and Portfolio total and composition. It does not change financial inputs, data sources, shared defaults, or production adoption.`,
    workbenchRoute: '/internal/design-system/workbench#pattern-charts',
    reviewRoute:
      '/internal/design-system/components/chart#chart-next-families-review',
    legacyRoute: '/internal/design-system/patterns/charts',
  }),
  patternPresentation({
    id: 'tables',
    label: msg`Tables and records`,
    sourceKey: 'component:table',
    description: msg`Presents structured records for comparison and navigation.`,
    scope: msg`The approved-for-now lab presentations cover Portfolio and withdrawals, Holdings, Discover, Earn, DeFi and owned positions, governance records, and near-term current and historical auction tables. They do not define a universal Table or Row API or production adoption; the redesigned auction workspace remains deferred.`,
    workbenchRoute: '/internal/design-system/workbench#pattern-tables',
    reviewRoute:
      '/internal/design-system/components/table?current=ready#auctions-current-table-review',
    legacyRoute: '/internal/design-system/patterns/tables',
  }),
  patternPresentation({
    id: 'forms',
    label: msg`Forms`,
    sourceKey: 'component:input',
    description: msg`Combines fields into a clear repeated decision or data-entry task.`,
    scope: msg`The accepted preset-or-custom relationship is shown without promoting it to a universal form layout. Validation and business rules remain flow-owned.`,
    hostLabel: msg`Neutral host · responsive preset-or-custom field`,
    provenance: msg`Accepted governance-field relationship · documentation host · reusable V1 recipe`,
    workbenchRoute: '/internal/design-system/workbench#pattern-forms',
    reviewRoute:
      '/internal/design-system/components/input#complex-field-group-review',
    legacyRoute: '/internal/design-system/patterns/forms',
  }),
  patternPresentation({
    id: 'navigation',
    label: msg`Navigation systems`,
    sourceKey: 'component:product-navigation',
    description: msg`Moves through application destinations and persistent product sections.`,
    scope: msg`Global and Product navigation are both accepted, separate contracts. Showing their real items together does not combine them into one shell or route model.`,
    workbenchRoute: '/internal/design-system/workbench#pattern-navigation',
    reviewRoute:
      '/internal/design-system/components/product-navigation#navigation-review',
    legacyRoute: '/internal/design-system/patterns/navigation',
  }),
  patternPresentation({
    id: 'transactions',
    label: msg`Transactions`,
    sourceKey: 'component:transaction-action',
    description: msg`Coordinates truthful transaction requirements, execution, recovery, and outcomes.`,
    scope: msg`The verified checkpoint remains exploratory and paused. No complete transaction composition is canonical, and production mechanics remain outside this documentation candidate.`,
    activityLabel: WORKBENCH_ACTIVITY_MESSAGES.paused,
    workbenchRoute: '/internal/design-system/workbench#transaction-workbench',
    reviewRoute:
      '/internal/design-system/components/transaction-action#transaction-truth-spectrum',
    legacyRoute: '/internal/design-system/patterns/transactions',
  }),
] as const satisfies readonly PatternPresentation[]

const PATTERN_SECTION_NAVIGATION: Partial<
  Record<PatternPresentation['id'], readonly DocumentationNavigationItem[]>
> = {
  charts: [
    {
      id: 'chart-overview',
      label: msg`Overview`,
      route: '/internal/design-system/patterns#chart-overview',
    },
    {
      id: 'chart-home',
      label: msg`Home`,
      route: '/internal/design-system/patterns#chart-home',
    },
    {
      id: 'chart-discover',
      label: msg`Discover`,
      route: '/internal/design-system/patterns#chart-discover',
    },
    {
      id: 'chart-yield',
      label: msg`Yield historical metrics`,
      route: '/internal/design-system/patterns#chart-yield',
    },
    {
      id: 'chart-portfolio',
      label: msg`Portfolio history`,
      route: '/internal/design-system/patterns#chart-portfolio',
    },
  ],
  tables: [
    {
      id: 'tables-current-rebalances',
      label: msg`Current rebalances`,
      route: '/internal/design-system/patterns#tables-current-rebalances',
    },
    {
      id: 'tables-historical-rebalances',
      label: msg`Historical rebalances`,
      route: '/internal/design-system/patterns#tables-historical-rebalances',
    },
    {
      id: 'tables-portfolio',
      label: msg`Portfolio and withdrawals`,
      route: '/internal/design-system/patterns#tables-portfolio',
    },
    {
      id: 'tables-holdings',
      label: msg`Holdings`,
      route: '/internal/design-system/patterns#tables-holdings',
    },
    {
      id: 'tables-discover',
      label: msg`Discover`,
      route: '/internal/design-system/patterns#tables-discover',
    },
    {
      id: 'tables-earn',
      label: msg`Earn and owned positions`,
      route: '/internal/design-system/patterns#tables-earn',
    },
    {
      id: 'tables-governance',
      label: msg`Governance records`,
      route: '/internal/design-system/patterns#tables-governance',
    },
  ],
  navigation: [
    {
      id: 'navigation-global',
      label: msg`Global system`,
      route: '/internal/design-system/patterns#navigation-global',
    },
    {
      id: 'navigation-product',
      label: msg`Product system`,
      route: '/internal/design-system/patterns#navigation-product',
    },
    {
      id: 'navigation-anatomy',
      label: msg`Anatomy and states`,
      route: '/internal/design-system/patterns#navigation-anatomy',
    },
  ],
}

export const DOCUMENTATION_NAVIGATION = [
  {
    id: 'start',
    label: msg`Start`,
    route: '/internal/design-system',
  },
  {
    id: 'foundations',
    label: msg`Foundations`,
    route: '/internal/design-system/foundations',
    items: FOUNDATION_ITEMS.map((item) => ({
      id: item.id,
      label: getFoundationNameMessage(item.id),
      route: `/internal/design-system/foundations#${item.id}`,
    })),
  },
  {
    id: 'components',
    label: msg`Components`,
    route: '/internal/design-system/components',
    items: COMPONENT_GROUPS.map((group) => ({
      id: group.id,
      label: getComponentGroupMessage(group.id),
      route: `/internal/design-system/components#${group.id}`,
      items: group.items.map((item) => ({
        id: item.id,
        label: getComponentNameMessage(item.id),
        route: `/internal/design-system/components#${item.id}`,
      })),
    })),
  },
  {
    id: 'patterns',
    label: msg`Patterns`,
    route: '/internal/design-system/patterns',
    items: PATTERN_PRESENTATIONS.map(({ id, label, sourceKey }) => ({
      id,
      label,
      sourceKey,
      legacy: false,
      route: `/internal/design-system/patterns#${id}`,
      items: PATTERN_SECTION_NAVIGATION[id],
    })),
  },
  {
    id: 'workbench',
    label: msg`Workbench`,
    route: '/internal/design-system/workbench',
    items: [
      {
        id: 'transaction-workbench',
        label: msg`Transaction systems`,
        route: '/internal/design-system/workbench#transaction-workbench',
        items: TRANSACTION_DOCUMENTATION_SECTIONS.map(({ id, label }) => ({
          id,
          label,
          route: `/internal/design-system/workbench#${id}`,
        })),
      },
      {
        id: 'current-review',
        label: msg`Current review`,
        route: '/internal/design-system/workbench#current-review',
      },
      {
        id: 'studies',
        label: msg`Experiments and studies`,
        route: '/internal/design-system/studies',
      },
      {
        id: 'contexts',
        label: msg`Product contexts`,
        route: '/internal/design-system/screens',
      },
    ],
  },
  {
    id: 'records',
    label: msg`Internal records`,
    route: '/internal/design-system/records',
    items: [
      {
        id: 'status',
        label: msg`Project status and coverage`,
        route: '/internal/design-system/status',
      },
      {
        id: 'adoption',
        label: msg`Adoption and engineering`,
        route: '/internal/design-system/records#adoption',
      },
      {
        id: 'history',
        label: msg`Reference and history`,
        route: '/internal/design-system/records#history',
      },
    ],
  },
] as const satisfies readonly DocumentationNavigationGroup[]

export const WORKBENCH_ACTIVITY = [
  {
    sourceKey: 'component:transaction-action',
    route: '/internal/design-system/workbench#transaction-workbench',
    question: msg`Which transaction composition scope should resume?`,
    owner: msg`Human design review`,
    activity: 'paused',
  },
] as const satisfies readonly WorkbenchActivityRecord[]

export const getWorkbenchActivity = (sourceKey: string) =>
  WORKBENCH_ACTIVITY.find((record) => record.sourceKey === sourceKey)

const componentRecords: DocumentationSearchRecord[] = COMPONENT_ITEMS.map(
  (item) => ({
    sourceKey: `component:${item.id}`,
    label: getComponentNameMessage(item.id),
    route: `/internal/design-system/components#${item.id}`,
    description: msg`Component documentation and current status.`,
    destination: 'canonical',
    aliases: item.id === 'chart' ? [item.id, 'charts', 'patterns'] : [item.id],
    searchTerms: [item.name, item.description],
  })
)

const foundationRecords: DocumentationSearchRecord[] = FOUNDATION_ITEMS.map(
  (item) => ({
    sourceKey: `foundation:${item.id}`,
    label: getFoundationNameMessage(item.id),
    route: `/internal/design-system/foundations#${item.id}`,
    description: msg`Foundation documentation and current guidance.`,
    destination: 'canonical',
    aliases: [item.id],
    searchTerms: [item.name, item.description],
  })
)

const destinationRecords: DocumentationSearchRecord[] = [
  {
    sourceKey: 'destination:start',
    label: msg`Start`,
    route: '/internal/design-system',
    description: msg`Design-system documentation overview.`,
    destination: 'canonical',
    aliases: ['overview', 'home'],
  },
  {
    sourceKey: 'destination:foundations',
    label: msg`Foundations`,
    route: '/internal/design-system/foundations',
    description: msg`Visual foundations and current guidance.`,
    destination: 'canonical',
    aliases: ['foundation'],
  },
  {
    sourceKey: 'destination:components',
    label: msg`Components`,
    route: '/internal/design-system/components',
    description: msg`Reusable component guidance and current status.`,
    destination: 'canonical',
    aliases: ['component'],
  },
  {
    sourceKey: 'destination:patterns',
    label: msg`Patterns`,
    route: '/internal/design-system/patterns',
    description: msg`Composition guidance and temporary Legacy lab routes.`,
    destination: 'canonical',
    aliases: ['pattern'],
  },
  {
    sourceKey: 'destination:workbench',
    label: msg`Workbench`,
    route: '/internal/design-system/workbench',
    description: msg`Review questions, studies, and product-context tools.`,
    destination: 'workbench',
    aliases: ['review'],
  },
  {
    sourceKey: 'destination:records',
    label: msg`Internal records`,
    route: '/internal/design-system/records',
    description: msg`Adoption, verification, decisions, and retained evidence.`,
    destination: 'records',
    aliases: ['engineering', 'history'],
  },
]

const componentGroupRecords: DocumentationSearchRecord[] = COMPONENT_GROUPS.map(
  (group) => ({
    sourceKey: `component-group:${group.id}`,
    label: getComponentGroupMessage(group.id),
    route: `/internal/design-system/components#${group.id}`,
    description: msg`Component group.`,
    destination: 'canonical',
    aliases: [group.id],
    searchTerms: [group.name, group.description],
  })
)

const headingRecords: DocumentationSearchRecord[] = [
  {
    sourceKey: 'heading:current-review',
    label: msg`Current review`,
    route: '/internal/design-system/workbench#current-review',
    description: msg`Human decisions currently waiting for review.`,
    destination: 'workbench',
    aliases: ['review', 'queue'],
  },
  {
    sourceKey: 'heading:activity',
    label: msg`Other activity`,
    route: '/internal/design-system/workbench#activity',
    description: msg`Paused or deferred design-system activity.`,
    destination: 'workbench',
    aliases: ['paused', 'deferred'],
  },
  {
    sourceKey: 'heading:review-tools',
    label: msg`Review tools`,
    route: '/internal/design-system/workbench#tools',
    description: msg`Studies and product-context review surfaces.`,
    destination: 'workbench',
    aliases: ['tools'],
  },
  {
    sourceKey: 'destination:studies',
    label: msg`Experiments and studies`,
    route: '/internal/design-system/studies',
    description: msg`Non-canonical design experiments and studies.`,
    destination: 'workbench',
    aliases: ['experiments'],
  },
  {
    sourceKey: 'destination:contexts',
    label: msg`Product contexts`,
    route: '/internal/design-system/screens',
    description: msg`Product-context review surfaces.`,
    destination: 'workbench',
    aliases: ['screens'],
  },
  {
    sourceKey: 'destination:status',
    label: msg`Project status and coverage`,
    route: '/internal/design-system/status',
    description: msg`Detailed project, verification, and adoption records.`,
    destination: 'records',
    aliases: ['engineering', 'coverage', 'adoption'],
  },
  {
    sourceKey: 'heading:adoption',
    label: msg`Adoption and engineering`,
    route: '/internal/design-system/records#adoption',
    description: msg`Implementation, verification, and adoption detail.`,
    destination: 'records',
    aliases: ['implementation'],
  },
  {
    sourceKey: 'heading:history',
    label: msg`Reference and history`,
    route: '/internal/design-system/records#history',
    description: msg`Accepted decisions, plans, and retained evidence.`,
    destination: 'records',
    aliases: ['decisions', 'evidence'],
  },
]

const PATTERN_SEARCH_ALIASES: Record<
  PatternPresentation['id'],
  MessageDescriptor
> = {
  charts: msg`Chart`,
  tables: msg`Table`,
  forms: msg`Form`,
  navigation: msg`Navigation`,
  transactions: msg`Transaction`,
}

const patternRecords: DocumentationSearchRecord[] = PATTERN_PRESENTATIONS.map(
  (record) => {
    const source = getPatternSourceItem(record.sourceKey)

    return {
      sourceKey: `pattern:${record.id}`,
      label: record.label,
      route: `/internal/design-system/patterns#${record.id}`,
      description: msg`Canonical pattern guidance and current scope.`,
      destination: 'canonical',
      aliases: [record.id, PATTERN_SEARCH_ALIASES[record.id]],
      searchTerms: [source.name, source.description],
    }
  }
)

const workbenchRecords: DocumentationSearchRecord[] = WORKBENCH_ACTIVITY.map(
  (record) => ({
    sourceKey: record.sourceKey,
    label: getComponentNameMessage(getPatternSourceItem(record.sourceKey).id),
    route: record.route,
    description: record.question,
    destination: 'workbench',
    aliases: [WORKBENCH_ACTIVITY_MESSAGES[record.activity], record.owner],
  })
)

export const DOCUMENTATION_SEARCH_RECORDS = [
  ...destinationRecords,
  ...patternRecords,
  ...componentGroupRecords,
  ...headingRecords,
  ...componentRecords,
  ...foundationRecords,
  ...workbenchRecords,
]

export const translateDocumentationText = (
  text: DocumentationText,
  translate: DocumentationTranslator
) => (typeof text === 'string' ? text : translate(text))

const sourceText = (text: DocumentationText) =>
  typeof text === 'string' ? text : (text.message ?? text.id)

export const searchDocumentation = (
  query: string,
  translate: DocumentationTranslator = sourceText
): readonly DocumentationSearchRecord[] => {
  const normalized = query.trim().toLocaleLowerCase()
  if (!normalized) return DOCUMENTATION_SEARCH_RECORDS

  return DOCUMENTATION_SEARCH_RECORDS.map((record, index) => ({
    index,
    record,
    score: getSearchScore(record, normalized, translate),
  }))
    .filter(({ score }) => Number.isFinite(score))
    .sort((left, right) => left.score - right.score || left.index - right.index)
    .map(({ record }) => record)
}

const getSearchScore = (
  record: DocumentationSearchRecord,
  query: string,
  translate: DocumentationTranslator
) => {
  const label = translateDocumentationText(record.label, translate)
    .toLocaleLowerCase()
    .trim()
  const aliases = record.aliases.map((text) =>
    translateDocumentationText(text, translate).toLocaleLowerCase().trim()
  )
  const searchTerms = (record.searchTerms ?? []).map((text) =>
    translateDocumentationText(text, translate).toLocaleLowerCase().trim()
  )
  const description = translateDocumentationText(
    record.description,
    translate
  ).toLocaleLowerCase()

  if (label === query || aliases.includes(query)) return 0
  if (label.startsWith(query)) return 1
  if (aliases.some((alias) => alias.startsWith(query))) return 2
  if (searchTerms.includes(query)) return 3
  if (searchTerms.some((term) => term.startsWith(query))) return 4
  if (label.includes(query)) return 5
  if (aliases.some((alias) => alias.includes(query))) return 6
  if (searchTerms.some((term) => term.includes(query))) return 7
  if (description.includes(query)) return 8
  return Number.POSITIVE_INFINITY
}
