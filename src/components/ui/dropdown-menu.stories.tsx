import type { Meta, StoryObj } from '@storybook/react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from './dropdown-menu'
import { Button } from './button'
import { useState } from 'react'

const meta: Meta<typeof DropdownMenu> = {
  title: 'UI/DropdownMenu',
  component: DropdownMenu,

}

export default meta
type Story = StoryObj<typeof DropdownMenu>

export const Default: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Open Menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Stake RSR</DropdownMenuItem>
        <DropdownMenuItem>Unstake RSR</DropdownMenuItem>
        <DropdownMenuItem>Delegate</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>View on Explorer</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
}

export const WithCheckbox: Story = {
  render: () => {
    const Demo = () => {
      const [showAll, setShowAll] = useState(false)
      const [showListed, setShowListed] = useState(true)
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Filter</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Visibility</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={showAll}
              onCheckedChange={setShowAll}
            >
              Show All
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={showListed}
              onCheckedChange={setShowListed}
            >
              Listed Only
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
    return <Demo />
  },
}

export const WithSubmenu: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Options</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Overview</DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Network</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>Ethereum</DropdownMenuItem>
            <DropdownMenuItem>Base</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuItem>Settings</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
}

export const WithRadioGroup: Story = {
  render: () => {
    const Demo = () => {
      const [chain, setChain] = useState('ethereum')
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Select Chain</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Network</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={chain} onValueChange={setChain}>
              <DropdownMenuRadioItem value="ethereum">
                Ethereum
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="base">Base</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
    return <Demo />
  },
}

export const WithShortcuts: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Actions</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>
          Mint <DropdownMenuShortcut>⌘M</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          Redeem <DropdownMenuShortcut>⌘R</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>
          Governance <DropdownMenuShortcut>⌘G</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
}

export const WithDisabledItems: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Stake RSR</DropdownMenuItem>
        <DropdownMenuItem>Unstake RSR</DropdownMenuItem>
        <DropdownMenuItem disabled>Claim (nothing to claim)</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
}
