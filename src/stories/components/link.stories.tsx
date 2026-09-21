import type { Meta, StoryObj } from '@storybook/react-vite'
import { Link } from '@/components/design-system-v1/link'
const meta = {
  title: 'Components/Link',
  component: Link,
  args: {
    href: '#governance',
    children: 'View governance',
    treatment: 'inline',
  },
  argTypes: {
    treatment: {
      control: 'select',
      options: ['inline', 'standalone', 'return', 'contextual'],
    },
  },
  parameters: {
    docs: {
      description: {
        component: '`@/components/design-system-v1/link`',
      },
    },
  },
} satisfies Meta<typeof Link>
export default meta
type Story = StoryObj<typeof meta>
export const Playground: Story = {}
export const Return: Story = {
  args: { treatment: 'return', children: 'Back to Discover' },
}
export const External: Story = {
  args: {
    href: 'https://reserve.org',
    external: true,
    externalAnnouncement: 'opens in a new tab',
    children: 'Reserve',
  },
}
export const Unavailable: Story = {
  render: () => (
    <span className="text-muted-foreground">Governance unavailable</span>
  ),
}
