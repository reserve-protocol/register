import ActionGroupStateSheet from './action-group-state-sheet'
import AccordionStateSheet from './accordion-state-sheet'
import CollapsibleStateSheet from './collapsible-state-sheet'
import ButtonStateSheet from './button-state-sheet'
import CardContentRegionReview from './card-content-region-review'
import CheckboxStateSheet from './checkbox-state-sheet'
import ContainedFormRowReview from './contained-form-row-review'
import CopyableValueStateSheet from './copyable-value-state-sheet'
import DialogStateSheet from './dialog-state-sheet'
import DrawerStateSheet from './drawer-state-sheet'
import EmptyStateStateSheet from './empty-state-state-sheet'
import EntityIdentityStateSheet from './entity-identity-state-sheet'
import FieldStateSheet from './field-state-sheet'
import HelpTooltipStateSheet from './help-tooltip-state-sheet'
import IconButtonStateSheet from './icon-button-state-sheet'
import InformationRowStateSheet from './information-row-state-sheet'
import InlineMessageStateSheet from './inline-message-state-sheet'
import LifecycleStatusStateSheet from './lifecycle-status-state-sheet'
import LinkStateSheet from './link-state-sheet'
import { SkeletonStateSheet, SpinnerStateSheet } from './loading-state-sheet'
import MenuStateSheet from './menu-state-sheet'
import MetricStateSheet from './metric-state-sheet'
import MultiSelectFilterStateSheet from './multi-select-filter-state-sheet'
import NavigationSystemsStateSheet from './navigation-systems-state-sheet'
import PaginationStateSheet from './pagination-state-sheet'
import SearchFieldStateSheet from './search-field-state-sheet'
import SegmentedControlStateSheet from './segmented-control-state-sheet'
import SelectStateSheet from './select-state-sheet'
import SingleChoiceGroupStateSheet from './single-choice-group-state-sheet'
import SwitchStateSheet from './switch-state-sheet'
import TabsStateSheet from './tabs-state-sheet'
import TextAreaStateSheet from './textarea-state-sheet'

const ComponentVisualOutput = ({ itemId }: { itemId: string }) => {
  if (itemId === 'button') return <ButtonStateSheet />
  if (itemId === 'accordion') return <AccordionStateSheet />
  if (itemId === 'collapsible') return <CollapsibleStateSheet />
  if (itemId === 'icon-button') return <IconButtonStateSheet />
  if (itemId === 'button-group') return <ActionGroupStateSheet />
  if (itemId === 'checkbox') return <CheckboxStateSheet />
  if (itemId === 'dialog') return <DialogStateSheet />
  if (itemId === 'drawer') return <DrawerStateSheet />
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
  if (itemId === 'global-navigation')
    return <NavigationSystemsStateSheet focus="global" />
  if (itemId === 'product-navigation') return <NavigationSystemsStateSheet />
  if (itemId === 'tabs') return <TabsStateSheet />
  if (itemId === 'segmented-control') return <SegmentedControlStateSheet />
  if (itemId === 'switch') return <SwitchStateSheet />
  if (itemId === 'textarea') return <TextAreaStateSheet />
  if (itemId === 'pagination') return <PaginationStateSheet />
  if (itemId === 'copy-value') return <CopyableValueStateSheet />
  if (itemId === 'skeleton') return <SkeletonStateSheet />
  if (itemId === 'spinner') return <SpinnerStateSheet />
  if (itemId === 'table') return <InformationRowStateSheet />
  if (itemId === 'empty-state') return <EmptyStateStateSheet />
  if (itemId === 'tooltip') return <HelpTooltipStateSheet />
  if (itemId === 'link') return <LinkStateSheet />
  if (itemId === 'alert') return <InlineMessageStateSheet />
  return null
}

export default ComponentVisualOutput
