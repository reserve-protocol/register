import type { Meta, StoryObj } from '@storybook/react-vite'
import { PerformanceValue } from '@/components/design-system-v1/performance-value'
import { v1Typography as type } from '@/components/design-system-v1/typography'
const meta = {
  title: 'Components/Data display/Performance value',
  component: PerformanceValue,
  args: { periodLabel: '24 hour', value: 2.41 },
  argTypes: { value: { control: 'number' } },
  parameters: {
    docs: {
      description: {
        component:
          '`@/components/design-system-v1/performance-value` · A signed percentage with direction shown by sign and colour; screen readers hear the period and direction. `null` means missing data; zero is a known value. The 14px label size suits navigation and compact rows; table and card cells set it to body (16px light) to match their other values.',
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
export const TableCell: Story = {
  name: 'Table cell',
  args: { periodLabel: '7 day', value: 3.27, className: type.body },
}
