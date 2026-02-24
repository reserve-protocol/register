import type { Meta, StoryObj } from '@storybook/react'
import DataTable, { SorteableButton } from './data-table'
import type { ColumnDef } from '@tanstack/react-table'

type Token = {
  name: string
  symbol: string
  price: number
  change: number
  mcap: string
}

const sampleData: Token[] = [
  { name: 'USD Coin', symbol: 'USDC', price: 1.0, change: 0.01, mcap: '$32B' },
  { name: 'Tether', symbol: 'USDT', price: 1.0, change: -0.02, mcap: '$83B' },
  { name: 'Dai', symbol: 'DAI', price: 1.0, change: 0.03, mcap: '$5B' },
  { name: 'Reserve Rights', symbol: 'RSR', price: 0.005, change: 2.4, mcap: '$250M' },
  { name: 'Ethereum', symbol: 'ETH', price: 3200, change: -1.2, mcap: '$385B' },
  { name: 'Frax', symbol: 'FRAX', price: 1.0, change: 0.0, mcap: '$800M' },
  { name: 'Liquity USD', symbol: 'LUSD', price: 1.01, change: 0.5, mcap: '$400M' },
  { name: 'Savings Dai', symbol: 'sDAI', price: 1.05, change: 0.1, mcap: '$2B' },
  { name: 'Compound USDC', symbol: 'cUSDCv3', price: 1.02, change: 0.02, mcap: '$1B' },
  { name: 'Aave USDC', symbol: 'aUSDC', price: 1.01, change: 0.01, mcap: '$3B' },
  { name: 'Wrapped Bitcoin', symbol: 'WBTC', price: 63000, change: -0.8, mcap: '$12B' },
  { name: 'Staked ETH', symbol: 'stETH', price: 3195, change: -1.1, mcap: '$30B' },
]

const columns: ColumnDef<Token>[] = [
  {
    accessorKey: 'symbol',
    header: 'Token',
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue('symbol')}</span>
    ),
  },
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'price',
    header: ({ column }) => (
      <SorteableButton column={column}>Price</SorteableButton>
    ),
    cell: ({ row }) => {
      const price = row.getValue('price') as number
      return `$${price.toLocaleString()}`
    },
  },
  {
    accessorKey: 'change',
    header: ({ column }) => (
      <SorteableButton column={column}>24h</SorteableButton>
    ),
    cell: ({ row }) => {
      const change = row.getValue('change') as number
      return (
        <span className={change >= 0 ? 'text-success' : 'text-destructive'}>
          {change >= 0 ? '+' : ''}
          {change}%
        </span>
      )
    },
  },
  {
    accessorKey: 'mcap',
    header: 'Market Cap',
    meta: { className: 'text-right' },
    cell: ({ row }) => (
      <div className="text-right">{row.getValue('mcap')}</div>
    ),
  },
]

const meta: Meta<typeof DataTable<Token, unknown>> = {
  title: 'UI/DataTable',
  component: DataTable,

  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof DataTable<Token, unknown>>

export const Default: Story = {
  render: () => (
    <DataTable columns={columns} data={sampleData.slice(0, 5)} />
  ),
}

export const WithSorting: Story = {
  render: () => (
    <DataTable
      columns={columns}
      data={sampleData}
      initialSorting={[{ id: 'price', desc: true }]}
    />
  ),
}

export const WithPagination: Story = {
  render: () => (
    <DataTable
      columns={columns}
      data={sampleData}
      pagination={{ pageSize: 5 }}
    />
  ),
}

export const Empty: Story = {
  render: () => <DataTable columns={columns} data={[]} />,
}

export const Loading: Story = {
  render: () => <DataTable columns={columns} data={[]} loading />,
}

export const Expandable: Story = {
  render: () => (
    <DataTable
      columns={columns}
      data={sampleData.slice(0, 4)}
      renderSubComponent={({ row }) => (
        <div className="p-4 text-sm text-muted-foreground">
          Full name: {row.original.name} ({row.original.symbol})
          <br />
          Market cap: {row.original.mcap}
        </div>
      )}
    />
  ),
}

export const SingleExpand: Story = {
  render: () => (
    <DataTable
      columns={columns}
      data={sampleData.slice(0, 4)}
      allowMultipleExpand={false}
      renderSubComponent={({ row }) => (
        <div className="p-4 text-sm text-muted-foreground">
          Only one row can be expanded at a time. Token: {row.original.symbol}
        </div>
      )}
    />
  ),
}

export const StickyHeader: Story = {
  render: () => (
    <div className="h-64 overflow-auto">
      <DataTable
        columns={columns}
        data={sampleData}
        stickyHeader
      />
    </div>
  ),
}

export const ClickableRows: Story = {
  render: () => (
    <DataTable
      columns={columns}
      data={sampleData.slice(0, 5)}
      expandable={false}
      onRowClick={(data) => alert(`Clicked: ${data.symbol}`)}
    />
  ),
}
