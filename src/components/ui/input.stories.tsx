import type { Meta, StoryObj } from '@storybook/react'
import { Input, NumericalInput, SearchInput, TokenAmountInput } from './input'
import { useState } from 'react'
import { Search } from 'lucide-react'

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,

}

export default meta
type Story = StoryObj<typeof Input>

export const Default: Story = {
  args: { placeholder: 'Enter text...' },
}

export const Outline: Story = {
  args: { variant: 'outline', placeholder: 'Outline variant' },
}

export const Transparent: Story = {
  args: { variant: 'transparent', placeholder: '0.00' },
}

export const Disabled: Story = {
  args: { placeholder: 'Disabled', disabled: true },
}

export const WithStartAdornment: Story = {
  args: {
    startAdornment: <Search size={16} />,
    placeholder: 'Search...',
  },
}

export const WithEndAdornment: Story = {
  args: {
    endAdornment: <span className="text-sm">ETH</span>,
    placeholder: '0.00',
  },
}

export const WithBothAdornments: Story = {
  args: {
    startAdornment: <span className="text-sm">$</span>,
    endAdornment: <span className="text-sm">USD</span>,
    placeholder: '0.00',
  },
}

export const Numerical: Story = {
  render: () => {
    const NumericalDemo = () => {
      const [value, setValue] = useState('')
      return (
        <NumericalInput
          value={value}
          onChange={setValue}
          placeholder="0.00"
          className="w-64"
        />
      )
    }
    return <NumericalDemo />
  },
}

export const SearchInputStory: Story = {
  name: 'SearchInput',
  render: () => <SearchInput placeholder="Search tokens..." className="w-80" />,
}

export const TokenAmount: Story = {
  render: () => {
    const TokenAmountDemo = () => {
      const [value, setValue] = useState('')
      return (
        <div className="w-80">
          <TokenAmountInput
            value={value}
            onChange={setValue}
            token="ETH"
          />
        </div>
      )
    }
    return <TokenAmountDemo />
  },
}

export const DisabledWithAdornment: Story = {
  args: {
    startAdornment: <Search size={16} />,
    endAdornment: <span className="text-sm">ETH</span>,
    placeholder: 'Disabled',
    disabled: true,
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-3 w-64">
      <Input placeholder="Default" />
      <Input variant="outline" placeholder="Outline" />
      <Input variant="transparent" placeholder="0.00" />
      <Input placeholder="Disabled" disabled />
    </div>
  ),
}
