import { Trans, useLingui } from '@lingui/react/macro'
import { useState } from 'react'

import { Button } from '@/components/button'
import { Link as DesignSystemLink } from '@/components/design-system-v1/link'
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@/components/design-system-v1/segmented-control'
import {
  Field,
  FieldLabel,
  TextArea,
  TextInput,
} from '@/components/design-system-v1/field'
import { MultiSelectFilter } from '@/components/design-system-v1/multi-select-filter'
import { SearchField } from '@/components/design-system-v1/search-field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/design-system-v1/select'
import DocumentationSpecimenCanvas from './documentation-specimen-canvas'
import {
  DocumentationSpecimenCell,
  DocumentationSpecimenGrid,
} from './documentation-specimen-layout'
import { useDocumentationSpecimenState } from './use-documentation-specimen-state'

const SELECT_SCHEMA = {
  family: {
    defaultValue: 'default',
    values: ['default', 'compact'],
  },
  state: {
    defaultValue: 'ready',
    values: ['ready', 'disabled'],
  },
} as const

export const FieldComponentSpecimen = ({ itemId }: { itemId: string }) => {
  const { t } = useLingui()
  const [query, setQuery] = useState('')
  const [chains, setChains] = useState(['ethereum'])
  const select = useDocumentationSpecimenState('select', SELECT_SCHEMA)

  if (itemId === 'input') {
    return (
      <DocumentationSpecimenGrid className="xl:grid-cols-2">
        <DocumentationSpecimenCell label={<Trans>Default</Trans>}>
          <Field className="w-full max-w-sm">
            <FieldLabel htmlFor="overview-text-input">
              <Trans>Token name</Trans>
            </FieldLabel>
            <TextInput
              id="overview-text-input"
              placeholder={t`Enter token name`}
            />
          </Field>
        </DocumentationSpecimenCell>
        <DocumentationSpecimenCell label={<Trans>Unavailable</Trans>}>
          <Field className="w-full max-w-sm">
            <FieldLabel htmlFor="overview-text-input-disabled">
              <Trans>Token name</Trans>
            </FieldLabel>
            <TextInput
              disabled
              id="overview-text-input-disabled"
              value="Reserve Index DTF"
              readOnly
            />
          </Field>
        </DocumentationSpecimenCell>
      </DocumentationSpecimenGrid>
    )
  }

  if (itemId === 'textarea') {
    return (
      <DocumentationSpecimenGrid className="xl:grid-cols-2">
        <DocumentationSpecimenCell label={<Trans>Default</Trans>}>
          <Field className="w-full max-w-lg">
            <FieldLabel htmlFor="overview-textarea">
              <Trans>Governance rationale</Trans>
            </FieldLabel>
            <TextArea
              id="overview-textarea"
              rows={3}
              placeholder={t`Explain the proposal`}
            />
          </Field>
        </DocumentationSpecimenCell>
        <DocumentationSpecimenCell label={<Trans>Unavailable</Trans>}>
          <Field className="w-full max-w-lg">
            <FieldLabel htmlFor="overview-textarea-disabled">
              <Trans>Governance rationale</Trans>
            </FieldLabel>
            <TextArea
              disabled
              id="overview-textarea-disabled"
              rows={3}
              value={t`Rationale already submitted`}
              readOnly
            />
          </Field>
        </DocumentationSpecimenCell>
      </DocumentationSpecimenGrid>
    )
  }

  if (itemId === 'select') {
    const href = `${select.href.split('#')[0]}#select`

    return (
      <DocumentationSpecimenCanvas
        host={{
          name: t`Neutral form`,
          backgroundOwner: t`Documentation neutral surface`,
          insetOwner: t`Documentation specimen region`,
        }}
        controls={{
          family: (
            <SegmentedControl
              aria-label={t`Select family`}
              presentation="text-only"
              size="compact"
              textOnlyDensity="compact"
              value={select.state.family}
              onValueChange={(value) =>
                select.setValue(
                  'family',
                  value as (typeof SELECT_SCHEMA.family.values)[number]
                )
              }
            >
              <SegmentedControlItem value="default">
                <Trans>Default</Trans>
              </SegmentedControlItem>
              <SegmentedControlItem value="compact">
                <Trans>Compact</Trans>
              </SegmentedControlItem>
            </SegmentedControl>
          ),
          state: (
            <SegmentedControl
              aria-label={t`Select state`}
              presentation="text-only"
              size="compact"
              textOnlyDensity="compact"
              value={select.state.state}
              onValueChange={(value) =>
                select.setValue(
                  'state',
                  value as (typeof SELECT_SCHEMA.state.values)[number]
                )
              }
            >
              <SegmentedControlItem value="ready">
                <Trans>Ready</Trans>
              </SegmentedControlItem>
              <SegmentedControlItem value="disabled">
                <Trans>Unavailable</Trans>
              </SegmentedControlItem>
            </SegmentedControl>
          ),
        }}
        reset={
          <Button
            disabled={select.isDefault}
            size="compact"
            tone="quiet"
            onClick={select.reset}
          >
            <Trans>Reset Select</Trans>
          </Button>
        }
        link={
          <DesignSystemLink href={href} treatment="standalone">
            <Trans>Open this state</Trans>
          </DesignSystemLink>
        }
        fallbacks={select.fallbacks}
        provenance={
          <Trans>
            Accepted Select owner rendered directly in a provider-free
            documentation specimen.
          </Trans>
        }
      >
        <DocumentationSpecimenGrid>
          <DocumentationSpecimenCell
            label={
              select.state.family === 'compact' ? (
                <Trans>Compact Select</Trans>
              ) : (
                <Trans>Default Select</Trans>
              )
            }
          >
            <Field className="w-full max-w-xs">
              <FieldLabel htmlFor="overview-select">
                <Trans>Chain</Trans>
              </FieldLabel>
              <Select defaultValue="ethereum">
                <SelectTrigger
                  id="overview-select"
                  disabled={select.state.state === 'disabled'}
                  size={select.state.family}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ethereum">Ethereum</SelectItem>
                  <SelectItem value="base">Base</SelectItem>
                  <SelectItem value="bsc">BNB Chain</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </DocumentationSpecimenCell>
        </DocumentationSpecimenGrid>
      </DocumentationSpecimenCanvas>
    )
  }

  if (itemId === 'multi-select-filter') {
    return (
      <DocumentationSpecimenGrid className="xl:grid-cols-2">
        <DocumentationSpecimenCell label={<Trans>Applied selection</Trans>}>
          <MultiSelectFilter
            accessibleLabel={t`Filter chains`}
            selected={chains}
            onApply={setChains}
            triggerContent={<Trans>Chains</Trans>}
            options={[
              { value: 'ethereum', label: 'Ethereum' },
              { value: 'base', label: 'Base' },
              { value: 'bsc', label: 'BNB Chain' },
            ]}
          />
        </DocumentationSpecimenCell>
        <DocumentationSpecimenCell label={<Trans>No selection</Trans>}>
          <MultiSelectFilter
            accessibleLabel={t`Filter statuses`}
            selected={[]}
            onApply={() => undefined}
            triggerContent={<Trans>Statuses</Trans>}
            options={[
              { value: 'active', label: t`Active` },
              { value: 'closed', label: t`Closed` },
            ]}
          />
        </DocumentationSpecimenCell>
      </DocumentationSpecimenGrid>
    )
  }

  if (itemId === 'search') {
    return (
      <DocumentationSpecimenGrid>
        <DocumentationSpecimenCell label={<Trans>Empty</Trans>}>
          <SearchField
            aria-label={t`Search tokens`}
            className="max-w-sm"
            placeholder={t`Search tokens`}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onClear={() => setQuery('')}
          />
        </DocumentationSpecimenCell>
        <DocumentationSpecimenCell label={<Trans>With a query</Trans>}>
          <SearchField
            aria-label={t`Search proposals`}
            className="max-w-sm"
            value="governance"
            onChange={() => undefined}
            onClear={() => undefined}
          />
        </DocumentationSpecimenCell>
        <DocumentationSpecimenCell label={<Trans>Unavailable</Trans>}>
          <SearchField
            disabled
            aria-label={t`Search unavailable`}
            className="max-w-sm"
            value=""
            onChange={() => undefined}
          />
        </DocumentationSpecimenCell>
      </DocumentationSpecimenGrid>
    )
  }

  return null
}
