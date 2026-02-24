import type { Meta, StoryObj } from '@storybook/react'
import { Link } from './link'
import { ExternalLink } from 'lucide-react'

const meta: Meta<typeof Link> = {
  title: 'UI/Link',
  component: Link,

}

export default meta
type Story = StoryObj<typeof Link>

export const Default: Story = {
  args: {
    href: 'https://reserve.org',
    children: 'Reserve Protocol',
  },
}

export const WithIcon: Story = {
  args: {
    href: 'https://reserve.org',
    children: (
      <>
        View on Explorer
        <ExternalLink size={14} />
      </>
    ),
  },
}
