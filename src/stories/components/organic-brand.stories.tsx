import type { Meta, StoryObj } from '@storybook/react-vite'
import { OrganicBrandSurface } from '@/components/design-system-v1/organic-brand-surface'
const meta = {
  title: 'Foundations/Organic brand',
  component: OrganicBrandSurface,
  args: { tone: 'default', className: 'h-80 w-[min(48rem,90vw)]' },
  argTypes: {
    tone: { control: 'inline-radio', options: ['default', 'deep'] },
    className: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          '`@/components/design-system-v1/organic-brand-surface` · **Made for transaction success screens**: the moment right after a transaction completes. It is not a general page, header or card background, and pending or delayed states keep the normal shell. It is decorative and `aria-hidden`; with reduced motion the colour fields hold still.',
      },
    },
  },
} satisfies Meta<typeof OrganicBrandSurface>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = { name: 'Transaction success' }
export const Deep: Story = {
  name: 'Transaction success, deep',
  args: { tone: 'deep' },
  parameters: {
    docs: {
      description: {
        story:
          'Dark theme only: a deeper tone behind an attached outcome region. In light theme it matches the default.',
      },
    },
  },
}
