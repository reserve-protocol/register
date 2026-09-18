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
  DocumentationSpecimenMatrix,
} from './documentation-specimen-layout'

export const SelectionComponentSpecimen = ({ itemId }: { itemId: string }) => {
  const { t } = useLingui()

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
        <DocumentationSpecimenCell label={<Trans>Focus visible</Trans>}>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              aria-label={t`Focused archived filter`}
              data-documentation-state="focus-visible"
              className="[&>span]:ring-2 [&>span]:ring-ring [&>span]:ring-offset-2 [&>span]:ring-offset-card"
            />
            <Trans>Include archived</Trans>
          </label>
        </DocumentationSpecimenCell>
        <DocumentationSpecimenCell label={<Trans>Unavailable off</Trans>}>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Checkbox disabled aria-label={t`Unavailable filter`} />
            <Trans>Unavailable filter</Trans>
          </label>
        </DocumentationSpecimenCell>
        <DocumentationSpecimenCell label={<Trans>Unavailable on</Trans>}>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Checkbox
              checked
              disabled
              aria-label={t`Unavailable selected filter`}
            />
            <Trans>Unavailable selected filter</Trans>
          </label>
        </DocumentationSpecimenCell>
      </DocumentationSpecimenGrid>
    )
  }

  if (itemId === 'radio-group') {
    return (
      <DocumentationSpecimenGrid className="xl:grid-cols-2">
        <DocumentationSpecimenCell label={<Trans>Intrinsic width</Trans>}>
          <SingleChoiceGroup
            accessibleLabel={t`Governance model`}
            defaultValue="standard"
            options={[
              { value: 'standard', label: t`Standard` },
              { value: 'optimistic', label: t`Optimistic` },
              { value: 'disabled', label: t`Unavailable`, disabled: true },
            ]}
          />
        </DocumentationSpecimenCell>
        <DocumentationSpecimenCell label={<Trans>Full width</Trans>}>
          <SingleChoiceGroup
            accessibleLabel={t`Voting quorum`}
            defaultValue="20"
            width="full"
            options={[
              { value: '10', label: '10%' },
              { value: '15', label: '15%' },
              { value: '20', label: '20%' },
              { value: '25', label: '25%', disabled: true },
            ]}
          />
        </DocumentationSpecimenCell>
      </DocumentationSpecimenGrid>
    )
  }

  if (itemId === 'switch') {
    return (
      <DocumentationSpecimenGrid>
        <DocumentationSpecimenCell label={<Trans>Off</Trans>}>
          <label className="flex items-center gap-3 text-sm">
            <Switch aria-label={t`Automatic voting off`} />
            <Trans>Automatic voting</Trans>
          </label>
        </DocumentationSpecimenCell>
        <DocumentationSpecimenCell label={<Trans>On</Trans>}>
          <label className="flex items-center gap-3 text-sm">
            <Switch defaultChecked aria-label={t`Automatic voting`} />
            <Trans>Automatic voting</Trans>
          </label>
        </DocumentationSpecimenCell>
        <DocumentationSpecimenCell label={<Trans>Focus visible</Trans>}>
          <label className="flex items-center gap-3 text-sm">
            <Switch
              aria-label={t`Focused automatic voting`}
              data-documentation-state="focus-visible"
              className="ring-2 ring-ring ring-offset-2 ring-offset-card"
            />
            <Trans>Automatic voting</Trans>
          </label>
        </DocumentationSpecimenCell>
        <DocumentationSpecimenCell label={<Trans>Unavailable off</Trans>}>
          <label className="flex items-center gap-3 text-sm text-muted-foreground">
            <Switch disabled aria-label={t`Unavailable off`} />
            <Trans>Automatic voting</Trans>
          </label>
        </DocumentationSpecimenCell>
        <DocumentationSpecimenCell label={<Trans>Unavailable on</Trans>}>
          <label className="flex items-center gap-3 text-sm text-muted-foreground">
            <Switch checked disabled aria-label={t`Unavailable on`} />
            <Trans>Automatic voting</Trans>
          </label>
        </DocumentationSpecimenCell>
      </DocumentationSpecimenGrid>
    )
  }

  if (itemId === 'segmented-control') {
    return (
      <DocumentationSpecimenMatrix
        axisLabel={<Trans>Presentation</Trans>}
        columns={[
          <Trans key="compact">Compact</Trans>,
          <Trans key="default">Default</Trans>,
        ]}
        rows={[
          {
            label: <Trans>Text-only</Trans>,
            cells: [
              <SegmentedControlExample
                key="text-only-compact"
                accessibleLabel={t`Compact text-only position filter`}
                presentation="text-only"
                size="compact"
                testId="segmented-control-text-only-compact"
              />,
              <SegmentedControlExample
                key="text-only-default"
                accessibleLabel={t`Default text-only position filter`}
                presentation="text-only"
                size="default"
                testId="segmented-control-text-only-default"
              />,
            ],
          },
          {
            label: <Trans>Contained</Trans>,
            cells: [
              <SegmentedControlExample
                key="contained-compact"
                accessibleLabel={t`Compact contained position filter`}
                presentation="contained"
                size="compact"
                testId="segmented-control-contained-compact"
              />,
              <SegmentedControlExample
                key="contained-default"
                accessibleLabel={t`Default contained position filter`}
                presentation="contained"
                size="default"
                testId="segmented-control-contained-default"
              />,
            ],
          },
        ]}
      />
    )
  }

  return null
}

const SegmentedControlExample = ({
  accessibleLabel,
  presentation,
  size,
  testId,
}: {
  accessibleLabel: string
  presentation: 'contained' | 'text-only'
  size: 'compact' | 'default'
  testId: string
}) => {
  const [value, setValue] = useState('all')

  return (
    <SegmentedControl
      aria-label={accessibleLabel}
      presentation={presentation}
      size={size}
      value={value}
      onValueChange={setValue}
    >
      <SegmentedControlItem value="all">
        <Trans>All</Trans>
      </SegmentedControlItem>
      <SegmentedControlItem data-testid={`${testId}-active`} value="active">
        <Trans>Active</Trans>
      </SegmentedControlItem>
      <SegmentedControlItem value="closed">
        <Trans>Closed</Trans>
      </SegmentedControlItem>
      <SegmentedControlItem value="unavailable" disabled>
        <Trans>Unavailable</Trans>
      </SegmentedControlItem>
    </SegmentedControl>
  )
}
