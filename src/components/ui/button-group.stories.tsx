import type { Meta, StoryObj } from '@storybook/react'
import ButtonGroup from './button-group'

const meta: Meta<typeof ButtonGroup> = {
  title: 'UI/ButtonGroup',
  component: ButtonGroup,

}

export default meta
type Story = StoryObj<typeof ButtonGroup>

export const Default: Story = {
  args: {
    buttons: [
      { label: 'Mint', onClick: () => {} },
      { label: 'Redeem', onClick: () => {} },
    ],
  },
}

export const ThreeOptions: Story = {
  args: {
    buttons: [
      { label: '1D', onClick: () => {} },
      { label: '7D', onClick: () => {} },
      { label: '30D', onClick: () => {} },
    ],
  },
}

export const StartSecond: Story = {
  args: {
    startActive: 1,
    buttons: [
      { label: 'Stake', onClick: () => {} },
      { label: 'Unstake', onClick: () => {} },
    ],
  },
}
