import type { Meta, StoryObj } from '@storybook/react'
import ExplorerAddress from './explorer-address'
import { ExplorerDataType } from 'utils/getExplorerLink'

const meta: Meta<typeof ExplorerAddress> = {
  title: 'Components/ExplorerAddress',
  component: ExplorerAddress,
}

export default meta
type Story = StoryObj<typeof ExplorerAddress>

export const Ethereum: Story = {
  args: {
    address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    chain: 1,
  },
}

export const Base: Story = {
  args: {
    address: '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B',
    chain: 8453,
  },
}

export const Transaction: Story = {
  args: {
    address: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    chain: 1,
    type: ExplorerDataType.TRANSACTION,
  },
}
