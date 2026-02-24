import type { Meta, StoryObj } from '@storybook/react'
import ProgressBar from '.'

const meta: Meta<typeof ProgressBar> = {
  title: 'Components/ProgressBar',
  component: ProgressBar,
  parameters: { layout: 'padded' },
}

export default meta
type Story = StoryObj<typeof ProgressBar>

export const Default: Story = {
  render: () => (
    <div className="w-[500px]">
      <ProgressBar percentage={45} />
    </div>
  ),
}

export const WithText: Story = {
  render: () => (
    <div className="w-[500px]">
      <ProgressBar
        percentage={65}
        foregroundText="Current progress"
        backgroundText="Target: 100%"
      />
    </div>
  ),
}

export const Completed: Story = {
  render: () => (
    <div className="w-[500px]">
      <ProgressBar
        percentage={100}
        foregroundText="Rebalance complete"
      />
    </div>
  ),
}

export const LowProgress: Story = {
  render: () => (
    <div className="w-[500px]">
      <ProgressBar
        percentage={5}
        foregroundText="Just started"
        backgroundText="Remaining"
      />
    </div>
  ),
}

export const AllStates: Story = {
  render: () => (
    <div className="w-[500px] space-y-4">
      <ProgressBar percentage={0} foregroundText="Empty" />
      <ProgressBar percentage={5} foregroundText="5%" />
      <ProgressBar percentage={25} foregroundText="25%" />
      <ProgressBar percentage={50} foregroundText="50%" />
      <ProgressBar percentage={75} foregroundText="75%" backgroundText="Target" />
      <ProgressBar percentage={100} foregroundText="Done" />
    </div>
  ),
}
