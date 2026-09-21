import type { Meta, StoryObj } from '@storybook/react-vite'
import { PresetOrCustomField } from '@/components/design-system-v1/preset-or-custom-field'
const meta = {
  title: 'Components/Preset or custom',
  component: PresetOrCustomField,
  args: {
    accessibleLabel: 'Revenue share',
    customAriaLabel: 'Custom revenue share',
    customPlaceholder: 'Custom',
    defaultValue: '10',
    trailing: '%',
    invalid: false,
    options: [
      { value: '5', label: '5%' },
      { value: '10', label: '10%' },
      { value: '20', label: '20%' },
    ],
  },
  argTypes: { invalid: { control: 'boolean' } },
  parameters: {
    docs: {
      description: {
        component:
          'Import PresetOrCustomField from @/components/design-system-v1/preset-or-custom-field. Choosing Custom moves focus into the input; validation remains caller-owned.',
      },
    },
  },
} satisfies Meta<typeof PresetOrCustomField>
export default meta
type Story = StoryObj<typeof meta>
export const Preset: Story = {}
export const Custom: Story = { args: { defaultValue: '12.5' } }
export const Invalid: Story = {
  args: {
    defaultValue: '110',
    invalid: true,
    message: 'Enter a value between 0 and 100.',
  },
}
