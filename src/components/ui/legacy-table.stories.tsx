import type { Meta, StoryObj } from '@storybook/react'
import { Table as LegacyTable } from './legacy-table'
import type { ColumnDef } from '@tanstack/react-table'

type Transaction = {
  hash: string
  type: string
  amount: string
  date: string
}

const sampleData: Transaction[] = [
  { hash: '0xabc...123', type: 'Mint', amount: '1,000 eUSD', date: '2024-01-15' },
  { hash: '0xdef...456', type: 'Redeem', amount: '500 eUSD', date: '2024-01-14' },
  { hash: '0xghi...789', type: 'Stake', amount: '10,000 RSR', date: '2024-01-13' },
  { hash: '0xjkl...012', type: 'Unstake', amount: '5,000 RSR', date: '2024-01-12' },
  { hash: '0xmno...345', type: 'Claim', amount: '250 RSR', date: '2024-01-11' },
]

const columns: ColumnDef<Transaction>[] = [
  { accessorKey: 'hash', header: 'Hash' },
  { accessorKey: 'type', header: 'Type' },
  { accessorKey: 'amount', header: 'Amount' },
  { accessorKey: 'date', header: 'Date' },
]

const meta: Meta<typeof LegacyTable> = {
  title: 'UI/LegacyTable',
  component: LegacyTable,

  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Legacy table wrapper. Prefer DataTable for new code.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof LegacyTable>

export const Default: Story = {
  render: () => <LegacyTable columns={columns} data={sampleData} />,
}

export const WithPagination: Story = {
  render: () => (
    <LegacyTable
      columns={columns}
      data={sampleData}
      pagination={{ pageSize: 3 }}
    />
  ),
}

export const Loading: Story = {
  render: () => <LegacyTable columns={columns} data={[]} isLoading />,
}

export const Empty: Story = {
  render: () => <LegacyTable columns={columns} data={[]} />,
}
