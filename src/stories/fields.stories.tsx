import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import {
  AddressTextInput,
  Field,
  FieldDescription,
  FieldLabel,
  FieldMessage,
  TextArea,
  TextInput,
} from '@/components/design-system-v1/field'
import { MultiSelectFilter } from '@/components/design-system-v1/multi-select-filter'
import { PresetOrCustomField } from '@/components/design-system-v1/preset-or-custom-field'
import { SearchField } from '@/components/design-system-v1/search-field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/design-system-v1/select'

const meta = {
  title: 'Components/Text input',
  parameters: {
    docs: {
      description: {
        component: '`@/components/design-system-v1/field`',
      },
    },
  },
  component: TextInput,
  args: {
    'aria-label': 'Token name',
    disabled: false,
    invalid: false,
    placeholder: 'Token name',
    readOnly: false,
  },
  argTypes: {
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
    readOnly: { control: 'boolean' },
  },
} satisfies Meta<typeof TextInput>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  decorators: [
    (Story) => (
      <div className="w-[min(28rem,90vw)]">
        <Story />
      </div>
    ),
  ],
}

const FieldStates = () => {
  const [query, setQuery] = useState('ETH')
  const [networks, setNetworks] = useState(['ethereum'])

  return (
    <div className="grid gap-8 lg:grid-cols-2" data-testid="fields-story">
      <div className="space-y-6">
        <Field>
          <FieldLabel htmlFor="token-name">Token name</FieldLabel>
          <TextInput id="token-name" defaultValue="Large Cap Index" />
          <FieldDescription>
            The public name shown across the app.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="token-address">Token address</FieldLabel>
          <AddressTextInput
            id="token-address"
            defaultValue="0x0000000000000000000000000000000000000001"
            readOnly
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="allocation">Allocation</FieldLabel>
          <TextInput
            id="allocation"
            invalid
            aria-describedby="allocation-error"
            defaultValue="110"
            trailing="%"
          />
          <FieldMessage id="allocation-error">
            Enter a value between 0 and 100.
          </FieldMessage>
        </Field>
        <Field>
          <FieldLabel htmlFor="mandate">Mandate</FieldLabel>
          <TextArea
            id="mandate"
            defaultValue="Explain why this proposal improves the DTF mandate and how delegates should evaluate it."
          />
        </Field>
      </div>

      <div className="space-y-6">
        <Field>
          <FieldLabel htmlFor="search-assets">Search assets</FieldLabel>
          <SearchField
            id="search-assets"
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            onClear={() => setQuery('')}
          />
        </Field>
        <Field>
          <FieldLabel id="network-label">Network</FieldLabel>
          <Select defaultValue="base">
            <SelectTrigger aria-labelledby="network-label" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ethereum">Ethereum</SelectItem>
              <SelectItem value="base">Base</SelectItem>
              <SelectItem value="bsc">BNB Smart Chain</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel>Network filters</FieldLabel>
          <MultiSelectFilter
            accessibleLabel="Choose networks"
            minSelected={1}
            selected={networks}
            onApply={setNetworks}
            triggerContent={`${networks.length} selected`}
            options={[
              { value: 'ethereum', label: 'Ethereum' },
              { value: 'base', label: 'Base' },
              { value: 'bsc', label: 'BNB Smart Chain' },
            ]}
          />
        </Field>
        <Field>
          <FieldLabel>Revenue share</FieldLabel>
          <PresetOrCustomField
            accessibleLabel="Revenue share presets"
            customAriaLabel="Custom revenue share"
            customPlaceholder="Custom"
            defaultValue="10"
            options={[
              { value: '5', label: '5%' },
              { value: '10', label: '10%' },
              { value: '20', label: '20%' },
            ]}
            trailing="%"
          />
        </Field>
      </div>
    </div>
  )
}

export const States: Story = {
  parameters: { controls: { disable: true }, layout: 'padded' },
  render: () => <FieldStates />,
}
