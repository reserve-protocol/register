import type { Meta, StoryObj } from '@storybook/react'
import ChainFilter from '.'
import { useState } from 'react'

const meta: Meta<typeof ChainFilter> = {
  title: 'Components/ChainFilter',
  component: ChainFilter,
}

export default meta
type Story = StoryObj<typeof ChainFilter>

export const Default: Story = {
  render: () => {
    const Demo = () => {
      const [value, setValue] = useState(['8453', '1', '56'])
      return <ChainFilter value={value} onChange={setValue} />
    }
    return <Demo />
  },
}

export const SingleChain: Story = {
  render: () => {
    const Demo = () => {
      const [value, setValue] = useState(['1'])
      return <ChainFilter value={value} onChange={setValue} />
    }
    return <Demo />
  },
}
