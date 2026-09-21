import type { Meta, StoryObj } from '@storybook/react-vite'
import { useArgs } from 'storybook/preview-api'
import {
  Field,
  FieldLabel,
  FieldMessage,
  TextArea,
} from '@/components/design-system-v1/field'

const meta = {
  title: 'Components/Textarea',
  component: TextArea,
  args: {
    id: 'mandate-input',
    value: 'Maintain diversified exposure to established crypto assets.',
    disabled: false,
    readOnly: false,
    invalid: false,
  },
  argTypes: {
    value: { control: 'text' },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    invalid: { control: 'boolean' },
  },
  parameters: {
    docs: {
      description: {
        component: '`@/components/design-system-v1/field`',
      },
    },
  },
  render: function Render(args) {
    const [, updateArgs] = useArgs()
    return (
      <Field className="w-[min(28rem,90vw)]">
        <FieldLabel htmlFor={args.id}>Mandate</FieldLabel>
        <TextArea
          {...args}
          onChange={(event) => updateArgs({ value: event.currentTarget.value })}
          aria-describedby={args.invalid ? 'mandate-error' : undefined}
        />
        {args.invalid && (
          <FieldMessage id="mandate-error">
            Describe the portfolio mandate.
          </FieldMessage>
        )}
      </Field>
    )
  },
} satisfies Meta<typeof TextArea>
export default meta
type Story = StoryObj<typeof meta>
export const Playground: Story = {}
export const Invalid: Story = { args: { invalid: true, value: '' } }
export const ReadOnly: Story = { args: { readOnly: true } }
export const Disabled: Story = { args: { disabled: true } }
export const LongContent: Story = {
  args: {
    value:
      'Explain why this proposal improves the DTF mandate and how delegates should evaluate it.\n\nDescribe allocation limits, governance responsibilities and the conditions under which the portfolio should rebalance.\n\nKeep the decision and its supporting rationale readable when the field grows.',
  },
}
