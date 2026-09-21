import type { Meta, StoryObj } from '@storybook/react-vite'
import { MoreHorizontal } from 'lucide-react'

import { IconButton } from '@/components/icon-button'

const meta = {
  title: 'Components/Icon button',
  parameters: {
    docs: {
      description: {
        component: '`@/components/icon-button`',
      },
    },
  },
  component: IconButton,
  args: {
    disabled: false,
    loading: false,
    icon: <MoreHorizontal aria-hidden="true" />,
    label: 'More actions',
    size: 'compact',
    tone: 'secondary',
  },
  argTypes: {
    icon: { control: false },
    size: { control: 'inline-radio', options: ['micro', 'compact', 'default'] },
    tone: {
      control: 'inline-radio',
      options: ['primary', 'secondary', 'quiet', 'destructive'],
    },
  },
} satisfies Meta<typeof IconButton>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Disabled: Story = {
  args: { disabled: true },
}

export const Loading: Story = { args: { loading: true } }
