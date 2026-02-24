import type { Meta, StoryObj } from '@storybook/react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from './select'

const meta: Meta<typeof Select> = {
  title: 'UI/Select',
  component: Select,

}

export default meta
type Story = StoryObj<typeof Select>

export const Default: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Select network" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ethereum">Ethereum</SelectItem>
        <SelectItem value="base">Base</SelectItem>
        <SelectItem value="arbitrum">Arbitrum</SelectItem>
      </SelectContent>
    </Select>
  ),
}

export const WithGroups: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-56">
        <SelectValue placeholder="Select token" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Stablecoins</SelectLabel>
          <SelectItem value="usdc">USDC</SelectItem>
          <SelectItem value="usdt">USDT</SelectItem>
          <SelectItem value="dai">DAI</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Governance</SelectLabel>
          <SelectItem value="rsr">RSR</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
}

export const Disabled: Story = {
  render: () => (
    <Select disabled>
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Disabled" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="a">Option A</SelectItem>
      </SelectContent>
    </Select>
  ),
}

export const WithDisabledItems: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Choose chain" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ethereum">Ethereum</SelectItem>
        <SelectItem value="base">Base</SelectItem>
        <SelectItem value="arbitrum" disabled>
          Arbitrum (deprecated)
        </SelectItem>
      </SelectContent>
    </Select>
  ),
}

export const WithDefaultValue: Story = {
  render: () => (
    <Select defaultValue="base">
      <SelectTrigger className="w-48">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ethereum">Ethereum</SelectItem>
        <SelectItem value="base">Base</SelectItem>
      </SelectContent>
    </Select>
  ),
}
