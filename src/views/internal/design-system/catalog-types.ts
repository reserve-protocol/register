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

export interface ComponentRelationship {
  id: string
  note: string
}

export interface ComponentItem extends CatalogItem {
  priority: ComponentPriority
  auditStatus: ComponentAuditStatus
  evidence: string[]
  decisionPrompts: string[]
  stateAdditions?: string[]
  relationships?: ComponentRelationship[]
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

export const openDefinitionSlots = (...names: string[]): DefinitionSlot[] =>
  names.map((name) => ({ name, status: 'open' }))
