export type CatalogStatus =
  | 'audit-pending'
  | 'evidence-found'
  | 'defined'
  | 'not-needed'

export type CatalogOutputStatus = 'none' | 'rendered'

export type DesignAuthorityStatus =
  | 'undefined'
  | 'exploratory'
  | 'current-baseline'
  | 'superseded'

export const FOUNDATION_IDS = [
  'color',
  'typography',
  'spacing',
  'radius',
  'layout',
  'elevation',
  'motion',
  'iconography',
  'accessibility',
] as const

export type FoundationId = (typeof FOUNDATION_IDS)[number]

export const CATALOG_CONTEXT_SOURCE_ROLES = [
  'authority',
  'accepted-decision',
  'implementation',
  'visual-evidence',
  'product-evidence',
  'legacy-evidence',
] as const

export type CatalogContextSourceRole =
  (typeof CATALOG_CONTEXT_SOURCE_ROLES)[number]

export interface CatalogContextSource {
  role: CatalogContextSourceRole
  label: string
  path: string
  detail?: string
}

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
  designAuthority: DesignAuthorityStatus
  statusDetail: string
}

export interface FoundationItem extends CatalogItem {
  id: FoundationId
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
  | 'reusable-recipe'
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
  implementationSource?: string
  contextSources?: CatalogContextSource[]
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
  foundationDependencies: FoundationId[]
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
  rendered: 'Rendered in lab',
}

export const DESIGN_AUTHORITY_LABELS: Record<DesignAuthorityStatus, string> = {
  undefined: 'Not defined',
  exploratory: 'Exploratory direction',
  'current-baseline': 'Current baseline',
  superseded: 'Superseded',
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
  'reusable-recipe': 'Reusable V1 recipe',
  'canonical-candidate': 'Reusable V1 candidate',
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
    ready: 'Ready for canonical review',
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
