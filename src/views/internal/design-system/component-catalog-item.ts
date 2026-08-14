import type {
  ComponentAuditStatus,
  ComponentItem,
  ComponentPriority,
  ComponentRelationship,
} from './catalog-types'

interface ComponentOptions {
  priority?: ComponentPriority
  auditStatus?: ComponentAuditStatus
  evidence?: string[]
  decisionPrompts?: string[]
  stateAdditions?: string[]
  relationships?: ComponentRelationship[]
  nextAction?: string
}

export const pendingComponent = (
  id: string,
  name: string,
  description: string,
  why: string,
  options: ComponentOptions = {}
): ComponentItem => ({
  id,
  name,
  description,
  why,
  status:
    (options.auditStatus ?? 'pending') === 'pending'
      ? 'audit-pending'
      : 'evidence-found',
  outputStatus: 'none',
  implementationStatus: 'none',
  adoptionStatus: 'none',
  review: {
    status: 'blocked',
    scope:
      'No V1 implementation is ready for visual review. Current evidence may still inform later work.',
    dependencies: [],
  },
  statusDetail:
    (options.auditStatus ?? 'pending') === 'pending'
      ? 'Expected capability; current product usage has not been classified yet.'
      : (options.auditStatus ?? 'pending') === 'partial'
        ? 'Representative evidence is mapped; remaining implementations and exceptions still need classification.'
        : 'Current shared implementations and primary usage evidence are mapped; the V1 contract remains open.',
  priority: options.priority ?? 'v1-conditional',
  auditStatus: options.auditStatus ?? 'pending',
  evidence: options.evidence ?? [
    'A capability slot exists; current implementations still need classification.',
  ],
  decisionPrompts: options.decisionPrompts ?? [
    'Confirm whether this is a distinct reusable behavior in Register.',
    'Identify the smallest useful anatomy and variant set.',
  ],
  stateAdditions: options.stateAdditions,
  relationships: options.relationships,
  nextAction:
    options.nextAction ??
    'Inspect representative product uses, collapse duplicates, then build a complete state sheet.',
})
