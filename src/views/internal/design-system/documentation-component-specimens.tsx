import { ActionComponentSpecimen } from './documentation-component-specimens-actions'
import { DataComponentSpecimen } from './documentation-component-specimens-data'
import { DisclosureComponentSpecimen } from './documentation-component-specimens-disclosure'
import { FeedbackComponentSpecimen } from './documentation-component-specimens-feedback'
import { FieldComponentSpecimen } from './documentation-component-specimens-fields'
import { NavigationComponentSpecimen } from './documentation-component-specimens-navigation'
import { OverlayComponentSpecimen } from './documentation-component-specimens-overlays'
import { SelectionComponentSpecimen } from './documentation-component-specimens-selection'
import { getDocumentationComponentCoverage } from './documentation-component-coverage'
import type { ComponentPresentation } from './documentation-presentation'

export const hasDocumentationComponentSpecimen = (itemId: string) =>
  getDocumentationComponentCoverage(itemId)?.overview === 'specimen'

export const documentationComponentSpecimenOwnsCanvas = (itemId: string) =>
  getDocumentationComponentCoverage(itemId)?.canvas.width === 'canvas-owned'

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
