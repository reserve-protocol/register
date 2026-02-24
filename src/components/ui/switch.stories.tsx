import type { Meta, StoryObj } from '@storybook/react'
import { Switch } from './switch'
import { Label } from './label'

const meta: Meta<typeof Switch> = {
  title: 'UI/Switch',
  component: Switch,

}

export default meta
type Story = StoryObj<typeof Switch>

export const Default: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Switch id="dark-mode" />
      <Label htmlFor="dark-mode">Dark mode</Label>
    </div>
  ),
}

export const On: Story = {
  args: { defaultChecked: true },
}

export const Small: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Switch variant="small" id="small-switch" />
      <Label htmlFor="small-switch">Small variant</Label>
    </div>
  ),
}

export const Disabled: Story = {
  args: { disabled: true },
}

export const DisabledOn: Story = {
  args: { disabled: true, defaultChecked: true },
}

export const SmallOn: Story = {
  args: { variant: 'small', defaultChecked: true },
}

export const AllStates: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4">
      <div className="flex items-center space-x-2">
        <Switch />
        <Label>Default off</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch defaultChecked />
        <Label>Default on</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch variant="small" />
        <Label>Small off</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch variant="small" defaultChecked />
        <Label>Small on</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch disabled />
        <Label>Disabled off</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch disabled defaultChecked />
        <Label>Disabled on</Label>
      </div>
    </div>
  ),
}
