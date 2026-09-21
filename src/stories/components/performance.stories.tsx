import type { Meta, StoryObj } from '@storybook/react-vite'
import { PerformanceValue } from '@/components/design-system-v1/performance-value'
const meta = {
  title: 'Components/Performance value',
  component: PerformanceValue,
  args: { periodLabel: '24 hour', value: 2.41 },
  argTypes: { value: { control: 'number' } },
  parameters: {
    docs: {
      description: {
        component:
          'Import PerformanceValue from @/components/design-system-v1/performance-value. Financial direction is distinct from task success/failure; null is missing data, not zero.',
      },
    },
  },
} satisfies Meta<typeof PerformanceValue>
export default meta
type Story = StoryObj<typeof meta>
export const Positive: Story = {}
export const Negative: Story = { args: { value: -36.43 } }
export const Zero: Story = { args: { value: 0 } }
export const Missing: Story = { args: { value: null } }
