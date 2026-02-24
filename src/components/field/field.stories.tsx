import type { Meta, StoryObj } from '@storybook/react'
import { Field, FieldInput } from '.'
import { withBaseProviders } from '../../../.storybook/decorators/providers'
import { Input } from '@/components/ui/input'

const meta: Meta<typeof Field> = {
  title: 'Components/Field',
  component: Field,
  decorators: [withBaseProviders],
}

export default meta
type Story = StoryObj<typeof Field>

export const Default: Story = {
  render: () => (
    <div className="w-80">
      <Field label="Token name">
        <Input placeholder="Enter token name" />
      </Field>
    </div>
  ),
}

export const Required: Story = {
  render: () => (
    <div className="w-80">
      <Field label="Symbol" required>
        <Input placeholder="e.g. eUSD" />
      </Field>
    </div>
  ),
}

export const WithHelp: Story = {
  render: () => (
    <div className="w-80">
      <Field label="Backing buffer" help="Percentage of extra collateral held before forwarding to revenue traders.">
        <Input placeholder="0.05" />
      </Field>
    </div>
  ),
}

export const Strong: Story = {
  render: () => (
    <div className="w-80">
      <Field label="Auction length" strong>
        <Input placeholder="900" />
      </Field>
    </div>
  ),
}

export const FieldInputDefault: Story = {
  name: 'FieldInput',
  render: () => (
    <div className="w-80">
      <FieldInput name="demo" placeholder="Enter value" />
    </div>
  ),
}

export const FieldInputWithError: Story = {
  name: 'FieldInput with error',
  render: () => (
    <div className="w-80">
      <FieldInput name="demo" placeholder="Enter value" error="This field is required" />
    </div>
  ),
}

export const FieldInputTextarea: Story = {
  name: 'FieldInput textarea',
  render: () => (
    <div className="w-80">
      <FieldInput name="demo" textarea placeholder="Enter description..." />
    </div>
  ),
}
