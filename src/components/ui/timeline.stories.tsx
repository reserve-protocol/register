import type { Meta, StoryObj } from '@storybook/react'
import Timeline from './timeline'

const meta: Meta<typeof Timeline> = {
  title: 'UI/Timeline',
  component: Timeline,

}

export default meta
type Story = StoryObj<typeof Timeline>

export const Default: Story = {
  args: {
    items: [
      { title: 'Proposal created', isCompleted: true },
      { title: 'Voting period', isActive: true, rightText: '2 days left' },
      { title: 'Timelock delay' },
      { title: 'Execution' },
    ],
  },
}

export const AllCompleted: Story = {
  args: {
    items: [
      { title: 'Submit transaction', isCompleted: true },
      { title: 'Confirm on-chain', isCompleted: true },
      { title: 'Auction settled', isCompleted: true },
    ],
  },
}

export const AllPending: Story = {
  args: {
    items: [
      { title: 'Step 1' },
      { title: 'Step 2' },
      { title: 'Step 3' },
    ],
  },
}

export const WithChildren: Story = {
  args: {
    items: [
      { title: 'Deploy RToken', isCompleted: true },
      {
        title: 'Configure Governance',
        isActive: true,
        children: (
          <div className="text-sm text-muted-foreground">
            Set up voting parameters and roles.
          </div>
        ),
      },
      { title: 'Unpause' },
    ],
  },
}
