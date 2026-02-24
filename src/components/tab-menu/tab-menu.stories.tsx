import type { Meta, StoryObj } from '@storybook/react'
import TabMenu from '.'
import { useState } from 'react'
import { Settings, BarChart3, Wallet } from 'lucide-react'

const meta: Meta<typeof TabMenu> = {
  title: 'Components/TabMenu',
  component: TabMenu,
}

export default meta
type Story = StoryObj<typeof TabMenu>

export const Default: Story = {
  render: () => {
    const Demo = () => {
      const [active, setActive] = useState('7d')
      return (
        <TabMenu
          items={[
            { key: '1d', label: '1D' },
            { key: '7d', label: '7D' },
            { key: '30d', label: '30D' },
            { key: 'all', label: 'All' },
          ]}
          active={active}
          onMenuChange={setActive}
        />
      )
    }
    return <Demo />
  },
}

export const Small: Story = {
  render: () => {
    const Demo = () => {
      const [active, setActive] = useState('mint')
      return (
        <TabMenu
          items={[
            { key: 'mint', label: 'Mint' },
            { key: 'redeem', label: 'Redeem' },
          ]}
          active={active}
          onMenuChange={setActive}
          small
        />
      )
    }
    return <Demo />
  },
}

export const WithIcons: Story = {
  render: () => {
    const Demo = () => {
      const [active, setActive] = useState('overview')
      return (
        <TabMenu
          items={[
            { key: 'overview', label: 'Overview', icon: <BarChart3 size={14} /> },
            { key: 'staking', label: 'Staking', icon: <Wallet size={14} /> },
            { key: 'settings', label: 'Settings', icon: <Settings size={14} /> },
          ]}
          active={active}
          onMenuChange={setActive}
        />
      )
    }
    return <Demo />
  },
}

export const Collapse: Story = {
  render: () => {
    const Demo = () => {
      const [active, setActive] = useState('overview')
      return (
        <TabMenu
          items={[
            { key: 'overview', label: 'Overview', icon: <BarChart3 size={14} /> },
            { key: 'staking', label: 'Staking', icon: <Wallet size={14} /> },
            { key: 'settings', label: 'Settings', icon: <Settings size={14} /> },
          ]}
          active={active}
          onMenuChange={setActive}
          collapse
        />
      )
    }
    return <Demo />
  },
}
