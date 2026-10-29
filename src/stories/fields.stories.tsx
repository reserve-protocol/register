import { PlaygroundDocs } from './shared/playground-docs'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Wallet } from 'lucide-react'

import {
  AddressTextInput,
  Field,
  FieldDescription,
  FieldLabel,
  FieldMessage,
  TextInput,
} from '@/components/design-system-v1/field'

const meta = {
  title: 'Components/Fields and selection/Text input',
  parameters: {
    docs: {
      page: () => <PlaygroundDocs interactive={Playground} />,
      description: {
        component:
          "`@/components/design-system-v1/field` · Short single values: a visible 14px/500 label, 16px/300 entered value, 14px/300 help and error text, and a 44px fully rounded control. Labels and help align to the control's outer edge. Read-only fields stay context-neutral (no automatic lock icon); disabled fields keep their visible value.",
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
  tags: ['!dev'],
  decorators: [
    (Story) => (
      <div className="w-[min(28rem,90vw)]">
        <Story />
      </div>
    ),
  ],
}

const FieldStates = () => (
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
        <FieldLabel htmlFor="recipient">Recipient</FieldLabel>
        <TextInput
          id="recipient"
          leading={<Wallet aria-hidden="true" />}
          placeholder="0x…"
        />
      </Field>
    </div>

    <div className="space-y-6">
      <Field>
        <FieldLabel htmlFor="token-address">Token address</FieldLabel>
        <AddressTextInput
          id="token-address"
          defaultValue="0x0000000000000000000000000000000000000001"
          readOnly
        />
        <FieldDescription>
          Read-only: set when the DTF was deployed.
        </FieldDescription>
      </Field>
      <Field>
        <FieldLabel htmlFor="ticker">Ticker</FieldLabel>
        <TextInput id="ticker" defaultValue="LCAP" disabled />
        <FieldDescription>
          Disabled while a proposal is pending.
        </FieldDescription>
      </Field>
    </div>
  </div>
)

export const States: Story = {
  parameters: { controls: { disable: true }, layout: 'padded' },
  render: () => <FieldStates />,
}
