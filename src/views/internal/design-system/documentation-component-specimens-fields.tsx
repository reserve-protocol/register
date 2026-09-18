import { Trans, useLingui } from '@lingui/react/macro'
import { useState } from 'react'

import {
  Field,
  FieldDescription,
  FieldLabel,
  FieldMessage,
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
import ChainLogo from '@/components/icons/ChainLogo'
import { ChainId } from '@/utils/chains'
import {
  DocumentationSpecimenCell,
  DocumentationSpecimenGrid,
} from './documentation-specimen-layout'

export const FieldComponentSpecimen = ({ itemId }: { itemId: string }) => {
  const { t } = useLingui()
  const [query, setQuery] = useState('governance')
  const [chains, setChains] = useState(['ethereum'])
  const [statuses, setStatuses] = useState<string[]>([])
  const [requiredChains, setRequiredChains] = useState(['ethereum'])

  if (itemId === 'input') {
    return (
      <DocumentationSpecimenGrid>
        <DocumentationSpecimenCell label={<Trans>Empty with help</Trans>}>
          <Field className="w-full max-w-md">
            <FieldLabel htmlFor="overview-text-input">
              <Trans>Token name</Trans>
            </FieldLabel>
            <TextInput
              id="overview-text-input"
              placeholder={t`Enter token name`}
              aria-describedby="overview-text-input-help"
            />
            <FieldDescription id="overview-text-input-help">
              <Trans>The public name shown across the app.</Trans>
            </FieldDescription>
          </Field>
        </DocumentationSpecimenCell>
        <DocumentationSpecimenCell label={<Trans>Filled</Trans>}>
          <Field className="w-full max-w-md">
            <FieldLabel htmlFor="overview-text-input-filled">
              <Trans>Token symbol</Trans>
            </FieldLabel>
            <TextInput id="overview-text-input-filled" defaultValue="CMC20" />
          </Field>
        </DocumentationSpecimenCell>
        <DocumentationSpecimenCell label={<Trans>Focus visible</Trans>}>
          <Field className="w-full max-w-md">
            <FieldLabel htmlFor="overview-text-input-focus">
              <Trans>Token symbol</Trans>
            </FieldLabel>
            <TextInput
              id="overview-text-input-focus"
              data-documentation-state="focus-visible"
              defaultValue="CMC20"
              className="ring-2 ring-ring ring-offset-2 ring-offset-card"
            />
          </Field>
        </DocumentationSpecimenCell>
        <DocumentationSpecimenCell label={<Trans>Invalid</Trans>}>
          <Field className="w-full max-w-md">
            <FieldLabel htmlFor="overview-text-input-invalid">
              <Trans>Wallet address</Trans>
            </FieldLabel>
            <TextInput
              id="overview-text-input-invalid"
              defaultValue="0x83a1"
              invalid
              aria-describedby="overview-text-input-error"
              aria-errormessage="overview-text-input-error"
            />
            <FieldMessage id="overview-text-input-error">
              <Trans>Enter a valid wallet address.</Trans>
            </FieldMessage>
          </Field>
        </DocumentationSpecimenCell>
        <DocumentationSpecimenCell label={<Trans>Read-only</Trans>}>
          <Field className="w-full max-w-md">
            <FieldLabel htmlFor="overview-text-input-readonly">
              <Trans>Governor</Trans>
            </FieldLabel>
            <TextInput
              id="overview-text-input-readonly"
              value="0x6B17…1d0F"
              readOnly
            />
          </Field>
        </DocumentationSpecimenCell>
        <DocumentationSpecimenCell label={<Trans>Unavailable</Trans>}>
          <Field className="w-full max-w-md">
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
        <DocumentationSpecimenCell label={<Trans>Multiline</Trans>}>
          <Field className="w-full max-w-2xl">
            <FieldLabel htmlFor="overview-textarea">
              <Trans>Governance rationale</Trans>
            </FieldLabel>
            <TextArea
              id="overview-textarea"
              defaultValue={t`Explain why this proposal improves the DTF mandate and how delegates should evaluate it.`}
              aria-describedby="overview-textarea-help"
            />
            <FieldDescription id="overview-textarea-help">
              <Trans>Visible to delegates before they vote.</Trans>
            </FieldDescription>
          </Field>
        </DocumentationSpecimenCell>
        <DocumentationSpecimenCell label={<Trans>Invalid</Trans>}>
          <Field className="w-full max-w-2xl">
            <FieldLabel htmlFor="overview-textarea-invalid">
              <Trans>Deployment summary</Trans>
            </FieldLabel>
            <TextArea
              id="overview-textarea-invalid"
              invalid
              defaultValue={t`Missing required risk controls.`}
              aria-describedby="overview-textarea-error"
              aria-errormessage="overview-textarea-error"
            />
            <FieldMessage id="overview-textarea-error">
              <Trans>Describe the intended risk controls.</Trans>
            </FieldMessage>
          </Field>
        </DocumentationSpecimenCell>
        <DocumentationSpecimenCell label={<Trans>Read-only</Trans>}>
          <Field className="w-full max-w-2xl">
            <FieldLabel htmlFor="overview-textarea-readonly">
              <Trans>Submitted rationale</Trans>
            </FieldLabel>
            <TextArea
              id="overview-textarea-readonly"
              readOnly
              value={t`This rationale is locked after submission.`}
            />
          </Field>
        </DocumentationSpecimenCell>
        <DocumentationSpecimenCell label={<Trans>Unavailable</Trans>}>
          <Field className="w-full max-w-2xl">
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
    return (
      <DocumentationSpecimenGrid>
        <DocumentationSpecimenCell label={<Trans>Placeholder</Trans>}>
          <Field className="w-full max-w-sm">
            <FieldLabel htmlFor="overview-select-placeholder">
              <Trans>Chain</Trans>
            </FieldLabel>
            <Select>
              <SelectTrigger id="overview-select-placeholder">
                <SelectValue placeholder={t`Choose a chain`} />
              </SelectTrigger>
              <ChainSelectOptions />
            </Select>
          </Field>
        </DocumentationSpecimenCell>
        <DocumentationSpecimenCell label={<Trans>Selected</Trans>}>
          <Field className="w-full max-w-sm">
            <FieldLabel htmlFor="overview-select-selected">
              <Trans>Created</Trans>
            </FieldLabel>
            <Select defaultValue="7d">
              <SelectTrigger id="overview-select-selected">
                <SelectValue />
              </SelectTrigger>
              <DateSelectOptions />
            </Select>
          </Field>
        </DocumentationSpecimenCell>
        <DocumentationSpecimenCell label={<Trans>Unavailable</Trans>}>
          <Field className="w-full max-w-sm">
            <FieldLabel htmlFor="overview-select-disabled">
              <Trans>Created</Trans>
            </FieldLabel>
            <Select defaultValue="7d" disabled>
              <SelectTrigger
                id="overview-select-disabled"
                aria-label={t`Unavailable range`}
              >
                <SelectValue />
              </SelectTrigger>
              <DateSelectOptions />
            </Select>
          </Field>
        </DocumentationSpecimenCell>
        <DocumentationSpecimenCell label={<Trans>Compact utility</Trans>}>
          <div className="flex w-full max-w-sm items-center justify-between gap-4 text-sm text-muted-foreground">
            <span>
              <Trans>Rows per page</Trans>
            </span>
            <Select defaultValue="25">
              <SelectTrigger
                aria-label={t`Rows per page`}
                size="compact"
                className="w-[70px]"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {['10', '25', '50', '100'].map((value) => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </DocumentationSpecimenCell>
        <DocumentationSpecimenCell label={<Trans>Leading identity</Trans>}>
          <Field className="w-full max-w-sm">
            <FieldLabel htmlFor="overview-select-identity">
              <Trans>Chain</Trans>
            </FieldLabel>
            <Select defaultValue="ethereum">
              <SelectTrigger id="overview-select-identity">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  value="ethereum"
                  leadingVisual={<ChainLogo chain={ChainId.Mainnet} />}
                >
                  Ethereum
                </SelectItem>
                <SelectItem
                  value="base"
                  leadingVisual={<ChainLogo chain={ChainId.Base} />}
                >
                  Base
                </SelectItem>
                <SelectItem
                  value="bsc"
                  leadingVisual={<ChainLogo chain={ChainId.BSC} />}
                >
                  BNB Chain
                </SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </DocumentationSpecimenCell>
      </DocumentationSpecimenGrid>
    )
  }

  if (itemId === 'multi-select-filter') {
    return (
      <DocumentationSpecimenGrid>
        <DocumentationSpecimenCell label={<Trans>Applied selection</Trans>}>
          <MultiSelectFilter
            accessibleLabel={t`Filter chains`}
            selected={chains}
            onApply={setChains}
            triggerContent={
              chains.length === 0
                ? t`All networks`
                : chains.length === 1
                  ? t`1 network`
                  : t`${chains.length} networks`
            }
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
            selected={statuses}
            onApply={setStatuses}
            triggerContent={
              statuses.length === 0
                ? t`All statuses`
                : statuses.length === 1
                  ? t`1 status`
                  : t`${statuses.length} statuses`
            }
            options={[
              { value: 'active', label: t`Active` },
              { value: 'closed', label: t`Closed` },
            ]}
          />
        </DocumentationSpecimenCell>
        <DocumentationSpecimenCell label={<Trans>Required selection</Trans>}>
          <MultiSelectFilter
            accessibleLabel={t`Filter required networks`}
            minSelected={1}
            selected={requiredChains}
            onApply={setRequiredChains}
            triggerContent={t`Ethereum`}
            options={[
              { value: 'ethereum', label: 'Ethereum' },
              { value: 'base', label: 'Base' },
              { value: 'bsc', label: 'BNB Chain', disabled: true },
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
          />
        </DocumentationSpecimenCell>
        <DocumentationSpecimenCell label={<Trans>Clearable query</Trans>}>
          <SearchField
            aria-label={t`Search proposals`}
            className="max-w-sm"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onClear={() => setQuery('')}
          />
        </DocumentationSpecimenCell>
        <DocumentationSpecimenCell label={<Trans>Focus visible</Trans>}>
          <SearchField
            aria-label={t`Focused search`}
            className="max-w-sm ring-2 ring-ring ring-offset-2 ring-offset-card"
            data-documentation-state="focus-visible"
            value="reserve"
            readOnly
          />
        </DocumentationSpecimenCell>
        <DocumentationSpecimenCell label={<Trans>No results</Trans>}>
          <div className="w-full max-w-sm space-y-2">
            <SearchField
              aria-label={t`Search with no results`}
              value="reserve btc"
              readOnly
            />
            <p role="status" className="text-sm text-muted-foreground">
              <Trans>No matching tokens</Trans>
            </p>
          </div>
        </DocumentationSpecimenCell>
        <DocumentationSpecimenCell label={<Trans>Loading</Trans>}>
          <SearchField
            aria-label={t`Search loading`}
            className="max-w-sm"
            value="coinmarketcap"
            loading
            onChange={() => undefined}
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

const ChainSelectOptions = () => (
  <SelectContent>
    <SelectItem value="ethereum">Ethereum</SelectItem>
    <SelectItem value="base">Base</SelectItem>
    <SelectItem value="bsc">BNB Chain</SelectItem>
  </SelectContent>
)

const DateSelectOptions = () => (
  <SelectContent>
    <SelectItem value="all">
      <Trans>All time</Trans>
    </SelectItem>
    <SelectItem value="24h">
      <Trans>Last 24 hours</Trans>
    </SelectItem>
    <SelectItem value="7d">
      <Trans>Last 7 days</Trans>
    </SelectItem>
    <SelectItem value="30d">
      <Trans>Last 30 days</Trans>
    </SelectItem>
  </SelectContent>
)
