import type { Meta, StoryObj } from '@storybook/react'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from './table'

const meta: Meta<typeof Table> = {
  title: 'UI/Table',
  component: Table,

}

export default meta
type Story = StoryObj<typeof Table>

const data = [
  { token: 'USDC', allocation: '30%', value: '$3,000' },
  { token: 'DAI', allocation: '25%', value: '$2,500' },
  { token: 'USDT', allocation: '20%', value: '$2,000' },
  { token: 'FRAX', allocation: '15%', value: '$1,500' },
  { token: 'sDAI', allocation: '10%', value: '$1,000' },
]

export const Default: Story = {
  render: () => (
    <Table>
      <TableCaption>Basket allocation</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Token</TableHead>
          <TableHead>Allocation</TableHead>
          <TableHead className="text-right">Value</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row) => (
          <TableRow key={row.token}>
            <TableCell className="font-medium">{row.token}</TableCell>
            <TableCell>{row.allocation}</TableCell>
            <TableCell className="text-right">{row.value}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={2}>Total</TableCell>
          <TableCell className="text-right">$10,000</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
}

export const Minimal: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead className="text-right">APY</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>eUSD</TableCell>
          <TableCell className="text-right">3.2%</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>hyUSD</TableCell>
          <TableCell className="text-right">5.1%</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
}
