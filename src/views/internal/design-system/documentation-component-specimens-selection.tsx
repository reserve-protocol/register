import { Trans, useLingui } from '@lingui/react/macro'
import { useState } from 'react'

import { Checkbox } from '@/components/checkbox'
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@/components/design-system-v1/segmented-control'
import { SingleChoiceGroup } from '@/components/design-system-v1/single-choice-group'
import { Switch } from '@/components/design-system-v1/switch'
import {
  DocumentationSpecimenCell,
  DocumentationSpecimenGrid,
} from './documentation-specimen-layout'

export const SelectionComponentSpecimen = ({ itemId }: { itemId: string }) => {
  const { t } = useLingui()
  const [segment, setSegment] = useState('all')

  if (itemId === 'checkbox') {
    return (
      <DocumentationSpecimenGrid>
        <DocumentationSpecimenCell label={<Trans>Selected</Trans>}>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox defaultChecked aria-label={t`Include archived`} />
            <Trans>Include archived</Trans>
          </label>
        </DocumentationSpecimenCell>
        <DocumentationSpecimenCell label={<Trans>Unselected</Trans>}>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox aria-label={t`Show test assets`} />
            <Trans>Show test assets</Trans>
          </label>
        </DocumentationSpecimenCell>
        <DocumentationSpecimenCell label={<Trans>Unavailable</Trans>}>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Checkbox disabled aria-label={t`Unavailable filter`} />
            <Trans>Unavailable filter</Trans>
          </label>
        </DocumentationSpecimenCell>
      </DocumentationSpecimenGrid>
    )
  }

  if (itemId === 'radio-group') {
    return (
      <SingleChoiceGroup
        accessibleLabel={t`Governance model`}
        defaultValue="standard"
        options={[
          { value: 'standard', label: t`Standard` },
          { value: 'optimistic', label: t`Optimistic` },
          { value: 'disabled', label: t`Unavailable`, disabled: true },
        ]}
      />
    )
  }

  if (itemId === 'switch') {
    return (
      <DocumentationSpecimenGrid className="xl:grid-cols-2">
        <DocumentationSpecimenCell label={<Trans>On</Trans>}>
          <label className="flex items-center gap-3 text-sm">
            <Switch defaultChecked aria-label={t`Automatic voting`} />
            <Trans>Automatic voting</Trans>
          </label>
        </DocumentationSpecimenCell>
        <DocumentationSpecimenCell label={<Trans>Unavailable</Trans>}>
          <label className="flex items-center gap-3 text-sm text-muted-foreground">
            <Switch disabled aria-label={t`Voting unavailable`} />
            <Trans>Voting unavailable</Trans>
          </label>
        </DocumentationSpecimenCell>
      </DocumentationSpecimenGrid>
    )
  }

  if (itemId === 'segmented-control') {
    return (
      <SegmentedControl
        aria-label={t`Position filter`}
        presentation="contained"
        value={segment}
        onValueChange={setSegment}
      >
        <SegmentedControlItem value="all">
          <Trans>All</Trans>
        </SegmentedControlItem>
        <SegmentedControlItem value="active">
          <Trans>Active</Trans>
        </SegmentedControlItem>
        <SegmentedControlItem value="closed">
          <Trans>Closed</Trans>
        </SegmentedControlItem>
      </SegmentedControl>
    )
  }

  return null
}
