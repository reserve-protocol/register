import { PlaygroundDocs } from '../shared/playground-docs'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { ArrowLeft } from 'lucide-react'
import { Link } from '@/components/design-system-v1/link'
const meta = {
  title: 'Components/Actions/Link',
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
      page: () => <PlaygroundDocs interactive={Playground} />,
      description: {
        component:
          '`@/components/design-system-v1/link` · Navigation to routes, resources and content. Inline links inherit the reading type and stay underlined; standalone resource links use the 14px/500 label role; the named return link uses the 14px/300 supporting role with a leading arrow. Button-shaped navigation composes Button through `asChild`.',
      },
    },
  },
} satisfies Meta<typeof Link>
export default meta
type Story = StoryObj<typeof meta>
export const Playground: Story = {
  tags: ['!dev'],
}
export const Standalone: Story = {
  args: { treatment: 'standalone', children: 'Read the documentation' },
}
export const Return: Story = {
  args: { treatment: 'return' },
  render: (args) => (
    <Link {...args}>
      <ArrowLeft aria-hidden="true" className="size-4" />
      Back to Discover
    </Link>
  ),
}
export const External: Story = {
  args: {
    href: 'https://reserve.org',
    external: true,
    externalAnnouncement: 'opens in a new tab',
    children: 'Reserve',
  },
}
