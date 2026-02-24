import type { Meta, StoryObj } from '@storybook/react'
import { Label } from './label'
import { Input } from './input'

const meta: Meta<typeof Label> = {
  title: 'UI/Label',
  component: Label,

}

export default meta
type Story = StoryObj<typeof Label>

export const Default: Story = {
  args: { children: 'Email address' },
}

export const WithInput: Story = {
  render: () => (
    <div className="grid w-64 gap-1.5">
      <Label htmlFor="email">Email</Label>
      <Input id="email" placeholder="Enter your email" />
    </div>
  ),
}
