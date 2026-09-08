import { COMPONENT_GROUPS } from './component-catalog'
import { FOUNDATION_ITEMS } from './foundation-catalog'
import { GOLDEN_SCREEN_CANDIDATES } from './golden-screen-candidates'
import {
  COMPONENT_AUDIT_LABELS,
  COMPONENT_IMPLEMENTATION_LABELS,
  COMPONENT_REVIEW_LABELS,
} from './catalog-types'

export const PROGRESS_GATES = [
  'inventoried',
  'defined',
  'lab',
  'applied',
  'design-reviewed',
  'in-use',
] as const

export type ProgressGate = (typeof PROGRESS_GATES)[number]

export interface ProgressItem {
  id: string
  name: string
  source: 'provisional' | 'audited'
  gates: ProgressGate[]
  note: string
}

export interface ProgressGroup {
  id: string
  name: string
  items: ProgressItem[]
}

const foundationProgress: ProgressItem[] = FOUNDATION_ITEMS.map((item) => {
  const gates: ProgressGate[] = ['inventoried']

  if (
    item.expectedDecisions.some((decision) => decision.status === 'defined') ||
    item.designAuthority === 'current-baseline'
  ) {
    gates.push('defined')
  }
  if (item.outputStatus === 'rendered') gates.push('lab')
  if (item.designAuthority === 'current-baseline') {
    gates.push('design-reviewed')
  }

  return {
    id: item.id,
    name: item.name,
    source: 'audited',
    gates,
    note: item.statusDetail,
  }
})

const componentProgress: ProgressItem[] = COMPONENT_GROUPS.flatMap((group) =>
  group.items.map((item) => {
    const gates: ProgressGate[] = ['inventoried']

    if (
      item.status === 'defined' ||
      item.designAuthority === 'current-baseline'
    ) {
      gates.push('defined')
    }
    if (item.outputStatus !== 'none') gates.push('lab')
    if (item.designAuthority === 'current-baseline') {
      gates.push('design-reviewed')
    }
    if (item.adoptionStatus !== 'none') gates.push('applied')
    if (item.adoptionStatus === 'in-use') gates.push('in-use')

    return {
      id: item.id,
      name: item.name,
      source: item.auditStatus === 'mapped' ? 'audited' : 'provisional',
      gates,
      note:
        item.status === 'not-needed'
          ? 'Not needed for V1; reopen only with a real product use.'
          : `${COMPONENT_AUDIT_LABELS[item.auditStatus]} · ${COMPONENT_IMPLEMENTATION_LABELS[item.implementationStatus]} · ${COMPONENT_REVIEW_LABELS[item.review.status]}`,
    }
  })
)

export const PROGRESS_GROUPS: ProgressGroup[] = [
  {
    id: 'foundations',
    name: 'Foundations',
    items: foundationProgress,
  },
  {
    id: 'components',
    name: 'Component families',
    items: componentProgress,
  },
  {
    id: 'screens',
    name: 'Representative screens',
    items: GOLDEN_SCREEN_CANDIDATES.map((screen) => ({
      id: screen.id,
      name: screen.name,
      source: 'provisional',
      gates: ['inventoried'],
      note: screen.note,
    })),
  },
]

export const COMPONENT_WORK_QUEUE: { name: string; detail: string }[] = []
