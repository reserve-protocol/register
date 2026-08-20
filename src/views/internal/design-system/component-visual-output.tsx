import ActionGroupStateSheet from './action-group-state-sheet'
import ButtonStateSheet from './button-state-sheet'
import CardContentRegionReview from './card-content-region-review'
import CheckboxStateSheet from './checkbox-state-sheet'
import ContainedFormRowReview from './contained-form-row-review'
import DialogStateSheet from './dialog-state-sheet'
import EmptyStateStateSheet from './empty-state-state-sheet'
import EntityIdentityStateSheet from './entity-identity-state-sheet'
import FieldStateSheet from './field-state-sheet'
import HelpTooltipStateSheet from './help-tooltip-state-sheet'
import IconButtonStateSheet from './icon-button-state-sheet'
import InformationRowStateSheet from './information-row-state-sheet'
import LifecycleStatusStateSheet from './lifecycle-status-state-sheet'
import MenuStateSheet from './menu-state-sheet'
import MetricStateSheet from './metric-state-sheet'
import MultiSelectFilterStateSheet from './multi-select-filter-state-sheet'
import SearchFieldStateSheet from './search-field-state-sheet'
import SelectStateSheet from './select-state-sheet'
import SingleChoiceGroupStateSheet from './single-choice-group-state-sheet'
import TabsStateSheet from './tabs-state-sheet'

const ComponentVisualOutput = ({ itemId }: { itemId: string }) => {
  if (itemId === 'button') return <ButtonStateSheet />
  if (itemId === 'icon-button') return <IconButtonStateSheet />
  if (itemId === 'button-group') return <ActionGroupStateSheet />
  if (itemId === 'checkbox') return <CheckboxStateSheet />
  if (itemId === 'dialog') return <DialogStateSheet />
  if (itemId === 'badge') return <LifecycleStatusStateSheet />
  if (itemId === 'entity-identity') return <EntityIdentityStateSheet />
  if (itemId === 'metric') return <MetricStateSheet />
  if (itemId === 'card') return <CardContentRegionReview />
  if (itemId === 'input')
    return (
      <>
        <FieldStateSheet />
        <ContainedFormRowReview includeOrdinaryFields={false} />
      </>
    )
  if (itemId === 'radio-group') return <SingleChoiceGroupStateSheet />
  if (itemId === 'select') return <SelectStateSheet />
  if (itemId === 'multi-select-filter') return <MultiSelectFilterStateSheet />
  if (itemId === 'search') return <SearchFieldStateSheet />
  if (itemId === 'dropdown-menu') return <MenuStateSheet />
  if (itemId === 'tabs') return <TabsStateSheet />
  if (itemId === 'table') return <InformationRowStateSheet />
  if (itemId === 'empty-state') return <EmptyStateStateSheet />
  if (itemId === 'tooltip') return <HelpTooltipStateSheet />
  return null
}

export default ComponentVisualOutput
