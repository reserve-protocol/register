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
        component: '`@/components/design-system-v1/organic-brand-surface`',
      },
    },
  },
} satisfies Meta<typeof OrganicBrandSurface>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Deep: Story = { args: { tone: 'deep' } }
