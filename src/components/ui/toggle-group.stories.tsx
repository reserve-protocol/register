import type { Meta, StoryObj } from '@storybook/react'
import { ToggleGroup, ToggleGroupItem } from './toggle-group'

const meta: Meta<typeof ToggleGroup> = {
  title: 'UI/ToggleGroup',
  component: ToggleGroup,

}

export default meta
type Story = StoryObj<typeof ToggleGroup>

export const SingleSelect: Story = {
  render: () => (
    <ToggleGroup type="single" defaultValue="7d">
      <ToggleGroupItem value="1d">1D</ToggleGroupItem>
      <ToggleGroupItem value="7d">7D</ToggleGroupItem>
      <ToggleGroupItem value="30d">30D</ToggleGroupItem>
      <ToggleGroupItem value="all">All</ToggleGroupItem>
    </ToggleGroup>
  ),
}

export const MultipleSelect: Story = {
  render: () => (
    <ToggleGroup type="multiple" defaultValue={['eth', 'base']}>
      <ToggleGroupItem value="eth">ETH</ToggleGroupItem>
      <ToggleGroupItem value="base">Base</ToggleGroupItem>
      <ToggleGroupItem value="arb">Arbitrum</ToggleGroupItem>
    </ToggleGroup>
  ),
}

export const Outline: Story = {
  render: () => (
    <ToggleGroup type="single" variant="outline" defaultValue="mint">
      <ToggleGroupItem value="mint">Mint</ToggleGroupItem>
      <ToggleGroupItem value="redeem">Redeem</ToggleGroupItem>
    </ToggleGroup>
  ),
}

export const Small: Story = {
  render: () => (
    <ToggleGroup type="single" size="sm" defaultValue="a">
      <ToggleGroupItem value="a">A</ToggleGroupItem>
      <ToggleGroupItem value="b">B</ToggleGroupItem>
      <ToggleGroupItem value="c">C</ToggleGroupItem>
    </ToggleGroup>
  ),
}

export const WithDisabledItem: Story = {
  render: () => (
    <ToggleGroup type="single" defaultValue="eth">
      <ToggleGroupItem value="eth">Ethereum</ToggleGroupItem>
      <ToggleGroupItem value="base">Base</ToggleGroupItem>
      <ToggleGroupItem value="arb" disabled>
        Arbitrum
      </ToggleGroupItem>
    </ToggleGroup>
  ),
}

export const Disabled: Story = {
  render: () => (
    <ToggleGroup type="single" disabled defaultValue="a">
      <ToggleGroupItem value="a">A</ToggleGroupItem>
      <ToggleGroupItem value="b">B</ToggleGroupItem>
      <ToggleGroupItem value="c">C</ToggleGroupItem>
    </ToggleGroup>
  ),
}
