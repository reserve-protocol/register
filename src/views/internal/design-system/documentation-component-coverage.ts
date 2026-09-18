import { COMPONENT_GROUPS } from './component-catalog'
import {
  getComponentPresentation,
  type HumanDesignStatus,
} from './documentation-presentation'

export type DocumentationOverviewDisposition =
  | 'specimen'
  | 'pattern'
  | 'card-reference'
  | 'compact-status'

export interface DocumentationComponentCoverage {
  id: string
  groupId: string
  design: HumanDesignStatus
  overview: DocumentationOverviewDisposition
  acceptedAxes: readonly string[]
  defaultDisposition: string
  canvas: {
    width: string
    backdrop: string
    padding: string
    alignment: string
    overflow: string
  }
  detailBoundary: string
  owner: string
  humanGate: string
}

const DIRECT_AXES: Record<string, readonly string[]> = {
  button: ['tone', 'size', 'availability', 'loading', 'width'],
  'icon-button': ['tone', 'compact-size', 'availability', 'loading'],
  'button-group': ['direction', 'size', 'hierarchy', 'width'],
  input: [
    'empty',
    'filled',
    'focus-visible',
    'invalid',
    'read-only',
    'disabled',
  ],
  textarea: ['multiline', 'invalid', 'read-only', 'disabled'],
  select: [
    'default-size',
    'compact-size',
    'placeholder',
    'selected',
    'disabled',
    'identity',
  ],
  'multi-select-filter': [
    'empty',
    'applied',
    'options',
    'minimum-selection',
    'disabled-option',
  ],
  search: [
    'empty',
    'query',
    'clear',
    'focus-visible',
    'loading',
    'disabled',
    'no-results',
  ],
  checkbox: [
    'unchecked',
    'checked',
    'focus-visible',
    'disabled-off',
    'disabled-on',
  ],
  'radio-group': [
    'selected',
    'peer',
    'disabled',
    'intrinsic-width',
    'full-width',
  ],
  switch: ['off', 'on', 'focus-visible', 'disabled-off', 'disabled-on'],
  'segmented-control': [
    'text-only',
    'contained',
    'compact',
    'default',
    'selected',
    'disabled',
  ],
  link: ['inline', 'standalone', 'return', 'external', 'disabled'],
  tabs: [
    'compact',
    'default',
    'intrinsic',
    'full-width',
    'selected',
    'disabled',
  ],
  pagination: ['first-page', 'middle-page', 'last-page', 'constrained-width'],
  dialog: ['eligibility-default', 'eligibility-result', 'exploring-status'],
  popover: ['resting', 'open', 'bounded-content'],
  'dropdown-menu': ['closed', 'open', 'ordinary-action', 'destructive-action'],
  tooltip: ['resting', 'hover-or-focus', 'placement'],
  alert: ['informational', 'success', 'warning', 'destructive'],
  spinner: ['compact', 'default', 'labeled'],
  skeleton: ['text', 'record', 'table'],
  'empty-state': ['plain', 'actionable', 'no-results'],
  badge: ['tone', 'content-width'],
  'entity-identity': ['default', 'long-name', 'loading', 'missing-image'],
  metric: ['supporting', 'primary', 'headline', 'alignment'],
  'copy-value': ['separate-action', 'inline-primary', 'inline-neutral'],
  accordion: ['collapsed', 'expanded', 'disabled'],
  collapsible: ['collapsed', 'expanded', 'unavailable'],
}

const PATTERN_AXES: Record<string, readonly string[]> = {
  chart: ['family', 'range', 'source-faithful-width'],
  table: ['family', 'state', 'viewport'],
  'global-navigation': ['viewport', 'state', 'identity'],
  'product-navigation': ['viewport', 'state', 'identity', 'action-context'],
}

const coverageFor = (
  groupId: string,
  item: (typeof COMPONENT_GROUPS)[number]['items'][number]
): DocumentationComponentCoverage => {
  const design = getComponentPresentation(item).design
  const acceptedAxes = DIRECT_AXES[item.id] ?? PATTERN_AXES[item.id] ?? []
  const overview: DocumentationOverviewDisposition = DIRECT_AXES[item.id]
    ? 'specimen'
    : PATTERN_AXES[item.id]
      ? 'pattern'
      : item.id === 'card'
        ? 'card-reference'
        : 'compact-status'

  if (
    design === 'accepted' &&
    acceptedAxes.length === 0 &&
    item.id !== 'card'
  ) {
    throw new Error(`Accepted component ${item.id} has no overview coverage`)
  }

  const canvas =
    overview === 'specimen'
      ? {
          width:
            item.id === 'metric'
              ? 'canvas-owned'
              : 'fluid-within-capped-document',
          backdrop: item.id === 'metric' ? 'canvas-owned' : 'neutral',
          padding: item.id === 'metric' ? 'canvas-owned' : 'contained',
          alignment: 'start',
          overflow: 'horizontal-access',
        }
      : overview === 'pattern'
        ? {
            width: 'pattern-owned',
            backdrop: 'pattern-owned',
            padding: 'pattern-owned',
            alignment: 'pattern-owned',
            overflow: 'pattern-owned',
          }
        : overview === 'card-reference'
          ? {
              width: 'fluid-within-capped-document',
              backdrop: 'neutral',
              padding: 'contained',
              alignment: 'start',
              overflow: 'visible',
            }
          : {
              width: 'none',
              backdrop: 'none',
              padding: 'compact-status',
              alignment: 'start',
              overflow: 'visible',
            }

  return {
    id: item.id,
    groupId,
    design,
    overview,
    acceptedAxes:
      item.id === 'card' ? ['accepted composition reference'] : acceptedAxes,
    defaultDisposition:
      design === 'accepted'
        ? overview === 'pattern'
          ? 'declared by the complete pattern owner'
          : 'shown directly or explicitly identified as not a standalone axis'
        : 'no accepted default; status and reopen boundary only',
    canvas,
    detailBoundary:
      design === 'accepted'
        ? 'guidance, rare combinations, API, evidence, and history'
        : 'status, evidence, open decisions, and reopen condition',
    owner:
      item.implementationSource ??
      item.compositionSource?.componentId ??
      `component-catalog:${item.id}`,
    humanGate: item.review.scope,
  }
}

export const DOCUMENTATION_COMPONENT_COVERAGE = COMPONENT_GROUPS.flatMap(
  (group) => group.items.map((item) => coverageFor(group.id, item))
)

export const getDocumentationComponentCoverage = (itemId: string) =>
  DOCUMENTATION_COMPONENT_COVERAGE.find(({ id }) => id === itemId)
