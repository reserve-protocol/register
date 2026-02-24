import type { Meta, StoryObj } from '@storybook/react'
import TransactionError from './TransactionError'

const meta: Meta<typeof TransactionError> = {
  title: 'Components/TransactionError',
  component: TransactionError,
}

export default meta
type Story = StoryObj<typeof TransactionError>

export const Default: Story = {
  args: {
    error: new Error('User rejected the request.'),
  },
}

export const WithoutName: Story = {
  args: {
    error: new Error('Insufficient funds for gas * price + value'),
    withName: false,
  },
}

export const ContractError: Story = {
  args: {
    error: new Error(
      'execution reverted: 0x168cdd18\nsome additional context'
    ),
  },
}

export const LongError: Story = {
  args: {
    error: new Error(
      'The transaction has been reverted by the EVM with the following reason: Cannot execute proposal while rebalancing is in progress. Please wait for the current rebalance to complete.'
    ),
  },
}

export const NoError: Story = {
  args: {
    error: null,
  },
}
