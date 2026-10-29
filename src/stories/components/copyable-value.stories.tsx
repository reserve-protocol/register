import type { Meta, StoryObj } from '@storybook/react-vite'
import { CopyableValue } from '@/components/design-system-v1/copyable-value'
const meta = {
  title: 'Components/Data display/Copyable value',
  component: CopyableValue,
  args: {
    value: '0x0000000000000000000000000000000000000001',
    treatment: 'default',
    tone: 'primary',
  },
  argTypes: {
    treatment: { control: 'inline-radio', options: ['default', 'inline'] },
    tone: {
      control: 'inline-radio',
      options: ['primary', 'neutral'],
      if: { arg: 'treatment', eq: 'inline' },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          '`@/components/design-system-v1/copyable-value` · The default pairs the formatted value with a separate micro copy control. Dense 20px fact rows may use the inline treatment, where the whole value is one copy action. The full value is always what is copied and announced, and success appears only after the clipboard write completes.',
      },
    },
  },
} satisfies Meta<typeof CopyableValue>
export default meta
type Story = StoryObj<typeof meta>
export const SeparateAction: Story = {
  name: 'Separate action',
}
export const InlinePrimary: Story = {
  name: 'Inline primary',
  args: { treatment: 'inline' },
}
export const InlineNeutral: Story = {
  name: 'Inline neutral',
  args: { treatment: 'inline', tone: 'neutral' },
}
