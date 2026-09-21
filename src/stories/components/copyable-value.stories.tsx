import type { Meta, StoryObj } from '@storybook/react-vite'
import { CopyableValue } from '@/components/design-system-v1/copyable-value'
const meta = {
  title: 'Components/Copyable value',
  component: CopyableValue,
  args: {
    value: '0x0000000000000000000000000000000000000001',
    treatment: 'default',
    tone: 'primary',
  },
  argTypes: {
    treatment: { control: 'inline-radio', options: ['default', 'inline'] },
    tone: { control: 'inline-radio', options: ['primary', 'neutral'] },
  },
  parameters: {
    docs: {
      description: {
        component: '`@/components/design-system-v1/copyable-value`',
      },
    },
  },
} satisfies Meta<typeof CopyableValue>
export default meta
type Story = StoryObj<typeof meta>
export const SeparateAction: Story = {}
export const InlinePrimary: Story = { args: { treatment: 'inline' } }
export const InlineNeutral: Story = {
  args: { treatment: 'inline', tone: 'neutral' },
}
