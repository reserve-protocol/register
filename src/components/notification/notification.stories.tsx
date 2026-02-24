import type { Meta, StoryObj } from '@storybook/react'
import Notification from '.'
import { CheckCircle, AlertCircle, Info } from 'lucide-react'

const meta: Meta<typeof Notification> = {
  title: 'Components/Notification',
  component: Notification,
}

export default meta
type Story = StoryObj<typeof Notification>

export const Default: Story = {
  args: {
    title: 'Transaction submitted',
    subtitle: 'Your mint transaction is being confirmed.',
  },
}

export const Success: Story = {
  args: {
    title: 'Transaction confirmed',
    subtitle: 'You minted 100 eUSD successfully.',
    icon: <CheckCircle className="text-green-500" size={20} />,
  },
}

export const Error: Story = {
  args: {
    title: 'Transaction failed',
    subtitle: 'Insufficient balance for this operation.',
    icon: <AlertCircle className="text-destructive" size={20} />,
  },
}

export const TitleOnly: Story = {
  args: {
    title: 'Copied to clipboard',
  },
}

export const WithInfo: Story = {
  args: {
    title: 'New governance proposal',
    subtitle: 'Proposal #42 is now open for voting.',
    icon: <Info className="text-primary" size={20} />,
  },
}
