export type CatalogStatus =
  | 'audit-pending'
  | 'evidence-found'
  | 'defined'
  | 'not-needed'

export type CatalogOutputStatus =
  | 'none'
  | 'current-baseline'
  | 'proposal'
  | 'accepted'

export type DefinitionSlot =
  | { name: string; status: 'open'; detail?: string }
  | { name: string; status: 'defined'; detail: string }

export interface CatalogItem {
  id: string
  name: string
  description: string
  why: string
  status: CatalogStatus
  outputStatus: CatalogOutputStatus
  statusDetail: string
}

export interface FoundationItem extends CatalogItem {
  expectedDecisions: DefinitionSlot[]
}

export type ComponentPriority =
  | 'v1-core'
  | 'v1-conditional'
  | 'product-extension'

export type ComponentAuditStatus = 'mapped' | 'partial' | 'pending'

export type ComponentImplementationStatus =
  | 'none'
  | 'specimen'
  | 'canonical-candidate'

export type ComponentAdoptionStatus = 'none' | 'opt-in' | 'in-use'

export type ComponentReviewReadiness =
  | 'ready'
  | 'provisional'
  | 'blocked'
  | 'exploration'

export type ComponentDependencyStatus =
  | 'canonical'
  | 'retained'
  | 'provisional'
  | 'blocked'

export interface ComponentReviewDependency {
  name: string
  status: ComponentDependencyStatus
  detail?: string
}

export interface ComponentReviewContract {
  status: ComponentReviewReadiness
  scope: string
  dependencies: ComponentReviewDependency[]
}

export interface ComponentRelationship {
  id: string
  note: string
}

export interface ComponentItem extends CatalogItem {
  priority: ComponentPriority
  auditStatus: ComponentAuditStatus
  implementationStatus: ComponentImplementationStatus
  adoptionStatus: ComponentAdoptionStatus
  evidence: string[]
  decisionPrompts: string[]
  stateAdditions?: string[]
  relationships?: ComponentRelationship[]
  review: ComponentReviewContract
  nextAction: string
}

export interface ComponentGroup {
  id: string
  name: string
  description: string
  foundationDependencies: string[]
  defaultStates: string[]
  expectedDecisions: DefinitionSlot[]
  items: ComponentItem[]
}

export const STATUS_LABELS: Record<CatalogStatus, string> = {
  'audit-pending': 'Audit pending',
  'evidence-found': 'Evidence mapped',
  defined: 'V1 defined',
  'not-needed': 'Not needed',
}

export const OUTPUT_LABELS: Record<CatalogOutputStatus, string> = {
  none: 'No lab output',
  'current-baseline': 'Current baseline',
  proposal: 'V1 proposal',
  accepted: 'Accepted output',
}

export const COMPONENT_PRIORITY_LABELS: Record<ComponentPriority, string> = {
  'v1-core': 'V1 core',
  'v1-conditional': 'Conditional',
  'product-extension': 'Product primitive',
}

export const COMPONENT_AUDIT_LABELS: Record<ComponentAuditStatus, string> = {
  mapped: 'Usage mapped',
  partial: 'Partial evidence',
  pending: 'Audit pending',
}

export const COMPONENT_IMPLEMENTATION_LABELS: Record<
  ComponentImplementationStatus,
  string
> = {
  none: 'No implementation',
  specimen: 'Specimen only',
  'canonical-candidate': 'Canonical candidate',
}

export const COMPONENT_ADOPTION_LABELS: Record<
  ComponentAdoptionStatus,
  string
> = {
  none: 'Not adopted',
  'opt-in': 'Opt-in use',
  'in-use': 'In production',
}

export const COMPONENT_REVIEW_LABELS: Record<ComponentReviewReadiness, string> =
  {
    ready: 'Canonical V1 review',
    provisional: 'Provisional composition',
    blocked: 'Blocked composition',
    exploration: 'Exploration only',
  }

export const COMPONENT_DEPENDENCY_LABELS: Record<
  ComponentDependencyStatus,
  string
> = {
  canonical: 'Canonical V1',
  retained: 'Explicitly retained',
  provisional: 'Provisional',
  blocked: 'Blocking dependency',
}

export const openDefinitionSlots = (...names: string[]): DefinitionSlot[] =>
  names.map((name) => ({ name, status: 'open' }))
