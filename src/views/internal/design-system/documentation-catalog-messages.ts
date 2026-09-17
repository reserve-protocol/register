import type { MessageDescriptor } from '@lingui/core'
import { msg } from '@lingui/core/macro'

export const COMPONENT_GROUP_MESSAGES: Record<string, MessageDescriptor> = {
  actions: msg`Actions`,
  fields: msg`Fields`,
  selection: msg`Selection`,
  navigation: msg`Navigation`,
  overlays: msg`Overlays`,
  feedback: msg`Feedback`,
  'data-display': msg`Data display`,
  disclosure: msg`Disclosure`,
}

export const COMPONENT_NAME_MESSAGES: Record<string, MessageDescriptor> = {
  button: msg`Button`,
  'icon-button': msg`Icon button`,
  'button-group': msg`Action group`,
  'transaction-action': msg`Transaction system`,
  input: msg`Text input`,
  textarea: msg`Textarea`,
  select: msg`Select`,
  combobox: msg`Combobox`,
  'multi-select-filter': msg`Multi-select filter`,
  search: msg`Search field`,
  'amount-field': msg`Amount field`,
  'asset-picker': msg`Asset picker`,
  checkbox: msg`Checkbox`,
  'radio-group': msg`Radio group`,
  switch: msg`Switch`,
  'segmented-control': msg`Segmented control`,
  slider: msg`Slider`,
  'global-navigation': msg`Global navigation`,
  'product-navigation': msg`Product navigation`,
  link: msg`Link`,
  tabs: msg`Tabs`,
  pagination: msg`Pagination`,
  stepper: msg`Stepper`,
  breadcrumb: msg`Breadcrumb`,
  dialog: msg`Dialog`,
  drawer: msg`Drawer`,
  popover: msg`Popover`,
  'dropdown-menu': msg`Menu`,
  tooltip: msg`Tooltip`,
  alert: msg`Inline message`,
  toast: msg`Toast`,
  progress: msg`Progress indicator`,
  spinner: msg`Spinner`,
  skeleton: msg`Skeleton`,
  'empty-state': msg`Empty state`,
  badge: msg`Lifecycle status`,
  'entity-identity': msg`Entity identity`,
  metric: msg`Metric`,
  card: msg`Card / content region`,
  table: msg`Table`,
  'data-table': msg`Data table`,
  chart: msg`Chart`,
  'copy-value': msg`Copyable value`,
  accordion: msg`Accordion`,
  collapsible: msg`Collapsible`,
}

export const FOUNDATION_NAME_MESSAGES: Record<string, MessageDescriptor> = {
  color: msg`Color`,
  typography: msg`Typography`,
  spacing: msg`Spacing & density`,
  radius: msg`Radius`,
  layout: msg`Layout & responsive structure`,
  elevation: msg`Elevation`,
  motion: msg`Motion`,
  iconography: msg`Iconography`,
  accessibility: msg`Accessibility`,
}

const requireMessage = (
  owner: string,
  messages: Record<string, MessageDescriptor>,
  id: string
) => {
  const message = messages[id]
  if (!message) throw new Error(`Missing ${owner} presentation message: ${id}`)
  return message
}

export const getComponentGroupMessage = (id: string) =>
  requireMessage('component group', COMPONENT_GROUP_MESSAGES, id)

export const getComponentNameMessage = (id: string) =>
  requireMessage('component', COMPONENT_NAME_MESSAGES, id)

export const getFoundationNameMessage = (id: string) =>
  requireMessage('foundation', FOUNDATION_NAME_MESSAGES, id)
