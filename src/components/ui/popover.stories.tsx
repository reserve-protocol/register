import type { Meta, StoryObj } from '@storybook/react'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { Button } from './button'
import { Input } from './input'
import { Label } from './label'

const meta: Meta<typeof Popover> = {
  title: 'UI/Popover',
  component: Popover,

}

export default meta
type Story = StoryObj<typeof Popover>

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open Popover</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Settings</h4>
            <p className="text-sm text-muted-foreground">
              Configure your preferences.
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="slippage">Slippage (%)</Label>
            <Input id="slippage" defaultValue="0.5" />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
}
