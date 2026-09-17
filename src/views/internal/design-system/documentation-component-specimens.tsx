import { ActionComponentSpecimen } from './documentation-component-specimens-actions'
import { DataComponentSpecimen } from './documentation-component-specimens-data'
import { DisclosureComponentSpecimen } from './documentation-component-specimens-disclosure'
import { FeedbackComponentSpecimen } from './documentation-component-specimens-feedback'
import { FieldComponentSpecimen } from './documentation-component-specimens-fields'
import { NavigationComponentSpecimen } from './documentation-component-specimens-navigation'
import { OverlayComponentSpecimen } from './documentation-component-specimens-overlays'
import { SelectionComponentSpecimen } from './documentation-component-specimens-selection'
import type { ComponentPresentation } from './documentation-presentation'

const ACCEPTED_DIRECT_COMPONENTS = new Set([
  'button',
  'icon-button',
  'button-group',
  'input',
  'textarea',
  'select',
  'multi-select-filter',
  'search',
  'checkbox',
  'radio-group',
  'switch',
  'segmented-control',
  'link',
  'tabs',
  'pagination',
  'dialog',
  'popover',
  'dropdown-menu',
  'tooltip',
  'alert',
  'spinner',
  'skeleton',
  'empty-state',
  'badge',
  'entity-identity',
  'metric',
  'copy-value',
  'accordion',
  'collapsible',
])

export const hasDocumentationComponentSpecimen = (itemId: string) =>
  ACCEPTED_DIRECT_COMPONENTS.has(itemId)

export const canMountDocumentationComponentSpecimen = (
  itemId: string,
  design: ComponentPresentation['design']
) => design === 'accepted' && hasDocumentationComponentSpecimen(itemId)

export const DocumentationComponentSpecimen = ({
  groupId,
  itemId,
}: {
  groupId: string
  itemId: string
}) => {
  if (groupId === 'actions') return <ActionComponentSpecimen itemId={itemId} />
  if (groupId === 'fields') return <FieldComponentSpecimen itemId={itemId} />
  if (groupId === 'selection')
    return <SelectionComponentSpecimen itemId={itemId} />
  if (groupId === 'navigation')
    return <NavigationComponentSpecimen itemId={itemId} />
  if (groupId === 'overlays')
    return <OverlayComponentSpecimen itemId={itemId} />
  if (groupId === 'feedback')
    return <FeedbackComponentSpecimen itemId={itemId} />
  if (groupId === 'data-display')
    return <DataComponentSpecimen itemId={itemId} />
  if (groupId === 'disclosure')
    return <DisclosureComponentSpecimen itemId={itemId} />
  return null
}
